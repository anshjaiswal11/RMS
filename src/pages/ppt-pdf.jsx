import React, { useState, useCallback } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
    FileText,
    Upload,
    CheckCircle,
    AlertCircle,
    Loader2,
    Download,
    FileType,
    ArrowRight
} from 'lucide-react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import toast, { Toaster } from 'react-hot-toast';

const PPTToPDF = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [conversionStats, setConversionStats] = useState(null);

    // --- DROPZONE HANDLER ---
    const onDrop = useCallback((acceptedFiles) => {
        const uploadedFile = acceptedFiles[0];
        if (uploadedFile && (
            uploadedFile.name.endsWith('.pptx') ||
            uploadedFile.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )) {
            setFile(uploadedFile);
            setPdfBlob(null);
            setConversionStats(null);
            setProgress(0);
            toast.success('PowerPoint file uploaded!');
        } else {
            toast.error('Please upload a valid .pptx file.');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
        },
        multiple: false
    });

    // --- CONVERSION LOGIC ---
    const convertToPDF = async () => {
        if (!file) return;

        setIsProcessing(true);
        setProgress(10);
        const zip = new JSZip();

        try {
            // 1. Load the PPTX (ZIP) file
            const zipContent = await zip.loadAsync(file);
            setProgress(30);

            // 2. Find and sort slide files
            // Slides are typically at ppt/slides/slide1.xml, slide2.xml...
            const slideFiles = Object.keys(zipContent.files).filter(fileName =>
                fileName.startsWith('ppt/slides/slide') && fileName.endsWith('.xml')
            );

            // Sort by slide number: slide1, slide2, slide10...
            slideFiles.sort((a, b) => {
                const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
                const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
                return numA - numB;
            });

            if (slideFiles.length === 0) {
                throw new Error("No slides found in the presentation.");
            }

            setProgress(40);

            // 3. Initialize PDF
            // Default to Landscape for PPTs usually? Or A4? Let's assume A4 Landscape for now for better fit
            const doc = new jsPDF({
                orientation: 'landscape',
                format: 'a4'
            });

            const parser = new DOMParser();
            let extractedTextCount = 0;

            // 4. Process each slide
            for (let i = 0; i < slideFiles.length; i++) {
                const fileName = slideFiles[i];

                // Add page for subsequent slides (first page is auto-created)
                if (i > 0) doc.addPage();

                // Parse XML
                const slideXmlStr = await zipContent.file(fileName).async('string');
                const xmlDoc = parser.parseFromString(slideXmlStr, 'text/xml');

                // Extract Title and Text
                // Powerpoint text is typically in <a:t> tags within <a:p> (paragraphs)
                const textElements = xmlDoc.getElementsByTagName('a:t');

                // Helper to get text content clearly
                let slideTextContent = [];
                for (let j = 0; j < textElements.length; j++) {
                    slideTextContent.push(textElements[j].textContent);
                }

                // Layout on PDF
                doc.setFontSize(16);
                doc.text(`Slide ${i + 1}`, 10, 15);

                doc.setFontSize(12);
                let yPos = 30;
                const margin = 10;
                const pageHeight = doc.internal.pageSize.height;
                const pageWidth = doc.internal.pageSize.width;

                // Draw slide border
                doc.setDrawColor(200);
                doc.rect(margin, 20, pageWidth - (margin * 2), pageHeight - 30);

                // Simple text wrapping and placement
                doc.setFont("helvetica", "normal");

                for (const text of slideTextContent) {
                    // Very basic layout: split text into lines
                    const lines = doc.splitTextToSize(text, pageWidth - (margin * 2) - 10);

                    // Check page bounds
                    if (yPos + (lines.length * 7) > pageHeight - 15) {
                        doc.addPage();
                        yPos = 30;
                        doc.setDrawColor(200);
                        doc.rect(margin, 20, pageWidth - (margin * 2), pageHeight - 30);
                    }

                    doc.text(lines, margin + 5, yPos);
                    yPos += (lines.length * 7) + 2; // Line height + spacing
                    extractedTextCount++;
                }

                // Update progress
                const currentProgress = 40 + Math.round(((i + 1) / slideFiles.length) * 50);
                setProgress(currentProgress);
            }

            // 5. Save/Export
            const pdfDataUri = doc.output('blob');
            setPdfBlob(pdfDataUri);
            setConversionStats({
                slides: slideFiles.length,
                size: (pdfDataUri.size / 1024 / 1024).toFixed(2)
            });
            setProgress(100);
            toast.success("Conversion completed successfully!");

        } catch (error) {
            console.error("Conversion failed:", error);
            toast.error(`Conversion failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (pdfBlob) {
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${file.name.replace('.pptx', '')}_converted.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }
    };

    const reset = () => {
        setFile(null);
        setPdfBlob(null);
        setConversionStats(null);
        setProgress(0);
    };

    return (
        <HelmetProvider>
            <Helmet>
                <title>PPT to PDF Converter | RMS</title>
            </Helmet>
            <Toaster position="top-center" />

            <div className="pt-20 min-h-screen bg-secondary-50 dark:bg-secondary-900 font-sans">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
                            <FileType className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-secondary-900 dark:text-white mb-4">
                            PPT to PDF Converter
                        </h1>
                        <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
                            Convert your PowerPoint presentations (.pptx) to PDF documents instantly in your browser. No server uploads, secure and fast.
                        </p>
                    </motion.div>

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card p-8 bg-white dark:bg-secondary-800 shadow-xl rounded-2xl border border-secondary-200 dark:border-secondary-700"
                    >

                        {/* Upload Area */}
                        {!file && (
                            <div
                                {...getRootProps()}
                                className={`
                  border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                  ${isDragActive
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 scale-[1.02]'
                                        : 'border-secondary-300 dark:border-secondary-600 hover:border-red-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/50'
                                    }
                `}
                            >
                                <input {...getInputProps()} />
                                <Upload className="w-16 h-16 mx-auto text-secondary-400 mb-6" />
                                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
                                    Drop your PPTX file here
                                </h3>
                                <p className="text-secondary-500 dark:text-secondary-400">
                                    or click to browse from your computer
                                </p>
                                <div className="mt-8 inline-flex items-center space-x-2 text-sm text-secondary-400 bg-secondary-100 dark:bg-secondary-700 px-4 py-2 rounded-full">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Supports .pptx files up to 50MB</span>
                                </div>
                            </div>
                        )}

                        {/* File Selected / Processing State */}
                        {file && !pdfBlob && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-10 h-10 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                                    {file.name}
                                </h3>
                                <p className="text-secondary-500 dark:text-secondary-400 mb-8">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>

                                {isProcessing ? (
                                    <div className="max-w-md mx-auto">
                                        <div className="flex justify-between items-center mb-2 px-1">
                                            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Converting...</span>
                                            <span className="text-sm font-medium text-red-600 dark:text-red-400">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2.5 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-red-600 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            onClick={convertToPDF}
                                            className="btn-primary bg-red-600 hover:bg-red-700 border-none text-white px-8 py-3 rounded-xl flex items-center space-x-2 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all font-semibold"
                                        >
                                            <Loader2 className="w-5 h-5 animate-spin hidden" /> {/* Hidden unless needed, but logic uses isProcessing */}
                                            <span>Convert to PDF</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={reset}
                                            className="px-8 py-3 rounded-xl text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Success State */}
                        {pdfBlob && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                                    Ready to Download!
                                </h3>
                                <p className="text-secondary-500 dark:text-secondary-400 mb-8 max-w-md mx-auto">
                                    Your presentation has been successfully converted.
                                    <br />
                                    <span className="text-sm mt-2 block opacity-75">
                                        Converted {conversionStats?.slides} slides • Size: {conversionStats?.size} MB
                                    </span>
                                </p>

                                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                    <button
                                        onClick={handleDownload}
                                        className="btn-primary bg-green-600 hover:bg-green-700 border-none text-white px-8 py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-green-600/20 hover:shadow-green-600/40 transition-all font-bold"
                                    >
                                        <Download className="w-5 h-5" />
                                        <span>Download PDF</span>
                                    </button>
                                    <button
                                        onClick={reset}
                                        className="px-8 py-3 rounded-xl text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors font-medium"
                                    >
                                        Convert Another
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </motion.div>

                    <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
                        <div className="p-6">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">100% Free</h4>
                            <p className="text-sm text-secondary-500">No hidden fees or subscriptions. Unlimited conversions.</p>
                        </div>
                        <div className="p-6">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">Private & Secure</h4>
                            <p className="text-sm text-secondary-500">Files process locally on your device. Nothing is uploaded to a server.</p>
                        </div>
                        <div className="p-6">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">Fast Conversion</h4>
                            <p className="text-sm text-secondary-500">Optimized algorithms ensure your PDF is ready in seconds.</p>
                        </div>
                    </div>

                </div>
            </div>
        </HelmetProvider>
    );
};

export default PPTToPDF;
