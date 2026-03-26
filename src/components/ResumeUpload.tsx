import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Upload, FileText, X, Loader2, ArrowLeft } from 'lucide-react';
import { extractResumeData } from '../services/geminiService';
import { Candidate } from '../types';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  updateCandidate: (updates: Partial<Candidate>) => Promise<void>;
}

const ResumeUpload = ({ updateCandidate }: Props) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: true,
        isEvalSupported: false,
      });
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (err) {
      console.error("PDF Extraction Error:", err);
      throw new Error("Failed to read PDF content. Please try a different file.");
    }
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (err) {
      console.error("DOCX Extraction Error:", err);
      throw new Error("Failed to read DOCX content. Please try a different file.");
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractTextFromPdf(file);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        text = await extractTextFromDocx(file);
      } else {
        // For .doc, it's much harder in the browser.
        // We'll just alert that only PDF and DOCX are supported for auto-extraction.
        throw new Error("Only PDF and DOCX files are supported for automatic extraction.");
      }

      if (text && text.trim().length > 10) {
        const extractedData = await extractResumeData(text);
        await updateCandidate(extractedData);
        navigate('/profile');
      } else {
        throw new Error("The file seems to be empty or unreadable. Please fill details manually.");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to extract data from resume. Please try another file or fill manually.");
    } finally {
      setLoading(false);
    }
  }, [updateCandidate, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white relative">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Upload Resume</h2>
          <p className="text-gray-500">We'll automatically extract your details to save time.</p>
        </div>

        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
            ${loading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            {loading ? (
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}
            <div className="space-y-1">
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop it here' : 'Drag & drop your resume'}
              </p>
              <p className="text-sm text-gray-500">PDF, DOCX or DOC (Max 5MB)</p>
            </div>
            <button className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Select File
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 uppercase tracking-wider">Or</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="w-full py-4 bg-white text-black border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center"
        >
          <FileText className="mr-2 w-5 h-5" />
          Fill Details Manually
        </button>

        <p className="text-center text-xs text-gray-400">
          By uploading, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default ResumeUpload;
