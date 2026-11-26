import React, { useEffect, useState } from 'react';

interface NexusCursorProps {
  onPositionUpdate?: (pos: { x: number; y: number }) => void;
}

export const NexusCursor: React.FC<NexusCursorProps> = ({ onPositionUpdate }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hoverState, setHoverState] = useState<'default' | 'interactive' | 'magnetic'>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on non-touch desktop devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const newPos = { x: e.clientX, y: e.clientY };
      setPos(newPos);
      if (onPositionUpdate) {
        onPositionUpdate(newPos);
      }

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = target.closest('button, a, input, [role="button"], .nexus-interactive');
        const isMagnetic = target.closest('.magnetic-target');
        
        if (isMagnetic) {
          setHoverState('magnetic');
        } else if (isInteractive) {
          setHoverState('interactive');
        } else {
          setHoverState('default');
        }
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [onPositionUpdate]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {/* Central Core Pointer */}
      <div
        className="fixed w-2 h-2 -ml-1 -mt-1 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee] transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${hoverState === 'interactive' ? 1.5 : hoverState === 'magnetic' ? 2 : 1})`,
        }}
      />
      {/* Outer Luminous Aura Ring */}
      <div
        className={`fixed -ml-5 -mt-5 rounded-full border transition-all duration-200 ease-out ${
          hoverState === 'magnetic'
            ? 'w-16 h-16 -ml-8 -mt-8 border-cyan-400 bg-cyan-500/10 shadow-[0_0_25px_rgba(34,211,238,0.4)] scale-110'
            : hoverState === 'interactive'
            ? 'w-12 h-12 -ml-6 -mt-6 border-indigo-400/80 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-100'
            : 'w-10 h-10 border-cyan-500/30 bg-cyan-500/5 opacity-50 scale-75'
        }`}
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        }}
      />
    </div>
  );
};

export default NexusCursor;
