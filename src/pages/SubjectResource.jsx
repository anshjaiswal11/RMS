import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { BookOpen, Download, ArrowLeft } from 'lucide-react';

const API_URL = 'https://raw.githubusercontent.com/CODINGWITHU/RMSAPI/main/RMS.JSON';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SubjectResource = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [subjectInput, setSubjectInput] = useState(query.get('subject') || '');
  const [subjectData, setSubjectData] = useState(null);
  const [chapter, setChapter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chapterList, setChapterList] = useState([]);

  useEffect(() => {
    if (subjectInput) {
      fetchSubjectData(subjectInput);
    } else {
      setSubjectData(null);
      setChapter('');
      setChapterList([]);
    }
    // eslint-disable-next-line
  }, [subjectInput]);

  const fetchSubjectData = async (subjectName) => {
    setLoading(true);
    setError('');
    setSubjectData(null);
    setChapter('');
    setChapterList([]);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      // Try to find by full subject name (case-insensitive)
      const key = Object.keys(data).find(
        k => k.toLowerCase() === subjectName.toLowerCase()
      );
      if (!key) {
        setError('No data found for this subject. Please check the name.');
        setLoading(false);
        return;
      }
      setSubjectData(data[key]);
      if (data[key].Notes && data[key].Notes.chapters) {
        setChapterList(Object.keys(data[key].Notes.chapters));
      }
    } catch (e) {
      setError('Failed to fetch data. Please try again.');
    }
    setLoading(false);
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
        <title>Subject Resource | RMS</title>
        <meta name="description" content="View syllabus and chapter-wise notes for your subject." />
      </Helmet>
      <div className="pt-16 min-h-screen bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            className="mb-6 flex items-center space-x-2 text-secondary-700 dark:text-secondary-300 hover:text-primary-600"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="card"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
                Subject Resource Viewer
              </h1>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                fetchSubjectData(subjectInput);
              }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Enter Subject Name (e.g., CHE110 ENVIRONMENTAL STUDIES ENGINEERING)
              </label>
              <input
                type="text"
                className="input-field"
                value={subjectInput}
                onChange={e => setSubjectInput(e.target.value)}
                placeholder="Type subject name..."
                required
              />
              <button type="submit" className="btn-primary mt-4">View Syllabus & Notes</button>
            </form>
            {loading && <div className="text-center py-8">Loading...</div>}
            {error && <div className="text-center text-red-500 py-8">{error}</div>}
            {subjectData && (
              <>
                {/* Syllabus */}
                {subjectData.Syllabus && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2 text-secondary-900 dark:text-white">Syllabus</h3>
                    <div className="w-full rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700 mx-auto" style={{ minHeight: '70vh', height: '80vh', maxHeight: '90vh', maxWidth: '100vw' }}>
                      <iframe
                        src={getDriveEmbedUrl(subjectData.Syllabus)}
                        title="Syllabus Preview"
                        width="100%"
                        height="100%"
                        style={{ minHeight: '70vh', height: '80vh', maxHeight: '90vh', width: '100%' }}
                        allow="autoplay"
                        className="w-full"
                      ></iframe>
                    </div>
                    <a
                      href={getDriveDownloadUrl(subjectData.Syllabus)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center space-x-2 mt-4"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Syllabus</span>
                    </a>
                  </div>
                )}
                {/* Chapter selection */}
                {chapterList.length > 0 && (
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Select Chapter to View Notes
                    </label>
                    <select
                      className="input-field"
                      value={chapter}
                      onChange={e => setChapter(e.target.value)}
                    >
                      <option value="">-- Select Chapter --</option>
                      {chapterList.map(ch => (
                        <option key={ch} value={ch}>Chapter {ch}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Chapter Notes */}
                {chapter && subjectData.Notes && subjectData.Notes.chapters && subjectData.Notes.chapters[chapter] && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2 text-secondary-900 dark:text-white">Notes for Chapter {chapter}</h3>
                    <div className="w-full rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700 mx-auto" style={{ minHeight: '70vh', height: '80vh', maxHeight: '90vh', maxWidth: '100vw' }}>
                      <iframe
                        src={getDriveEmbedUrl(subjectData.Notes.chapters[chapter])}
                        title={`Chapter ${chapter} Preview`}
                        width="100%"
                        height="100%"
                        style={{ minHeight: '70vh', height: '80vh', maxHeight: '90vh', width: '100%' }}
                        allow="autoplay"
                        className="w-full"
                      ></iframe>
                    </div>
                    <a
                      href={getDriveDownloadUrl(subjectData.Notes.chapters[chapter])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary inline-flex items-center space-x-2 mt-4"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Notes</span>
                    </a>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SubjectResource; 