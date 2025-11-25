
import React, { useState } from 'react';
import { AppState, AppStep, INITIAL_STATE, Character, Placement } from './types';
import { StepIndicator } from './components/StepIndicator';
import { CharacterUploader } from './components/CharacterUploader';
import { BackgroundSetup } from './components/BackgroundSetup';
import { CompositionCanvas } from './components/CompositionCanvas';
import { LoadingOverlay } from './components/LoadingOverlay';
import { Button } from './components/Button';
import { generateComposite, upscaleImage } from './services/geminiService';
import { ArrowLeft, Download, RefreshCw, Sparkles, Check } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  
  // Local state for regeneration inputs in the Result view
  const [regenPrompt, setRegenPrompt] = useState("");
  const [regenQuantity, setRegenQuantity] = useState(1);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => updateState({ step: state.step + 1 });
  const prevStep = () => updateState({ step: Math.max(0, state.step - 1) });

  const handleCharactersUpdate = (chars: Character[]) => {
    updateState({ characters: chars });
  };
  
  const handleCharactersContinue = () => {
    nextStep();
  };

  const handleBackgroundConfirm = (bgImage: string) => {
    // If they cleared it
    if (!bgImage) {
      updateState({ backgroundImage: null });
      return;
    }
    updateState({ backgroundImage: bgImage });
    nextStep();
  };

  const handleCompositeReady = async (cleanBg: string, layoutGuide: string, placements: Placement[]) => {
    if (state.characters.length === 0) return;

    // Save placements so we can re-use them for regeneration
    updateState({ 
      placements: placements,
      isProcessing: true,
      error: null,
      generatedImages: [],
      selectedImageIndex: 0,
      upscaledImage: null
    });

    try {
      // Initial generation: default count 1, no refinement
      const resultImages = await generateComposite(
        state.characters,
        cleanBg,
        layoutGuide,
        placements,
        1,
        ""
      );
      updateState({ generatedImages: resultImages, step: AppStep.RESULT });
    } catch (err: any) {
      updateState({ error: err.message || "Failed to generate image." });
    } finally {
      updateState({ isProcessing: false });
    }
  };

  const handleRegenerate = async () => {
    if (!state.backgroundImage) return;
    
    // We need to re-create the layout guide context. 
    // Ideally we stored the 'cleanBg' and 'layoutGuide' strings, but we only stored placements.
    // However, the `CompositionCanvas` passed them to `handleCompositeReady`.
    // In a real app, we should store `cleanBackground` and `layoutGuide` in AppState if we want to reuse them exactly.
    // Since `backgroundImage` in state IS the clean background, we just need the layout guide.
    // Current Architecture Limitation: The Layout Guide (drawn boxes) was transient in Canvas.
    // FIX: We need to assume the user hasn't left the flow where data is available or we need to change how we store it.
    // For now, let's assume we can't regenerate without the layout guide image.
    // OPTION: We will prevent regeneration if we don't have the layout guide data. 
    // BUT the user asked for this feature.
    // WORKAROUND: We will trigger the regeneration using the data we DO have. 
    // Since we don't have the `layoutGuide` image string stored, we'll prompt the user they need to go back? 
    // NO, let's store the `layoutGuideBlob` in state when `handleCompositeReady` is called.
    
    // NOTE: To fix this properly without changing too many files, I will use the `generatedComposite` function 
    // but I need the `layoutGuide` image. 
    // Let's add `layoutGuideImage` to AppState to support regeneration.
  };

  // Redefine handleCompositeReady to store layoutGuide
  const handleCompositeReadyWithStorage = async (cleanBg: string, layoutGuide: string, placements: Placement[]) => {
      // Store the layout guide for regeneration
      // We will treat `backgroundImage` as the cleanBg source of truth.
      // We'll use a hidden way to store layoutGuide or just accept we pass it here.
      
      // Let's execute the generation immediately here
      if (state.characters.length === 0) return;

      updateState({ 
        placements,
        isProcessing: true,
        error: null,
        generatedImages: [],
        selectedImageIndex: 0,
        upscaledImage: null
      });

      // Define a local regenerator function that closes over these specific image blobs
      // We'll attach this to a ref or just call it now. 
      // To support the UI button calling it later, we really should store these blobs in state.
      // Since I can only update App.tsx and types.ts easily, let's add `layoutGuideImage` to state.
      // I'll add `layoutGuideImage` to state via the `updateState` call implicitly by extending the type locally or just adding it to State.
      // I added `generatedImages` to type, let's assume I can add `layoutGuideImage` to AppState in the same file change.
      // Wait, I already outputted types.ts. I should have added `layoutGuideImage` there.
      // Let's look at the `types.ts` change I generated. I did NOT add `layoutGuideImage`.
      // I should add it now.
      
      // Actually, I can allow the `App` component to hold this in a `useRef` to avoid re-renders or cluttering state types if not strictly needed for UI.
      layoutGuideRef.current = layoutGuide;
      cleanBgRef.current = cleanBg;

      try {
        const resultImages = await generateComposite(state.characters, cleanBg, layoutGuide, placements, 1, "");
        updateState({ generatedImages: resultImages, step: AppStep.RESULT });
      } catch (err: any) {
        updateState({ error: err.message });
      } finally {
        updateState({ isProcessing: false });
      }
  };

  const layoutGuideRef = React.useRef<string | null>(null);
  const cleanBgRef = React.useRef<string | null>(null);

  const performRegeneration = async () => {
    if (!layoutGuideRef.current || !cleanBgRef.current) {
        updateState({ error: "Session expired. Please re-compose." });
        return;
    }
    
    updateState({ isProcessing: true, error: null, upscaledImage: null }); // Clear upscale on regen
    try {
        const resultImages = await generateComposite(
            state.characters, 
            cleanBgRef.current, 
            layoutGuideRef.current, 
            state.placements, 
            regenQuantity, 
            regenPrompt
        );
        updateState({ generatedImages: resultImages, selectedImageIndex: 0 });
    } catch(err: any) {
        updateState({ error: err.message });
    } finally {
        updateState({ isProcessing: false });
    }
  };

  const handleUpscale = async () => {
    const currentImage = state.generatedImages[state.selectedImageIndex];
    if (!currentImage) return;

    updateState({ isProcessing: true, error: null });
    try {
        const upscaled = await upscaleImage(currentImage);
        updateState({ upscaledImage: upscaled });
    } catch (err: any) {
        updateState({ error: "Upscaling failed: " + err.message });
    } finally {
        updateState({ isProcessing: false });
    }
  };

  const resetApp = () => {
    if (window.confirm("Start over? All progress will be lost.")) {
      setState(INITIAL_STATE);
      setRegenPrompt("");
      setRegenQuantity(1);
      layoutGuideRef.current = null;
      cleanBgRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      {state.isProcessing && <LoadingOverlay />}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
              AI
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              CharaPlace
            </h1>
          </div>
          {state.step > AppStep.UPLOAD_CHARACTER && (
            <button onClick={resetApp} className="text-xs text-slate-500 hover:text-white transition-colors">
              Reset Project
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <StepIndicator 
          currentStep={state.step} 
          onStepClick={(step) => updateState({ step })}
        />

        <div className="flex-1 px-4 py-6 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
          
          {state.error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-center justify-between">
              <span>Error: {state.error}</span>
              <button onClick={() => updateState({ error: null })} className="text-sm hover:underline">Dismiss</button>
            </div>
          )}

          {state.step === AppStep.UPLOAD_CHARACTER && (
            <CharacterUploader 
              characters={state.characters}
              onUpdateCharacters={handleCharactersUpdate}
              onContinue={handleCharactersContinue}
            />
          )}

          {state.step === AppStep.BACKGROUND_SETUP && (
            <div className="flex flex-col gap-6">
              <Button variant="outline" onClick={prevStep} className="self-start">
                <ArrowLeft size={16} /> Back
              </Button>
              <BackgroundSetup 
                currentImage={state.backgroundImage} 
                onConfirm={handleBackgroundConfirm}
                setProcessing={(loading) => updateState({ isProcessing: loading })}
                onError={(msg) => updateState({ error: msg })}
              />
            </div>
          )}

          {state.step === AppStep.COMPOSITION && state.backgroundImage && (
            <div className="flex flex-col gap-6">
              <Button variant="outline" onClick={prevStep} className="self-start">
                <ArrowLeft size={16} /> Back
              </Button>
              <CompositionCanvas 
                backgroundSrc={state.backgroundImage}
                characters={state.characters}
                onCompositeReady={handleCompositeReadyWithStorage}
              />
            </div>
          )}

          {state.step === AppStep.RESULT && state.generatedImages.length > 0 && (
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 h-full">
              
              {/* Left Column: Controls & Thumbnails */}
              <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
                
                {/* Result Actions */}
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                     <RefreshCw size={20} className="text-indigo-400"/> Refine & Regenerate
                   </h3>
                   
                   <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Instruction</label>
                        <textarea 
                          value={regenPrompt}
                          onChange={(e) => setRegenPrompt(e.target.value)}
                          placeholder="e.g. Make the lighting darker, fix the shadows..."
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Quantity</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map(q => (
                            <button
                              key={q}
                              onClick={() => setRegenQuantity(q)}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all
                                ${regenQuantity === q 
                                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}
                              `}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button onClick={performRegeneration} className="w-full">
                        Regenerate
                      </Button>
                   </div>
                </div>

                {/* Thumbnails */}
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <h3 className="font-bold text-lg mb-4">Variations</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {state.generatedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => updateState({ selectedImageIndex: idx, upscaledImage: null })}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all
                          ${state.selectedImageIndex === idx 
                            ? 'border-indigo-500 ring-2 ring-indigo-500/30' 
                            : 'border-slate-700 hover:border-slate-500 opacity-60 hover:opacity-100'}
                        `}
                      >
                        <img src={img} alt={`Var ${idx}`} className="w-full h-full object-cover" />
                        {state.selectedImageIndex === idx && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                 {/* Back Button */}
                 <Button variant="outline" onClick={() => updateState({ step: AppStep.COMPOSITION })}>
                    <ArrowLeft size={16} /> Adjust Composition
                 </Button>
              </div>

              {/* Right Column: Main Preview */}
              <div className="lg:col-span-8 flex flex-col gap-4 order-1 lg:order-2">
                <div className="relative group bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                   {/* Main Image Display */}
                   <img 
                      src={state.upscaledImage || state.generatedImages[state.selectedImageIndex]} 
                      alt="Result" 
                      className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                   />
                   
                   {/* Upscale Badge */}
                   {state.upscaledImage && (
                     <div className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-indigo-400 shadow-lg flex items-center gap-2">
                       <Sparkles size={12} /> 2K UPSCALED
                     </div>
                   )}

                   {/* Toolbar */}
                   <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-3">
                        {!state.upscaledImage && (
                          <Button 
                            variant="primary" 
                            className="shadow-lg !py-2"
                            onClick={handleUpscale}
                          >
                             <Sparkles size={16} /> Upscale to 2K
                          </Button>
                        )}
                        {state.upscaledImage && (
                          <Button 
                            variant="secondary" 
                            className="shadow-lg !py-2 text-xs"
                            onClick={() => updateState({ upscaledImage: null })}
                          >
                             Show Original
                          </Button>
                        )}
                      </div>

                      <a 
                        href={state.upscaledImage || state.generatedImages[state.selectedImageIndex]} 
                        download={`charaplace-${state.upscaledImage ? '2k' : 'draft'}-${Date.now()}.png`}
                      >
                        <Button variant="secondary" className="!py-2">
                           <Download size={16} /> Download
                        </Button>
                      </a>
                   </div>
                </div>

                <div className="text-center text-slate-500 text-sm">
                   {state.upscaledImage 
                     ? "Viewing 2K Upscaled Image. Download to see full quality."
                     : "Viewing Draft Preview. Upscale for final 2K resolution."}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
