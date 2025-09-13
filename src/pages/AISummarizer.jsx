import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
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
  User,
  KeyRound,
  X
} from 'lucide-react';

// It's recommended to store API keys in environment variables for security
const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API2_KEY;
const YOUR_SITE_URL = 'https://www.rmslpu.xyz';
const YOUR_SITE_NAME = 'RMS Study Assistant';
const BACKEND_API_BASE_URL = 'https://rms-backend-taupe.vercel.app/api';

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

  // --- STATE FOR USAGE LIMITS AND VERIFICATION ---
  const [usageCount, setUsageCount] = useState({ summaries: 0, chats: 0 });
  const [isBlocked, setIsBlocked] = useState(false);
  const [rmsKey, setRmsKey] = useState('');
  const [verifiedKey, setVerifiedKey] = useState(null);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const FREE_LIMIT = 2;

  // Load usage data from localStorage on initial render
  useEffect(() => {
    const premiumStatus = localStorage.getItem('isPremiumSummarizer') === 'true';
    const storedKey = localStorage.getItem('verifiedRmsKeySummarizer');
    
    if (premiumStatus && storedKey) {
        setIsPremium(true);
        setVerifiedKey(storedKey);
    } else if (!premiumStatus) {
        const storedUsage = localStorage.getItem('summarizerUsageCount');
        if (storedUsage) {
            setUsageCount(JSON.parse(storedUsage));
        }
    }
  }, []);

  const handleVerifyKey = async (e) => {
    e.preventDefault();
    if (!rmsKey || rmsKey.length !== 6) {
      toast.error("Please enter a valid 6-digit key.");
      return;
    }
    setIsVerifyingKey(true);
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/user/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCode: rmsKey })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed.');
      }
      toast.success('Verification Successful! You now have unlimited access.');
      setIsPremium(true);
      setVerifiedKey(rmsKey);
      localStorage.setItem('isPremiumSummarizer', 'true');
      localStorage.setItem('verifiedRmsKeySummarizer', rmsKey);
      localStorage.removeItem('summarizerUsageCount');
      setIsBlocked(false);
      setRmsKey('');
    } catch (error) {
      toast.error(`Verification Failed: ${error.message}`);
    } finally {
      setIsVerifyingKey(false);
    }
  };
  
  const revalidateKey = async () => {
    if (!verifiedKey) return false;
    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/user/check-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userCode: verifiedKey })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Key re-validation failed:", error);
        return false;
    }
  };
  
  const revokePremiumAccess = () => {
    toast.error("Your key has expired. Please enter a new one.");
    setIsPremium(false);
    setVerifiedKey(null);
    localStorage.removeItem('isPremiumSummarizer');
    localStorage.removeItem('verifiedRmsKeySummarizer');
    setIsBlocked(true);
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsProcessing(false);
    setIsChatLoading(false);

    setStreamingMessage(currentStreamingMessage => {
      if (currentStreamingMessage.trim()) {
        if (streamingType === 'summary') {
          setSummary(currentStreamingMessage);
          setMessages(prev => [...prev, { role: "assistant", content: currentStreamingMessage, type: "summary" }]);
        } else {
          setMessages(prev => [...prev, { role: "assistant", content: currentStreamingMessage }]);
        }
      }
      return '';
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

  const extractTextFromPDF = async (file) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Please upload a file smaller than 10MB.");
      return Promise.reject(new Error("File size exceeds limit"));
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
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

      return new Promise((resolve, reject) => {
        const intervalId = setInterval(async () => {
          try {
            const statusResponse = await fetch(`https://python-api-totg.onrender.com/api/extraction-status/${job_id}`);

            if (!statusResponse.ok) {
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
          } catch (error) {
            clearInterval(intervalId);
            reject(error);
          }
        }, 3000);
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
    
    if (isPremium) {
        const isKeyStillValid = await revalidateKey();
        if (!isKeyStillValid) {
            revokePremiumAccess();
            return;
        }
    } else if (usageCount.summaries >= FREE_LIMIT) {
        toast.error("You've reached your free summary limit.");
        setIsBlocked(true);
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

    try {
      const pdfContent = await extractTextFromPDF(file);

      const systemPrompt = `You are an expert academic tutor and study assistant. Your task is to analyze the provided document content and generate a long, detailed, and comprehensive educational breakdown. Do not just summarize; explain the concepts as if you are teaching them to a student.

      Your output MUST follow this exact markdown structure:
      
      # In-Depth Analysis of [Auto-Detected Topic]
      
      ## 📝 Executive Summary
      (Provide a concise overview of the document's main themes and purpose in about 150-200 words. Mention the key takeaways.)
      
      ---
      
      ## 🧠 Core Concepts Explained
      (This is the most important section. Identify 3-5 main topics from the document. For each topic, provide a detailed explanation. If it's a technical or coding topic, break down the code, explain what each part does, and discuss its purpose and potential outputs. Use examples.)
      
      ### 📌 Topic 1: [Name of the First Main Topic]
      - **Definition:** Clearly define the concept.
      - **Detailed Explanation:** Elaborate on the topic with sufficient detail. Use bullet points for clarity.
      - **Example/Code Breakdown:** Provide a concrete example or code snippet from the text and explain it line-by-line.
      
      (Continue for all major topics identified...)
      
      ---
      
      ## 🔑 Key Terms and Definitions
      (List and define at least 5-10 important keywords or jargon from the document.)
      - **Term 1:** Definition.
      - **Term 2:** Definition.
      
      ---
      
      ## 💡 Study Recommendations & Potential Questions
      - **Focus Areas:** Advise the student on which sections or topics are most critical to study from this document.
      - **Potential Exam Questions:** Generate 3-4 potential exam questions (e.g., MCQ, short answer) based on the content to help the student prepare.
      
      ---
      
      ## 📚 Study Resource Links
      (Provide 3-5 high-quality, relevant external links for further study. Use Wikipedia, reputable educational websites, or high-quality YouTube tutorials. Format them EXACTLY like this:)
      - [Link Title 1](https://example.com/resource1)
      - [Link Title 2](https://example.com/resource2)

      Filter out any irrelevant noise like page numbers, headers, or footers from the source text. Your entire response should be focused on providing educational value.`;

      const messagesPayload = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please provide a comprehensive educational breakdown of the following document:\n\n${pdfContent}` }
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
          model: "deepseek/deepseek-chat-v3.1:free",
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
      let finalMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === '' || trimmedLine === 'data: [DONE]') continue;
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6);
              const data = JSON.parse(jsonStr);
              if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                const chunk = data.choices[0].delta.content;
                finalMessage += chunk;
                setStreamingMessage(prev => prev + chunk);
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
      
      setSummary(finalMessage);
      setMessages([{ role: "assistant", content: finalMessage, type: "summary" }]);
      if (!isPremium) {
          const newCount = { ...usageCount, summaries: usageCount.summaries + 1 };
          setUsageCount(newCount);
          localStorage.setItem('summarizerUsageCount', JSON.stringify(newCount));
      }
      toast.success('Summary generated successfully!');

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error generating summary:', error);
        toast.error('Error generating summary. Please try again.');
      }
    } finally {
        setIsProcessing(false);
        setIsStreaming(false);
        setStreamingMessage('');
        setStreamingType('');
        abortControllerRef.current = null;
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isChatLoading) return;
    
    if (isPremium) {
        const isKeyStillValid = await revalidateKey();
        if (!isKeyStillValid) {
            revokePremiumAccess();
            return;
        }
    } else if (usageCount.chats >= FREE_LIMIT) {
        toast.error("You've reached your free chat limit.");
        setIsBlocked(true);
        return;
    }

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
      const systemPrompt = `You are an expert academic assistant helping students with their study materials. Use markdown formatting for clear, structured responses. Keep explanations clear and educational.`;
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
      let finalMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === '' || trimmedLine === 'data: [DONE]') continue;
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6);
              const data = JSON.parse(jsonStr);
              if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                const chunk = data.choices[0].delta.content;
                finalMessage += chunk;
                setStreamingMessage(prev => prev + chunk);
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
      
      setMessages(prev => [...prev, { role: "assistant", content: finalMessage }]);
       if (!isPremium) {
          const newCount = { ...usageCount, chats: usageCount.chats + 1 };
          setUsageCount(newCount);
          localStorage.setItem('summarizerUsageCount', JSON.stringify(newCount));
      }

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error getting response:', error);
            toast.error('Error getting response. Please try again.');
            setMessages(prev => prev.slice(0, -1)); // Remove the user's message on failure
        }
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
    const noBoldContent = content.replace(/\*\*/g, ''); // Remove bold markdown
    const parts = noBoldContent.split(/(```[\s\S]*?```)/g);
  
    const renderLineWithLinks = (line, key) => {
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      const lineParts = line.split(linkRegex);
  
      return (
        <>
          {lineParts.map((part, index) => {
            if (index % 3 === 1) { // Link text
              const url = lineParts[index + 1];
              return (
                <a key={`${key}-${index}`} href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                  {part}
                </a>
              );
            }
            if (index % 3 === 2) { // URL, skip
              return null;
            }
            return part; // Regular text
          })}
        </>
      );
    };
  
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```(\w*\n)?/g, '').replace(/```$/, '').trim();
        return (
          <pre key={i} className="bg-gray-800 text-white font-mono text-sm p-4 my-3 rounded-md overflow-x-auto">
            <code>{code}</code>
          </pre>
        );
      } else {
        return part.split('\n').map((line, j) => {
          const key = `${i}-${j}`;
          if (line.startsWith('# ')) {
            return <h1 key={key} className="text-2xl font-bold mt-8 mb-4 text-primary-800 dark:text-primary-200 border-b border-secondary-200 dark:border-secondary-700 pb-2">{renderLineWithLinks(line.substring(2), key)}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={key} className="text-xl font-bold mt-6 mb-3 text-secondary-800 dark:text-secondary-200">{renderLineWithLinks(line.substring(3), key)}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={key} className="text-lg font-bold mt-5 mb-2 text-secondary-700 dark:text-secondary-300">{renderLineWithLinks(line.substring(4), key)}</h3>;
          }
          if (line.startsWith('- ')) {
            return <li key={key} className="ml-6 mb-2 text-secondary-700 dark:text-secondary-300 pl-2 border-l-2 border-primary-100 dark:border-primary-900">{renderLineWithLinks(line.substring(2), key)}</li>;
          }
          if (line.match(/^\d+\./)) {
            return <li key={key} className="ml-6 mb-2 text-secondary-700 dark:text-secondary-300 pl-2 border-l-2 border-primary-100 dark:border-primary-900">{renderLineWithLinks(line.replace(/^\d+\.\s*/, ''), key)}</li>;
          }
          if (line.startsWith('> ')) {
            return <blockquote key={key} className="border-l-4 border-primary-400 dark:border-primary-600 pl-4 py-2 my-4 bg-primary-50 dark:bg-primary-900/20 rounded-r text-secondary-700 dark:text-secondary-300 italic">{renderLineWithLinks(line.substring(2), key)}</blockquote>;
          }
          if (line.trim() === '') {
            return <div key={key} className="my-3"></div>;
          }
          return <p key={key} className="my-3 text-secondary-700 dark:text-secondary-300 leading-relaxed">{renderLineWithLinks(line, key)}</p>;
        });
      }
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

  const VerificationModal = () => (
    <AnimatePresence>
        {isBlocked && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-secondary-800 rounded-2xl p-8 shadow-xl max-w-md w-full relative"
                >
                    <button onClick={() => setIsBlocked(false)} className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600">
                        <X size={24} />
                    </button>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Free Limit Reached</h2>
                        <p className="text-secondary-600 dark:text-secondary-400 mt-2 mb-6">
                            Please enter your RMS Key for unlimited access.
                        </p>
                        <form onSubmit={handleVerifyKey} className="space-y-4">
                            <input
                                type="text"
                                value={rmsKey}
                                onChange={(e) => setRmsKey(e.target.value.replace(/\D/g, ''))}
                                maxLength="6"
                                className="w-full text-center text-xl font-mono tracking-widest px-4 py-2 bg-secondary-100 dark:bg-secondary-700 border-2 border-secondary-200 dark:border-secondary-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="_ _ _ _ _ _"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isVerifyingKey}
                                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                {isVerifyingKey ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Unlock Now</span>}
                            </button>
                        </form>
                        <p className="text-xs text-center text-secondary-500 mt-4">
                            Don't have a key? <a href="/GetRMSKey" className="text-primary-600 hover:underline">Get one here</a>.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );

  return (
    <HelmetProvider>
      <Helmet>
        <title>AI PDF Summarizer | RMS - Intelligent Study Assistant</title>
        <meta name="description" content="Upload your PDF notes and get intelligent summaries with interactive Q&A using our advanced AI technology." />
      </Helmet>
      <Toaster position="top-center" reverseOrder={false} />
      <VerificationModal />

      <div className="pt-16 min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white">
                AI PDF Study Assistant
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Upload your PDF study materials, get intelligent summaries, and ask questions about the content.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="card lg:sticky lg:top-24">
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
                  className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
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
                 {!isPremium && (
                    <div className="mt-4 text-center text-sm text-secondary-500 dark:text-secondary-400">
                        <p>Summaries left: {Math.max(0, FREE_LIMIT - usageCount.summaries)}</p>
                        <p>Chats left: {Math.max(0, FREE_LIMIT - usageCount.chats)}</p>
                    </div>
                )}
                  <div className="mt-6 sm:mt-8 space-y-4">
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
              className="lg:col-span-3"
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

                <div className="flex-1 flex flex-col min-h-[60vh] sm:min-h-[70vh]">
                  {summary || streamingMessage || messages.length > 0 ? (
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1 overflow-y-auto mb-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg p-2 sm:p-4">
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
                                <div className="prose dark:prose-invert max-w-none">
                                  {renderMarkdown(message.content)}
                                </div>
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
                      <form onSubmit={handleAskQuestion} className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={`Ask a question about the content... ${isStreaming && streamingType === 'chat' ? '- Streaming...' : ''}`}
                          className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-base"
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
    </HelmetProvider>
  );
};

export default AISummarizer;
