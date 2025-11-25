
export enum AppStep {
  UPLOAD_CHARACTER = 0,
  BACKGROUND_SETUP = 1,
  COMPOSITION = 2,
  RESULT = 3,
}

export enum ArtStyle {
  HYPER_REALISTIC = 'Hyper Realistic',
  CARTOON = 'Cartoon / Anime',
  OIL_PAINTING = 'Oil Painting',
  PIXEL_ART = 'Pixel Art',
  CYBERPUNK = 'Cyberpunk',
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Character {
  id: string;
  image: string; // Base64
  style: ArtStyle;
}

export interface Placement {
  id: string;
  characterId: string;
  box: BoundingBox;
  action: string;
  color: string; // Hex code for the guide box
}

export interface AppState {
  step: AppStep;
  characters: Character[];
  backgroundImage: string | null; // Base64
  placements: Placement[];
  
  // Result State
  generatedImages: string[]; // Array of Base64 results
  selectedImageIndex: number;
  upscaledImage: string | null; // Base64
  
  isProcessing: boolean;
  error: string | null;
}

export const INITIAL_STATE: AppState = {
  step: AppStep.UPLOAD_CHARACTER,
  characters: [],
  backgroundImage: null,
  placements: [],
  generatedImages: [],
  selectedImageIndex: 0,
  upscaledImage: null,
  isProcessing: false,
  error: null,
};
