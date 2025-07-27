import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { 
  Upload, 
  FileText, 
  Brain, 
  Download, 
  Copy, 
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AISummarizer = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      toast.success('PDF uploaded successfully!');
    } else {
      toast.error('Please upload a valid PDF file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleSummarize = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock summary generation
      const mockSummary = `# Summary of ${file.name}

## Key Points:
- **Document Type**: PDF Study Material
- **Main Topics**: Academic content covering multiple subjects
- **Key Concepts**: Core principles and important definitions

## Executive Summary:
This document contains comprehensive study materials that have been analyzed and summarized using advanced AI technology. The content covers essential topics that are crucial for exam preparation.

## Important Highlights:
1. **Core Concepts**: Fundamental principles and theories
2. **Key Definitions**: Important terms and their explanations
3. **Critical Points**: Must-know information for exams
4. **Practical Applications**: Real-world examples and case studies

## Recommendations:
- Focus on the highlighted key points for exam preparation
- Review the definitions and concepts thoroughly
- Practice with the examples provided
- Use this summary as a quick reference guide

## Notes:
This AI-generated summary maintains the accuracy of the original content while providing a concise overview for efficient study sessions.`;

      setSummary(mockSummary);
      setUploadProgress(100);
      toast.success('Summary generated successfully!');
    } catch (error) {
      toast.error('Error generating summary. Please try again.');
    } finally {
      setIsProcessing(false);
      clearInterval(progressInterval);
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard!');
  };

  const handleDownloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_${file?.name.replace('.pdf', '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded successfully!');
  };

  return (
    <>
      <Helmet>
        <title>AI PDF Summarizer | RMS - Intelligent Study Assistant</title>
        <meta name="description" content="Upload your PDF notes and get intelligent summaries using our advanced AI technology. Perfect for exam preparation and quick revision." />
      </Helmet>

      <div className="pt-16 min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white">
                AI PDF Summarizer
              </h1>
            </div>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Upload your PDF study materials and get intelligent, comprehensive summaries 
              powered by advanced AI technology. Perfect for quick revision and exam preparation.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="card">
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">
                  Upload Your PDF
                </h2>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-secondary-300 dark:border-secondary-600 hover:border-primary-500 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-primary-600 dark:text-primary-400 font-medium">
                      Drop the PDF here...
                    </p>
                  ) : (
                    <div>
                      <p className="text-secondary-600 dark:text-secondary-400 mb-2">
                        Drag & drop a PDF file here, or click to select
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-500">
                        Supports PDF files up to 10MB
                      </p>
                    </div>
                  )}
                </div>

                {/* File Info */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">
                          {file.name}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Progress Bar */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        Processing...
                      </span>
                      <span className="text-sm text-secondary-500 dark:text-secondary-500">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleSummarize}
                    disabled={!file || isProcessing}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Summary</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Features */}
                <div className="mt-8 space-y-4">
                  <h3 className="font-semibold text-secondary-900 dark:text-white">
                    What you'll get:
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Intelligent content analysis',
                      'Key points extraction',
                      'Structured summary format',
                      'Important highlights',
                      'Study recommendations'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-secondary-700 dark:text-secondary-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Summary Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                    Generated Summary
                  </h2>
                  {summary && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCopySummary}
                        className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleDownloadSummary}
                        className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="Download summary"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {summary ? (
                  <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-6 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-secondary-800 dark:text-secondary-200 font-sans">
                      {summary}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-12 text-center">
                    <FileText className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                    <p className="text-secondary-600 dark:text-secondary-400">
                      Upload a PDF and generate your summary to see it here
                    </p>
                  </div>
                )}

                {/* Tips */}
                {summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Pro Tip
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Use this summary as a quick reference guide. For best results, 
                          combine it with your original notes for comprehensive study sessions.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AISummarizer; 