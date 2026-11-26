import { GoogleGenAI } from '@google/genai';
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
      return { selectedModel: 'pollinations-openai', customModel: '', apiKey: null, ollamaUrl: 'http://localhost:11434' };
    }
    return {
      selectedModel: localStorage.getItem('selected_ai_model') || 'pollinations-openai',
      customModel: localStorage.getItem('custom_ai_model') || '',
      apiKey: localStorage.getItem('custom_ai_api_key') || null,
      ollamaUrl: localStorage.getItem('ollama_base_url') || 'http://localhost:11434',
    };
  }

  public getCapabilityReport(): CodexaCapabilityReport {
    const { selectedModel, customModel, apiKey } = this.getRuntimeConfig();
    const resolved = resolveAdapterModelId(selectedModel, customModel);
    const isGemini = resolved.startsWith('gemini-') || resolved.startsWith('imagen-');
    const isLocal = resolved === 'nvk-local-neural';

    return {
      supportsText: true,
      supportsStreaming: true,
      supportsImage: true,
      supportsEmbedding: true,
      supportsSpeech: true,
      supportsTools: true,
      activeProvider: isGemini && apiKey ? 'gemini' : isLocal ? 'local-procedural' : resolved.includes('ollama') ? 'ollama' : 'pollinations',
      activeModel: resolved,
      isOfflineFallback: isLocal,
    };
  }

  public async infer(req: CodexaInferenceRequest): Promise<CodexaInferenceResponse> {
    const { selectedModel, customModel, apiKey, ollamaUrl } = this.getRuntimeConfig();
    const modelId = req.preferredModelId || resolveAdapterModelId(selectedModel, customModel);

    const startTime = Date.now();

    if (req.capability === 'image') {
      const url = await invokeAdapterImage({ prompt: req.prompt, model: modelId, apiKey });
      const receipt: CodexaExecutionReceipt = {
        requestId: req.requestId,
        providerUsed: apiKey ? 'gemini-imagen' : 'pollinations-flux',
        modelUsed: modelId,
        fallbackUsed: !apiKey,
        offline: false,
        timestamp: Date.now(),
      };
      return { receipt, outputUrl: url };
    }

    if (req.capability === 'embedding') {
      const vec = await invokeAdapterEmbedding(req.prompt, apiKey);
      const receipt: CodexaExecutionReceipt = {
        requestId: req.requestId,
        providerUsed: apiKey ? 'gemini-embedding' : 'local-vector',
        modelUsed: 'gemini-embedding-001',
        fallbackUsed: !apiKey,
        offline: !apiKey,
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
      apiKey,
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
    const { selectedModel, customModel, apiKey } = this.getRuntimeConfig();
    const modelId = req.preferredModelId || resolveAdapterModelId(selectedModel, customModel);

    // If using real Gemini SDK on server or client with key, stream via @google/genai
    if (apiKey && (modelId.startsWith('gemini-') || modelId.startsWith('imagen-'))) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
        const responseStream = await ai.models.generateContentStream({
          model: modelId,
          contents: req.prompt,
          config: {
            ...(req.systemInstruction && { systemInstruction: req.systemInstruction }),
            ...(req.responseFormat && { responseMimeType: req.responseFormat }),
          },
        });
        for await (const chunk of responseStream) {
          if (chunk.text) {
            yield chunk.text;
          }
        }
        return;
      } catch (err) {
        console.warn('CodexaBridge: Gemini stream fallback to text invoke:', err);
      }
    }

    // Fallback streaming simulation chunking for non-Gemini providers
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
