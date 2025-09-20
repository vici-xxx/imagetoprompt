import { NextResponse } from "next/server";
import { env } from "~/env.mjs";

export const runtime = "nodejs";

const COZE_BASE_URL = env.COZE_API_BASE_URL || "https://api.coze.com";

function withTimeout(ms: number) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), ms);
	return { controller, clear: () => clearTimeout(id) };
}

async function fetchWithRetry(url: string, init: RequestInit, opts?: { attempts?: number; baseDelayMs?: number; timeoutMs?: number }) {
	const attempts = opts?.attempts ?? 2; // 减少重试次数
	const baseDelayMs = opts?.baseDelayMs ?? 1000;
	const timeoutMs = opts?.timeoutMs ?? 30_000; // 减少超时时间

	let lastError: unknown;
	for (let i = 0; i < attempts; i++) {
		const to = withTimeout(timeoutMs);
		try {
			console.log(`Attempt ${i + 1}/${attempts} for ${url}`);
			const resp = await fetch(url, { ...init, signal: to.controller.signal });
			to.clear();
			console.log(`Response status: ${resp.status}`);
			return resp;
		} catch (e) {
			to.clear();
			lastError = e;
			console.error(`Attempt ${i + 1} failed:`, e);
			if (i < attempts - 1) {
				const delay = baseDelayMs * Math.pow(2, i);
				console.log(`Retrying in ${delay}ms...`);
				await new Promise((r) => setTimeout(r, delay));
				continue;
			}
		}
	}
	throw lastError;
}

function parsePromptFromRunJson(runJson: any): { prompt: string; debugUrl?: string; executeId?: string } {
	// Coze often returns data as a JSON string with { output: "..." }
	let prompt = runJson?.data?.result?.prompt || runJson?.data?.prompt || runJson?.result?.prompt || runJson?.prompt;
	const debugUrl: string | undefined = runJson?.debug_url;
	let executeId: string | undefined;
	if (typeof debugUrl === "string") {
		const m = debugUrl.match(/execute_id=([^&]+)/);
		if (m) executeId = decodeURIComponent(m[1]);
	}
	if (!prompt) {
		const dataField = runJson?.data;
		if (typeof dataField === "string") {
			try {
				const parsed = JSON.parse(dataField);
				if (parsed && typeof parsed.output === "string") {
					prompt = parsed.output;
				}
			} catch {}
		}
	}
	if (!prompt) {
		prompt = JSON.stringify(runJson);
	}
	return { prompt, debugUrl, executeId };
}

export async function POST(request: Request) {
	try {
		console.log("=== ImagePrompt API Called ===");
		const contentType = request.headers.get("content-type") || "";
		console.log("Content-Type:", contentType);
		
		if (!contentType.includes("multipart/form-data")) {
			console.log("Error: Expected multipart/form-data");
			return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
		}

		const form = await request.formData();
		const file = form.get("file");
		const promptType = (form.get("promptType") as string) || "flux";
		const useQuery = (form.get("useQuery") as string) || "";
		const inputKey = (form.get("input_key") as string) || "img";
		const language = (form.get("language") as string) || "en";

		console.log("Form data:", { promptType, useQuery, inputKey, language });
		console.log("File received:", file ? "Yes" : "No");

		if (!(file instanceof File)) {
			console.log("Error: Missing file");
			return NextResponse.json({ error: "Missing file" }, { status: 400 });
		}

		console.log("File details:", { name: file.name, size: file.size, type: file.type });
		console.log("Environment check:", {
			hasCozeToken: !!env.COZE_TOKEN,
			hasCozeWorkflowId: !!env.COZE_WORKFLOW_ID,
			hasCozeApiBaseUrl: !!env.COZE_API_BASE_URL,
			hasCozeSpaceId: !!env.COZE_SPACE_ID,
			cozeApiBaseUrl: env.COZE_API_BASE_URL
		});

		// 1) 上传文件
		console.log("Starting file upload to Coze...");
		const uploadForm = new FormData();
		uploadForm.append("file", file, file.name);

		let uploadResp: Response;
		try {
			const uploadUrl = `${COZE_BASE_URL}/v1/files/upload`;
			console.log("Upload URL:", uploadUrl);
			
			uploadResp = await fetchWithRetry(uploadUrl, {
				method: "POST",
				headers: { Authorization: `Bearer ${env.COZE_TOKEN}` },
				body: uploadForm,
			}, { attempts: 1, baseDelayMs: 1000, timeoutMs: 20_000 }); // 减少超时时间
			
			console.log("Upload response status:", uploadResp.status);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			console.error("Upload failed:", message);
			return NextResponse.json({ error: "upload_failed", stage: "upload", message }, { status: 502 });
		}

		if (!uploadResp.ok) {
			const text = await uploadResp.text();
			console.error("Upload not ok:", text);
			return NextResponse.json({ error: "upload_failed", status: uploadResp.status, details: text }, { status: 502 });
		}

		let uploadJson: any = {};
		try {
			uploadJson = await uploadResp.json();
			console.log("Upload response:", uploadJson);
		} catch (e) {
			console.error("Failed to parse upload response:", e);
			return NextResponse.json({ error: "upload_parse_failed" }, { status: 502 });
		}

		const fileId: string | undefined = uploadJson?.data?.id || uploadJson?.id;
		if (!fileId) {
			console.error("No file ID in response:", uploadJson);
			return NextResponse.json({ error: "Upload response missing file id", raw: uploadJson }, { status: 502 });
		}

		console.log("File ID:", fileId);

		// 2) 运行工作流
		console.log("Starting workflow execution...");
		const parameters: Record<string, unknown> = {
			[inputKey]: { file_id: String(fileId) },
			promptType,
			useQuery,
			language,
		};

		const payload = {
			workflow_id: String(env.COZE_WORKFLOW_ID),
			space_id: String(env.COZE_SPACE_ID),
			is_async: false,
			parameters,
		};

		console.log("Workflow payload:", payload);

		let runResp: Response;
		try {
			// 使用正确的 Coze API 端点
			const workflowUrl = `${COZE_BASE_URL}/v1/workflow/run`;
			console.log("Workflow URL:", workflowUrl);
			console.log("Workflow payload:", JSON.stringify(payload, null, 2));
			
			runResp = await fetchWithRetry(workflowUrl, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${env.COZE_TOKEN}`,
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify(payload),
			}, { attempts: 1, baseDelayMs: 1000, timeoutMs: 25_000 }); // 减少超时时间
			
			console.log("Workflow response status:", runResp.status);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			console.error("Workflow execution failed:", message);
			return NextResponse.json({ error: "workflow_failed", stage: "execution", message }, { status: 502 });
		}

		if (!runResp.ok) {
			const text = await runResp.text();
			console.error("Workflow not ok:", text);
			let runJson: any = {};
			try { runJson = JSON.parse(text); } catch {}
			return NextResponse.json({ error: "workflow_failed", status: runResp.status, details: text, coze_response: runJson }, { status: 502 });
		}

		const text = await runResp.text();
		let runJson: any;
		try { runJson = JSON.parse(text); } catch {
			return NextResponse.json({ error: "workflow_json_parse_failed", details: text, uploadJson }, { status: 502 });
		}

		const { prompt, debugUrl, executeId } = parsePromptFromRunJson(runJson);
		return NextResponse.json({ 
			prompt, 
			debug: { 
				uploadJson, 
				runJson, 
				debug_url: debugUrl, 
				execute_id: executeId,
				sent_parameters: payload
			} 
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
