
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BoundingBox, Character, Placement } from '../types';
import { Eraser, Check, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface Props {
  backgroundSrc: string;
  characters: Character[];
  onCompositeReady: (cleanBg: string, layoutGuide: string, placements: Placement[]) => void;
}

// Distinct colors for different placements
const BOX_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#ec4899', // Pink
];

export const CompositionCanvas: React.FC<Props> = ({ backgroundSrc, characters, onCompositeReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  
  // Current active interaction
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || '');
  const [currentAction, setCurrentAction] = useState('');
  
  // Stored placements
  const [placements, setPlacements] = useState<Placement[]>([]);
  
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.src = backgroundSrc;
    img.onload = () => {
      setImgElement(img);
    };
  }, [backgroundSrc]);

  // Handle Draw Cycle
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgElement) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

    // Draw saved placements
    placements.forEach((p, idx) => {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      ctx.strokeRect(p.box.x, p.box.y, p.box.width, p.box.height);
      
      // Label
      ctx.fillStyle = p.color;
      ctx.fillRect(p.box.x, p.box.y - 24, 80, 24);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Char ${characters.findIndex(c => c.id === p.characterId) + 1}`, p.box.x + 4, p.box.y - 8);
      
      // Fill
      ctx.fillStyle = p.color + '33'; // 20% opacity
      ctx.fillRect(p.box.x, p.box.y, p.box.width, p.box.height);
    });

    // Draw current dragging box
    if (currentBox) {
      const activeColor = BOX_COLORS[placements.length % BOX_COLORS.length];
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      
      ctx.fillStyle = activeColor + '33';
      ctx.fillRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      ctx.setLineDash([]);
    }
  }, [imgElement, placements, currentBox, characters]);

  useEffect(() => {
    if (imgElement && containerRef.current && canvasRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const ratio = imgElement.height / imgElement.width;
      
      canvasRef.current.width = containerWidth;
      canvasRef.current.height = containerWidth * ratio;
      
      draw();
    }
  }, [imgElement, draw]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setCurrentBox(null);
    const pos = getPos(e);
    setStartPos(pos);
  };

  const moveDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPos) return;
    const currentPos = getPos(e);
    
    const width = currentPos.x - startPos.x;
    const height = currentPos.y - startPos.y;
    
    setCurrentBox({
      x: width > 0 ? startPos.x : currentPos.x,
      y: height > 0 ? startPos.y : currentPos.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    draw();
  };

  useEffect(() => { draw(); }, [currentBox, draw]);

  const addPlacement = () => {
    if (!currentBox || !selectedCharId || !currentAction) return;
    
    const newPlacement: Placement = {
      id: Math.random().toString(36).substring(2, 11),
      characterId: selectedCharId,
      box: currentBox,
      action: currentAction,
      color: BOX_COLORS[placements.length % BOX_COLORS.length]
    };

    setPlacements([...placements, newPlacement]);
    setCurrentBox(null);
    setCurrentAction('');
  };

  const removePlacement = (id: string) => {
    setPlacements(placements.filter(p => p.id !== id));
  };

  const handleGenerate = () => {
    if (placements.length === 0 || !canvasRef.current) return;
    
    // 1. Get Clean Background (Original Image) - we use the stored backgroundSrc prop for this 
    //    BUT we might need to send it at the canvas resolution. 
    //    Ideally we send the canvas sized version to match the bounding boxes.
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || !imgElement) return;

    // Draw CLEAN image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    const cleanBgDataUrl = canvas.toDataURL('image/png');

    // Draw LAYOUT GUIDE (Image + Boxes)
    placements.forEach((p) => {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 5; // Thicker for AI visibility
      ctx.strokeRect(p.box.x, p.box.y, p.box.width, p.box.height);
      // We don't need text labels for the AI vision, just distinct colors.
    });
    const layoutGuideDataUrl = canvas.toDataURL('image/png');

    // Restore visual state for user (labels etc)
    draw();

    onCompositeReady(cleanBgDataUrl, layoutGuideDataUrl, placements);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Canvas Area */}
      <div className="flex-1">
         <h2 className="text-2xl font-bold mb-2">Step 3: Place Characters</h2>
         <p className="text-slate-400 mb-4 text-sm">
           Draw boxes to place characters. The AI will seamlessly blend them into the clean background.
         </p>
         
         <div 
           ref={containerRef} 
           className="relative w-full rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-900 cursor-crosshair shadow-2xl"
         >
           <canvas
             ref={canvasRef}
             onMouseDown={startDrawing}
             onMouseMove={moveDrawing}
             onMouseUp={stopDrawing}
             onMouseLeave={stopDrawing}
             onTouchStart={startDrawing}
             onTouchMove={moveDrawing}
             onTouchEnd={stopDrawing}
             className="block w-full h-full"
           />
           {placements.length === 0 && !currentBox && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
               <span className="bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur">Draw a box to place a character</span>
             </div>
           )}
         </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        
        {/* Placement Editor */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-fit backdrop-blur-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Plus size={20} className="text-indigo-400"/> New Placement
          </h3>
          
          <div className="space-y-4">
            {/* Character Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Character</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {characters.map((char, idx) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`
                      relative w-16 h-16 rounded-lg border-2 flex-shrink-0 transition-all
                      ${selectedCharId === char.id ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-600 opacity-60 hover:opacity-100'}
                    `}
                  >
                    <img src={char.image} alt="" className="w-full h-full object-cover rounded-md" />
                    <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded-tl-md">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Action / Pose</label>
              <textarea
                value={currentAction}
                onChange={(e) => setCurrentAction(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                rows={3}
                placeholder="What is this character doing?"
              />
            </div>

            {/* Add Button */}
            <Button 
              className="w-full" 
              onClick={addPlacement}
              disabled={!currentBox || !currentAction.trim()}
              variant="secondary"
            >
              Add Placement
            </Button>
            {!currentBox && <p className="text-xs text-center text-slate-500">Draw a box on the image first</p>}
          </div>
        </div>

        {/* List of Added Placements */}
        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 flex-1 overflow-y-auto max-h-[300px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Placement List ({placements.length})</h3>
          
          <div className="space-y-2">
            {placements.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No characters placed yet.</p>
            ) : (
              placements.map((p, i) => {
                const char = characters.find(c => c.id === p.characterId);
                return (
                  <div key={p.id} className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex items-start gap-3 group">
                    <div className="w-2 h-full rounded-full self-stretch" style={{ backgroundColor: p.color }}></div>
                    <img src={char?.image} className="w-10 h-10 rounded object-cover bg-slate-800" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">Char #{characters.findIndex(c => c.id === p.characterId) + 1}</p>
                      <p className="text-xs text-slate-400 truncate">{p.action}</p>
                    </div>
                    <button 
                      onClick={() => removePlacement(p.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Final Generate Button */}
        <Button 
          className="w-full py-4 text-lg shadow-indigo-500/25" 
          onClick={handleGenerate}
          disabled={placements.length === 0}
        >
          <Check size={20} /> Generate Composite
        </Button>
      </div>
    </div>
  );
};
