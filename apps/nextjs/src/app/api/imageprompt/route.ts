import { NextResponse } from "next/server";
import { env } from "~/env.mjs";

export const runtime = "nodejs";
export const maxDuration = 300; // 增加 Vercel 函数超时时间到 5 分钟
export const dynamic = "force-dynamic";

// 简单的内存缓存，避免重复处理相同文件
const fileCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

const COZE_BASE_URL = "https://api.coze.cn";

function withTimeout(ms: number) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), ms);
	return { controller, clear: () => clearTimeout(id) };
}

async function fetchWithRetry(url: string, init: RequestInit, opts?: { attempts?: number; baseDelayMs?: number; timeoutMs?: number }) {
	const attempts = opts?.attempts ?? 1; // 只尝试1次，减少延迟
	const baseDelayMs = opts?.baseDelayMs ?? 500; // 减少基础延迟到0.5秒
	const timeoutMs = opts?.timeoutMs ?? 90_000; // 增加单次超时到90秒

	let lastError: unknown;
	for (let i = 0; i < attempts; i++) {
		const to = withTimeout(timeoutMs);
		try {
			console.log(`🚀 快速请求 ${i + 1}/${attempts} for ${url}`);
			
			// 使用最简化的fetch配置，避免任何可能导致问题的头
			const fetchConfig = {
				...init,
				signal: to.controller.signal,
				headers: {
					'Accept': 'application/json',
					...init.headers,
				},
			};
			
			const resp = await fetch(url, fetchConfig);
			to.clear();
			console.log(`✅ 响应状态: ${resp.status}`);
			
			if (!resp.ok) {
				throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
			}
			
			return resp;
		} catch (e) {
			to.clear();
			lastError = e;
			console.error(`❌ 尝试 ${i + 1} 失败:`, e);
			
			if (i < attempts - 1) {
				const delay = baseDelayMs; // 固定延迟
				console.log(`⏳ ${delay}ms 后重试...`);
				await new Promise((r) => setTimeout(r, delay));
				continue;
			}
		}
	}
	throw lastError;
}

function parsePromptFromRunJson(runJson: any): { prompt: string; debugUrl?: string; executeId?: string } {
  // Coze often returns data as a JSON string with { output: "..." }
  let prompt = runJson?.data?.result?.prompt || runJson?.data?.prompt || runJson?.result?.prompt || runJson?.prompt || runJson?.output;
  const debugUrl: string | undefined = runJson?.debug_url;
  let executeId: string | undefined;
  if (typeof debugUrl === "string") {
    const m = debugUrl.match(/execute_id=([^&]+)/);
    if (m && m[1]) executeId = decodeURIComponent(m[1]);
  }
  
  // 检查 content 字段（Coze 流式响应的格式）
  if (!prompt && runJson?.content) {
    try {
      const contentParsed = JSON.parse(runJson.content);
      if (contentParsed && typeof contentParsed.output === "string") {
        prompt = contentParsed.output;
      }
    } catch {}
  }
  
  // 如果 prompt 是 JSON 字符串，尝试解析
  if (typeof prompt === "string" && prompt.startsWith("{")) {
    try {
      const parsed = JSON.parse(prompt);
      if (parsed && typeof parsed.output === "string") {
        prompt = parsed.output;
      } else if (parsed && typeof parsed.prompt === "string") {
        prompt = parsed.prompt;
      }
    } catch {}
  }
  
  // 如果仍然没有找到 prompt，尝试从其他字段获取
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
  
  // 如果还是没有找到，返回调试信息
  if (!prompt) {
    prompt = `工作流执行完成，但没有返回 prompt 内容。调试信息：${JSON.stringify(runJson, null, 2)}`;
  }
  
  return { prompt, debugUrl, executeId };
}

export async function POST(request: Request) {
	try {
		console.log("=== ImagePrompt API Called ===");
		const contentType = request.headers.get("content-type") || "";
		const contentLength = request.headers.get("content-length");
		console.log("Content-Type:", contentType);
		console.log("Content-Length:", contentLength);
		
		// 检查请求大小限制 (Vercel 限制为 4.5MB)
		if (contentLength && parseInt(contentLength) > 4.5 * 1024 * 1024) {
			console.log("Error: File too large");
			return NextResponse.json({ 
				success: false,
				error: "File too large. Maximum size is 4.5MB",
				timestamp: new Date().toISOString()
			}, { status: 413 });
		}
		
		if (!contentType.includes("multipart/form-data")) {
			console.log("Error: Expected multipart/form-data");
			return NextResponse.json({ 
				success: false,
				error: "Expected multipart/form-data",
				timestamp: new Date().toISOString()
			}, { status: 400 });
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

		// 检查缓存
		const fileKey = `${file.name}-${file.size}-${promptType}-${language}`;
		console.log("🔍 检查缓存，文件键:", fileKey);
		console.log("📊 当前缓存大小:", fileCache.size);
		const cached = fileCache.get(fileKey);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			console.log("🚀 使用缓存结果，快速返回！");
			return NextResponse.json({
				...cached.result,
				metadata: {
					...cached.result.metadata,
					cached: true,
					timestamp: new Date().toISOString()
				}
			});
		} else {
			console.log("❌ 缓存未命中，需要重新处理");
		}

		// 1) 上传文件到Coze
		console.log("Starting file upload to Coze...");
		const uploadForm = new FormData();
		uploadForm.append("file", file, file.name);
		uploadForm.append("purpose", "file-extract");
		
		// 添加进度提示
		console.log("📤 正在上传图片到 Coze...");

		let uploadResp: Response;
		try {
        const uploadUrl = `${COZE_BASE_URL}/v1/files/upload`;
			console.log("Upload URL:", uploadUrl);
			
			uploadResp = await fetchWithRetry(uploadUrl, {
				method: "POST",
				headers: { 
					Authorization: `Bearer ${env.COZE_TOKEN}`,
					"Accept": "application/json",
				},
				body: uploadForm,
			}, { attempts: 1, baseDelayMs: 500, timeoutMs: 90_000 });
			
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

		// 检查响应内容类型
		const uploadContentType = uploadResp.headers.get("content-type") || "";
		console.log("Upload response content-type:", uploadContentType);
		
		let uploadJson: any = {};
		try {
			if (uploadContentType.includes("application/json")) {
				uploadJson = await uploadResp.json();
				console.log("Upload response:", uploadJson);
			} else {
				const text = await uploadResp.text();
				console.error("Upload response is not JSON:", text.substring(0, 500));
				return NextResponse.json({ error: "upload_response_not_json", content_type: uploadContentType, details: text.substring(0, 500) }, { status: 502 });
			}
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
		console.log("✅ 图片上传成功！");

		// 2) 运行工作流
		console.log("Starting workflow execution...");
		console.log("🤖 正在生成 AI 提示词，请稍候...");
		const parameters: Record<string, unknown> = {
			[inputKey]: { file_id: String(fileId) },
			promptType: promptType,
			useQuery: useQuery,
			language: language,
		};

		const payload = {
			workflow_id: String(env.COZE_WORKFLOW_ID),
			parameters: parameters,
		};

		console.log("Workflow payload:", payload);

		let runResp: Response;
		try {
			// 使用正确的 Coze API 端点
        const workflowUrl = `${COZE_BASE_URL}/v1/workflow/stream_run`;
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
			}, { attempts: 1, baseDelayMs: 500, timeoutMs: 90_000 });
			
			console.log("Workflow response status:", runResp.status);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			console.error("Workflow execution failed:", message);
			
			// 检查是否是超时错误
			if (message.includes("aborted") || message.includes("timeout")) {
				return NextResponse.json({ 
					error: "workflow_timeout", 
					stage: "execution", 
					message: "工作流执行超时，请稍后重试",
					details: message 
				}, { status: 504 });
			}
			
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
		
		// 处理流式响应 (Server-Sent Events)
		if (text.includes('event: Error') || text.includes('event: Done')) {
			// 解析 SSE 格式的响应
			const lines = text.split('\n');
			let errorData = null;
			let doneData = null;
			let resultData = null;
			
			for (let i = 0; i < lines.length; i++) {
				if (lines[i]?.startsWith('data: ')) {
					const data = lines[i]!.substring(6);
					try {
						const parsed = JSON.parse(data);
						const prevLine = lines[i-1];
						if (prevLine === 'event: Error') {
							errorData = parsed;
						} else if (prevLine === 'event: Done') {
							doneData = parsed;
						} else if (prevLine === 'event: Result' || prevLine === 'event: Message') {
							resultData = parsed;
						}
					} catch (e) {
						// 忽略解析错误
					}
				}
			}
			
			if (errorData) {
				return NextResponse.json({ 
					error: "workflow_execution_failed", 
					details: errorData.error_message || errorData.msg,
					error_code: errorData.error_code,
					debug_url: errorData.debug_url,
					uploadJson 
				}, { status: 502 });
			}
			
			// 优先使用结果数据，然后是完成数据
			runJson = resultData || doneData || { status: "completed" };
		} else {
			// 尝试解析普通 JSON 响应
			try { 
				runJson = JSON.parse(text); 
			} catch {
				return NextResponse.json({ error: "workflow_json_parse_failed", details: text, uploadJson }, { status: 502 });
			}
		}

		// 处理工作流响应

		// 同步工作流处理
		const { prompt, debugUrl, executeId } = parsePromptFromRunJson(runJson);
		if (!prompt) {
			console.error("No prompt in response:", runJson);
			return NextResponse.json({ error: "No prompt generated", raw: runJson }, { status: 502 });
		}

		// 标准化响应格式
		const response = {
			success: true,
			prompt,
			metadata: {
				executeId,
				debugUrl,
				promptType,
				language,
				fileId,
				timestamp: new Date().toISOString()
			},
			debug: { 
				uploadJson, 
				runJson, 
				debug_url: debugUrl, 
				execute_id: executeId,
				sent_parameters: payload
			} 
		};

		// 缓存结果
		fileCache.set(fileKey, {
			result: response,
			timestamp: Date.now()
		});
		console.log("💾 结果已缓存，文件键:", fileKey);
		console.log("📊 缓存大小:", fileCache.size);

		console.log("Success response:", { 
			success: response.success, 
			promptLength: prompt.length,
			executeId: response.metadata.executeId 
		});
		console.log("✅ AI 提示词生成完成！");

		return NextResponse.json(response);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.error("ImagePrompt API error:", error);
		
		const errorResponse = {
			success: false,
			error: message,
			timestamp: new Date().toISOString(),
			...(error instanceof Error && { stack: error.stack })
		};
		
		return NextResponse.json(errorResponse, { status: 500 });
	}
}
