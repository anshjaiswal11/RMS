import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Target, Brain, TrendingUp, Award, BookOpen, MessageCircle, Zap, CheckCircle, AlertTriangle, Star, Download, Eye, Users, Calendar, Globe, Briefcase, Settings, ChevronRight, ArrowRight, BarChart3, Lightbulb, Clock, DollarSign, Edit, FileDown, Sparkles, RefreshCw, Wand2 } from 'lucide-react';

const AICareerPlatform = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [analysisStage, setAnalysisStage] = useState('');
  const [error, setError] = useState('');
  const [tailoredResume, setTailoredResume] = useState(null);
  const [projectSuggestions, setProjectSuggestions] = useState([]);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const fileInputRef = useRef(null);

  // Production API Configuration - Built-in API key
  const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API2_KEY;
  const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const MODEL_NAME = 'openai/gpt-4o-mini'; // Updated model for better performance

  // --- Start of Fix ---
  // A more robust function to parse potentially malformed JSON from the AI
  const parseAIResponse = (responseString) => {
    try {
        // First, try to find the start of a JSON object '{' or array '['
        const firstBrace = responseString.indexOf('{');
        const firstBracket = responseString.indexOf('[');
        
        let startIndex;
        if (firstBrace === -1 && firstBracket === -1) {
            throw new Error('No JSON object or array found in the AI response.');
        }
        if (firstBrace !== -1 && (firstBrace < firstBracket || firstBracket === -1)) {
            startIndex = firstBrace;
        } else {
            startIndex = firstBracket;
        }

        // Find the corresponding closing bracket or brace
        const lastBrace = responseString.lastIndexOf('}');
        const lastBracket = responseString.lastIndexOf(']');
        
        let endIndex;
        if (lastBrace === -1 && lastBracket === -1) {
             throw new Error('Could not find the end of the JSON object or array.');
        }
        if (startIndex === firstBrace) {
            endIndex = lastBrace;
        } else {
            endIndex = lastBracket;
        }

        if (endIndex === -1 || endIndex < startIndex) {
            throw new Error('Mismatched JSON delimiters in the AI response.');
        }

        // Extract the JSON substring
        const jsonSubstring = responseString.substring(startIndex, endIndex + 1);
        
        // Parse the extracted substring
        return JSON.parse(jsonSubstring);
    } catch (e) {
        console.error("Failed to parse AI response:", e);
        console.error("Original response string:", responseString);
        throw new Error(`Invalid response format from AI: ${e.message}`);
    }
  };
  // --- End of Fix ---

  // Extract text from PDF using File API (simplified for demo)
  const extractTextFromPDF = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // In production, use a proper PDF parsing library like pdf-parse or PDF.js
        // For now, we'll simulate text extraction
        const text = `Resume Content: ${file.name}\n\nNote: In production, implement proper PDF text extraction using libraries like pdf-parse, PDF.js, or server-side solutions.`;
        resolve(text);
      };
      reader.readAsText(file);
    });
  };

  // Make API call to OpenRouter
  const callOpenRouterAPI = async (messages, systemPrompt) => {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Career Platform'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  // Resume Analysis using AI
  const analyzeResumeWithAI = async (resumeContent, jd) => {
    const systemPrompt = `You are an expert HR analyst and ATS specialist. Analyze resumes against job descriptions and provide comprehensive scoring and insights.

Your analysis should be thorough, actionable, and include:
1. Overall compatibility score (0-100)
2. ATS optimization score (0-100)
3. Selection chances assessment
4. Detailed skill gap analysis
5. Specific improvement recommendations
6. Market insights and salary expectations

Return your response in valid JSON format only.`;

    const userMessage = `Please analyze this resume against the job description and provide a comprehensive assessment:

RESUME CONTENT:
${resumeContent}

JOB DESCRIPTION:
${jd}

Please provide your analysis in this exact JSON format:
{
  "overallScore": number (0-100),
  "atsScore": number (0-100),
  "selectionChances": "Low/Medium/High/Very High",
  "matchPercentage": number (0-100),
  "keyStrengths": ["strength1", "strength2", "strength3", "strength4"],
  "criticalGaps": [
    {"skill": "skillname", "impact": "Low/Medium/High", "priority": number(1-3), "recommendation": "specific advice"}
  ],
  "skillAnalysis": {
    "matched": ["skill1", "skill2"],
    "missing": ["skill1", "skill2"],
    "emerging": ["skill1", "skill2"]
  },
  "atsOptimization": {
    "keywordDensity": number (0-100),
    "formatScore": number (0-100),
    "structureScore": number (0-100),
    "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
  },
  "resumeImprovements": {
    "contentSuggestions": ["improvement1", "improvement2"],
    "keywordOptimization": ["keyword1", "keyword2"],
    "structuralChanges": ["change1", "change2"]
  },
  "careerPath": {
    "currentLevel": "job level",
    "nextLevel": "next job level",
    "timeToPromotion": "time estimate",
    "requiredSkills": ["skill1", "skill2"]
  },
  "marketInsights": {
    "salaryRange": "salary range",
    "demandLevel": "Low/Medium/High/Very High",
    "competitionLevel": "Low/Medium/High/Very High",
    "trendingSkills": ["skill1", "skill2", "skill3"]
  },
  "certificationRecommendations": [
    {"name": "cert name", "provider": "provider", "priority": "Low/Medium/High", "timeToComplete": "time"}
  ],
  "projectSuggestions": [
    {"title": "project title", "description": "brief description", "skills": ["skill1", "skill2"], "timeline": "time"}
  ]
}`;

    const response = await callOpenRouterAPI([{ role: 'user', content: userMessage }], systemPrompt);
    return parseAIResponse(response); // Use robust parser
  };

  // Generate Tailored Resume
  const generateTailoredResume = async (originalResume, jobDescription, analysisData) => {
    const systemPrompt = `You are a professional resume writer and career coach with expertise in ATS optimization. Your task is to enhance and tailor the user's original resume to maximize their chances of selection for the target job description.

CRITICAL REQUIREMENTS:
1.  **DO NOT REMOVE CONTENT**: You must not remove any skills, projects, work experiences, or certifications mentioned in the original resume. All original information must be preserved.
2.  **ENHANCE AND REFINE**: Your primary role is to improve the user's existing content. This includes:
    * Rewriting the professional summary to be more compelling and targeted.
    * Improving the structure and wording of project and experience descriptions.
    * Correcting any grammatical or verbal errors.
    * Quantifying achievements where possible to show impact.
    * Highlighting relevant skills and experiences that align with the job description.
    * Adding any missing information that could strengthen the application.
    * Ensuring consistency in formatting and style throughout the resume.
3.  **ATS OPTIMIZATION**: Integrate keywords from the job description naturally into the existing content.
4.  **PROFESSIONAL FORMATTING**: Present the enhanced content in a clean, professional, and easily scannable format within the provided JSON structure.`;

    const userMessage = `Please enhance and tailor the following resume based on the provided job description and analysis. It is crucial that you improve the existing content without removing any of the user's listed experiences, skills, projects, or certifications.

ORIGINAL RESUME:
${originalResume}

TARGET JOB DESCRIPTION:
${jobDescription}

ANALYSIS INSIGHTS:
${JSON.stringify(analysisData, null, 2)}

Using the original resume content, populate the following JSON structure. Enhance the content as you do so, focusing on improving the summary, project structure, and correcting errors, while ensuring all original information is included.
{
  "personalInfo": {
    "name": "Full Name",
    "title": "Professional Title",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State",
    "linkedin": "linkedin profile",
    "portfolio": "portfolio URL"
  },
  "professionalSummary": "Compelling 3-4 line summary optimized for the target role",
  "coreSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
  "professionalExperience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start Date - End Date",
      "achievements": [
        "Quantified achievement 1 with specific metrics",
        "Quantified achievement 2 with impact",
        "Quantified achievement 3 with results"
      ]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Brief description with technologies used",
      "achievements": ["Key achievement 1", "Key achievement 2"],
      "technologies": ["tech1", "tech2", "tech3"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Graduation Year",
      "gpa": "GPA if relevant"
    }
  ],
  "certifications": ["Cert 1", "Cert 2", "Cert 3"],
  "atsOptimizations": {
    "keywordsDensity": "percentage",
    "improvementsMade": ["improvement1", "improvement2"],
    "atsScore": "predicted ATS score"
  }
}`;

    const response = await callOpenRouterAPI([{ role: 'user', content: userMessage }], systemPrompt);
    return parseAIResponse(response); // Use robust parser
  };

  // Generate Project Suggestions
  const generateProjectSuggestions = async (skillGaps, jobDescription, careerLevel) => {
    const systemPrompt = `You are a senior career advisor specializing in project-based skill development. Generate 4-5 detailed project ideas that help bridge skill gaps and align with the target job requirements.

Each project should be:
1. Practical and implementable
2. Directly relevant to job requirements
3. Showcase missing skills
4. Appropriate for career level
5. Include specific deliverables and timeline`;

    const userMessage = `Generate 4-5 detailed project suggestions for:

SKILL GAPS TO ADDRESS:
${JSON.stringify(skillGaps, null, 2)}

TARGET JOB DESCRIPTION:
${jobDescription}

CAREER LEVEL: ${careerLevel}

Return in this JSON format:
{
  "projects": [
    {
      "title": "Project Title",
      "description": "Detailed project description (2-3 sentences)",
      "skillsAddressed": ["skill1", "skill2", "skill3"],
      "deliverables": ["deliverable1", "deliverable2", "deliverable3"],
      "timeline": "estimated completion time",
      "difficulty": "Beginner/Intermediate/Advanced",
      "tools": ["tool1", "tool2", "tool3"],
      "businessValue": "how this project demonstrates business value",
      "portfolioImpact": "how this enhances the portfolio"
    }
  ]
}`;

    const response = await callOpenRouterAPI([{ role: 'user', content: userMessage }], systemPrompt);
    return parseAIResponse(response); // Use robust parser
  };

  // Generate Interview Questions using AI
  const generateInterviewQuestionsWithAI = async (resumeContent, jd) => {
    const systemPrompt = `You are an expert technical interviewer and career coach. Generate personalized interview questions based on the candidate's resume and target job description.

Create questions that are:
1. Relevant to both the candidate's background and the job requirements
2. Varied in difficulty and category
3. Include detailed answers and follow-up questions
4. Prioritized by relevance to the specific role

Return your response in valid JSON format only.`;

    // NOTE: Reduced the number of requested questions from "15-20" to "10-12"
    // to prevent the AI response from being truncated, which was causing JSON parsing errors.
    const userMessage = `Based on this resume and job description, generate 10-12 comprehensive interview questions with detailed answers:

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jd}

Return in this exact JSON format:
{
  "questions": [
    {
      "id": number,
      "category": "Technical/Behavioral/System Design/Problem Solving/Leadership/Cultural Fit",
      "difficulty": "Easy/Medium/Hard",
      "question": "the interview question",
      "detailedAnswer": "comprehensive answer with examples and structure",
      "keyPoints": ["point1", "point2", "point3"],
      "followUpQuestions": ["follow-up 1", "follow-up 2"],
      "relevanceScore": number (0-100),
      "timeToAnswer": "estimated time in minutes",
      "tips": "specific tips for answering this question"
    }
  ],
  "interviewStrategy": {
    "openingApproach": "how to start the interview",
    "closingQuestions": ["question1", "question2"],
    "storyBank": ["story theme 1", "story theme 2"],
    "commonPitfalls": ["pitfall1", "pitfall2"]
  }
}`;

    const response = await callOpenRouterAPI([{ role: 'user', content: userMessage }], systemPrompt);
    return parseAIResponse(response); // Use robust parser
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }
    
    setResumeFile(file);
    setError('');
    
    try {
      const text = await extractTextFromPDF(file);
      setResumeText(text);
    } catch (error) {
      setError('Failed to extract text from PDF');
      console.error('PDF extraction error:', error);
    }
  }, []);

  // Main analysis function
  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError('Please upload a resume');
      return;
    }
    
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      // Stage 1: Resume Analysis
      setAnalysisStage('Analyzing resume compatibility and ATS optimization...');
      const analysisResult = await analyzeResumeWithAI(resumeText, jobDescription);
      
      // Stage 2: Generate Tailored Resume
      setAnalysisStage('Creating optimized resume tailored for maximum ATS score...');
      const tailoredResumeResult = await generateTailoredResume(resumeText, jobDescription, analysisResult);
      
      // Stage 3: Generate Project Suggestions
      setAnalysisStage('Generating personalized project recommendations...');
      const projectsResult = await generateProjectSuggestions(
        analysisResult.skillAnalysis.missing,
        jobDescription,
        analysisResult.careerPath.currentLevel
      );
      
      // Stage 4: Generate Interview Questions
      setAnalysisStage('Preparing personalized interview questions...');
      const questionsResult = await generateInterviewQuestionsWithAI(resumeText, jobDescription);
      
      setAnalysis(analysisResult);
      setTailoredResume(tailoredResumeResult);
      setProjectSuggestions(projectsResult.projects || []);
      setInterviewQuestions(questionsResult.questions || []);
      setActiveTab('dashboard');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  // Generate Resume Function
  const handleGenerateResume = async () => {
    if (!analysis) return;
    
    setIsGeneratingResume(true);
    try {
      const optimizedResume = await generateTailoredResume(resumeText, jobDescription, analysis);
      setTailoredResume(optimizedResume);
      setActiveTab('resume');
    } catch (error) {
      setError(`Resume generation failed: ${error.message}`);
    } finally {
      setIsGeneratingResume(false);
    }
  };

  // Download Resume Function
  const downloadResume = () => {
    if (!tailoredResume) return;
    
    const resumeContent = formatResumeForDownload(tailoredResume);
    const blob = new Blob([resumeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tailored-resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format Resume for Download
  const formatResumeForDownload = (resume) => {
    return `${resume.personalInfo.name}
${resume.personalInfo.title}
${resume.personalInfo.email} | ${resume.personalInfo.phone} | ${resume.personalInfo.location}
LinkedIn: ${resume.personalInfo.linkedin || 'N/A'}
Portfolio: ${resume.personalInfo.portfolio || 'N/A'}

PROFESSIONAL SUMMARY
${resume.professionalSummary}

CORE SKILLS
${resume.coreSkills.join(' • ')}

PROFESSIONAL EXPERIENCE
${resume.professionalExperience.map(exp => 
`${exp.title} at ${exp.company} (${exp.duration})
${exp.achievements.map(achievement => `• ${achievement}`).join('\n')}`
).join('\n\n')}

PROJECTS
${resume.projects.map(project => 
`${project.title}
${project.description}
Technologies: ${project.technologies.join(', ')}
${project.achievements.map(achievement => `• ${achievement}`).join('\n')}`
).join('\n\n')}

EDUCATION
${resume.education.map(edu => 
`${edu.degree} - ${edu.institution} (${edu.year})`
).join('\n')}

CERTIFICATIONS
${resume.certifications.join(' • ')}

ATS OPTIMIZATION SCORE: ${resume.atsOptimizations.atsScore}%
Keywords Density: ${resume.atsOptimizations.keywordsDensity}`;
  };

  // UI Components
  const ScoreCircle = ({ score, label, color = 'blue', size = 'lg' }) => {
    const sizeClasses = size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-16 h-16 text-lg';
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg className={`${sizeClasses} transform -rotate-90`} viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={`text-${color}-500 transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-bold ${size === 'lg' ? 'text-2xl' : 'text-lg'} text-gray-700`}>
              {score}
            </span>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-600 mt-2 text-center">{label}</span>
      </div>
    );
  };

  const SkillTag = ({ skill, status, priority, className = "" }) => {
    const statusColors = {
      matched: 'bg-green-100 text-green-800 border-green-200',
      missing: priority === 1 
        ? 'bg-red-100 text-red-800 border-red-200' 
        : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      emerging: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status]} ${className}`}>
        {skill}
        {status === 'missing' && priority === 1 && (
          <AlertTriangle className="ml-1 h-3 w-3" />
        )}
      </span>
    );
  };

  const QuestionCard = ({ question, isSelected, onSelect }) => {
    const difficultyColors = {
      Easy: 'text-green-600 bg-green-50',
      Medium: 'text-yellow-600 bg-yellow-50',
      Hard: 'text-red-600 bg-red-50'
    };
    
    return (
      <div 
        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onSelect(question)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[question.difficulty]}`}>
              {question.difficulty}
            </span>
            <span className="text-xs text-gray-500">{question.category}</span>
            <span className="text-xs text-gray-500">Score: {question.relevanceScore}%</span>
          </div>
          <Clock className="h-4 w-4 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-800 line-clamp-2">
          {question.question}
        </p>
        {question.timeToAnswer && (
          <p className="text-xs text-gray-500 mt-2">Est. time: {question.timeToAnswer}</p>
        )}
      </div>
    );
  };

  // Render different tabs
  const renderSetupTab = () => (
  <div className="max-w-4xl mx-auto space-y-8 px-2 sm:px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Career Optimization Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Get personalized insights, tailored resumes, and comprehensive career guidance powered by advanced AI
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Production-ready with built-in AI capabilities</p>
          </div>
        </div>
      </div>

      {/* File Upload */}
  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Upload Your Resume</h2>
        </div>
        
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {resumeFile ? resumeFile.name : 'Click to upload your resume'}
          </p>
          <p className="text-gray-500">Supports PDF format</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        
        {resumeFile && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Resume uploaded successfully!</span>
            </div>
          </div>
        )}
      </div>

      {/* Job Description */}
  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Target Job Description</h2>
        </div>
        
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the complete job description here. Include requirements, responsibilities, and qualifications for best results..."
          rows={8}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
        />
        
        {jobDescription && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Job description ready for analysis ({jobDescription.length} characters)
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !resumeFile || !jobDescription}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 sm:py-4 sm:px-12 rounded-lg text-base sm:text-lg transition-all inline-flex items-center gap-3 shadow-lg w-full sm:w-auto"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {analysisStage || 'Processing...'}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Start Complete AI Analysis
            </>
          )}
        </button>
        
        <p className="text-gray-600 mt-4 text-sm">
          This will analyze your resume, generate a tailored version, create project suggestions, and prepare interview questions
        </p>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!analysis) return null;

    return (
  <div className="max-w-7xl mx-auto space-y-8 px-2 sm:px-6">
        {/* Header with key scores */}
  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-8 text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Career Analysis Dashboard</h1>
              <p className="text-blue-100">Comprehensive AI-powered career insights and optimization</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleGenerateResume}
                disabled={isGeneratingResume}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                {isGeneratingResume ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate Tailored Resume
                  </>
                )}
              </button>
              {tailoredResume && (
                <button
                  onClick={() => setActiveTab('resume')}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Resume
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <ScoreCircle score={analysis.overallScore} label="Overall Match" color="white" />
            <ScoreCircle score={analysis.atsScore} label="ATS Score" color="white" />
            <ScoreCircle score={analysis.matchPercentage} label="Skill Match" color="white" />
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{analysis.selectionChances}</div>
              <div className="text-blue-100">Selection Chances</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('resume')}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tailored Resume</h3>
                <p className="text-sm text-gray-600">ATS-optimized for this job</p>
              </div>
            </div>
            {tailoredResume && (
              <div className="text-sm text-green-600 font-medium">
                ✓ Generated with {tailoredResume.atsOptimizations?.atsScore}% ATS Score
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('projects')}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Project Ideas</h3>
                <p className="text-sm text-gray-600">Bridge your skill gaps</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {projectSuggestions.length} personalized projects
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('interview')}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Interview Prep</h3>
                <p className="text-sm text-gray-600">Personalized questions</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {interviewQuestions.length} targeted questions
            </div>
          </div>
        </div>

        {/* Key Strengths and Critical Gaps */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold">Key Strengths</h3>
            </div>
            <ul className="space-y-2">
              {analysis.keyStrengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-semibold">Critical Skill Gaps</h3>
            </div>
            <div className="space-y-3">
              {analysis.criticalGaps.map((gap, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{gap.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        gap.impact === 'High' ? 'bg-red-100 text-red-800' :
                        gap.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {gap.impact} Impact
                      </span>
                      <span className="text-xs text-gray-500">Priority {gap.priority}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{gap.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="h-6 w-6 text-purple-600" />
            <h3 className="text-xl font-semibold">Skills Analysis</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Matched Skills ({analysis.skillAnalysis.matched.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.skillAnalysis.matched.map(skill => (
                  <SkillTag key={skill} skill={skill} status="matched" />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Missing Skills ({analysis.skillAnalysis.missing.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.skillAnalysis.missing.map(skill => (
                  <SkillTag key={skill} skill={skill} status="missing" priority={1} />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-purple-700 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Emerging Skills ({analysis.skillAnalysis.emerging.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.skillAnalysis.emerging.map(skill => (
                  <SkillTag key={skill} skill={skill} status="emerging" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Career Path and Market Insights */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              <h3 className="text-xl font-semibold">Career Path</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Current Level</span>
                <span className="font-medium">{analysis.careerPath.currentLevel}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Next Level</span>
                <span className="font-medium">{analysis.careerPath.nextLevel}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Time to Promotion</span>
                <span className="font-medium">{analysis.careerPath.timeToPromotion}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Required Skills for Next Level:</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.careerPath.requiredSkills.map(skill => (
                    <SkillTag key={skill} skill={skill} status="emerging" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold">Market Insights</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Salary Range
                </span>
                <span className="font-medium text-green-600">{analysis.marketInsights.salaryRange}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Market Demand</span>
                <span className={`font-medium ${
                  analysis.marketInsights.demandLevel === 'High' || analysis.marketInsights.demandLevel === 'Very High' 
                    ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {analysis.marketInsights.demandLevel}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Competition Level</span>
                <span className={`font-medium ${
                  analysis.marketInsights.competitionLevel === 'Low' || analysis.marketInsights.competitionLevel === 'Medium' 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analysis.marketInsights.competitionLevel}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Trending Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {analysis.marketInsights.trendingSkills.map(skill => (
                    <SkillTag key={skill} skill={skill} status="emerging" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certification Recommendations */}
        {analysis.certificationRecommendations && analysis.certificationRecommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="h-6 w-6 text-orange-600" />
              <h3 className="text-xl font-semibold">Recommended Certifications</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.certificationRecommendations.map((cert, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{cert.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      cert.priority === 'High' ? 'bg-red-100 text-red-800' :
                      cert.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {cert.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{cert.provider}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{cert.timeToComplete}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderResumeTab = () => {
    if (!tailoredResume) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">
              No Tailored Resume Generated
            </h3>
            <p className="text-gray-400 mb-6">
              Generate a tailored resume optimized for your target job
            </p>
            <button
              onClick={handleGenerateResume}
              disabled={isGeneratingResume}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
            >
              {isGeneratingResume ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate Tailored Resume
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
  <div className="max-w-5xl mx-auto space-y-6 px-2 sm:px-4">
        {/* Header */}
  <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-4 sm:p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tailored Resume</h1>
              <p className="text-green-100">ATS-optimized resume specifically crafted for your target job</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{tailoredResume.atsOptimizations?.atsScore || 'N/A'}%</div>
                <div className="text-green-100 text-sm">ATS Score</div>
              </div>
              <button
                onClick={downloadResume}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* ATS Optimization Metrics */}
  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold">ATS Optimization Metrics</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {tailoredResume.atsOptimizations?.keywordsDensity || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Keywords Density</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {tailoredResume.atsOptimizations?.atsScore || 'N/A'}%
              </div>
              <div className="text-sm text-gray-600">Overall ATS Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {tailoredResume.atsOptimizations?.improvementsMade?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Optimizations Made</div>
            </div>
          </div>
        </div>

        {/* Resume Content */}
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Optimized Resume</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Sparkles className="h-4 w-4" />
                <span>AI-Tailored for Maximum Impact</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-8 space-y-8">
            {/* Personal Info */}
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {tailoredResume.personalInfo.name}
              </h1>
              <h2 className="text-xl text-blue-600 font-medium mb-4">
                {tailoredResume.personalInfo.title}
              </h2>
              <div className="flex flex-wrap justify-center gap-4 text-gray-600">
                <span>{tailoredResume.personalInfo.email}</span>
                <span>•</span>
                <span>{tailoredResume.personalInfo.phone}</span>
                <span>•</span>
                <span>{tailoredResume.personalInfo.location}</span>
              </div>
              {tailoredResume.personalInfo.linkedin && (
                <div className="mt-2 text-blue-600">
                  LinkedIn: {tailoredResume.personalInfo.linkedin}
                </div>
              )}
            </div>

            {/* Professional Summary */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Professional Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {tailoredResume.professionalSummary}
              </p>
            </div>

            {/* Core Skills */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Core Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {tailoredResume.coreSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Professional Experience */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                Professional Experience
              </h3>
              <div className="space-y-6">
                {tailoredResume.professionalExperience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                        <p className="text-blue-600 font-medium">{exp.company}</p>
                      </div>
                      <span className="text-gray-500 text-sm">{exp.duration}</span>
                    </div>
                    <ul className="space-y-1 mt-3">
                      {exp.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1.5">•</span>
                          <span className="text-gray-700">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            {tailoredResume.projects && tailoredResume.projects.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Key Projects
                </h3>
                <div className="space-y-4">
                  {tailoredResume.projects.map((project, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{project.title}</h4>
                        <div className="flex flex-wrap gap-1 mt-1 sm:mt-0">
                          {project.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                      <ul className="space-y-1">
                        {project.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span className="text-gray-700 text-sm">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Education
              </h3>
              <div className="space-y-2">
                {tailoredResume.education.map((edu, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{edu.degree}</p>
                      <p className="text-gray-600">{edu.institution}</p>
                    </div>
                    <div className="text-gray-500 text-sm">
                      <p>{edu.year}</p>
                      {edu.gpa && <p>GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {tailoredResume.certifications && tailoredResume.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tailoredResume.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Optimization Details */}
        {tailoredResume.atsOptimizations?.improvementsMade && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
              <h3 className="text-xl font-semibold">ATS Optimizations Applied</h3>
            </div>
            <ul className="space-y-2">
              {tailoredResume.atsOptimizations.improvementsMade.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderProjectsTab = () => {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Skill-Building Project Recommendations</h1>
          <p className="text-purple-100 mb-4">
            Strategic projects designed to bridge your skill gaps and enhance your portfolio
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{projectSuggestions.length}</div>
              <div className="text-purple-100">Projects Suggested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {analysis ? analysis.skillAnalysis.missing.length : 0}
              </div>
              <div className="text-purple-100">Skills to Bridge</div>
            </div>
          </div>
        </div>

        {projectSuggestions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">
              No Project Suggestions Available
            </h3>
            <p className="text-gray-400">
              Complete the resume analysis first to get personalized project recommendations
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projectSuggestions.map((project, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                    project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {project.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      Skills You'll Develop
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.skillsAddressed.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Key Deliverables
                    </h4>
                    <ul className="space-y-1">
                      {project.deliverables.map((deliverable, delIndex) => (
                        <li key={delIndex} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span className="text-gray-700 text-sm">{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Settings className="h-4 w-4 text-purple-600" />
                      Tools & Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tools.map((tool, toolIndex) => (
                        <span
                          key={toolIndex}
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{project.timeline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-green-600 font-medium">High Impact</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Business Value:</span> {project.businessValue}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Implementation Tips */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            <h3 className="text-xl font-semibold">Project Implementation Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Getting Started</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Start with the highest-impact, beginner-level projects
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Set up a dedicated portfolio section for these projects
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Document your learning process and challenges faced
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Portfolio Enhancement</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Include quantifiable results and metrics
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Create demo videos or live deployments
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Write technical blog posts about your implementations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInterviewTab = () => {
    if (!interviewQuestions.length) return null;

    const categories = [...new Set(interviewQuestions.map(q => q.category))];

    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">AI-Generated Interview Questions</h1>
          <p className="text-green-100 mb-4">
            Personalized questions based on your resume and target job description
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{interviewQuestions.length}</div>
              <div className="text-green-100">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-green-100">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(interviewQuestions.reduce((acc, q) => acc + q.relevanceScore, 0) / interviewQuestions.length)}%
              </div>
              <div className="text-green-100">Avg Relevance</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Questions List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filter by Category</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      // Filter logic would go here
                    }}
                  >
                    {category} ({interviewQuestions.filter(q => q.category === category).length})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {interviewQuestions.map(question => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isSelected={selectedQuestion?.id === question.id}
                  onSelect={setSelectedQuestion}
                />
              ))}
            </div>
          </div>

          {/* Question Detail */}
          <div className="lg:col-span-2">
            {selectedQuestion ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        selectedQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedQuestion.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">{selectedQuestion.category}</span>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      {selectedQuestion.question}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">
                      {selectedQuestion.relevanceScore}%
                    </div>
                    <div className="text-xs text-gray-500">Relevance Score</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Answer */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      Detailed Answer
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed">
                        {selectedQuestion.detailedAnswer}
                      </p>
                    </div>
                  </div>

                  {/* Key Points */}
                  {selectedQuestion.keyPoints && selectedQuestion.keyPoints.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Key Points to Cover
                      </h3>
                      <ul className="space-y-2">
                        {selectedQuestion.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {selectedQuestion.followUpQuestions && selectedQuestion.followUpQuestions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-purple-600" />
                        Potential Follow-up Questions
                      </h3>
                      <ul className="space-y-2">
                        {selectedQuestion.followUpQuestions.map((followUp, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{followUp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tips */}
                  {selectedQuestion.tips && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        Expert Tips
                      </h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-gray-800">{selectedQuestion.tips}</p>
                      </div>
                    </div>
                  )}

                  {/* Time Estimate */}
                  {selectedQuestion.timeToAnswer && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Estimated answer time: {selectedQuestion.timeToAnswer}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">
                  Select a Question
                </h3>
                <p className="text-gray-400">
                  Choose a question from the list to view detailed answers and tips
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
  <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between h-auto sm:h-16 gap-2 sm:gap-0">
            <div className="flex items-center py-2 sm:py-0">
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Career AI Pro</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-8 py-2 sm:py-0">
              <button
                onClick={() => setActiveTab('setup')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'setup' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Setup
              </button>
              {analysis && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'dashboard' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('resume')}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'resume' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'projects' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => setActiveTab('interview')}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'interview' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Interview Prep
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
  <main className="py-6 px-2 sm:px-6 lg:px-8">
        {activeTab === 'setup' && renderSetupTab()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'resume' && renderResumeTab()}
        {activeTab === 'projects' && renderProjectsTab()}
        {activeTab === 'interview' && renderInterviewTab()}
      </main>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 sm:p-8 max-w-md w-full mx-2 sm:mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Analysis in Progress
              </h3>
              <p className="text-gray-600 mb-4">{analysisStage}</p>
              <div className="bg-gray-200 rounded-full h-2 w-full">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: 
                    analysisStage.includes('Analyzing') ? '25%' : 
                    analysisStage.includes('Creating') ? '50%' : 
                    analysisStage.includes('Generating') ? '75%' : 
                    analysisStage.includes('Preparing') ? '100%' : '10%' 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICareerPlatform;
