import React from 'react';
import { ExtractionResult } from '../types/extraction';
import { 
  Download, 
  Hash, 
  Dna, 
  Leaf, 
  Bird, 
  Bug,
  TreePine,
  Microscope 
} from 'lucide-react';
import { saveAs } from 'file-saver';

interface ResultsDisplayProps {
  results: ExtractionResult;
  fileName: string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, fileName }) => {
  const exportResults = () => {
    const csvContent = [
      'Genus,Species,Full Name',
      ...results.terms.map(term => 
        `"${term.genus}","${term.species}","${term.fullName}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `biological_terms_${fileName.replace(/\.[^/.]+$/, '')}.csv`);
  };

  const getRandomBiologicalIcon = () => {
    const icons = [Dna, Leaf, Bird, Bug, TreePine, Microscope];
    const IconComponent = icons[Math.floor(Math.random() * icons.length)];
    return IconComponent;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <Microscope className="w-6 h-6 text-emerald-500" />
            <span>Detection Results</span>
          </h2>
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-50 rounded-lg px-4 py-2 border border-emerald-200">
              <div className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">{results.totalFound} Terms</span>
              </div>
            </div>
            <button
              onClick={exportResults}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Terms List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Dna className="w-6 h-6" />
            <span>Detected Terms</span>
          </h3>
          <p className="text-emerald-100 mt-1">
            From {fileName}
          </p>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {results.terms.map((term, index) => {
            const IconComponent = getRandomBiologicalIcon();
            return (
              <div
                key={index}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 italic">
                      {term.fullName}
                    </h4>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {results.terms.length === 0 && (
          <div className="p-12 text-center">
            <Microscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Terms Detected</h3>
            <p className="text-gray-500">
              No biological terms were found in the document.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};