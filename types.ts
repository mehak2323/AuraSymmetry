export interface Exercise {
  name: string;
  targetArea: string;
  instructions: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface AnalysisResult {
  symmetryScore: number;
  achievabilityScore: number;
  analysisSummary: string;
  keyDifferences: string[];
  exercises: Exercise[];
}

export type AppState = 'upload' | 'analyzing' | 'results' | 'error';
export type GenerationMode = 'golden_ratio' | 'symmetry';

export interface GeneratedImages {
  original: string; // Base64
  enhanced: string; // Base64
}