import React, { useCallback, useState, useRef } from 'react';
import { FolderOpen, Play, Pause, CheckCircle, AlertCircle, FileText, Trash2, Clock, Folder } from 'lucide-react';

interface AutoProcessorProps {
  onFileProcess: (file: File) => Promise<void>;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const AutoProcessor: React.FC<AutoProcessorProps> = ({ 
  onFileProcess, 
  isEnabled, 
  onToggle 
}) => {
  const [watchedFiles, setWatchedFiles] = useState<File[]>([]);
  const [processingQueue, setProcessingQueue] = useState<Set<string>>(new Set());
  const [completedFiles, setCompletedFiles] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const isValidFile = (file: File): boolean => {
    const validExtensions = /\.(pdf|docx|doc|txt|csv|tsv|xlsx|xls)$/i;
    return file.size <= MAX_FILE_SIZE && validExtensions.test(file.name);
  };

  const handleFilesSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(isValidFile);
    
    if (validFiles.length === 0) {
      alert('No valid files found. Please select PDF, DOCX, DOC, TXT, CSV, TSV, or Excel files under 50MB.');
      return;
    }
    
    // Reset state
    setWatchedFiles(validFiles);
    setProcessingQueue(new Set());
    setCompletedFiles(new Set());
    setCurrentFile('');
    
    if (isEnabled && validFiles.length > 0) {
      await processFiles(validFiles);
    }
  }, [isEnabled]);

  const handleFolderSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(isValidFile);
    
    if (validFiles.length === 0) {
      alert('No valid files found in the selected folder. Please select a folder containing PDF, DOCX, DOC, TXT, CSV, TSV, or Excel files under 50MB.');
      return;
    }
    
    // Reset state
    setWatchedFiles(validFiles);
    setProcessingQueue(new Set());
    setCompletedFiles(new Set());
    setCurrentFile('');
    
    if (isEnabled && validFiles.length > 0) {
      await processFiles(validFiles);
    }
  }, [isEnabled]);

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(file.name);
        setProcessingQueue(prev => new Set([...prev, file.name]));
        
        try {
          await onFileProcess(file);
          setCompletedFiles(prev => new Set([...prev, file.name]));
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
        }
        
        setProcessingQueue(prev => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
        
        // Small delay between files to prevent overwhelming
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } finally {
      setIsProcessing(false);
      setCurrentFile('');
    }
  };

  const clearFiles = () => {
    if (isProcessing) return;
    
    setWatchedFiles([]);
    setProcessingQueue(new Set());
    setCompletedFiles(new Set());
    setCurrentFile('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileStatus = (fileName: string) => {
    if (completedFiles.has(fileName)) return 'completed';
    if (processingQueue.has(fileName)) return 'processing';
    if (currentFile === fileName) return 'current';
    return 'pending';
  };

  const getStatusIcon = (fileName: string) => {
    const status = getFileStatus(fileName);
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
      case 'current':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="w-full">
      <div className={`
        relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300
        ${isEnabled 
          ? 'border-teal-300 bg-teal-50 hover:border-teal-400 hover:bg-teal-100' 
          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }
      `}>
        {/* Multiple Files Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.csv,.tsv,.xlsx,.xls"
          onChange={handleFilesSelect}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          id="batch-upload"
        />
        
        {/* Folder Input */}
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderSelect}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
          id="folder-upload"
          style={{ display: 'none' }}
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className={`
              p-4 rounded-full transition-colors duration-300
              ${isEnabled ? 'bg-teal-200' : 'bg-gray-200'}
            `}>
              <FolderOpen className={`
                w-8 h-8 transition-colors duration-300
                ${isEnabled ? 'text-teal-600' : 'text-gray-600'}
              `} />
            </div>
            <div className="absolute -bottom-1 -right-1">
              {isProcessing ? (
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              ) : isEnabled ? (
                <Play className="w-6 h-6 text-teal-500 bg-white rounded-full p-1" />
              ) : (
                <Pause className="w-6 h-6 text-gray-500 bg-white rounded-full p-1" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className={`
              text-lg font-semibold transition-colors duration-300
              ${isEnabled ? 'text-teal-700' : 'text-gray-700'}
            `}>
              Batch Processing
            </h3>
            
            <p className="text-gray-600 max-w-sm mx-auto text-sm leading-relaxed">
              {isProcessing 
                ? `Processing: ${currentFile || 'files...'}` 
                : 'Select multiple files or entire folders for batch processing'
              }
            </p>
            
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => onToggle(!isEnabled)}
                disabled={isProcessing}
                className={`
                  px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-50
                  ${isEnabled 
                    ? 'bg-teal-600 text-white hover:bg-teal-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                  }
                `}
              >
                {isEnabled ? 'Auto-ON' : 'Auto-OFF'}
              </button>
              
              <button
                onClick={() => folderInputRef.current?.click()}
                disabled={isProcessing}
                className="px-3 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
              >
                <Folder className="w-4 h-4" />
                <span>Folder</span>
              </button>
              
              {watchedFiles.length > 0 && (
                <button
                  onClick={clearFiles}
                  disabled={isProcessing}
                  className="px-3 py-2 rounded-lg font-medium text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {watchedFiles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Files ({watchedFiles.length})
              </h4>
              <span className="text-xs text-gray-500">
                {completedFiles.size}/{watchedFiles.length} completed
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {watchedFiles.map((file, index) => {
                const status = getFileStatus(file.name);
                return (
                  <div key={index} className={`
                    flex items-center justify-between text-xs bg-white rounded px-3 py-2 transition-colors
                    ${status === 'current' ? 'bg-blue-50 border border-blue-200' : ''}
                    ${status === 'completed' ? 'bg-green-50' : ''}
                  `}>
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className={`truncate font-medium ${
                        status === 'current' ? 'text-blue-700' : 
                        status === 'completed' ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {file.name}
                      </span>
                      <span className="text-gray-400">({formatFileSize(file.size)})</span>
                    </div>
                    {getStatusIcon(file.name)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};