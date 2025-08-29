import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Brain, Edit3, Bot, Check, Star, AlertCircle, BookOpen, Target, Lightbulb, Loader2, Eye, EyeOff, ChevronDown, ChevronUp, Award, TrendingUp } from 'lucide-react';

const PDFTheoryPlatform = () => {
  // --- STATE MANAGEMENT ---
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfContent, setPdfContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [stage, setStage] = useState('upload'); // 'upload', 'questions'
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const fileInputRef = useRef(null);

  // --- API CALL LOGIC ---
  const callOpenRouterAPI = useCallback(async (prompt, isJson = false) => {
    const apiKey = process.env.REACT_APP_OPENROUTER_API2_KEY;
    setError('');

    const body = {
      model: "openai/gpt-oss-20b:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    };
    if (isJson) {
      body.response_format = { type: "json_object" };
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(`API Error: ${errData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      console.error("Error calling OpenRouter API:", err);
      setError(err.message || "An unknown error occurred while contacting the AI.");
      throw err;
    }
  }, []);

  // --- PDF PROCESSING ---
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setLoading(true);
      setLoadingMessage('Reading PDF content...');
      setError('');

      try {
        const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs`;

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const typedarray = new Uint8Array(e.target.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              fullText += textContent.items.map(item => item.str).join(' ') + '\n';
            }
            setPdfContent(fullText);
            
            setLoadingMessage('Generating questions and answers...');
            const prompt = `Based on the following PDF content, generate exactly 15 comprehensive theory questions with their detailed answers. Distribute them as: 5 Basic (foundational concepts), 5 Medium (application level), and 5 Hard (advanced/analytical).

For each question, provide:
1. A clear, specific question
2. Difficulty level (Basic/Medium/Hard)  
3. A comprehensive, detailed answer (150-300 words)
4. Brief explanation of difficulty rating

Return ONLY a JSON object with this structure:
{
  "questions": [
    {
      "id": 1,
      "text": "question text",
      "difficulty": "Basic|Medium|Hard",
      "answer": "detailed comprehensive answer",
      "explanation": "why this difficulty level"
    }
  ]
}

Content: """${fullText.substring(0, 15000)}"""`;

            const response = await callOpenRouterAPI(prompt, true);
            const parsedResponse = JSON.parse(response);

            if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
              const questionsWithAnswers = parsedResponse.questions.map((q, index) => ({
                ...q,
                id: index + 1
              }));
              setQuestions(questionsWithAnswers);
              setStage('questions');
              
              // Initialize states
              const initialUserAnswers = {};
              const initialShowAnswers = {};
              const initialExpanded = {};
              questionsWithAnswers.forEach(q => {
                initialUserAnswers[q.id] = '';
                initialShowAnswers[q.id] = false;
                initialExpanded[q.id] = false;
              });
              setUserAnswers(initialUserAnswers);
              setShowAnswers(initialShowAnswers);
              setExpandedQuestions(initialExpanded);
            } else {
              throw new Error("AI response did not contain valid questions array.");
            }
          } catch (err) {
            setError(err.message || 'Failed to process the PDF and generate questions.');
            setStage('upload');
          } finally {
            setLoading(false);
            setLoadingMessage('');
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        setError('Could not start PDF reading process.');
        setLoading(false);
        setLoadingMessage('');
        setStage('upload');
      }
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  // --- QUESTION MANAGEMENT ---
  const toggleAnswer = (questionId) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const toggleExpanded = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleUserAnswerChange = (questionId, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const evaluateUserAnswer = async (questionId) => {
    const question = questions.find(q => q.id === questionId);
    const userAnswer = userAnswers[questionId];
    
    if (!userAnswer.trim()) {
      setError('Please write your answer before submitting.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Evaluating your answer...');
    
    try {
      const evaluationPrompt = `You are an expert evaluator. Compare the student's answer with the correct answer and provide detailed feedback.

Question: "${question.text}"
Correct Answer: "${question.answer}"
Student's Answer: "${userAnswer}"

Provide evaluation in this JSON format ONLY:
{
  "score": integer (0-10),
  "feedback": "detailed constructive feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "grade": "A+|A|B+|B|C+|C|D|F"
}`;

      const response = await callOpenRouterAPI(evaluationPrompt, true);
      const evaluation = JSON.parse(response);
      
      setEvaluations(prev => ({
        ...prev,
        [questionId]: evaluation
      }));
      
    } catch (error) {
      setError('Failed to evaluate answer. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const resetPlatform = () => {
    setPdfFile(null);
    setPdfContent('');
    setQuestions([]);
    setUserAnswers({});
    setShowAnswers({});
    setEvaluations({});
    setExpandedQuestions({});
    setStage('upload');
    setError('');
    setActiveTab('all');
  };

  // --- UTILITY FUNCTIONS ---
  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'basic': return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'medium': return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'hard': return 'bg-rose-100 text-rose-800 border border-rose-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'basic': return '🌱';
      case 'medium': return '🔥';
      case 'hard': return '💎';
      default: return '❓';
    }
  };

  const getGradeColor = (grade) => {
    if (['A+', 'A'].includes(grade)) return 'text-green-600 bg-green-100';
    if (['B+', 'B'].includes(grade)) return 'text-blue-600 bg-blue-100';
    if (['C+', 'C'].includes(grade)) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredQuestions = questions.filter(q => {
    if (activeTab === 'all') return true;
    return q.difficulty.toLowerCase() === activeTab;
  });

  const getStats = () => {
    const evaluatedQuestions = Object.keys(evaluations);
    const totalScore = evaluatedQuestions.reduce((sum, id) => sum + evaluations[id].score, 0);
    const averageScore = evaluatedQuestions.length > 0 ? (totalScore / evaluatedQuestions.length).toFixed(1) : 0;
    
    return {
      total: questions.length,
      answered: evaluatedQuestions.length,
      average: averageScore,
      basic: questions.filter(q => q.difficulty.toLowerCase() === 'basic').length,
      medium: questions.filter(q => q.difficulty.toLowerCase() === 'medium').length,
      hard: questions.filter(q => q.difficulty.toLowerCase() === 'hard').length
    };
  };

  const stats = getStats();

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PDF Theory Master
            </h1>
          </div>
          <p className="text-gray-600 text-base sm:text-xl max-w-xl sm:max-w-2xl mx-auto">
            Transform your PDF notes into interactive learning experiences with AI-powered questions and evaluations
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className="max-w-lg sm:max-w-4xl mx-auto mb-6 sm:mb-8">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 sm:p-6 rounded-r-xl shadow-sm">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mr-2 sm:mr-3" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-red-700 text-sm sm:text-base">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Stage */}
        {stage === 'upload' && (
          <div className="max-w-md sm:max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-12 border border-white/20">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6 sm:mb-8">
                  <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">Upload Your Study Material</h2>
                <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8 max-w-xs sm:max-w-md mx-auto">
                  Upload your PDF notes and our AI will generate comprehensive questions with detailed answers across three difficulty levels.
                </p>
                <input type="file" accept=".pdf" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-10 py-3 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 sm:gap-3 mx-auto shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs sm:text-base">{loadingMessage}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                      Choose PDF File
                    </>
                  )}
                </button>
                {pdfFile && !loading && (
                  <div className="mt-4 sm:mt-6 p-2 sm:p-4 bg-blue-50 rounded-xl border border-blue-200 inline-block">
                    <p className="text-blue-800 font-medium flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      {pdfFile.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Questions Stage */}
        {stage === 'questions' && (
          <div className="max-w-full sm:max-w-7xl mx-auto">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Questions</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Answered</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.answered}</p>
                  </div>
                  <Edit3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.average}/10</p>
                  </div>
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Progress</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900">{Math.round((stats.answered/stats.total)*100)}%</p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                </div>
              </div>
              <button
                onClick={resetPlatform}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 shadow-lg px-2 sm:px-0 py-2 sm:py-0"
              >
                <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-base">New PDF</span>
              </button>
            </div>

            {/* Difficulty Tabs */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 sm:p-2 shadow-lg border border-white/20 inline-flex flex-wrap">
                {[
                  { key: 'all', label: 'All Questions', count: stats.total },
                  { key: 'basic', label: 'Basic', count: stats.basic },
                  { key: 'medium', label: 'Medium', count: stats.medium },
                  { key: 'hard', label: 'Hard', count: stats.hard }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 text-xs sm:text-base ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Grid */}
            <div className="grid gap-4 sm:gap-8">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                  {/* Question Header */}
                  <div className="p-4 sm:p-8 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-2 sm:mb-4 gap-2 sm:gap-0">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-base sm:text-xl font-bold text-blue-600">Q{question.id}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getDifficultyClass(question.difficulty)}`}>
                              {getDifficultyIcon(question.difficulty)} {question.difficulty}
                            </span>
                            {evaluations[question.id] && (
                              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getGradeColor(evaluations[question.id].grade)}`}>
                                Grade: {evaluations[question.id].grade}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-xl font-semibold text-gray-800 leading-relaxed">
                            {question.text}
                          </h3>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpanded(question.id)}
                        className="p-1 sm:p-2 rounded-full hover:bg-white/50 transition-colors"
                      >
                        {expandedQuestions[question.id] ? (
                          <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                        )}
                      </button>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm">{question.explanation}</p>
                  </div>

                  {/* Question Content */}
                  {expandedQuestions[question.id] && (
                    <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                      {/* Show/Hide Answer Button */}
                      <div className="flex gap-2 sm:gap-4">
                        <button
                          onClick={() => toggleAnswer(question.id)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl text-xs sm:text-base"
                        >
                          {showAnswers[question.id] ? (
                            <>
                              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                              Hide Answer
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                              Show Answer
                            </>
                          )}
                        </button>
                      </div>

                      {/* AI Answer */}
                      {showAnswers[question.id] && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-3 sm:p-6 border border-purple-200">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                            <Bot className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                            <h4 className="text-base sm:text-lg font-semibold text-purple-800">AI Generated Answer</h4>
                          </div>
                          <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-xs sm:text-base">{question.answer}</p>
                          </div>
                        </div>
                      )}

                      {/* User Answer Section */}
                      <div className="space-y-2 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Edit3 className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                          <h4 className="text-base sm:text-lg font-semibold text-gray-800">Write Your Answer</h4>
                        </div>
                        <textarea
                          value={userAnswers[question.id] || ''}
                          onChange={(e) => handleUserAnswerChange(question.id, e.target.value)}
                          placeholder="Write your comprehensive answer here..."
                          rows="4"
                          className="w-full p-2 sm:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-none bg-white/50 backdrop-blur-sm text-xs sm:text-base"
                        />
                        <button
                          onClick={() => evaluateUserAnswer(question.id)}
                          disabled={loading || !userAnswers[question.id]?.trim()}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl text-xs sm:text-base"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
                              Evaluating...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                              Submit & Evaluate
                            </>
                          )}
                        </button>
                      </div>

                      {/* Evaluation Results */}
                      {evaluations[question.id] && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-3 sm:p-6 border border-blue-200 space-y-3 sm:space-y-6">
                          <div className="flex flex-col sm:flex-row items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Star className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-500" />
                              <h4 className="text-base sm:text-lg font-semibold text-gray-800">Evaluation Results</h4>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4">
                              <div className="text-right">
                                <div className="text-xl sm:text-3xl font-bold text-blue-600">{evaluations[question.id].score}/10</div>
                                <div className="flex">
                                  {[...Array(10)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                        i < evaluations[question.id].score ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                            {evaluations[question.id].strengths.length > 0 && (
                              <div className="bg-green-50 rounded-xl p-2 sm:p-4 border border-green-200">
                                <h5 className="font-semibold text-green-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                                  Strengths
                                </h5>
                                <ul className="space-y-1 sm:space-y-2">
                                  {evaluations[question.id].strengths.map((strength, idx) => (
                                    <li key={idx} className="text-green-700 text-xs sm:text-sm">• {strength}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {evaluations[question.id].improvements.length > 0 && (
                              <div className="bg-orange-50 rounded-xl p-2 sm:p-4 border border-orange-200">
                                <h5 className="font-semibold text-orange-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
                                  Areas for Improvement
                                </h5>
                                <ul className="space-y-1 sm:space-y-2">
                                  {evaluations[question.id].improvements.map((improvement, idx) => (
                                    <li key={idx} className="text-orange-700 text-xs sm:text-sm">• {improvement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="bg-white rounded-xl p-2 sm:p-4 border border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-xs sm:text-base">Detailed Feedback</h5>
                            <p className="text-gray-700 leading-relaxed text-xs sm:text-base">{evaluations[question.id].feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Expand/Collapse All */}
            <div className="flex justify-center mt-6 sm:mt-8">
              <button
                onClick={() => {
                  const allExpanded = Object.values(expandedQuestions).every(Boolean);
                  const newState = {};
                  questions.forEach(q => {
                    newState[q.id] = !allExpanded;
                  });
                  setExpandedQuestions(newState);
                }}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl text-xs sm:text-base"
              >
                {Object.values(expandedQuestions).every(Boolean) ? (
                  <>
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    Expand All
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFTheoryPlatform;