import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ChevronDown, Code, Zap, Download, Eye, Sparkles, Cpu, Brain, Layers } from 'lucide-react';

const RMSAgenticLanding = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);


  const navigate = () => {
    window.location.href = "/agentic-ai";
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Particle system for code rain effect
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.5, 1, 0.5);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Floating geometric shapes
    const shapes = [];
    for (let i = 0; i < 15; i++) {
      const geometry = Math.random() > 0.5 
        ? new THREE.BoxGeometry(0.5, 0.5, 0.5)
        : new THREE.OctahedronGeometry(0.3);
      
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 1, 0.6),
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      shapes.push(mesh);
      scene.add(mesh);
    }

    camera.position.z = 15;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Animate particles
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.1;
        if (positions[i] < -25) {
          positions[i] = 25;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Animate shapes
      shapes.forEach((shape, i) => {
        shape.rotation.x += 0.01 + i * 0.001;
        shape.rotation.y += 0.01 + i * 0.001;
        shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
      });

      // Camera movement
      camera.position.x = Math.sin(Date.now() * 0.0005) * 2;
      camera.position.y = Math.cos(Date.now() * 0.0003) * 1;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);
    sceneRef.current = { scene, camera, renderer, cleanup: () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    }};

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        sceneRef.current.cleanup();
      }
    };
  }, []);

  const FeatureCard = ({ icon: Icon, title, description, gradient }) => (
    <div className={`relative p-8 rounded-2xl backdrop-blur-lg bg-gradient-to-br ${gradient} border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:scale-105 hover:rotate-1 group`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
      <div className="relative z-10">
        <Icon className="w-12 h-12 mb-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">{title}</h3>
        <p className="text-gray-200 text-xl leading-relaxed">{description}</p>
      </div>
    </div>
  );

  const ProcessStep = ({ number, title, description, color }) => (
    <div className="flex items-start space-x-6 group">
      <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-2xl font-bold text-white shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">{title}</h3>
        <p className="text-gray-200 text-xl leading-relaxed">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Three.js Background */}
      <div ref={mountRef} className="fixed inset-0 z-0" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 relative">
          <div className={`text-center max-w-6xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 mb-8">
              <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
              <span className="text-cyan-300 font-semibold">Revolutionary AI Development Platform</span>
            </div>
            
            {/* UPDATED: Added drop-shadow for visibility */}
            <h1 className="text-7xl md:text-8xl font-black mb-8 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight drop-shadow-[0_2px_10px_rgba(72,187,255,0.5)]">
              CITEWISE-AGENTIC
            </h1>
            
            {/* UPDATED: Increased text brightness for better contrast */}
            <p className="text-3xl md:text-4xl font-light text-gray-100 mb-6 leading-relaxed">
              AI That Codes, Thinks & Delivers
            </p>
            
            {/* UPDATED: Increased text brightness for better contrast */}
            <p className="text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Transform your ideas into working applications in seconds. Our agentic AI doesn't just generate code—it understands context, makes intelligent decisions, and builds complete projects autonomously.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button onClick={navigate} className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-xl font-semibold hover:from-cyan-400 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25">
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
              {/* UPDATED: Added drop-shadow for visibility */}
              <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(72,187,255,0.4)]">
                What is Agentic AI?
              </h2>
              {/* UPDATED: Increased text brightness for better contrast */}
              <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Unlike traditional AI that simply responds to prompts, agentic AI acts with purpose, autonomy, and intelligence
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <FeatureCard
                icon={Brain}
                title="Autonomous Decision Making"
                description="Makes intelligent choices about architecture, frameworks, and implementation strategies without constant guidance."
                gradient="from-purple-600/20 to-pink-600/20"
              />
              <FeatureCard
                icon={Cpu}
                title="Context Awareness"
                description="Understands project requirements, user preferences, and technical constraints to deliver optimal solutions."
                gradient="from-cyan-600/20 to-blue-600/20"
              />
              <FeatureCard
                icon={Layers}
                title="Goal-Oriented Execution"
                description="Works towards completing entire projects, not just individual tasks, with persistent memory and planning."
                gradient="from-emerald-600/20 to-teal-600/20"
              />
            </div>

            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl p-12 border border-cyan-400/20">
              <h3 className="text-3xl font-bold text-center mb-8 text-cyan-300">Key Characteristics of Our Agentic AI</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">Persistent Memory</h4>
                      {/* UPDATED: Increased text brightness */}
                      <p className="text-gray-200">Remembers project context, user preferences, and previous decisions throughout the development process.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">Multi-Step Planning</h4>
                      <p className="text-gray-200">Creates comprehensive project roadmaps and executes complex, multi-stage development tasks.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 rounded-full bg-pink-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">Self-Correction</h4>
                      <p className="text-gray-200">Identifies and fixes issues autonomously, improving code quality through iterative refinement.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">Tool Integration</h4>
                      <p className="text-gray-200">Seamlessly uses multiple development tools, APIs, and frameworks to achieve project goals.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">Learning Adaptation</h4>
                      <p className="text-gray-200">Adapts coding style and approaches based on project requirements and user feedback.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">Proactive Problem Solving</h4>
                      <p className="text-gray-200">Anticipates potential issues and implements solutions before problems arise.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            {/* UPDATED: Added drop-shadow for visibility */}
            <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(72,187,255,0.4)]">
              Revolutionary Features
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Zap}
                title="Instant Code Generation"
                description="Transform natural language prompts into fully functional applications in seconds. No more boilerplate, no more setup time."
                gradient="from-yellow-600/20 to-orange-600/20"
              />
              <FeatureCard
                icon={Code}
                title="Intelligent Architecture"
                description="AI automatically selects optimal frameworks, design patterns, and project structures based on your requirements."
                gradient="from-blue-600/20 to-indigo-600/20"
              />
              <FeatureCard
                icon={Sparkles}
                title="Autonomous Feature Addition"
                description="Simply describe new features and watch as AI seamlessly integrates them into your existing codebase."
                gradient="from-purple-600/20 to-pink-600/20"
              />
              <FeatureCard
                icon={Eye}
                title="Live Preview & Testing"
                description="See your applications come to life instantly with real-time preview and automatic testing capabilities."
                gradient="from-green-600/20 to-emerald-600/20"
              />
              <FeatureCard
                icon={Download}
                title="Complete Code Export"
                description="Download production-ready code with full documentation, tests, and deployment configurations."
                gradient="from-red-600/20 to-pink-600/20"
              />
              <FeatureCard
                icon={Brain}
                title="Context-Aware AI"
                description="AI understands your project history, coding preferences, and business logic to make intelligent decisions."
                gradient="from-teal-600/20 to-cyan-600/20"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            {/* UPDATED: Added drop-shadow for visibility */}
            <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(72,187,255,0.4)]">
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
                color="from-purple-500 to-pink-600"
              />
              <ProcessStep
                number="3"
                title="Autonomous Development"
                description="Watch as AI writes clean, production-ready code, implements features, handles edge cases, and optimizes performance—all without human intervention."
                color="from-emerald-500 to-teal-600"
              />
              <ProcessStep
                number="4"
                title="Test, Preview & Deploy"
                description="Your application is automatically tested, optimized, and made available for live preview. Download the complete codebase or deploy directly to production."
                color="from-orange-500 to-red-600"
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            {/* UPDATED: Added drop-shadow for visibility */}
            <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(72,187,255,0.4)]">
              Why Choose CiteWise-Agentic?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">10x Faster Development</h3>
                    <p className="text-gray-200 text-lg">What takes weeks now takes minutes. Focus on strategy while AI handles implementation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Zero Setup Required</h3>
                    <p className="text-gray-200 text-lg">No development environment setup, no dependency management, no configuration headaches.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-red-400 flex-shrink-0 mt-1"></div>
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
                <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-3xl p-8 border border-cyan-400/20">
                  <div className="text-center">
                    <div className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
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
            {/* UPDATED: Added drop-shadow for visibility */}
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(72,187,255,0.4)]">
              Ready to Experience the Future?
            </h2>
            {/* UPDATED: Increased text brightness */}
            <p className="text-2xl text-gray-200 mb-12 leading-relaxed">
              Join thousands of developers who are already building with CiteWise-Agentic AI. 
              Transform your ideas into reality in seconds, not weeks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button onClick={navigate} className="px-16 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full text-2xl font-semibold hover:from-cyan-400 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25">
                Start Building Now
              </button>
              <button className="px-16 py-5 bg-white/10 backdrop-blur-lg rounded-full text-2xl font-semibold border border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-300">
                Learn More
              </button>
            </div>
            
            {/* UPDATED: Increased text brightness */}
            <p className="text-gray-300 mt-8 text-lg">
              No signup required • Start coding immediately • 100% Free
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              CiteWise-AGENTIC
            </div>
            {/* UPDATED: Increased text brightness */}
            <p className="text-gray-300 mb-8">The future of software development is here</p>
            <div className="flex justify-center space-x-8">
              {/* UPDATED: Increased text brightness */}
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