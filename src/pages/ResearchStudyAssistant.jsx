import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, BookOpen, Globe, Video, Brain, Search, Download, ExternalLink, TrendingUp, Lightbulb, ChevronDown, ChevronUp, Star, AlertCircle, CheckCircle, Loader2, Target } from 'lucide-react';

// Main Application Component
const ResearchStudyAssistant = () => {
  // State management for the application
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [topic, setTopic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const fileInputRef = useRef(null);

  // Load PDF.js library from a CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);


  // --- API Configuration ---
  const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const FREE_MODELS = [
    'perplexity/sonar-deep-research',
    'deepseek/deepseek-r1-0528:free',
    'huggingface/zephyr-7b-beta:free',
    'openchat/openchat-7b:free'
  ];

  // --- Core Functions ---

  /**
   * Handles the file upload event.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setError(null);
      setTopic(''); // Clear topic when a file is uploaded
    } else if (file) {
      setError('Please upload a PDF file only.');
      setUploadedFile(null);
    }
  };

  /**
   * Extracts text from a PDF file using the PDF.js library.
   * @param {File} file - The PDF file to process.
   * @returns {Promise<string>} A promise that resolves with the extracted text.
   */
  const extractTextFromPDF = async (file) => {
    if (!window.pdfjsLib) {
      throw new Error('PDF processing library is not loaded yet. Please wait a moment and try again.');
    }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + ' ';
    }
    // Limit text to avoid exceeding API context limits
    return fullText.trim().substring(0, 15000);
  };

  /**
   * Calls the OpenRouter API with a given prompt, with built-in retry logic.
   * @param {string} prompt - The prompt to send to the AI model.
   * @param {number} retryCount - The current retry attempt count.
   * @returns {Promise<string>} A promise that resolves with the AI's response.
   */
  const callOpenRouterAPI = async (prompt, retryCount = 0) => {
    const model = FREE_MODELS[retryCount % FREE_MODELS.length];
    
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENROUTER_API2_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Research Study Assistant AI'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a world-class research and study assistant AI. Your purpose is to generate comprehensive, well-structured, and accurate study guides. You must provide detailed, educational content and ensure all generated references and resources are real and verifiable. The output must be a clean JSON object without any extra text or markdown formatting.'
            },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" }, // Request JSON output
          max_tokens: 4096,
          temperature: 0.6
        })
      });

      if (!response.ok) {
        if (response.status === 429 && retryCount < FREE_MODELS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          return callOpenRouterAPI(prompt, retryCount + 1);
        }
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (err) {
      if (retryCount < FREE_MODELS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return callOpenRouterAPI(prompt, retryCount + 1);
      }
      throw err;
    }
  };

  /**
   * Creates the prompt for generating the main study guide.
   * @param {string} content - The content (from PDF or topic) to base the guide on.
   * @returns {string} The formatted prompt.
   */
  const createStudyGuidePrompt = (content) => `
    Based on the following content, create a comprehensive, research-grade study guide.
    Content: "${content.substring(0, 8000)}"

    Return a single, valid JSON object with the following structure. Do NOT include any text outside of the JSON object.
    {
      "executiveSummary": "A 3-5 paragraph summary of the key concepts, their importance, and overarching themes.",
      "studyGuide": [
        {
          "category": "Category Name (e.g., 'Core Principles', 'Advanced Applications')",
          "questions": [
            {
              "question": "A specific, insightful study question.",
              "difficulty": "Beginner, Intermediate, or Advanced",
              "studyResources": ["Suggest 3-4 types of resources to find answers (e.g., 'Chapter 1 of a standard textbook', 'Peer-reviewed articles on the topic', 'Introductory online courses')."],
              "keyPoints": ["List 4-5 essential key points or concepts to understand for this question."]
            }
          ]
        }
      ],
      "insights": ["List 4 critical insights or 'aha' moments a student should have.", "Insight 2", "..."],
      "trends": ["List 4 current or future trends related to this topic.", "Trend 2", "..."]
    }
    Generate at least 3 categories with 2-3 questions each. Ensure the content is deep and analytical.
  `;

  /**
   * Creates the prompt for finding references.
   * @param {string} topic - The topic to search references for.
   * @returns {string} The formatted prompt.
   */
  const createReferencesPrompt = (topic) => `
    For the research topic "${topic}", generate a list of real, verifiable references.
    Find at least 10 academic papers, 8 websites/articles, and 6 video resources.
    Ensure all links are real and lead to the described resource.

    Return a single, valid JSON object with the following structure. Do NOT include any text outside of the JSON object.
    {
      "references": {
        "academic": [
          {
            "title": "Paper/Book Title",
            "authors": "Author names",
            "year": "Year",
            "link": "https://actual-working-link-to-pdf-or-page.com",
            "journal": "Publication Venue (e.g., 'Nature', 'arXiv', 'IEEE Transactions')"
          }
        ],
        "websites": [
          {
            "title": "Website/Article Title",
            "link": "https://actual-working-link.com",
            "description": "A brief, 1-2 sentence description of the resource's content and value."
          }
        ],
        "videos": [
          {
            "title": "Video Title",
            "channel": "Channel Name",
            "link": "https://youtube.com/watch?v=...",
            "duration": "Approximate Duration (e.g., '15 min', '1h 30min')"
          }
        ]
      }
    }
  `;

  /**
   * Orchestrates the entire process of generating the study guide.
   */
  const handleProcess = async () => {
    if (!uploadedFile && !topic.trim()) {
      setError('Please upload a PDF or enter a topic to begin.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);
    let content = topic.trim();

    try {
      // Step 1: Extract content from PDF if provided
      if (uploadedFile) {
        setProgress(10);
        setProgressMessage('Analyzing PDF document...');
        content = await extractTextFromPDF(uploadedFile);
        if (!content || content.length < 100) {
          throw new Error('Could not extract sufficient text from the PDF. It might be an image-based PDF or corrupted.');
        }
      }

      // Step 2: Generate the main study guide
      setProgress(30);
      setProgressMessage('Generating core study guide with AI...');
      const studyGuidePrompt = createStudyGuidePrompt(content);
      const studyGuideResponse = await callOpenRouterAPI(studyGuidePrompt);
      let studyGuideData = JSON.parse(studyGuideResponse);

      // Step 3: Find additional references
      setProgress(60);
      setProgressMessage('Searching for academic references...');
      const referencesPrompt = createReferencesPrompt(content.substring(0, 200));
      const referencesResponse = await callOpenRouterAPI(referencesPrompt);
      const referencesData = JSON.parse(referencesResponse);
      
      // Step 4: Merge the results
      setProgress(90);
      setProgressMessage('Compiling your guide...');
      const finalResults = {
        ...studyGuideData,
        references: referencesData.references
      };

      setResults(finalResults);
      setActiveTab('results');
      
    } catch (err) {
      console.error('Processing error:', err);
      setError(`An error occurred: ${err.message}. The AI may be overloaded or the document could not be processed. Please try again.`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  // --- Helper & UI Functions ---

  /**
   * Toggles the visibility of a collapsible section.
   * @param {string} sectionId - The ID of the section to toggle.
   */
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  /**
   * Returns Tailwind CSS classes based on question difficulty.
   * @param {string} difficulty - The difficulty level ('Beginner', 'Intermediate', 'Advanced').
   * @returns {string} The corresponding CSS classes.
   */
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Triggers the download of the generated study guide as a JSON file.
   */
  const downloadStudyGuide = () => {
    if (!results) return;
    
    const content = JSON.stringify(results, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-guide-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Render Functions ---

  const renderUploadTab = () => (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
            <Upload className="mr-2 sm:mr-3 h-5 w-5" />
            Start Your Research Session
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1">
            Upload a PDF or enter a topic to generate a comprehensive study guide.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* PDF Upload */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                📄 Upload PDF Document
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Recommended</span>
              </h3>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-5 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
                  uploadedFile 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                }`}
              >
                <FileText className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 ${uploadedFile ? 'text-green-500' : 'text-gray-400'}`} />
                {uploadedFile ? (
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1 sm:mr-2" />
                      <p className="text-base sm:text-lg font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        fileInputRef.current.value = '';
                      }}
                      className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-semibold"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-base sm:text-lg font-medium text-gray-900">Drop your PDF here</p>
                    <p className="text-xs sm:text-sm text-gray-500">or click to browse files</p>
                    <p className="text-xs text-gray-400 mt-2">Supports: Research papers, textbooks, articles</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            {/* Topic Input */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">💡 Or Enter Research Topic</h3>
              <textarea
                value={topic}
                onChange={(e) => {
                    setTopic(e.target.value);
                    if(uploadedFile) setUploadedFile(null);
                }}
                placeholder="Enter your research topic, e.g., 'The Impact of Quantum Computing on Cryptography' or 'CRISPR Gene Editing Ethics'..."
                className="w-full h-32 sm:h-48 p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-xs sm:text-sm"
              />
            </div>
          </div>
          {/* Process Button */}
          <div className="mt-6 sm:mt-8 text-center">
            <button
              onClick={handleProcess}
              disabled={(!uploadedFile && !topic.trim()) || isProcessing}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center mx-auto space-x-2 sm:space-x-3 text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Generate Study Guide</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultsTab = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 gap-2 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 text-center sm:text-left">Your Comprehensive Study Guide</h2>
        <button
          onClick={downloadStudyGuide}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center text-xs sm:text-base"
        >
          <Download className="h-4 w-4" />
          <span>Download as JSON</span>
        </button>
      </div>
      {/* Executive Summary */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">📝 Executive Summary</h3>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-xs sm:text-base">{results.executiveSummary}</p>
        </div>
      </div>
      {/* Interactive Study Guide */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 sm:px-6 py-3 sm:py-4">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">📖 Interactive Study Guide</h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {results.studyGuide?.map((category, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(`category-${idx}`)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">{category.category}</h4>
                {expandedSections[`category-${idx}`] ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections[`category-${idx}`] && (
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white">
                  {category.questions?.map((q, qIdx) => (
                    <div key={qIdx} className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-2 sm:mb-4 gap-2 sm:gap-4">
                        <h5 className="text-sm sm:text-md font-medium text-gray-900 flex-1 pr-0 sm:pr-4">{q.question}</h5>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="space-y-2 sm:space-y-4">
                        <div>
                          <h6 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center"><BookOpen className="h-4 w-4 mr-1 sm:mr-2" />Study Resources:</h6>
                          <ul className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2 pl-4 sm:pl-5 list-disc">
                            {q.studyResources?.map((resource, rIdx) => <li key={rIdx}>{resource}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h6 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center"><Target className="h-4 w-4 mr-1 sm:mr-2" />Key Points:</h6>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {q.keyPoints?.map((point, pIdx) => (
                              <span key={pIdx} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{point}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* References Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Academic */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-3 sm:px-4 py-2 sm:py-3">
            <h4 className="text-base sm:text-lg font-bold text-white flex items-center">📚 Academic Papers ({results.references?.academic?.length || 0})</h4>
          </div>
          <div className="p-3 sm:p-4 flex-grow overflow-y-auto h-60 sm:h-96">
            {results.references?.academic?.map((ref, idx) => (
              <div key={idx} className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100 last:border-b-0">
                <a href={ref.link} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 block mb-1 hover:underline">{ref.title}</a>
                <p className="text-xs text-gray-600 mb-1">{ref.authors} ({ref.year})</p>
                <p className="text-xs text-gray-500 italic">{ref.journal}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Websites */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-3 sm:px-4 py-2 sm:py-3">
            <h4 className="text-base sm:text-lg font-bold text-white flex items-center">🌐 Web Resources ({results.references?.websites?.length || 0})</h4>
          </div>
          <div className="p-3 sm:p-4 flex-grow overflow-y-auto h-60 sm:h-96">
            {results.references?.websites?.map((site, idx) => (
              <div key={idx} className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100 last:border-b-0">
                <a href={site.link} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-medium text-green-700 hover:text-green-900 block mb-1 hover:underline">{site.title}</a>
                <p className="text-xs text-gray-600">{site.description}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Videos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 px-3 sm:px-4 py-2 sm:py-3">
            <h4 className="text-base sm:text-lg font-bold text-white flex items-center">🎥 Video Lectures ({results.references?.videos?.length || 0})</h4>
          </div>
          <div className="p-3 sm:p-4 flex-grow overflow-y-auto h-60 sm:h-96">
            {results.references?.videos?.map((video, idx) => (
              <div key={idx} className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100 last:border-b-0">
                <a href={video.link} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 block mb-1 hover:underline">{video.title}</a>
                <p className="text-xs text-gray-600">{video.channel}</p>
                <p className="text-xs text-gray-500">{video.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Insights and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-3 sm:px-4 py-2 sm:py-3">
            <h4 className="text-base sm:text-lg font-bold text-white flex items-center">💡 Critical Insights</h4>
          </div>
          <div className="p-3 sm:p-4">
            <ul className="space-y-2 sm:space-y-3">
              {results.insights?.map((insight, idx) => (
                <li key={idx} className="flex items-start">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-3 sm:px-4 py-2 sm:py-3">
            <h4 className="text-base sm:text-lg font-bold text-white flex items-center">📈 Current Trends</h4>
          </div>
          <div className="p-3 sm:p-4">
            <ul className="space-y-2 sm:space-y-3">
              {results.trends?.map((trend, idx) => (
                <li key={idx} className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-orange-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">{trend}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full lg:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 gap-2 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900">Research & Study Assistant AI</h1>
                <p className="text-xs sm:text-sm text-gray-500">Your AI-Powered Study Partner</p>
              </div>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'upload' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Upload & Process
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'results' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                disabled={!results}
              >
                Study Guide
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-full lg:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start shadow-md">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-red-800 font-medium text-xs sm:text-base">An Error Occurred</h4>
              <p className="text-red-700 text-xs sm:text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 shadow-md">
            <div className="flex items-center mb-1 sm:mb-2">
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 animate-spin mr-2 sm:mr-3" />
              <h4 className="text-blue-800 font-medium text-xs sm:text-base">Processing your request...</h4>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-blue-700 text-xs sm:text-sm mt-2 text-center font-medium">{progressMessage}</p>
          </div>
        )}
        {/* Tab Content */}
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'results' && results && renderResultsTab()}
        {activeTab === 'results' && !results && !isProcessing && (
          <div className="text-center py-8 sm:py-12 bg-white rounded-2xl shadow-xl border border-gray-200">
            <Brain className="h-10 w-10 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-xl font-semibold text-gray-600 mb-1 sm:mb-2">Your Study Guide Awaits</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Upload a document or enter a topic to get started.</p>
            <button
              onClick={() => setActiveTab('upload')}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-xs sm:text-base"
            >
              Start a New Session
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResearchStudyAssistant;
