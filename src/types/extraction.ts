export interface BiologicalTerm {
  genus: string;
  species: string;
  fullName: string;
  context: string;
  confidence: number;
  position: number;
}

export interface ExtractionResult {
  terms: BiologicalTerm[];
  totalFound: number;
  processingTime: number;
  accuracy: number;
}

export interface FileProcessingStatus {
  status: 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
}