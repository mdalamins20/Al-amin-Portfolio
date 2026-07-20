
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider } from './components/AuthContext';
import { ProfileProvider } from './components/ProfileContext';
import { DataProvider } from './components/DataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { ContentSections } from './components/ContentSections';
import { Expertise } from './components/Expertise';
import { ExperienceTimeline } from './components/ExperienceTimeline';
import { Services } from './components/Services';
import { ProjectGrid } from './components/ProjectGrid';
import { Testimonials } from './components/Testimonials';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { GithubStats } from './components/GithubStats';
import { AdminLogin } from './components/AdminLogin';
import { AdminLayout } from './components/AdminDashboard/AdminLayout';
import { ManageProjects } from './components/AdminDashboard/ManageProjects';
import { ManageExperience } from './components/AdminDashboard/ManageExperience';
import { ManageSkills } from './components/AdminDashboard/ManageSkills';
import { ManageBlogs } from './components/AdminDashboard/ManageBlogs';
import { ManageReviews } from './components/AdminDashboard/ManageReviews';
import { ManageProfile } from './components/AdminDashboard/ManageProfile';
import { NotFound } from './components/NotFound';
import { ProjectDetails } from './components/ProjectDetails';
import { DashboardOverview } from './components/AdminDashboard/DashboardOverview';
import { BlogPage } from './components/BlogPage';
import { BlogPostDetail } from './components/BlogPostDetail';
import { VisitorLog } from './components/VisitorLog';
import { AnimatePresence } from 'framer-motion';
import { CVPage } from './components/CVPage';
import { DynamicSEO } from './components/DynamicSEO';
import { CustomCursor } from './components/CustomCursor';
import { PageTransition } from './components/PageTransition';
import { WhatsAppButton } from './components/WhatsAppButton';

function ScrollAndAnimateRoutes() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      // Because AnimatePresence mode="wait" delays the mount of the new route,
      // we need to wait until the old route exits and the new one renders.
      const scrollToElement = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      };
      
      // Try after a short delay (if already on the page)
      setTimeout(scrollToElement, 100);
      // Try again after route transition is definitely done
      setTimeout(scrollToElement, 600);
    } else {
      // Defer scrolling to individual components so the exit animation doesn't jump to top
    }
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <VisitorLog />
      <Routes location={location} key={location.pathname}>
        {/* Public Portfolio */}
        <Route path="/" element={<PageTransition><MainPortfolio /></PageTransition>} />
        <Route path="/project/:id" element={<PageTransition><ProjectDetails /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><BlogPage /></PageTransition>} />
        <Route path="/blog/:id" element={<PageTransition><BlogPostDetail /></PageTransition>} />
        
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
        
        <Route path="/admin-dashboard/experience" element={
          <ProtectedRoute>
            <AdminLayout><ManageExperience /></AdminLayout>
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
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function MainPortfolio() {
  const [showCV, setShowCV] = useState(false);

  return (
    <Layout onViewCV={() => setShowCV(true)}>
      <Hero onViewCV={() => setShowCV(true)} />
      <GithubStats />
      <ContentSections />
      <Expertise />
      <ExperienceTimeline />
      <Services />
      <ProjectGrid />
      <Testimonials />
      <ContactSection />

      <AnimatePresence>
        {showCV && <CVPage onClose={() => setShowCV(false)} />}
      </AnimatePresence>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <DataProvider>
            <Router>
              <CustomCursor />
              <WhatsAppButton />
              <DynamicSEO />
              <ScrollAndAnimateRoutes />
            </Router>
          </DataProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
