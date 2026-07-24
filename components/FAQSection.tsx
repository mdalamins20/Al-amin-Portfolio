import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "What is your typical project timeline?",
    answer: "A standard web application usually takes 2-4 weeks from design to deployment. More complex SaaS platforms or e-commerce sites can take 1-3 months depending on the specific requirements and integrations needed."
  },
  {
    question: "Do you offer post-launch support and maintenance?",
    answer: "Absolutely! I offer 30 days of free bug-fixing and support after every project launch. For long-term peace of mind, I also provide monthly retainer packages for updates, security patches, and new features."
  },
  {
    question: "What technologies do you specialize in?",
    answer: "I specialize in modern JavaScript/TypeScript ecosystems. My core stack includes React, Next.js, Node.js, Express, and Firebase/Supabase. I also use Tailwind CSS for pixel-perfect, responsive designs."
  },
  {
    question: "How do you handle project pricing?",
    answer: "I work on both fixed-price and hourly rate models depending on the project scope. For well-defined projects, I provide a fixed quote. For ongoing work or projects with evolving requirements, an hourly or weekly retainer works best."
  },
  {
    question: "Can you help with UI/UX design as well?",
    answer: "Yes. While I am primarily a developer, I have a strong background in UI/UX design. I can design intuitive, modern, and conversion-focused interfaces in Figma before we begin the development phase."
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-section-padding px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="text-center mb-stack-lg">
        <span className="font-label-bold text-label-bold text-secondary uppercase tracking-widest mb-4 block">Client Queries</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Frequently Asked <span className="gradient-text">Questions.</span></h2>
        <p className="text-text-secondary font-body-lg max-w-2xl mx-auto mt-4">
          Everything you need to know about my services, pricing, and how we can work together.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 border ${isOpen ? 'border-primary/30 shadow-md' : 'border-transparent'}`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className={`font-headline-sm font-bold ${isOpen ? 'text-primary' : 'text-on-surface'} transition-colors`}>
                  {faq.question}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-surface-variant text-on-surface-variant'}`}>
                  <ChevronDown size={18} />
                </div>
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 pt-2 text-text-secondary leading-relaxed font-medium">
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent mb-4"></div>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
