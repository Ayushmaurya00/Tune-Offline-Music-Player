import React, { useState, useEffect } from 'react';
import { FolderDown } from 'lucide-react';

interface FileDropOverlayProps {
  onFilesDropped: (files: File[]) => void;
  accentColor?: string;
}

export const FileDropOverlay: React.FC<FileDropOverlayProps> = ({
  onFilesDropped,
  accentColor = '#1db954'
}) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsDragging(false);
        dragCounter = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        onFilesDropped(files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onFilesDropped]);

  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 pointer-events-none select-none">
      <div
        className="w-full h-full max-w-2xl max-h-96 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 bg-tune-surface/90 shadow-2xl transition-transform"
        style={{ borderColor: accentColor }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg animate-bounce"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
        >
          <FolderDown size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">Drop Audio Files or Folders Here</h2>
          <p className="text-sm text-tune-textSecondary mt-1">MP3, WAV, FLAC, M4A, AAC, OGG will be added instantly</p>
        </div>
      </div>
    </div>
  );
};

