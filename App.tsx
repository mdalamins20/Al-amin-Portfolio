import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useThemeStore } from './components/stores/useThemeStore';
import { useAuthStore } from './components/stores/useAuthStore';
import { useProfileStore } from './components/stores/useProfileStore';
import { useDataStore } from './components/stores/useDataStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
// Lazy loaded heavy public routes
const GithubStats = lazy(() => import('./components/GithubStats').then(m => ({ default: m.GithubStats })));
const ContentSections = lazy(() => import('./components/ContentSections').then(m => ({ default: m.ContentSections })));
import { NotFound } from './components/NotFound';
const VisitorLog = lazy(() => import('./components/VisitorLog').then(m => ({ default: m.VisitorLog })));

// Lazy loaded heavy public routes
const BlogPage = lazy(() => import('./components/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostDetail = lazy(() => import('./components/BlogPostDetail').then(m => ({ default: m.BlogPostDetail })));
import { AnimatePresence } from 'framer-motion';
import { DynamicSEO } from './components/DynamicSEO';
import { CustomCursor } from './components/CustomCursor';
import { PageTransition } from './components/PageTransition';
import { WhatsAppButton } from './components/WhatsAppButton';
import { LoadingScreen } from './components/LoadingScreen';
import { PageLoader } from './components/PageLoader';
import { CustomDialog } from './components/CustomDialog';

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
const ActiveSessions = lazy(() => import('./components/AdminDashboard/ActiveSessions').then(m => ({ default: m.ActiveSessions })));
const ManageSubscribers = lazy(() => import('./components/AdminDashboard/ManageSubscribers').then(m => ({ default: m.ManageSubscribers })));
const ActivityLogs = lazy(() => import('./components/AdminDashboard/ActivityLogs').then(m => ({ default: m.ActivityLogs })));
const ManageSEO = lazy(() => import('./components/AdminDashboard/ManageSEO').then(m => ({ default: m.ManageSEO })));

function ScrollAndAnimateRoutes({ showVisitorLog }: { showVisitorLog?: boolean }) {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
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
      <CustomDialog />
      {showVisitorLog && (
        <Suspense fallback={null}>
          <VisitorLog />
        </Suspense>
      )}
      <Routes location={location} key={location.pathname.startsWith('/admin-dashboard') ? 'admin' : location.pathname}>
        {/* Public Portfolio */}
        <Route path="/" element={<MainPortfolio />} />
        <Route path="/blog" element={
          <Suspense fallback={<PageLoader />}>
            <BlogPage />
          </Suspense>
        } />
        <Route path="/blog/:id" element={
          <Suspense fallback={<PageLoader />}>
            <BlogPostDetail />
          </Suspense>
        } />

        {/* Admin Auth */}
        <Route path="/admin" element={
          <Suspense fallback={<PageLoader />}>
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
            <Suspense fallback={<PageLoader />}>
              <DashboardOverview />
            </Suspense>
          } />

          <Route path="projects" element={
            <Suspense fallback={<PageLoader />}>
              <ManageProjects />
            </Suspense>
          } />

          <Route path="experience" element={
            <Suspense fallback={<PageLoader />}>
              <ManageExperience />
            </Suspense>
          } />

          <Route path="skills" element={
            <Suspense fallback={<PageLoader />}>
              <ManageSkills />
            </Suspense>
          } />

          <Route path="blogs" element={
            <Suspense fallback={<PageLoader />}>
              <ManageBlogs />
            </Suspense>
          } />

          <Route path="reviews" element={
            <Suspense fallback={<PageLoader />}>
              <ManageReviews />
            </Suspense>
          } />

          <Route path="profile" element={
            <Suspense fallback={<PageLoader />}>
              <ManageProfile />
            </Suspense>
          } />

          <Route path="analytics" element={
            <Suspense fallback={<PageLoader />}>
              <VisitorAnalytics />
            </Suspense>
          } />

          <Route path="sessions" element={
            <Suspense fallback={<PageLoader />}>
              <ActiveSessions />
            </Suspense>
          } />

          <Route path="subscribers" element={
            <Suspense fallback={<PageLoader />}>
              <ManageSubscribers />
            </Suspense>
          } />
          
          <Route path="activity-logs" element={
            <Suspense fallback={<PageLoader />}>
              <ActivityLogs />
            </Suspense>
          } />

          <Route path="seo-manager" element={
            <Suspense fallback={<PageLoader />}>
              <ManageSEO />
            </Suspense>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

// Lazy loaded public sections
const Expertise = lazy(() => import('./components/Expertise').then(m => ({ default: m.Expertise })));
const ExperienceTimeline = lazy(() => import('./components/ExperienceTimeline').then(m => ({ default: m.ExperienceTimeline })));
const Services = lazy(() => import('./components/Services').then(m => ({ default: m.Services })));
const ProjectGrid = lazy(() => import('./components/ProjectGrid').then(m => ({ default: m.ProjectGrid })));
const RecentBlogs = lazy(() => import('./components/RecentBlogs').then(m => ({ default: m.RecentBlogs })));
const Testimonials = lazy(() => import('./components/Testimonials').then(m => ({ default: m.Testimonials })));
const FAQSection = lazy(() => import('./components/FAQSection').then(m => ({ default: m.FAQSection })));
const ContactSection = lazy(() => import('./components/ContactSection').then(m => ({ default: m.ContactSection })));

function MainPortfolio() {
  return (
    <Layout onViewCV={() => { }}>
      <Hero />

      {/* Below the fold components are lazy loaded to improve PageSpeed */}
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </Layout>
  );
}

function App() {
  const [showVisitorLog, setShowVisitorLog] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    useThemeStore.getState().init();
    useProfileStore.getState().init();
    // Warm up dataStore in background during loader
    useDataStore.getState().init();
    setShowVisitorLog(true);

    // Preload hero image into memory cache
    const img = new Image();
    img.src = '/profile-hero.webp';
  }, []);

  return (
    <>
      {isAppLoading && <LoadingScreen onComplete={() => setIsAppLoading(false)} />}
      <Router>
        <CustomCursor />
        <WhatsAppButton />
        <DynamicSEO />
        <ScrollAndAnimateRoutes showVisitorLog={showVisitorLog} />
      </Router>
    </>
  );
}

export default App;
