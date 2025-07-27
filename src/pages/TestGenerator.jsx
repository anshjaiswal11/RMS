import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  Users, 
  Star, 
  Zap, 
  Brain,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const TestGenerator = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Questions',
      description: 'Intelligent question generation based on your study materials and exam patterns.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Clock,
      title: 'Timed Practice Tests',
      description: 'Simulate real exam conditions with customizable time limits and question counts.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Performance Analytics',
      description: 'Track your progress with detailed analytics and performance insights.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Star,
      title: 'Adaptive Difficulty',
      description: 'Questions that adapt to your skill level for optimal learning experience.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const upcomingFeatures = [
    'Personalized question generation',
    'Multiple question types (MCQ, descriptive, numerical)',
    'Subject-specific test templates',
    'Real-time performance tracking',
    'Collaborative study groups',
    'Export test results and analytics',
    'Mobile app for offline practice',
    'Integration with AI summarizer'
  ];

  return (
    <>
      <Helmet>
        <title>AI Test Generator | RMS - Coming Soon</title>
        <meta name="description" content="Generate personalized practice tests using AI technology. Coming soon - the ultimate tool for exam preparation and self-assessment." />
      </Helmet>

      <div className="pt-16 min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white">
                AI Test Generator
              </h1>
            </div>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Coming Soon</span>
            </div>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Generate personalized practice tests using advanced AI technology. 
              Perfect for exam preparation, self-assessment, and improving your performance.
            </p>
          </motion.div>

          {/* Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="card bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white text-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Revolutionizing Test Preparation
              </h2>
              <p className="text-xl mb-8 text-white/90">
                We're building the most advanced AI-powered test generator to help you excel in your exams. 
                Get ready for a completely new way of practicing and improving your skills.
              </p>
              
              {/* Progress Section */}
              <div className="bg-white/20 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Development Progress</span>
                  <span className="text-2xl font-bold">85%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3 mb-4">
                  <motion.div
                    className="bg-white h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                </div>
                <p className="text-sm text-white/80">
                  Expected Launch: Q1 2024
                </p>
              </div>

              {/* Notify Button */}
              <button className="btn-primary bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Get Notified When Ready
              </button>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-center text-secondary-900 dark:text-white mb-12">
              Powerful Features Coming Soon
            </h2>
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
          </motion.div>

          {/* Upcoming Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">
                What to Expect
              </h2>
              <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-8">
                Our AI test generator will revolutionize how you prepare for exams. 
                From personalized questions to detailed analytics, we're building everything 
                you need to succeed.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-secondary-700 dark:text-secondary-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="card bg-gradient-to-br from-secondary-800 to-secondary-900 text-white">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">AI Technology</h3>
                </div>
                <p className="text-lg mb-6 text-white/90">
                  Our advanced AI algorithms analyze your study patterns, identify weak areas, 
                  and generate questions that target your specific needs.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-white/80">Natural Language Processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white/80">Machine Learning Models</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-white/80">Adaptive Learning</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-16"
          >
            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <h2 className="text-3xl font-bold mb-4">
                Be the First to Try It
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Join our waitlist and get early access to the most advanced test generator ever built.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold flex items-center justify-center space-x-2">
                  <span>Join Waitlist</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="btn-secondary bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-4 text-lg">
                  Learn More
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TestGenerator; 