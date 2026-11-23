import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export default function ResumeUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { setProfile, addNotification } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Extracted preview & editing state
  const [extractedData, setExtractedData] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedSkills, setEditedSkills] = useState('');
  const [editedEducation, setEditedEducation] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file) => {
    setErrorMsg('');
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF file. Other file formats are not supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 5MB limit. Please choose a smaller PDF.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setErrorMsg('');
    setUploadProgress(25);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 150);

      const parsedProfile = await api.uploadResume(selectedFile);
      clearInterval(interval);
      setUploadProgress(100);

      // Populate preview & editable inputs
      setExtractedData(parsedProfile);
      setEditedName(parsedProfile.name || '');
      setEditedEmail(parsedProfile.email || '');
      setEditedPhone(parsedProfile.phone || '');
      setEditedSkills((parsedProfile.skills || []).join(', '));
      setEditedEducation((parsedProfile.education || []).join('\n'));

      addNotification('success', 'Resume parsed successfully! Review the extracted details.');
    } catch (err) {
      console.error('Resume upload error:', err);
      setErrorMsg(err.message || 'Failed to parse resume. Ensure the PDF contains selectable text.');
      addNotification('error', 'Resume upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  // Helper to generate a realistic sample PDF and parse it directly
  const handleLoadSampleResume = async () => {
    setUploading(true);
    setErrorMsg('');
    setUploadProgress(40);

    try {
      // Create a standard sample text-based PDF using browser PDF / minimal blob
      // We can create a simple PDF byte stream that complies with backend parser
      // The backend expects %PDF- header and PyMuPDF text stream
      // Let's create a minimal valid text PDF using an ArrayBuffer or call backend helper
      const pdfBytes = createSamplePdfBytes(
        "Alex Example",
        "alex.example@example.com",
        "+91 98765 43210",
        "B.Tech in Computer Science\nExpected Graduation: 2027\nCGPA: 8.9/10",
        "Python, FastAPI, SQL, Git, React, TypeScript, Docker"
      );

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const sampleFile = new File([blob], 'Alex_Example_Resume.pdf', { type: 'application/pdf' });
      
      setSelectedFile(sampleFile);
      setUploadProgress(70);

      const parsedProfile = await api.uploadResume(sampleFile);
      setUploadProgress(100);

      setExtractedData(parsedProfile);
      setEditedName(parsedProfile.name || 'Alex Example');
      setEditedEmail(parsedProfile.email || 'alex.example@example.com');
      setEditedPhone(parsedProfile.phone || '+91 98765 43210');
      setEditedSkills((parsedProfile.skills || []).join(', '));
      setEditedEducation((parsedProfile.education || []).join('\n'));

      addNotification('success', 'Sample student resume loaded and parsed!');
    } catch (err) {
      console.error('Sample resume error:', err);
      setErrorMsg(err.message || 'Could not load sample resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAndConfirm = () => {
    if (!extractedData) return;

    // Build the final reviewed profile
    const finalProfile = {
      ...extractedData,
      name: editedName.trim() || extractedData.name,
      email: editedEmail.trim() || extractedData.email,
      phone: editedPhone.trim() || extractedData.phone,
      skills: editedSkills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      education: editedEducation
        .split('\n')
        .map(e => e.trim())
        .filter(Boolean),
    };

    setProfile(finalProfile);
    addNotification('success', `Welcome, ${finalProfile.name || 'Student'}! Profile saved.`);
    if (onUploadSuccess) onUploadSuccess(finalProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF6F0] rounded-xl border border-ivory-300 shadow-lifted max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-ivory-300 flex items-center justify-between bg-ivory-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-800 text-ivory-100 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-forest-950">
                {extractedData ? 'Review Extracted Profile' : 'Upload Your Resume'}
              </h3>
              <p className="text-xs text-charcoal-500">
                {extractedData 
                  ? 'Verify extracted details before matching opportunities' 
                  : 'PDF text resumes (max 5MB, up to 25 pages)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!extractedData ? (
            /* Upload step */
            <div className="space-y-5">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-forest-600 bg-forest-50/50'
                    : selectedFile
                    ? 'border-forest-400 bg-ivory-100'
                    : 'border-[#D9CFC4] hover:border-forest-400 bg-[#FCFBF9]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto rounded-full bg-forest-100 text-forest-800 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>

                {selectedFile ? (
                  <div>
                    <p className="text-sm font-semibold text-forest-900">{selectedFile.name}</p>
                    <p className="text-xs text-charcoal-500 mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready to extract
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-charcoal-800">
                      Drag & drop your PDF resume here, or <span className="text-terracotta-600 font-semibold underline">browse files</span>
                    </p>
                    <p className="text-xs text-charcoal-500 mt-1">
                      Works best with standard text-based resumes
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-forest-800">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Parsing resume with deterministic extractor...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-ivory-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-forest-700 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FBEBEA] border border-[#F4CCC8] text-[#9A261C] text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Extraction failed:</span> {errorMsg}
                  </div>
                </div>
              )}

              {/* Quick sample prompt for testers */}
              <div className="p-3.5 rounded-lg bg-ivory-200/80 border border-ivory-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-terracotta-600" />
                  <span className="text-xs text-charcoal-700 font-medium">
                    Testing the prototype? Load a pre-configured student resume in 1 click.
                  </span>
                </div>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleLoadSampleResume}
                  className="text-xs font-semibold text-terracotta-700 hover:text-terracotta-800 underline shrink-0"
                >
                  Load Demo PDF
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-ivory-300 text-charcoal-700 text-sm font-medium hover:bg-ivory-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFile || uploading}
                  onClick={handleUpload}
                  className="flex items-center gap-2 px-5 py-2 rounded-md bg-forest-800 hover:bg-forest-900 disabled:opacity-50 disabled:cursor-not-allowed text-ivory-50 text-sm font-medium transition-colors shadow-sm"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Parsing PDF...</span>
                    </>
                  ) : (
                    <>
                      <span>Extract Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Review & Edit step */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="e.g. Alex Example"
                    className="w-full px-3 py-2 rounded-md border border-ivory-300 bg-white text-sm text-charcoal-900 focus:border-terracotta-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    placeholder="e.g. alex@example.com"
                    className="w-full px-3 py-2 rounded-md border border-ivory-300 bg-white text-sm text-charcoal-900 focus:border-terracotta-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 rounded-md border border-ivory-300 bg-white text-sm text-charcoal-900 focus:border-terracotta-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Recognized Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={editedSkills}
                  onChange={(e) => setEditedSkills(e.target.value)}
                  placeholder="Python, React, SQL, Git..."
                  className="w-full px-3 py-2 rounded-md border border-ivory-300 bg-white text-sm text-charcoal-900 focus:border-terracotta-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {editedSkills.split(',').filter(s => s.trim()).map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                  Extracted Education Records (one per line)
                </label>
                <textarea
                  rows={3}
                  value={editedEducation}
                  onChange={(e) => setEditedEducation(e.target.value)}
                  placeholder="B.Tech in Computer Science&#10;Expected Graduation: 2027"
                  className="w-full px-3 py-2 rounded-md border border-ivory-300 bg-white text-sm text-charcoal-900 focus:border-terracotta-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-ivory-300">
                <button
                  type="button"
                  onClick={() => setExtractedData(null)}
                  className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 underline"
                >
                  Upload different file
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-md border border-ivory-300 text-charcoal-700 text-sm font-medium hover:bg-ivory-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAndConfirm}
                    className="flex items-center gap-2 px-5 py-2 rounded-md bg-forest-800 hover:bg-forest-900 text-ivory-50 text-sm font-medium transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-terracotta-300" />
                    <span>Save & Proceed</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/**
 * Creates a minimal valid text PDF binary containing candidate details.
 * The output starts with %PDF- and contains valid font/stream definitions so PyMuPDF can extract text.
 */
function createSamplePdfBytes(name, email, phone, education, skills) {
  const contentText = `${name}\n${email}\n${phone}\n\nEducation\n${education}\n\nTechnical Skills\n${skills}`;
  
  // Minimal valid PDF structure with a standard Type1 Helvetica font
  const escapedText = contentText
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .split('\n');

  let streamContent = 'BT\n/F1 12 Tf\n50 750 Td\n18 TL\n';
  for (const line of escapedText) {
    streamContent += `(${line}) '\n`;
  }
  streamContent += 'ET\n';

  const streamLength = streamContent.length;

  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000${(300 + streamLength).toString().padStart(3, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

  const buffer = new Uint8Array(pdfString.length);
  for (let i = 0; i < pdfString.length; i++) {
    buffer[i] = pdfString.charCodeAt(i) & 0xff;
  }
  return buffer;
}
