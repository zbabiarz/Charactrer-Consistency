
import React, { useCallback } from 'react';
import { Upload, Plus, Trash2, Palette } from 'lucide-react';
import { Character, ArtStyle } from '../types';
import { Button } from './Button';

interface Props {
  characters: Character[];
  onUpdateCharacters: (chars: Character[]) => void;
  onContinue: () => void;
}

export const CharacterUploader: React.FC<Props> = ({ characters, onUpdateCharacters, onContinue }) => {
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newChars: Character[] = [];
      let processed = 0;

      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newChars.push({
            id: Math.random().toString(36).substring(2, 11),
            image: reader.result as string,
            style: ArtStyle.HYPER_REALISTIC // Default style
          });
          processed++;
          if (processed === files.length) {
            onUpdateCharacters([...characters, ...newChars]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }, [characters, onUpdateCharacters]);

  const removeCharacter = (id: string) => {
    onUpdateCharacters(characters.filter(c => c.id !== id));
  };

  const updateCharacterStyle = (id: string, newStyle: ArtStyle) => {
    onUpdateCharacters(characters.map(c => 
      c.id === id ? { ...c, style: newStyle } : c
    ));
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-4 text-center">Step 1: Upload & Style Characters</h2>
      <p className="text-slate-400 text-center mb-8">
        Upload characters and select the specific art style you want for each one.
      </p>

      {/* Grid of uploaded characters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {characters.map((char, index) => (
          <div key={char.id} className="relative bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col group">
             {/* Image Area */}
            <div className="relative aspect-square bg-slate-950 w-full">
               <img src={char.image} alt={`Character ${index + 1}`} className="w-full h-full object-contain p-4" />
               <div className="absolute top-2 right-2">
                 <button 
                  onClick={() => removeCharacter(char.id)}
                  className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove Character"
                >
                  <Trash2 size={16} />
                </button>
               </div>
               <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono">
                  #{index + 1}
               </div>
            </div>

            {/* Controls Area */}
            <div className="p-3 bg-slate-800 border-t border-slate-700">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                 <Palette size={12} /> Target Style
               </label>
               <select 
                 value={char.style}
                 onChange={(e) => updateCharacterStyle(char.id, e.target.value as ArtStyle)}
                 className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
               >
                 {Object.values(ArtStyle).map(style => (
                   <option key={style} value={style}>{style}</option>
                 ))}
               </select>
            </div>
          </div>
        ))}

        {/* Upload Button Card */}
        <label className="aspect-square border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/80 transition-all group min-h-[250px]">
          <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
            <Plus size={24} />
          </div>
          <p className="text-sm font-medium text-slate-300">Add Character</p>
          <input 
            type="file" 
            accept="image/*" 
            multiple
            onChange={handleFileChange} 
            className="hidden" 
          />
        </label>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={onContinue} 
          disabled={characters.length === 0}
          className="w-full max-w-sm"
        >
          Continue with {characters.length} Character{characters.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};
