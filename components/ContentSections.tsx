
import React from 'react';
import { SectionWrapper } from './SectionWrapper';
import { motion } from 'framer-motion';
import { CheckCircle, Trophy, Users, Clock, ShieldCheck, Target, Zap, Loader2 } from 'lucide-react';
import { useProfile } from './ProfileContext';

const VALUE_PROPS = [
  {
    icon: Trophy,
    title: "Editorial Design",
    desc: "Clean, high-impact aesthetics that ensure your brand stands out in a crowded digital landscape."
  },
  {
    icon: Clock,
    title: "Agile Engineering",
    desc: "Rapid development cycles combined with industry-leading performance and security standards."
  },
  {
    icon: Users,
    title: "Strategic Partner",
    desc: "I align technical decisions with your business goals to ensure long-term scalability and ROI."
  },
  {
    icon: CheckCircle,
    title: "Transparent Workflow",
    desc: "Direct communication and real-time updates through every sprint of your project."
  }
];

export const ContentSections: React.FC = () => {
  const { profile, loading } = useProfile();

  if (loading || !profile) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={48} />
      </div>
    );
  }

  return (
    <>
      <SectionWrapper id="advantage" className="py-20 border-y border-slate-100 dark:border-slate-900">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {profile.stats.map((stat, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 className="text-center"
               >
                 <div className="text-4xl md:text-6xl font-serif font-black text-slate-950 dark:text-white mb-2">
                    {stat.value}<span className="text-brand-600">{stat.suffix}</span>
                 </div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    {stat.label}
                 </div>
               </motion.div>
            ))}
         </div>
      </SectionWrapper>

      <SectionWrapper className="py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-start mb-20">
          <div className="lg:col-span-5">
            <h2 className="text-brand-600 font-black uppercase tracking-[0.2em] text-xs mb-4">Profile Overview</h2>
            <h3 className="text-4xl md:text-6xl font-serif font-bold text-slate-950 dark:text-white leading-tight mb-6">
              Engineering <span className="text-slate-400 italic">with</span> <span className="text-brand-600">Intent.</span>
            </h3>
          </div>
          <div className="lg:col-span-7">
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-12">
              {profile.aboutMe}
            </p>
            
            {/* Added Strategic Clarity Block */}
            <div className="grid md:grid-cols-3 gap-8 pt-10 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2 text-brand-600 mb-3">
                  <Target size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Who I Help</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{profile.whoIHelp}</p>
              </div>
              <div>
                <div className="flex items-center space-x-2 text-brand-600 mb-3">
                  <Zap size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Problems Solved</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{profile.problemsSolved}</p>
              </div>
              <div>
                <div className="flex items-center space-x-2 text-brand-600 mb-3">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Why Trust Me</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{profile.trustFactor}</p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper className="py-24 pt-0">
        <div className="max-w-3xl mb-20">
          <h2 className="text-brand-600 font-black uppercase tracking-[0.2em] text-xs mb-4">The Advantage</h2>
          <h3 className="text-4xl md:text-6xl font-serif font-bold text-slate-950 dark:text-white leading-tight">
            I build digital products that <span className="text-slate-400 italic">convert</span> and <span className="text-brand-600">scale.</span>
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUE_PROPS.map((prop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brand-500/20 hover:shadow-2xl transition-all duration-500"
            >
               <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-500 shadow-sm">
                 <prop.icon size={22} />
               </div>
               <h4 className="text-xl font-bold text-slate-950 dark:text-white mb-3">{prop.title}</h4>
               <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                 {prop.desc}
               </p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
};
