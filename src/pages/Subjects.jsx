import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, BookOpen, Filter, Plus, ExternalLink, X, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://raw.githubusercontent.com/CODINGWITHU/RMSAPI/main/RMS.JSON';

const Subjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subjects = [
    {
      id: 'che110',
      code: 'CHE110',
      name: 'ENVIRONMENTAL STUDIES ENGINEERING',
      category: 'engineering',
      description: 'Comprehensive study of environmental engineering principles and practices.',
      resources: ['Notes', 'Syllabus'],
      status: 'active'
    },
    {
      id: 'cse101',
      code: 'CSE101',
      name: 'COMPUTER PROGRAMMING',
      category: 'computer-science',
      description: 'Fundamentals of computer programming and software development.',
      resources: ['Notes', 'Syllabus'],
      status: 'active'
    },
    {
      id: 'cse326',
      code: 'CSE326',
      name: 'INTERNET PROGRAMMING LABORATORY',
      category: 'computer-science',
      description: 'Practical laboratory work on internet programming and web development.',
      resources: ['Notes', 'Syllabus'],
      status: 'active'
    },
    {
      id: 'ece249',
      code: 'ECE249',
      name: 'BASIC ELECTRICAL AND ELECTRONICS ENGINEERING',
      category: 'electronics',
      description: 'Core concepts of electrical and electronics engineering fundamentals.',
      resources: ['Notes', 'Syllabus'],
      status: 'active'
    },
    {
      id: 'ece279',
      code: 'ECE279',
      name: 'BASIC ELECTRICAL AND ELECTRONICS ENGINEERING LABORATORY',
      category: 'electronics',
      description: 'Laboratory sessions for electrical and electronics engineering experiments.',
      resources: ['Notes', 'Syllabus'],
      status: 'active'
    },
    {
      id: 'int108',
      code: 'INT108',
      name: 'PYTHON PROGRAMMING',
      category: 'computer-science',
      description: 'Introduction to Python programming language and its applications.',
      resources: ['Notes', 'Syllabus'],
      status: 'active'
    },
    {
      id: 'int306',
      code: 'INT306',
      name: 'DATABASE MANAGEMENT SYSTEMS',
      category: 'computer-science',
      description: 'Study of database systems, SQL, and data management principles.',
      resources: ['Notes', 'Syllabus'],
      status: 'active'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Subjects', count: subjects.length },
    { id: 'computer-science', name: 'Computer Science', count: subjects.filter(s => s.category === 'computer-science').length },
    { id: 'engineering', name: 'Engineering', count: subjects.filter(s => s.category === 'engineering').length },
    { id: 'electronics', name: 'Electronics', count: subjects.filter(s => s.category === 'electronics').length }
  ];

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || subject.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const navigate = useNavigate();

  const handleViewResources = (subject) => {
    navigate(`/subject-resource?subject=${encodeURIComponent(subject.code + ' ' + subject.name)}`);
  };

  // Helper to get Google Drive embed link
  const getDriveEmbedUrl = (url) => {
    const match = url.match(/\/d\/(.*?)(\/|$)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  // Helper to get Google Drive download link
  const getDriveDownloadUrl = (url) => {
    const match = url.match(/\/d\/(.*?)(\/|$)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return url;
  };

  return (
    <>
      <Helmet>
        <title>Subjects | RMS - Comprehensive Study Resources</title>
        <meta name="description" content="Browse all subjects with comprehensive study resources including notes, previous year questions, and important topics for exam preparation." />
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white">
                All Subjects
              </h1>
            </div>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Browse through our comprehensive collection of subjects with detailed study resources, 
              notes, and syllabus for your exam preparation.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="card">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-field pl-10"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subjects Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid gap-6"
          >
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card hover:shadow-xl group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                            {subject.code} - {subject.name}
                          </h3>
                          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                            {subject.description}
                          </p>
                        </div>
                        <button className="btn-primary p-2 rounded-full group-hover:scale-110 transition-transform" onClick={() => handleViewResources(subject)}>
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Resources */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {subject.resources.map((resource, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                          >
                            {resource}
                          </span>
                        ))}
                      </div>

                      {/* Category Badge */}
                      <span className="inline-block px-3 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-full text-sm font-medium">
                        {categories.find(c => c.id === subject.category)?.name}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0 lg:ml-6">
                      <button className="btn-primary flex items-center justify-center space-x-2" onClick={() => handleViewResources(subject)}>
                        <span>View Resources</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card text-center py-12"
              >
                <BookOpen className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
                  No subjects found
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Try adjusting your search terms or category filter.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Subjects', value: subjects.length, color: 'from-blue-500 to-cyan-500' },
                { label: 'Computer Science', value: subjects.filter(s => s.category === 'computer-science').length, color: 'from-green-500 to-emerald-500' },
                { label: 'Engineering', value: subjects.filter(s => s.category === 'engineering').length, color: 'from-purple-500 to-pink-500' },
                { label: 'Electronics', value: subjects.filter(s => s.category === 'electronics').length, color: 'from-orange-500 to-red-500' }
              ].map((stat, index) => (
                <div key={index} className="card text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-secondary-600 dark:text-secondary-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Subjects; 