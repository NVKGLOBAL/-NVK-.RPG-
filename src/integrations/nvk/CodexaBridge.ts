import type {
  CodexaInferenceRequest,
  CodexaInferenceResponse,
  CodexaExecutionReceipt,
} from '../../../lib/nvk/contracts';
import {
  invokeAdapterText,
  invokeAdapterImage,
  invokeAdapterEmbedding,
  invokeAdapterSpeech,
  resolveAdapterModelId,
} from '../../../lib/ai/providerAdapter';

export interface CodexaCapabilityReport {
  supportsText: boolean;
  supportsStreaming: boolean;
  supportsImage: boolean;
  supportsEmbedding: boolean;
  supportsSpeech: boolean;
  supportsTools: boolean;
  activeProvider: string;
  activeModel: string;
  isOfflineFallback: boolean;
}

export class CodexaBridge {
  private static instance: CodexaBridge;

  private constructor() {}

  public static getInstance(): CodexaBridge {
    if (!CodexaBridge.instance) {
      CodexaBridge.instance = new CodexaBridge();
    }
    return CodexaBridge.instance;
  }

  private getRuntimeConfig() {
    if (typeof window === 'undefined') {
      return { selectedModel: 'nvk-local-neural', customModel: '', ollamaUrl: 'http://localhost:11434' };
    }
    return {
      selectedModel: localStorage.getItem('selected_ai_model') || 'nvk-local-neural',
      customModel: localStorage.getItem('custom_ai_model') || '',
      ollamaUrl: localStorage.getItem('ollama_base_url') || 'http://localhost:11434',
    };
  }

  public getCapabilityReport(): CodexaCapabilityReport {
    const { selectedModel, customModel } = this.getRuntimeConfig();
    const resolved = resolveAdapterModelId(selectedModel, customModel);
    const isLocal = resolved === 'nvk-local-neural';

    return {
      supportsText: true,
      supportsStreaming: true,
      supportsImage: true,
      supportsEmbedding: true,
      supportsSpeech: true,
      supportsTools: true,
      activeProvider: isLocal ? 'local-procedural' : resolved.includes('ollama') ? 'ollama' : 'pollinations',
      activeModel: resolved,
      isOfflineFallback: isLocal,
    };
  }

  public async infer(req: CodexaInferenceRequest): Promise<CodexaInferenceResponse> {
    const { selectedModel, customModel, ollamaUrl } = this.getRuntimeConfig();
    const modelId = req.preferredModelId || resolveAdapterModelId(selectedModel, customModel);

    const startTime = Date.now();

    if (req.capability === 'image') {
      const url = await invokeAdapterImage({ prompt: req.prompt });
      const receipt: CodexaExecutionReceipt = {
        requestId: req.requestId,
        providerUsed: 'pollinations-flux',
        modelUsed: modelId,
        fallbackUsed: false,
        offline: false,
        timestamp: Date.now(),
      };
      return { receipt, outputUrl: url };
    }

    if (req.capability === 'embedding') {
      const vec = await invokeAdapterEmbedding(req.prompt);
      const receipt: CodexaExecutionReceipt = {
        requestId: req.requestId,
        providerUsed: 'local-vector',
        modelUsed: 'local-vector-embedding',
        fallbackUsed: false,
        offline: true,
        timestamp: Date.now(),
      };
      return { receipt, embedding: vec };
    }

    if (req.capability === 'speech') {
      await invokeAdapterSpeech(req.prompt);
      const receipt: CodexaExecutionReceipt = {
        requestId: req.requestId,
        providerUsed: 'webspeech-procedural',
        modelUsed: 'nvk-audio-synth',
        fallbackUsed: true,
        offline: true,
        timestamp: Date.now(),
      };
      return { receipt, outputText: 'Speech synthesized.' };
    }

    // Text / Workflow Capability
    const textResult = await invokeAdapterText({
      prompt: req.prompt,
      systemInstruction: req.systemInstruction,
      responseMimeType: req.responseFormat,
      modelId,
      ollamaBaseUrl: ollamaUrl,
    });

    const receipt: CodexaExecutionReceipt = {
      requestId: req.requestId,
      providerUsed: textResult.providerUsed,
      modelUsed: textResult.modelUsed,
      fallbackUsed: textResult.fallbackUsed,
      offline: textResult.providerUsed === 'local-procedural',
      timestamp: Date.now(),
    };

    return {
      receipt,
      outputText: textResult.text,
    };
  }

  public async *inferStream(req: CodexaInferenceRequest): AsyncGenerator<string, void, unknown> {
    const { selectedModel, customModel } = this.getRuntimeConfig();
    const modelId = req.preferredModelId || resolveAdapterModelId(selectedModel, customModel);

    // Stream the local/adapter result in chunks for all providers
    const res = await this.infer(req);
    const text = res.outputText || '';
    const chunkSize = 16;
    for (let i = 0; i < text.length; i += chunkSize) {
      yield text.slice(i, i + chunkSize);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
}

export const codexaBridge = CodexaBridge.getInstance();
