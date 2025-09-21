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

		// 查询工作流执行状态 - 使用正确的端点
        const statusUrl = `${COZE_BASE_URL}/v1/workflows/run/${executeId}`;
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
					success: true,
					status: "completed",
					prompt,
					metadata: {
						executeId,
						debugUrl: statusJson?.debug_url,
						timestamp: new Date().toISOString()
					}
				});
			} else {
				return NextResponse.json({
					success: false,
					status: "completed",
					error: "No prompt in result",
					metadata: {
						executeId,
						timestamp: new Date().toISOString()
					},
					debug: statusJson
				});
			}
		} else if (isFailed) {
			return NextResponse.json({
				success: false,
				status: "failed",
				error: "Workflow execution failed",
				metadata: {
					executeId,
					timestamp: new Date().toISOString()
				},
				details: statusJson?.data?.error || statusJson?.error
			});
		} else {
			// 仍在处理中
			return NextResponse.json({
				success: true,
				status: "processing",
				metadata: {
					executeId,
					timestamp: new Date().toISOString()
				},
				message: "Workflow is still running"
			});
		}

	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.error("Status check error:", error);
		
		const errorResponse = {
			success: false,
			error: message,
			timestamp: new Date().toISOString(),
			...(error instanceof Error && { stack: error.stack })
		};
		
		return NextResponse.json(errorResponse, { status: 500 });
	}
}
