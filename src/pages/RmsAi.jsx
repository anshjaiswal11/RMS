import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Code, 
  BookOpen, 
  Zap, 
  Brain,
  Send,
  Copy,
  Check,
  Loader2,
  Bot,
  User,
  Settings,
  Wand2,
  Square,
  Trash2,
  Plus,
  Menu
} from 'lucide-react';

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API3_KEY;
const YOUR_SITE_URL = 'http://localhost:3000';
const YOUR_SITE_NAME = 'RMS Study Assistant';

const RMSAI = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('rms-deepresearch');
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const models = [
    {
      id: 'rms-deepresearch',
      name: 'RMS DeepResearch',
      model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
      description: 'Advanced research and deep understanding',
      icon: Brain,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'rms-coder',
      name: 'RMS Coder',
      model: 'qwen/qwen3-coder:free',
      description: 'Programming and code assistance',
      icon: Code,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'rms-tutor',
      name: 'RMS Tutor',
      model: 'z-ai/glm-4.5-air:free',
      description: 'Study help and explanations',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'citeWise-imageAi',
      name: 'CiteWise ImageAI',
      model: 'google/gemini-2.5-flash-image-preview:free',
      description: 'Image generation and editing',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'citeWise-FastestAi',
      name: 'CiteWise FastestAI',
      model: 'google/gemma-3n-e4b-it:free',
      description: 'Fast responses for general queries',
      icon: MessageSquare,
      color: 'from-red-500 to-pink-500' 
    },
    {
      id: 'citeWise-HumanfeelingAi',
      name: 'CiteWise HumanFeelingAI',  
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      description: 'Empathetic and conversational AI',
      icon: Settings,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'citeWise-prompt-creationAi',
      name: 'CiteWise PromptCreationAI',
      model: 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free',
      description: 'Expert in crafting prompts and instructions',
      icon: Trash2,
      color: 'from-purple-500 to-indigo-500'
    }
  ];

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
    setIsGenerating(false);
    
    setStreamingMessage(currentStreamingMessage => {
      if (currentStreamingMessage.trim()) {
        const newMessage = { role: "assistant", content: currentStreamingMessage };
        setMessages(prev => {
          const updatedMessages = [...prev, newMessage];
          saveCurrentChat(updatedMessages);
          return updatedMessages;
        });
      }
      return '';
    });
  };

  // Enhanced format message function that removes markdown formatting
  const formatMessage = (content, modelId) => {
    // Remove all markdown formatting: **, *, _, ~~, etc.
    let cleaned = content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`([^`]+)`/g, '$1');

    // If CiteWise ImageAI, try to detect image URLs or base64
    if (modelId === 'citeWise-imageAi') {
      // Simple regex for image URLs
      const imageUrlMatch = cleaned.match(/(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif))/i);
      // Simple regex for base64 images
      const base64Match = cleaned.match(/data:image\/(png|jpg|jpeg|gif);base64,[A-Za-z0-9+/=]+/);
      if (imageUrlMatch) {
        return (
          <div className="my-4 flex flex-col items-center">
            <img src={imageUrlMatch[1]} alt="AI generated" className="rounded-lg max-w-full max-h-96 border border-gray-700 shadow" />
            <p className="mt-2 text-gray-300 text-sm">AI generated image</p>
          </div>
        );
      }
      if (base64Match) {
        return (
          <div className="my-4 flex flex-col items-center">
            <img src={base64Match[0]} alt="AI generated" className="rounded-lg max-w-full max-h-96 border border-gray-700 shadow" />
            <p className="mt-2 text-gray-300 text-sm">AI generated image</p>
          </div>
        );
      }
    }

    const parts = cleaned.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // ...existing code...
        const codeContent = part.substring(3, part.length - 3);
        const firstNewline = codeContent.indexOf('\n');
        let language = 'plaintext';
        let code = codeContent;
        if (firstNewline > 0) {
          language = codeContent.substring(0, firstNewline).trim();
          code = codeContent.substring(firstNewline + 1);
        }
        return (
          <div key={index} className="my-4">
            <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
              <span className="text-xs font-semibold uppercase">{language || 'Code'}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopiedCodeIndex(index);
                  setTimeout(() => setCopiedCodeIndex(null), 2000);
                }}
                className="flex items-center space-x-1 text-xs hover:text-green-400 transition-colors"
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
            <pre className="bg-gray-900 text-green-200 p-4 rounded-b-lg overflow-x-auto text-sm">
              <code>{code}</code>
            </pre>
          </div>
        );
      } else {
        // ...existing code...
        return part.split('\n').map((line, lineIndex) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={`${index}-${lineIndex}`} className="text-xl font-bold mt-6 mb-4 text-gray-100">
                {line.substring(2)}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={`${index}-${lineIndex}`} className="text-lg font-semibold mt-5 mb-3 text-gray-200">
                {line.substring(3)}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={`${index}-${lineIndex}`} className="text-base font-medium mt-4 mb-2 text-gray-300">
                {line.substring(4)}
              </h3>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={`${index}-${lineIndex}`} className="border-l-4 border-blue-400 pl-4 py-2 my-3 bg-blue-900/20 text-blue-300 italic">
                {line.substring(2)}
              </blockquote>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <li key={`${index}-${lineIndex}`} className="ml-5 mb-1 text-gray-300 list-disc">
                {line.substring(2)}
              </li>
            );
          }
          if (line.match(/^\d+\.\s/)) {
            return (
              <li key={`${index}-${lineIndex}`} className="ml-5 mb-1 text-gray-300 list-decimal">
                {line.replace(/^\d+\.\s/, '')}
              </li>
            );
          }
          if (line.trim() === '') {
            return <br key={`${index}-${lineIndex}`} />;
          }
          return (
            <p key={`${index}-${lineIndex}`} className="my-2 text-gray-200 leading-relaxed">
              {line}
            </p>
          );
        });
      }
    });
  };

  // Save current chat to history
  const saveCurrentChat = (chatMessages = messages) => {
    if (chatMessages.length > 0) {
      const chatTitle = chatMessages[0]?.content?.slice(0, 50) + "..." || "New Chat";
      const chatId = currentChatId || Date.now().toString();
      
      setChatHistory(prev => {
        const existingIndex = prev.findIndex(chat => chat.id === chatId);
        const chatData = {
          id: chatId,
          title: chatTitle,
          messages: chatMessages,
          model: selectedModel,
          timestamp: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = chatData;
          return updated;
        } else {
          return [chatData, ...prev];
        }
      });
      
      if (!currentChatId) {
        setCurrentChatId(chatId);
      }
    }
  };

  // Load chat from history
  const loadChat = (chat) => {
    setMessages(chat.messages);
    setSelectedModel(chat.model);
    setCurrentChatId(chat.id);
    setStreamingMessage('');
    
    // Stop any ongoing streaming
    if (isStreaming) {
      stopStreaming();
    }
  };

  // Start new chat
  const startNewChat = () => {
    // Save current chat first
    if (messages.length > 0) {
      saveCurrentChat();
    }
    // Reset everything for new chat
    setMessages([]);
    setStreamingMessage('');
    setCurrentChatId(Date.now().toString());
    setInputValue('');
    // Stop any ongoing streaming
    if (isStreaming) {
      stopStreaming();
    }
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

    abortControllerRef.current = new AbortController();

    try {
      const currentModel = models.find(m => m.id === selectedModel);
      let systemPrompt = "You are RMS AI, an advanced educational assistant for students. Provide clear, well-structured responses without using markdown formatting like ** or * for emphasis. Use plain text with proper headings and spacing. ";

      // Custom prompts for each model
      switch (selectedModel) {
        case 'rms-coder':
          systemPrompt += "You specialize in programming and coding tasks. Format code in proper code blocks but avoid markdown emphasis in regular text. Provide clear explanations alongside code examples.";
          break;
        case 'rms-deepresearch':
          systemPrompt += "You excel at deep research and complex academic topics. Structure your responses with clear headings and detailed explanations using plain text formatting.";
          break;
        case 'rms-tutor':
          systemPrompt += "You are a helpful tutor. Provide step-by-step explanations for study questions and learning concepts. Use plain text formatting.";
          break;
        case 'citeWise-coderAi':
          systemPrompt += "You are an expert code generator and debugger. Provide code solutions and debugging help in clear code blocks, with concise explanations.";
          break;
        case 'citeWise-FastestAi':
          systemPrompt += "You respond quickly to general queries. Keep answers short, direct, and easy to understand.";
          break;
        case 'citeWise-HumanfeelingAi':
          systemPrompt += "You are empathetic and conversational. Respond with understanding and support, using friendly and encouraging language.";
          break;
        case 'citeWise-prompt-creationAi':
          systemPrompt += "You are an expert in crafting prompts and instructions for AI models. Help users create effective prompts for any task.";
          break;
        case 'citeWise-imageAi':
          systemPrompt += "When generating images, always return the image as base64 data in the response. If possible, embed the image as a data URL (data:image/png;base64,...) in your reply.";
          break;
        default:
          systemPrompt += "You help with study questions and learning concepts. Provide clear, concise explanations with examples when helpful, using plain text formatting.";
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
                  const newMessage = { role: "assistant", content: currentStreamingMessage };
                  setMessages(prev => {
                    const updatedMessages = [...prev, newMessage];
                    saveCurrentChat(updatedMessages);
                    return updatedMessages;
                  });
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
                        const newMessage = { role: "assistant", content: finalMessage };
                        setMessages(prev => {
                          const updatedMessages = [...prev, newMessage];
                          saveCurrentChat(updatedMessages);
                          return updatedMessages;
                        });
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
      alert('Error getting response. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsGenerating(false);
      setIsStreaming(false);
      setStreamingMessage('');
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="h-screen bg-gray-800 text-white flex overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-gray-900 border-r border-gray-700 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-64'
      } lg:flex hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700 mt-10">
          <button
            onClick={startNewChat}
            className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Chats</h3>
            <div className="space-y-1">
              {chatHistory.length > 0 ? (
                chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => loadChat(chat)}
                    className={`w-full text-left px-3 py-2 text-sm rounded cursor-pointer transition-colors ${
                      currentChatId === chat.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="truncate">{chat.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(chat.timestamp).toLocaleDateString()} {chat.model && (<span className="ml-2 text-gray-400">{models.find(m => m.id === chat.model)?.name}</span>)}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                  No previous chats
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI Models</h3>
          <div className="space-y-2">
            {models.map((model) => {
              const Icon = model.icon;
              const isSelected = selectedModel === model.id;
              
              return (
                <button
                  key={model.id}
                  onClick={() => !isGenerating && setSelectedModel(model.id)}
                  disabled={isGenerating}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 bg-gradient-to-r ${model.color} rounded-md flex items-center justify-center`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{model.name}</div>
                      <div className="text-xs text-gray-500 truncate">{model.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Streaming Status */}
          {isStreaming && (
            <div className="mt-3 p-2 bg-green-900/20 border border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-400">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs">Streaming...</span>
                </div>
                <button
                  onClick={stopStreaming}
                  className="text-green-400 hover:text-green-300"
                >
                  <Square className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-sm"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <button
              onClick={startNewChat}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto pt-8 mt-10">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !streamingMessage ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">RMS AI Assistant</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                  Choose your AI model and start chatting. Get help with coding, research, or studying.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {[
                    "Explain quantum computing",
                    "Debug my Python code",
                    "Summarize World War I causes",
                    "Help with React components"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(example)}
                      className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left text-sm border border-gray-600 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 p-6 pb-20">
                {messages.map((message, index) => {
                  const isGLM = message.role === 'assistant' && selectedModel === 'rms-tutor';
                  return (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-5 shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100'
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
                          <span className="text-sm font-medium opacity-90">
                            {message.role === 'user' ? 'You' : models.find(m => m.id === selectedModel)?.name}
                          </span>
                        </div>
                        {/* Reasoning block for GLM 4.5 Air */}
                        {isGLM && (
                          <div className="mb-2">
                            <details open>
                              <summary className="cursor-pointer text-yellow-400 font-semibold">Reasoning (thought for 0.6s)</summary>
                              <div className="mt-2 text-gray-300 text-sm">
                                Let me start by welcoming the user and introducing myself as the AI assistant. I should provide a brief overview of what I can help with without going into too much detail at this point. I'll keep my tone friendly and professional.
                              </div>
                            </details>
                          </div>
                        )}
                        {/* Actual model response */}
                        <div className="prose prose-invert max-w-none text-base leading-relaxed">
                          {formatMessage(message.content, message.role === 'assistant' ? selectedModel : null)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Streaming Message */}
                {streamingMessage && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100 rounded-2xl p-5 shadow-lg">
                      <div className="flex items-center mb-3">
                        {React.createElement(
                          models.find(m => m.id === selectedModel)?.icon || Bot,
                          { className: "w-4 h-4 mr-2" }
                        )}
                        <span className="text-sm font-medium opacity-90 flex items-center">
                          {models.find(m => m.id === selectedModel)?.name}
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-2"></div>
                        </span>
                      </div>
                      <div className="prose prose-invert max-w-none text-base leading-relaxed">
                        {formatMessage(streamingMessage, selectedModel)}
                        <span className="inline-block w-2 h-5 bg-gray-400 animate-pulse ml-1"></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Message RMS AI Assistant..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-6 py-4 pr-14 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                  disabled={isGenerating}
                />
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={stopStreaming}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isGenerating}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <Send className="w-5 h-5 text-white" />
                    )}
                  </button>
                )}
              </div>
            </form>
            <p className="text-xs text-gray-500 text-center mt-3">
              RMS AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RMSAI;