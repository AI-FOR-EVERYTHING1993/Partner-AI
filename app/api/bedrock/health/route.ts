import { safeBedrockService } from "@/lib/bedrock-safe";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const status = await safeBedrockService.testConnection();
    const serviceStatus = safeBedrockService.getStatus();
    
    return Response.json({
      bedrock: {
        ...status,
        ...serviceStatus
      },
      ui: {
        status: "operational",
        message: status.success 
          ? "All systems operational" 
          : "Running with fallback responses"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      bedrock: {
        success: false,
        available: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      ui: {
        status: "operational",
        message: "Running with fallback responses"
      },
      timestamp: new Date().toISOString()
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, context } = await request.json();
    
    if (!prompt) {
      return Response.json({ 
        success: false, 
        error: "Prompt is required" 
      }, { status: 400 });
    }

    const response = await safeBedrockService.generateResponse(prompt, context);
    const status = safeBedrockService.getStatus();
    
    return Response.json({
      success: true,
      response,
      bedrock_available: status.available,
      fallback_used: !status.available,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}