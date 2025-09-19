import { NextResponse } from "next/server";
import { env } from "~/env.mjs";

export const runtime = "nodejs";

export async function GET() {
  try {
    // 检查环境变量
    const envCheck = {
      hasCozeToken: !!env.COZE_TOKEN,
      hasCozeWorkflowId: !!env.COZE_WORKFLOW_ID,
      hasCozeApiBaseUrl: !!env.COZE_API_BASE_URL,
      hasCozeSpaceId: !!env.COZE_SPACE_ID,
      cozeApiBaseUrl: env.COZE_API_BASE_URL,
      cozeTokenLength: env.COZE_TOKEN?.length || 0,
      cozeWorkflowId: env.COZE_WORKFLOW_ID,
      cozeSpaceId: env.COZE_SPACE_ID
    };

    // 测试 Coze API 连接 - 使用正确的端点
    let cozeTest = null;
    try {
      // 测试文件上传端点
      const testResponse = await fetch(`${env.COZE_API_BASE_URL}/v1/files`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${env.COZE_TOKEN}`,
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(5000) // 5秒超时
      });
      
      cozeTest = {
        status: testResponse.status,
        ok: testResponse.ok,
        response: testResponse.ok ? "Connection successful" : await testResponse.text()
      };
    } catch (e) {
      cozeTest = {
        error: e instanceof Error ? e.message : String(e)
      };
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      envCheck,
      cozeTest
    });
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
