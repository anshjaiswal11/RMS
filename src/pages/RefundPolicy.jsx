import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { RotateCcw, AlertTriangle, PackageCheck, ClipboardCheck } from 'lucide-react';

const RefundPolicy = () => {
  const sections = [
    {
      icon: RotateCcw,
      title: 'Cancellation Policy',
      color: 'from-red-500 to-rose-500',
      content: [
        'Cancellations are allowed only if requested within 7 days of placing the order.',
        'Cancellation may not be possible if the order is already shipped or out for delivery.',
        'In such cases, you may reject the order at your doorstep.',
        'Cancellations are not accepted for perishable items (e.g., flowers, food).'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Damaged or Defective Items',
      color: 'from-yellow-500 to-orange-500',
      content: [
        'Report damaged or defective items within 7 days of receipt.',
        'The seller or merchant will verify the issue at their end.',
        'Once confirmed, appropriate actions (refund/replacement) will be taken.'
      ]
    },
    {
      icon: PackageCheck,
      title: 'Product Mismatch or Dissatisfaction',
      color: 'from-indigo-500 to-purple-500',
      content: [
        'If the product is not as described or does not meet expectations, report it within 7 days.',
        'Our support team will evaluate the issue and decide accordingly.'
      ]
    },
    {
      icon: ClipboardCheck,
      title: 'Refund Process',
      color: 'from-green-500 to-emerald-500',
      content: [
        'Approved refunds will be processed within 7 working days.',
        'Warranty-related issues should be addressed directly to the manufacturer.',
        'All refund requests are subject to RMS AI’s approval after internal verification.'
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Refund & Cancellation Policy | RMS</title>
        <meta name="description" content="Read RMS's policy on refunds, returns, and cancellations for services and products purchased through the platform." />
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
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white">
                Refund & Cancellation Policy
              </h1>
            </div>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Understand how we handle cancellations, refunds, and replacement requests at RMS. We value transparency and customer satisfaction.
            </p>
            <div className="mt-6 text-sm text-secondary-500 dark:text-secondary-500">
              Last updated: December 2023
            </div>
          </motion.div>

          {/* Policy Sections */}
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

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white"
          >
            <h2 className="text-2xl font-bold mb-4">
              Contact Support
            </h2>
            <p className="text-white/90 mb-6">
              For refund or cancellation issues, reach out to our customer care:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> support@rmslpu.xyz</p>
              <p><strong>Phone:</strong> +91-XXXXXXXXXX</p>
              <p><strong>Address:</strong> Lovely Professional University, Punjab, India</p>
              <p><strong>Resolution Time:</strong> We aim to resolve all refund requests within 7 business days.</p>
            </div>
          </motion.div>

          {/* Update Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-8 text-center"
          >
            <p className="text-secondary-600 dark:text-secondary-400">
              This policy may be updated from time to time. Please check this page regularly to stay informed of any changes.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
