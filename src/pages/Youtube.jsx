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
  Zap
} from 'lucide-react';

const YouTubeSummarizer = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoData, setVideoData] = useState(null);
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Mock toast notifications
  const showToast = (message, type = 'success') => {
    console.log(`Toast (${type}): ${message}`);
    // In a real app, you'd use a proper toast library
  };

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get YouTube video data (mock implementation)
  const getVideoData = async (videoId) => {
    return {
      title: "Machine Learning Fundamentals - Complete Course",
      duration: "45:30",
      channel: "AI Education Hub",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      videoId: videoId
    };
  };

  // Get video transcript (mock implementation)
  const getVideoTranscript = async (videoId) => {
    try {
      showToast('Fetching video transcript... This may take a moment', 'loading');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return `Welcome to today's lecture on machine learning fundamentals. 
      In this comprehensive session, we'll explore the key concepts that form the foundation of artificial intelligence and machine learning.
      
      First, let's understand what machine learning really means. Machine learning is a subset of artificial intelligence that focuses on creating algorithms that can learn and improve from experience without being explicitly programmed for every scenario.
      
      There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning.
      
      Supervised learning involves training algorithms on labeled datasets where we know the correct answers. Examples include image classification, spam detection, and price prediction.
      
      Unsupervised learning works with unlabeled data to find hidden patterns. Common techniques include clustering, association rules, and dimensionality reduction.
      
      Reinforcement learning is about training agents to make decisions in an environment to maximize rewards. It's widely used in game playing, robotics, and autonomous systems.
      
      Key algorithms we'll discuss include linear regression, decision trees, random forests, support vector machines, and neural networks.
      
      The machine learning pipeline typically involves data collection, data preprocessing, feature selection, model training, evaluation, and deployment.
      
      Important considerations include overfitting, underfitting, bias-variance tradeoff, and cross-validation techniques.
      
      Real-world applications span across healthcare, finance, technology, transportation, and many other industries.
      
      Thank you for joining this session. Make sure to practice with the provided exercises and explore the additional resources mentioned in the description.`;
    } catch (error) {
      console.error("Error fetching transcript:", error);
      showToast("Failed to fetch video transcript. Please try again.", 'error');
      throw error;
    }
  };

  // Parse MCQ questions from text
  const parseMCQFromText = (text) => {
    const questions = [];
    const lines = text.split('\n');
    let currentQuestion = null;
    
    for (let line of lines) {
      line = line.trim();
      if (line.match(/^\d+\./)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question: line.replace(/^\d+\.\s*/, ''),
          options: [],
          correctAnswer: ''
        };
      } else if (line.match(/^[A-D]\)/)) {
        if (currentQuestion) {
          const optionText = line.substring(2).trim();
          currentQuestion.options.push(optionText);
          if (line.startsWith('A)')) currentQuestion.correctAnswer = 'A';
          else if (line.startsWith('B)')) currentQuestion.correctAnswer = 'B';
          else if (line.startsWith('C)')) currentQuestion.correctAnswer = 'C';
          else if (line.startsWith('D)')) currentQuestion.correctAnswer = 'D';
        }
      }
    }
    
    if (currentQuestion && currentQuestion.options.length > 0) {
      questions.push(currentQuestion);
    }
    
    return questions;
  };

  // Mock streaming API call
  const simulateStreamingAPI = async (content, onToken, onComplete) => {
    const words = content.split(' ');
    let streamedContent = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + ' ';
      streamedContent += word;
      onToken(word);
      
      // Simulate streaming delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    onComplete(streamedContent.trim());
  };

  const handleAnalyzeVideo = async () => {
    if (!youtubeUrl.trim()) {
      showToast('Please enter a YouTube URL.', 'error');
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
    setCurrentStep('summary');
    setSummary('');
    setMcqQuestions([]);
    setMessages([]);
    setStreamingMessage('');

    try {
      // Get video data
      const videoInfo = await getVideoData(videoId);
      setVideoData(videoInfo);

      // Get transcript
      const transcript = await getVideoTranscript(videoId);

      // Generate summary with streaming
      const summaryContent = `# Lecture Summary: Machine Learning Fundamentals

## Key Learning Objectives
- Understand the core concepts of machine learning and artificial intelligence
- Differentiate between supervised, unsupervised, and reinforcement learning
- Learn about key algorithms and their applications
- Understand the machine learning pipeline and best practices
- Explore real-world applications across various industries

## Core Concepts (200-300 words)
Machine learning represents a paradigm shift in how we approach problem-solving in computer science. Rather than explicitly programming solutions, we create systems that can learn patterns from data and make predictions or decisions. This field sits at the intersection of statistics, computer science, and domain expertise.

The three primary categories of machine learning each serve different purposes. Supervised learning uses labeled training data to predict outcomes for new inputs. Unsupervised learning discovers hidden structures in unlabeled data. Reinforcement learning optimizes decision-making through trial and error in dynamic environments.

## Important Definitions
- **Machine Learning**: A subset of AI focused on algorithms that improve through experience
- **Supervised Learning**: Learning with labeled training examples
- **Unsupervised Learning**: Finding patterns in data without labeled examples
- **Reinforcement Learning**: Learning through interaction with an environment
- **Overfitting**: When a model performs well on training data but poorly on new data
- **Cross-validation**: Technique to assess model performance and generalizability

## Key Points & Takeaways
- Machine learning is about pattern recognition and prediction from data
- Different types of learning (supervised, unsupervised, reinforcement) solve different problems
- The choice of algorithm depends on the problem type and data characteristics
- Proper validation techniques are crucial for building robust models
- Real-world applications span healthcare, finance, technology, and more

## Study Notes
Focus on understanding the fundamental differences between learning paradigms rather than memorizing algorithm details. Practice implementing simple examples of each type. Pay attention to the importance of data quality and preprocessing in the machine learning pipeline.

## Recommended Follow-up
Practice with hands-on coding exercises, explore datasets in your area of interest, and study specific algorithms in depth based on your application needs.`;

      await simulateStreamingAPI(
        summaryContent,
        (token) => {
          setStreamingMessage(prev => prev + token);
        },
        (fullContent) => {
          setSummary(fullContent);
          setMessages(prev => [...prev, { role: "assistant", content: fullContent, type: "summary" }]);
          setStreamingMessage('');
          
          // Start MCQ generation
          setTimeout(() => generateMCQQuestions(transcript), 1000);
        }
      );

    } catch (error) {
      console.error('Error analyzing video:', error);
      showToast('Error analyzing video. Please try again.', 'error');
      setIsProcessing(false);
      setIsStreaming(false);
    }
  };

  const generateMCQQuestions = async (transcript) => {
    setStreamingType('mcq');
    setCurrentStep('mcq');
    setStreamingMessage('');

    try {
      const mcqContent = `1. What is machine learning primarily focused on?
A) Explicitly programming solutions for every scenario
B) Creating algorithms that learn from experience without explicit programming
C) Only working with labeled datasets
D) Replacing human decision-making entirely

2. Which type of learning uses labeled training data?
A) Unsupervised learning
B) Reinforcement learning
C) Supervised learning
D) Deep learning

3. What is the main characteristic of unsupervised learning?
A) It requires labeled examples
B) It works with unlabeled data to find patterns
C) It only works with numerical data
D) It cannot be used for clustering

4. Reinforcement learning is primarily used for:
A) Image classification only
B) Training agents to make decisions in environments
C) Finding hidden patterns in static data
D) Preprocessing data

5. Which of the following is NOT mentioned as a key algorithm?
A) Linear regression
B) Decision trees
C) Quantum computing
D) Neural networks

6. What does overfitting refer to?
A) Using too much training data
B) When a model performs well on training data but poorly on new data
C) When a model is too simple
D) When data preprocessing takes too long

7. The machine learning pipeline typically includes:
A) Only model training
B) Data collection, preprocessing, training, and evaluation
C) Just data collection and results
D) Only feature selection

8. Cross-validation is important for:
A) Data collection
B) Assessing model performance and generalizability
C) Choosing programming languages
D) Hardware optimization

9. Which industries are mentioned as having ML applications?
A) Only technology
B) Healthcare, finance, technology, and transportation
C) Just healthcare and finance
D) Only academic research

10. What is emphasized as crucial for building robust models?
A) Using the most complex algorithms
B) Having the largest dataset possible
C) Proper validation techniques
D) The fastest hardware`;

      await simulateStreamingAPI(
        mcqContent,
        (token) => {
          setStreamingMessage(prev => prev + token);
        },
        (fullContent) => {
          const questions = parseMCQFromText(fullContent);
          setMcqQuestions(questions);
          setMessages(prev => [...prev, { role: "assistant", content: fullContent, type: "mcq" }]);
          setStreamingMessage('');
          setCurrentStep('complete');
          setIsStreaming(false);
          setIsProcessing(false);
          setStreamingType('');
          showToast('Analysis complete! Summary and MCQ questions generated.');
        }
      );

    } catch (error) {
      console.error('Error generating MCQ questions:', error);
      showToast('Error generating MCQ questions. Please try again.', 'error');
      setIsProcessing(false);
      setIsStreaming(false);
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

    try {
      const responseContent = `Based on the lecture content, here's my response to your question about "${inputValue}":

The machine learning fundamentals covered in this lecture provide a comprehensive foundation for understanding AI systems. Your question touches on important concepts that were discussed.

Key points to remember:
- Machine learning algorithms learn from data patterns
- Different learning types serve different purposes
- Proper validation is essential for model success
- Real-world applications are diverse and growing

Would you like me to elaborate on any specific aspect of machine learning from the lecture?`;

      await simulateStreamingAPI(
        responseContent,
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
      showToast('Error getting response. Please try again.', 'error');
      setMessages(prev => prev.slice(0, -1));
      setIsChatLoading(false);
      setIsStreaming(false);
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
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      showToast('Summary copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownloadSummary = () => {
    const content = `# YouTube Lecture Summary\n\n${summary}\n\n## MCQ Questions\n\n${mcqQuestions.map((q, i) => 
      `${i + 1}. ${q.question}\nA) ${q.options[0]}\nB) ${q.options[1]}\nC) ${q.options[2]}\nD) ${q.options[3]}\n`
    ).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube_summary_${Date.now()}.md`;
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
    setStreamingMessage('');
    setCurrentStep('');
    showToast('All content cleared successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            Analyze YouTube lectures, get comprehensive summaries, practice with MCQ questions, and chat with AI about the content.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Link className="w-6 h-6 mr-2" />
                  YouTube URL
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
                <div>
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
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {videoData.duration}
                          </span>
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
                    disabled={!youtubeUrl.trim() || isProcessing}
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
                      {currentStep === 'summary' ? 'Generating Summary...' : 
                       currentStep === 'mcq' ? 'Creating MCQ Questions...' : 'Processing...'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`flex items-center space-x-2 text-sm ${
                      currentStep === 'summary' ? 'text-blue-600' : 
                      summary ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <div className={`w-4 h-4 rounded-full ${
                        currentStep === 'summary' ? 'bg-blue-500 animate-pulse' :
                        summary ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span>Summary Generation</span>
                    </div>
                    
                    <div className={`flex items-center space-x-2 text-sm ${
                      currentStep === 'mcq' ? 'text-blue-600' : 
                      mcqQuestions.length > 0 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <div className={`w-4 h-4 rounded-full ${
                        currentStep === 'mcq' ? 'bg-blue-500 animate-pulse' :
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
                    'Real-time streaming analysis',
                    'Comprehensive lecture summaries',
                    '10 MCQ practice questions',
                    'Interactive AI chat support',
                    'Key concepts extraction',
                    'Study recommendations',
                    'Download summaries & questions'
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
                                <h3 className="font-bold text-lg mb-4">Practice Questions</h3>
                                {mcqQuestions.map((question, qIndex) => (
                                  <div key={qIndex} className="bg-white p-4 rounded-lg border">
                                    <h4 className="font-semibold mb-3">
                                      {qIndex + 1}. {question.question}
                                    </h4>
                                    <div className="space-y-2">
                                      {question.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center space-x-2">
                                          <span className="font-medium min-w-[20px]">
                                            {String.fromCharCode(65 + oIndex)})
                                          </span>
                                          <span>{option}</span>
                                        </div>
                                      ))}
                                    </div>
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
                    {summary && (
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
                      YouTube Lecture Analyzer
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Enter a YouTube URL to get comprehensive analysis with summary and practice questions.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                      <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          Detailed lecture summary
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
                      <p>💡 <span className="font-medium">Tips:</span></p>
                      <ul className="text-left mt-2 space-y-1">
                        <li>• Works best with educational/lecture videos</li>
                        <li>• Supports videos with subtitles/captions</li>
                        <li>• Ask specific questions about concepts</li>
                        <li>• Use MCQ questions for self-assessment</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeSummarizer;