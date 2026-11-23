import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';
import ResumeUploadModal from './components/ResumeUploadModal';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import AssistantPage from './pages/AssistantPage';
import TrackerPage from './pages/TrackerPage';
import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { notifications, removeNotification } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-charcoal-900 font-sans">
      <Navbar onOpenUpload={() => setUploadModalOpen(true)} />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage onOpenUpload={() => setUploadModalOpen(true)} />} />
          <Route path="/dashboard" element={<DashboardPage onOpenUpload={() => setUploadModalOpen(true)} />} />
          <Route path="/opportunities" element={<OpportunitiesPage onOpenUpload={() => setUploadModalOpen(true)} />} />
          <Route path="/assistant" element={<AssistantPage onOpenUpload={() => setUploadModalOpen(true)} />} />
          <Route path="/tracker" element={<TrackerPage onOpenUpload={() => setUploadModalOpen(true)} />} />
          <Route path="/profile" element={<ProfilePage onOpenUpload={() => setUploadModalOpen(true)} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={removeNotification}
      />

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
