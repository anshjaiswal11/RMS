import React, { useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Define the base URL for your API
const API_BASE_URL = 'https://rms-backend-taupe.vercel.app/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the server responds with an error, throw it to be caught by the catch block
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      // Handle success
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });

    } catch (error) {
      // Handle errors from the fetch call or the server
      toast.error(`Error: ${error.message}`);
    } finally {
      // This will run whether the submission was successful or not
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'anshjaiswal1804@gmail.com',
      description: 'Send us an email anytime',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Lovely Professional University',
      description: 'Jalandhar, Punjab, India',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: 'Mon - Fri: 9:00 AM - 6:00 PM',
      description: 'IST (Indian Standard Time)',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const faqs = [
    {
      question: 'How do I access study materials?',
      answer: 'You can browse through our subjects page and select the subject you need. All study materials are organized by subject and topic.'
    },
    {
      question: 'Is the AI summarizer free to use?',
      answer: 'Yes, our AI PDF summarizer is completely free to use. You can upload PDF files up to 10MB and get instant summaries.'
    },
    {
      question: 'When will the test generator be available?',
      answer: 'Our AI test generator is currently in development and will be available in Q1 2024. You can join our waitlist to get early access.'
    },
    {
      question: 'How can I contribute to RMS?',
      answer: 'We welcome contributions! You can submit study materials, report issues, or suggest new features through our contact form or GitHub repository.'
    }
  ];

  return (
    <HelmetProvider>
      <Helmet>
        <title>Contact Us | RMS - Get in Touch</title>
        <meta name="description" content="Get in touch with the RMS team. We're here to help with your questions, feedback, and support needs." />
      </Helmet>
      <Toaster position="top-center" />

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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white">
                Contact Us
              </h1>
            </div>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto">
              Have questions, feedback, or need support? We're here to help! 
              Get in touch with our team and we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="card">
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="input-field resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Contact Info Cards */}
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="card"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-1">
                          {info.title}
                        </h3>
                        <p className="text-secondary-900 dark:text-white font-medium mb-1">
                          {info.value}
                        </p>
                        <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Team Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Our Team</h3>
                </div>
                <p className="text-white/90 mb-4">
                  We're a dedicated team of developers and educators committed to helping students 
                  excel in their academic journey.
                </p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-sm text-white/80">24/7 Support Available</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-center text-secondary-900 dark:text-white mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16"
          >
            <div className="card bg-gradient-to-br from-secondary-800 to-secondary-900 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                Join Our Community
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Connect with other students, share resources, and stay updated with the latest features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-secondary bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-4 text-lg" onClick={() => window.open('https://www.instagram.com/buildwithansh/', '_blank')}>
                  Follow on Instagram
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default Contact;
