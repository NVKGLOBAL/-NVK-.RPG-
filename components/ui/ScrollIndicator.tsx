
import React from 'react';
import { motion } from 'framer-motion';

export const ScrollIndicator: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1.2 }}
      className="fixed bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-[150] flex flex-col items-center"
    >
      <motion.div 
        animate={{ 
          y: [0, 12, 0],
          opacity: [0.4, 1, 0.4],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="text-3xl text-indigo-400/80 filter drop-shadow-[0_0_12px_rgba(129,140,248,0.9)]"
      >
        <i className="ri-arrow-down-s-line"></i>
      </motion.div>
    </motion.div>
  );
};
