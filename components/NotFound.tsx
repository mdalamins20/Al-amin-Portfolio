import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Layout } from './Layout';
import { DynamicSEO } from './DynamicSEO';

export const NotFound: React.FC = () => {
  return (
    <Layout onViewCV={() => {}}>
      <DynamicSEO title="404 - Page Not Found | Al-amin Portfolio" />
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-brand/5 rounded-full blur-[100px] -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h1 className="text-9xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-brand to-brand/20 tracking-tighter leading-none mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-theme-text mb-6">
            Page Not Found
          </h2>
          <p className="text-theme-dim max-w-lg mx-auto mb-10 text-lg">
            Oops! The page you're looking for seems to have vanished into the digital void. Let's get you back on track.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/"
              className="px-8 py-4 bg-brand hover:bg-brand-700 text-white font-bold rounded-theme flex items-center justify-center space-x-2 transition-all shadow-lg shadow-brand/20 w-full sm:w-auto"
            >
              <Home size={20} />
              <span>Back to Home</span>
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="px-8 py-4 bg-theme-card border border-theme-border hover:bg-theme-bg text-theme-text font-bold rounded-theme flex items-center justify-center space-x-2 transition-all w-full sm:w-auto"
            >
              <ArrowLeft size={20} />
              <span>Go Back</span>
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};
