import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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
  Wand2
} from 'lucide-react';

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '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';
const YOUR_SITE_URL = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';
const YOUR_SITE_NAME = process.env.REACT_APP_SITE_NAME || 'RMS Study Assistant';

const RMSAI = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('rms-deepresearch');
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const models = [
    {
      id: 'rms-deepresearch',
      name: 'RMS DeepResearch',
      model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
      description: 'Advanced research and deep understanding for complex topics',
      icon: Brain,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'rms-coder',
      name: 'RMS Coder',
      model: 'qwen/qwen3-coder:free',
      description: 'Specialized in programming, debugging, and code explanations',
      icon: Code,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'rms-tutor',
      name: 'RMS Tutor',
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      description: 'Perfect for study doubts, explanations, and learning concepts',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessage = (content) => {
    // Split content into code blocks and text
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Code block
        const codeContent = part.substring(3, part.length - 3);
        const firstNewline = codeContent.indexOf('\n');
        let language = 'plaintext';
        let code = codeContent;
        
        if (firstNewline > 0) {
          language = codeContent.substring(0, firstNewline).trim();
          code = codeContent.substring(firstNewline + 1);
        }
        
        return (
          <div key={index} className="my-3">
            <div className="flex items-center justify-between bg-secondary-800 text-secondary-200 px-4 py-2 rounded-t-lg">
              <span className="text-sm font-medium">{language || 'Code'}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopiedCodeIndex(index);
                  setTimeout(() => setCopiedCodeIndex(null), 2000);
                }}
                className="flex items-center space-x-1 text-xs hover:text-white transition-colors"
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
            <pre className="bg-secondary-900 text-secondary-100 p-4 rounded-b-lg overflow-x-auto">
              <code className={`language-${language}`}>
                {code}
              </code>
            </pre>
          </div>
        );
      } else {
        // Regular text with markdown-like formatting
        return part.split('\n').map((line, lineIndex) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={`${index}-${lineIndex}`} className="text-2xl font-bold mt-6 mb-4 text-secondary-900 dark:text-white">
                {line.substring(2)}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={`${index}-${lineIndex}`} className="text-xl font-semibold mt-5 mb-3 text-secondary-800 dark:text-secondary-200">
                {line.substring(3)}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={`${index}-${lineIndex}`} className="text-lg font-medium mt-4 mb-2 text-secondary-700 dark:text-secondary-300">
                {line.substring(4)}
              </h3>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <blockquote key={`${index}-${lineIndex}`} className="border-l-4 border-primary-500 pl-4 py-2 my-3 bg-primary-50 dark:bg-primary-900/20 text-secondary-700 dark:text-secondary-300 italic">
                {line.substring(2)}
              </blockquote>
            );
          }
          if (line.startsWith('- ')) {
            return (
              <li key={`${index}-${lineIndex}`} className="ml-5 mb-1 text-secondary-700 dark:text-secondary-300 list-disc">
                {line.substring(2)}
              </li>
            );
          }
          if (line.match(/^\d+\.\s/)) {
            return (
              <li key={`${index}-${lineIndex}`} className="ml-5 mb-1 text-secondary-700 dark:text-secondary-300 list-decimal">
                {line.replace(/^\d+\.\s/, '')}
              </li>
            );
          }
          if (line.trim() === '') {
            return <br key={`${index}-${lineIndex}`} />;
          }
          return (
            <p key={`${index}-${lineIndex}`} className="my-2 text-secondary-700 dark:text-secondary-300 leading-relaxed">
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
      setIsGenerating(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared successfully!');
  };

  return (
    <>
      <Helmet>
        <title>RMS AI Assistant | Smart Study & Coding Help</title>
        <meta name="description" content="Get help with study doubts, coding problems, and research questions using specialized AI models. Switch between RMS Coder, DeepResearch, and Tutor modes." />
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
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white">
                RMS AI Assistant
              </h1>
            </div>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Get help with study doubts, coding problems, and research questions using specialized AI models.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Model Selection Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="card sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
                    AI Models
                  </h2>
                  <button 
                    onClick={clearChat}
                    className="text-sm text-secondary-500 hover:text-primary-500 dark:text-secondary-400 dark:hover:text-primary-400"
                  >
                    Clear Chat
                  </button>
                </div>

                <div className="space-y-4">
                  {models.map((model) => {
                    const Icon = model.icon;
                    const isSelected = selectedModel === model.id;
                    
                    return (
                      <motion.button
                        key={model.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedModel(model.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${model.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-secondary-900 dark:text-white">
                              {model.name}
                            </h3>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                              {model.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-8 p-4 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
                  <h3 className="font-semibold text-secondary-900 dark:text-white mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Current Model
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${models.find(m => m.id === selectedModel)?.color} rounded-lg flex items-center justify-center`}>
                      {React.createElement(models.find(m => m.id === selectedModel)?.icon || Bot, { className: "w-4 h-4 text-white" })}
                    </div>
                    <span className="font-medium text-secondary-800 dark:text-secondary-200">
                      {models.find(m => m.id === selectedModel)?.name}
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-sm text-secondary-600 dark:text-secondary-400">
                  <p className="mb-2">💡 <span className="font-medium">Tips:</span></p>
                  <ul className="space-y-1">
                    <li>• Use <span className="font-medium">RMS Coder</span> for programming help</li>
                    <li>• Use <span className="font-medium">RMS DeepResearch</span> for complex topics</li>
                    <li>• Use <span className="font-medium">RMS Tutor</span> for study doubts</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Chat Area */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="card flex flex-col h-full">
                <div className="flex-1 flex flex-col min-h-[500px]">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-6">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-6">
                          <Bot className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">
                          How can I help you today?
                        </h3>
                        <p className="text-secondary-600 dark:text-secondary-400 max-w-2xl">
                          Ask me anything - whether it's a coding problem, study doubt, or research question. 
                          I'll provide clear explanations and solutions tailored to your needs.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-4xl">
                          {[
                            "Explain quantum computing in simple terms",
                            "Debug this Python code: for i in range(10): print(i",
                            "What are the causes of World War I?"
                          ].map((example, index) => (
                            <div 
                              key={index}
                              className="p-4 bg-secondary-100 dark:bg-secondary-800 rounded-lg text-left"
                            >
                              <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                                "{example}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((message, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] rounded-2xl p-5 ${
                              message.role === 'user'
                                ? 'bg-primary-500 text-white rounded-tr-none'
                                : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200 rounded-tl-none'
                            }`}>
                              <div className="flex items-center mb-2">
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
                          </motion.div>
                        ))}
                      </>
                    )}
                    
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-secondary-100 dark:bg-secondary-800 p-5">
                          <div className="flex items-center mb-2">
                            {React.createElement(
                              models.find(m => m.id === selectedModel)?.icon || Bot, 
                              { className: "w-4 h-4 mr-2" }
                            )}
                            <span className="text-xs font-medium text-secondary-500 dark:text-secondary-400">
                              {models.find(m => m.id === selectedModel)?.name} is typing...
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-secondary-400 dark:bg-secondary-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-secondary-400 dark:bg-secondary-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-secondary-400 dark:bg-secondary-500 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleSubmit} className="mt-auto">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={`Ask anything... (Currently using ${models.find(m => m.id === selectedModel)?.name})`}
                        className="flex-1 px-5 py-4 border border-secondary-300 dark:border-secondary-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                        disabled={isGenerating}
                      />
                      <button
                        type="submit"
                        disabled={!inputValue.trim() || isGenerating}
                        className="p-4 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-center text-secondary-500 dark:text-secondary-400 mt-3">
                      RMS AI can make mistakes. Consider checking important information.
                    </p>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RMSAI;