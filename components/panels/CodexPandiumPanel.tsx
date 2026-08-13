
import React, { useState } from 'react';
import { CODEXPANDIUM_DATA } from '../../constants';

interface CodexPandiumPanelProps {
  width?: number | string;
  height?: number | string;
}

const CodexPandiumPanel: React.FC<CodexPandiumPanelProps> = ({ width, height }) => {
  const [activeSectionId, setActiveSectionId] = useState(CODEXPANDIUM_DATA[0].id);

  const activeContent = CODEXPANDIUM_DATA.find(section => section.id === activeSectionId);

  return (
    <div 
        className="codex-pandium-panel bg-slate-950/90 backdrop-blur-xl border border-amber-500/40 rounded-xl shadow-2xl p-4 text-slate-100 flex flex-col md:flex-row gap-4"
        style={{ width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%', height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto' }}
    >
      {/* Sidebar Navigation */}
      <div className="md:w-1/4 min-w-[200px] border-r border-amber-700/30 pr-2 flex flex-col gap-2 overflow-y-auto custom-scrollbar bg-slate-900/50 p-2 rounded-lg">
        <h3 className="text-lg font-cinzel font-bold text-amber-300 mb-2 border-b border-amber-600/30 pb-1 text-center sticky top-0 bg-slate-900/90 py-2 z-10">
          <i className="ri-book-read-line mr-2"></i>Codex Pandium
        </h3>
        {CODEXPANDIUM_DATA.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSectionId(section.id)}
            className={`text-left px-3 py-2 rounded-md text-xs transition-all duration-200 font-cormorant font-semibold border ${
              activeSectionId === section.id
                ? 'bg-amber-900/40 border-amber-500 text-amber-100 shadow-md transform scale-105'
                : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800 hover:text-amber-200'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-slate-900/60 rounded-lg border border-slate-700/50 p-4 overflow-y-auto custom-scrollbar relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <i className="ri-quill-pen-line text-9xl text-amber-200"></i>
        </div>
        
        {activeContent ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <h2 className="text-2xl font-cinzel text-amber-200 mb-4 border-b border-amber-700/30 pb-2">{activeContent.title}</h2>
            <div className="whitespace-pre-wrap font-cormorant text-slate-200 leading-relaxed text-sm">
                {/* Basic Markdown-like parsing for headers/lists if needed, or render raw with styling */}
                {activeContent.content.trim().split('\n').map((line, idx) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('### ')) {
                        return <h3 key={idx} className="text-lg font-bold text-amber-100 mt-4 mb-2 font-cinzel border-b border-slate-700/50 pb-1">{trimmedLine.replace('### ', '')}</h3>;
                    }
                    if (trimmedLine.startsWith('#### ')) {
                        return <h4 key={idx} className="text-md font-bold text-amber-200/80 mt-3 mb-1 font-cinzel">{trimmedLine.replace('#### ', '')}</h4>;
                    }
                    if (trimmedLine.startsWith('- ')) {
                        return <li key={idx} className="ml-4 list-disc marker:text-amber-500/70 pl-1">{trimmedLine.replace('- ', '')}</li>;
                    }
                     if (trimmedLine.match(/^\d+\./)) { // Numbered list
                        return <div key={idx} className="ml-4 pl-1 font-semibold text-slate-300">{trimmedLine}</div>;
                    }
                    if (trimmedLine === '---') {
                        return <hr key={idx} className="border-slate-700 my-4" />;
                    }
                    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                         return <p key={idx} className="font-bold text-amber-100 my-2">{trimmedLine.replace(/\*\*/g, '')}</p>;
                    }
                    if (trimmedLine.startsWith('```')) return null; // Skip code blocks or handle differently

                    return <p key={idx} className="my-1.5">{trimmedLine.replace(/\*\*/g, '')}</p>;
                })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 italic">
            Select a chapter from the Codex to begin reading.
          </div>
        )}
      </div>
    </div>
  );
};

export default CodexPandiumPanel;
