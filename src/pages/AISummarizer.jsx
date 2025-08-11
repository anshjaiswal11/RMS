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
  BookOpen,
  Square,
  Bot,
  User
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
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingType, setStreamingType] = useState(''); // 'summary' or 'chat'
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Stop streaming function
  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsProcessing(false);
    setIsChatLoading(false);

    // Add the partial message if it exists using current state
    setStreamingMessage(currentStreamingMessage => {
      if (currentStreamingMessage.trim()) {
        if (streamingType === 'summary') {
          setSummary(currentStreamingMessage);
          setMessages(prev => [...prev, { role: "assistant", content: currentStreamingMessage, type: "summary" }]);
        } else {
          setMessages(prev => [...prev, { role: "assistant", content: currentStreamingMessage }]);
        }
      }
      return ''; // Clear streaming message
    });
    setStreamingType('');
  };

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && (uploadedFile.type === 'application/pdf' || uploadedFile.name.endsWith('.docx'))) {
      setFile(uploadedFile);
      toast.success('File uploaded successfully!');
    } else {
      toast.error('Please upload a valid PDF or DOCX file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  // **UPDATED FUNCTION TO USE POLLING**
  const extractTextFromPDF = async (file) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Please upload a file smaller than 10MB.");
      return Promise.reject(new Error("File size exceeds limit"));
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // STEP 1: Start the extraction job and get a job ID
      const startResponse = await fetch("https://python-api-totg.onrender.com/api/start-extraction", {
        method: "POST",
        body: formData,
      });

      if (startResponse.status !== 202) {
        const errorData = await startResponse.json();
        throw new Error(errorData.error || `Failed to start job. Status: ${startResponse.status}`);
      }

      const { job_id } = await startResponse.json();
      toast.success("Processing started! This may take a moment for large files.");

      // STEP 2: Poll for the result using the job ID
      return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
          try {
            const statusResponse = await fetch(`https://python-api-totg.onrender.com/api/extraction-status/${job_id}`);

            if (!statusResponse.ok) {
              // Stop polling if the status check fails
              clearInterval(intervalId);
              reject(new Error(`Failed to get job status. Status: ${statusResponse.status}`));
              return;
            }

            const data = await statusResponse.json();

            if (data.status === 'complete') {
              clearInterval(intervalId);
              if (data.text) {
                resolve(data.text);
              } else {
                reject(new Error("Extraction completed but no text was returned."));
              }
            } else if (data.status === 'failed') {
              clearInterval(intervalId);
              reject(new Error(data.error || "File processing failed on the server."));
            }
            // If status is 'processing', do nothing and let the interval continue.

          } catch (error) {
            clearInterval(intervalId);
            reject(error);
          }
        }, 3000); // Poll every 3 seconds
      });

    } catch (error) {
      console.error("Error in extraction process:", error);
      toast.error(error.message || "Failed to process PDF. Please try again.");
      throw error;
    }
  };


  const handleSummarize = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setIsStreaming(true);
    setStreamingType('summary');
    setUploadProgress(0);
    setSummary('');
    setMessages([]);
    setStreamingMessage('');

    abortControllerRef.current = new AbortController();

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

      const systemPrompt = `You are an intelligent academic assistant specialized in analyzing student-uploaded notes (PDFs, images, text). Your goal is to:

Identify and understand the main subject or topic of the uploaded material.

Ignore or filter out irrelevant, noisy, or unrelated content (e.g., watermarks, ads, page numbers, generic website footers, repeated headers, unrelated doodles).

Extract only educational content that aligns with what the student needs to study.

Automatically detect if the content is from handwritten or printed notes, and adapt your parsing accordingly.

Present the summary in a clean markdown format using the structure below.

Summary of [Document Name / Topic Auto-Detected]
Key Points (100–200 words):
Briefly outline the main arguments, concepts, or findings

Mention any diagrams, formulas, or case studies involved

Focus only on the core learning content

Detailed Description (300–400 words):
📌 Concept 1: [Topic]
Explain in simple academic language

Add formulas/examples if necessary

📌 Concept 2: [Topic]
Continue explaining with structure

💡 Use bullets and short paragraphs for clarity

Important Definitions:
Term: Definition
Another Term: Explanation

Study Recommendations:
Focus on these key sections while revising

Suggested exam question types (MCQ, short answer, long form)

Mnemonics, tricks, or concept maps if applicable

Notes:
Any assumptions, skipped sections (and why), or context (e.g., "Chapter seems incomplete," or "Content refers to a diagram not included")`;

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
          temperature: 0.7,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine === '') continue;
            if (trimmedLine === 'data: [DONE]') {
              setIsStreaming(false);
              setIsProcessing(false);
              setUploadProgress(100);

              setStreamingMessage(currentStreamingMessage => {
                if (currentStreamingMessage.trim()) {
                  setSummary(currentStreamingMessage);
                  setMessages(prev => [...prev, { role: "assistant", content: currentStreamingMessage, type: "summary" }]);
                }
                return '';
              });

              toast.success('Summary generated successfully!');
              return;
            }

            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonStr = trimmedLine.slice(6);
                const data = JSON.parse(jsonStr);

                if (data.choices && data.choices[0] && data.choices[0].delta) {
                  const delta = data.choices[0].delta;

                  if (delta.content) {
                    setStreamingMessage(prev => prev + delta.content);
                  }

                  if (data.choices[0].finish_reason === 'stop') {
                    setIsStreaming(false);
                    setIsProcessing(false);
                    setUploadProgress(100);

                    setStreamingMessage(currentStreamingMessage => {
                      const finalMessage = currentStreamingMessage + (delta.content || '');
                      if (finalMessage.trim()) {
                        setSummary(finalMessage);
                        setMessages(prev => [...prev, { role: "assistant", content: finalMessage, type: "summary" }]);
                      }
                      return '';
                    });

                    toast.success('Summary generated successfully!');
                    return;
                  }
                }
              } catch (parseError) {
                console.error('Error parsing streaming data:', parseError);
              }
            }
          }
        }
      } catch (readError) {
        if (readError.name === 'AbortError') {
          console.log('Stream aborted by user');
          return;
        }
        throw readError;
      } finally {
        setStreamingMessage(currentStreamingMessage => {
          if (currentStreamingMessage.trim()) {
            setSummary(currentStreamingMessage);
            setMessages(prev => [...prev, { role: "assistant", content: currentStreamingMessage, type: "summary" }]);
          }
          return '';
        });
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted by user');
        return;
      }

      console.error('Error generating summary:', error);
      toast.error('Error generating summary. Please try again.');
    } finally {
      setIsProcessing(false);
      setIsStreaming(false);
      setStreamingMessage('');
      setStreamingType('');
      abortControllerRef.current = null;
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
    setIsStreaming(true);
    setStreamingType('chat');
    setStreamingMessage('');

    abortControllerRef.current = new AbortController();

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
          temperature: 0.7,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine === '') continue;
            if (trimmedLine === 'data: [DONE]') {
              setIsStreaming(false);
              setIsChatLoading(false);

              setStreamingMessage(currentStreamingMessage => {
                if (currentStreamingMessage.trim()) {
                  setMessages(prev => [...prev, { role: "assistant", content: currentStreamingMessage }]);
                }
                return '';
              });
              return;
            }

            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonStr = trimmedLine.slice(6);
                const data = JSON.parse(jsonStr);

                if (data.choices && data.choices[0] && data.choices[0].delta) {
                  const delta = data.choices[0].delta;

                  if (delta.content) {
                    setStreamingMessage(prev => prev + delta.content);
                  }

                  if (data.choices[0].finish_reason === 'stop') {
                    setIsStreaming(false);
                    setIsChatLoading(false);

                    setStreamingMessage(currentStreamingMessage => {
                      const finalMessage = currentStreamingMessage + (delta.content || '');
                      if (finalMessage.trim()) {
                        setMessages(prev => [...prev, { role: "assistant", content: finalMessage }]);
                      }
                      return '';
                    });
                    return;
                  }
                }
              } catch (parseError) {
                console.error('Error parsing streaming data:', parseError);
              }
            }
          }
        }
      } catch (readError) {
        if (readError.name === 'AbortError') {
          console.log('Stream aborted by user');
          return;
        }
        throw readError;
      } finally {
        setStreamingMessage(currentStreamingMessage => {
          if (currentStreamingMessage.trim()) {
            setMessages(prev => [...prev, { role: "assistant", content: currentStreamingMessage }]);
          }
          return '';
        });
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted by user');
        return;
      }

      console.error('Error getting response:', error);
      toast.error('Error getting response. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsChatLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
      setStreamingType('');
      abortControllerRef.current = null;
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
    a.download = `summary_${file?.name.replace(/\.[^/.]+$/, "") || 'summary'}.md`;
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
        if (line.trim() === '') {
          return <div key={i} className="my-3"></div>;
        }
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

  const clearChat = () => {
    if (isStreaming) {
      stopStreaming();
    }
    setMessages([]);
    setSummary('');
    setStreamingMessage('');
    toast.success('Chat cleared successfully!');
  };

  return (
    <>
      <Helmet>
        <title>AI PDF Summarizer | RMS - Intelligent Study Assistant</title>
        <meta name="description" content="Upload your PDF notes and get intelligent summaries with interactive Q&A using our advanced AI technology." />
      </Helmet>

      <div className="pt-16 min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                    Upload Your File
                  </h2>
                  {(summary || streamingMessage) && (
                    <button
                      onClick={clearChat}
                      className="text-sm text-secondary-500 hover:text-primary-500 dark:text-secondary-400 dark:hover:text-primary-400"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-secondary-300 dark:border-secondary-600 hover:border-primary-500 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                    }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-primary-600 dark:text-primary-400 font-medium">
                      Drop the file here...
                    </p>
                  ) : (
                    <div>
                      <p className="text-secondary-600 dark:text-secondary-400 mb-2">
                        Drag & drop a file here, or click to select
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-500">
                        Supports PDF and DOCX files up to 10MB
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
                        {isStreaming ? 'Generating Summary...' : 'Processing...'}
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
                  {isStreaming && streamingType === 'summary' ? (
                    <button
                      onClick={stopStreaming}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Square className="w-5 h-5" />
                      <span>Stop Generating</span>
                    </button>
                  ) : (
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
                  )}
                </div>
                <div className="mt-8 space-y-4">
                  <h3 className="font-semibold text-secondary-900 dark:text-white">
                    Features:
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Real-time streaming responses',
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
                  {summary || streamingMessage ? (
                    <div className="flex-1 flex flex-col">
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
                                <div className="flex items-center mb-2">
                                  {message.role === 'user' ? (
                                    <User className="w-4 h-4 mr-2" />
                                  ) : (
                                    <Bot className="w-4 h-4 mr-2" />
                                  )}
                                  <span className="text-xs font-medium opacity-80">
                                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                                  </span>
                                </div>
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
                          {streamingMessage && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mb-4"
                            >
                              <div className="inline-block max-w-[85%] rounded-lg p-4 bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200">
                                <div className="flex items-center mb-2">
                                  <Bot className="w-4 h-4 mr-2" />
                                  <span className="text-xs font-medium opacity-80 flex items-center">
                                    AI Assistant
                                    <span className="ml-2 flex items-center">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                      <span className="ml-1 text-green-600 dark:text-green-400">Live</span>
                                    </span>
                                  </span>
                                </div>
                                <div className="prose dark:prose-invert max-w-none">
                                  {renderMarkdown(streamingMessage)}
                                  <span className="inline-block w-2 h-5 bg-primary-500 animate-pulse ml-1"></span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {isChatLoading && !streamingMessage && (
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
                      <form onSubmit={handleAskQuestion} className="flex space-x-2">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={`Ask a question about the content... ${isStreaming && streamingType === 'chat' ? '- Streaming...' : ''}`}
                          className="flex-1 px-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                          disabled={isChatLoading}
                        />
                        {isStreaming && streamingType === 'chat' ? (
                          <button
                            type="button"
                            onClick={stopStreaming}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                            title="Stop streaming"
                          >
                            <Square className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            type="submit"
                            disabled={!inputValue.trim() || isChatLoading}
                            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        )}
                      </form>
                      {isStreaming && streamingType === 'chat' && (
                        <div className="mt-2 text-xs text-center text-green-600 dark:text-green-400 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></div>
                          Streaming live response...
                        </div>
                      )}
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
                      <div className="mt-4 grid grid-cols-1 gap-2 w-full max-w-md">
                        {[
                          "What are the main concepts covered?",
                          "Explain this topic in simple terms",
                          "Create practice questions for me"
                        ].map((example, index) => (
                          <div
                            key={index}
                            className="p-3 bg-secondary-100 dark:bg-secondary-700 rounded-lg text-left"
                          >
                            <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                              "{example}"
                            </p>
                          </div>
                        ))}
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
