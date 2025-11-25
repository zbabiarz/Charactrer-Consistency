import React, { useState, useCallback } from 'react';
import { Upload, Wand2, RefreshCw, Check } from 'lucide-react';
import { Button } from './Button';
import { generateBackground } from '../services/geminiService';
import { AspectRatio } from '../types';

interface Props {
  currentImage: string | null;
  onConfirm: (bgImage: string) => void;
  setProcessing: (processing: boolean) => void;
  onError: (msg: string) => void;
}

export const BackgroundSetup: React.FC<Props> = ({ currentImage, onConfirm, setProcessing, onError }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('upload');
  
  // Generation State
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [quantity, setQuantity] = useState<number>(1);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<string | null>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // For upload, we confirm immediately
        onConfirm(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onConfirm]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setProcessing(true);
    setGeneratedImages([]); // Clear previous while loading
    setSelectedGeneratedImage(null);
    
    try {
      const images = await generateBackground(prompt, aspectRatio, quantity);
      setGeneratedImages(images);
      if (images.length > 0) {
        setSelectedGeneratedImage(images[0]); // Auto select first
      }
    } catch (e: any) {
      onError(e.message || "Failed to generate background");
    } finally {
      setProcessing(false);
    }
  };

  const confirmSelection = () => {
    if (selectedGeneratedImage) {
      onConfirm(selectedGeneratedImage);
    }
  };

  const ratios: AspectRatio[] = ["16:9", "4:3", "1:1", "3:4", "9:16"];
  const quantities = [1, 2, 3, 4];

  // If we have a current image passed in via props (from state), and it wasn't from our current generation session
  // (or if we just want to show the confirmed state), we display it.
  // However, the UX request is to allow regeneration. 
  // So if activeTab is generate, we keep the UI active.

  const isConfirmedView = currentImage && activeTab === 'upload';

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Step 3: Set the Scene</h2>
      <p className="text-slate-400 text-center mb-8">
        Upload an existing background or describe a new world for your character.
      </p>

      <div className="flex justify-center mb-6">
        <div className="bg-slate-800 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Upload Image
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'generate' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Generate w/ AI
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 backdrop-blur-sm min-h-[400px]">
        
        {/* Upload Tab Content */}
        {activeTab === 'upload' && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
            {currentImage ? (
              <div className="relative w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <img src={currentImage} alt="Background" className="max-h-[400px] w-auto rounded-lg shadow-2xl mb-4 border border-slate-600" />
                <Button variant="secondary" onClick={() => onConfirm('')}>Change Background</Button>
              </div>
            ) : (
              <label className="w-full h-64 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/80 transition-all group">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
                  <Upload size={32} />
                </div>
                <p className="text-lg font-medium text-slate-300">Upload Background Image</p>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>
        )}

        {/* Generate Tab Content */}
        {activeTab === 'generate' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Controls Side */}
            <div className="flex flex-col gap-6">
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                    <div className="flex gap-2 flex-wrap">
                      {ratios.map(r => (
                        <button
                          key={r}
                          onClick={() => setAspectRatio(r)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                            ${aspectRatio === r 
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-105' 
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}
                          `}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
                    <div className="flex gap-2">
                      {quantities.map(q => (
                        <button
                          key={q}
                          onClick={() => setQuantity(q)}
                          className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-all flex items-center justify-center
                            ${quantity === q
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-105' 
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'}
                          `}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Scene Description</label>
                    <textarea 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                      rows={5}
                      placeholder="e.g. A futuristic cyberpunk street at night with neon signs and rain puddles..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!prompt.trim()} 
                    className="w-full"
                    variant={generatedImages.length > 0 ? "secondary" : "primary"}
                  >
                    {generatedImages.length > 0 ? (
                      <>
                        <RefreshCw size={18} /> Regenerate
                      </>
                    ) : (
                      <>
                        <Wand2 size={18} /> Generate Background
                      </>
                    )}
                  </Button>
               </div>
            </div>

            {/* Results Side */}
            <div className="flex flex-col">
              {generatedImages.length > 0 ? (
                <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-500">
                  <h3 className="text-sm font-medium text-slate-400">Select a variation:</h3>
                  <div className={`grid gap-3 ${generatedImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {generatedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedGeneratedImage(img)}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all group aspect-video
                          ${selectedGeneratedImage === img ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-700 hover:border-slate-500'}
                        `}
                      >
                        <img src={img} alt={`Generated ${idx + 1}`} className="w-full h-full object-cover" />
                        {selectedGeneratedImage === img && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-700/50">
                     <Button 
                       onClick={confirmSelection} 
                       disabled={!selectedGeneratedImage} 
                       className="w-full"
                       variant="primary"
                     >
                       Use Selected Background
                     </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl min-h-[300px]">
                  <Wand2 size={48} className="mb-4 opacity-50" />
                  <p>Enter a prompt and click generate</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
