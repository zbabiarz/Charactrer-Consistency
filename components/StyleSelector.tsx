import React from 'react';
import { ArtStyle } from '../types';

interface Props {
  selectedStyle: ArtStyle;
  onSelect: (style: ArtStyle) => void;
}

export const StyleSelector: React.FC<Props> = ({ selectedStyle, onSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Step 2: Choose Character Style</h2>
      <p className="text-slate-400 text-center mb-8">
        How should your character be rendered? This will not affect the background style.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.values(ArtStyle).map((style) => (
          <button
            key={style}
            onClick={() => onSelect(style)}
            className={`
              p-6 rounded-xl border-2 text-left transition-all duration-200 relative overflow-hidden group
              ${selectedStyle === style 
                ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                : 'border-slate-700 bg-slate-800 hover:border-slate-500 text-slate-300'}
            `}
          >
            <div className={`absolute top-0 right-0 p-2 ${selectedStyle === style ? 'text-indigo-400' : 'text-slate-600'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 {selectedStyle === style && <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>}
                 {selectedStyle === style && <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>}
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-1">{style}</h3>
            <p className="text-xs opacity-70">
              {style === ArtStyle.HYPER_REALISTIC && "Photorealistic lighting and textures."}
              {style === ArtStyle.CARTOON && "Vibrant colors, cel-shading, and clean lines."}
              {style === ArtStyle.OIL_PAINTING && "Rich strokes and artistic texture."}
              {style === ArtStyle.PIXEL_ART && "Retro 8-bit or 16-bit aesthetic."}
              {style === ArtStyle.CYBERPUNK && "Neon lights, high contrast, futuristic."}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};