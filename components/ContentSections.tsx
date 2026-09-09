import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Cpu, ShieldCheck, ArrowUpRight, Gauge, Activity } from 'lucide-react';

export const ContentSections: React.FC = () => {
  const cards = [
    {
      icon: Zap,
      iconColor: 'text-amber-500 dark:text-amber-400',
      bgGlow: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'group-hover:border-amber-500/40',
      badgeText: '99/100 Google Lighthouse',
      badgeColor: 'text-amber-600 dark:text-amber-300 bg-amber-500/10 border-amber-500/20',
      title: 'Ultra-Fast Web Vitals',
      description: 'Zero-bloat architecture and optimized asset pipelines ensuring sub-second initial load and instant interactive responses.',
      metric: '0.4s',
      metricLabel: 'First Contentful Paint'
    },
    {
      icon: Cpu,
      iconColor: 'text-primary',
      bgGlow: 'from-primary/15 via-primary/5 to-transparent',
      borderColor: 'group-hover:border-primary/50',
      badgeText: '99.9% Uptime SLA',
      badgeColor: 'text-primary bg-primary/10 border-primary/25',
      title: 'Resilient Scalability',
      description: 'Distributed cloud architectures and edge-cached APIs designed to effortlessly absorb massive traffic spikes without latency.',
      metric: '100k+',
      metricLabel: 'Concurrent Capacity'
    },
    {
      icon: ShieldCheck,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      bgGlow: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'group-hover:border-emerald-500/40',
      badgeText: 'A+ Grade Security',
      badgeColor: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
      title: 'Ironclad Protection',
      description: 'Built-in CSRF/XSS shields, encrypted storage, and automated sanitization keeping application data impregnable.',
      metric: 'AES-256',
      metricLabel: 'Data Encryption'
    }
  ];

  return (
    <section className="py-section-padding relative overflow-hidden bg-gradient-to-b from-transparent via-surface-variant/5 to-transparent">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Gauge size={14} className="text-primary" />
            <span className="font-label-bold text-xs text-primary uppercase tracking-widest">Speed &amp; Engineering</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            World-Class <span className="gradient-text">Performance.</span>
          </h2>
          <p className="font-body-lg text-text-secondary leading-relaxed">
            Every millimeter of code is benchmarked for hyper-speed, flawless responsiveness, and bulletproof production reliability.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.1, duration: 0.45 }}
                className={`group relative rounded-3xl p-px bg-gradient-to-b ${card.bgGlow} transition-all duration-500 hover:-translate-y-1.5 shadow-sm hover:shadow-2xl hover:shadow-primary/5`}
              >
                <div className={`h-full w-full bg-surface/90 dark:bg-slate-950/80 backdrop-blur-xl border border-surface-variant/30 dark:border-white/10 ${card.borderColor} rounded-[23px] p-7 md:p-8 flex flex-col justify-between transition-colors duration-300`}>
                  <div>
                    {/* Header: Icon + Badge */}
                    <div className="flex items-center justify-between gap-2 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-surface-variant/20 dark:bg-white/5 border border-surface-variant/30 dark:border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent size={24} className={card.iconColor} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border ${card.badgeColor}`}>
                        {card.badgeText}
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold tracking-tight mb-3 group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>

                    {/* Card Description */}
                    <p className="font-body-md text-text-secondary dark:text-slate-300 text-sm leading-relaxed mb-6">
                      {card.description}
                    </p>
                  </div>

                  {/* Card Bottom Metric Callout */}
                  <div className="pt-4 border-t border-surface-variant/20 dark:border-white/10 flex items-end justify-between">
                    <div>
                      <span className="block text-2xl font-black font-mono text-on-surface tracking-tight group-hover:text-primary transition-colors">
                        {card.metric}
                      </span>
                      <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                        {card.metricLabel}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-surface-variant/20 dark:bg-white/5 flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-all">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
