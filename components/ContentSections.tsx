import React from 'react';

export const ContentSections: React.FC = () => {
  return (
    <section className="py-section-padding bg-surface-deep/50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20"></div>
      <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-gutter text-center">
        <span className="font-label-bold text-label-bold text-primary tracking-widest uppercase mb-4 block">Capabilities &amp; Speed</span>
        <h2 className="font-display-xl-mobile md:font-headline-lg text-display-xl-mobile md:text-headline-lg text-on-surface mb-stack-md">
          World-Class <span className="gradient-text">Performance.</span>
        </h2>
        <p className="font-body-lg text-body-lg text-text-secondary max-w-2xl mx-auto mb-stack-lg">
          Delivering high-performance digital experiences through optimized codebases, lightning-fast loading speeds, and scalable cloud architectures.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
          <div className="p-1 rounded-2xl bg-gradient-to-b from-surface-variant/20 to-transparent">
            <div className="bg-surface-container p-8 rounded-2xl h-full border border-outline-variant/10 text-left">
              <span className="material-symbols-outlined text-primary text-4xl mb-4">bolt</span>
              <h4 className="font-headline-md text-[24px] mb-2 text-on-surface">99/100 Core Web Vitals</h4>
              <p className="text-text-secondary">Meticulous optimization ensuring your users get the fastest interaction possible.</p>
            </div>
          </div>
          <div className="p-1 rounded-2xl bg-gradient-to-b from-primary/20 to-transparent">
            <div className="bg-surface-container p-8 rounded-2xl h-full border border-primary/10 text-left">
              <span className="material-symbols-outlined text-secondary text-4xl mb-4">cloud</span>
              <h4 className="font-headline-md text-[24px] mb-2 text-on-surface">Infinite Scalability</h4>
              <p className="text-text-secondary">Architecting systems that handle traffic surges gracefully without downtime.</p>
            </div>
          </div>
          <div className="p-1 rounded-2xl bg-gradient-to-b from-surface-variant/20 to-transparent">
            <div className="bg-surface-container p-8 rounded-2xl h-full border border-outline-variant/10 text-left">
              <span className="material-symbols-outlined text-tertiary text-4xl mb-4">shield</span>
              <h4 className="font-headline-md text-[24px] mb-2 text-on-surface">Security First</h4>
              <p className="text-text-secondary">Robust encryption and protection measures for data integrity and user privacy.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
