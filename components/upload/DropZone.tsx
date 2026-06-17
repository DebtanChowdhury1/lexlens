'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export default function DropZone({ onFile, disabled }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      if (rejected.length > 0) {
        const err = rejected[0].errors[0];
        const file = rejected[0].file as File;
        if (err.code === 'file-too-large') {
          setError('File too large. Maximum size is 10 MB.');
        } else if (file?.name?.endsWith('.doc')) {
          setError('Old .doc format not supported. Please save as .docx and re-upload.');
        } else {
          setError('Unsupported file type. Please use PDF, DOCX, or TXT.');
        }
        return;
      }
      if (accepted[0]) {
        setError(null);
        setFile(accepted[0]);
        onFile(accepted[0]);
      }
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    disabled,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-12
          flex flex-col items-center justify-center gap-5 text-center
          transition-all duration-300 min-h-[280px]
          ${isDragActive
            ? 'border-violet-500 bg-violet-500/10 scale-[1.01]'
            : file
            ? 'border-emerald-500/60 bg-emerald-500/5'
            : 'border-white/20 bg-[#12121A] hover:border-violet-500/50 hover:bg-violet-500/5'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} aria-label="Upload contract file" />

        {/* Animated corner accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-violet-500/50 rounded-tl-lg" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-violet-500/50 rounded-tr-lg" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-violet-500/50 rounded-bl-lg" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-violet-500/50 rounded-br-lg" />

        <AnimatePresence mode="wait">
          {isDragActive ? (
            <motion.div
              key="drag"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Upload size={32} className="text-violet-400" />
              </div>
              <p className="text-violet-400 font-semibold text-lg">Drop it here!</p>
            </motion.div>
          ) : file ? (
            <motion.div
              key="file"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-[#F8FAFC] text-lg">{file.name}</p>
                <p className="text-sm text-[#94A3B8] mt-1">{formatFileSize(file.size)}</p>
              </div>
              <p className="text-sm text-emerald-400">Ready to analyze</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20"
              >
                <FileText size={28} className="text-violet-400" />
              </motion.div>
              <div>
                <p className="font-semibold text-[#F8FAFC] text-lg">
                  Drop your contract here
                </p>
                <p className="text-[#94A3B8] mt-1">
                  or <span className="text-violet-400 underline">click to browse</span>
                </p>
              </div>
              <div className="flex gap-3 text-xs text-[#94A3B8]">
                {['PDF', 'DOCX', 'TXT'].map((ext) => (
                  <span
                    key={ext}
                    className="px-2 py-1 bg-[#1A1A27] border border-white/10 rounded-md"
                  >
                    {ext}
                  </span>
                ))}
                <span className="px-2 py-1 bg-[#1A1A27] border border-white/10 rounded-md">
                  Max 10MB
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-600/30 rounded-lg px-4 py-3"
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}
    </div>
  );
}
