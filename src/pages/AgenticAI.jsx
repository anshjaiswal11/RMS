import React, { useState, useCallback, useMemo, lazy, Suspense, useRef, useEffect } from 'react';
import {
  Code, Download, Play, MessageCircle, FileText, Folder, Plus, Trash2, Settings, Zap,
  Terminal, Save, RefreshCw, Eye, EyeOff, Send, User, Bot, Sparkles, FolderOpen,
  Package, GitBranch, Monitor, Smartphone, Globe, Database, Cpu, Layers, CheckCircle,
  AlertCircle, Copy, ExternalLink, X, Loader, Maximize2, Minimize2, RotateCcw, Edit3,
  FileCode, FilePlus, Bug, Lightbulb, ChevronRight, Star, Heart
} from 'lucide-react';

// Enhanced JSZip CDN loading
import * as THREE from 'three';
const JSZIP_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

// Three.js Background Animation Component
const ThreeJSBackground = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Basic Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 20;

      colors[i] = Math.random() * 0.5 + 0.5;
      colors[i + 1] = Math.random() * 0.5 + 0.8;
      colors[i + 2] = 1;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Create geometric shapes
    const shapes = [];
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(`hsl(${200 + i * 30}, 70%, 60%)`),
        transparent: true,
        opacity: 0.6,
        wireframe: true
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      shapes.push(cube);
      scene.add(cube);
    }

    camera.position.z = 8;

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Rotate particles
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;

      // Animate shapes
      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.01;
        shape.rotation.y += 0.005;
        shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none opacity-30" />;
};

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
          { pattern: /()/g, class: 'text-gray-500' }
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
      <div className="h-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-xl overflow-hidden relative font-mono text-sm leading-6 shadow-2xl border border-gray-700/50">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white p-6 resize-none outline-none z-10 scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent"
          placeholder={`Enter your ${language} code here...`}
          spellCheck={false}
          style={{ tabSize: 2 }}
        />
        <pre
          ref={highlightRef}
          className="absolute inset-0 pointer-events-none p-6 whitespace-pre-wrap break-words overflow-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent"
          aria-hidden="true"
        >
          <code dangerouslySetInnerHTML={{ __html: getHighlightedCode(code, languageMap[language] || 'js') }} />
        </pre>
        <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
      </div>
    );
  };
  return Promise.resolve({ default: EditorComponent });
});

const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse opacity-20"></div>
    </div>
    <p className="text-gray-400 text-sm animate-pulse">{text}</p>
  </div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = "fixed top-6 right-6 p-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 text-white text-sm animate-bounce-in backdrop-blur-lg border";
  const typeClasses = {
    success: 'bg-green-500/90 border-green-400/30 shadow-green-500/20',
    error: 'bg-red-500/90 border-red-400/30 shadow-red-500/20',
    info: 'bg-blue-500/90 border-blue-400/30 shadow-blue-500/20'
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}>
      {type === 'success' && <CheckCircle className="w-5 h-5 animate-pulse" />}
      {type === 'error' && <AlertCircle className="w-5 h-5 animate-pulse" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Enhanced Live Preview with better React.js support
const LivePreview = ({ files, isVisible, onClose }) => {
  const [previewContent, setPreviewContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewError, setPreviewError] = useState(null);

  const generatePreviewContent = useCallback(() => {
    if (!files.length) return '';

    const htmlFile = files.find(f => f.name.includes('index.html') || f.name.endsWith('.html'));
    const jsxFile = files.find(f => f.name.includes('App.jsx') || f.name.includes('App.js') || f.name.endsWith('.jsx') || f.name.includes('index.jsx'));
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    const jsFiles = files.filter(f => f.name.endsWith('.js') && !f.name.includes('.jsx'));
    const componentFiles = files.filter(f => f.name.endsWith('.jsx') && !f.name.includes('App'));

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
      const allJsxFiles = [jsxFile, ...componentFiles];

      return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            animation: {
              'fade-in': 'fadeIn 0.5s ease-in-out',
              'slide-up': 'slideUp 0.5s ease-out',
              'bounce-in': 'bounceIn 0.6s ease-out'
            }
          }
        }
      }
    </script>
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
      body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
      #root { min-height: 100vh; }
      .scrollbar-thin { scrollbar-width: thin; }
      .scrollbar-thumb-blue-500 { scrollbar-color: #3b82f6 transparent; }
      ${cssContent}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
      const { useState, useEffect, useCallback, useMemo, useRef } = React;
      
      // Load all component files
      ${allJsxFiles.map(file => `
      // File: ${file.name}
      ${file.content}
      `).join('\n')}
      
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
          console.error("Preview Error:", error, errorInfo);
          window.parent?.postMessage({ type: 'preview-error', error: error.message }, '*');
        }

        render() {
          if (this.state.hasError) {
            return React.createElement('div', {
              className: 'min-h-screen flex items-center justify-center bg-gray-900 p-8'
            }, 
              React.createElement('div', {
                className: 'bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-lg text-center'
              },
                React.createElement('div', { className: 'text-red-400 text-lg font-semibold mb-2' }, 'Preview Error'),
                React.createElement('div', { className: 'text-gray-300 text-sm' }, this.state.error?.message || 'Something went wrong'),
                React.createElement('button', {
                  className: 'mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors',
                  onClick: () => window.location.reload()
                }, 'Reload Preview')
              )
            );
          }
          return this.props.children;
        }
      }
      
      const rootElement = document.getElementById('root');
      
      try {
        // Try to find the main component
        const possibleComponents = [
          window.App, window.Main, window.Component, window.Index, 
          window.Home, window.default, window.Application
        ];
        
        const MainComponent = possibleComponents.find(comp => comp && typeof comp === 'function');
        
        if (MainComponent) {
          const root = ReactDOM.createRoot ? ReactDOM.createRoot(rootElement) : null;
          
          if (root) {
            root.render(
              React.createElement(ErrorBoundary, null, 
                React.createElement(MainComponent, null)
              )
            );
          } else {
            ReactDOM.render(
              React.createElement(ErrorBoundary, null, 
                React.createElement(MainComponent, null)
              ),
              rootElement
            );
          }
          
          // Notify parent of successful render
          window.parent?.postMessage({ type: 'preview-success' }, '*');
        } else {
          throw new Error('No main React component found. Make sure to export a component named App, Main, or Component.');
        }
      } catch (error) {
        console.error('Render Error:', error);
        rootElement.innerHTML = \`
          <div class="min-h-screen flex items-center justify-center bg-gray-900 p-8">
            <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-lg text-center">
              <div class="text-red-400 text-lg font-semibold mb-2">Render Error</div>
              <div class="text-gray-300 text-sm">\${error.message}</div>
              <div class="text-xs text-gray-500 mt-2">Check the console for more details</div>
            </div>
          </div>
        \`;
        window.parent?.postMessage({ type: 'preview-error', error: error.message }, '*');
      }
    </script>
</body>
</html>`;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview Not Available</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
    <div class="min-h-screen flex items-center justify-center p-8">
      <div class="text-center space-y-4">
        <div class="text-6xl opacity-50">🔍</div>
        <h2 class="text-xl font-semibold">No Previewable Files</h2>
        <p class="text-gray-400">Add an index.html, App.jsx, or other previewable file to see your project in action.</p>
      </div>
    </div>
</body>
</html>`;
  }, [files]);

  useEffect(() => {
    if (isVisible) {
      const content = generatePreviewContent();
      setPreviewContent(content);
      setPreviewKey(prev => prev + 1);
      setPreviewError(null);
    }
  }, [isVisible, files, generatePreviewContent]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'preview-error') {
        setPreviewError(event.data.error);
      } else if (event.data?.type === 'preview-success') {
        setPreviewError(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRefresh = () => {
    const content = generatePreviewContent();
    setPreviewContent(content);
    setPreviewKey(prev => prev + 1);
    setPreviewError(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className={`bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border-2 border-gray-200 transition-all duration-500 ${isFullscreen ? 'w-full h-full' : 'w-[95vw] h-[90vh] max-w-7xl'}`}>
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Monitor className="w-6 h-6 text-gray-600" />
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Live Preview</h3>
              <p className="text-sm text-gray-500">Real-time project preview</p>
            </div>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {previewError && (
              <div className="text-red-500 text-sm font-medium">Error Detected</div>
            )}
            <button
              onClick={() => {
                const blob = new Blob([previewContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
              }}
              className="p-3 bg-purple-100 hover:bg-purple-200 rounded-xl transition-all duration-200 group"
              title="Open in New Tab"
            >
              <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all duration-200 group"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> : <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            </button>
            <button
              onClick={handleRefresh}
              className="p-3 bg-green-100 hover:bg-green-200 rounded-xl transition-all duration-200 group"
              title="Refresh Preview"
            >
              <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-red-100 hover:bg-red-200 rounded-xl transition-all duration-200 group"
              title="Close Preview"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {previewContent ? (
            <iframe
              key={previewKey}
              srcDoc={previewContent}
              className="w-full h-full border-0 transition-opacity duration-500"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <LoadingSpinner text="Loading preview..." />
            </div>
          )}
          {previewError && (
            <div className="absolute top-4 left-4 right-4 bg-red-500/90 backdrop-blur-lg border border-red-400/30 rounded-xl p-4 text-white shadow-lg animate-slide-up">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-300" />
                <div className="font-semibold">Preview Error</div>
              </div>
              <div className="text-sm mt-1 opacity-90">{previewError}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Floating Action Buttons
const FloatingButtons = ({ onPreview, onDownload, canPreview, isDownloading }) => (
  <div className="fixed bottom-8 right-8 flex flex-col space-y-3 z-40">
    {canPreview && (
      <button
        onClick={onPreview}
        className="group w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-110"
        title="Live Preview"
      >
        <Eye className="w-6 h-6 text-white group-hover:animate-pulse" />
      </button>
    )}
    <button
      onClick={onDownload}
      disabled={isDownloading}
      className="group w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Download Project"
    >
      {isDownloading ? (
        <Loader className="w-6 h-6 text-white animate-spin" />
      ) : (
        <Download className="w-6 h-6 text-white group-hover:animate-bounce" />
      )}
    </button>
  </div>
);

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

  // =================================================================
  // START: API Key Rotation Implementation
  // =================================================================

  // 1. Store an array of API keys. Replace these with your actual keys,
  // preferably loaded from environment variables for security.
  const apiKeys = useMemo(() => [
    process.env.REACT_APP_OPENROUTER_API_KEY,
    process.env.REACT_APP_OPENROUTER_API2_KEY,
    process.env.REACT_APP_OPENROUTER_API3_KEY,
    process.env.REACT_APP_OPENAI_API4_KEY,
  ], []);

  // 2. Use a ref to keep track of the current key index across re-renders.
  const currentApiKeyIndex = useRef(0);

  /**
   * 3. A centralized fetch function that handles API key rotation.
   * - It tries the current key first.
   * - If it receives a 429 (Too Many Requests) error, it automatically tries the next key.
   * - It cycles through all available keys until one succeeds or all have failed.
   */
  const fetchWithApiKeyFallback = useCallback(async (url, options) => {
    const startIndex = currentApiKeyIndex.current;

    for (let i = 0; i < apiKeys.length; i++) {
      // Modulo operator ensures the index wraps around the array, creating a circular queue.
      const keyIndex = (startIndex + i) % apiKeys.length;
      const apiKey = apiKeys[keyIndex];

      console.log(`Trying API Key #${keyIndex + 1}...`);

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${apiKey}`,
          },
        });

        // If the request is successful, we're done.
        if (response.ok) {
          console.log(`✅ Success with API Key #${keyIndex + 1}.`);
          // Set the next request to start with the key *after* this successful one.
          // This helps distribute the load across keys.
          currentApiKeyIndex.current = (keyIndex + 1) % apiKeys.length;
          return response;
        }

        // If we hit a rate limit, log it and let the loop try the next key.
        if (response.status === 429) {
          console.warn(`🟡 Quota exceeded for API Key #${keyIndex + 1}. Trying next key.`);
          continue; // Move to the next iteration.
        }

        // For other server errors (e.g., 400, 500), it's not a quota issue. Stop trying.
        throw new Error(`API request failed with non-retriable status ${response.status}: ${response.statusText}`);

      } catch (error) {
        // This catches network errors or the explicit error thrown above.
        // If it was a critical error, re-throw it to stop the process.
        if (error.message && !error.message.includes('429')) {
          console.error(`A critical error occurred with API Key #${keyIndex + 1}:`, error.message);
          throw error;
        }
        // For network errors, we'll log it and let the loop try the next key.
        console.error(`Network or other minor error with API Key #${keyIndex + 1}, trying next...`, error);
      }
    }

    // If the loop completes, it means every single key failed.
    throw new Error('All API keys have failed or are rate-limited.');
  }, [apiKeys]);

  // =================================================================
  // END: API Key Rotation Implementation
  // =================================================================

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

  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const languages = [
    { id: 'react', name: 'React.js', ext: 'jsx', color: 'text-cyan-400', icon: '⚛️', description: 'Modern React application with hooks', gradient: 'from-cyan-400 to-blue-500' },
    { id: 'nextjs', name: 'Next.js', ext: 'jsx', color: 'text-white', icon: '▲', description: 'Full-stack React framework', gradient: 'from-gray-600 to-gray-800' },
    { id: 'vue', name: 'Vue.js', ext: 'vue', color: 'text-green-400', icon: '🔧', description: 'Progressive Vue.js application', gradient: 'from-green-400 to-emerald-500' },
    { id: 'svelte', name: 'Svelte', ext: 'svelte', color: 'text-orange-400', icon: '🔥', description: 'Compiled Svelte application', gradient: 'from-orange-400 to-red-500' },
    { id: 'html', name: 'HTML/CSS/JS', ext: 'html', color: 'text-orange-500', icon: '🌐', description: 'Vanilla web application', gradient: 'from-orange-500 to-yellow-500' },
    { id: 'typescript', name: 'TypeScript', ext: 'ts', color: 'text-blue-400', icon: '📘', description: 'Type-safe JavaScript', gradient: 'from-blue-400 to-indigo-500' },
    { id: 'python', name: 'Python', ext: 'py', color: 'text-yellow-400', icon: '🐍', description: 'Python application', gradient: 'from-yellow-400 to-orange-500' },
    { id: 'nodejs', name: 'Node.js', ext: 'js', color: 'text-green-500', icon: '🟢', description: 'Server-side JavaScript', gradient: 'from-green-500 to-teal-500' },
    { id: 'express', name: 'Express.js', ext: 'js', color: 'text-gray-400', icon: '🚀', description: 'Node.js web framework', gradient: 'from-gray-400 to-gray-600' },
    { id: 'flutter', name: 'Flutter', ext: 'dart', color: 'text-blue-300', icon: '🦋', description: 'Cross-platform mobile app', gradient: 'from-blue-300 to-sky-500' }
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
- Create multiple files with proper project folder structure (e.g., src/components, src/utils, src/styles)
- Include package.json for JavaScript-based projects with all necessary dependencies
- Use modern best practices (e.g., React Hooks, Functional Components, ES6+)
- Include comprehensive styling (Tailwind CSS preferred, or CSS Modules)
- Ensure code is complete, functional, and ready to run without placeholders
- Generate 5-10 files for a robust project structure
- Include error handling, loading states, and proper component composition
- Add comments explaining complex logic
- For React/Next.js, ensure 'App.jsx' or 'index.jsx' is the entry point
- For HTML/CSS, ensure 'index.html' is the entry point`;

      // 4. Use the new fallback function for the API call.
      const response = await fetchWithApiKeyFallback('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
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
        message: `🎉 **Project Generated Successfully!**\n\n**${parsedContent.projectInfo?.name || 'Your Project'}**\n\n${parsedContent.projectInfo?.description || ''}\n\n**Technologies:** ${parsedContent.projectInfo?.technologies?.join(', ') || langInfo.name}\n\n**Generated Files:** ${parsedContent.files.length} files\n\n🤖 **I'm now your agentic AI assistant ready to:**\n• Fix any bugs or errors you encounter\n• Add new features and functionality\n• Modify existing code and files\n• Create additional files as needed\n• Provide real-time code updates\n\nJust describe what you need and I'll update your project files automatically!`
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
        message: `❌ **Error:** ${error.message}\n\nPlease try again or check your API connection.`
      }]);
      setIsChatVisible(true);
    } finally {
      setIsGenerating(false);
    }
  }, [idea, selectedLanguage, showToast, languages, fetchWithApiKeyFallback]);

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

      const prompt = `You are an expert agentic AI developer assistant working with a ${selectedLanguage} project. You have full control to modify, create, and delete files to fulfill the user's request.

CURRENT PROJECT FILES:
${context}

RECENT CONVERSATION:
${chatHistory}

USER REQUEST: "${currentInput}"

INSTRUCTIONS:
1. Analyze the user's request deeply.
2. If they want to ADD a file or feature, create the necessary files with complete code.
3. If they report bugs, fix them in the existing files.
4. If they want to change the design, update the CSS or styling components.
5. ALWAYS provide COMPLETE file content. Do NOT use placeholders like "// ... rest of code".
6. Ensure consistency across all files (e.g., if you add a component, import it in the parent).
7. Use the following format for your response:

**Analysis:** Brief analysis of what needs to be done.
**Action:** Specific actions you are taking (e.g., "Creating src/components/NewFeature.jsx", "Updating App.jsx").

**FILES TO UPDATE/CREATE:**

\`\`\`filename:src/path/filename.ext
[Complete file content here]
\`\`\`

\`\`\`filename:src/path/newfile.ext
[Complete new file content here]
\`\`\`

**Explanation:** Explain what was changed/added and how it solves the user's request.

IMPORTANT: 
- You MUST return the full content of any file you modify. 
- If creating a new file, ensure the path is correct and follows the project structure.
- If the user asks for a new feature, think about all the files that need to be touched (e.g., new component + import in App.jsx).

Please help with this request:`;

      // 5. Use the new fallback function here as well.
      const response = await fetchWithApiKeyFallback('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
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
        if (content && content.length > 10) {
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
              const updated = [...prev];
              updated[existingFileIndex] = { ...updated[existingFileIndex], content: updateFile.content };

              if (activeFile && activeFile.name === updated[existingFileIndex].name) {
                setActiveFile(updated[existingFileIndex]);
              }

              return updated;
            } else {
              const newFile = { name: updateFile.name, content: updateFile.content };
              return [...prev, newFile];
            }
          });

          fileUpdateIndex++;

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
        message: `❌ **Error:** ${error.message}\n\nI couldn't process your request. Please try rephrasing or check the connection.`
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
      setIsStreaming(false);
      setIsUpdatingFiles(false);
      setStreamingMessage('');
    }
  }, [chatInput, files, chatMessages, selectedLanguage, fetchWithApiKeyFallback, isChatting, activeFile, showToast]);

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

  const handleAddFile = useCallback(() => {
    const fileName = prompt('Enter file name (e.g., src/components/NewComponent.jsx):');
    if (fileName) {
      const newFile = { name: fileName, content: '// New file created' };
      setFiles(prev => [...prev, newFile]);
      setActiveFile(newFile);
      showToast(`Created ${fileName}`, 'success');
    }
  }, [showToast]);

  const clearChat = useCallback(() => {
    setChatMessages([]);
    showToast('Chat history cleared', 'info');
  }, [showToast]);

  const renderMarkdown = (text) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-gray-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-700/70 px-2 py-1 rounded-md text-sm font-mono text-cyan-300 border border-gray-600/30">$1</code>')
      .replace(/```[\w]*:?[^\n]*\n([\s\S]*?)```/g, (match, code) => {
        const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre class="bg-gray-800/70 backdrop-blur p-4 my-3 rounded-xl overflow-x-auto text-sm font-mono border border-gray-600/30 shadow-lg"><code class="text-gray-100">${escapedCode}</code></pre>`;
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

  const selectedLangInfo = languages.find(l => l.id === selectedLanguage);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      <ThreeJSBackground />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <LivePreview
        files={files}
        isVisible={showPreview}
        onClose={() => setShowPreview(false)}
      />

      <FloatingButtons
        onPreview={() => setShowPreview(true)}
        onDownload={downloadProject}
        canPreview={canPreview}
        isDownloading={isDownloading}
      />

      {/* Main Layout */}
      <main className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-gray-900 rounded-lg p-2 ring-1 ring-gray-800">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Agentic AI
              </h1>
              <p className="text-[10px] text-blue-400 font-mono tracking-wider">CODE GENERATOR v2.0</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700/50">
              <div className={`w-2 h-2 rounded-full ${isGenerating || isChatting ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-xs text-gray-400 font-medium">
                {isGenerating ? 'Generating...' : isChatting ? 'Agent Active' : 'System Ready'}
              </span>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition-all duration-300 ${showSettings ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left Sidebar - Configuration & Files */}
          <div className="w-80 border-r border-gray-800/50 bg-gray-900/30 backdrop-blur-sm flex flex-col transition-all duration-300">
            {!projectGenerated ? (
              <div className="p-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Project Type</label>
                  <div className="grid grid-cols-1 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`group relative p-3 rounded-xl border transition-all duration-300 text-left ${selectedLanguage === lang.id
                            ? 'bg-gray-800 border-blue-500/50 shadow-lg shadow-blue-500/10'
                            : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{lang.icon}</span>
                            <div>
                              <div className={`font-medium ${selectedLanguage === lang.id ? 'text-white' : 'text-gray-300'}`}>
                                {lang.name}
                              </div>
                              <div className="text-[10px] text-gray-500">{lang.description}</div>
                            </div>
                          </div>
                          {selectedLanguage === lang.id && (
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${lang.gradient} animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]`}></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Project Idea</label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                    <textarea
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Describe your dream project... (e.g., A modern portfolio with 3D animations and a contact form)"
                      className="relative w-full h-32 bg-gray-900 text-gray-100 p-4 rounded-xl border border-gray-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none resize-none transition-all placeholder-gray-600 text-sm leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  onClick={generateCode}
                  disabled={isGenerating || !idea.trim()}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 group"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Architecting Solution...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 group-hover:text-yellow-300 transition-colors" />
                      <span>Generate Project</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-800/50 bg-gray-900/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center">
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Project Files
                    </h3>
                    <button
                      onClick={handleAddFile}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="New File"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 pr-2">
                    {files.map((file) => (
                      <button
                        key={file.name}
                        onClick={() => setActiveFile(file)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${activeFile?.name === file.name
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                          }`}
                      >
                        <FileIcon filename={file.name} />
                        <span className="truncate flex-1 text-left">{file.name}</span>
                        {activeFile?.name === file.name && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 mt-auto border-t border-gray-800/50 bg-gray-900/50">
                  <div className="space-y-2">
                    <button
                      onClick={resetProject}
                      className="w-full py-2.5 px-4 bg-gray-800 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 border border-gray-700 hover:border-red-500/30 group"
                    >
                      <Trash2 className="w-4 h-4 group-hover:animate-bounce" />
                      <span>Reset Project</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center - Code Editor */}
          <div className="flex-1 flex flex-col bg-[#0d1117] relative overflow-hidden">
            {projectGenerated && activeFile ? (
              <div className="flex-1 flex flex-col h-full">
                <div className="h-10 bg-gray-900/80 border-b border-gray-800 flex items-center px-4 justify-between backdrop-blur-sm">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <FileIcon filename={activeFile.name} />
                    <span className="text-gray-200">{activeFile.name}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500">{activeFile.content.length} bytes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span>Saved</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden relative group">
                  <Suspense fallback={<LoadingSpinner text="Loading Editor..." />}>
                    <CodeEditor
                      code={activeFile.content}
                      language={activeFile.name.split('.').pop()}
                      onChange={updateFileContent}
                    />
                  </Suspense>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Terminal className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-300 mb-2">Ready to Create</h3>
                <p className="max-w-md text-center text-gray-500">
                  Select a project type and describe your idea to generate a complete codebase instantly.
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Chat */}
          <div className={`w-96 border-l border-gray-800/50 bg-gray-900/30 backdrop-blur-sm flex flex-col transition-all duration-300 ${isChatVisible ? 'translate-x-0' : 'translate-x-full hidden md:flex'}`}>
            <div className="p-4 border-b border-gray-800/50 bg-gray-900/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-40 animate-pulse"></div>
                  <Bot className="relative w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-200">Agentic Assistant</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 mt-10 space-y-4">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-2xl mx-auto flex items-center justify-center transform rotate-12">
                    <MessageCircle className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-sm">Start a conversation to modify your project!</p>
                </div>
              )}

              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                  <div className="flex items-start max-w-[90%] space-x-3">
                    {msg.type === 'bot' && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    )}
                    <div className={`group relative p-4 sm:p-5 rounded-2xl max-w-sm text-sm sm:text-base shadow-xl transition-all duration-300 hover:scale-[1.02] ${msg.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-md shadow-blue-500/20'
                        : 'glass-morphism text-gray-100 rounded-tl-md border border-gray-600/30'
                      }`}>
                      <div className="prose prose-sm prose-invert leading-relaxed" dangerouslySetInnerHTML={renderMarkdown(msg.message)} />
                      {msg.fileUpdates > 0 && (
                        <div className="mt-3 text-xs text-green-400 flex items-center space-x-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                          <CheckCircle className="w-4 h-4 animate-pulse" />
                          <span>Updated {msg.fileUpdates} file(s)</span>
                          <Star className="w-3 h-3 text-yellow-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                    {msg.type === 'user' && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isStreaming && streamingMessage && (
                <div className="flex items-start space-x-3 sm:space-x-4 animate-fade-in">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="glass-morphism p-4 sm:p-5 rounded-2xl max-w-sm text-sm sm:text-base rounded-tl-md border border-gray-600/30 shadow-xl">
                    <div className="prose prose-sm prose-invert leading-relaxed" dangerouslySetInnerHTML={renderMarkdown(streamingMessage)} />
                    <div className="flex items-center space-x-1 mt-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      <span className="text-xs text-gray-400 ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {isChatting && !streamingMessage && (
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="glass-morphism p-4 rounded-2xl border border-gray-600/30">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-5 h-5 animate-spin text-blue-400" />
                      <span className="text-sm text-gray-300">Processing your request...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-gray-700/20">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
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
                    placeholder="Fix bugs, add features, create components... I'll update your files in real-time!"
                    className="w-full glass-morphism text-white p-4 pr-16 rounded-2xl border-2 border-gray-700/50 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-300 resize-none text-sm sm:text-base scrollbar-thin scrollbar-thumb-blue-500"
                    rows={3}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={isChatting || !chatInput.trim()}
                    className="absolute right-3 bottom-3 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 group"
                  >
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>Press Enter to send • Shift+Enter for new line</span>
                {isUpdatingFiles && (
                  <div className="flex items-center space-x-2 text-orange-400">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span>Files updating...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating particles for extra visual flair */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}