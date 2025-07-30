import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileText, Shield, ScrollText, Gavel } from 'lucide-react';

const TermsAndConditions = () => {
  const sections = [
    {
      icon: ScrollText,
      title: 'General Information',
      color: 'from-blue-500 to-cyan-500',
      content: [
        'This document is published under IT Act, 2000 and does not require physical/digital signature.',
        'These terms apply to your use of https://www.rmslpu.xyz and its associated mobile apps.',
        'You accept these Terms of Use by merely accessing or using the Platform.'
      ]
    },
    {
      icon: FileText,
      title: 'User Obligations',
      color: 'from-purple-500 to-pink-500',
      content: [
        'Provide true and accurate information during registration.',
        'Ensure lawful usage of our services and platform.',
        'Avoid unauthorized usage, duplication, or redistribution of content.'
      ]
    },
    {
      icon: Shield,
      title: 'Liability Disclaimer',
      color: 'from-yellow-500 to-orange-500',
      content: [
        'We provide no warranty on the accuracy, timeliness, or performance of content.',
        'Use of our platform is at your sole risk.',
        'We are not liable for any damages or losses arising from your use.'
      ]
    },
    {
      icon: Gavel,
      title: 'Governing Law & Jurisdiction',
      color: 'from-green-500 to-emerald-500',
      content: [
        'These terms are governed by the laws of India.',
        'All disputes shall be resolved under the jurisdiction of courts in Basti, Uttar Pradesh.',
        'Force majeure events exempt both parties from obligations temporarily.'
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Terms & Conditions | RMS</title>
        <meta name="description" content="Read the Terms and Conditions for using the RMS platform and services. Stay informed about your rights and responsibilities." />
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
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white">
                Terms & Conditions
              </h1>
            </div>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Please read these Terms carefully before using RMS. These terms govern your access and use of the website and services.
            </p>
            <div className="mt-6 text-sm text-secondary-500 dark:text-secondary-500">
              Last updated: December 2023
            </div>
          </motion.div>

          {/* Terms Sections */}
          <div className="space-y-8 mb-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
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
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-secondary-600 dark:text-secondary-400">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white"
          >
            <h2 className="text-2xl font-bold mb-4">
              Contact Us
            </h2>
            <p className="text-white/90 mb-6">
              If you have questions or concerns about these Terms, reach out to us:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> support@rmslpu.xyz</p>
              <p><strong>Address:</strong> Lovely Professional University, Jalandhar, Punjab, India</p>
              <p><strong>Response Time:</strong> We aim to respond within 48 hours.</p>
            </div>
          </motion.div>

          {/* Update Note */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-8 text-center"
          >
            <p className="text-secondary-600 dark:text-secondary-400">
              These Terms & Conditions may be updated occasionally. Please check this page regularly for any changes.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;
