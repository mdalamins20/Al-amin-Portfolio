import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { useProfile } from './ProfileContext';
import { Loader2 } from 'lucide-react';

export const Process: React.FC = () => {
  const { profile, loading } = useProfile();

  if (loading || !profile) {
    return null;
  }

  return (
    <SectionWrapper id="process">
      <div className="grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <h2 className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest border-b border-neutral-900 dark:border-white pb-4 inline-block mb-8">
            The Process
          </h2>
          <p className="text-2xl font-serif text-neutral-800 dark:text-neutral-200">
            A strategic approach to <br/> digital product creation.
          </p>
        </div>

        <div className="md:col-span-8">
          <div className="space-y-12">
            {profile.process.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-6 md:gap-12 border-t border-neutral-200 dark:border-neutral-800 pt-8 first:border-0 first:pt-0">
                <div className="text-neutral-300 dark:text-neutral-700 text-5xl font-serif font-bold opacity-50">
                  {step.step}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{step.title}</h4>
                  <p className="text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
