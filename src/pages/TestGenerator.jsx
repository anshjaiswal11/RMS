import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Clock, 
  Users, 
  Star, 
  Zap, 
  Brain,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Upload,
  Loader2,
  FileQuestion,
  BarChart3,
  Trophy,
  BookOpen,
  Lightbulb
} from 'lucide-react';

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY ;
const YOUR_SITE_URL = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';
const YOUR_SITE_NAME = process.env.REACT_APP_SITE_NAME || 'RMS Study Assistant';

const TestGenerator = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [testLevel, setTestLevel] = useState('basic');
  const [tests, setTests] = useState({});
  const [activeTest, setActiveTest] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const testLevels = [
    { id: 'basic', name: 'Basic Test', questions: 15, time: '15 mins', description: 'Perfect for starting your learning journey' },
    { id: 'medium', name: 'Medium Test', questions: 20, time: '30 mins', description: 'Ideal for practicing core concepts' },
    { id: 'advanced', name: 'Advanced Test', questions: 50, time: '90 mins', description: 'Challenge yourself with complex problems' }
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Questions',
      description: 'Intelligent question generation based on your study materials and beyond.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Clock,
      title: 'Timed Practice Tests',
      description: 'Simulate real exam conditions with customizable time limits.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Get insights into your performance with explanations for each answer.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Lightbulb,
      title: 'Learning Enhancement',
      description: 'Advanced questions that expand your knowledge beyond the PDF.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      toast.success('PDF uploaded successfully!');
    } else {
      toast.error('Please upload a valid PDF file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  // Extract text from PDF using the API
  const extractTextFromPDF = async (file) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Please upload a PDF smaller than 10MB.");
      return Promise.reject(new Error("File size exceeds limit"));
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch("https://python-api-totg.onrender.com/api/extract-text", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.text) {
        throw new Error("Failed to extract text from PDF");
      }

      return data.text;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      toast.error("Failed to process PDF. Please try again.");
      throw error;
    }
  };

  // Parse AI response into structured test data
  // Replace the parseTestResponse function with this improved version:
const parseTestResponse = (text) => {
  console.log("Raw AI Response:", text); // Debug log
  
  const questions = [];
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  let currentQuestion = null;
  let inExplanation = false;
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    // Match question pattern (more flexible)
    if (trimmedLine.match(/^Question\s*\d+[:.]/i)) {
      // Save previous question if valid
      if (currentQuestion && 
          currentQuestion.text && 
          currentQuestion.options.length >= 2 && 
          currentQuestion.correctAnswer) {
        questions.push(currentQuestion);
      }
      
      // Extract question text more robustly
      const questionText = trimmedLine.replace(/^Question\s*\d+[:.]\s*/i, '').trim();
      currentQuestion = {
        text: questionText || "Unknown question",
        options: [],
        correctAnswer: '',
        explanation: ''
      };
      inExplanation = false;
    } 
    // Match option pattern (more flexible)
    else if (currentQuestion && trimmedLine.match(/^[A-D][\).]\s+/i)) {
      // Handle options
      if (currentQuestion.options.length < 4) {
        const option = trimmedLine.replace(/^[A-D][\).]\s+/i, '').trim();
        if (option) {
          currentQuestion.options.push(option);
        }
      }
    } 
    // Match correct answer pattern
    else if (currentQuestion && trimmedLine.match(/^Correct\s+Answer[:.]\s*[A-D]/i)) {
      const answerMatch = trimmedLine.match(/[A-D]/i);
      if (answerMatch) {
        currentQuestion.correctAnswer = answerMatch[0].toUpperCase();
      }
    } 
    // Match explanation start
    else if (currentQuestion && trimmedLine.match(/^Explanation[:.]/i)) {
      currentQuestion.explanation = trimmedLine.replace(/^Explanation[:.]\s*/i, '').trim();
      inExplanation = true;
    } 
    // Continue explanation or add to current content
    else if (currentQuestion) {
      if (inExplanation && trimmedLine) {
        currentQuestion.explanation += ' ' + trimmedLine;
      }
      // Handle unstructured content that might be part of question/explanation
      else if (!inExplanation && !currentQuestion.correctAnswer && trimmedLine && 
               currentQuestion.options.length < 4) {
        // This might be part of the question text or stray content
        if (currentQuestion.text === "Unknown question") {
          currentQuestion.text = trimmedLine;
        }
      }
    }
  });
  
  // Add the last question if valid
  if (currentQuestion && 
      currentQuestion.text && 
      currentQuestion.text !== "Unknown question" &&
      currentQuestion.options.length >= 2 && 
      currentQuestion.correctAnswer) {
    questions.push(currentQuestion);
  }
  
  console.log("Parsed Questions:", questions); // Debug log
  return { questions };
};

// Also update the generateTest function with better error handling:
const generateTest = async (level) => {
  if (!file) {
    toast.error('Please upload a PDF file first.');
    return;
  }

  setIsProcessing(true);
  setUploadProgress(0);
  setTestResults(null);
  setIsSubmitted(false);
  setUserAnswers({});

  try {
    // Show progress
    setUploadProgress(30);
    const pdfContent = await extractTextFromPDF(file);
    setUploadProgress(70);

    const systemPrompt = `You are an expert academic test generator. Create a multiple-choice quiz based on the provided content.
    
    Requirements:
    - Generate exactly ${level === 'basic' ? 15 : level === 'medium' ? 20 : 50} questions
    - Use EXACTLY this format for each question:
      Question 1: [Question text]
      A) [Option A]
      B) [Option B]
      C) [Option C]
      D) [Option D]
      Correct Answer: A
      Explanation: [Detailed explanation]
      
    - For Advanced level, include some questions that extend knowledge beyond the provided content
    - All questions must have exactly 4 options (A, B, C, D)
    - Include detailed explanations for each answer
    - Do not use markdown formatting or special characters
    - Number questions sequentially (1, 2, 3, etc.)
    - Put each element on its own line
    - Do not add extra text or comments`;

    const messagesPayload = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate a ${level} level test based on:\n\n${pdfContent.substring(0, 3000)}` } // Limit content to prevent overload
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
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse the AI response into questions
    const parsedTest = parseTestResponse(aiResponse);
    
    // More lenient validation - accept even 1 valid question
    if (parsedTest.questions && parsedTest.questions.length > 0) {
      setTests(prev => ({ ...prev, [level]: parsedTest }));
      setActiveTest(parsedTest);
      setUploadProgress(100);
      toast.success(`Test generated successfully! ${parsedTest.questions.length} questions created.`);
    } else {
      console.error("No valid questions parsed from response:", aiResponse);
      throw new Error("The AI response didn't contain properly formatted questions. Please try again with a different document.");
    }
  } catch (error) {
    console.error('Error generating test:', error);
    toast.error(error.message || 'Error generating test. Please try again with a different document.');
  } finally {
    setIsProcessing(false);
  }
};

  // Handle answer selection
  const handleAnswerSelect = (questionIndex, option) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  // Submit test for evaluation
  const submitTest = async () => {
    if (!activeTest) return;
    
    setIsSubmitting(true);
    
    try {
      const totalQuestions = activeTest.questions.length;
      let correctAnswers = 0;
      const results = [];
      
      activeTest.questions.forEach((question, index) => {
        const isCorrect = userAnswers[index] === question.correctAnswer;
        if (isCorrect) correctAnswers++;
        
        results.push({
          question: question.text,
          userAnswer: userAnswers[index] || 'Not answered',
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          isCorrect
        });
      });
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      setTestResults({
        score,
        correct: correctAnswers,
        total: totalQuestions,
        results
      });
      
      setIsSubmitted(true);
      toast.success(`Test submitted! Your score: ${score}%`);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Error submitting test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset test state
  const resetTest = () => {
    setActiveTest(null);
    setUserAnswers({});
    setTestResults(null);
    setIsSubmitted(false);
  };

  // Render test questions
  const renderTest = () => {
    if (!activeTest) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
            Generate Your Practice Test
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-8 max-w-2xl mx-auto">
            Upload a PDF document to create personalized multiple-choice questions. 
            Our AI will generate tests tailored to your study material and knowledge level.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testLevels.map((level, index) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="card p-6"
              >
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">{level.questions}</span>
                  </div>
                  <h4 className="font-bold text-lg text-secondary-900 dark:text-white">
                    {level.name}
                  </h4>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    {level.time}
                  </p>
                </div>
                <p className="text-center text-secondary-600 dark:text-secondary-400 text-sm">
                  {level.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }
    
    if (!activeTest.questions || activeTest.questions.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
            No Valid Questions Generated
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            The AI couldn't generate valid questions from your document. Please try:
          </p>
          <ul className="text-left text-secondary-600 dark:text-secondary-400 max-w-md mx-auto mb-8 space-y-2">
            <li>• Upload a different PDF with clearer content</li>
            <li>• Try a different test difficulty level</li>
            <li>• Ensure your PDF contains sufficient educational content</li>
          </ul>
          <button 
            onClick={resetTest}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
            {testLevels.find(t => t.id === testLevel)?.name}
          </h3>
          {!isSubmitted && (
            <button 
              onClick={submitTest}
              disabled={isSubmitting || Object.keys(userAnswers).length === 0}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>Submit Test</span>
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="space-y-6">
          {activeTest.questions.map((question, index) => {
            // Validate question before rendering
            if (!question || !question.text || !question.options || question.options.length < 2) {
              return null;
            }
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-6"
              >
                <h4 className="font-semibold text-lg mb-4 text-secondary-900 dark:text-white">
                  {index + 1}. {question.text}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, optIndex) => {
                    const optionLetter = String.fromCharCode(65 + optIndex);
                    const isSelected = userAnswers[index] === optionLetter;
                    const isCorrect = question.correctAnswer === optionLetter;
                    const showCorrect = isSubmitted && isCorrect;
                    const showIncorrect = isSubmitted && isSelected && !isCorrect;
                    
                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleAnswerSelect(index, optionLetter)}
                        disabled={isSubmitted}
                        className={`p-4 text-left rounded-lg border transition-all ${
                          isSelected 
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                            : isSubmitted
                              ? showCorrect
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : showIncorrect
                                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                  : 'border-secondary-200 dark:border-secondary-700'
                              : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="font-medium mr-3">{optionLetter})</span>
                          <span>{option}</span>
                          {isSubmitted && (
                            <div className="ml-auto">
                              {showCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                              {showIncorrect && <FileText className="w-5 h-5 text-red-500" />}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {isSubmitted && question.explanation && (
                  <div className="mt-4 p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                    <p className="font-medium text-secondary-700 dark:text-secondary-300">
                      Explanation: {question.explanation}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {isSubmitted && testResults && (
          <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                Test Completed!
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                Score: {testResults.score}%
              </p>
              <p className="text-lg text-secondary-700 dark:text-secondary-300">
                You answered {testResults.correct} out of {testResults.total} questions correctly
              </p>
              
              <div className="flex justify-center space-x-4 mt-6">
                <button 
                  onClick={resetTest}
                  className="btn-primary"
                >
                  Generate New Test
                </button>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="btn-secondary"
                >
                  Review Answers
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>AI Test Generator | RMS - Intelligent Practice Tests</title>
        <meta name="description" content="Generate AI-powered practice tests from your study materials. Upload your PDF notes and get personalized MCQ tests with detailed performance analysis." />
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
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <FileQuestion className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white">
                AI Test Generator
              </h1>
            </div>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Upload your PDF study materials and generate personalized practice tests with AI-powered questions.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="card sticky top-24">
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">
                  Upload Your PDF
                </h2>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-secondary-300 dark:border-secondary-600 hover:border-primary-500 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-primary-600 dark:text-primary-400 font-medium">
                      Drop the PDF here...
                    </p>
                  ) : (
                    <div>
                      <p className="text-secondary-600 dark:text-secondary-400 mb-2">
                        Drag & drop a PDF file here, or click to select
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-500">
                        Supports PDF files up to 10MB
                      </p>
                    </div>
                  )}
                </div>

                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">
                          {file.name}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        Generating test...
                      </span>
                      <span className="text-sm text-secondary-500 dark:text-secondary-500">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Test Level Selection */}
                <div className="mt-8">
                  <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">
                    Select Test Level
                  </h3>
                  <div className="space-y-3">
                    {testLevels.map((level) => (
                      <motion.button
                        key={level.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTestLevel(level.id)}
                        disabled={isProcessing}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          testLevel === level.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-secondary-900 dark:text-white">
                              {level.name}
                            </h4>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                              {level.questions} questions • {level.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs px-2 py-1 bg-secondary-100 dark:bg-secondary-800 rounded-full text-secondary-700 dark:text-secondary-300">
                              {level.description}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="mt-8">
                  <button
                    onClick={() => generateTest(testLevel)}
                    disabled={!file || isProcessing}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Test...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Generate {testLevels.find(t => t.id === testLevel)?.name}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Features */}
                <div className="mt-8">
                  <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">
                    Features
                  </h3>
                  <div className="space-y-4">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-secondary-900 dark:text-white">
                              {feature.title}
                            </h4>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Test Area */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="card">
                {renderTest()}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestGenerator;