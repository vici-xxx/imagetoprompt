/**
 * TypeScript interfaces for ImagePrompt API responses
 */

export interface ImagePromptSuccessResponse {
  success: true;
  prompt: string;
  metadata: {
    executeId?: string;
    debugUrl?: string;
    promptType: string;
    language: string;
    fileId: string;
    timestamp: string;
  };
  debug: {
    uploadJson: any;
    runJson: any;
    debug_url?: string;
    execute_id?: string;
    sent_parameters: any;
  };
}

export interface ImagePromptErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  stack?: string;
  details?: any;
  stage?: string;
  message?: string;
}

export type ImagePromptResponse = ImagePromptSuccessResponse | ImagePromptErrorResponse;

export interface ImagePromptStatusSuccessResponse {
  success: true;
  status: "completed" | "processing";
  prompt?: string;
  metadata: {
    executeId: string;
    debugUrl?: string;
    timestamp: string;
  };
  message?: string;
}

export interface ImagePromptStatusErrorResponse {
  success: false;
  status: "failed" | "completed";
  error: string;
  metadata: {
    executeId: string;
    timestamp: string;
  };
  details?: any;
  debug?: any;
}

export type ImagePromptStatusResponse = ImagePromptStatusSuccessResponse | ImagePromptStatusErrorResponse;
