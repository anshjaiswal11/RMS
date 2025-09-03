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
  Menu,
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';

// IMPORTANT: Replace "YOUR_OPENROUTER_API_KEY" with your actual OpenRouter API key.
const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '';
const YOUR_SITE_URL = 'https://www.citewise.xyz/';
const YOUR_SITE_NAME = 'RMS Study Assistant';

const RMSAI = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('rms-tutor');
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const models = [
    {
      id: 'rms-deepresearch',
      name: 'RMS DeepResearch',
      model: 'deepseek/deepseek-chat-v3.1:free',
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
      description: 'Image understanding and analysis',
      icon: ImageIcon,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'citeWise-FastestAi',
      name: 'CiteWise FastestAI',
      model: 'google/gemma-3n-e4b-it:free',
      description: 'Fast responses for general queries',
      icon: Zap,
      color: 'from-red-500 to-pink-500' 
    },
    {
      id: 'citeWise-HumanfeelingAi',
      name: 'CiteWise HumanFeelingAI',  
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      description: 'Empathetic and conversational AI',
      icon: Wand2,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'citeWise-prompt-creationAi',
      name: 'CiteWise PromptCreationAI',
      model: 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free',
      description: 'Expert in crafting prompts and instructions',
      icon: Settings,
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const showAlert = (message) => {
    setAlertInfo({ show: true, message });
    setTimeout(() => setAlertInfo({ show: false, message: '' }), 3000);
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);


  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setUploadedImage(base64Image);
        setImagePreview(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  // Enhanced format message function
  const formatMessage = (content, modelId) => {
    if (typeof content !== 'string') {
      return content;
    }

    let cleaned = content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`([^`]+)`/g, '$1');

    // Unified formatting for rms-tutor and rms-deepresearch
    if (modelId === 'rms-tutor' || modelId === 'rms-deepresearch') {
      // Extract 'Thinking' block if present
      let thinkingBlock = null;
      let answerBlock = cleaned;
      const thinkingMatch = cleaned.match(/Thinking:(.*?)(\n\n|$)/s);
      if (thinkingMatch) {
        thinkingBlock = thinkingMatch[1].trim();
        answerBlock = cleaned.replace(thinkingMatch[0], '').trim();
      }

      // Parse answer block into sections
      const sections = [];
      let currentSection = { heading: null, list: [] };
      answerBlock.split('\n').forEach(line => {
        const headingMatch = line.match(/^\d+\.\s+(.*)/);
        const listItemMatch = line.match(/^\s*[-*]\s+(.*)/);
        const summaryMatch = line.match(/^👉\s+(.*)/);

        if (headingMatch) {
          if (currentSection.heading || currentSection.list.length > 0) {
            sections.push(currentSection);
          }
          currentSection = { heading: headingMatch[1], list: [] };
        } else if (listItemMatch) {
          currentSection.list.push(listItemMatch[1]);
        } else if (summaryMatch) {
          if (currentSection.heading || currentSection.list.length > 0) {
            sections.push(currentSection);
          }
          currentSection = { heading: null, list: [], summary: summaryMatch[1] };
          sections.push(currentSection);
          currentSection = { heading: null, list: [] };
        } else if (line.trim() !== '') {
          if (!currentSection.heading && currentSection.list.length === 0) {
            if (!sections.intro) sections.intro = [];
            sections.intro.push(line);
          } else {
            currentSection.list.push(line);
          }
        }
      });
      if (currentSection.heading || currentSection.list.length > 0) {
        sections.push(currentSection);
      }

      return (
        <div>
          {thinkingBlock && (
            <details className="mb-4 bg-gray-800/60 rounded-lg p-3 border-l-4 border-blue-500">
              <summary className="font-semibold text-blue-400 cursor-pointer">Model Thinking</summary>
              <div className="mt-2 text-gray-300 whitespace-pre-wrap">{thinkingBlock}</div>
            </details>
          )}
          {sections.intro && <p className="mb-4">{sections.intro.join('\n')}</p>}
          {sections.map((section, index) => (
            <div key={index} className="mb-4">
              {section.heading && <h3 className="text-lg font-semibold text-gray-100 mb-2">{`${index + 1}. ${section.heading}`}</h3>}
              {section.list.length > 0 && (
                <ul className="list-disc list-inside pl-4 space-y-1 text-gray-300">
                  {section.list.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}
              {section.summary && <p className="mt-4 p-3 bg-gray-800/50 rounded-lg">👉 {section.summary}</p>}
            </div>
          ))}
        </div>
      );
    }

    const parts = cleaned.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.substring(3, part.length - 3);
        const firstNewline = codeContent.indexOf('\n');
        let language = 'plaintext';
        let code = codeContent.trim();
        if (firstNewline !== -1) {
          language = codeContent.substring(0, firstNewline).trim() || 'plaintext';
          code = codeContent.substring(firstNewline + 1).trim();
        }
        return (
          <div key={index} className="my-4">
            <div className="flex items-center justify-between bg-gray-900 text-white px-4 py-2 rounded-t-lg">
              <span className="text-xs font-semibold uppercase">{language}</span>
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
            <pre className="bg-gray-800 text-green-200 p-4 rounded-b-lg overflow-x-auto text-sm">
              <code>{code}</code>
            </pre>
          </div>
        );
      } else {
        return <div key={index} className="whitespace-pre-wrap">{part}</div>;
      }
    });
  };

  const saveCurrentChat = (chatMessages = messages) => {
    if (chatMessages.length > 0) {
      const chatTitle = typeof chatMessages[0]?.content === 'string' 
        ? (chatMessages[0].content.slice(0, 40) + (chatMessages[0].content.length > 40 ? "..." : ""))
        : "Image Query";

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
        
        let updatedHistory;
        if (existingIndex >= 0) {
          updatedHistory = [...prev];
          updatedHistory[existingIndex] = chatData;
        } else {
          updatedHistory = [chatData, ...prev];
        }
        return updatedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
      
      if (!currentChatId) {
        setCurrentChatId(chatId);
      }
    }
  };

  const loadChat = (chat) => {
    if (isStreaming) stopStreaming();
    setMessages(chat.messages);
    setSelectedModel(chat.model);
    setCurrentChatId(chat.id);
    setStreamingMessage('');
    setUploadedImage(null);
    setImagePreview(null);
    setSidebarOpen(false);
  };
  
  const deleteChat = (chatIdToDelete) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatIdToDelete));
    if(currentChatId === chatIdToDelete) {
        startNewChat(false);
    }
  }

  const startNewChat = (shouldSaveCurrent = true) => {
    if (shouldSaveCurrent && messages.length > 0) {
      saveCurrentChat();
    }
    if (isStreaming) stopStreaming();
    setMessages([]);
    setStreamingMessage('');
    setCurrentChatId(null);
    setInputValue('');
    setUploadedImage(null);
    setImagePreview(null);
    setSidebarOpen(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!inputValue.trim() && !uploadedImage) || isGenerating) return;

    let userContent = inputValue.trim();
    let messageContentForDisplay = userContent;
    let apiMessagesPayload = [];

    if (uploadedImage) {
        if (selectedModel !== 'citeWise-imageAi') {
            showAlert("Only CiteWise ImageAI can analyze images. Please switch models.");
            return;
        }
        apiMessagesPayload.push({
            role: "user",
            content: [
                { type: "text", text: userContent || "Describe this image in detail." },
                { type: "image_url", image_url: { url: uploadedImage } }
            ]
        });
        messageContentForDisplay = (
            <div className="space-y-3">
                {userContent && <div className="text-white">{userContent}</div>}
                <img src={uploadedImage} alt="Uploaded content" className="rounded-lg max-w-xs max-h-48 border border-gray-600"/>
            </div>
        );
    } else {
        apiMessagesPayload.push({ role: "user", content: userContent });
    }
    
    const userMessage = { role: "user", content: messageContentForDisplay };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsGenerating(true);
    setIsStreaming(true);
    setStreamingMessage('');

    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    abortControllerRef.current = new AbortController();

    try {
      const currentModel = models.find(m => m.id === selectedModel);
      let systemPrompt = "You are RMS AI, a helpful and intelligent study assistant. Your responses should be clear, well-structured, and easy to understand. Avoid using markdown formatting like ** or * for emphasis; use plain text with proper headings and line breaks.";
      if (selectedModel === 'rms-tutor') {
        systemPrompt += " Structure your explanations with numbered headings for main points (e.g., '1. Main Point') and bulleted lists for details (e.g., '- detail'). Conclude with a summary or a follow-up question starting with '👉'.";
      }
      if (selectedModel === 'rms-deepresearch') {
        systemPrompt += "\n\nYou are DeepSeek V3.1 in reasoning mode. For every question, first show your 'Thinking:' (step-by-step reasoning, thoughts, and analysis) in plain text, then provide your final answer in the following format: numbered headings for main points (e.g., '1. Main Point'), bulleted lists for details (e.g., '- detail'), and a summary or follow-up question starting with '👉'. Always output both 'Thinking:' and the answer in this format. Do not use markdown formatting.";
      }

      const historyForAPI = newMessages.slice(0, -1).map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : (msg.content.props.children[0]?.props.children || "User sent an image.")
      }));

      // --- IMAGE GENERATION LOGIC ---
      if (selectedModel === 'citeWise-imageAi') {
        // Request both image and text modalities
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
            messages: [
              { role: "system", content: systemPrompt },
              ...historyForAPI,
              ...apiMessagesPayload
            ],
            modalities: ["image", "text"],
            stream: false
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        const result = await response.json();
        // Extract base64 image from response
        const choices = result.choices || [];
        let imageData = null;
        let textContent = '';
        if (choices.length > 0) {
          const message = choices[0].message || {};
          textContent = message.content || '';
          const images = message.images || [];
          if (images.length > 0 && images[0].image_url && images[0].image_url.url) {
            imageData = images[0].image_url.url; // This is a data URI (base64)
          }
        }
        // Show both text and image in chat
        const aiMessage = {
          role: "assistant",
          content: (
            <div className="space-y-4">
              {textContent && <div>{textContent}</div>}
              {imageData && (
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src={imageData}
                    alt="Generated"
                    className="rounded-xl border-4 border-blue-500 shadow-xl max-w-full"
                    style={{ width: '480px', maxWidth: '90vw', height: 'auto' }}
                  />
                  <a
                    href={imageData}
                    download={
                      'openrouter-image-' + Date.now() + '.png'
                    }
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-colors"
                  >
                    Download Image
                  </a>
                </div>
              )}
            </div>
          )
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsStreaming(false);
        setIsGenerating(false);
        return;
      }
      // --- END IMAGE GENERATION LOGIC ---

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
          messages: [
            { role: "system", content: systemPrompt },
            ...historyForAPI,
            ...apiMessagesPayload
          ],
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') {
              stopStreaming();
              return;
            }
            try {
              const data = JSON.parse(jsonStr);
              if (data.choices && data.choices[0]?.delta?.content) {
                setStreamingMessage(prev => prev + data.choices[0].delta.content);
              }
            } catch (e) {
              console.error('Failed to parse stream chunk:', jsonStr);
            }
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error during fetch:', error);
        const errorMessage = { role: "assistant", content: `Sorry, an error occurred: ${error.message}` };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      if (isStreaming) {
        stopStreaming();
      }
    }
};

  const currentModelDetails = models.find(m => m.id === selectedModel);
  
  return (
    <div className="h-screen bg-gray-900 text-white flex overflow-hidden font-sans">
        <div className={`fixed inset-0 bg-gray-900/80 z-40 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
        <div className={`fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-700 flex flex-col w-80 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:w-80`}>
            {/* Sidebar Content */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Brain className="text-purple-400"/>
                    RMS AI
                </h2>
                <button onClick={() => startNewChat()} className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
             <div className="flex-1 p-2 overflow-y-auto">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Recent Chats</h3>
                <div className="space-y-1">
                {chatHistory.map((chat) => (
                    <div key={chat.id} className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer ${currentChatId === chat.id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
                        <div onClick={() => loadChat(chat)} className="flex-1 truncate pr-2">
                            <p className="text-sm font-medium text-gray-200 truncate">{chat.title}</p>
                        </div>
                        <button onClick={() => deleteChat(chat.id)} className="p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                </div>
            </div>
            {/* Model Selection */}
            <div className="p-4 border-t border-gray-700">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI Models</h3>
                <div className="space-y-2">
                {models.map((model) => (
                    <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        disabled={isGenerating}
                        className={`w-full flex items-center text-left p-3 rounded-lg transition-all duration-200 border-2 ${selectedModel === model.id ? 'bg-gray-700 border-purple-500' : 'bg-gray-800 border-transparent hover:bg-gray-700/50'} ${isGenerating ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 flex-shrink-0 bg-gradient-to-br ${model.color}`}>
                           <model.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-gray-100">{model.name}</p>
                            <p className="text-xs text-gray-400">{model.description}</p>
                        </div>
                    </button>
                ))}
                </div>
            </div>
        </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-800 relative">
        {/* Custom Alert */}
        {alertInfo.show && (
             <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 mt-4 z-50"
             >
                <div className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg border border-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{alertInfo.message}</span>
                     <button onClick={() => setAlertInfo({ show: false, message: '' })} className="ml-2 opacity-80 hover:opacity-100">&times;</button>
                </div>
            </motion.div>
        )}
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm z-10">
            <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-6 h-6"/>
            </button>
            <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${currentModelDetails.color}`}>
                    <currentModelDetails.icon className="w-4 h-4 text-white"/>
                </div>
                <span className="font-semibold">{currentModelDetails.name}</span>
            </div>
            <div className="w-6"></div> {/* Spacer */}
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="w-full">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${currentModelDetails.color} mb-6 shadow-lg`}>
                     <currentModelDetails.icon size={40} className="text-white" />
                  </div>
                  <h1 className="text-4xl font-bold mb-2">Welcome to {currentModelDetails.name}</h1>
                  <p className="text-gray-400 mb-8">{currentModelDetails.description}</p>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${currentModelDetails.color}`}>
                            <currentModelDetails.icon className="w-5 h-5 text-white"/>
                        </div>
                    )}
                     <div className={`max-w-2xl p-4 rounded-xl ${msg.role === 'user' ? 'bg-purple-600' : 'bg-gray-700'}`}>
                        {formatMessage(msg.content, msg.role === 'assistant' ? selectedModel : null)}
                    </div>
                    {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-600 flex-shrink-0">
                            <User className="w-5 h-5"/>
                        </div>
                    )}
                  </div>
                ))}
                {isStreaming && (
                    <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${currentModelDetails.color}`}>
                            <currentModelDetails.icon className="w-5 h-5 text-white"/>
                        </div>
                        <div className="max-w-2xl p-4 rounded-xl bg-gray-700">
                             {formatMessage(streamingMessage, selectedModel)}
                             <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="max-w-4xl mx-auto">
             {isStreaming && (
                <div className="flex justify-center mb-2">
                    <button onClick={stopStreaming} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg">
                        <Square className="w-4 h-4" />
                        Stop Generating
                    </button>
                </div>
            )}
            <div className="bg-gray-700 rounded-xl p-2 flex flex-col">
              {imagePreview && (
                <div className="p-2 relative group">
                    <p className="text-xs text-gray-400 mb-1">Image for CiteWise ImageAI:</p>
                    <img src={imagePreview} alt="upload preview" className="w-24 h-24 object-cover rounded-md"/>
                    <button onClick={removeImage} className="absolute top-2 left-20 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4"/>
                    </button>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-600 transition-colors" title="Upload Image">
                    <Upload className="w-5 h-5" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={`Message ${currentModelDetails.name}...`}
                  className="flex-1 bg-transparent resize-none outline-none text-white placeholder-gray-400 max-h-48"
                  rows={1}
                />
                <button type="submit" disabled={isGenerating || (!inputValue.trim() && !uploadedImage)} className="p-2 rounded-full bg-purple-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors">
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RMSAI;

