import React from 'react';
import { useProfileStore } from './stores/useProfileStore';

export const GithubStats: React.FC = () => {
  const { profile } = useProfileStore();
  const username = profile?.githubUsername || "mdalamins20";
  
  const repos = profile?.githubReposCount || "0";
  const stars = profile?.githubTotalStars || "0";
  const forks = profile?.githubTotalForks || "0";
  const contributions = profile?.githubTotalContributions || "0";

  return (
    <section className="py-stack-lg px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-sans font-bold text-theme-text mb-4 text-center">GitHub Contributions</h2>
        <div className="w-16 h-1 bg-brand rounded-full mx-auto"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-12">
        <div className="glass-card p-8 rounded-xl text-center md:text-left shadow-sm">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
            <span className="material-symbols-outlined">code</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">{repos}</h3>
          <p className="text-text-secondary font-body-md">Repositories</p>
        </div>
        
        <div className="glass-card p-8 rounded-xl text-center md:text-left shadow-sm">
          <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
            <span className="material-symbols-outlined">star</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">{stars}</h3>
          <p className="text-text-secondary font-body-md">Total Stars</p>
        </div>
        
        <div className="glass-card p-8 rounded-xl text-center md:text-left shadow-sm">
          <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
            <span className="material-symbols-outlined">fork_right</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">{forks}</h3>
          <p className="text-text-secondary font-body-md">Total Forks</p>
        </div>
        
        <div className="glass-card p-8 rounded-xl text-center md:text-left border-2 border-brand/20 shadow-sm">
          <div className="w-12 h-12 bg-brand/10 text-brand rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
            <span className="material-symbols-outlined">group</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">{contributions}</h3>
          <p className="text-text-secondary font-body-md">Total Contributions</p>
        </div>
      </div>

      {/* Real GitHub Contribution Graph */}
      <div className="w-full flex justify-center bg-surface-variant/30 p-4 md:p-8 rounded-[2rem] border border-outline-variant/30 overflow-x-auto">
        <img 
          src={`https://ghchart.rshah.org/8B5CF6/${username}`} 
          alt={`${username}'s Github Chart`} 
          className="max-w-[1200px] w-full min-w-[700px] object-contain drop-shadow-md"
        />
      </div>
    </section>
  );
};

