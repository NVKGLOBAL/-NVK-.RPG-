
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RPGSceneData, SeekerProfile } from '../../types';
import { AgentName } from '../../types';
import { useGemini } from '../../context/GeminiIntegrationContext';
import { QuestCinemaEngine } from '../../lib/video/QuestCinemaEngine';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface RPGMementoArchivePanelProps {
    sceneHistory: RPGSceneData[];
    narrativeHistory: { text: string; type: string }[];
    activeProfile: SeekerProfile | null;
    currentEntropy: number;
    addEchoMessage: (source: string, text: string, colorClass?: string) => void;
}

const RPGMementoArchivePanel: React.FC<RPGMementoArchivePanelProps> = ({
    sceneHistory,
    narrativeHistory,
    activeProfile,
    currentEntropy,
    addEchoMessage
}) => {
    const { generateSpeech } = useGemini();
    const [isExporting, setIsExporting] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) currentLine += " " + word;
            else { lines.push(currentLine); currentLine = word; }
        }
        lines.push(currentLine);
        return lines;
    };

    const handleExportPNG = async () => {
        if (isExporting || sceneHistory.length === 0) return;
        setIsExporting('png');
        addEchoMessage(AgentName.RPGNexusAgent, "Synthesizing Chronicle Strip...", "text-amber-300");

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const panelWidth = 1200;
            const panelHeight = 675;
            const margin = 50;
            const headerHeight = 150;
            
            canvas.width = panelWidth + margin * 2;
            canvas.height = headerHeight + (panelHeight + margin) * sceneHistory.length + margin;

            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Header
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 60px Cinzel, serif';
            ctx.textAlign = 'center';
            ctx.fillText("TRI-SOPHIAN CHRONICLES", canvas.width / 2, 80);
            ctx.font = '24px Cinzel, serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`Seeker: ${activeProfile?.name || 'Anonymous'} | Entropy: ${currentEntropy.toFixed(3)}δ`, canvas.width / 2, 120);

            let currentY = headerHeight;

            for (let i = 0; i < sceneHistory.length; i++) {
                const scene = sceneHistory[i];
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = scene.imageUrl;
                await new Promise((resolve) => {
                    img.onload = () => {
                        ctx.drawImage(img, margin, currentY, panelWidth, panelHeight);
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                        ctx.fillRect(margin, currentY + panelHeight - 150, panelWidth, 150);
                        ctx.fillStyle = '#f59e0b';
                        ctx.font = 'bold 20px mono';
                        ctx.textAlign = 'left';
                        ctx.fillText(`LOCATION: ${scene.location.toUpperCase()}`, margin + 30, currentY + panelHeight - 110);
                        ctx.fillStyle = '#f8fafc';
                        ctx.font = 'italic 24px Cormorant, serif';
                        const lines = wrapText(ctx, scene.description, panelWidth - 60);
                        lines.slice(0, 3).forEach((line, idx) => {
                            ctx.fillText(line, margin + 30, currentY + panelHeight - 75 + (idx * 30));
                        });
                        currentY += panelHeight + margin;
                        resolve(true);
                    };
                    img.onerror = () => resolve(false);
                });
                setProgress((i + 1) / sceneHistory.length);
            }

            const link = document.createElement('a');
            link.download = `Chronicle_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } finally {
            setIsExporting(null);
            setProgress(0);
        }
    };

    const handleExportPDF = async () => {
        if (isExporting || sceneHistory.length === 0) return;
        setIsExporting('pdf');
        addEchoMessage(AgentName.RPGNexusAgent, "Binding Aetheric Tome...", "text-sky-300");

        try {
            const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720] });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Cover
            doc.setFillColor(2, 6, 23);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            doc.setTextColor(245, 158, 11);
            doc.setFont('times', 'bold');
            doc.setFontSize(40);
            doc.text("TRI-SOPHIAN CHRONICLES", pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
            doc.setFontSize(18);
            doc.setTextColor(148, 163, 184);
            doc.text(`The Recorded Journey of Seeker ${activeProfile?.name || 'Unknown'}`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });

            for (let i = 0; i < sceneHistory.length; i++) {
                const scene = sceneHistory[i];
                const base64 = await urlToBase64(scene.imageUrl);
                doc.addPage();
                doc.addImage(base64, 'JPEG', 0, 0, pageWidth, pageHeight);
                doc.setFillColor(0, 0, 0);
                doc.setGState(new (doc as any).GState({ opacity: 0.8 }));
                doc.rect(0, pageHeight - 120, pageWidth, 120, 'F');
                doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
                doc.setTextColor(245, 158, 11);
                doc.setFontSize(14);
                doc.text(`${scene.location.toUpperCase()}`, 40, pageHeight - 90);
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.setFont('times', 'italic');
                const lines = doc.splitTextToSize(scene.description, pageWidth - 80);
                doc.text(lines, 40, pageHeight - 70);
                setProgress((i + 1) / sceneHistory.length);
            }

            doc.save(`Aetheric_Tome_${Date.now()}.pdf`);
        } finally {
            setIsExporting(null);
            setProgress(0);
        }
    };

    const handleExportTXT = () => {
        const text = narrativeHistory.map(h => `${h.type === 'action' ? '> ' : ''}${h.text}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Quest_Log_${Date.now()}.txt`;
        a.click();
        addEchoMessage(AgentName.RPGNexusAgent, "Scriptorium log exported.", "text-slate-300");
    };

    const handleExportMovie = async () => {
        if (isExporting || sceneHistory.length === 0) return;
        setIsExporting('movie');
        addEchoMessage(AgentName.RPGNexusAgent, "Synthesizing Quest Cinema...", "text-emerald-300");
        
        try {
            const cinema = new QuestCinemaEngine();
            const slides = sceneHistory.map(s => ({ imageUrl: s.imageUrl, text: s.description }));
            const blob = await cinema.compileVideo(slides, setProgress, generateSpeech);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Cinema_${Date.now()}.webm`;
            a.click();
        } finally {
            setIsExporting(null);
            setProgress(0);
        }
    };

    const urlToBase64 = async (url: string): Promise<string> => {
        if (url.startsWith('data:')) return url;
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    };

    return (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-600/40 rounded-xl shadow-2xl p-6 my-6 text-slate-100 flex flex-col">
            <header className="flex justify-between items-center mb-6 border-b border-amber-800/30 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-600/20 border border-amber-500/50 flex items-center justify-center text-xl text-amber-400">
                        <i className="ri-archive-line"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-cinzel font-bold text-amber-300 tracking-widest uppercase">Chronicle Memento Archive</h3>
                        <p className="text-[10px] font-mono text-slate-500 uppercase">Status: Memory Synthesis Active</p>
                    </div>
                </div>
                {isExporting && (
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                        <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div animate={{ width: `${progress * 100}%` }} className="h-full bg-amber-500" />
                        </div>
                        <span className="text-[10px] font-mono text-amber-400">{Math.round(progress * 100)}%</span>
                    </div>
                )}
            </header>

            {sceneHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                    <i className="ri-ghost-line text-5xl mb-4 opacity-20"></i>
                    <p className="text-sm font-cinzel">The Archive is a void.</p>
                    <p className="text-xs">Travel and act within the Nexus to weave a chronicle.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ExportCard 
                        title="Chronicle Strip"
                        desc="Synthesize a long-form PNG strip of your adventure images."
                        icon="ri-file-image-line"
                        color="amber"
                        onClick={handleExportPNG}
                        loading={isExporting === 'png'}
                    />
                    <ExportCard 
                        title="Aetheric Tome"
                        desc="Bind your journey into a high-fidelity landscape PDF."
                        icon="ri-book-3-line"
                        color="sky"
                        onClick={handleExportPDF}
                        loading={isExporting === 'pdf'}
                    />
                    <ExportCard 
                        title="Quest Cinema"
                        desc="Generate a cinematic WebM with AI narration."
                        icon="ri-movie-2-line"
                        color="emerald"
                        onClick={handleExportMovie}
                        loading={isExporting === 'movie'}
                    />
                    <ExportCard 
                        title="Scriptorium"
                        desc="Export a clean text log of your complete narrative arc."
                        icon="ri-quill-pen-line"
                        color="slate"
                        onClick={handleExportTXT}
                    />
                </div>
            )}
        </div>
    );
};

const ExportCard: React.FC<{ title: string; desc: string; icon: string; color: string; onClick: () => void; loading?: boolean }> = ({ title, desc, icon, color, onClick, loading }) => {
    const colors: any = {
        amber: "hover:border-amber-500/50 hover:bg-amber-900/10 text-amber-300",
        sky: "hover:border-sky-500/50 hover:bg-sky-900/10 text-sky-300",
        emerald: "hover:border-emerald-500/50 hover:bg-emerald-900/10 text-emerald-300",
        slate: "hover:border-slate-500/50 hover:bg-slate-800/10 text-slate-300"
    };

    return (
        <button 
            onClick={onClick}
            disabled={loading}
            className={`p-5 rounded-2xl border border-white/5 bg-white/5 transition-all text-left flex flex-col gap-3 group ${colors[color]} disabled:opacity-50`}
        >
            <div className="flex justify-between items-start">
                <i className={`${icon} text-3xl opacity-70 group-hover:opacity-100 transition-opacity`}></i>
                {loading && <i className="ri-loader-4-line animate-spin text-xl"></i>}
            </div>
            <div>
                <h4 className="font-cinzel font-bold text-sm uppercase tracking-wider">{title}</h4>
                <p className="text-[10px] text-slate-500 leading-tight mt-1">{desc}</p>
            </div>
        </button>
    );
};

export default RPGMementoArchivePanel;
