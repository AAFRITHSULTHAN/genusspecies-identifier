import React, { useCallback } from 'react';
import { Upload, FileText, File, AlertTriangle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const SUPPORTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/tab-separated-values'
];

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 50MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
    }
    
    if (!SUPPORTED_TYPES.includes(file.type) && !file.name.match(/\.(txt|csv|tsv|doc|docx|pdf|xlsx|xls)$/i)) {
      return 'Unsupported file type. Please upload PDF, DOCX, DOC, TXT, CSV, TSV, or Excel files.';
    }
    
    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        e.target.value = '';
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isProcessing 
            ? 'border-blue-300 bg-blue-50 cursor-not-allowed' 
            : 'border-emerald-300 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100 cursor-pointer'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          accept=".pdf,.docx,.doc,.txt,.csv,.tsv,.xlsx,.xls"
          onChange={handleFileInput}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="file-upload"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className={`
              p-4 rounded-full transition-colors duration-300
              ${isProcessing ? 'bg-blue-200' : 'bg-emerald-200'}
            `}>
              <Upload className={`
                w-10 h-10 transition-colors duration-300
                ${isProcessing ? 'text-blue-600' : 'text-emerald-600'}
              `} />
            </div>
            {!isProcessing && (
              <div className="absolute -bottom-2 -right-2 flex space-x-1">
                <FileText className="w-5 h-5 text-red-500" />
                <File className="w-5 h-5 text-blue-500" />
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <h3 className={`
              text-lg font-semibold transition-colors duration-300
              ${isProcessing ? 'text-blue-700' : 'text-emerald-700'}
            `}>
              {isProcessing ? 'Processing Document...' : 'Upload Document'}
            </h3>
            
            <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
              {isProcessing 
                ? 'Extracting biological terms from your document'
                : 'Drop your file here or click to browse. Supports multiple formats up to 50MB.'
              }
            </p>
            
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 max-w-sm mx-auto">
              <span className="flex items-center justify-center space-x-1 bg-white rounded px-2 py-1">
                <FileText className="w-3 h-3 text-red-500" />
                <span>PDF</span>
              </span>
              <span className="flex items-center justify-center space-x-1 bg-white rounded px-2 py-1">
                <File className="w-3 h-3 text-blue-500" />
                <span>DOCX</span>
              </span>
              <span className="flex items-center justify-center space-x-1 bg-white rounded px-2 py-1">
                <FileText className="w-3 h-3 text-green-500" />
                <span>TXT</span>
              </span>
              <span className="flex items-center justify-center space-x-1 bg-white rounded px-2 py-1">
                <File className="w-3 h-3 text-orange-500" />
                <span>CSV</span>
              </span>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Max file size: 50MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};