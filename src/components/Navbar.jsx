import React, { useState, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom'; // Removed to fix context error
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  BookOpen, 
  Brain, 
  FileText, 
  FolderOpen, 
  MessageCircle, 
  Shield,
  Bot,
  ChevronDown, // Added for dropdown indicator
  Briefcase,
  Youtube,
  Lightbulb,
  KeyRound,
  Users,
  Code
} from 'lucide-react';
// Note: You might need to install a theme context or remove this line
// import { useTheme } from '../context/ThemeContext'; 

// FIX: Mock the Link component to avoid router context errors in isolation.
const Link = ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Mock theme context if not available
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(!isDark);
  // const { isDark, toggleTheme } = useTheme(); 
  
  // FIX: Use window.location.pathname instead of useLocation() hook
  const location = window.location;

  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Define the services for the dropdown
  const services = [
      { path: '/RMS-AI', label: 'RMS-AI', icon: Bot },
      { path: '/youtube_summary', label: 'YouTube Summary', icon: Youtube },
      { path: '/interview-prep', label: 'Interview Prep', icon: Users },
      { path: '/GetRMSKey', label: 'Get RMS Key', icon: KeyRound },
      { path: '/ai-pdf-theory', label: 'PDF Theory Platform', icon: Lightbulb },
      { path: '/research-study-assistant', label: 'Research Assistant', icon: BookOpen },
      { path: '/ai-career-platform', label: 'AI Career Platform', icon: Briefcase },
      { path: '/mind-map-flashcard-generator', label: 'Mind Map Flashcard Generator', icon: Lightbulb },
      { path: '/agentic-ai', label: 'Agentic AI', icon: Code },
  ];

  const navItems = [
    { path: '/', label: 'Home', icon: BookOpen },
    { path: '/subjects', label: 'Subjects', icon: FolderOpen },
    { label: 'Services', icon: Brain, children: services }, // Services dropdown
    { path: '/ai-summarizer', label: 'AI Summarizer', icon: Brain },
    { path: '/test-generator', label: 'Test Generator', icon: FileText },
    { path: '/contact', label: 'Contact', icon: MessageCircle },
    { path: '/privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-secondary-900/80 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">CiteWise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => 
              item.children ? (
                <div 
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setServicesDropdownOpen(true)}
                  onMouseLeave={() => setServicesDropdownOpen(false)}
                >
                  <button
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                      item.children.some(child => location.pathname === child.path)
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {servicesDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-secondary-800 rounded-lg shadow-xl p-2"
                      >
                        {item.children.map(child => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setServicesDropdownOpen(false)}
                              className={`flex items-center space-x-3 w-full text-left px-3 py-2 rounded-md transition-all duration-200 ${
                                location.pathname === child.path
                                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                              }`}
                            >
                              <ChildIcon className="w-4 h-4" />
                              <span className="font-medium text-sm">{child.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            )}
          </div>

          {/* Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors duration-200"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors duration-200"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-700"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return item.children ? (
                  <div key={item.label}>
                    <button
                      onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                      className="flex items-center justify-between w-full space-x-3 px-4 py-3 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                    {mobileServicesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-8"
                      >
                        <div className="py-2 space-y-1">
                        {item.children.map(child => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                location.pathname === child.path
                                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                  : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                              }`}
                            >
                              <ChildIcon className="w-5 h-5" />
                              <span className="font-medium">{child.label}</span>
                            </Link>
                          )
                        })}
                        </div>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
