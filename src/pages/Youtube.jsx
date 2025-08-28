import React, { useState, useRef, useEffect } from 'react';
import {
  Youtube,
  Brain,
  Download,
  Copy,
  Loader2,
  Sparkles,
  CheckCircle,
  Send,
  MessageSquare,
  BookOpen,
  Square,
  Bot,
  User,
  Play,
  Clock,
  FileText,
  HelpCircle,
  Link,
  Zap,
  AlertTriangle,
  Construction,
  Briefcase,
  Mail,
  X
} from 'lucide-react';
import { Supadata } from "@supadata/js";

const YouTubeSummarizer = () => {
  const [showDevelopmentPopup, setShowDevelopmentPopup] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingType, setStreamingType] = useState('');
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const messagesEndRef = useRef(null);

  const DevelopmentPopup = () => {
    if (!showDevelopmentPopup) return null;

    const features = [
      { name: 'AI PDF Summarizer', path: '/ai-summarizer', icon: FileText },
      { name: 'Study Assistant', path: '/RMS-AI', icon: Brain },
      { name: 'Interview Prep', path: '/interview-prep', icon: MessageSquare },
      { name: 'Career Platform', path: '/ai-career-platform', icon: Zap },
      { name: 'Test Generator', path: '/test-generator', icon: HelpCircle }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6 relative flex flex-col">
          {/* Close Button */}
          <button
            onClick={() => setShowDevelopmentPopup(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Construction className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">YouTube Summarizer Under Development</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">This feature will be available soon!</p>
            </div>
          </div>

          {/* Info Text */}
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
            We're working hard to bring you this exciting functionality. Meanwhile, try these other features:
          </p>

          {/* Feature Links */}
          <div className="grid gap-3 mb-6">
            {features.map((feature) => (
              <a
                key={feature.path}
                href={feature.path}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
              >
                <feature.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-white text-sm">{feature.name}</span>
              </a>
            ))}
          </div>

          {/* Contact Button */}
          <a
            href="/contact"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-2"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Us
          </a>

          {/* Continue Button */}
          <button
            onClick={() => setShowDevelopmentPopup(false)}
            className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Toast notifications
  const showToast = (message, type = 'success') => {
    console.log(`Toast (${type}): ${message}`);
    if (type === 'error') {
      setError(message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get YouTube video data using YouTube oEmbed API
  const getVideoData = async (videoId) => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!response.ok) throw new Error('Video not found or unavailable');

      const data = await response.json();
      return {
        title: data.title,
        channel: data.author_name,
        thumbnail: data.thumbnail_url,
        videoId: videoId
      };
    } catch (error) {
      console.error('Error fetching video data:', error);
      throw new Error('Failed to fetch video information. Please check if the video exists and is public.');
    }
  };

  // Get video transcript
  const supadata = new Supadata({
    apiKey: "sd_662cba02300b940f5cb02c328c721f6a",
  });

  // Updated getVideoTranscript function using Supadata
  const getVideoTranscript = async (videoId) => {
    try {
      setCurrentStep(`Fetching transcript via Supadata...`);
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      const transcriptResult = await supadata.transcript({
        url: videoUrl,
        lang: "en",
        text: true,
        mode: "auto"
      });

      if (!transcriptResult.text?.trim()) {
        throw new Error('No transcript found for this video. Please try a video with captions/subtitles enabled.');
      }

      return transcriptResult.text.trim();

    } catch (error) {
      console.error('Error fetching transcript:', error);
      throw new Error(error.message || "Failed to fetch transcript using Supadata API");
    }
  };

  // Call OpenRouter API
  const callOpenRouterAPI = async (messages, systemPrompt = '') => {
    if (!openRouterApiKey.trim()) {
      throw new Error('RMS API key is required. Please add your API key.');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'YouTube Lecture Analyzer'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...messages
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response;
  };

  // Stream response from OpenRouter
  const streamOpenRouterResponse = async (messages, systemPrompt, onToken, onComplete) => {
    try {
      const response = await callOpenRouterAPI(messages, systemPrompt);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onToken(content);
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }

      onComplete(fullContent);
    } catch (error) {
      throw error;
    }
  };

  // Parse MCQ questions from text
  const parseMCQFromText = (text) => {
    const questions = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    let currentQuestion = null;

    for (let line of lines) {
      if (line.match(/^\d+\./) || line.match(/^Question \d+:/i)) {
        if (currentQuestion && currentQuestion.options.length > 0) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question: line.replace(/^\d+\.\s*/, '').replace(/^Question \d+:\s*/i, ''),
          options: [],
          correctAnswer: ''
        };
      } else if (line.match(/^[A-D][\.\)]/)) {
        if (currentQuestion) {
          const optionText = line.substring(2).trim();
          currentQuestion.options.push(optionText);
        }
      } else if (line.toLowerCase().startsWith('answer:') || line.toLowerCase().startsWith('correct answer:')) {
        if (currentQuestion) {
          const answerMatch = line.match(/[A-D]/);
          if (answerMatch) {
            currentQuestion.correctAnswer = answerMatch[0];
          }
        }
      } else if (currentQuestion && !currentQuestion.question.includes(line) && line.length > 10) {
        // This might be a continuation of the question
        currentQuestion.question += ' ' + line;
      }
    }

    if (currentQuestion && currentQuestion.options.length > 0) {
      questions.push(currentQuestion);
    }

    return questions.filter(q => q.options.length >= 4);
  };

  const handleAnalyzeVideo = async () => {
    if (!youtubeUrl.trim()) {
      showToast('Please enter a YouTube URL.', 'error');
      return;
    }

    if (!openRouterApiKey.trim()) {
      showToast('Please enter your RMS API key.', 'error');
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      showToast('Please enter a valid YouTube URL.', 'error');
      return;
    }

    setIsProcessing(true);
    setIsStreaming(true);
    setStreamingType('summary');
    setCurrentStep('Initializing...');
    setSummary('');
    setMcqQuestions([]);
    setMessages([]);
    setStreamingMessage('');
    setError('');
    setTranscript('');

    try {
      // Get video data
      setCurrentStep('Fetching video information...');
      const videoInfo = await getVideoData(videoId);
      setVideoData(videoInfo);

      // Get transcript
      setCurrentStep('Extracting transcript...');
      const videoTranscript = await getVideoTranscript(videoId);
      setTranscript(videoTranscript);

      // Generate summary with streaming
      setCurrentStep('Generating summary...');
      const summaryPrompt = `You are an expert educational content analyzer. Please create a comprehensive summary of this YouTube lecture transcript.

Create a detailed summary with the following structure:
# Lecture Summary: [Extract and use the main topic]

## Key Learning Objectives
- List 4-6 main learning objectives from the content

## Core Concepts (300-500 words)
Provide a detailed explanation of the main concepts covered in the lecture. Make it comprehensive but accessible.

## Important Definitions
List and define key terms and concepts mentioned in the lecture.

## Key Points & Takeaways
- List the most important points students should remember
- Include any formulas, processes, or methodologies mentioned

## Study Notes
Provide specific study recommendations and areas students should focus on.

## Recommended Follow-up
Suggest next steps for learning and additional topics to explore.

Please make the summary educational and well-structured for study purposes.`;

      await streamOpenRouterResponse(
        [{ role: 'user', content: `${summaryPrompt}\n\nTranscript:\n${videoTranscript}` }],
        'You are an expert educational content analyzer specializing in creating comprehensive study materials from lecture content.',
        (token) => {
          setStreamingMessage(prev => prev + token);
        },
        (fullContent) => {
          setSummary(fullContent);
          setMessages(prev => [...prev, { role: "assistant", content: fullContent, type: "summary" }]);
          setStreamingMessage('');

          // Start MCQ generation
          setTimeout(() => generateMCQQuestions(videoTranscript), 1000);
        }
      );

    } catch (error) {
      console.error('Error analyzing video:', error);
      showToast(error.message || 'Error analyzing video. Please try again.', 'error');
      setIsProcessing(false);
      setIsStreaming(false);
      setCurrentStep('');
    }
  };

  const generateMCQQuestions = async (transcript) => {
    setStreamingType('mcq');
    setCurrentStep('Generating practice questions...');
    setStreamingMessage('');

    try {
      const mcqPrompt = `Based on the following lecture transcript, create exactly 10 multiple choice questions for student practice.

Format each question EXACTLY as follows:
1. [Question text]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]
Answer: [Correct letter]

Make sure questions:
- Test understanding of key concepts
- Are clearly worded and unambiguous
- Have 4 distinct options
- Cover different aspects of the lecture
- Include both factual and conceptual questions
- Are appropriate for the academic level of the content

Transcript: ${transcript}`;

      await streamOpenRouterResponse(
        [{ role: 'user', content: mcqPrompt }],
        'You are an expert educational assessment creator. Generate high-quality multiple choice questions that effectively test student understanding.',
        (token) => {
          setStreamingMessage(prev => prev + token);
        },
        (fullContent) => {
          const questions = parseMCQFromText(fullContent);
          setMcqQuestions(questions);
          setMessages(prev => [...prev, { role: "assistant", content: fullContent, type: "mcq" }]);
          setStreamingMessage('');
          setCurrentStep('Analysis complete!');
          setIsStreaming(false);
          setIsProcessing(false);
          setStreamingType('');
          showToast(`Analysis complete! Generated summary and ${questions.length} MCQ questions.`);
        }
      );

    } catch (error) {
      console.error('Error generating MCQ questions:', error);
      showToast(error.message || 'Error generating MCQ questions. Please try again.', 'error');
      setIsProcessing(false);
      setIsStreaming(false);
      setCurrentStep('');
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isChatLoading || !transcript) return;

    if (!openRouterApiKey.trim()) {
      showToast(' RMS API key is required for chat functionality.', 'error');
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

    try {
      const chatPrompt = `You are an AI tutor helping students understand lecture content. Answer the student's question based on the lecture transcript provided.

Be helpful, educational, and accurate. If the question isn't directly covered in the transcript, acknowledge this and provide general educational guidance.

Student Question: ${inputValue}

Lecture Transcript: ${transcript}`;

      await streamOpenRouterResponse(
        [{ role: 'user', content: chatPrompt }],
        'You are a helpful AI tutor specializing in explaining lecture content to students.',
        (token) => {
          setStreamingMessage(prev => prev + token);
        },
        (fullContent) => {
          setMessages(prev => [...prev, { role: "assistant", content: fullContent }]);
          setStreamingMessage('');
          setIsStreaming(false);
          setIsChatLoading(false);
          setStreamingType('');
        }
      );

    } catch (error) {
      console.error('Error getting chat response:', error);
      showToast(error.message || 'Error getting response. Please try again.', 'error');
      setMessages(prev => prev.slice(0, -1));
      setIsChatLoading(false);
      setIsStreaming(false);
      setStreamingType('');
    }
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setIsProcessing(false);
    setIsChatLoading(false);

    if (streamingMessage.trim()) {
      if (streamingType === 'summary') {
        setSummary(streamingMessage);
        setMessages(prev => [...prev, { role: "assistant", content: streamingMessage, type: "summary" }]);
      } else if (streamingType === 'mcq') {
        setMcqQuestions(parseMCQFromText(streamingMessage));
        setMessages(prev => [...prev, { role: "assistant", content: streamingMessage, type: "mcq" }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: streamingMessage }]);
      }
    }
    setStreamingMessage('');
    setStreamingType('');
    setCurrentStep('Stopped by user');
  };

  const handleCopySummary = async () => {
    try {
      const content = `${summary}\n\n## MCQ Questions\n\n${mcqQuestions.map((q, i) =>
        `${i + 1}. ${q.question}\nA. ${q.options[0]}\nB. ${q.options[1]}\nC. ${q.options[2]}\nD. ${q.options[3]}\nAnswer: ${q.correctAnswer}\n`
      ).join('\n')}`;

      await navigator.clipboard.writeText(content);
      showToast('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownloadSummary = () => {
    const content = `# YouTube Lecture Summary\n\n${summary}\n\n## MCQ Questions\n\n${mcqQuestions.map((q, i) =>
      `${i + 1}. ${q.question}\nA. ${q.options[0]}\nB. ${q.options[1]}\nC. ${q.options[2]}\nD. ${q.options[3]}\nAnswer: ${q.correctAnswer}\n`
    ).join('\n')}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube_summary_${videoData?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Summary downloaded successfully!');
  };

  const renderMarkdown = (content) => {
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) {
          return (
            <h1 key={i} className="text-2xl font-bold mt-8 mb-4 text-blue-800 border-b border-gray-200 pb-2">
              {line.substring(2)}
            </h1>
          );
        }

        if (line.startsWith('## ')) {
          return (
            <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-gray-800">
              {line.substring(3)}
            </h2>
          );
        }

        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="text-lg font-bold mt-5 mb-2 text-gray-700">
              {line.substring(4)}
            </h3>
          );
        }

        if (line.startsWith('- ')) {
          return (
            <li key={i} className="ml-6 mb-2 text-gray-700 pl-2 border-l-2 border-blue-100">
              {line.substring(2)}
            </li>
          );
        }

        if (line.match(/^\d+\./)) {
          return (
            <li key={i} className="ml-6 mb-2 text-gray-700 pl-2 border-l-2 border-blue-100">
              {line.replace(/^\d+\.\s*/, '')}
            </li>
          );
        }

        if (line.includes('**')) {
          const parts = line.split('**');
          return (
            <p key={i} className="my-3 text-gray-700 leading-relaxed">
              {parts.map((part, idx) =>
                idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
              )}
            </p>
          );
        }

        if (line.trim() === '') {
          return <div key={i} className="my-3"></div>;
        }

        return (
          <p key={i} className="my-3 text-gray-700 leading-relaxed">
            {line}
          </p>
        );
      });
  };

  const clearAll = () => {
    if (isStreaming) {
      stopStreaming();
    }
    setMessages([]);
    setSummary('');
    setMcqQuestions([]);
    setVideoData(null);
    setYoutubeUrl('');
    setTranscript('');
    setStreamingMessage('');
    setCurrentStep('');
    setError('');
    showToast('All content cleared successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Development Popup */}
      <DevelopmentPopup />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              YouTube Lecture Analyzer
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real YouTube transcript analysis with AI-powered summaries and practice questions using RMS API.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Link className="w-6 h-6 mr-2" />
                  Setup & URL
                </h2>
                {(summary || streamingMessage || videoData) && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-gray-500 hover:text-blue-500"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* API Key Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RMS API Key
                  </label>
                  <input
                    type="password"
                    value={openRouterApiKey}
                    onChange={(e) => setOpenRouterApiKey(e.target.value)}
                    placeholder="Enter your RMS API key..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get your RMS API key at <a href="/GetRMSKey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">GetRMSKey</a>
                  </p>
                </div>

                {/* YouTube URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Paste YouTube video URL here... (e.g., https://youtube.com/watch?v=...)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    disabled={isProcessing}
                  />
                </div>

                {videoData && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <img
                        src={videoData.thumbnail}
                        alt="Video thumbnail"
                        className="w-24 h-18 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-green-800 mb-1">
                          {videoData.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-green-600">
                          <span>{videoData.channel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isStreaming && streamingType === 'summary' ? (
                  <button
                    onClick={stopStreaming}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Square className="w-5 h-5" />
                    <span>Stop Analysis</span>
                  </button>
                ) : (
                  <button
                    onClick={handleAnalyzeVideo}
                    disabled={!youtubeUrl.trim() || !openRouterApiKey.trim() || isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Analyze Video</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Processing Status */}
              {isProcessing && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Analysis Progress
                    </span>
                    <span className="text-sm text-gray-500">
                      {currentStep}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className={`flex items-center space-x-2 text-sm ${currentStep.includes('summary') ? 'text-blue-600' :
                        summary ? 'text-green-600' : 'text-gray-500'
                      }`}>
                      <div className={`w-4 h-4 rounded-full ${currentStep.includes('summary') ? 'bg-blue-500 animate-pulse' :
                          summary ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      <span>Summary Generation</span>
                    </div>

                    <div className={`flex items-center space-x-2 text-sm ${currentStep.includes('questions') ? 'text-blue-600' :
                        mcqQuestions.length > 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                      <div className={`w-4 h-4 rounded-full ${currentStep.includes('questions') ? 'bg-blue-500 animate-pulse' :
                          mcqQuestions.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      <span>MCQ Questions (10)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Streaming Status */}
              {isStreaming && (
                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-sm font-medium">
                        {streamingType === 'summary' ? 'Streaming Summary...' :
                          streamingType === 'mcq' ? 'Generating MCQ Questions...' :
                            streamingType === 'chat' ? 'Streaming Response...' : 'Processing...'}
                      </span>
                    </div>
                    <button
                      onClick={stopStreaming}
                      className="text-green-700 hover:text-green-800"
                      title="Stop streaming"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-gray-900">Features:</h3>
                <div className="space-y-3">
                  {[
                    'Real YouTube transcript extraction',
                    'AI-powered comprehensive summaries',
                    '10 MCQ practice questions',
                    'Interactive AI chat about content',
                    'Key concepts and definitions',
                    'Study recommendations',
                    'Download summaries & questions',
                    'Copy content to clipboard',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Brain className="w-6 h-6 mr-2" />
                  Study Content
                </h2>
                {(summary || mcqQuestions.length > 0) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopySummary}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDownloadSummary}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Download content"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col min-h-[500px]">
                {summary || streamingMessage || messages.length > 0 ? (
                  <div className="flex-1 flex flex-col">
                    {/* Content Display */}
                    <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4 max-h-96">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`mb-6 ${message.role === 'user' ? 'text-right' : ''}`}
                        >
                          <div className={`inline-block max-w-[95%] rounded-lg p-4 ${message.role === 'user'
                              ? 'bg-blue-500 text-white ml-auto'
                              : 'bg-gray-100 text-gray-800'}`}
                          >
                            {/* Message Header */}
                            <div className="flex items-center mb-3">
                              {message.role === 'user' ? (
                                <User className="w-4 h-4 mr-2" />
                              ) : (
                                <>
                                  {message.type === 'summary' ? <FileText className="w-4 h-4 mr-2" /> :
                                    message.type === 'mcq' ? <HelpCircle className="w-4 h-4 mr-2" /> :
                                      <Bot className="w-4 h-4 mr-2" />}
                                </>
                              )}
                              <span className="text-xs font-medium opacity-80">
                                {message.role === 'user' ? 'You' :
                                  message.type === 'summary' ? 'Summary Generated' :
                                    message.type === 'mcq' ? 'MCQ Questions' : 'AI Assistant'}
                              </span>
                            </div>

                            {/* Message Content */}
                            {message.type === 'mcq' ? (
                              <div className="space-y-4">
                                <h3 className="font-bold text-lg mb-4">Practice Questions ({mcqQuestions.length})</h3>
                                {mcqQuestions.map((question, qIndex) => (
                                  <div key={qIndex} className="bg-white p-4 rounded-lg border">
                                    <h4 className="font-semibold mb-3">
                                      {qIndex + 1}. {question.question}
                                    </h4>
                                    <div className="space-y-2">
                                      {question.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-start space-x-2">
                                          <span className="font-medium min-w-[20px] mt-0.5">
                                            {String.fromCharCode(65 + oIndex)}.
                                          </span>
                                          <span>{option}</span>
                                        </div>
                                      ))}
                                    </div>
                                    {question.correctAnswer && (
                                      <div className="mt-3 pt-2 border-t text-sm">
                                        <span className="font-medium text-green-700">
                                          Answer: {question.correctAnswer}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="prose max-w-none">
                                {renderMarkdown(message.content)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Streaming Message */}
                      {streamingMessage && (
                        <div className="mb-6">
                          <div className="inline-block max-w-[95%] rounded-lg p-4 bg-gray-100 text-gray-800">
                            <div className="flex items-center mb-3">
                              {streamingType === 'summary' ? <FileText className="w-4 h-4 mr-2" /> :
                                streamingType === 'mcq' ? <HelpCircle className="w-4 h-4 mr-2" /> :
                                  <Bot className="w-4 h-4 mr-2" />}
                              <span className="text-xs font-medium opacity-80 flex items-center">
                                {streamingType === 'summary' ? 'Generating Summary' :
                                  streamingType === 'mcq' ? 'Creating MCQ Questions' : 'AI Assistant'}
                                <span className="ml-2 flex items-center">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="ml-1 text-green-600">Live</span>
                                </span>
                              </span>
                            </div>
                            <div className="prose max-w-none">
                              {renderMarkdown(streamingMessage)}
                              {/* Blinking cursor */}
                              <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1"></span>
                            </div>
                          </div>
                        </div>
                      )}

                      {isChatLoading && !streamingMessage && (
                        <div className="inline-block bg-gray-100 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                            <span className="text-gray-500">Thinking...</span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    {transcript && (
                      <form onSubmit={handleAskQuestion} className="flex space-x-2">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={`Ask about the lecture content... ${isStreaming && streamingType === 'chat' ? '- Streaming...' : ''}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
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
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        )}
                      </form>
                    )}

                    {/* Streaming Status for Chat */}
                    {isStreaming && streamingType === 'chat' && (
                      <div className="mt-2 text-xs text-center text-green-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></div>
                        Streaming live response...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 text-center">
                    <Youtube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Real YouTube Transcript Analysis
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Add your RMS API key and YouTube URL to extract real transcripts and generate AI-powered study materials.
                    </p>

                    <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                      <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          Real transcript extraction
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                        <Brain className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          AI-powered comprehensive summary
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          10 practice MCQ questions
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          Interactive AI chat support
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          Real-time streaming responses
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 text-sm text-gray-500">
                      <p>💡 <span className="font-medium">Requirements:</span></p>
                      <ul className="text-left mt-2 space-y-1">
                        <li>• RMS key (Mail us for access:- anshjaiswal1804@gmail.com)</li>
                        <li>• YouTube videos with captions/subtitles</li>
                        <li>• Public videos (not private or restricted)</li>
                        <li>• Educational content works best</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Extract Transcript</h4>
                <p className="text-sm text-gray-600">Automatically extracts real captions from YouTube videos</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
                <p className="text-sm text-gray-600">Uses RMS API to analyze content with GPT models</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Generate Content</h4>
                <p className="text-sm text-gray-600">Creates summaries and practice questions in real-time</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Interactive Chat</h4>
                <p className="text-sm text-gray-600">Chat with AI about the lecture content for deeper understanding</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeSummarizer;
