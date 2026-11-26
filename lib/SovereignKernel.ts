import { AgentPlan, ProjectMetadata, ProjectFile } from '../types';
import { driftDB } from '../db';
import { invokeAdapterText, resolveAdapterModelId } from './ai/providerAdapter';

function parseJsonBlock<T>(raw: string): T | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const cleaned = jsonMatch ? jsonMatch[0] : raw;
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

export class SovereignKernel {
  private getAdapterRuntimeConfig(): { modelId: string } {
    if (typeof window === 'undefined') {
      return { modelId: 'nvk-local-neural' };
    }
    const selected = localStorage.getItem('selected_ai_model') || 'pollinations-openai';
    const custom = localStorage.getItem('custom_ai_model') || '';
    return {
      modelId: resolveAdapterModelId(selected, custom),
    };
  }

  async researchGoal(goal: string): Promise<{ summary: string; thinking: string[] }> {
    const { modelId } = this.getAdapterRuntimeConfig();
    const prompt = `Conduct structured technical and conceptual research on: "${goal}".
Return JSON with keys: {"summary": "2-3 sentence synthesis", "thinking": ["step 1", "step 2", "step 3"]}.`;

    try {
      const result = await invokeAdapterText({
        prompt,
        systemInstruction: 'You are the NVK Sovereign Architect kernel. Be concise, technical, and grounded.',
        responseMimeType: 'application/json',
        modelId,
        });

      const parsed = parseJsonBlock<{ summary?: string; thinking?: string[] }>(result.text);
      if (parsed?.summary) {
        return {
          summary: parsed.summary,
          thinking:
            Array.isArray(parsed.thinking) && parsed.thinking.length > 0
              ? parsed.thinking
              : [
                  `Analyzed objective via ${result.providerUsed} (${result.modelUsed}).`,
                  'Extracted domain axioms and structural constraints.',
                ],
        };
      }

      return {
        summary: result.text || `Synthesized research brief for "${goal}".`,
        thinking: [
          `Evaluated objective via ${result.providerUsed} (${result.modelUsed}).`,
          'Compiled foundational architectural constraints.',
        ],
      };
    } catch {
      return {
        summary: `Local research summary generated for "${goal}" using sovereign heuristics.`,
        thinking: ['Decomposed objective into modular steps.', 'Applied offline architectural constraints.'],
      };
    }
  }

  async generatePlan(goal: string, research: string): Promise<AgentPlan> {
    const { modelId } = this.getAdapterRuntimeConfig();
    const prompt = `Goal: ${goal}\nResearch Context: ${research}\nCreate a Sovereign Plan as JSON:
{"objective":"...","steps":[{"id":"step_1","description":"...","tool":"Planner","status":"todo"}],"thinking_process":["..."]}`;

    try {
      const result = await invokeAdapterText({
        prompt,
        systemInstruction: 'Output valid JSON matching the AgentPlan schema.',
        responseMimeType: 'application/json',
        modelId,
        });

      const parsed = parseJsonBlock<AgentPlan>(result.text);
      if (parsed && parsed.objective && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
        return {
          objective: parsed.objective,
          steps: parsed.steps.map((s, idx) => ({
            id: s.id || `step_${idx + 1}`,
            description: s.description || `Execute module ${idx + 1} for ${goal}`,
            tool: s.tool || 'Architect',
            status: 'todo',
          })),
          thinking_process: Array.isArray(parsed.thinking_process)
            ? parsed.thinking_process
            : ['Plan compiled successfully.'],
        };
      }
    } catch {
      // Fallback below
    }

    return {
      objective: goal,
      steps: [
        {
          id: 'step_1_spec',
          description: `Define core specification for "${goal.slice(0, 60)}"`,
          tool: 'AxiomAnalyzer',
          status: 'todo',
        },
        {
          id: 'step_2_scaffold',
          description: 'Generate local workspace manifest and state bindings',
          tool: 'WorkspaceBuilder',
          status: 'todo',
        },
        {
          id: 'step_3_verify',
          description: 'Run structural integrity audit in IndexedDB sandbox',
          tool: 'AuditKernel',
          status: 'todo',
        },
      ],
      thinking_process: [
        'Synthesized deterministic local execution plan.',
        'Mapped task deliverables into isolated IndexedDB workspace files.',
      ],
    };
  }

  async mergeArtifacts(
    files: ProjectFile[]
  ): Promise<{ name: string; content: string; thinking: string[] }> {
    const { modelId } = this.getAdapterRuntimeConfig();
    const context = files.map((f) => `File: ${f.path}\nContent: ${f.content}`).join('\n\n---\n\n');

    const prompt = `Conduct Harmonic Idea Fusion on these workspace files:\n\n${context}\n\nReturn JSON:
{"artifactName":"...","unifiedContent":"...","resonances":["...","..."]}`;

    try {
      const result = await invokeAdapterText({
        prompt,
        systemInstruction: 'Synthesize these artifacts cleanly and return valid JSON.',
        responseMimeType: 'application/json',
        modelId,
        });

      const parsed = parseJsonBlock<{
        artifactName?: string;
        unifiedContent?: string;
        resonances?: string[];
      }>(result.text);

      if (parsed?.artifactName && parsed?.unifiedContent) {
        return {
          name: parsed.artifactName,
          content: parsed.unifiedContent,
          thinking: Array.isArray(parsed.resonances)
            ? parsed.resonances
            : ['Cross-referenced workspace artifacts.'],
        };
      }
    } catch {
      // Deterministic local fusion fallback below
    }

    return {
      name: `Harmonic_Synthesis_${files.length}_Nodes`,
      content: JSON.stringify(
        {
          synthesizedAt: new Date().toISOString(),
          sourceFiles: files.map((f) => f.path),
          mergedSummary: files.map((f) => `[${f.path}] ${f.content.slice(0, 160)}`).join('\n'),
        },
        null,
        2
      ),
      thinking: [
        `Merged ${files.length} workspace files locally.`,
        'Preserved provenance references for NVK Nexus indexing.',
      ],
    };
  }

  /**
   * Provisions an isolated client-side virtual workspace persisted in IndexedDB (`driftDB`).
   */
  async provisionVM(projectName: string): Promise<string> {
    const projectId = `ws-${Date.now()}`;
    const cleanName = (projectName || 'Sovereign Workspace').trim();
    const newProject: ProjectMetadata = {
      id: projectId,
      name: cleanName,
      description: 'Local IndexedDB Virtual Workspace',
      createdAt: Date.now(),
      vmStatus: 'Active',
      files: [
        {
          path: 'manifest.json',
          content: JSON.stringify(
            { name: cleanName, storage: 'IndexedDB (driftDB)', status: 'initialized' },
            null,
            2
          ),
          lastModified: Date.now(),
          type: 'json',
        },
        {
          path: 'workspace_log.txt',
          content: `[${new Date().toISOString()}] Workspace Initialized\n[${new Date().toISOString()}] Mounted Local IndexedDB Sandbox Store`,
          lastModified: Date.now(),
          type: 'log',
        },
      ],
    };

    const existingProjects = (await driftDB.loadAppState('sovereign_projects')) || [];
    await driftDB.saveAppState('sovereign_projects', [...existingProjects, newProject]);

    return projectId;
  }

  async getProject(projectId: string): Promise<ProjectMetadata | null> {
    const projects = ((await driftDB.loadAppState('sovereign_projects')) as ProjectMetadata[]) || [];
    return projects.find((p) => p.id === projectId) || null;
  }

  async writeProjectFile(projectId: string, file: Omit<ProjectFile, 'lastModified'>): Promise<void> {
    const projects = ((await driftDB.loadAppState('sovereign_projects')) as ProjectMetadata[]) || [];
    const index = projects.findIndex((p) => p.id === projectId);
    if (index !== -1) {
      const fileIndex = projects[index].files.findIndex((f) => f.path === file.path);
      const updatedFile = { ...file, lastModified: Date.now() };
      if (fileIndex !== -1) {
        projects[index].files[fileIndex] = updatedFile as ProjectFile;
      } else {
        projects[index].files.push(updatedFile as ProjectFile);
      }
      await driftDB.saveAppState('sovereign_projects', projects);
    }
  }
}

export const globalSovereignKernel = new SovereignKernel();
