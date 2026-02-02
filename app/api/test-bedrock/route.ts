import { bedrockService } from "@/lib/bedrock";
import { safeBedrockService } from "@/lib/bedrock-safe";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    // Use safe service for testing
    const status = await safeBedrockService.testConnection();
    
    return Response.json({ 
      success: status.success, 
      message: status.success ? "AWS Bedrock is working!" : "Bedrock unavailable, using fallbacks", 
      error: status.error,
      ui_status: "operational",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Bedrock test error:", error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      ui_status: "operational",
      message: "Running with fallback responses",
      timestamp: new Date().toISOString()
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, maxTokens = 100 } = await request.json();
    
    if (!prompt) {
      return Response.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // Try safe service first, fallback to original if needed
    const response = await safeBedrockService.generateResponse(prompt, {
      type: "test",
      role: "Test Role",
      level: "Test Level", 
      techstack: ["Test Tech"]
    });
    
    return Response.json({ 
      success: true, 
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Bedrock API error:", error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}