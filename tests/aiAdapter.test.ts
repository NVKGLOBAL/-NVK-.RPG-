import 'fake-indexeddb/auto';
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  resolveAdapterModelId,
  invokeAdapterText,
  generateProceduralSvgArtwork,
} from '../lib/ai/providerAdapter';
import { SovereignKernel } from '../lib/SovereignKernel';

describe('NVK Replaceable AI Adapter & SovereignKernel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps legacy gemini/imagen model ids to the local sovereign engine (no Gemini)', () => {
    expect(resolveAdapterModelId('nvk-local-neural', '', 'gemini-3-pro-preview')).toBe('nvk-local-neural');
    expect(resolveAdapterModelId('nvk-local-neural', '', 'gemini-3.1-pro-preview')).toBe('nvk-local-neural');
    expect(resolveAdapterModelId('nvk-local-neural', '', 'gemini-2.5-flash-image')).toBe('nvk-local-neural');
    expect(resolveAdapterModelId('nvk-local-neural', '', 'imagen-4.0-generate-001')).toBe('nvk-local-neural');
    expect(resolveAdapterModelId('pollinations-openai', '')).toBe('pollinations-openai');
    expect(resolveAdapterModelId('gemini-2.5-flash', '')).toBe('nvk-local-neural');
  });

  it('executes deterministic procedural reasoning offline with nvk-local-neural', async () => {
    const result = await invokeAdapterText({
      prompt: 'Analyze system entropy and stability',
      modelId: 'nvk-local-neural',
    });

    expect(result.providerUsed).toBe('local-procedural');
    expect(result.modelUsed).toBe('nvk-local-neural');
    expect(result.fallbackUsed).toBe(false);
    expect(result.text.length).toBeGreaterThan(10);
  });

  it('routes Ollama node requests directly to localhost /api/chat', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          message: { content: 'Ollama resonance telemetry verified.' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const result = await invokeAdapterText({
      prompt: 'Ping local model',
      systemInstruction: 'System context',
      modelId: 'ollama-local',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/chat');
    expect(result.providerUsed).toBe('ollama');
    expect(result.text).toBe('Ollama resonance telemetry verified.');
  });

  it('generates self-contained inline SVG artwork with no external Unsplash dependency', () => {
    const artwork = generateProceduralSvgArtwork('Azure Gatewalker Portrait');
    expect(artwork.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(artwork).not.toContain('unsplash.com');
  });

  it('SovereignKernel runs researchGoal, generatePlan, mergeArtifacts, and provisionVM offline', async () => {
    localStorage.setItem('selected_ai_model', 'nvk-local-neural');
    const kernel = new SovereignKernel();

    const research = await kernel.researchGoal('Local knowledge graph indexing');
    expect(research.summary.length).toBeGreaterThan(5);
    expect(research.thinking.length).toBeGreaterThan(0);

    const plan = await kernel.generatePlan('Build offline sync', research.summary);
    expect(plan.steps.length).toBeGreaterThan(0);

    const fusion = await kernel.mergeArtifacts([
      { path: 'a.md', content: 'Alpha axioms', lastModified: Date.now(), type: 'text' },
      { path: 'b.md', content: 'Beta cards', lastModified: Date.now(), type: 'text' },
    ]);
    expect(fusion.name.length).toBeGreaterThan(0);
    expect(fusion.content.length).toBeGreaterThan(0);

    const wsId = await kernel.provisionVM('Offline Verification Workspace');
    const project = await kernel.getProject(wsId);
    expect(project).not.toBeNull();
    expect(project?.description).toBe('Local IndexedDB Virtual Workspace');
  });
});
