import React, { useState, useCallback, useMemo, lazy, Suspense, useRef, useEffect } from 'react';
import { 
  Code, Download, Play, MessageCircle, FileText, Folder, Plus, Trash2, Settings, Zap,
  Terminal, Save, RefreshCw, Eye, EyeOff, Send, User, Bot, Sparkles, FolderOpen, 
  Package, GitBranch, Monitor, Smartphone, Globe, Database, Cpu, Layers, CheckCircle, 
  AlertCircle, Copy, ExternalLink, X, Loader, Maximize2, Minimize2, RotateCcw, Edit3,
  FileCode, FilePlus, Bug, Lightbulb
} from 'lucide-react';

// Enhanced JSZip CDN loading
const JSZIP_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

// Enhanced Code Editor with better syntax highlighting
const CodeEditor = lazy(() => {
  const EditorComponent = ({ code, language, onChange, theme = 'dark' }) => {
    const textareaRef = useRef(null);
    const highlightRef = useRef(null);

    const languageMap = {
      'javascript': 'js', 'react': 'jsx', 'nextjs': 'jsx', 'nodejs': 'js', 'express': 'js',
      'typescript': 'ts', 'jsx': 'jsx', 'tsx': 'tsx', 'html': 'html', 'css': 'css',
      'json': 'json', 'python': 'py', 'java': 'java', 'cpp': 'cpp', 'vue': 'vue',
      'svelte': 'svelte', 'php': 'php', 'go': 'go', 'rust': 'rs', 'dart': 'dart'
    };

    const getHighlightedCode = (code, lang) => {
      if (!code) return '';

      const escapeHtml = str => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      const patterns = {
        js: [
          { pattern: /(function|const|let|var|if|else|for|while|return|class|import|export|from|async|await|try|catch|throw|new|switch|case|default|break|continue)/g, class: 'text-purple-400' },
          { pattern: /(".*?"|'.*?'|`.*?`)/g, class: 'text-green-300' },
          { pattern: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, class: 'text-gray-500' },
          { pattern: /(\d+(?:\.\d+)?)/g, class: 'text-orange-400' },
          { pattern: /(true|false|null|undefined)/g, class: 'text-blue-400' },
          { pattern: /([A-Z][a-zA-Z0-9_]*)/g, class: 'text-yellow-300' },
        ],
        jsx: [
          { pattern: /(function|const|let|var|if|else|for|while|return|class|import|export|from|async|await|try|catch|throw|new|switch|case|default|break|continue)/g, class: 'text-purple-400' },
          { pattern: /(<\/?[A-Z][^>]*>|<\/?[a-z][^>]*>)/g, class: 'text-cyan-400' },
          { pattern: /(\w+)=/g, class: 'text-red-400' },
          { pattern: /(".*?"|'.*?'|`.*?`)/g, class: 'text-green-300' },
          { pattern: /(\/\/.*$|\/\*[\s\S]*?\*\/|\{.*\})/gm, class: 'text-gray-500' }
        ],
        html: [
          { pattern: /(<\/?[^>]+>)/g, class: 'text-cyan-400' },
          { pattern: /(\w+)=/g, class: 'text-red-400' },
          { pattern: /(".*?"|'.*?')/g, class: 'text-green-300' },
          { pattern: /(<!--[\s\S]*?-->)/g, class: 'text-gray-500' }
        ],
        css: [
          { pattern: /([.#]?[a-zA-Z0-9_-]+)\s*(?={)/g, class: 'text-cyan-400' },
          { pattern: /([\w-]+)\s*:/g, class: 'text-red-400' },
          { pattern: /(::?[\w-]+)/g, class: 'text-yellow-300' },
          { pattern: /(".*?"|'.*?'|#[\da-fA-F]{3,6}|\d+px|\d+rem|\d+em)/g, class: 'text-green-300' },
          { pattern: /(\/\*[\s\S]*?\*\/)/g, class: 'text-gray-500' }
        ],
        python: [
          { pattern: /(def|class|if|elif|else|for|while|return|import|from|try|except|with|as|pass|break|continue|lambda)/g, class: 'text-purple-400' },
          { pattern: /(".*?"|'.*?')/g, class: 'text-green-300' },
          { pattern: /(#.*$)/gm, class: 'text-gray-500' },
          { pattern: /(\d+)/g, class: 'text-orange-400' }
        ]
      };

      const langPatterns = patterns[lang] || patterns.js;
      const combinedRegex = new RegExp(langPatterns.map(p => `(${p.pattern.source})`).join('|'), 'g');
      
      let lastIndex = 0;
      const parts = [];
      
      code.replace(combinedRegex, (match, ...args) => {
        const offset = args[args.length - 2];
        const groupIndex = args.slice(0, -2).findIndex(g => g !== undefined);

        if (offset > lastIndex) {
          parts.push(escapeHtml(code.substring(lastIndex, offset)));
        }
        
        if (groupIndex !== -1 && langPatterns[groupIndex]) {
          const className = langPatterns[groupIndex].class;
          parts.push(`<span class="${className}">${escapeHtml(match)}</span>`);
        } else {
          parts.push(escapeHtml(match));
        }
        
        lastIndex = offset + match.length;
        return match;
      });

      if (lastIndex < code.length) {
        parts.push(escapeHtml(code.substring(lastIndex)));
      }

      return parts.join('');
    };

    const handleScroll = () => {
        if (highlightRef.current && textareaRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    return (
      <div className="h-full bg-gray-900 rounded-lg overflow-hidden relative font-mono text-sm leading-6">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white p-4 resize-none outline-none z-10"
          placeholder={`Enter your ${language} code here...`}
          spellCheck={false}
          style={{ tabSize: 2 }}
        />
        <pre
          ref={highlightRef}
          className="absolute inset-0 pointer-events-none p-4 whitespace-pre-wrap break-words overflow-auto"
          aria-hidden="true"
        >
          <code dangerouslySetInnerHTML={{ __html: getHighlightedCode(code, languageMap[language] || 'js') }} />
        </pre>
      </div>
    );
  };
  return Promise.resolve({ default: EditorComponent });
});

const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-3">
    <div className="relative">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
    </div>
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 text-white text-sm animate-fade-in-down";
  const typeClasses = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}>
      {type === 'success' && <CheckCircle className="w-5 h-5" />}
      {type === 'error' && <AlertCircle className="w-5 h-5" />}
      <span>{message}</span>
    </div>
  );
};

// Enhanced Live Preview with better error handling and reload capability
const LivePreview = ({ files, isVisible, onClose }) => {
  const [previewContent, setPreviewContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const generatePreviewContent = useCallback(() => {
    if (!files.length) return '';

    const htmlFile = files.find(f => f.name.includes('index.html') || f.name.endsWith('.html'));
    const jsxFile = files.find(f => f.name.includes('App.jsx') || f.name.includes('App.js') || f.name.endsWith('.jsx'));
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    const jsFiles = files.filter(f => f.name.endsWith('.js') && !f.name.includes('.jsx'));

    if (htmlFile) {
      let content = htmlFile.content;
      
      // Inject CSS files
      cssFiles.forEach(cssFile => {
        const styleTag = `<style>/* ${cssFile.name} */\n${cssFile.content}</style>`;
        content = content.replace('</head>', `${styleTag}\n</head>`);
      });

      // Inject JS files
      jsFiles.forEach(jsFile => {
        const scriptTag = `<script>/* ${jsFile.name} */\n${jsFile.content}</script>`;
        content = content.replace('</body>', `${scriptTag}\n</body>`);
      });

      return content;
    } else if (jsxFile) {
      const cssContent = cssFiles.map(f => f.content).join('\n');
      
      return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
      #root { min-height: 100vh; }
      ${cssContent}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
      const { useState, useEffect, useCallback, useMemo, useRef } = React;
      
      ${jsxFile.content}
      
      // Enhanced rendering with error boundary
      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
        }

        static getDerivedStateFromError(error) {
          return { hasError: true, error };
        }

        componentDidCatch(error, errorInfo) {
          console.error("Uncaught error in preview:", error, errorInfo);
        }

        render() {
          if (this.state.hasError) {
            return React.createElement('div', {
              style: { padding: '20px', textAlign: 'center', color: '#ef4444', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px' }
            }, 'Something went wrong: ' + this.state.error.message);
          }
          return this.props.children;
        }
      }
      
      const rootElement = document.getElementById('root');
      
      try {
        const MainComponent = window.App || window.Main || window.Component || window.Index || window.Home;
        if (MainComponent) {
          ReactDOM.render(
            React.createElement(ErrorBoundary, null, React.createElement(MainComponent)),
            rootElement
          );
        } else {
          rootElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No main React component found. Make sure to export a component named App.</div>';
        }
      } catch (error) {
        console.error('Render Error:', error);
        rootElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #ef4444;">Error rendering component: ' + error.message + '</div>';
      }
    </script>
</body>
</html>`;
    }
    
    return '<div style="padding: 20px; text-align: center; color: #666;">No previewable files found. Add an index.html or App.jsx file.</div>';
  }, [files]);

  useEffect(() => {
    if (isVisible) {
      const content = generatePreviewContent();
      setPreviewContent(content);
      setPreviewKey(prev => prev + 1);
    }
  }, [isVisible, files, generatePreviewContent]);

  const handleRefresh = () => {
    const content = generatePreviewContent();
    setPreviewContent(content);
    setPreviewKey(prev => prev + 1);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
      <div className={`bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col ${isFullscreen ? 'w-full h-full' : 'w-[90vw] h-[90vh] max-w-6xl'}`}>
        <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Monitor className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Live Preview</h3>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-blue-200 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 bg-blue-200 rounded-lg transition-colors"
              title="Refresh Preview"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-400 rounded-lg transition-colors"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {previewContent ? (
            <iframe
              key={previewKey}
              srcDoc={previewContent}
              className="w-full h-full border-0"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner text="Loading preview..." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AgenticAICodeGenerator() {
  const [idea, setIdea] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('react');
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [projectGenerated, setProjectGenerated] = useState(false);
  const [projectInfo, setProjectInfo] = useState(null);
  const [toast, setToast] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUpdatingFiles, setIsUpdatingFiles] = useState(false);
  const chatEndRef = useRef(null);

  const API_KEY = process.env.REACT_APP_OPENROUTER_API2_KEY;
  const [projectName, setProjectName] = useState('ai-generated-project');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = JSZIP_CDN;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const languages = [
    { id: 'react', name: 'React.js', ext: 'jsx', color: 'text-cyan-400', icon: '⚛️', description: 'Modern React application with hooks' },
    { id: 'nextjs', name: 'Next.js', ext: 'jsx', color: 'text-white', icon: '▲', description: 'Full-stack React framework' },
    { id: 'vue', name: 'Vue.js', ext: 'vue', color: 'text-green-400', icon: '🔧', description: 'Progressive Vue.js application' },
    { id: 'svelte', name: 'Svelte', ext: 'svelte', color: 'text-orange-400', icon: '🔥', description: 'Compiled Svelte application' },
    { id: 'html', name: 'HTML/CSS/JS', ext: 'html', color: 'text-orange-500', icon: '🌐', description: 'Vanilla web application' },
    { id: 'typescript', name: 'TypeScript', ext: 'ts', color: 'text-blue-400', icon: '📘', description: 'Type-safe JavaScript' },
    { id: 'python', name: 'Python', ext: 'py', color: 'text-yellow-400', icon: '🐍', description: 'Python application' },
    { id: 'nodejs', name: 'Node.js', ext: 'js', color: 'text-green-500', icon: '🟢', description: 'Server-side JavaScript' },
    { id: 'express', name: 'Express.js', ext: 'js', color: 'text-gray-400', icon: '🚀', description: 'Node.js web framework' },
    { id: 'flutter', name: 'Flutter', ext: 'dart', color: 'text-blue-300', icon: '🦋', description: 'Cross-platform mobile app' }
  ];

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, streamingMessage]);

  const createZipFile = useCallback(async (filesToZip, projName) => {
    if (typeof window.JSZip === 'undefined') {
      throw new Error('JSZip library is not loaded yet.');
    }
    const zip = new window.JSZip();

    filesToZip.forEach(file => {
      zip.file(file.name, file.content);
    });

    const isJsProject = ['react', 'nextjs', 'vue', 'svelte', 'nodejs', 'express', 'typescript'].includes(selectedLanguage);
    if (isJsProject && !filesToZip.some(f => f.name === 'package.json')) {
      const packageJson = {
        name: projName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
        devDependencies: { '@vitejs/plugin-react': '^4.2.1', vite: '^5.2.0' }
      };
      zip.file('package.json', JSON.stringify(packageJson, null, 2));
    }
    
    const readme = `# ${projName}\n\nThis project was generated by Agentic AI Code Generator.\n\n## Installation\n\n\`\`\`bash\nnpm install\n\`\`\`\n\n## Running the project\n\n\`\`\`bash\nnpm run dev\n\`\`\``;
    zip.file('README.md', readme);

    return zip.generateAsync({ type: 'blob' });
  }, [selectedLanguage]);

  const generateCode = useCallback(async () => {
    if (!idea.trim()) {
      showToast('Please enter your project idea', 'error');
      return;
    }
    setIsGenerating(true);
    
    try {
      const langInfo = languages.find(l => l.id === selectedLanguage);
      const prompt = `Create a complete, production-ready ${selectedLanguage} project based on this idea: "${idea}". 

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "files": [
    {
      "name": "src/components/filename.ext",
      "content": "complete file content here"
    }
  ],
  "projectInfo": {
    "name": "project name",
    "description": "detailed project description",
    "technologies": ["tech1", "tech2"],
    "features": ["feature1", "feature2"],
    "installation": ["step1", "step2"],
    "usage": ["usage instruction 1", "usage instruction 2"]
  }
}

Requirements:
- Create multiple files with proper project folder structure
- Include package.json for JavaScript-based projects
- Use modern best practices and functional components
- Include comprehensive styling (Tailwind CSS preferred)
- Ensure code is complete, functional, and ready to run
- Generate 4-8 files for meaningful project structure
- Include error handling and proper component structure`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Agentic AI Code Generator'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3-coder:free',
          messages: [
            { role: 'system', content: 'You are an expert full-stack developer and agentic AI assistant. Always return valid JSON responses only. Create production-ready, complete applications.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 9000
        })
      });

      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);

      const data = await response.json();
      let content = data.choices[0].message.content;
      content = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
      
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (parseError) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsedContent = JSON.parse(jsonMatch[0]);
        else throw new Error('Could not parse AI response as JSON');
      }

      if (!parsedContent.files || !Array.isArray(parsedContent.files)) throw new Error('Invalid response format from AI');
      
      setFiles(parsedContent.files);
      setProjectInfo(parsedContent.projectInfo);
      setActiveFile(parsedContent.files[0]);
      setProjectGenerated(true);
      
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        message: `Project Generated Successfully!\n\n**${parsedContent.projectInfo?.name || 'Your Project'}**\n\n${parsedContent.projectInfo?.description || ''}\n\n**Technologies:** ${parsedContent.projectInfo?.technologies?.join(', ') || langInfo.name}\n\n**Generated Files:** ${parsedContent.files.length} files\n\nI'm now your agentic AI assistant ready to:\n• Fix any bugs or errors you encounter\n• Add new features and functionality\n• Modify existing code and files\n• Create additional files as needed\n• Provide real-time code updates\n\nJust describe what you need and I'll update your project files automatically!`
      };
      
      setChatMessages([welcomeMessage]);
      setIsChatVisible(true);
      showToast('Project generated successfully!', 'success');

    } catch (error) {
      console.error('Error generating code:', error);
      showToast(`Error generating code: ${error.message}`, 'error');
      setChatMessages([{ 
        id: Date.now(), 
        type: 'bot', 
        message: `Error: ${error.message}\n\nPlease try again or check your API connection.` 
      }]);
      setIsChatVisible(true);
    } finally {
      setIsGenerating(false);
    }
  }, [idea, selectedLanguage, showToast, languages, API_KEY]);

  // Enhanced agentic chat function with real-time file updates
  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || isChatting) return;

    const userMessage = { id: Date.now(), type: 'user', message: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsChatting(true);
    setIsStreaming(true);
    setIsUpdatingFiles(true);
    setStreamingMessage('');

    try {
      const context = files.map(file => `**${file.name}**:\n\`\`\`${file.name.split('.').pop()}\n${file.content}\n\`\`\``).join('\n\n');
      const chatHistory = chatMessages.slice(-4).map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.message}`).join('\n');
      
      const prompt = `You are an agentic AI developer assistant working with a ${selectedLanguage} project. You can intelligently modify, create, and update files based on user requests.

CURRENT PROJECT FILES:
${context}

RECENT CONVERSATION:
${chatHistory}

USER REQUEST: "${currentInput}"

INSTRUCTIONS:
1. Analyze the user's request carefully
2. If they report bugs/errors, fix them by providing updated file content
3. If they want new features, modify existing files and/or create new files
4. If they want changes, update the appropriate files
5. Always provide COMPLETE file content, not partial updates
6. Use the following format for your response:

**Analysis:** Brief analysis of what needs to be done
**Action:** What you're going to do (fix bug, add feature, create files, etc.)

**FILES TO UPDATE/CREATE:**

\`\`\`filename:src/path/filename.ext
[Complete file content here]
\`\`\`

\`\`\`filename:src/path/newfile.ext
[Complete new file content here]
\`\`\`

**Explanation:** Explain what was changed/added and how it solves the user's request

IMPORTANT: Always provide complete file content. Never use placeholders like "// rest of the code" or partial content.

Please help with this request:`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Agentic AI Code Generator'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3-coder:free',
          messages: [
            { role: 'system', content: 'You are an agentic AI developer assistant. You intelligently analyze user requests and update project files in real-time. Always provide complete file content, never partial updates. Follow the specified response format exactly.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 9000,
          stream: false
        })
      });

      if (!response.ok) throw new Error(`Chat API request failed: ${response.status}`);
      const data = await response.json();
      const botResponse = data.choices[0].message.content;
      
      // Parse and extract file updates from AI response
      const fileUpdates = [];
      const codeBlockRegex = /```filename:([^\n]+)\n([\s\S]*?)```/g;
      let match;
      
      while ((match = codeBlockRegex.exec(botResponse)) !== null) {
        const filename = match[1].trim();
        const content = match[2].trim();
        if (content && content.length > 10) { // Ensure meaningful content
          fileUpdates.push({ name: filename, content: content });
        }
      }
      
      // Stream the response message
      let currentText = '';
      const words = botResponse.split(' ');
      let fileUpdateIndex = 0;
      
      for (let i = 0; i < words.length; i++) {
        currentText += words[i] + ' ';
        setStreamingMessage(currentText.trim());
        
        // Apply file updates progressively during streaming
        if (fileUpdates.length > 0 && i > words.length * (0.3 + (fileUpdateIndex * 0.2)) && fileUpdateIndex < fileUpdates.length) {
          const updateFile = fileUpdates[fileUpdateIndex];
          
          setFiles(prev => {
            const existingFileIndex = prev.findIndex(f => 
              f.name === updateFile.name || 
              f.name.endsWith(updateFile.name) || 
              updateFile.name.endsWith(f.name.split('/').pop())
            );
            
            if (existingFileIndex !== -1) {
              // Update existing file
              const updated = [...prev];
              updated[existingFileIndex] = { ...updated[existingFileIndex], content: updateFile.content };
              
              // Update active file if it's the one being modified
              if (activeFile && activeFile.name === updated[existingFileIndex].name) {
                setActiveFile(updated[existingFileIndex]);
              }
              
              return updated;
            } else {
              // Create new file
              const newFile = { name: updateFile.name, content: updateFile.content };
              return [...prev, newFile];
            }
          });
          
          fileUpdateIndex++;
          
          // Show toast for file updates
          const action = files.some(f => f.name === updateFile.name || f.name.endsWith(updateFile.name)) ? 'Updated' : 'Created';
          showToast(`${action}: ${updateFile.name.split('/').pop()}`, 'success');
        }
        
        await new Promise(resolve => setTimeout(resolve, 25));
      }

      const finalMessage = { 
        id: Date.now() + 1, 
        type: 'bot', 
        message: botResponse,
        fileUpdates: fileUpdates.length
      };
      setChatMessages(prev => [...prev, finalMessage]);
      
      if (fileUpdates.length > 0) {
        showToast(`Updated ${fileUpdates.length} file(s)`, 'success');
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        id: Date.now() + 1, 
        type: 'bot', 
        message: `Error: ${error.message}\n\nI couldn't process your request. Please try rephrasing or check the connection.` 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
      setIsStreaming(false);
      setIsUpdatingFiles(false);
      setStreamingMessage('');
    }
  }, [chatInput, files, chatMessages, selectedLanguage, API_KEY, isChatting, activeFile, showToast]);

  const downloadProject = useCallback(async () => {
    if (files.length === 0) {
      showToast('No files to download', 'error');
      return;
    }
    setIsDownloading(true);
    showToast('Creating project archive...', 'info');

    try {
      const zipBlob = await createZipFile(files, projectName);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Project downloaded successfully!', 'success');
    } catch (error) {
      showToast(`Download failed: ${error.message}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  }, [files, projectName, createZipFile, showToast]);

  const updateFileContent = useCallback((content) => {
    if (!activeFile) return;
    setFiles(prev => prev.map(file => file.name === activeFile.name ? { ...file, content } : file));
    setActiveFile(prev => ({ ...prev, content }));
  }, [activeFile]);

  const resetProject = useCallback(() => {
    setFiles([]);
    setActiveFile(null);
    setProjectGenerated(false);
    setProjectInfo(null);
    setChatMessages([]);
    setIdea('');
    setShowPreview(false);
    showToast('Project reset successfully', 'info');
  }, [showToast]);

  const renderMarkdown = (text) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-gray-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-2 py-1 rounded text-sm font-mono text-cyan-300">$1</code>')
      .replace(/```[\w]*:?[^\n]*\n([\s\S]*?)```/g, (match, code) => {
        const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre class="bg-gray-800 p-4 my-3 rounded-lg overflow-x-auto text-sm font-mono border-l-4 border-cyan-500"><code class="text-gray-100">${escapedCode}</code></pre>`;
      })
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
    return { __html: html };
  };
  
  const FileIcon = ({ filename }) => {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      'js': <Code className="w-4 h-4 text-yellow-400" />,
      'jsx': <Code className="w-4 h-4 text-cyan-400" />,
      'ts': <Code className="w-4 h-4 text-blue-400" />,
      'tsx': <Code className="w-4 h-4 text-blue-400" />,
      'html': <Globe className="w-4 h-4 text-orange-500" />,
      'css': <Layers className="w-4 h-4 text-cyan-400" />,
      'scss': <Layers className="w-4 h-4 text-pink-400" />,
      'json': <FileText className="w-4 h-4 text-green-400" />,
      'md': <FileText className="w-4 h-4 text-gray-400" />,
      'py': <Code className="w-4 h-4 text-yellow-400" />,
      'vue': <Code className="w-4 h-4 text-green-400" />,
      'svelte': <Code className="w-4 h-4 text-orange-400" />
    };
    return iconMap[ext] || <FileText className="w-4 h-4 text-gray-400" />;
  };

  const canPreview = useMemo(() => {
    return files.some(f => f.name.endsWith('.html') || f.name.endsWith('.jsx') || f.name.endsWith('.js'));
  }, [files]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <LivePreview 
        files={files} 
        isVisible={showPreview} 
        onClose={() => setShowPreview(false)} 
      />
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-gray-900/95 border-b border-gray-800">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-4 mt-6 sm:mt-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Agentic AI Code Generator
                </h1>
                <p className="text-xs text-gray-400">Intelligent code generation with real-time updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
              {projectGenerated && canPreview && (
                <button 
                  onClick={() => setShowPreview(true)} 
                  className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 text-xs sm:text-sm shadow-lg hover:shadow-xl"
                >
                  <Eye className="w-4 h-4" />
                  <span>Live Preview</span>
                </button>
              )}
              {projectGenerated && (
                <button 
                  onClick={resetProject} 
                  className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all duration-200 flex items-center space-x-2 text-xs sm:text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              )}
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-300" />
              </button>
              {projectGenerated && (
                <button 
                  onClick={() => setIsChatVisible(!isChatVisible)} 
                  className={`p-2 rounded-lg transition-colors relative ${
                    isUpdatingFiles ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isUpdatingFiles ? <Edit3 className="w-5 h-5 text-white animate-pulse" /> : <MessageCircle className="w-5 h-5 text-white" />}
                  {(chatMessages.length > 0 || isStreaming) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="border-b border-gray-800 bg-gray-900/50">
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
            <input 
              type="text" 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} 
              className="w-full max-w-xs sm:max-w-sm bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 outline-none transition-all" 
            />
          </div>
        </div>
      )}

      <main className={`${showSettings ? 'h-[calc(100vh-130px)]' : 'h-[calc(100vh-81px)]'} flex flex-col sm:flex-row overflow-hidden`}>
        {!projectGenerated ? (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <div className="max-w-2xl sm:max-w-5xl w-full space-y-6 sm:space-y-10 text-center">
                <div className="space-y-2 sm:space-y-4">
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    Build Your 
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Dream Project</span>
                  </h2>
                  <p className="text-base sm:text-xl text-gray-400 max-w-lg sm:max-w-3xl mx-auto">
                    Describe your idea and watch as our agentic AI creates, fixes, and enhances your code in real-time. 
                    Full project generation with intelligent file updates.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 max-w-xs sm:max-w-4xl mx-auto">
                    {languages.slice(0, 5).map(lang => (
                        <div 
                          key={lang.id} 
                          onClick={() => setSelectedLanguage(lang.id)} 
                          className={`group p-2 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                            selectedLanguage === lang.id 
                              ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 shadow-lg shadow-blue-500/25' 
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
                          }`}
                        >
                            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                                <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{lang.icon}</span>
                                <div className={`font-semibold text-xs sm:text-sm ${lang.color}`}>{lang.name}</div>
                                <p className="text-xs text-gray-500 text-center">{lang.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="relative max-w-xs sm:max-w-3xl mx-auto">
                    <div className="relative">
                      <textarea 
                        value={idea} 
                        onChange={(e) => setIdea(e.target.value)} 
                        placeholder={`e.g., "A task management app with drag & drop, user authentication, dark mode, and real-time collaboration features"`}
                        className="w-full bg-gray-800/50 backdrop-blur text-white p-4 sm:p-6 pr-20 sm:pr-40 rounded-2xl border-2 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none text-base sm:text-lg leading-relaxed shadow-xl"
                        rows={4}
                      />
                      <button 
                        onClick={generateCode} 
                        disabled={isGenerating || !idea.trim()} 
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 px-4 sm:px-8 py-2 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2 sm:space-x-3 shadow-lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Generate Code</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                      Be specific about features, styling, and functionality you want. The AI will create a complete project structure.
                    </p>
                </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row flex-1 overflow-hidden p-2 sm:p-6 gap-2 sm:gap-6">
            {/* Enhanced File Explorer */}
            <div className="w-44 sm:w-80 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-xl flex flex-col overflow-hidden shadow-2xl mb-2 sm:mb-0">
                <div className="p-3 sm:p-5 border-b border-gray-800">
                    <h3 className="text-base sm:text-lg font-semibold text-white">{projectInfo?.name || 'Project Files'}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2">{projectInfo?.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                      {projectInfo?.technologies?.slice(0, 3).map((tech, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-700 text-xs rounded-md text-gray-300">{tech}</span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 sm:mt-2">
                      {files.length} files • {isUpdatingFiles ? 'Updating...' : 'Ready'}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
                    {files.map(file => (
                        <button 
                          key={file.name} 
                          onClick={() => setActiveFile(file)} 
                          className={`w-full text-left px-2 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm transition-all duration-200 ${
                            activeFile?.name === file.name 
                              ? 'bg-blue-500/20 text-white border border-blue-500/30' 
                              : 'hover:bg-gray-800 text-gray-300'
                          }`}
                        >
                            <FileIcon filename={file.name} />
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-medium">{file.name.split('/').pop()}</div>
                              <div className="text-xs text-gray-500 truncate">{file.name.includes('/') ? file.name.substring(0, file.name.lastIndexOf('/')) : ''}</div>
                            </div>
                            {activeFile?.name === file.name && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
                <div className="p-2 sm:p-4 border-t border-gray-800 space-y-2 sm:space-y-3">
                  <button 
                    onClick={downloadProject} 
                    disabled={isDownloading} 
                    className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-xs sm:text-base"
                  >
                    {isDownloading ? <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin"/> : <Download className="w-4 h-4 sm:w-5 sm:h-5" />}
                    <span>{isDownloading ? 'Creating Archive...' : 'Download ZIP'}</span>
                  </button>
                </div>
            </div>
            {/* Enhanced Code Editor */}
            <div className="flex-1 flex flex-col bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                {activeFile ? (
                    <>
                        <div className="flex items-center justify-between p-2 sm:p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
                            <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                                <FileIcon filename={activeFile.name} />
                                <span className="font-medium">{activeFile.name}</span>
                                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">
                                  {activeFile.content.split('\n').length} lines
                                </span>
                                {isUpdatingFiles && (
                                  <span className="text-xs bg-orange-600 px-2 py-1 rounded text-white animate-pulse">
                                    Updating...
                                  </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <button 
                                  onClick={() => { 
                                    navigator.clipboard.writeText(activeFile.content); 
                                    showToast('Copied to clipboard!', 'success'); 
                                  }} 
                                  className="p-2 hover:bg-gray-800 rounded-md transition-colors"
                                  title="Copy to clipboard"
                                >
                                    <Copy className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Suspense fallback={<LoadingSpinner text="Loading Editor..." />}>
                                <CodeEditor 
                                  language={activeFile.name.split('.').pop()} 
                                  code={activeFile.content} 
                                  onChange={updateFileContent} 
                                />
                            </Suspense>
                        </div>
                    </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-900/20">
                    <div className="text-center space-y-2 sm:space-y-3">
                      <FileText className="w-10 h-10 sm:w-16 sm:h-16 mx-auto opacity-50" />
                      <p className="text-base sm:text-lg">Select a file to view and edit</p>
                      <p className="text-xs sm:text-sm">Choose from the file explorer on the left</p>
                    </div>
                  </div>
                )}
            </div>
            {/* Enhanced Agentic Chat Panel */}
            <div className={`fixed top-0 right-0 h-full w-72 sm:w-96 bg-gray-900/98 backdrop-blur-xl border-l border-gray-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out z-30 ${
              isChatVisible ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="flex items-center justify-between p-2 sm:p-4 border-b border-gray-800 bg-gray-900/80">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                        isUpdatingFiles ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'
                      }`}>
                        {isUpdatingFiles ? <Edit3 className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold">
                          {isUpdatingFiles ? 'Updating Files...' : 'Agentic AI Assistant'}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {isUpdatingFiles ? 'Making real-time changes' : 'Ready to modify your project'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsChatVisible(false)} 
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-2 sm:space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
                    {chatMessages.map(msg => (
                        <div key={msg.id} className={`flex items-start space-x-2 sm:space-x-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                            {msg.type === 'bot' && (
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white"/>
                              </div>
                            )}
                            <div className={`p-2 sm:p-4 rounded-xl max-w-xs text-xs sm:text-sm shadow-lg ${
                              msg.type === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-sm' 
                                : 'bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700'
                            }`}>
                                <div className="prose prose-xs sm:prose-sm prose-invert" dangerouslySetInnerHTML={renderMarkdown(msg.message)} />
                                {msg.fileUpdates > 0 && (
                                  <div className="mt-1 sm:mt-2 text-xs text-green-400 flex items-center space-x-1">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Updated {msg.fileUpdates} file(s)</span>
                                  </div>
                                )}
                            </div>
                            {msg.type === 'user' && (
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white"/>
                              </div>
                            )}
                        </div>
                    ))}
                    {isStreaming && streamingMessage && (
                        <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white"/>
                            </div>
                            <div className="p-2 sm:p-4 rounded-xl max-w-xs text-xs sm:text-sm bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700 shadow-lg">
                                <div className="prose prose-xs sm:prose-sm prose-invert" dangerouslySetInnerHTML={renderMarkdown(streamingMessage)} />
                                <div className="flex items-center space-x-1 mt-1 sm:mt-2">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {isChatting && !streamingMessage && (
                        <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white"/>
                            </div>
                            <div className="p-2 sm:p-4 rounded-xl bg-gray-800 border border-gray-700">
                                <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-400"/>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-2 sm:p-4 border-t border-gray-800 bg-gray-900/50">
                    <div className="relative">
                        <textarea 
                          value={chatInput} 
                          onChange={(e) => setChatInput(e.target.value)} 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendChatMessage();
                            }
                          }}
                          placeholder="Fix the login bug, add a dark mode toggle, create a new component..."
                          className="w-full bg-gray-800 text-white p-2 sm:p-4 pr-8 sm:pr-14 rounded-lg border-2 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none text-xs sm:text-base"
                          rows={2}
                        />
                        <button 
                          onClick={sendChatMessage} 
                          disabled={isChatting || !chatInput.trim()} 
                          className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
