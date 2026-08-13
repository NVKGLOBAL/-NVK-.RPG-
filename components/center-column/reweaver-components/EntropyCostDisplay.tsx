
import React from 'react';

interface EntropyCostDisplayProps {
  cost: number; // Should be positive for cost, negative for gain (reduction)
}

const EntropyCostDisplay: React.FC<EntropyCostDisplayProps> = ({ cost }) => {
  const isReduction = cost < 0; // Cost is positive from calculateEntropyCost, entropyChange will be negative
  const displayCost = Math.abs(cost);

  return (
    <div className="text-center text-sm mb-3">
      <span className="text-slate-400 font-cormorant">Projected Entropy Shift: </span>
      <span 
        className={`font-semibold font-mono ${
          cost === 0 ? 'text-slate-500' : 
          isReduction ? 'text-green-400' : 'text-rose-400' // This condition might seem reversed due to cost usually being positive
                                                              // but prompt's final log shows NEGATIVE entropy change for reduction
        }`}
      >
        {cost >= 0 ? `+${displayCost.toFixed(3)}` : `${displayCost.toFixed(3)}`}δ 
        {/* If cost is positive, display +cost. If cost is negative (meaning entropyChange was positive), display -cost.
            The prompt log implies negative entropyChange is reduction, so entropyCost passed here should be positive.
            And the final displayed shift should reflect reduction if cost is positive.
            Let's assume 'cost' prop IS the change.
        */}
      </span>
       <span className="text-slate-500 text-xs"> ({cost < 0 ? "Stabilizing" : cost > 0 ? "Destabilizing" : "Neutral"})</span>
    </div>
  );
};
// Correcting logic based on how it's used:
// calculateEntropyCost returns a positive value for cost.
// reweaveGlyph uses this for new RewovenGlyph().entropyChange = -actualEntropyCost
// So, if this component receives `calculatedEntropyCost` directly from `reweaveLogic.calculateEntropyCost`,
// then positive `cost` means a negative `entropyChange` (stabilizing).

const CorrectedEntropyCostDisplay: React.FC<{cost: number}> = ({cost}) => {
     const displayValue = cost.toFixed(3);
     const effectText = cost > 0 ? "Stabilizing" : cost < 0 ? "Destabilizing" : "Neutral";
     const textColor = cost > 0 ? "text-green-400" : cost < 0 ? "text-rose-400" : "text-slate-500";

    return (
         <div className="text-center text-sm mb-3">
             <span className="text-slate-400 font-cormorant">Projected System Entropy Change: </span>
             <span className={`font-semibold font-mono ${textColor}`}>
                 {cost > 0 ? `-${displayValue}` : (cost < 0 ? `+${Math.abs(cost).toFixed(3)}` : "0.000")}δ
             </span>
             <span className={`text-xs ml-1 ${textColor}`}>({effectText})</span>
         </div>
     );
}


export default CorrectedEntropyCostDisplay;
