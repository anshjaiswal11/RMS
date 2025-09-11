import React, { useState, useRef } from 'react';
import { Download, Brain, BookOpen, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

const MindMapFlashcardGenerator = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [mindMapData, setMindMapData] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [error, setError] = useState('');
  const [flippedCards, setFlippedCards] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const mindMapRef = useRef(null);
  const flashcardsRef = useRef(null);

  // Updated API configuration
  const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const MODELS = [
    'openai/gpt-oss-120b:free',
    'google/gemma-2-9b-it:free', 
    'meta-llama/llama-3.2-3b-instruct:free',
    'qwen/qwen-2.5-7b-instruct:free'
  ];
  const API_KEY = process.env.REACT_APP_OPENROUTER_API2_KEY;

  const makeAPICall = async (prompt, retryAttempt = 0, modelIndex = 0) => {
    const maxRetries = 3;
    const baseDelay = 2000;
    
    try {
      console.log(`Attempting API call with model: ${MODELS[modelIndex]}, attempt: ${retryAttempt + 1}`);
      
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin || 'https://localhost',
          'X-Title': 'Mind Map Generator'
        },
        body: JSON.stringify({
          model: MODELS[modelIndex],
          messages: [
            {
              role: 'system', 
              content: 'You are an expert educational content creator. Always return valid JSON only, no markdown formatting, no extra text. Ensure all strings are properly escaped.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 9000,
          top_p: 0.9
        })
      });

      console.log(`API Response Status: ${response.status}`);

      if (response.status === 429) {
        console.log('Rate limited, trying next model or retrying...');
        if (modelIndex < MODELS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return makeAPICall(prompt, retryAttempt, modelIndex + 1);
        } else if (retryAttempt < maxRetries) {
          const delay = baseDelay * Math.pow(1.5, retryAttempt);
          console.log(`Retrying in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeAPICall(prompt, retryAttempt + 1, 0);
        } else {
          throw new Error('All models are rate limited. Please try again in a few minutes.');
        }
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('API Error Response:', errorText);
        
        if (modelIndex < MODELS.length - 1) {
          console.log(`Error with ${MODELS[modelIndex]}, trying next model...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return makeAPICall(prompt, retryAttempt, modelIndex + 1);
        }
        
        throw new Error(`API Error ${response.status}: ${errorText || 'Request failed'}`);
      }

      const data = await response.json();
      console.log('API Response received');
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        throw new Error('Invalid API response structure');
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('API Call Error:', error);
      
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        if (modelIndex < MODELS.length - 1) {
          console.log('Network error, trying next model...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return makeAPICall(prompt, retryAttempt, modelIndex + 1);
        }
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      if (modelIndex < MODELS.length - 1 && retryAttempt === 0) {
        console.log(`Error with ${MODELS[modelIndex]}, trying next model...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return makeAPICall(prompt, retryAttempt, modelIndex + 1);
      }
      
      throw error;
    }
  };

  const cleanJsonResponse = (response) => {
    let cleaned = response.trim();
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
    // Remove any text before the first { or [
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      cleaned = cleaned.substring(firstBrace);
    } else if (firstBracket !== -1) {
      cleaned = cleaned.substring(firstBracket);
    }
    // Remove any text after the last } or ]
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    if (lastBrace !== -1 && lastBrace > lastBracket) {
      cleaned = cleaned.substring(0, lastBrace + 1);
    } else if (lastBracket !== -1) {
      cleaned = cleaned.substring(0, lastBracket + 1);
    }
    // Remove stray periods and invalid characters before/after JSON
    cleaned = cleaned.replace(/^[^\[{]+/, ''); // Remove non-JSON chars at start
    cleaned = cleaned.replace(/[^\]}]+$/, ''); // Remove non-JSON chars at end
    // Remove trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    // Remove any stray periods not inside quotes
    cleaned = cleaned.replace(/(?<!["'])\.(?!["'])/g, '');
    // Replace newlines and multiple spaces
    cleaned = cleaned.replace(/\n/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ');
    return cleaned;
  };

  const generateMindMap = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setRetryCount(0);

    try {
      const prompt = `Create a comprehensive roadmap-style mind map for learning: "${topic}"

Return ONLY this JSON structure with no additional text:

{
  "title": "${topic}",
  "mainBranches": [
    {
      "title": "Branch Name",
      "subtopics": [
        "Subtopic 1",
        "Subtopic 2", 
        "Subtopic 3"
      ]
    }
  ]
}

Create 6-8 main branches covering:
1. Fundamentals & Prerequisites
2. Core Concepts & Theory  
3. Practical Skills & Tools
4. Real-World Applications
5. Advanced Topics
6. Career & Professional Development
7. Current Trends & Future
8. Resources & Learning Path

Each branch should have 3-6 specific subtopics. Make it comprehensive and educational.

Return only the JSON object, no other text.`;

      const response = await makeAPICall(prompt);
      console.log('Raw mind map response:', response);
      
      const cleanJson = cleanJsonResponse(response);
      console.log('Cleaned JSON:', cleanJson);
      
      if (!cleanJson || (!cleanJson.trim().startsWith('{') && !cleanJson.trim().startsWith('['))) {
        throw new Error('No valid JSON found in response. The AI did not return a mind map. Please try again or rephrase your topic.');
      }
      
      let mindMapObj;
      try {
        mindMapObj = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Failed to parse response as JSON. Please try again.');
      }

      // Validate structure
      if (!mindMapObj.title || !mindMapObj.mainBranches || !Array.isArray(mindMapObj.mainBranches)) {
        console.error('Invalid structure:', mindMapObj);
        throw new Error('Invalid mind map structure received');
      }

      // Filter valid branches
      const validBranches = mindMapObj.mainBranches.filter(branch => 
        branch && branch.title && branch.subtopics && Array.isArray(branch.subtopics) && branch.subtopics.length > 0
      );

      if (validBranches.length === 0) {
        throw new Error('No valid branches found in mind map');
      }

      console.log(`Generated mind map with ${validBranches.length} branches`);
      setMindMapData({
        title: mindMapObj.title,
        mainBranches: validBranches
      });

    } catch (err) {
      console.error('Mind Map Generation Error:', err);
      setError(err.message || 'Failed to generate mind map. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateFlashcards = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setRetryCount(0);

    try {
      const prompt = `Create comprehensive flashcards for learning "${topic}". 

Return ONLY this JSON array structure with no additional text:

[
  {
    "id": 1,
    "category": "Fundamentals",
    "front": "What is the basic definition of ${topic}?",
    "back": "Detailed answer explaining the concept clearly and comprehensively."
  },
  {
    "id": 2, 
    "category": "Core Concepts",
    "front": "How does ${topic} work?",
    "back": "Explanation of the main processes and mechanisms involved."
  }
]

Create 18-25 flashcards covering these categories:
- Fundamentals (4-5 cards): Definitions, basic concepts, importance
- Core Concepts (4-5 cards): Key theories, principles, how things work  
- Practical Skills (3-4 cards): Implementation, tools, techniques
- Applications (3-4 cards): Real-world uses, examples, case studies
- Advanced Topics (2-3 cards): Expert concepts, complex scenarios
- Tools & Technologies (2-3 cards): Software, platforms, technical aspects
- Career & Professional (2-3 cards): Job opportunities, skills needed

Requirements:
- Questions should be clear and specific
- Answers should be detailed (50-100 words each)
- Include practical examples where relevant
- Cover beginner to advanced levels
- Ensure proper JSON formatting

Return only the JSON array, no markdown or extra text.`;

      const response = await makeAPICall(prompt);
      console.log('Raw flashcard response:', response);
      
      const cleanJson = cleanJsonResponse(response);
      console.log('Cleaned flashcard JSON:', cleanJson);
      
      let flashcardArray;
      try {
        flashcardArray = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('Flashcard JSON Parse Error:', parseError);
        console.log('Attempting to extract individual objects...');
        
        // Try to extract individual flashcard objects
        const objectMatches = response.match(/\{[^{}]*"front"[^{}]*"back"[^{}]*\}/g);
        if (objectMatches) {
          flashcardArray = [];
          objectMatches.forEach((objStr, index) => {
            try {
              const cleaned = objStr.replace(/,(\s*})/g, '$1'); // Remove trailing commas
              const obj = JSON.parse(cleaned);
              flashcardArray.push({
                id: index + 1,
                category: obj.category || 'General',
                front: obj.front || `Question about ${topic}`,
                back: obj.back || `Answer about ${topic}`
              });
            } catch (e) {
              console.error('Failed to parse object:', objStr);
            }
          });
        }
        
        if (!flashcardArray || flashcardArray.length === 0) {
          throw new Error('Failed to parse flashcard JSON. Please try again.');
        }
      }

      if (!Array.isArray(flashcardArray)) {
        console.error('Response is not an array:', flashcardArray);
        throw new Error('Invalid flashcard format received');
      }

      // Validate and clean flashcards
      const validFlashcards = flashcardArray
        .filter(card => card && typeof card === 'object' && card.front && card.back)
        .map((card, index) => ({
          id: index + 1,
          category: card.category || 'General',
          front: String(card.front).trim(),
          back: String(card.back).trim()
        }))
        .filter(card => card.front.length > 0 && card.back.length > 0);

      if (validFlashcards.length === 0) {
        throw new Error('No valid flashcards generated. Please try again.');
      }

      console.log(`Generated ${validFlashcards.length} valid flashcards`);
      setFlashcards(validFlashcards);
      setFlippedCards({});

    } catch (err) {
      console.error('Flashcard Generation Error:', err);
      setError(err.message || 'Failed to generate flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retryGeneration = () => {
    if (mindMapData) {
      generateMindMap();
    } else {
      generateFlashcards();
    }
  };

  const downloadMindMapAsImage = () => {
    if (!mindMapData || !mindMapRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scale = 2;
    
    canvas.width = 1400 * scale;
    canvas.height = 1000 * scale;
    ctx.scale(scale, scale);
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 1400, 1000);
    gradient.addColorStop(0, '#f8faff');
    gradient.addColorStop(1, '#e6f3ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1400, 1000);
    
    // Title
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(mindMapData.title, 700, 80);
    
    // Central node
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(700, 500, 80, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('MAIN', 700, 495);
    ctx.fillText('TOPIC', 700, 515);
    
    // Draw branches
    const centerX = 700;
    const centerY = 500;
    const mainRadius = 300;
    const branchCount = Math.min(mindMapData.mainBranches.length, 8);
    const angleStep = (2 * Math.PI) / branchCount;
    
    mindMapData.mainBranches.slice(0, 8).forEach((branch, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const branchX = centerX + Math.cos(angle) * mainRadius;
      const branchY = centerY + Math.sin(angle) * mainRadius;
      
      // Connection line
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(angle) * 80, centerY + Math.sin(angle) * 80);
      ctx.lineTo(branchX, branchY);
      ctx.stroke();
      
      // Branch node
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.arc(branchX, branchY, 60, 0, 2 * Math.PI);
      ctx.fill();
      
      // Branch title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      const words = branch.title.split(' ');
      if (words.length <= 2) {
        ctx.fillText(branch.title, branchX, branchY);
      } else {
        ctx.fillText(words.slice(0, Math.ceil(words.length/2)).join(' '), branchX, branchY - 6);
        ctx.fillText(words.slice(Math.ceil(words.length/2)).join(' '), branchX, branchY + 6);
      }
      
      // Subtopics
      const subRadius = 120;
      const subAngleStep = Math.PI / 3;
      const startAngle = angle - Math.PI / 6;
      
      branch.subtopics.slice(0, 3).forEach((subtopic, subIndex) => {
        const subAngle = startAngle + (subIndex * subAngleStep / 2);
        const subX = branchX + Math.cos(subAngle) * subRadius;
        const subY = branchY + Math.sin(subAngle) * subRadius;
        
        // Subtopic line
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(branchX + Math.cos(subAngle) * 60, branchY + Math.sin(subAngle) * 60);
        ctx.lineTo(subX, subY);
        ctx.stroke();
        
        // Subtopic node
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(subX, subY, 25, 0, 2 * Math.PI);
        ctx.fill();
        
        // Subtopic text
        ctx.fillStyle = 'white';
        ctx.font = '8px Arial';
        const shortText = subtopic.length > 12 ? subtopic.substring(0, 12) + '...' : subtopic;
        ctx.fillText(shortText, subX, subY);
      });
    });
    
    // Download
    const link = document.createElement('a');
    link.download = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-mindmap.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const downloadFlashcardsAsTxt = () => {
    if (flashcards.length === 0) return;
    
    const content = `FLASHCARDS: ${topic.toUpperCase()}\n${'='.repeat(50)}\n\n` +
      flashcards.map((card, index) => 
        `CARD ${index + 1} - ${card.category}\n${'-'.repeat(30)}\nQ: ${card.front}\nA: ${card.back}\n\n`
      ).join('');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-flashcards.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const downloadFlashcardsAsCSV = () => {
    if (flashcards.length === 0) return;
    
    const csvContent = 'Category,Question,Answer\n' + 
      flashcards.map(card => 
        `"${card.category}","${card.front.replace(/"/g, '""')}","${card.back.replace(/"/g, '""')}"`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.download = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-flashcards.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const flipCard = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const resetAll = () => {
    setMindMapData(null);
    setFlashcards([]);
    setError('');
    setFlippedCards({});
    setTopic('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 pt-6 sm:pt-8">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
            🧠 AI Study Materials Generator
          </h1>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl">
            Generate comprehensive mind maps and flashcards instantly
          </p>
        </div>

        {/* Topic Input */}
        <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-6 mb-6 sm:mb-8 border border-blue-100">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter any topic (e.g., Artificial Intelligence, Photosynthesis, Digital Marketing)"
              className="flex-1 px-3 py-3 sm:px-6 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-base sm:text-lg transition-all"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && !loading && generateMindMap()}
            />
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={generateMindMap}
                disabled={loading || !topic.trim()}
                className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition-all transform hover:scale-105 disabled:transform-none shadow-lg text-sm sm:text-base"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Brain className="h-5 w-5" />
                )}
                Mind Map
              </button>
              <button
                onClick={generateFlashcards}
                disabled={loading || !topic.trim()}
                className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition-all transform hover:scale-105 disabled:transform-none shadow-lg text-sm sm:text-base"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <BookOpen className="h-5 w-5" />
                )}
                Flashcards
              </button>
            </div>
          </div>
          
          {(mindMapData || flashcards.length > 0) && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <button
                onClick={resetAll}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2 text-sm transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Start New Topic
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={retryGeneration}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-12 text-center mb-6 sm:mb-8">
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Generating Content...</h3>
              <p className="text-gray-600 mb-4">AI is creating your study materials</p>
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Mind Map Results */}
        {mindMapData && (
          <div className="bg-white rounded-2xl shadow-xl mb-6 sm:mb-8 overflow-hidden border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <h3 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                  <Brain className="h-8 w-8" />
                  Mind Map: {mindMapData.title}
                </h3>
                <button
                  onClick={downloadMindMapAsImage}
                  className="bg-white text-blue-700 px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:bg-blue-50 flex items-center gap-2 font-semibold transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  <Download className="h-5 w-5" />
                  Download PNG
                </button>
              </div>
            </div>
            
            <div ref={mindMapRef} className="p-4 sm:p-8">
              <div className="text-center mb-6 sm:mb-10">
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">{mindMapData.title}</h2>
                <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
                <p className="text-gray-600 mt-2 sm:mt-3 text-base sm:text-lg">Learning Roadmap & Study Guide</p>
              </div>
              {/* Mind Map Branches */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {mindMapData.mainBranches.map((branch, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-300 transition-all transform hover:scale-105 hover:shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-bold text-blue-900 ml-3">{branch.title}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {branch.subtopics.map((subtopic, subIndex) => (
                        <div key={subIndex} className="bg-white rounded-lg px-3 py-2 text-sm text-gray-700 border border-blue-200 hover:border-blue-300 transition-colors shadow-sm">
                          <span className="text-indigo-500 font-bold">•</span> {subtopic}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Learning Progress */}
              <div className="mt-12 text-center">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">🎯 Learning Progress</h4>
                  <p className="text-gray-600">Follow this roadmap systematically for structured learning</p>
                  <div className="flex justify-center mt-4 space-x-2">
                    {mindMapData.mainBranches.map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flashcards Results */}
        {flashcards.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100 mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <h3 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                  <BookOpen className="h-8 w-8" />
                  Flashcards: {topic} ({flashcards.length} cards)
                </h3>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={downloadFlashcardsAsTxt}
                    className="bg-white text-indigo-700 px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-50 flex items-center gap-2 font-semibold transition-all transform hover:scale-105 shadow-lg text-xs sm:text-base"
                  >
                    <Download className="h-4 w-4" />
                    TXT
                  </button>
                  <button
                    onClick={downloadFlashcardsAsCSV}
                    className="bg-white text-indigo-700 px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-50 flex items-center gap-2 font-semibold transition-all transform hover:scale-105 shadow-lg text-xs sm:text-base"
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </button>
                </div>
              </div>
            </div>
            
            <div ref={flashcardsRef} className="p-4 sm:p-8">
              {/* Category Overview */}
              <div className="mb-6 sm:mb-8 text-center">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1 sm:gap-2 max-w-4xl mx-auto">
                  {[...new Set(flashcards.map(card => card.category))].map((category, index) => (
                    <div key={category} className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg px-3 py-2 text-xs font-semibold text-indigo-700 border border-indigo-200">
                      {category}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flashcards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {flashcards.map((card) => (
                  <div key={card.id} className="perspective-1000">
                    <div 
                      className={`relative w-full h-56 cursor-pointer transition-all duration-700 transform-style-preserve-3d ${flippedCards[card.id] ? 'rotate-y-180' : ''}`}
                      onClick={() => flipCard(card.id)}
                    >
                      {/* Front of card */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-100 border-2 border-indigo-200 p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-indigo-600 font-bold bg-white px-3 py-1 rounded-full">{card.category}</span>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">#{card.id}</span>
                          </div>
                          <p className="text-gray-800 font-semibold text-sm leading-relaxed">{card.front}</p>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 bg-white px-4 py-2 rounded-full inline-block shadow-sm">
                            💡 Click to reveal answer
                          </div>
                        </div>
                      </div>
                      
                      {/* Back of card */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 p-6 flex flex-col justify-between transform rotate-y-180 shadow-lg hover:shadow-xl transition-shadow">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-purple-600 font-bold bg-white px-3 py-1 rounded-full">Answer</span>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">#{card.id}</span>
                          </div>
                          <p className="text-gray-800 text-sm leading-relaxed">{card.back}</p>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 bg-white px-4 py-2 rounded-full inline-block shadow-sm">
                            🔄 Click for question
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Study Tips */}
              <div className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-200">
                <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                  📚 Study Tips
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700">
                  <div>• Review cards in order: Fundamentals → Advanced</div>
                  <div>• Spend extra time on cards you get wrong</div>
                  <div>• Practice active recall before flipping</div>
                  <div>• Study in short, focused sessions</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <p className="text-xs sm:text-sm">🚀 Powered by Advanced AI • Generate unlimited study materials instantly</p>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default MindMapFlashcardGenerator;