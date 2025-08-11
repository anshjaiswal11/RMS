import React, { useState } from 'react';
import { Search, Building2, Briefcase, FileText, Brain, Target, CheckCircle, Clock, Star, TrendingUp, Users, Award } from 'lucide-react';

const InterviewPrepPlatform = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    jobRole: '',
    jobDescription: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const makePerplexityRequest = async (prompt) => {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career advisor and interview preparation specialist. Provide detailed, accurate, and current information about companies and roles. Format your response as structured JSON data that can be parsed programmatically.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const parseAIResponse = (content) => {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      // If no JSON found, create structured response from text
      return parseTextResponse(content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return parseTextResponse(content);
    }
  };

  const parseTextResponse = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      companyOverview: {
        name: formData.companyName,
        industry: extractInfo(content, ['industry', 'sector']) || "Technology",
        size: extractInfo(content, ['employees', 'size', 'workforce']) || "Unknown",
        culture: extractInfo(content, ['culture', 'values', 'environment']) || "Professional environment",
        recentNews: extractInfo(content, ['news', 'recent', 'updates', 'developments']) || "No recent news found"
      },
      roleAnalysis: {
        title: formData.jobRole,
        department: extractInfo(content, ['department', 'team']) || "Unknown",
        level: extractInfo(content, ['level', 'seniority']) || "Mid-Level",
        reportingStructure: extractInfo(content, ['reports', 'manager', 'supervisor']) || "Unknown",
        teamSize: extractInfo(content, ['team size', 'colleagues']) || "5-10 people",
        workStyle: extractInfo(content, ['work style', 'remote', 'hybrid', 'office']) || "Unknown"
      },
      basicTopics: parseTopics(content, 'basic'),
      advancedTopics: parseTopics(content, 'advanced'),
      interviewFocus: parseList(content, ['interview', 'focus', 'expect']),
      preparationPlan: parsePreparationPlan(content),
      keyInsights: parseList(content, ['insights', 'key', 'important'])
    };
  };

  const extractInfo = (content, keywords) => {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[:\\-]?\\s*([^\\n\\.]{10,100})`, 'i');
      const match = content.match(regex);
      if (match) return match[1].trim();
    }
    return null;
  };

  const parseTopics = (content, type) => {
    const defaultTopics = type === 'basic' ? [
      {
        category: "Technical Fundamentals",
        topics: ["Data Structures", "Algorithms", "System Design", "Databases", "APIs"]
      },
      {
        category: "Role-Specific Skills",
        topics: ["Programming Languages", "Frameworks", "Tools", "Methodologies"]
      },
      {
        category: "Behavioral Preparation", 
        topics: ["STAR method", "Leadership examples", "Problem-solving", "Teamwork"]
      }
    ] : [
      {
        category: "Advanced Technical",
        topics: ["System Architecture", "Performance Optimization", "Security", "Scalability"]
      },
      {
        category: "Industry Trends",
        topics: ["Emerging Technologies", "Best Practices", "Innovation", "Future Skills"]
      }
    ];

    return defaultTopics;
  };

  const parseList = (content, keywords) => {
    return [
      "Technical assessment and problem-solving",
      "Cultural fit and behavioral questions", 
      "Role-specific scenario discussions",
      "Company knowledge and motivation"
    ];
  };

  const parsePreparationPlan = (content) => {
    return {
      week1: "Research company background and role requirements",
      week2: "Practice technical skills and coding challenges", 
      week3: "Prepare behavioral examples and mock interviews",
      week4: "Review industry trends and final preparation"
    };
  };

  const generateRoadmap = async () => {
    if (!formData.companyName || !formData.jobRole) {
      alert('Please fill in at least company name and job role');
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `
        Create a comprehensive interview preparation roadmap for a ${formData.jobRole} position at ${formData.companyName}.
        
        Company: ${formData.companyName}
        Role: ${formData.jobRole}
        ${formData.jobDescription ? `Job Description: ${formData.jobDescription}` : ''}
        
        Please provide detailed information about:
        
        1. Company Overview (industry, size, culture, recent news/developments)
        2. Role Analysis (department, level, reporting structure, team dynamics)
        3. Basic Topics to Master (technical fundamentals, role-specific skills, behavioral prep)
        4. Advanced Topics (cutting-edge skills, industry trends)
        5. Interview Focus Areas (what to expect in interviews)
        6. 4-Week Preparation Timeline
        7. Key Success Insights (company values, hiring preferences)
        
        Format the response as structured JSON with the following structure:
        {
          "companyOverview": {
            "name": "${formData.companyName}",
            "industry": "...",
            "size": "...",
            "culture": "...",
            "recentNews": "..."
          },
          "roleAnalysis": {
            "title": "${formData.jobRole}",
            "department": "...",
            "level": "...",
            "reportingStructure": "...",
            "teamSize": "...",
            "workStyle": "..."
          },
          "basicTopics": [
            {
              "category": "Technical Fundamentals",
              "topics": ["topic1", "topic2", "topic3"]
            }
          ],
          "advancedTopics": [
            {
              "category": "Advanced Technical", 
              "topics": ["topic1", "topic2"]
            }
          ],
          "interviewFocus": ["focus1", "focus2", "focus3"],
          "preparationPlan": {
            "week1": "...",
            "week2": "...",
            "week3": "...",
            "week4": "..."
          },
          "keyInsights": ["insight1", "insight2", "insight3"]
        }
        
        Make sure all information is current, accurate, and specific to the company and role.
      `;

      const aiResponse = await makePerplexityRequest(prompt);
      const parsedRoadmap = parseAIResponse(aiResponse);
      
      setRoadmap(parsedRoadmap);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('Error generating roadmap. Please check your internet connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Interview Prep Pro
                </h1>
                <p className="text-gray-600 text-xl mt-2">AI-Powered Deep Research & Roadmap Generator</p>
              </div>
            </div>
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">
                Get personalized interview preparation roadmaps with deep company insights, role-specific guidance, 
                and comprehensive study plans powered by advanced AI research.
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 pb-16">
          {/* Input Form */}
          <div className="mb-16">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-10 border border-gray-200 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Start Your Interview Preparation Journey</h2>
                <p className="text-gray-600">Enter your target company and role to get a personalized research roadmap</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <label className="flex items-center text-gray-700 font-semibold text-sm uppercase tracking-wider">
                    <Building2 className="w-5 h-5 mr-2 text-blue-500" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="e.g., Google, Microsoft, Amazon, Tesla"
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center text-gray-700 font-semibold text-sm uppercase tracking-wider">
                    <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                    Job Role/Position
                  </label>
                  <input
                    type="text"
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-10">
                <label className="flex items-center text-gray-700 font-semibold text-sm uppercase tracking-wider">
                  <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                  Job Description (Optional - For Better Targeting)
                </label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  placeholder="Paste the complete job description here for more targeted preparation insights..."
                  rows="5"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                />
              </div>

              <button
                onClick={generateRoadmap}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-5 px-8 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-4 text-lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Generating Comprehensive Research...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    <span>Generate Deep Research Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Roadmap Results */}
          {roadmap && (
            <div className="space-y-10">
              {/* Company Overview */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-10 border border-gray-200 shadow-xl">
                <div className="flex items-center mb-8">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-4">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Company Intelligence</h2>
                    <p className="text-gray-600 mt-1">Deep insights about {roadmap.companyOverview.name}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-500">
                    <p className="text-blue-600 text-sm font-bold uppercase tracking-wider mb-2">Industry</p>
                    <p className="text-gray-800 font-semibold text-lg">{roadmap.companyOverview.industry}</p>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-6 border-l-4 border-green-500">
                    <p className="text-green-600 text-sm font-bold uppercase tracking-wider mb-2">Company Size</p>
                    <p className="text-gray-800 font-semibold text-lg">{roadmap.companyOverview.size}</p>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-6 border-l-4 border-purple-500">
                    <p className="text-purple-600 text-sm font-bold uppercase tracking-wider mb-2">Culture</p>
                    <p className="text-gray-800 font-semibold">{roadmap.companyOverview.culture}</p>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-6 border-l-4 border-orange-500">
                    <p className="text-orange-600 text-sm font-bold uppercase tracking-wider mb-2">Recent Updates</p>
                    <p className="text-gray-800 font-medium text-sm">{roadmap.companyOverview.recentNews}</p>
                  </div>
                </div>
              </div>

              {/* Role Analysis */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-10 border border-gray-200 shadow-xl">
                <div className="flex items-center mb-8">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mr-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Role Deep Dive</h2>
                    <p className="text-gray-600 mt-1">Everything about the {roadmap.roleAnalysis.title} position</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                      <p className="text-purple-600 text-sm font-bold uppercase tracking-wider mb-2">Experience Level</p>
                      <p className="text-gray-800 font-semibold text-lg">{roadmap.roleAnalysis.level}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                      <p className="text-blue-600 text-sm font-bold uppercase tracking-wider mb-2">Department</p>
                      <p className="text-gray-800 font-semibold text-lg">{roadmap.roleAnalysis.department}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                      <p className="text-green-600 text-sm font-bold uppercase tracking-wider mb-2">Team Size</p>
                      <p className="text-gray-800 font-semibold text-lg">{roadmap.roleAnalysis.teamSize}</p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                      <p className="text-orange-600 text-sm font-bold uppercase tracking-wider mb-2">Reporting Structure</p>
                      <p className="text-gray-800 font-semibold">{roadmap.roleAnalysis.reportingStructure}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                      <p className="text-indigo-600 text-sm font-bold uppercase tracking-wider mb-2">Work Style</p>
                      <p className="text-gray-800 font-semibold">{roadmap.roleAnalysis.workStyle}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Topics */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-10 border border-gray-200 shadow-xl">
                <div className="flex items-center mb-8">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mr-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Essential Foundation</h2>
                    <p className="text-gray-600 mt-1">Core topics you must master before the interview</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                  {roadmap.basicTopics.map((section, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                      <h3 className="text-xl font-bold text-green-700 mb-6 flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        {section.category}
                      </h3>
                      <ul className="space-y-3">
                        {section.topics.map((topic, topicIndex) => (
                          <li key={topicIndex} className="flex items-start text-gray-700">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="font-medium">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Topics */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-10 border border-gray-200 shadow-xl">
                <div className="flex items-center mb-8">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl mr-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Advanced Mastery</h2>
                    <p className="text-gray-600 mt-1">Cutting-edge skills to set you apart from other candidates</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  {roadmap.advancedTopics.map((section, index) => (
                    <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200">
                      <h3 className="text-xl font-bold text-orange-700 mb-6 flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                        {section.category}
                      </h3>
                      <ul className="space-y-3">
                        {section.topics.map((topic, topicIndex) => (
                          <li key={topicIndex} className="flex items-start text-gray-700">
                            <Star className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="font-medium">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interview Focus */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-10 border border-gray-200 shadow-xl">
                <div className="flex items-center mb-8">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl mr-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Interview Focus Areas</h2>
                    <p className="text-gray-600 mt-1">What to expect and prepare for in your actual interviews</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roadmap.interviewFocus.map((focus, index) => (
                    <div key={index} className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-gray-800 font-semibold leading-relaxed">{focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation Timeline */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-10 border border-gray-200 shadow-xl">
                <div className="flex items-center mb-8">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl mr-4">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">4-Week Strategic Preparation Plan</h2>
                    <p className="text-gray-600 mt-1">Structured timeline to maximize your interview success</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {Object.entries(roadmap.preparationPlan).map(([week, plan], index) => (
                    <div key={index} className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {index + 1}
                        </div>
                        <h3 className="text-indigo-700 font-bold text-lg ml-4 capitalize">{week}</h3>
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed">{plan}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-10 border border-gray-200 shadow-xl">
                <div className="flex items-center mb-8">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl mr-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">Key Success Insights</h2>
                    <p className="text-gray-600 mt-1">Critical factors that will make you stand out as a candidate</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {roadmap.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-gray-800 font-semibold leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Tips */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-10 text-white shadow-xl">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">You're Ready to Excel!</h2>
                  <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
                    With this comprehensive roadmap, you have everything you need to prepare thoroughly and confidently. 
                    Remember to practice consistently, stay curious, and showcase your unique value proposition during the interview.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <div className="bg-white/20 rounded-full px-6 py-3">
                      <span className="font-semibold">✨ Deep Research Complete</span>
                    </div>
                    <div className="bg-white/20 rounded-full px-6 py-3">
                      <span className="font-semibold">🎯 Role-Specific Guidance</span>
                    </div>
                    <div className="bg-white/20 rounded-full px-6 py-3">
                      <span className="font-semibold">📚 Structured Learning Path</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrepPlatform;