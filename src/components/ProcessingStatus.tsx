import React from 'react';
import { FileProcessingStatus } from '../types/extraction';
import { Loader2, FileText, Search, CheckCircle, AlertCircle, Dna } from 'lucide-react';

interface ProcessingStatusProps {
  status: FileProcessingStatus;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status }) => {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'uploading':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'extracting':
        return <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />;
      case 'analyzing':
        return <Search className="w-6 h-6 text-purple-500" />;
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Dna className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'extracting':
        return 'bg-orange-500';
      case 'analyzing':
        return 'bg-purple-500';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  if (status.status === 'idle') return null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-4 mb-4">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 capitalize">
            {status.status === 'complete' ? 'Extraction Complete' : status.status}
          </h3>
          <p className="text-gray-600 text-sm">{status.message}</p>
        </div>
      </div>
      
      {status.status !== 'complete' && status.status !== 'error' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{status.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full ${getStatusColor()} transition-all duration-300 ease-out`}
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};