# RMS - Modern Reappear Management System

A modern, AI-powered study assistant built with React and Tailwind CSS to help students manage their reappear exams and access comprehensive study resources.

## 🚀 Features

### Core Features
- **AI-Powered PDF Summarizer**: Upload PDF notes and get intelligent summaries using advanced AI technology
- **Auto Note Collection**: Automatically collect and organize study materials from various sources
- **Comprehensive Subject Management**: Browse and manage subjects with detailed study resources
- **Smart Test Generator**: Generate personalized practice tests (Coming Soon)
- **Modern Responsive Design**: Beautiful, mobile-friendly interface with dark/light mode support

### Technical Features
- **React 18** with modern hooks and functional components
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **React Router** for client-side routing
- **React Helmet** for SEO optimization
- **React Dropzone** for file uploads
- **React Hot Toast** for notifications
- **Lucide React** for beautiful icons

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone https://github.com/yourusername/rms-react.git

# Navigate to project directory
cd rms-react

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:3000`

### Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.jsx      # Navigation component
├── context/            # React context providers
│   └── ThemeContext.jsx # Dark/light theme context
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Subjects.jsx    # Subjects listing
│   ├── AISummarizer.jsx # AI PDF summarizer
│   ├── TestGenerator.jsx # Test generator (coming soon)
│   ├── Resources.jsx   # Study resources
│   ├── Contact.jsx     # Contact form
│   └── Privacy.jsx     # Privacy policy
├── App.jsx             # Main app component
├── index.js            # App entry point
└── index.css           # Global styles with Tailwind
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (`#3b82f6` to `#1d4ed8`)
- **Secondary**: Gray scale for text and backgrounds
- **Accent**: Various gradients for different features

### Components
- **Cards**: Consistent card design with hover effects
- **Buttons**: Primary and secondary button styles
- **Forms**: Modern form inputs with focus states
- **Animations**: Smooth transitions and micro-interactions

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS with custom configuration in `tailwind.config.js`:
- Custom color palette
- Extended animations
- Responsive breakpoints
- Dark mode support

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=your_api_url_here
REACT_APP_AI_SERVICE_KEY=your_ai_service_key
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Adapted layout with touch-friendly interactions
- **Mobile**: Mobile-first design with optimized navigation

## 🌙 Dark Mode

The application supports automatic dark mode detection and manual toggle:
- System preference detection
- Manual toggle in navigation
- Persistent user preference
- Smooth transitions between modes

## 🔍 SEO Optimization

- **Meta Tags**: Comprehensive meta tags for all pages
- **Structured Data**: JSON-LD structured data for search engines
- **Open Graph**: Social media sharing optimization
- **Sitemap**: Auto-generated sitemap for better indexing

## 🚀 Performance

- **Code Splitting**: Automatic code splitting with React Router
- **Lazy Loading**: Images and components loaded on demand
- **Optimized Assets**: Compressed images and optimized fonts
- **Caching**: Efficient caching strategies for better performance

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow React best practices and hooks
- Use Tailwind CSS for styling
- Add proper TypeScript types (if using TS)
- Write meaningful commit messages
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Lucide** for beautiful icons
- **LPU Community** for support and feedback

## 📞 Support

- **Email**: support@rmslpu.xyz
- **GitHub Issues**: [Report a bug](https://github.com/yourusername/rms-react/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/rms-react/wiki)

## 🔮 Roadmap

### Upcoming Features
- [ ] **AI Test Generator**: Personalized practice tests
- [ ] **Real-time Collaboration**: Study groups and discussions
- [ ] **Mobile App**: Native mobile application
- [ ] **Advanced Analytics**: Detailed progress tracking
- [ ] **Integration APIs**: Connect with other educational platforms

### Version History
- **v2.0.0**: Complete React rewrite with modern design
- **v1.0.0**: Original HTML/CSS/JS version

---

**Made with ❤️ for students by students**

