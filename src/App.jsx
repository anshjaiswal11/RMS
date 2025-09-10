import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Subjects from './pages/Subjects';
import AISummarizer from './pages/AISummarizer';
import TestGenerator from './pages/TestGenerator';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import SubjectResource from './pages/SubjectResource';
import { ThemeProvider } from './context/ThemeContext';
import RmsAi from './pages/RmsAi';
import Terms from './pages/Terms';
import RefundPolicy from './pages/RefundPolicy';
import InterviewPrep from './pages/Interview';
// import { Youtube } from 'lucide-react';
import Youtube from './pages/Youtube';
import GetRMSKey from './pages/Getkey';
import Admin from './pages/Admin';
import Freetest from './pages/Freetest';
import PDFTheoryPlatform from './pages/PDFTheoryPlatform'
import ResearchStudyAssistant from './pages/ResearchStudyAssistant';
import AICareerPlatform from './pages/AICareerPlatform';
import AI from './pages/AgenticAI'
import MindMapFlashcardGenerator from './pages/MindMapFlashcardGenerator';
import ServerError from './pages/servererror';
import Agenticpreview from './pages/RMSAgenticLanding';
import Pdfgenerator from './pages/Pdfgenerator';
import PDFEditor from './pages/Pdfeditor';


function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Loading RMS...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/GetRMSKey" element={<GetRMSKey />} />
            <Route path="/ai-pdf-theory" element={<PDFTheoryPlatform />} />
            <Route path="/research-study-assistant" element={<ResearchStudyAssistant />} />
            <Route path="/ai-career-platform" element={<AICareerPlatform />} />
            <Route path="/agentic-ai-preview-$=001" element={<Agenticpreview />} />
            <Route path="/agentic-ai" element={<AI />} />
            <Route path="/mind-map-flashcard-generator" element={<MindMapFlashcardGenerator />} />
            <Route path="/pdf-generator" element={<Pdfgenerator />} />
            <Route path="/server-error" element={<ServerError />} />
            <Route path="/pdf-editor" element={<PDFEditor />} />
            {/* <Route path="/refundpolicy" element={<RefundPolicy />} /> */}
            <Route path="/freetest" element={<Freetest />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/interview-prep" element={<InterviewPrep />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/youtube_summary" element={<Youtube />} />
            <Route path="/RMS-AI" element={<RmsAi />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/ai-summarizer" element={<AISummarizer />} />
            <Route path="/test-generator" element={<TestGenerator />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/subject-resource" element={<SubjectResource />} />
          </Routes>
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}

export default App; 