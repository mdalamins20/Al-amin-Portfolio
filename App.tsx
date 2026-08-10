
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useThemeStore } from './components/stores/useThemeStore';
import { useAuthStore } from './components/stores/useAuthStore';
import { useProfileStore } from './components/stores/useProfileStore';
import { useDataStore } from './components/stores/useDataStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { ContentSections } from './components/ContentSections';
import { Expertise } from './components/Expertise';
import { ExperienceTimeline } from './components/ExperienceTimeline';
import { Services } from './components/Services';
import { ProjectGrid } from './components/ProjectGrid';
import { RecentBlogs } from './components/RecentBlogs';
import { Testimonials } from './components/Testimonials';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { GithubStats } from './components/GithubStats';
import { NotFound } from './components/NotFound';
import { VisitorLog } from './components/VisitorLog';

// Lazy loaded heavy public routes
const ProjectDetails = lazy(() => import('./components/ProjectDetails').then(m => ({ default: m.ProjectDetails })));
const BlogPage = lazy(() => import('./components/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostDetail = lazy(() => import('./components/BlogPostDetail').then(m => ({ default: m.BlogPostDetail })));
import { AnimatePresence } from 'framer-motion';
import { DynamicSEO } from './components/DynamicSEO';
import { CustomCursor } from './components/CustomCursor';
import { PageTransition } from './components/PageTransition';
import { WhatsAppButton } from './components/WhatsAppButton';
import { LoadingScreen } from './components/LoadingScreen';

// Lazy loaded admin components
const AdminLogin = lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminLayout = lazy(() => import('./components/AdminDashboard/AdminLayout').then(m => ({ default: m.AdminLayout })));
const ManageProjects = lazy(() => import('./components/AdminDashboard/ManageProjects').then(m => ({ default: m.ManageProjects })));
const ManageExperience = lazy(() => import('./components/AdminDashboard/ManageExperience').then(m => ({ default: m.ManageExperience })));
const ManageSkills = lazy(() => import('./components/AdminDashboard/ManageSkills').then(m => ({ default: m.ManageSkills })));
const ManageBlogs = lazy(() => import('./components/AdminDashboard/ManageBlogs').then(m => ({ default: m.ManageBlogs })));
const ManageReviews = lazy(() => import('./components/AdminDashboard/ManageReviews').then(m => ({ default: m.ManageReviews })));
const ManageProfile = lazy(() => import('./components/AdminDashboard/ManageProfile').then(m => ({ default: m.ManageProfile })));
const DashboardOverview = lazy(() => import('./components/AdminDashboard/DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const VisitorAnalytics = lazy(() => import('./components/AdminDashboard/VisitorAnalytics').then(m => ({ default: m.VisitorAnalytics })));

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
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <VisitorLog />
      <Routes location={location} key={location.pathname.startsWith('/admin-dashboard') ? 'admin' : location.pathname}>
        {/* Public Portfolio */}
        <Route path="/" element={<MainPortfolio />} />
        <Route path="/project/:id" element={
          <Suspense fallback={<LoadingScreen />}>
            <ProjectDetails />
          </Suspense>
        } />
        <Route path="/blog" element={
          <Suspense fallback={<LoadingScreen />}>
            <BlogPage />
          </Suspense>
        } />
        <Route path="/blog/:id" element={
          <Suspense fallback={<LoadingScreen />}>
            <BlogPostDetail />
          </Suspense>
        } />
        
        {/* Admin Auth */}
        <Route path="/admin" element={
          <Suspense fallback={<LoadingScreen />}>
            <AdminLogin />
          </Suspense>
        } />
        
        {/* Protected Admin Dashboard */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div></div>}>
              <DashboardOverview />
            </Suspense>
          } />
          
          <Route path="projects" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div></div>}>
              <ManageProjects />
            </Suspense>
          } />
          
          <Route path="experience" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div></div>}>
              <ManageExperience />
            </Suspense>
          } />
          
          <Route path="skills" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div></div>}>
              <ManageSkills />
            </Suspense>
          } />
          
          <Route path="blogs" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div></div>}>
              <ManageBlogs />
            </Suspense>
          } />
          
          <Route path="reviews" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div></div>}>
              <ManageReviews />
            </Suspense>
          } />

          <Route path="profile" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div></div>}>
              <ManageProfile />
            </Suspense>
          } />
          
          <Route path="analytics" element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div></div>}>
              <VisitorAnalytics />
            </Suspense>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function MainPortfolio() {
  return (
    <Layout onViewCV={() => {}}>
      <Hero />
      <GithubStats />
      <ContentSections />
      <Expertise />
      <ExperienceTimeline />
      <Services />
      <ProjectGrid />
      <RecentBlogs />
      <Testimonials />
      <FAQSection />
      <ContactSection />
    </Layout>
  );
}

function App() {
  useEffect(() => {
    useThemeStore.getState().init();
    useAuthStore.getState().init();
    useProfileStore.getState().init();
    useDataStore.getState().init();
  }, []);

  return (
    <Router>
      <CustomCursor />
      <WhatsAppButton />
      <DynamicSEO />
      <ScrollAndAnimateRoutes />
    </Router>
  );
}

export default App;
