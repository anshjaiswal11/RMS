import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  TrendingUp
} from 'lucide-react';

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

  const stats = [
    { number: '1000+', label: 'Students Helped', icon: Users },
    { number: '50+', label: 'Subjects Covered', icon: BookOpen },
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
    <>
      <Helmet>
        <title>RMS - Modern Reappear Management System | AI-Powered Study Assistant</title>
        <meta name="description" content="Transform your exam preparation with RMS - the modern reappear management system. AI-powered PDF summarization, auto note collection, and comprehensive study resources for students." />
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
                Modern
                <span className="block text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Study Assistant
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Transform your exam preparation with AI-powered tools. Summarize PDFs, collect notes automatically, 
                and generate personalized tests to ace your reappear exams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/ai-summarizer"
                  className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2 group"
                >
                  <span>Try AI Summarizer</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/subjects"
                  className="btn-secondary text-lg px-8 py-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Browse Subjects
                </Link>
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

        {/* Features Section */}
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
                Powerful Features
              </h2>
              <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
                Everything you need to excel in your reappear exams, powered by cutting-edge AI technology.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card group hover:scale-105"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white dark:bg-secondary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-secondary-900 dark:text-white mb-6">
                  Why Choose RMS?
                </h2>
                <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-8">
                  Our platform combines the power of AI with comprehensive study resources to give you 
                  the best possible preparation for your reappear exams.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-secondary-700 dark:text-secondary-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <Star className="w-6 h-6 text-yellow-300" />
                    <h3 className="text-2xl font-bold">Coming Soon</h3>
                  </div>
                  <p className="text-lg mb-6">
                    We're working on exciting new features including advanced AI test generation 
                    and real-time collaboration tools.
                  </p>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Development Progress</span>
                      <span className="text-sm font-semibold">75%</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
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
                Join thousands of students who are already using RMS to ace their exams.
              </p>
              <Link
                to="/ai-summarizer"
                className="btn-primary text-lg px-8 py-4 bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center space-x-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home; 