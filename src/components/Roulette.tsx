import React, { useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Plus } from 'lucide-react';
import { Member } from '../types';

interface RouletteProps {
  members: Member[];
  onResult: (member: Member) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

const RAINBOW_COLORS = [
  '#60a5fa', // Blue
  '#f87171', // Red
  '#fbbf24', // Amber
  '#34d399', // Emerald
  '#818cf8', // Indigo
  '#f472b6', // Pink
  '#fb923c', // Orange
  '#a78bfa', // Violet
];

export const Roulette: React.FC<RouletteProps> = ({ members, onResult, isSpinning, setIsSpinning }) => {
  const [rotation, setRotation] = useState(0);
  const controls = useAnimation();

  const spin = async () => {
    if (members.length === 0 || isSpinning) return;
    setIsSpinning(true);
    
    const winningIndex = Math.floor(Math.random() * members.length);
    const degreesPerMember = 360 / members.length;
    
    const extraSpins = 10 + Math.floor(Math.random() * 5);
    const finalRotation = rotation - (extraSpins * 360) - (winningIndex * degreesPerMember + degreesPerMember / 2);
    
    await controls.start({
      rotate: finalRotation,
      transition: { duration: 6, ease: [0.15, 0, 0.05, 1] }
    });

    setRotation(finalRotation % 360);
    setIsSpinning(false);
    
    setTimeout(() => {
      onResult(members[winningIndex]);
    }, 300);
  };

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full aspect-square max-w-[320px] bg-white rounded-full border-4 border-dashed border-slate-200 shadow-inner">
        <div className="bg-slate-50 p-4 rounded-3xl mb-4">
          <Plus className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-400 font-bold text-center px-10 text-sm">
          メンバーを追加して<br/>抽選を開始
        </p>
      </div>
    );
  }

  const degreesPerMember = 360 / members.length;

  return (
    <div className="relative flex flex-col items-center w-full max-w-[360px]">
      {/* Pointer */}
      <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-30 drop-shadow-xl">
        <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[32px] border-t-slate-900"></div>
      </div>

      <motion.div
        animate={controls}
        initial={{ rotate: rotation }}
        className="relative w-full aspect-square rounded-full border-[10px] border-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15),0_18px_36px_-18px_rgba(0,0,0,0.2)] overflow-hidden bg-white"
        style={{ transformOrigin: 'center center' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {members.map((member, index) => {
            const startAngle = index * degreesPerMember;
            const endAngle = (index + 1) * degreesPerMember;
            
            const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
            const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
            const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
            const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
            
            const largeArcFlag = degreesPerMember > 180 ? 1 : 0;
            const d = members.length === 1 
              ? "M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0"
              : `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            return (
              <g key={member.id}>
                <path 
                  d={d} 
                  fill={RAINBOW_COLORS[index % RAINBOW_COLORS.length]} 
                  className="stroke-white/10 stroke-[0.3]"
                />
                <text
                  x="75"
                  y="50"
                  transform={`rotate(${startAngle + degreesPerMember/2}, 50, 50)`}
                  fill="white"
                  fontSize={members.length > 12 ? "2.5" : members.length > 8 ? "3.5" : "4.5"}
                  fontWeight="900"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow-md select-none font-sans"
                >
                  {member.name.length > 4 ? member.name.substring(0, 3) + '..' : member.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full z-10 shadow-lg flex items-center justify-center p-1 border-4 border-slate-50">
           <div className="w-full h-full rounded-full bg-slate-900"></div>
        </div>
      </motion.div>

      <motion.button
        onClick={spin}
        disabled={isSpinning || members.length === 0}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        className={`mt-10 w-full py-6 rounded-[2.5rem] text-xl font-black shadow-2xl transition-all ${
          isSpinning || members.length === 0
            ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
            : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-black'
        }`}
      >
        {isSpinning ? '回転中...' : 'ルーレットを回す'}
      </motion.button>
    </div>
  );
};
