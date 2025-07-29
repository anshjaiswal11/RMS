import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
  Send,
  MessageSquare,
  BookOpen
} from 'lucide-react';

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '';
const YOUR_SITE_URL = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';
const YOUR_SITE_NAME = process.env.REACT_APP_SITE_NAME || 'RMS Study Assistant';

const AISummarizer = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Extract text from PDF (mock implementation)
const extractTextFromPDF = async (file) => {
  // Check file size first
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    toast.error("File is too large. Please upload a PDF smaller than 10MB.");
    return Promise.reject(new Error("File size exceeds limit"));
  }

  // Show processing time notification
  toast.loading('Processing PDF... This may take 10-15 seconds', {
    duration: 15000
  });

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch("https://python-api-totg.onrender.com/api/extract-text", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.text) {
      throw new Error("Failed to extract text from PDF");
    }

    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    toast.error("Failed to process PDF. Please try again.");
    throw error;
  }
};

  const handleSummarize = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setSummary('');
    setMessages([]);

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
      const pdfContent = await extractTextFromPDF(file);
      
      const systemPrompt = `You are an expert academic assistant. Always format your responses using markdown:
- Use ## for main sections
- Use ### for subsections
- Use bullet points for lists
- Use **bold** for important terms
- Use blockquotes > for key insights
- Use code blocks for examples when appropriate

Structure your summaries as follows:
# Summary of [Document Name]

## Key Points: in 100-200 words:
- Highlight main arguments
- Summarize findings
- List important concepts from the document

## Detailed description in 300-400 words:
Separate sections by topics with clear headings

## Important Definitions:
Term: Definition

## Study Recommendations:
- Tips for effective learning
- Focus areas for exams

## Notes:
Any additional insights or context`;

      const messagesPayload = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please provide a comprehensive summary of the following academic document:\n\n${pdfContent}` }
      ];

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": YOUR_SITE_URL,
          "X-Title": YOUR_SITE_NAME,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
          messages: messagesPayload,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiSummary = data.choices[0].message.content;

      setSummary(aiSummary);
      setUploadProgress(100);
      setMessages([
        { role: "assistant", content: aiSummary, type: "summary" }
      ]);
      
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Error generating summary. Please try again.');
    } finally {
      setIsProcessing(false);
      clearInterval(progressInterval);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isChatLoading) return;

    const userMessage = { role: "user", content: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsChatLoading(true);

    try {
      const systemPrompt = `You are an expert academic assistant helping students with their study materials.
      Use markdown formatting for clear, structured responses.
      Keep explanations clear and educational.`;

      const messagesPayload = [
        { role: "system", content: systemPrompt },
        ...newMessages.map(msg => ({ role: msg.role, content: msg.content }))
      ];

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": YOUR_SITE_URL,
          "X-Title": YOUR_SITE_NAME,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
          messages: messagesPayload,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error('Error getting response:', error);
      toast.error('Error getting response. Please try again.');
      setMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsChatLoading(false);
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
    a.download = `summary_${file?.name.replace('.pdf', '') || 'summary'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded successfully!');
  };

  const renderMarkdown = (content) => {
  return content
    .split('\n')
    .map((line, i) => {
      // Main headings (#)
      if (line.startsWith('# ')) {
        return (
          <h1 
            key={i} 
            className="text-2xl font-bold mt-8 mb-4 text-primary-800 dark:text-primary-200 border-b border-secondary-200 dark:border-secondary-700 pb-2"
          >
            {line.substring(2)}
          </h1>
        );
      }
      
      // Sub headings (##)
      if (line.startsWith('## ')) {
        return (
          <h2 
            key={i} 
            className="text-xl font-bold mt-6 mb-3 text-secondary-800 dark:text-secondary-200"
          >
            {line.substring(3)}
          </h2>
        );
      }
      
      // Sub-sub headings (###)
      if (line.startsWith('### ')) {
        return (
          <h3 
            key={i} 
            className="text-lg font-bold mt-5 mb-2 text-secondary-700 dark:text-secondary-300"
          >
            {line.substring(4)}
          </h3>
        );
      }
      
      // Bullet points
      if (line.startsWith('- ')) {
        return (
          <li 
            key={i} 
            className="ml-6 mb-2 text-secondary-700 dark:text-secondary-300 pl-2 border-l-2 border-primary-100 dark:border-primary-900"
          >
            {line.substring(2)}
          </li>
        );
      }
      
      // Numbered lists
      if (line.match(/^\d+\./)) {
        return (
          <li 
            key={i} 
            className="ml-6 mb-2 text-secondary-700 dark:text-secondary-300 pl-2 border-l-2 border-primary-100 dark:border-primary-900"
          >
            {line.replace(/^\d+\.\s*/, '')}
          </li>
        );
      }
      
      // Blockquotes
      if (line.startsWith('> ')) {
        return (
          <blockquote 
            key={i} 
            className="border-l-4 border-primary-400 dark:border-primary-600 pl-4 py-2 my-4 bg-primary-50 dark:bg-primary-900/20 rounded-r text-secondary-700 dark:text-secondary-300 italic"
          >
            {line.substring(2)}
          </blockquote>
        );
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <div key={i} className="my-3"></div>;
      }
      
      // Regular paragraphs
      return (
        <p 
          key={i} 
          className="my-3 text-secondary-700 dark:text-secondary-300 leading-relaxed"
        >
          {line}
        </p>
      );
    });
};

  return (
    <>
      <Helmet>
        <title>AI PDF Summarizer | RMS - Intelligent Study Assistant</title>
        <meta name="description" content="Upload your PDF notes and get intelligent summaries with interactive Q&A using our advanced AI technology." />
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
                AI PDF Study Assistant
              </h1>
            </div>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Upload your PDF study materials, get intelligent summaries, and ask questions about the content.
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

                <div className="mt-8 space-y-4">
                  <h3 className="font-semibold text-secondary-900 dark:text-white">
                    Features:
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Intelligent content analysis',
                      'Interactive Q&A with AI',
                      'Formatted study materials',
                      'Key points extraction',
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

            {/* Summary & Chat Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="card flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                    Study Assistant
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

                <div className="flex-1 flex flex-col min-h-[500px]">
                  {summary ? (
                    <div className="flex-1 flex flex-col">
                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto mb-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 max-h-96">
                        <AnimatePresence>
                          {messages.map((message, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}
                            >
                              <div className={`inline-block max-w-[85%] rounded-lg p-4 ${message.role === 'user' 
                                ? 'bg-primary-500 text-white ml-auto' 
                                : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'}`}
                              >
                                {message.type === 'summary' ? (
                                  <div className="prose dark:prose-invert max-w-none">
                                    {renderMarkdown(message.content)}
                                  </div>
                                ) : (
                                  <div className="prose dark:prose-invert max-w-none">
                                    {renderMarkdown(message.content)}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {isChatLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="inline-block bg-secondary-100 dark:bg-secondary-700 rounded-lg p-4"
                          >
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin text-secondary-500" />
                              <span className="text-secondary-500">Thinking...</span>
                            </div>
                          </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Question Input */}
                      <form onSubmit={handleAskQuestion} className="flex space-x-2">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Ask a question about the content..."
                          className="flex-1 px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                          disabled={isChatLoading}
                        />
                        <button
                          type="submit"
                          disabled={!inputValue.trim() || isChatLoading}
                          className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-secondary-50 dark:bg-secondary-800 rounded-lg p-8 text-center">
                      <MessageSquare className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                        Interactive Study Assistant
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                        Upload a PDF to get a summary and ask questions about the content.
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-secondary-500 dark:text-secondary-400">
                        <BookOpen className="w-4 h-4" />
                        <span>Ask about key concepts, definitions, or examples</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AISummarizer;