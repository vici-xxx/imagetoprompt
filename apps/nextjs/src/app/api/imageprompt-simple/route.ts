import { NextResponse } from "next/server";
import { env } from "~/env.mjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    console.log("=== Simple ImagePrompt API Called ===");
    
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
    
    console.log("Environment check:", envCheck);
    
    // 检查请求内容
    const contentType = request.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);
    
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ 
        error: "Expected multipart/form-data",
        received: contentType 
      }, { status: 400 });
    }
    
    const form = await request.formData();
    const file = form.get("file");
    
    console.log("File received:", file ? "Yes" : "No");
    if (file instanceof File) {
      console.log("File details:", {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
    
    // 测试 Coze API 连接
    try {
      console.log("Testing Coze API connection...");
      const testUrl = `${env.COZE_API_BASE_URL}/v1/files`;
      console.log("Test URL:", testUrl);
      
      const testResponse = await fetch(testUrl, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${env.COZE_TOKEN}`,
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(10000) // 10秒超时
      });
      
      console.log("Coze API test response status:", testResponse.status);
      const testText = await testResponse.text();
      console.log("Coze API test response:", testText.substring(0, 200));
      
      return NextResponse.json({
        message: "Simple API test successful",
        envCheck,
        fileReceived: !!file,
        fileDetails: file instanceof File ? {
          name: file.name,
          size: file.size,
          type: file.type
        } : null,
        cozeApiTest: {
          status: testResponse.status,
          response: testText.substring(0, 200)
        }
      });
      
    } catch (cozeError) {
      console.error("Coze API test failed:", cozeError);
      return NextResponse.json({
        message: "Simple API test with Coze error",
        envCheck,
        fileReceived: !!file,
        cozeError: cozeError instanceof Error ? cozeError.message : String(cozeError)
      });
    }
    
  } catch (error) {
    console.error("Simple API error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
