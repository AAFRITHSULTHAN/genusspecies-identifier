import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ResultsDisplay } from './components/ResultsDisplay';
import { BiologicalIcons } from './components/BiologicalIcons';
import { AutoProcessor } from './components/AutoProcessor';
import { extractTextFromFile } from './utils/textExtraction';
import { GenusSpeciesExtractor } from './utils/genusSpeciesExtractor';
import { FileProcessingStatus, ExtractionResult } from './types/extraction';
import { Microscope, Dna, Leaf, Sparkles } from 'lucide-react';

function App() {
  const [status, setStatus] = useState<FileProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [results, setResults] = useState<ExtractionResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [autoProcessing, setAutoProcessing] = useState<boolean>(false);

  const extractor = new GenusSpeciesExtractor();

  const processFile = useCallback(async (file: File): Promise<void> => {
    setFileName(file.name);
    setResults(null);
    
    try {
      // Step 1: Upload
      setStatus({
        status: 'uploading',
        progress: 20,
        message: 'Processing document...'
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 2: Extract text
      setStatus({
        status: 'extracting',
        progress: 60,
        message: 'Extracting text content...'
      });
      
      const text = await extractTextFromFile(file);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Step 3: Analyze
      setStatus({
        status: 'analyzing',
        progress: 90,
        message: 'Detecting biological terms...'
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const extractionResults = await extractor.extractTerms(text);
      
      // Step 4: Complete
      setStatus({
        status: 'complete',
        progress: 100,
        message: `Detected ${extractionResults.totalFound} terms`
      });
      
      setResults(extractionResults);
      
    } catch (error) {
      console.error('Processing error:', error);
      setStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Processing failed'
      });
      throw error;
    }
  }, [extractor]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <Microscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  TaxoTrace
                </h1>
                <p className="text-sm text-gray-600 flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Dataset-Enhanced Biological Term Detection</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Dna className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Fast & Accurate Term Detection
            </h2>
            <Leaf className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload documents in multiple formats to detect Genus and Species terms with high precision using our comprehensive biological dataset.
          </p>
        </div>

        <BiologicalIcons />

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FileUpload 
              onFileSelect={processFile}
              isProcessing={status.status !== 'idle' && status.status !== 'complete' && status.status !== 'error'}
            />
            
            <AutoProcessor 
              onFileProcess={processFile}
              isEnabled={autoProcessing}
              onToggle={setAutoProcessing}
            />
          </div>
          
          <ProcessingStatus status={status} />
          
          {results && (
            <ResultsDisplay results={results} fileName={fileName} />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Dataset-enhanced detection • Multi-format support • 50MB file limit • Fast processing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;