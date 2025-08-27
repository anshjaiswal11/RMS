import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom'; // Removed to fix the error
import { 
  Brain, 
  FileText, 
  BookOpen, 
  Zap, 
  Users, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Twitter, // For Footer
  Github,  // For Footer
  Linkedin, // For Footer
  Briefcase, // For AI Career Platform
  Youtube, // For YouTube Summary
  Lightbulb // For PDF Theory
} from 'lucide-react';

// --- UPDATED FOOTER COMPONENT ---
const Footer = () => {
  const mainLinks = [
    { name: 'Home', path: '/' },
    { name: 'Subjects', path: '/subjects' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact', path: '/contact' },
  ];

  const aiToolsLinks = [
    { name: 'AI Summarizer', path: '/ai-summarizer' },
    { name: 'Test Generator', path: '/test-generator' },
    { name: 'RMS-AI', path: '/RMS-AI' },
    { name: 'Interview Prep', path: '/interview-prep' },
    { name: 'YouTube Summary', path: '/youtube_summary' },
  ];

  const supportLinks = [
    { name: 'Get RMS Key', path: '/GetRMSKey' },
    { name: 'Free Test', path: '/freetest' },
  ];

  const legalLinks = [
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Refund Policy', path: '/refund' },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#' },
    { icon: Github, href: '#' },
    { icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900 dark:text-white">CiteWise</span>
            </div>
            <p className="mt-4 text-secondary-600 dark:text-secondary-400">
              Your AI-powered research and study partner for academic excellence.
            </p>
          </div>

          {/* Link Columns */}
          <div className="col-span-1">
            <h3 className="font-semibold text-secondary-900 dark:text-white">Main</h3>
            <ul className="mt-4 space-y-2">
              {mainLinks.map(link => (
                <li key={link.name}><a href={link.path} className="text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">{link.name}</a></li>
              ))}
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="font-semibold text-secondary-900 dark:text-white">AI Tools</h3>
            <ul className="mt-4 space-y-2">
              {aiToolsLinks.map(link => (
                <li key={link.name}><a href={link.path} className="text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">{link.name}</a></li>
              ))}
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="font-semibold text-secondary-900 dark:text-white">Support</h3>
            <ul className="mt-4 space-y-2">
              {supportLinks.map(link => (
                <li key={link.name}><a href={link.path} className="text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">{link.name}</a></li>
              ))}
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="font-semibold text-secondary-900 dark:text-white">Legal</h3>
            <ul className="mt-4 space-y-2">
              {legalLinks.map(link => (
                <li key={link.name}><a href={link.path} className="text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">{link.name}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary-200 dark:border-secondary-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-secondary-600 dark:text-secondary-400 text-sm">
            &copy; {new Date().getFullYear()} CiteWise. All Rights Reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                    <a key={index} href={social.href} className="text-secondary-500 hover:text-primary-500 transition-colors">
                        <Icon className="w-5 h-5" />
                    </a>
                )
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};


const Home = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Summarization',
      description: 'Upload PDF notes and get intelligent summaries using advanced AI technology.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FileText,
      title: 'Auto Note Collection',
      description: 'Automatically collect and organize study materials from various sources.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Resources',
      description: 'Access notes, MCQs, and important topics for all subjects.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Smart Test Generation',
      description: 'Generate personalized practice tests based on your study progress.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const aiWorkflows = [
    {
        icon: Lightbulb,
        title: 'AI PDF Theory Platform',
        description: 'Upload PDFs and let our AI extract key theories, definitions, and concepts to help you grasp complex topics faster.',
        path: '/ai-pdf-theory',
        color: 'from-indigo-500 to-purple-500'
    },
    {
        icon: BookOpen,
        title: 'Research Study Assistant',
        description: 'Streamline your research. Our AI helps find relevant papers, summarize articles, and organize your findings efficiently.',
        path: '/research-study-assistant',
        color: 'from-sky-500 to-blue-500'
    },
    {
        icon: Briefcase,
        title: 'AI Career Platform',
        description: 'Boost your career with AI-driven interview prep, resume feedback, and personalized career path exploration.',
        path: '/ai-career-platform',
        color: 'from-amber-500 to-orange-500'
    },
    {
        icon: Youtube,
        title: 'YouTube Summary',
        description: "Don't have time for long video lectures? Paste a YouTube link to get a concise, easy-to-read summary in seconds.",
        path: '/youtube_summary',
        color: 'from-red-500 to-rose-500'
    }
  ];

  const stats = [
    { number: '2000+', label: 'Students Helped', icon: Users },
    { number: '20+', label: 'Subjects Covered', icon: BookOpen },
    { number: '95%', label: 'Success Rate', icon: TrendingUp },
    { number: '24/7', label: 'Available', icon: Shield }
  ];

  const benefits = [
    'AI-powered PDF summarization',
    'Automatic note collection from websites',
    'Personalized test generation',
    'Comprehensive subject coverage',
    'Modern, responsive design',
    'Dark/Light mode support',
    'Mobile-friendly interface',
    'Real-time progress tracking'
  ];

  return (
    <HelmetProvider>
      <Helmet>
        <title>CiteWise - Your AI-Powered Research and Study Partner</title>
        <meta name="description" content="Elevate your studies with CiteWise. Get AI-powered PDF summarization, automated note collection, and comprehensive study resources to achieve academic excellence." />
      </Helmet>

      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                CiteWise
                <span className="block text-white bg-clip-text text-transparent">
                  Your AI Study Partner
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Elevate your learning with AI-powered tools. Summarize PDFs, streamline research, 
                and generate personalized tests to achieve academic excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/ai-summarizer"
                  className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2 group"
                >
                  <span>Try AI Summarizer</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="/research-study-assistant"
                  className="btn-secondary text-lg px-8 py-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Research Assistant
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white dark:bg-secondary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
                    <div className="text-secondary-600 dark:text-secondary-400">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- NEW AI WORKFLOWS SECTION --- */}
        <section className="py-20 bg-secondary-50 dark:bg-secondary-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
                        Explore Our AI Workflows
                    </h2>
                    <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
                        Discover how CiteWise's specialized AI tools can transform your study and research habits.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {aiWorkflows.map((workflow, index) => {
                        const Icon = workflow.icon;
                        return (
                            <motion.a
                                key={index}
                                href={workflow.path}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="card group hover:scale-105 block" // Added block to make the whole card clickable
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${workflow.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                                    {workflow.title}
                                </h3>
                                <p className="text-secondary-600 dark:text-secondary-400">
                                    {workflow.description}
                                </p>
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </section>

        {/* Benefits Section (Formerly "Why Choose RMS?") */}
        <section className="py-20 bg-white dark:bg-secondary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-1 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-secondary-900 dark:text-white mb-6 text-center">
                  Why Choose CiteWise?
                </h2>
                <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-8 max-w-3xl mx-auto text-center">
                  Our platform combines the power of AI with comprehensive study resources to give you 
                  the best possible preparation for your academic journey.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-secondary-700 dark:text-secondary-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Study Experience?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of students who are already using CiteWise to ace their exams.
              </p>
              <a
                href="/ai-summarizer"
                className="btn-primary text-lg px-8 py-4 bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center space-x-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </HelmetProvider>
  );
};

export default Home;
