import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  FileText, 
  Palette, 
  Type, 
  Settings, 
  User, 
  Calendar,
  Play,
  Square,
  Loader2,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw,
  Edit3,
  Bold,
  Italic,
  Underline,
  Image as ImageIcon,
  Trash2,
  Plus,
  Save
} from 'lucide-react';

const PDFGenerator = () => {
  const [topic, setTopic] = useState('');
  const [userName, setUserName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showBranding, setShowBranding] = useState(true);
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [colorTheme, setColorTheme] = useState('classic');
  const [template, setTemplate] = useState('professional');
  const [showPreview, setShowPreview] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const abortControllerRef = useRef(null);

  const colorThemes = {
    classic: { bg: '#ffffff', text: '#000000', accent: '#2563eb', header: '#1e40af', name: 'Classic White' },
    dark: { bg: '#1a1a1a', text: '#ffffff', accent: '#60a5fa', header: '#3b82f6', name: 'Dark Mode' },
    neo: { bg: '#0f172a', text: '#06ffa5', accent: '#06ffa5', header: '#10b981', name: 'Neo Cyberpunk' },
    sunset: { bg: '#fef3c7', text: '#92400e', accent: '#f59e0b', header: '#d97706', name: 'Sunset Warm' },
    ocean: { bg: '#ecfeff', text: '#164e63', accent: '#0891b2', header: '#0e7490', name: 'Ocean Blue' },
    forest: { bg: '#f0fdf4', text: '#14532d', accent: '#16a34a', header: '#15803d', name: 'Forest Green' },
    royal: { bg: '#faf5ff', text: '#581c87', accent: '#9333ea', header: '#7c3aed', name: 'Royal Purple' },
    minimal: { bg: '#f8fafc', text: '#334155', accent: '#64748b', header: '#475569', name: 'Minimal Gray' },
    neon: { bg: '#000000', text: '#00ff00', accent: '#ff00ff', header: '#00ffff', name: 'Neon Matrix' },
    rose: { bg: '#fff1f2', text: '#881337', accent: '#e11d48', header: '#be123c', name: 'Rose Gold' },
    gradient: { bg: '#fdf4ff', text: '#7c2d12', accent: '#c2410c', header: '#ea580c', name: 'Gradient Fire' },
    ice: { bg: '#f0f9ff', text: '#0c4a6e', accent: '#0284c7', header: '#0369a1', name: 'Ice Blue' }
  };

  const fonts = [
    'Helvetica', 'Times-Roman', 'Courier'
  ];

  const templates = {
    professional: 'Professional Business Report',
    academic: 'Academic Research Paper', 
    creative: 'Creative Magazine Style',
    technical: 'Technical Documentation',
    presentation: 'Presentation Summary',
    proposal: 'Project Proposal',
    research: 'Research Analysis',
    marketing: 'Marketing Strategy',
    educational: 'Educational Guide'
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const generatePrompt = (userTopic) => {
    const templatePrompts = {
      professional: `Create an extremely comprehensive professional business report on "${userTopic}". Structure it with these detailed sections:

## EXECUTIVE SUMMARY
Provide a thorough overview covering key findings, recommendations, and business impact.

## 1. INTRODUCTION AND BACKGROUND  
Write an extensive introduction explaining the context, importance, and scope of this topic. Include historical background and current relevance.

## 2. MARKET ANALYSIS AND OVERVIEW
Conduct a detailed analysis of the current market landscape, trends, opportunities, and competitive environment.

## 3. KEY STRATEGIC COMPONENTS
Break down into 5-7 major subsections covering:
### Strategic Framework
### Implementation Strategies  
### Resource Requirements
### Timeline Considerations
### Risk Assessment
### Success Metrics
### Stakeholder Impact

## 4. DETAILED TECHNICAL ANALYSIS
Provide in-depth technical details, methodologies, and analytical frameworks relevant to this topic.

## 5. FINANCIAL IMPLICATIONS AND PROJECTIONS
Include comprehensive financial analysis, cost-benefit analysis, ROI projections, and budget considerations.

## 6. OPERATIONAL CONSIDERATIONS
Detail operational requirements, process improvements, workflow optimization, and resource allocation.

## 7. RISK MANAGEMENT AND MITIGATION
Comprehensive risk analysis including identification, assessment, mitigation strategies, and contingency planning.

## 8. IMPLEMENTATION ROADMAP
Detailed phased implementation plan with timelines, milestones, deliverables, and success criteria.

## 9. STRATEGIC RECOMMENDATIONS
Provide actionable, specific recommendations with clear rationale and expected outcomes.

## 10. FUTURE OUTLOOK AND SUSTAINABILITY
Long-term perspective including scalability, future trends, and sustainability considerations.

## 11. CONCLUSION AND NEXT STEPS
Comprehensive conclusion summarizing key points and outlining immediate next steps.

Make each section extremely detailed with multiple paragraphs, bullet points where appropriate, and comprehensive coverage. Target 8000-12000 words total for a substantial document.`,

      academic: `Write a comprehensive academic research paper on "${userTopic}". Include these detailed sections:

## ABSTRACT
Comprehensive abstract summarizing research objectives, methodology, key findings, and implications.

## 1. LITERATURE REVIEW AND THEORETICAL FRAMEWORK
Extensive review of existing literature, theoretical foundations, and conceptual frameworks.

## 2. RESEARCH METHODOLOGY AND APPROACH  
Detailed explanation of research methods, data collection, analytical approaches, and validation techniques.

## 3. COMPREHENSIVE ANALYSIS
Break into multiple detailed subsections:
### Historical Context and Evolution
### Current State Analysis  
### Comparative Studies
### Case Study Examinations
### Statistical Analysis
### Qualitative Insights
### Cross-sectional Analysis

## 4. EMPIRICAL FINDINGS AND RESULTS
Present detailed findings with comprehensive analysis and interpretation.

## 5. CRITICAL EVALUATION AND DISCUSSION
In-depth critical analysis, evaluation of findings, and discussion of implications.

## 6. THEORETICAL CONTRIBUTIONS  
Explain theoretical contributions, novel insights, and advancement of knowledge.

## 7. PRACTICAL APPLICATIONS AND IMPLICATIONS
Detail practical applications, real-world relevance, and policy implications.

## 8. LIMITATIONS AND FUTURE RESEARCH
Acknowledge limitations and propose comprehensive future research directions.

## 9. CONCLUSION
Synthesize findings and provide comprehensive concluding remarks.

## 10. REFERENCES AND BIBLIOGRAPHY
Format a comprehensive reference list with academic citations.

Use formal academic language with detailed explanations and scholarly depth. Target 10000-15000 words.`,

      creative: `Create an engaging, comprehensive creative exploration of "${userTopic}" with these sections:

## OPENING: THE SPARK OF DISCOVERY
Captivating introduction that draws readers in with vivid storytelling and emotional connection.

## 1. ORIGINS AND GENESIS
Explore the fascinating origins, birth stories, and foundational moments that shaped this topic.

## 2. THE HUMAN ELEMENT  
### Personal Stories and Testimonials
### Cultural Impact and Influence
### Emotional Connections and Meaning
### Community and Social Aspects

## 3. CREATIVE MANIFESTATIONS
### Artistic Expressions
### Innovative Applications  
### Creative Interpretations
### Design and Aesthetic Elements

## 4. BEHIND THE SCENES
### Hidden Stories and Untold Tales
### The Making Process
### Challenges and Breakthroughs
### Collaborative Efforts

## 5. CURRENT RENAISSANCE
### Modern Innovations
### Contemporary Trends
### Fresh Perspectives  
### Evolving Landscapes

## 6. SENSORY EXPLORATION
### Visual Elements and Imagery
### Textural Qualities
### Sounds and Rhythms
### Emotional Textures

## 7. FUTURE VISIONS AND POSSIBILITIES
### Emerging Trends
### Potential Developments
### Creative Possibilities
### Imaginative Scenarios

## 8. INTERACTIVE DIMENSIONS
### Engagement Opportunities
### Participatory Elements
### Community Building
### Shared Experiences

## FINALE: LASTING IMPRESSIONS
Inspiring conclusion that leaves readers with memorable insights and call to action.

Write in an engaging, magazine-style format with vivid descriptions and creative flair. Target 8000-12000 words.`,

      technical: `Develop comprehensive technical documentation for "${userTopic}":

## TECHNICAL OVERVIEW AND SCOPE
Detailed overview of technical specifications, scope, and architectural considerations.

## 1. SYSTEM ARCHITECTURE AND DESIGN
### High-Level Architecture
### Component Breakdown
### Integration Points
### Scalability Considerations
### Security Framework

## 2. TECHNICAL SPECIFICATIONS
### Hardware Requirements
### Software Dependencies  
### Performance Metrics
### Compatibility Matrix
### Environment Setup

## 3. IMPLEMENTATION METHODOLOGY
### Development Approach
### Best Practices and Standards
### Quality Assurance Protocols
### Testing Frameworks
### Deployment Strategies

## 4. CONFIGURATION AND SETUP
### Installation Procedures
### Configuration Parameters
### Environment Variables
### Initial Setup Guidelines
### Validation Procedures

## 5. OPERATIONAL PROCEDURES
### Standard Operating Procedures
### Monitoring and Maintenance
### Performance Optimization
### Backup and Recovery
### Incident Response

## 6. TROUBLESHOOTING AND DIAGNOSTICS
### Common Issues and Solutions
### Debugging Methodologies
### Log Analysis Techniques
### Performance Tuning
### Error Resolution

## 7. SECURITY CONSIDERATIONS
### Security Protocols
### Access Control Mechanisms
### Data Protection Measures
### Vulnerability Assessments
### Compliance Requirements

## 8. INTEGRATION AND APIS
### API Documentation
### Integration Patterns
### Data Exchange Formats
### Authentication Methods
### Rate Limiting

## 9. PERFORMANCE AND SCALABILITY
### Performance Metrics
### Load Testing Results
### Scalability Patterns
### Optimization Techniques
### Resource Management

## 10. MAINTENANCE AND UPDATES
### Update Procedures
### Version Control
### Change Management
### Documentation Updates
### Lifecycle Management

Include detailed technical explanations, code examples where relevant, and step-by-step procedures. Target 10000-14000 words.`,

      presentation: `Create a detailed presentation summary on "${userTopic}":

## KEY TAKEAWAYS AND EXECUTIVE SUMMARY
Comprehensive overview of main points, key insights, and actionable outcomes.

## 1. CORE CONCEPTS AND FUNDAMENTALS
### Definition and Scope
### Fundamental Principles
### Key Terminology
### Conceptual Framework
### Theoretical Foundations

## 2. SUPPORTING DATA AND EVIDENCE
### Statistical Analysis
### Research Findings
### Case Studies
### Comparative Data
### Trend Analysis

## 3. VISUAL CONTENT DESCRIPTIONS
### Charts and Graphs Analysis
### Infographic Summaries
### Diagram Explanations
### Visual Storytelling Elements
### Interactive Components

## 4. PRACTICAL APPLICATIONS AND USE CASES
### Real-World Examples
### Implementation Scenarios
### Success Stories
### Best Practices
### Lessons Learned

## 5. STRATEGIC IMPLICATIONS
### Business Impact
### Strategic Considerations
### Decision Frameworks
### Risk Assessment
### Opportunity Analysis

## 6. DETAILED DISCUSSION POINTS
### Critical Questions
### Debate Topics
### Controversial Aspects
### Alternative Viewpoints
### Expert Opinions

## 7. ACTION ITEMS AND IMPLEMENTATION
### Immediate Actions
### Short-term Goals
### Long-term Objectives
### Resource Requirements
### Timeline Considerations

## 8. FOLLOW-UP RESOURCES AND REFERENCES
### Additional Reading
### Recommended Tools
### Expert Contacts
### Training Resources
### Certification Programs

## 9. Q&A PREPARATION AND SCENARIOS
### Anticipated Questions
### Detailed Answers
### Supporting Arguments
### Additional Context
### Expert Insights

Format for comprehensive understanding with clear sections and detailed explanations. Target 7000-10000 words.`,

      proposal: `Create a comprehensive project proposal for "${userTopic}":

## PROJECT OVERVIEW AND VISION
Detailed project description, vision statement, and strategic alignment.

## 1. PROBLEM STATEMENT AND OPPORTUNITY
### Current Challenges
### Market Opportunity
### Needs Assessment
### Gap Analysis
### Value Proposition

## 2. PROPOSED SOLUTION
### Solution Architecture
### Key Features and Benefits
### Innovation Elements
### Competitive Advantages
### Success Metrics

## 3. PROJECT SCOPE AND DELIVERABLES
### Scope Definition
### Major Deliverables
### Exclusions
### Assumptions
### Dependencies

## 4. IMPLEMENTATION STRATEGY
### Methodology and Approach
### Project Phases
### Timeline and Milestones
### Resource Allocation
### Quality Assurance

## 5. FINANCIAL ANALYSIS
### Cost Breakdown
### Budget Allocation
### ROI Projections
### Financial Benefits
### Cost-Benefit Analysis

## 6. RISK MANAGEMENT
### Risk Assessment
### Mitigation Strategies
### Contingency Planning
### Risk Monitoring
### Issue Resolution

## 7. TEAM AND RESOURCES
### Team Structure
### Roles and Responsibilities
### Skill Requirements
### Resource Needs
### Vendor Management

## 8. SUCCESS CRITERIA AND METRICS
### Key Performance Indicators
### Success Metrics
### Evaluation Framework
### Monitoring Plan
### Reporting Structure

## 9. SUSTAINABILITY AND LONG-TERM VISION
### Sustainability Plan
### Future Enhancements
### Scalability Options
### Maintenance Strategy
### Evolution Roadmap

Target 8000-12000 words with comprehensive details and professional formatting.`,

      research: `Conduct comprehensive research analysis on "${userTopic}":

## RESEARCH OVERVIEW AND METHODOLOGY
Detailed research framework, objectives, and methodological approach.

## 1. LITERATURE REVIEW AND BACKGROUND
### Historical Context
### Previous Research
### Theoretical Foundations
### Knowledge Gaps
### Research Evolution

## 2. RESEARCH DESIGN AND METHODOLOGY
### Research Questions
### Hypothesis Formation
### Data Collection Methods
### Analytical Framework
### Validation Approaches

## 3. COMPREHENSIVE FINDINGS
### Quantitative Results
### Qualitative Insights
### Statistical Analysis
### Pattern Recognition
### Correlation Studies

## 4. COMPARATIVE ANALYSIS
### Cross-Reference Studies
### Benchmark Comparisons
### Best Practice Analysis
### Performance Metrics
### Industry Standards

## 5. CASE STUDY EXAMINATIONS
### Detailed Case Studies
### Success Factors
### Failure Analysis
### Lessons Learned
### Practical Applications

## 6. EXPERT INSIGHTS AND PERSPECTIVES
### Professional Opinions
### Industry Expert Views
### Academic Perspectives
### Stakeholder Feedback
### Thought Leadership

## 7. IMPLICATIONS AND APPLICATIONS
### Practical Applications
### Policy Implications
### Strategic Recommendations
### Implementation Guidelines
### Change Management

## 8. FUTURE RESEARCH DIRECTIONS
### Emerging Trends
### Research Opportunities
### Methodological Improvements
### Technology Integration
### Innovation Pathways

Target 9000-13000 words with detailed analysis and comprehensive coverage.`,

      marketing: `Develop comprehensive marketing strategy for "${userTopic}":

## MARKETING STRATEGY OVERVIEW
Executive summary of marketing objectives, target outcomes, and strategic framework.

## 1. MARKET RESEARCH AND ANALYSIS
### Market Size and Potential
### Industry Trends
### Competitive Landscape
### SWOT Analysis
### Market Segmentation

## 2. TARGET AUDIENCE ANALYSIS
### Demographic Profiling
### Psychographic Analysis
### Behavioral Patterns
### Customer Journey Mapping
### Persona Development

## 3. BRAND POSITIONING AND MESSAGING
### Brand Strategy
### Value Proposition
### Messaging Framework
### Brand Differentiation
### Communication Strategy

## 4. MARKETING MIX STRATEGY
### Product Strategy
### Pricing Strategy
### Distribution Strategy
### Promotion Strategy
### Digital Integration

## 5. CAMPAIGN DEVELOPMENT
### Campaign Objectives
### Creative Strategy
### Media Planning
### Budget Allocation
### Timeline Development

## 6. DIGITAL MARKETING STRATEGY
### SEO and Content Strategy
### Social Media Marketing
### Email Marketing
### PPC and Advertising
### Analytics and Tracking

## 7. PERFORMANCE MEASUREMENT
### KPIs and Metrics
### ROI Analysis
### Campaign Optimization
### A/B Testing Framework
### Reporting Structure

## 8. IMPLEMENTATION AND EXECUTION
### Launch Strategy
### Resource Requirements
### Team Structure
### Project Management
### Quality Control

Target 8000-11000 words with detailed marketing insights and actionable strategies.`,

      educational: `Create comprehensive educational guide on "${userTopic}":

## LEARNING OBJECTIVES AND OUTCOMES
Clear definition of what learners will achieve and understand upon completion.

## 1. FOUNDATIONAL CONCEPTS
### Basic Principles
### Key Terminology
### Historical Development
### Core Theories
### Fundamental Framework

## 2. DETAILED CURRICULUM CONTENT
### Module 1: Introduction and Basics
### Module 2: Intermediate Concepts
### Module 3: Advanced Applications
### Module 4: Practical Implementation
### Module 5: Expert-Level Mastery

## 3. LEARNING METHODOLOGIES
### Teaching Approaches
### Interactive Elements
### Assessment Methods
### Feedback Mechanisms
### Progress Tracking

## 4. PRACTICAL EXERCISES AND APPLICATIONS
### Hands-on Activities
### Case Study Analysis
### Problem-Solving Scenarios
### Real-World Applications
### Project-Based Learning

## 5. ASSESSMENT AND EVALUATION
### Knowledge Checks
### Skill Assessments
### Competency Evaluation
### Certification Criteria
### Continuous Assessment

## 6. SUPPLEMENTARY RESOURCES
### Additional Reading Materials
### Online Resources
### Expert Interviews
### Industry Examples
### Reference Materials

## 7. IMPLEMENTATION GUIDELINES
### Instructor Guidelines
### Student Preparation
### Technical Requirements
### Learning Environment
### Support Systems

## 8. ADVANCED TOPICS AND SPECIALIZATIONS
### Expert-Level Content
### Specialized Applications
### Research Opportunities
### Professional Development
### Career Pathways

Target 8000-12000 words with comprehensive educational content and clear learning structure.`
    };

    return templatePrompts[template] || templatePrompts.professional;
  };

  const streamContentFromAPI = async (prompt) => {
    const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'CiteWise PDF Generator'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3.1:free',
          messages: [
            {
              role: 'system',
              content: 'You are an expert content creator specializing in comprehensive document generation. Create extremely detailed, well-structured content based on user requirements. Use proper markdown formatting with ## for main sections and ### for subsections. Use bullet points and numbered lists appropriately. Never use asterisks (*) for formatting - use proper markdown instead. Generate substantial, detailed content with multiple paragraphs per section. Focus on creating professional, comprehensive documents that provide real value.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: true,
          max_tokens: 16000,
          temperature: 0.7
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
            } catch (e) {
              // Skip invalid JSON chunks
            }
          }
        }
      }
      
      return accumulatedContent;
    } catch (error) {
      if (error.name === 'AbortError') {
        return 'Generation stopped by user.';
      }
      console.error('Streaming error:', error);
      throw new Error('Failed to generate content. Please try again.');
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim() || !userName.trim()) {
      alert('Please enter both topic and your name');
      return;
    }

    setIsGenerating(true);
    setIsStreaming(true);
    setGeneratedContent('');
    setStreamedText('');
    setEditableContent('');

    try {
      const prompt = generatePrompt(topic);
      const content = await streamContentFromAPI(prompt);
      setGeneratedContent(content);
      setEditableContent(content);
      setIsStreaming(false);
    } catch (error) {
      alert(error.message);
      setStreamedText('Error generating content. Please try again.');
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
      setEditableContent(streamedText);
    }
  };

  const formatContentForPDF = (content) => {
    return content
      .replace(/\*\*/g, '') // Remove ** markdown
      .replace(/\*/g, '') // Remove single asterisks  
      .replace(/#{4,}/g, '###') // Limit header levels
      .replace(/^#{1}\s/gm, '## ') // Convert single # to ##
      .split('\n')
      .filter(line => line.trim() !== '')
      .join('\n');
  };

  const loadJSPDF = () => {
    return new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve(window.jspdf.jsPDF);
        return;
      }
      
      if (document.getElementById('jspdf-script')) {
        document.getElementById('jspdf-script').addEventListener('load', () => {
             if (window.jspdf && window.jspdf.jsPDF) {
                resolve(window.jspdf.jsPDF);
              } else {
                reject(new Error('jsPDF failed to load after waiting.'));
              }
        });
        return;
      }

      const script = document.createElement('script');
      script.id = 'jspdf-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        if (window.jspdf && window.jspdf.jsPDF) {
          resolve(window.jspdf.jsPDF);
        } else {
          reject(new Error('jsPDF failed to load. The window.jspdf.jsPDF object was not found.'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load jsPDF script from CDN.'));
      document.head.appendChild(script);
    });
  };

  const generatePDF = async () => {
    const contentToUse = isEditMode ? editableContent : (generatedContent || streamedText);
    
    if (!contentToUse) {
      alert('Please generate content first');
      return;
    }

    try {
      const jsPDF = await loadJSPDF();
      const content = formatContentForPDF(contentToUse);
      const theme = colorThemes[colorTheme];
      const currentDate = new Date().toLocaleDateString();
      
      let doc;
      try {
        doc = new jsPDF();
      } catch (e) {
        console.error('jsPDF constructor error:', e);
        alert('PDF library not properly loaded. Please refresh the page and try again.');
        return;
      }
      
      const pdfFontFamily = fontFamily.toLowerCase().split('-')[0];
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 25;
      const contentWidth = pageWidth - (margin * 2);
      const lineHeight = fontSize * 0.4;
      
      // Convert hex colors to RGB for jsPDF
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
      };

      const bgColor = hexToRgb(theme.bg);
      const textColor = hexToRgb(theme.text);
      const headerColor = hexToRgb(theme.header);
      const accentColor = hexToRgb(theme.accent);

      // Set background
      doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setTextColor(textColor.r, textColor.g, textColor.b);

      let yPosition = margin;

      // Header on first page
      if (showBranding) {
        doc.setFontSize(16);
        doc.setFont(pdfFontFamily, 'bold');
        doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
        doc.text('CiteWise', margin, 20);
        doc.setFontSize(8);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.text('Professional Document Generator', margin, 26);
        doc.setFontSize(10);
        doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
        doc.text(currentDate, pageWidth - margin - 30, 20);
        yPosition = 40;
      }

      // Title with better spacing
      doc.setFontSize(fontSize + 8);
      doc.setFont(pdfFontFamily, 'bold');
      doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
      const title = topic.toUpperCase();
      const titleLines = doc.splitTextToSize(title, contentWidth);
      doc.text(titleLines, margin, yPosition);
      yPosition += (titleLines.length * (lineHeight + 8)) + 20;

      // Content processing with improved spacing
      doc.setFontSize(fontSize);
      doc.setFont(pdfFontFamily, 'normal');
      doc.setTextColor(textColor.r, textColor.g, textColor.b);

      const lines = content.split('\n').filter(line => line.trim());
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Calculate estimated height for this line
        const estimatedHeight = (doc.splitTextToSize(line, contentWidth).length * lineHeight) + 15;
        if (yPosition + estimatedHeight > pageHeight - 40) {
          doc.addPage();
          doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
          yPosition = margin + 10;
          
          if (showBranding) {
            doc.setFontSize(12);
            doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
            doc.text('CiteWise', margin, 20);
            doc.setFontSize(10);
            doc.text(currentDate, pageWidth - margin - 30, 20);
            yPosition = 35;
          }
          
          doc.setFontSize(fontSize);
          doc.setFont(pdfFontFamily, 'normal');
          doc.setTextColor(textColor.r, textColor.g, textColor.b);
        }

        // Handle different content types with proper spacing
        try {
          if (line.startsWith('##')) {
            // Main heading
            yPosition += 10; // Extra space before heading
            doc.setFontSize(fontSize + 6);
            doc.setFont(pdfFontFamily, 'bold');
            doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
            const headingText = line.replace(/^#+\s*/, '');
            const headingLines = doc.splitTextToSize(headingText, contentWidth);
            doc.text(headingLines, margin, yPosition);
            yPosition += (headingLines.length * (lineHeight + 2)) + 15;
          } else if (line.startsWith('###')) {
            // Subheading
            yPosition += 8; // Extra space before subheading
            doc.setFontSize(fontSize + 3);
            doc.setFont(pdfFontFamily, 'bold');
            doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
            const subheadingText = line.replace(/^#+\s*/, '');
            const subheadingLines = doc.splitTextToSize(subheadingText, contentWidth);
            doc.text(subheadingLines, margin, yPosition);
            yPosition += (subheadingLines.length * lineHeight) + 12;
          } else if (line.match(/^\d+\./)) {
            // Numbered list
            doc.setFontSize(fontSize);
            doc.setFont(pdfFontFamily, 'normal');
            doc.setTextColor(textColor.r, textColor.g, textColor.b);
            const listLines = doc.splitTextToSize(line, contentWidth - 15);
            doc.text(listLines, margin + 8, yPosition);
            yPosition += (listLines.length * lineHeight) + 6;
          } else if (line.startsWith('-') || line.startsWith('•')) {
            // Bullet point
            doc.setFontSize(fontSize);
            doc.setFont(pdfFontFamily, 'normal');
            doc.setTextColor(textColor.r, textColor.g, textColor.b);
            const bulletText = line.replace(/^[-•]\s*/, '');
            const bulletLines = doc.splitTextToSize(`• ${bulletText}`, contentWidth - 15);
            doc.text(bulletLines, margin + 8, yPosition);
            yPosition += (bulletLines.length * lineHeight) + 5;
          } else {
            // Regular paragraph
            doc.setFontSize(fontSize);
            doc.setFont(pdfFontFamily, 'normal');
            doc.setTextColor(textColor.r, textColor.g, textColor.b);
            const paraLines = doc.splitTextToSize(line, contentWidth);
            doc.text(paraLines, margin, yPosition);
            yPosition += (paraLines.length * lineHeight) + 8;
          }
        } catch (textError) {
          console.warn('Error processing line:', line, textError);
          continue;
        }
      }

      // Add footer to all pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        
        try {
          if (showBranding) {
            doc.text('Generated by CiteWise', margin, pageHeight - 15);
          }
          doc.text(`${userName}`, (pageWidth / 2), pageHeight - 15, { align: 'center' });
          doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
        } catch (footerError) {
          console.warn('Error adding footer to page', i, footerError);
        }
      }

      // Download the PDF
      const filename = `${topic.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      alert('PDF generated successfully!');

    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`Failed to generate PDF: ${error.message}. Please try refreshing the page and try again.`);
    }
  };

  const handleTextEdit = (e) => {
    setEditableContent(e.target.value);
  };

  const formatText = (format) => {
    const textarea = document.getElementById('editable-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editableContent.substring(start, end);
    
    if (selectedText) {
      let formattedText = selectedText;
      
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'header':
          formattedText = `## ${selectedText}`;
          break;
        case 'subheader':
          formattedText = `### ${selectedText}`;
          break;
        default:
          break;
      }
      
      const newContent = editableContent.substring(0, start) + formattedText + editableContent.substring(end);
      setEditableContent(newContent);
    }
  };

  const addSection = () => {
    const newSection = `

## New Section Title

Add your content here...

`;
    setEditableContent(editableContent + newSection);
  };

  const saveEdits = () => {
    setGeneratedContent(editableContent);
    setIsEditMode(false);
    alert('Changes saved successfully!');
  };

  const currentTheme = colorThemes[colorTheme];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CiteWise
            </span>{' '}
            <span className="text-white">PDF Generator</span>
          </h1>
          <p className="text-gray-300 text-lg">Create professional PDFs with AI-powered content generation and advanced editing</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Inputs */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Content Setup
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-black/30 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Topic/Subject</label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 h-32 resize-none"
                    placeholder="Describe what you want the PDF to be about in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Document Template</label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-400"
                  >
                    {Object.entries(templates).map(([key, label]) => (
                      <option key={key} value={key} className="bg-gray-800">{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Styling Options */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                PDF Styling
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Color Themes</label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {Object.entries(colorThemes).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => setColorTheme(key)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          colorTheme === key 
                            ? 'border-blue-400 ring-2 ring-blue-400/30' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: theme.bg, color: theme.text }}
                      >
                        <div className="text-xs font-medium">{theme.name}</div>
                        <div className="flex gap-1 mt-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.header }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Font Family</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-400"
                    >
                      {fonts.map(font => (
                        <option key={font} value={font} className="bg-gray-800">{font}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
                    <input
                      type="range"
                      min="8"
                      max="20"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-gray-400">{fontSize}pt</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Show CiteWise Branding</span>
                  <button
                    onClick={() => setShowBranding(!showBranding)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showBranding ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showBranding ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Tools */}
            {isEditMode && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Editing Tools
                </h2>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => formatText('bold')}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg flex items-center justify-center"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => formatText('italic')}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg flex items-center justify-center"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => formatText('underline')}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg flex items-center justify-center"
                      title="Underline"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => formatText('header')}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-sm"
                    >
                      Header
                    </button>
                    <button
                      onClick={() => formatText('subheader')}
                      className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg text-sm"
                    >
                      Sub-Header
                    </button>
                  </div>
                  
                  <button
                    onClick={addSection}
                    className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </button>
                  
                  <button
                    onClick={saveEdits}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Preview Toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Controls */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim() || !userName.trim()}
                  className="flex-1 min-w-[200px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Generate Content
                    </>
                  )}
                </button>

                {isGenerating && (
                  <button
                    onClick={stopGeneration}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Stop Generation
                  </button>
                )}

                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  disabled={!generatedContent && !streamedText}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditMode ? 'Exit Editor' : 'Edit Content'}
                </button>

                <button
                  onClick={generatePDF}
                  disabled={!generatedContent && !streamedText}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>

                {(generatedContent || streamedText) && (
                  <button
                    onClick={() => {
                      setGeneratedContent('');
                      setStreamedText('');
                      setEditableContent('');
                      setIsEditMode(false);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Content Display */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
              {/* Status Bar */}
              <div className="bg-black/20 px-6 py-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    {isStreaming ? `Streaming... ${streamedText.length} characters` : 
                     (generatedContent || streamedText) ? `Content ready (${(isEditMode ? editableContent : (generatedContent || streamedText)).length} characters)` : 
                     'No content generated yet'}
                  </span>
                  {isStreaming && (
                    <div className="flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs">AI Streaming</span>
                    </div>
                  )}
                  {isEditMode && (
                    <div className="flex items-center gap-2 text-orange-400">
                      <Edit3 className="w-3 h-3" />
                      <span className="text-xs">Edit Mode</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                {isEditMode ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-300 mb-2">
                      Select text and use formatting tools, or edit directly:
                    </div>
                    <textarea
                      id="editable-content"
                      value={editableContent}
                      onChange={handleTextEdit}
                      className="w-full h-96 bg-black/20 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none font-mono text-sm"
                      placeholder="Your generated content will appear here for editing..."
                    />
                  </div>
                ) : showPreview && (streamedText || generatedContent) ? (
                  <div 
                    className="rounded-lg p-6 min-h-[500px] shadow-lg border max-h-96 overflow-y-auto"
                    style={{ 
                      backgroundColor: currentTheme.bg, 
                      color: currentTheme.text,
                      fontFamily: fontFamily,
                      fontSize: `${fontSize}px`,
                      lineHeight: '1.6'
                    }}
                  >
                    <div className="whitespace-pre-wrap">
                      {formatContentForPDF(streamedText || generatedContent)
                        .split('\n')
                        .map((line, index) => {
                          if (line.startsWith('##')) {
                            return (
                              <h2 
                                key={index} 
                                className="font-bold mb-6 mt-8"
                                style={{ 
                                  color: currentTheme.header,
                                  fontSize: `${fontSize + 6}px`
                                }}
                              >
                                {line.replace(/^#+\s*/, '')}
                              </h2>
                            );
                          } else if (line.startsWith('###')) {
                            return (
                              <h3 
                                key={index} 
                                className="font-semibold mb-4 mt-6"
                                style={{ 
                                  color: currentTheme.accent,
                                  fontSize: `${fontSize + 3}px`
                                }}
                              >
                                {line.replace(/^#+\s*/, '')}
                              </h3>
                            );
                          } else if (line.match(/^\d+\./)) {
                            return (
                              <div key={index} className="mb-3 ml-6">
                                {line}
                              </div>
                            );
                          } else if (line.startsWith('-') || line.startsWith('•')) {
                            return (
                              <div key={index} className="mb-3 ml-6">
                                • {line.replace(/^[-•]\s*/, '')}
                              </div>
                            );
                          } else {
                            return line.trim() ? (
                              <p key={index} className="mb-4 leading-relaxed">
                                {line}
                              </p>
                            ) : (
                              <div key={index} className="h-4" />
                            );
                          }
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-400">
                    <FileText className="w-20 h-20 mx-auto mb-6 opacity-50" />
                    <p className="text-xl mb-3">Ready to Create Professional PDFs</p>
                    <p className="text-sm mb-4">Enter your topic and select a template to generate comprehensive content</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-500 max-w-md mx-auto">
                      <div className="bg-white/5 p-2 rounded">✨ AI Generation</div>
                      <div className="bg-white/5 p-2 rounded">🎨 Custom Themes</div>
                      <div className="bg-white/5 p-2 rounded">✏️ Live Editing</div>
                      <div className="bg-white/5 p-2 rounded">📄 Multi-page PDF</div>
                      <div className="bg-white/5 p-2 rounded">🔄 Real-time Preview</div>
                      <div className="bg-white/5 p-2 rounded">⚡ Instant Download</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>© 2024 CODELIFT - Professional Document Generator | Powered by Advanced AI</p>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;