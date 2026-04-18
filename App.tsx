
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider } from './components/AuthContext';
import { ProfileProvider } from './components/ProfileContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { ContentSections } from './components/ContentSections';
import { Expertise } from './components/Expertise';
import { Services } from './components/Services';
import { ProjectGrid } from './components/ProjectGrid';
import { Testimonials } from './components/Testimonials';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { HirePopup } from './components/HirePopup';
import { AdminLogin } from './components/AdminLogin';
import { AdminLayout } from './components/AdminDashboard/AdminLayout';
import { ManageProjects } from './components/AdminDashboard/ManageProjects';
import { ManageSkills } from './components/AdminDashboard/ManageSkills';
import { ManageBlogs } from './components/AdminDashboard/ManageBlogs';
import { ManageReviews } from './components/AdminDashboard/ManageReviews';
import { ManageProfile } from './components/AdminDashboard/ManageProfile';
import { DashboardOverview } from './components/AdminDashboard/DashboardOverview';
import { BlogPage } from './components/BlogPage';
import { BlogPostDetail } from './components/BlogPostDetail';
import { AnimatePresence } from 'framer-motion';

import { DynamicSEO } from './components/DynamicSEO';

function ScrollAndAnimateRoutes() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Portfolio */}
        <Route path="/" element={<MainPortfolio />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPostDetail />} />
        
        {/* Admin Auth */}
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* Protected Admin Dashboard */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute>
            <AdminLayout>
              <DashboardOverview />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin-dashboard/projects" element={
          <ProtectedRoute>
            <AdminLayout><ManageProjects /></AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin-dashboard/skills" element={
          <ProtectedRoute>
            <AdminLayout><ManageSkills /></AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin-dashboard/blogs" element={
          <ProtectedRoute>
            <AdminLayout><ManageBlogs /></AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin-dashboard/reviews" element={
          <ProtectedRoute>
            <AdminLayout><ManageReviews /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin-dashboard/profile" element={
          <ProtectedRoute>
            <AdminLayout><ManageProfile /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function MainPortfolio() {
  const [showCV, setShowCV] = useState(false);
  const [isHirePopupVisible, setIsHirePopupVisible] = useState(false);
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(() => {
    return localStorage.getItem('hire-popup-dismissed') === 'true';
  });

  useEffect(() => {
    if (!isPermanentlyDismissed) {
      const timer = setTimeout(() => {
        setIsHirePopupVisible(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isPermanentlyDismissed]);

  const handleClosePopup = () => setIsHirePopupVisible(false);
  const handlePermanentDismiss = () => {
    setIsHirePopupVisible(false);
    setIsPermanentlyDismissed(true);
    localStorage.setItem('hire-popup-dismissed', 'true');
  };

  return (
    <Layout onViewCV={() => setShowCV(true)}>
      <DynamicSEO />
      <Hero />
      <ContentSections />
      <Expertise />
      <Services />
      <ProjectGrid />
      <Testimonials />
      <ContactSection />
      <Footer onViewCV={() => setShowCV(true)} />
      
      <HirePopup 
        isVisible={isHirePopupVisible} 
        onClose={handleClosePopup}
        onCancel={handlePermanentDismiss}
      />
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <Router>
            <ScrollAndAnimateRoutes />
          </Router>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
