import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  User, 
  Code, 
  Search, 
  GraduationCap, 
  Wand2, 
  Send, 
  Loader2, 
  Settings,
  Copy,
  Check,
  Square
} from 'lucide-react';

// Mock API key and URL for demo
const OPENROUTER_API_KEY = "sk-or-v1-your-api-key";
const YOUR_SITE_URL = "https://rmsai.com";
const YOUR_SITE_NAME = "RMS AI Assistant";

// Mock toast function
const toast = {
  error: (message) => console.error(message),
  success: (message) => console.log(message)
};

const RMSAI = () => {
  const [selectedModel, setSelectedModel] = useState('rms-tutor');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const models = [
    {
      id: 'rms-tutor',
      name: 'RMS Tutor',
      description: 'Perfect for study doubts and learning concepts',
      icon: GraduationCap,
      color: 'from-green-500 to-emerald-500',
      model: 'anthropic/claude-3.5-sonnet'
    },
    {
      id: 'rms-coder',
      name: 'RMS Coder',
      description: 'Specialized in programming and coding tasks',
      icon: Code,
      color: 'from-blue-500 to-cyan-500',
      model: 'anthropic/claude-3.5-sonnet'
    },
    {
      id: 'rms-deepresearch',
      name: 'RMS DeepResearch',
      description: 'Advanced research and complex academic topics',
      icon: Search,
      color: 'from-purple-500 to-violet-500',
      model: 'anthropic/claude-3.5-sonnet'
    }
  ];

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
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
    setIsGenerating(false);
    
    if (streamingMessage.trim()) {
      setMessages(prev => [...prev, { role: "assistant", content: streamingMessage }]);
    }
    setStreamingMessage('');
  };

  const formatMessage = (content) => {
    if (!content) return null;

    // Remove ** formatting and clean up text
    let cleanedContent = content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold formatting
      .replace(/\*(.*?)\*/g, '$1')     // Remove * italic formatting
      .replace(/__(.*?)__/g, '$1')     // Remove __ bold formatting
      .replace(/_(.*?)_/g, '$1');      // Remove _ italic formatting

    // Split content by code blocks and other elements
    const parts = cleanedContent.split(/(```[\s\S]*?```)/);
    
    return parts.map((part, index) => {
      // Handle code blocks
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.substring(3, part.length - 3);
        const firstNewline = codeContent.indexOf('\n');
        let language = 'plaintext';
        let code = codeContent;
        
        if (firstNewline > 0) {
          language = codeContent.substring(0, firstNewline).trim();
          code = codeContent.substring(firstNewline + 1);
        }
        
        return (
          <div key={index} className="my-4 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-3">
              <span className="text-sm font-medium text-gray-300">
                {language || 'Code'}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopiedCodeIndex(index);
                  setTimeout(() => setCopiedCodeIndex(null), 2000);
                }}
                className="flex items-center space-x-2 text-xs hover:text-white transition-colors px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
              >
                {copiedCodeIndex === index ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
              <code className={`language-${language}`}>
                {code}
              </code>
            </pre>
          </div>
        );
      } else {
        // Regular text with basic formatting
        return part.split('\n').map((line, lineIndex) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={`${index}-${lineIndex}`} className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
                {line.substring(2)}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={`${index}-${lineIndex}`} className="text-xl font-semibold mt-5 mb-3 text-gray-800 dark:text-gray-200">
                {line.substring(3)}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={`${index}-${lineIndex}`} className="text-lg font-medium mt-4 mb-2 text-gray-700 dark:text-gray-300">
                {line.substring(4)}
              </h3>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={`${index}-${lineIndex}`} className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic">
                {line.substring(2)}
              </blockquote>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <li key={`${index}-${lineIndex}`} className="ml-5 mb-1 text-gray-700 dark:text-gray-300 list-disc">
                {line.substring(2)}
              </li>
            );
          }
          if (line.match(/^\d+\.\s/)) {
            return (
              <li key={`${index}-${lineIndex}`} className="ml-5 mb-1 text-gray-700 dark:text-gray-300 list-decimal">
                {line.replace(/^\d+\.\s/, '')}
              </li>
            );
          }
          if (line.trim() === '') {
            return <br key={`${index}-${lineIndex}`} />;
          }
          return (
            <p key={`${index}-${lineIndex}`} className="my-2 text-gray-700 dark:text-gray-300 leading-relaxed">
              {line}
            </p>
          );
        });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    const userMessage = { role: "user", content: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsGenerating(true);
    setIsStreaming(true);
    setStreamingMessage('');

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const currentModel = models.find(m => m.id === selectedModel);
      let systemPrompt = "You are RMS AI, an advanced educational assistant for students. ";
      
      if (selectedModel === 'rms-coder') {
        systemPrompt += "You specialize in programming and coding tasks. Always format code in markdown code blocks with proper language tags. Provide clear explanations alongside code examples.";
      } else if (selectedModel === 'rms-deepresearch') {
        systemPrompt += "You excel at deep research and complex academic topics. Structure your responses with clear headings, detailed explanations, and examples when appropriate.";
      } else {
        systemPrompt += "You help with study questions and learning concepts. Provide clear, concise explanations with examples when helpful.";
      }

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
          model: currentModel.model,
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
              setIsGenerating(false);
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
                    setIsGenerating(false);
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
      setIsGenerating(false);
      setIsStreaming(false);
      setStreamingMessage('');
      abortControllerRef.current = null;
    }
  };

  const clearChat = () => {
    if (isStreaming) {
      stopStreaming();
    }
    setMessages([]);
    setStreamingMessage('');
    toast.success('Chat cleared successfully!');
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              RMS AI Assistant
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get help with study doubts, coding problems, and research questions using specialized AI models.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Model Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Models
                </h2>
                <button
                  onClick={clearChat}
                  className="text-sm text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  Clear Chat
                </button>
              </div>
              
              <div className="space-y-4">
                {models.map((model) => {
                  const Icon = model.icon;
                  const isSelected = selectedModel === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => !isGenerating && setSelectedModel(model.id)}
                      disabled={isGenerating}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                      } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${model.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {model.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {model.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Current Model
                </h3>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${models.find(m => m.id === selectedModel)?.color} rounded-lg flex items-center justify-center`}>
                    {React.createElement(models.find(m => m.id === selectedModel)?.icon || Bot, {
                      className: "w-4 h-4 text-white"
                    })}
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {models.find(m => m.id === selectedModel)?.name}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">💡 <span className="font-medium">Tips:</span></p>
                <ul className="space-y-1">
                  <li>• Use <span className="font-medium">RMS Coder</span> for programming help</li>
                  <li>• Use <span className="font-medium">RMS DeepResearch</span> for complex topics</li>
                  <li>• Use <span className="font-medium">RMS Tutor</span> for study doubts</li>
                </ul>
              </div>

              {/* Streaming Status */}
              {isStreaming && (
                <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-700 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-sm font-medium">Streaming...</span>
                    </div>
                    <button
                      onClick={stopStreaming}
                      className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                      title="Stop streaming"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col h-full">
              <div className="flex-1 flex flex-col" style={{ minHeight: '70vh' }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-6" style={{ scrollBehavior: 'smooth' }}>
                  {messages.length === 0 && !streamingMessage ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-16">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-8">
                        <Bot className="w-16 h-16 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How can I help you today?
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
                        Ask me anything - whether it's a coding problem, study doubt, or research question. I'll provide clear explanations and solutions tailored to your needs.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                        {[
                          "Explain quantum computing in simple terms",
                          "Debug this Python code: for i in range(10): print(i",
                          "What are the causes of World War I?",
                          "How do I create a React component?",
                          "Explain photosynthesis process",
                          "Write a sorting algorithm in Java"
                        ].map((example, index) => (
                          <div
                            key={index}
                            className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => setInputValue(example)}
                          >
                            <p className="text-gray-700 dark:text-gray-300">
                              "{example}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] rounded-2xl p-6 ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white rounded-tr-none'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                          }`}>
                            <div className="flex items-center mb-3">
                              {message.role === 'user' ? (
                                <User className="w-4 h-4 mr-2" />
                              ) : (
                                <>
                                  {React.createElement(
                                    models.find(m => m.id === selectedModel)?.icon || Bot,
                                    { className: "w-4 h-4 mr-2" }
                                  )}
                                </>
                              )}
                              <span className="text-xs font-medium opacity-80">
                                {message.role === 'user' ? 'You' : models.find(m => m.id === selectedModel)?.name}
                              </span>
                            </div>
                            <div className="prose dark:prose-invert max-w-none">
                              {formatMessage(message.content)}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Streaming Message */}
                      {streamingMessage && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-6">
                            <div className="flex items-center mb-3">
                              {React.createElement(
                                models.find(m => m.id === selectedModel)?.icon || Bot,
                                { className: "w-4 h-4 mr-2" }
                              )}
                              <span className="text-xs font-medium opacity-80 flex items-center">
                                {models.find(m => m.id === selectedModel)?.name}
                                <span className="ml-2 flex items-center">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="ml-1 text-green-600 dark:text-green-400">Live</span>
                                </span>
                              </span>
                            </div>
                            <div className="prose dark:prose-invert max-w-none">
                              {formatMessage(streamingMessage)}
                              <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1"></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="mt-auto">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      placeholder={`Ask anything... (Currently using ${models.find(m => m.id === selectedModel)?.name}) ${isStreaming ? '- Streaming...' : ''}`}
                      className="flex-1 px-5 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      disabled={isGenerating}
                    />
                    {isStreaming ? (
                      <button
                        type="button"
                        onClick={stopStreaming}
                        className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all flex items-center justify-center"
                        title="Stop streaming"
                      >
                        <Square className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!inputValue.trim() || isGenerating}
                        className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                    RMS AI can make mistakes. Consider checking important information.
                    {isStreaming && <span className="text-green-600 dark:text-green-400 ml-2">● Streaming live responses</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RMSAI;