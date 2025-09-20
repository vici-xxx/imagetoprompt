import { NextResponse } from "next/server";
import { env } from "~/env.mjs";

export const runtime = "nodejs";

const COZE_BASE_URL = "https://api.coze.cn";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const executeId = searchParams.get("executeId");
		
		if (!executeId) {
			return NextResponse.json({ error: "executeId is required" }, { status: 400 });
		}

		console.log("Checking status for executeId:", executeId);

		// 查询工作流执行状态
		const statusUrl = `${COZE_BASE_URL}/api/workflow/${executeId}/status`;
		console.log("Status URL:", statusUrl);
		
		const statusResp = await fetch(statusUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${env.COZE_TOKEN}`,
				"Content-Type": "application/json",
			},
		});

		if (!statusResp.ok) {
			const text = await statusResp.text();
			console.error("Status check failed:", text);
			return NextResponse.json({ error: "status_check_failed", details: text }, { status: 502 });
		}

		const statusJson = await statusResp.json();
		console.log("Status response:", statusJson);

		// 检查工作流是否完成
		const isCompleted = statusJson?.data?.status === "completed" || statusJson?.status === "completed";
		const isFailed = statusJson?.data?.status === "failed" || statusJson?.status === "failed";

		if (isCompleted) {
			// 工作流完成，提取结果
			const result = statusJson?.data?.result || statusJson?.result;
			const prompt = result?.prompt || result?.output;
			
			if (prompt) {
				return NextResponse.json({
					status: "completed",
					prompt,
					executeId,
					debugUrl: statusJson?.debug_url
				});
			} else {
				return NextResponse.json({
					status: "completed",
					error: "No prompt in result",
					raw: statusJson
				});
			}
		} else if (isFailed) {
			return NextResponse.json({
				status: "failed",
				error: "Workflow execution failed",
				details: statusJson?.data?.error || statusJson?.error
			});
		} else {
			// 仍在处理中
			return NextResponse.json({
				status: "processing",
				executeId,
				message: "Workflow is still running"
			});
		}

	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.error("Status check error:", message);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
