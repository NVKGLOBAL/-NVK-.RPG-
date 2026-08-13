
import { GoogleGenAI, Type } from "@google/genai";
import { AgentPlan, ProjectMetadata, SovereignPhase, ProjectFile } from '../types';
import { driftDB } from '../db';

export class SovereignKernel {
    private ai: GoogleGenAI | null = null;
    private modelName = 'gemini-3-pro-preview';

    private getAI() {
        if (this.ai) return this.ai;
        const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
        if (apiKey) {
            this.ai = new GoogleGenAI({ apiKey });
            return this.ai;
        }
        return null;
    }

    async researchGoal(goal: string): Promise<{ summary: string; thinking: string[] }> {
        const ai = this.getAI();
        if (!ai) throw new Error("Oracle Link Offline");

        const response = await ai.models.generateContent({
            model: this.modelName,
            contents: `Conduct deep research into the following objective: "${goal}". 
            Think step-by-step about the technical requirements. 
            Identify key historical axioms needed.
            Output: 1. A summary. 2. A list of internal thinking steps.`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const thinking = response.candidates?.[0]?.content?.parts
            .filter(p => p.text)
            .map(p => p.text!) || ["Synthesizing aetheric data...", "Parsing reality constraints..."];

        return {
            summary: response.text || "No research data found.",
            thinking
        };
    }

    async generatePlan(goal: string, research: string): Promise<AgentPlan> {
        const ai = this.getAI();
        if (!ai) throw new Error("Oracle Link Offline");

        const response = await ai.models.generateContent({
            model: this.modelName,
            contents: `Goal: ${goal}\nResearch Context: ${research}\nCreate a structured Sovereign Plan with thinking steps and creation tasks.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        objective: { type: Type.STRING },
                        steps: {
                            type: Array,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    tool: { type: Type.STRING },
                                    status: { type: Type.STRING }
                                }
                            }
                        },
                        thinking_process: {
                            type: Array,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["objective", "steps", "thinking_process"]
                }
            }
        });

        return JSON.parse(response.text || '{}') as AgentPlan;
    }

    async mergeArtifacts(files: ProjectFile[]): Promise<{ name: string; content: string; thinking: string[] }> {
        const ai = this.getAI();
        if (!ai) throw new Error("Oracle Link Offline");

        const context = files.map(f => `File: ${f.path}\nContent: ${f.content}`).join('\n\n---\n\n');
        
        const response = await ai.models.generateContent({
            model: this.modelName,
            contents: `Conduct Harmonic Idea Fusion on the following artifacts:\n\n${context}\n\nPerform cross-domain synthesis. Identify hidden resonances and unified truths. Create a NEW high-order artifact that merges these concepts.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        artifactName: { type: Type.STRING, description: "A mystical, technical name for the fused artifact." },
                        unifiedContent: { type: Type.STRING, description: "The profound, merged content." },
                        resonances: { type: Array, items: { type: Type.STRING }, description: "Hidden resonances discovered." }
                    },
                    required: ["artifactName", "unifiedContent", "resonances"]
                }
            }
        });

        const data = JSON.parse(response.text || '{}');
        return {
            name: data.artifactName,
            content: data.unifiedContent,
            thinking: data.resonances
        };
    }

    async provisionVM(projectName: string): Promise<string> {
        const projectId = `vm-${Date.now()}`;
        const newProject: ProjectMetadata = {
            id: projectId,
            name: projectName,
            description: "Angelic Workflow Instance",
            createdAt: Date.now(),
            vmStatus: 'Active',
            files: [
                { path: 'manifest.json', content: JSON.stringify({ name: projectName, status: 'initialized' }), lastModified: Date.now(), type: 'json' },
                { path: 'boot_logs.txt', content: `[${new Date().toISOString()}] Kernel Initialized\n[${new Date().toISOString()}] Mounting Sovereign Disk`, lastModified: Date.now(), type: 'log' }
            ]
        };
        
        const existingProjects = await driftDB.loadAppState('sovereign_projects') || [];
        await driftDB.saveAppState('sovereign_projects', [...existingProjects, newProject]);
        
        return projectId;
    }

    async getProject(projectId: string): Promise<ProjectMetadata | null> {
        const projects = await driftDB.loadAppState('sovereign_projects') as ProjectMetadata[] || [];
        return projects.find(p => p.id === projectId) || null;
    }

    async writeProjectFile(projectId: string, file: Omit<ProjectFile, 'lastModified'>): Promise<void> {
        const projects = await driftDB.loadAppState('sovereign_projects') as ProjectMetadata[] || [];
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            const fileIndex = projects[index].files.findIndex(f => f.path === file.path);
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
