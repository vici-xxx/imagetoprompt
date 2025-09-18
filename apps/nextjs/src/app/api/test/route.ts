import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "API is working", 
    timestamp: new Date().toISOString(),
    env: {
      hasCozeToken: !!process.env.COZE_TOKEN,
      hasCozeWorkflowId: !!process.env.COZE_WORKFLOW_ID,
      hasCozeApiBaseUrl: !!process.env.COZE_API_BASE_URL,
      hasCozeSpaceId: !!process.env.COZE_SPACE_ID,
    }
  });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);
    
    if (contentType.includes("multipart/form-data")) {
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
      
      return NextResponse.json({ 
        message: "File upload test successful",
        fileReceived: !!file,
        fileDetails: file instanceof File ? {
          name: file.name,
          size: file.size,
          type: file.type
        } : null
      });
    }
    
    return NextResponse.json({ 
      message: "POST request received",
      contentType 
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
