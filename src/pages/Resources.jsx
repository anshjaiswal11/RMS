import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Link, 
  Download, 
  ExternalLink,
  Book,
  GraduationCap,
  Library,
  Globe
} from 'lucide-react';

const Resources = () => {
  const resourceCategories = [
    {
      title: 'Study Materials',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      items: [
        {
          name: 'Comprehensive Notes',
          description: 'Detailed study notes for all subjects',
          type: 'PDF',
          size: '2.5 MB',
          link: '#'
        },
        {
          name: 'Important Topics',
          description: 'Key topics and concepts for exam preparation',
          type: 'PDF',
          size: '1.8 MB',
          link: '#'
        },
        {
          name: 'Formula Sheets',
          description: 'Quick reference formulas and equations',
          type: 'PDF',
          size: '950 KB',
          link: '#'
        }
      ]
    },
    {
      title: 'Practice Tests',
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      items: [
        {
          name: 'MCQ Bank',
          description: 'Multiple choice questions with answers',
          type: 'PDF',
          size: '3.2 MB',
          link: '#'
        },
        {
          name: 'Previous Year Questions',
          description: 'PYQs from last 5 years',
          type: 'PDF',
          size: '4.1 MB',
          link: '#'
        },
        {
          name: 'Mock Tests',
          description: 'Full-length practice tests',
          type: 'PDF',
          size: '2.8 MB',
          link: '#'
        }
      ]
    },
    {
      title: 'Reference Books',
      icon: Book,
      color: 'from-purple-500 to-pink-500',
      items: [
        {
          name: 'Textbook Recommendations',
          description: 'Best books for each subject',
          type: 'List',
          size: 'N/A',
          link: '#'
        },
        {
          name: 'Digital Library Access',
          description: 'Online book resources and e-books',
          type: 'Link',
          size: 'N/A',
          link: '#'
        },
        {
          name: 'Study Guides',
          description: 'Comprehensive study guides',
          type: 'PDF',
          size: '5.2 MB',
          link: '#'
        }
      ]
    },
    {
      title: 'Online Resources',
      icon: Globe,
      color: 'from-orange-500 to-red-500',
      items: [
        {
          name: 'Video Lectures',
          description: 'Recorded lectures and tutorials',
          type: 'Video',
          size: 'N/A',
          link: '#'
        },
        {
          name: 'Interactive Quizzes',
          description: 'Online practice quizzes',
          type: 'Web',
          size: 'N/A',
          link: '#'
        },
        {
          name: 'Discussion Forums',
          description: 'Student community and Q&A',
          type: 'Forum',
          size: 'N/A',
          link: '#'
        }
      ]
    }
  ];

  const quickLinks = [
    {
      name: 'University Library',
      description: 'Access to digital library resources',
      icon: Library,
      link: '#',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      name: 'Academic Calendar',
      description: 'Important dates and deadlines',
      icon: GraduationCap,
      link: 'https://drive.google.com/file/d/1mDptTjJ-J4jJodrtHxYSWLI5lclyZ5Hj/view?usp=sharing',
      color: 'from-green-500 to-teal-500'
    },
    {
      name: 'Study Groups',
      description: 'Join study groups and discussions',
      icon: BookOpen,
      link: '#',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Tutorial Videos',
      description: 'Step-by-step tutorial videos',
      icon: FileText,
      link: '#',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Resources | RMS - Study Materials & References</title>
        <meta name="description" content="Access comprehensive study materials, practice tests, reference books, and online resources for effective exam preparation." />
      </Helmet>

      <div className="pt-16 min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Library className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white">
                Study Resources
              </h1>
            </div>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Access comprehensive study materials, practice tests, reference books, and online resources 
              to enhance your exam preparation and academic success.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-8">
              Quick Access
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card hover:shadow-xl group cursor-pointer"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                      {link.name}
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                      {link.description}
                    </p>
                    <button className="btn-primary w-full flex items-center justify-center space-x-2">
                      <span>Access</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Resource Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-12"
          >
            {resourceCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <div key={categoryIndex}>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3 mb-8"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {category.title}
                    </h2>
                  </motion.div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.items.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="card hover:shadow-xl group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-secondary-600 dark:text-secondary-400 mb-3">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <span className="px-2 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded text-sm font-medium">
                            {item.type}
                          </span>
                          {item.size !== 'N/A' && (
                            <span className="text-sm text-secondary-500 dark:text-secondary-500">
                              {item.size}
                            </span>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button className="btn-primary flex-1 flex items-center justify-center space-x-2">
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                          <button className="btn-secondary p-2 rounded-lg">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                Need More Resources?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Can't find what you're looking for? Let us know and we'll add it to our collection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                  Request Resource
                </button>
                <button className="btn-secondary bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-4 text-lg">
                  Contact Support
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Resources; 