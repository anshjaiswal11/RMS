import React, { useEffect, useState } from 'react';
import { ChevronDown, Code, Zap, Download, Eye, Sparkles, Cpu, Brain, Layers } from 'lucide-react';

const RMSAgenticLanding = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to navigate to the main application
  const navigate = () => {
    window.location.href = "/agentic-ai";
  };

  // Trigger fade-in animation on component mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Reusable Feature Card Component with a new coding theme design
  const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="relative p-8 rounded-2xl backdrop-blur-lg bg-gray-900/60 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 transform hover:scale-105 group overflow-hidden">
      <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500/0 to-cyan-400/50 transition-all duration-500 group-hover:to-cyan-400"></div>
      <div className="relative z-10">
        <Icon className="w-12 h-12 mb-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
        <h3 className="text-2xl font-bold text-white mb-4 font-mono group-hover:text-cyan-300 transition-colors duration-300">{title}</h3>
        <p className="text-gray-200 text-xl leading-relaxed">{description}</p>
      </div>
    </div>
  );

  // Reusable Process Step Component with a new coding theme design
  const ProcessStep = ({ number, title, description, color }) => (
    <div className="flex items-start space-x-6 group">
      <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-2xl font-bold font-mono text-white shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
        {`0${number}`}
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-white mb-3 font-mono group-hover:text-cyan-300 transition-colors duration-300">{title}</h3>
        <p className="text-gray-200 text-xl leading-relaxed">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
        {/* Google Font import for a coding-style font */}
        <style>
            {`
                @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@400;500;900&display=swap');
                .font-mono { font-family: 'Fira Code', monospace; }
                .font-sans { font-family: 'Inter', sans-serif; }
            `}
        </style>
      
      {/* Background container with VS Code image and overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Abstract code background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/70 to-black/80"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 font-sans">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 relative">
          <div className={`text-center max-w-6xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 mb-8">
              <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
              <span className="text-cyan-300 font-semibold">Revolutionary AI Development Platform</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black mb-8 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent leading-tight drop-shadow-[0_2px_10px_rgba(72,187,255,0.5)] font-mono">
              CITEWISE-AGENTIC
            </h1>
            
            <p className="text-3xl md:text-4xl font-light text-gray-100 mb-6 leading-relaxed">
              AI That Codes, Thinks & Delivers
            </p>
            
            <p className="text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Transform your ideas into working applications in seconds. Our agentic AI doesn't just generate code—it understands context, makes intelligent decisions, and builds complete projects autonomously.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button onClick={navigate} className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-xl font-semibold hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25">
                Start Building Now
              </button>
              <button className="px-12 py-4 bg-white/10 backdrop-blur-lg rounded-full text-xl font-semibold border border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </div>
          
          <ChevronDown className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-8 text-cyan-400 animate-bounce" />
        </section>

        {/* What is Agentic AI Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(72,187,255,0.4)] font-mono">
                What is Agentic AI?
              </h2>
              <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Unlike traditional AI that simply responds to prompts, agentic AI acts with purpose, autonomy, and intelligence.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <FeatureCard
                icon={Brain}
                title="Autonomous Decision Making"
                description="Makes intelligent choices about architecture, frameworks, and implementation strategies without constant guidance."
              />
              <FeatureCard
                icon={Cpu}
                title="Context Awareness"
                description="Understands project requirements, user preferences, and technical constraints to deliver optimal solutions."
              />
              <FeatureCard
                icon={Layers}
                title="Goal-Oriented Execution"
                description="Works towards completing entire projects, not just individual tasks, with persistent memory and planning."
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(72,187,255,0.4)] font-mono">
              Revolutionary Features
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Zap}
                title="Instant Code Generation"
                description="Transform natural language prompts into fully functional applications in seconds. No more boilerplate, no more setup time."
              />
              <FeatureCard
                icon={Code}
                title="Intelligent Architecture"
                description="AI automatically selects optimal frameworks, design patterns, and project structures based on your requirements."
              />
              <FeatureCard
                icon={Sparkles}
                title="Autonomous Feature Addition"
                description="Simply describe new features and watch as AI seamlessly integrates them into your existing codebase."
              />
              <FeatureCard
                icon={Eye}
                title="Live Preview & Testing"
                description="See your applications come to life instantly with real-time preview and automatic testing capabilities."
              />
              <FeatureCard
                icon={Download}
                title="Complete Code Export"
                description="Download production-ready code with full documentation, tests, and deployment configurations."
              />
              <FeatureCard
                icon={Brain}
                title="Context-Aware AI"
                description="AI understands your project history, coding preferences, and business logic to make intelligent decisions."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(72,187,255,0.4)] font-mono">
              How CiteWise-Agentic Works
            </h2>
            
            <div className="space-y-16">
              <ProcessStep
                number="1"
                title="Describe Your Vision"
                description="Simply tell our AI what you want to build. Use natural language to describe features, functionality, and design preferences. The more detailed, the better the results."
                color="from-cyan-500 to-blue-600"
              />
              <ProcessStep
                number="2"
                title="AI Analyzes & Plans"
                description="Our agentic AI analyzes your requirements, selects optimal technologies, creates project architecture, and develops a comprehensive implementation strategy."
                color="from-blue-500 to-indigo-600"
              />
              <ProcessStep
                number="3"
                title="Autonomous Development"
                description="Watch as AI writes clean, production-ready code, implements features, handles edge cases, and optimizes performance—all without human intervention."
                color="from-teal-500 to-emerald-600"
              />
              <ProcessStep
                number="4"
                title="Test, Preview & Deploy"
                description="Your application is automatically tested, optimized, and made available for live preview. Download the complete codebase or deploy directly to production."
                color="from-sky-500 to-purple-600"
              />
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(72,187,255,0.4)] font-mono">
              Why Choose CiteWise-Agentic?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">10x Faster Development</h3>
                    <p className="text-gray-200 text-lg">What takes weeks now takes minutes. Focus on strategy while AI handles implementation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Zero Setup Required</h3>
                    <p className="text-gray-200 text-lg">No development environment setup, no dependency management, no configuration headaches.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Production-Ready Code</h3>
                    <p className="text-gray-200 text-lg">Generated code follows best practices, includes tests, and is optimized for performance.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Completely Free</h3>
                    <p className="text-gray-200 text-lg">No hidden costs, no usage limits. Build unlimited projects without any restrictions.</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl p-8 border border-blue-400/20">
                  <div className="text-center">
                    <div className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4 font-mono">
                      100%
                    </div>
                    <p className="text-2xl font-semibold text-white mb-2">Free Forever</p>
                    <p className="text-gray-200">No credit card required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(72,187,255,0.4)] font-mono">
              Ready to Experience the Future?
            </h2>
            <p className="text-2xl text-gray-200 mb-12 leading-relaxed">
              Join thousands of developers who are already building with CiteWise-Agentic AI. 
              Transform your ideas into reality in seconds, not weeks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button onClick={navigate} className="px-16 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-2xl font-semibold hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25">
                Start Building Now
              </button>
              <button className="px-16 py-5 bg-white/10 backdrop-blur-lg rounded-full text-2xl font-semibold border border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-300">
                Learn More
              </button>
            </div>
            
            <p className="text-gray-300 mt-8 text-lg">
              No signup required • Start coding immediately • 100% Free
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4 font-mono">
              CiteWise-AGENTIC
            </div>
            <p className="text-gray-300 mb-8">The future of software development is here</p>
            <div className="flex justify-center space-x-8">
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">Documentation</a>
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">Examples</a>
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">Community</a>
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default RMSAgenticLanding;
