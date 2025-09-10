import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- ICONS ---
import {
    Upload, Download, FileText, Edit3, Type, Image as ImageIcon, Plus, Trash2, Save, Loader2, Wand2, Eye, EyeOff,
    ZoomIn, ZoomOut, RotateCw, Move, Square, Circle, Minus, Copy, Paste, Undo, Redo, Settings, Palette, Bold,
    Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Hash, Quote, Link, Sparkles, Brain, PaintBucket,
    Layers, Grid, Lock, Unlock, Play, Pause, RefreshCw, Info, ChevronsLeft, ChevronsRight, ArrowLeft, ArrowRight
} from 'lucide-react';

// --- PDF LIBRARIES ---
// You need to install these: npm install react-pdf pdf-lib
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// --- PDF.js WORKER SETUP ---
// This is required by react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFEditor = () => {
    // --- CORE STATE ---
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfBytes, setPdfBytes] = useState(null); // Store original PDF bytes for editing
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

    // --- EDITOR STATE ---
    const [elements, setElements] = useState([]); // Single array for all elements
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [selectedTool, setSelectedTool] = useState('select');
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // --- AI GENERATION STATE ---
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiGenerationType, setAiGenerationType] = useState('paragraph');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [streamedText, setStreamedText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [insertPosition, setInsertPosition] = useState({ x: 50, y: 50 });

    // --- HISTORY MANAGEMENT ---
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // --- UI STATE ---
    const [sidebarTab, setSidebarTab] = useState('tools');
    const [showGrid, setShowGrid] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [isPreview, setIsPreview] = useState(false);
    const [statusBarMessage, setStatusBarMessage] = useState('Welcome! Upload a PDF to start.');

    // --- REFS ---
    const fileInputRef = useRef(null);
    const canvasContainerRef = useRef(null);
    const abortControllerRef = useRef(null);
    const selectedElement = elements.find(el => el.id === selectedElementId);

    // --- CONSTANTS ---
    const generationTypes = {
        paragraph: 'Short Paragraph (2-3 sentences)',
        description: 'Detailed Description (1-2 paragraphs)',
        section: 'Full Section (Multiple paragraphs)',
        summary: 'Summary/Abstract',
        conclusion: 'Conclusion',
        introduction: 'Introduction',
        analysis: 'Analysis/Discussion',
        list: 'Bullet Point List',
        table: 'Formatted Table',
        quote: 'Professional Quote/Citation'
    };
    const tools = [
        { id: 'select', name: 'Select', icon: Move }, { id: 'text', name: 'Text', icon: Type },
        { id: 'image', name: 'Image', icon: ImageIcon }, { id: 'rectangle', name: 'Rectangle', icon: Square },
    ];
    const fontFamilies = {
        'Helvetica': StandardFonts.Helvetica,
        'Helvetica-Bold': StandardFonts.HelveticaBold,
        'Times-Roman': StandardFonts.TimesRoman,
        'Courier': StandardFonts.Courier,
    };
    const GRID_SIZE = 20;

    // --- HISTORY MANAGEMENT ---
    const saveToHistory = useCallback((newElements) => {
        const snapshot = JSON.stringify(newElements);
        // Avoid saving duplicates if state hasn't changed
        if (history.length > 0 && snapshot === JSON.stringify(history[historyIndex])) {
            return;
        }
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newElements);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setElements(history[historyIndex - 1]);
            setSelectedElementId(null);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setElements(history[historyIndex + 1]);
            setSelectedElementId(null);
        }
    }, [history, historyIndex]);


    // --- FILE HANDLING ---
    const handleFileUpload = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            alert('Please select a valid PDF file');
            return;
        }

        setIsLoading(true);
        setStatusBarMessage('Loading PDF...');
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const bytes = new Uint8Array(e.target.result);
                setPdfBytes(bytes);
                setPdfFile(file);
                // Reset state for new file
                setElements([]);
                setHistory([]);
                setHistoryIndex(-1);
                setCurrentPage(1);
                setRotation(0);
                setZoom(100);
                setStatusBarMessage(`${file.name} loaded successfully.`);
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Error loading PDF file');
            setStatusBarMessage('Error loading PDF.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setTotalPages(numPages);
        saveToHistory([]); // Initial empty state for history
    };

    // --- ELEMENT MANIPULATION ---
    const updateElement = (id, updates) => {
        setElements(prev => {
            const newElements = prev.map(el => el.id === id ? { ...el, ...updates } : el);
            saveToHistory(newElements);
            return newElements;
        });
    };

    const addElement = (type, props) => {
        let newElement;
        const baseProps = {
            id: Date.now(),
            page: currentPage,
            x: insertPosition.x,
            y: insertPosition.y,
        };

        switch (type) {
            case 'text':
                newElement = {
                    ...baseProps, type: 'text', content: 'New Text',
                    width: 200, fontSize: 16, fontFamily: 'Helvetica', color: '#000000',
                    bold: false, italic: false, align: 'left',
                    ...props
                };
                break;
            case 'image':
                newElement = {
                    ...baseProps, type: 'image', src: '', width: 200, height: 150, ...props
                };
                break;
            case 'rectangle':
                newElement = {
                    ...baseProps, type: 'rectangle', width: 150, height: 100,
                    backgroundColor: '#3b82f6', borderColor: '#1e40af', borderWidth: 2, ...props
                };
                break;
            default:
                return;
        }
        const newElements = [...elements, newElement];
        setElements(newElements);
        saveToHistory(newElements);
        setSelectedElementId(newElement.id);
        setSelectedTool('select');
    };

    const deleteSelectedElement = () => {
        if (!selectedElementId) return;
        const newElements = elements.filter(el => el.id !== selectedElementId);
        setElements(newElements);
        saveToHistory(newElements);
        setSelectedElementId(null);
    };

    // --- AI CONTENT GENERATION (from original code, unchanged) ---
    const streamContentFromAPI = async (prompt, type) => {
        // This function is kept as provided by the user.
        const apiKey = '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';
        abortControllerRef.current = new AbortController();
        const typePrompts = {
            paragraph: `Write a concise, well-structured paragraph (2-3 sentences) about: ${prompt}. Make it informative and professional.`,
            description: `Write a detailed description (1-2 paragraphs) about: ${prompt}. Include specific details and context.`,
            section: `Write a comprehensive section about: ${prompt}. Include multiple paragraphs with proper structure and detailed information.`,
            summary: `Write a professional summary or abstract about: ${prompt}. Focus on key points and main ideas.`,
            conclusion: `Write a strong conclusion about: ${prompt}. Summarize key points and provide final thoughts.`,
            introduction: `Write an engaging introduction about: ${prompt}. Set context and capture reader interest.`,
            analysis: `Write an analytical discussion about: ${prompt}. Include insights, implications, and critical thinking.`,
            list: `Create a well-formatted bullet point list about: ${prompt}. Use • for bullets and make each point concise.`,
            table: `Create a formatted table about: ${prompt}. Use simple text formatting with clear rows and columns.`,
            quote: `Write a professional quote or citation related to: ${prompt}. Make it authoritative and well-formatted.`
        };
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.href, 'X-Title': 'PDF Editor AI Enhancement'
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-chat-v3.1:free',
                    messages: [
                        { role: 'system', content: 'You are a professional content writer. Create clear, well-formatted content based on user requirements. Use proper formatting without markdown symbols like * or #. Write naturally and professionally.' },
                        { role: 'user', content: typePrompts[type] || typePrompts.paragraph }
                    ],
                    stream: true, max_tokens: type === 'section' ? 2000 : type === 'description' ? 1000 : 500, temperature: 0.7
                }),
                signal: abortControllerRef.current.signal
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            if (content) {
                                accumulatedContent += content;
                                setStreamedText(accumulatedContent);
                            }
                        } catch (e) { /* Skip invalid JSON */ }
                    }
                }
            }
            return accumulatedContent;
        } catch (error) {
            if (error.name === 'AbortError') return 'Generation stopped by user.';
            console.error('AI generation error:', error);
            throw new Error('Failed to generate content. Please try again.');
        }
    };
    const handleAIGeneration = async () => {
        if (!aiPrompt.trim()) {
            alert('Please enter a prompt for AI generation');
            return;
        }
        setIsGenerating(true);
        setIsStreaming(true);
        setStreamedText('');
        setGeneratedContent('');
        try {
            const content = await streamContentFromAPI(aiPrompt, aiGenerationType);
            setGeneratedContent(content);
            setIsStreaming(false);
        } catch (error) {
            alert(error.message);
            setStreamedText('Error generating content.');
            setIsStreaming(false);
        } finally {
            setIsGenerating(false);
        }
    };
    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsGenerating(false);
        setIsStreaming(false);
        if (streamedText) {
            setGeneratedContent(streamedText);
        }
    };
    const insertGeneratedContent = () => {
        if (!generatedContent && !streamedText) return;
        const content = generatedContent || streamedText;
        addElement('text', { content, width: 400 });
        setGeneratedContent('');
        setStreamedText('');
        setAiPrompt('');
        setSidebarTab('style');
    };
    const generateAIImage = async () => {
        if (!aiPrompt.trim()) {
            alert('Please enter a prompt for AI image generation');
            return;
        }
        setIsGenerating(true);
        setTimeout(() => { // Simulate AI image generation
            addElement('image', {
                src: `https://picsum.photos/400/300?random=${Date.now()}`,
                isAIGenerated: true,
                prompt: aiPrompt
            });
            setIsGenerating(false);
            setAiPrompt('');
            setSidebarTab('style');
        }, 1500);
    };

    // --- CANVAS INTERACTION ---
    const handleCanvasClick = (e) => {
        if (selectedTool !== 'select') {
            const rect = canvasContainerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            addElement(selectedTool, { x, y });
        } else {
            // Deselect if clicking on the canvas background
            if (e.target === e.currentTarget) {
                setSelectedElementId(null);
            }
        }
    };

    const handleElementMouseDown = (e, id) => {
        e.stopPropagation();
        setSelectedElementId(id);
        setIsDragging(true);
        const el = elements.find(el => el.id === id);
        setDragStart({
            x: e.clientX / (zoom / 100) - el.x,
            y: e.clientY / (zoom / 100) - el.y
        });
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !selectedElement) return;
        let newX = e.clientX / (zoom / 100) - dragStart.x;
        let newY = e.clientY / (zoom / 100) - dragStart.y;

        if (snapToGrid) {
            newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
            newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
        }

        // Prevent dragging outside canvas bounds
        newX = Math.max(0, Math.min(newX, canvasSize.width - selectedElement.width));
        newY = Math.max(0, Math.min(newY, canvasSize.height - selectedElement.height));

        // Live update without saving to history for performance
        setElements(prev => prev.map(el =>
            el.id === selectedElement.id ? { ...el, x: newX, y: newY } : el
        ));
    }, [isDragging, selectedElement, dragStart, snapToGrid, zoom, canvasSize]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            saveToHistory(elements); // Save final position to history
        }
    }, [isDragging, elements, saveToHistory]);

    // --- PDF DOWNLOAD ---
    const downloadEditedPDF = async () => {
        if (!pdfBytes) return;
        setIsSaving(true);
        setStatusBarMessage('Preparing your PDF...');
        try {
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            for (const el of elements) {
                const page = pdfDoc.getPages()[el.page - 1];
                if (!page) continue;

                const { width: pageWidth, height: pageHeight } = page.getSize();
                // PDF-lib's origin is bottom-left, so we need to convert coordinates
                const y = pageHeight - el.y - (el.type === 'text' ? el.fontSize : el.height);

                switch (el.type) {
                    case 'text':
                        page.drawText(el.content, {
                            x: el.x, y: y + (el.fontSize * 0.2), // Adjust y for better alignment
                            font: helveticaFont,
                            size: el.fontSize,
                            color: hexToRgb(el.color),
                        });
                        break;
                    case 'image':
                        const imgBytes = await fetch(el.src).then(res => res.arrayBuffer());
                        const pdfImage = el.src.endsWith('.png')
                            ? await pdfDoc.embedPng(imgBytes)
                            : await pdfDoc.embedJpg(imgBytes);
                        page.drawImage(pdfImage, {
                            x: el.x, y: pageHeight - el.y - el.height,
                            width: el.width, height: el.height
                        });
                        break;
                    case 'rectangle':
                        page.drawRectangle({
                            x: el.x, y: pageHeight - el.y - el.height,
                            width: el.width, height: el.height,
                            color: hexToRgb(el.backgroundColor),
                            borderColor: hexToRgb(el.borderColor),
                            borderWidth: el.borderWidth,
                        });
                        break;
                }
            }

            const pdfResultBytes = await pdfDoc.save();
            const blob = new Blob([pdfResultBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `edited_${pdfFile.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setStatusBarMessage('Download complete!');
        } catch (error) {
            console.error('Download error:', error);
            alert('Error creating PDF. See console for details.');
            setStatusBarMessage('Error creating PDF.');
        } finally {
            setIsSaving(false);
        }
    };
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        } : { r: 0, g: 0, b: 0 };
    };


    // --- EFFECTS ---
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                deleteSelectedElement();
            }
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') { e.preventDefault(); undo(); }
                if (e.key === 'y') { e.preventDefault(); redo(); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElementId, undo, redo, elements]);


    // --- RENDER ---
    const renderElement = (el) => {
        const style = {
            position: 'absolute',
            left: `${el.x}px`, top: `${el.y}px`,
            width: `${el.width}px`,
            outline: selectedElementId === el.id ? '2px solid #3b82f6' : 'none',
            userSelect: 'none',
            transition: isDragging ? 'none' : 'outline 0.1s ease',
        };

        switch (el.type) {
            case 'text':
                return (
                    <div key={el.id} style={{ ...style, height: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: el.color, fontSize: `${el.fontSize}px`, fontFamily: el.fontFamily, fontWeight: el.bold ? 'bold' : 'normal', fontStyle: el.italic ? 'italic' : 'normal', textAlign: el.align }} onMouseDown={(e) => handleElementMouseDown(e, el.id)}>{el.content}</div>
                );
            case 'image':
                return (
                    <img key={el.id} src={el.src} alt="user content" style={{ ...style, height: `${el.height}px` }} onMouseDown={(e) => handleElementMouseDown(e, el.id)} />
                );
            case 'rectangle':
                return (
                    <div key={el.id} style={{ ...style, height: `${el.height}px`, backgroundColor: el.backgroundColor, border: `${el.borderWidth}px solid ${el.borderColor}` }} onMouseDown={(e) => handleElementMouseDown(e, el.id)} />
                );
            default:
                return null;
        }
    };

    const renderSidebar = () => (
        <div className="w-80 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-white/10">
                {[{ id: 'tools', label: 'Tools', icon: Edit3 }, { id: 'ai', label: 'AI', icon: Wand2 }, { id: 'style', label: 'Style', icon: Palette }, { id: 'layers', label: 'Layers', icon: Layers }].map(tab => (
                    <button key={tab.id} onClick={() => setSidebarTab(tab.id)} className={`flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${sidebarTab === tab.id ? 'bg-blue-600/30 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'}`}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-white">
                {sidebarTab === 'tools' && (
                    <div className="space-y-6">
                        {!pdfFile ? (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Upload PDF</h3>
                                <button onClick={() => fileInputRef.current?.click()} className="w-full p-8 border-2 border-dashed border-gray-600 hover:border-blue-400 rounded-lg transition-all bg-white/5 hover:bg-white/10 text-center">
                                    <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                                    <p className="text-gray-300 font-medium">Click to upload</p>
                                    <p className="text-gray-500 text-sm mt-1">or drag & drop</p>
                                </button>
                                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Editing Tools</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {tools.map(tool => (
                                            <button key={tool.id} onClick={() => setSelectedTool(tool.id)} className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${selectedTool === tool.id ? 'border-blue-400 bg-blue-600/30 text-blue-400' : 'border-gray-600 bg-white/5 text-gray-300 hover:border-gray-500'}`}>
                                                <tool.icon className="w-5 h-5" />
                                                <span className="text-xs">{tool.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Document Settings</h3>
                                    <div className="space-y-2">
                                        <label className="flex items-center justify-between text-sm">
                                            <span>Show Grid</span>
                                            <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="toggle-switch" />
                                        </label>
                                        <label className="flex items-center justify-between text-sm">
                                            <span>Snap to Grid</span>
                                            <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} className="toggle-switch" />
                                        </label>
                                    </div>
                                </div>
                                {selectedElementId &&
                                    <button onClick={deleteSelectedElement} className="w-full p-3 bg-red-600/30 hover:bg-red-600/50 border border-red-400/30 text-red-300 rounded-lg transition-all flex items-center gap-2 justify-center">
                                        <Trash2 className="w-4 h-4" /> Delete Selected
                                    </button>
                                }
                            </>
                        )}
                    </div>
                )}
                {sidebarTab === 'ai' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white">AI Content Generation</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
                            <select value={aiGenerationType} onChange={(e) => setAiGenerationType(e.target.value)} className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400">
                                {Object.entries(generationTypes).map(([key, label]) => (
                                    <option key={key} value={key} className="bg-gray-800">{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Describe what you want</label>
                            <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-3 text-white placeholder-gray-400 focus:border-blue-400 h-24 resize-none" placeholder="e.g., a paragraph on renewable energy benefits..."/>
                        </div>
                        <div className="space-y-3">
                            <button onClick={handleAIGeneration} disabled={isGenerating || !aiPrompt.trim()} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2">
                                {isGenerating && !isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />} Generate Text
                            </button>
                             <button onClick={generateAIImage} disabled={isGenerating || !aiPrompt.trim()} className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2">
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate Image
                            </button>
                            {isStreaming && (
                                <button onClick={stopGeneration} className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                                    <Square className="w-4 h-4" /> Stop
                                </button>
                            )}
                        </div>
                        {(streamedText || generatedContent) && (
                            <div className="space-y-3">
                                <div className="bg-black/30 border border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto">
                                    <p className="text-white text-sm whitespace-pre-wrap">{streamedText || generatedContent}</p>
                                </div>
                                <button onClick={insertGeneratedContent} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Insert into PDF
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {sidebarTab === 'style' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Styling</h3>
                        {!selectedElement ? (
                            <p className="text-gray-400 text-sm">Select an element on the canvas to see its properties.</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">ID:</span>
                                    <span className="font-mono text-xs bg-gray-700 px-2 py-1 rounded">{selectedElement.id}</span>
                                </div>
                                {selectedElement.type === 'text' && (
                                    <>
                                        <textarea value={selectedElement.content} onChange={(e) => updateElement(selectedElementId, { content: e.target.value })} className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 h-28" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs">Font Size</label>
                                                <input type="number" value={selectedElement.fontSize} onChange={(e) => updateElement(selectedElementId, { fontSize: parseInt(e.target.value) })} className="w-full mt-1 bg-black/30 border border-gray-600 rounded px-2 py-1" />
                                            </div>
                                            <div>
                                                <label className="text-xs">Color</label>
                                                <input type="color" value={selectedElement.color} onChange={(e) => updateElement(selectedElementId, { color: e.target.value })} className="w-full mt-1 h-8 p-0 border-none rounded" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateElement(selectedElementId, { bold: !selectedElement.bold })} className={`p-2 rounded ${selectedElement.bold ? 'bg-blue-500' : 'bg-gray-600'}`}><Bold size={16} /></button>
                                            <button onClick={() => updateElement(selectedElementId, { italic: !selectedElement.italic })} className={`p-2 rounded ${selectedElement.italic ? 'bg-blue-500' : 'bg-gray-600'}`}><Italic size={16} /></button>
                                            <button onClick={() => updateElement(selectedElementId, { align: 'left' })} className={`p-2 rounded ${selectedElement.align === 'left' ? 'bg-blue-500' : 'bg-gray-600'}`}><AlignLeft size={16} /></button>
                                            <button onClick={() => updateElement(selectedElementId, { align: 'center' })} className={`p-2 rounded ${selectedElement.align === 'center' ? 'bg-blue-500' : 'bg-gray-600'}`}><AlignCenter size={16} /></button>
                                            <button onClick={() => updateElement(selectedElementId, { align: 'right' })} className={`p-2 rounded ${selectedElement.align === 'right' ? 'bg-blue-500' : 'bg-gray-600'}`}><AlignRight size={16} /></button>
                                        </div>
                                    </>
                                )}
                                {(selectedElement.type === 'image' || selectedElement.type === 'rectangle') && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs">Width</label>
                                            <input type="number" value={selectedElement.width} onChange={(e) => updateElement(selectedElementId, { width: parseInt(e.target.value) })} className="w-full mt-1 bg-black/30 border border-gray-600 rounded px-2 py-1" />
                                        </div>
                                        <div>
                                            <label className="text-xs">Height</label>
                                            <input type="number" value={selectedElement.height} onChange={(e) => updateElement(selectedElementId, { height: parseInt(e.target.value) })} className="w-full mt-1 bg-black/30 border border-gray-600 rounded px-2 py-1" />
                                        </div>
                                    </div>
                                )}
                                {selectedElement.type === 'rectangle' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs">Fill Color</label>
                                            <input type="color" value={selectedElement.backgroundColor} onChange={(e) => updateElement(selectedElementId, { backgroundColor: e.target.value })} className="w-full mt-1 h-8 p-0 border-none rounded" />
                                        </div>
                                        <div>
                                            <label className="text-xs">Border Color</label>
                                            <input type="color" value={selectedElement.borderColor} onChange={(e) => updateElement(selectedElementId, { borderColor: e.target.value })} className="w-full mt-1 h-8 p-0 border-none rounded" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {sidebarTab === 'layers' && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold mb-3">Layers</h3>
                        {elements.filter(el => el.page === currentPage).length === 0 ? (
                            <p className="text-gray-400 text-sm">No elements on this page.</p>
                        ) : (
                            elements.filter(el => el.page === currentPage).map((el, index) => (
                                <div key={el.id} onClick={() => setSelectedElementId(el.id)} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedElementId === el.id ? 'bg-blue-600/30' : 'hover:bg-white/10'}`}>
                                    <div className="flex items-center gap-3">
                                        {el.type === 'text' && <Type size={16} />}
                                        {el.type === 'image' && <ImageIcon size={16} />}
                                        {el.type === 'rectangle' && <Square size={16} />}
                                        <span className="text-sm truncate">{el.type === 'text' ? el.content.substring(0, 20) + '...' : `Element ${index + 1}`}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); deleteSelectedElement(el.id); }} className="p-1 hover:text-red-400"><Trash2 size={14} /></button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden text-white font-sans">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">PDF Editor Pro</h1>
                    {pdfFile && <span className="text-sm text-gray-400 hidden md:block">{pdfFile.name}</span>}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={undo} disabled={historyIndex <= 0} className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg"><Undo className="w-4 h-4" /></button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg"><Redo className="w-4 h-4" /></button>
                    <button onClick={() => setIsPreview(!isPreview)} className={`p-2 rounded-lg transition-colors ${isPreview ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    <button onClick={downloadEditedPDF} disabled={!pdfFile || isSaving} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 rounded-lg flex items-center gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {renderSidebar()}

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col bg-slate-800/50 overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                    {pdfFile ? (
                        <>
                            {/* Editor Canvas */}
                            <div ref={canvasContainerRef} className="flex-1 overflow-auto p-8 flex justify-center items-start" onClick={handleCanvasClick}>
                                <div className="relative shadow-2xl" style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}>
                                    <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess} loading={<Loader2 className="w-8 h-8 animate-spin text-white" />}>
                                        <Page
                                            pageNumber={currentPage}
                                            onLoadSuccess={(page) => setCanvasSize({ width: page.width, height: page.height })}
                                        />
                                    </Document>
                                    {/* Editing Layer Overlay */}
                                    {!isPreview && (
                                        <div className="absolute top-0 left-0" style={{ width: canvasSize.width, height: canvasSize.height }}>
                                            {showGrid && (
                                                <div className="absolute inset-0 pointer-events-none" style={{ backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)' }} />
                                            )}
                                            {elements.filter(el => el.page === currentPage).map(renderElement)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Toolbar */}
                            <div className="bg-black/20 backdrop-blur-md border-t border-white/10 p-2 flex items-center justify-between z-10 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Page:</span>
                                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft size={16} /></button>
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ArrowLeft size={16} /></button>
                                    <input type="number" value={currentPage} onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))} className="w-12 text-center bg-gray-700 rounded" />
                                    <span className="text-gray-400">of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ArrowRight size={16} /></button>
                                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight size={16} /></button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setRotation(r => (r + 90) % 360)}><RotateCw size={16} /></button>
                                    <button onClick={() => setZoom(z => Math.max(25, z - 25))}><ZoomOut size={16} /></button>
                                    <input type="range" min="25" max="200" step="25" value={zoom} onChange={e => setZoom(parseInt(e.target.value))} />
                                    <span className="w-12 text-center">{zoom}%</span>
                                    <button onClick={() => setZoom(z => Math.min(200, z + 25))}><ZoomIn size={16} /></button>
                                </div>
                                <div className="w-1/3 text-right text-gray-400 truncate">{statusBarMessage}</div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex justify-center items-center text-center">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
                                    <p className="text-lg">Loading your document...</p>
                                </div>
                            ) : (
                                <div>
                                    <FileText className="w-24 h-24 mx-auto text-gray-600 mb-4" />
                                    <h2 className="text-2xl font-semibold mb-2">Welcome to PDF Editor Pro</h2>
                                    <p className="text-gray-400">Upload a PDF file using the sidebar to begin editing.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PDFEditor;