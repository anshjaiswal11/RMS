import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Users, FileText } from 'lucide-react';

const Privacy = () => {
  const sections = [
    {
      icon: Eye,
      title: 'Information We Collect',
      color: 'from-blue-500 to-cyan-500',
      content: [
        'Personal information (name, email address) when you contact us',
        'Usage data and analytics to improve our services',
        'PDF files you upload for AI summarization (processed securely)',
        'Device and browser information for technical support'
      ]
    },
    {
      icon: Database,
      title: 'How We Use Your Information',
      color: 'from-green-500 to-emerald-500',
      content: [
        'Provide and maintain our services',
        'Process PDF files for AI summarization',
        'Send you important updates and notifications',
        'Improve our AI algorithms and user experience',
        'Respond to your inquiries and support requests'
      ]
    },
    {
      icon: Lock,
      title: 'Data Security',
      color: 'from-purple-500 to-pink-500',
      content: [
        'All data is encrypted using industry-standard protocols',
        'PDF files are processed securely and not stored permanently',
        'We implement strict access controls and security measures',
        'Regular security audits and updates are performed',
        'Your personal information is protected against unauthorized access'
      ]
    },
    {
      icon: Users,
      title: 'Data Sharing',
      color: 'from-orange-500 to-red-500',
      content: [
        'We do not sell, trade, or rent your personal information',
        'Data may be shared with trusted third-party service providers',
        'Information may be disclosed if required by law',
        'Aggregated, anonymized data may be used for research purposes',
        'You have control over your data and can request deletion'
      ]
    }
  ];

  const rights = [
    'Access your personal data',
    'Correct inaccurate information',
    'Request deletion of your data',
    'Object to data processing',
    'Data portability',
    'Withdraw consent at any time'
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy | RMS - Data Protection & Security</title>
        <meta name="description" content="Learn about how RMS protects your privacy and handles your data. Our comprehensive privacy policy ensures your information is secure and protected." />
      </Helmet>

      <div className="pt-16 min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white">
                Privacy Policy
              </h1>
            </div>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information 
              when you use RMS services.
            </p>
            <div className="mt-6 text-sm text-secondary-500 dark:text-secondary-500">
              Last updated: December 2023
            </div>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="card mb-12"
          >
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
              Introduction
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              RMS ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our website and services, including our AI-powered 
              PDF summarizer and study resources.
            </p>
            <p className="text-secondary-600 dark:text-secondary-400">
              By using our services, you agree to the collection and use of information in accordance with this policy. 
              If you have any questions about this Privacy Policy, please contact us.
            </p>
          </motion.div>

          {/* Privacy Sections */}
          <div className="space-y-8 mb-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                  className="card"
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                        {section.title}
                      </h3>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-secondary-600 dark:text-secondary-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="card mb-12"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                Your Rights
              </h2>
            </div>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              You have certain rights regarding your personal information. You can:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {rights.map((right, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-secondary-700 dark:text-secondary-300">{right}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="card mb-12"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                Cookies and Tracking
              </h2>
            </div>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our website. 
              These technologies help us:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-secondary-600 dark:text-secondary-400">
                  Remember your preferences and settings
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-secondary-600 dark:text-secondary-400">
                  Analyze website traffic and usage patterns
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-secondary-600 dark:text-secondary-400">
                  Improve our services and user experience
                </span>
              </li>
            </ul>
            <p className="text-secondary-600 dark:text-secondary-400">
              You can control cookie settings through your browser preferences. However, disabling certain cookies 
              may affect the functionality of our website.
            </p>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white"
          >
            <h2 className="text-2xl font-bold mb-4">
              Contact Us
            </h2>
            <p className="text-white/90 mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-white/90">
                <strong>Email:</strong> privacy@rmslpu.xyz
              </p>
              <p className="text-white/90">
                <strong>Address:</strong> Lovely Professional University, Jalandhar, Punjab, India
              </p>
              <p className="text-white/90">
                <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 48 hours.
              </p>
            </div>
          </motion.div>

          {/* Updates */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mt-8 text-center"
          >
            <p className="text-secondary-600 dark:text-secondary-400">
              This Privacy Policy may be updated from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Privacy; 