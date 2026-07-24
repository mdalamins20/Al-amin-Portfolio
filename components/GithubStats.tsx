import React, { useEffect, useState } from 'react';
import { useProfileStore } from './stores/useProfileStore';
import { fetchGithubContributions } from '../utils/githubService';

export const GithubStats: React.FC = () => {
  const username = "mdalamins20";
  const { profile } = useProfileStore();
  
  const [githubData, setGithubData] = useState<any>(null);
  const [loadingGraph, setLoadingGraph] = useState(true);

  useEffect(() => {
    const loadContributions = async () => {
      try {
        setLoadingGraph(true);
        const githubUser = profile?.githubUsername || username;
        const data = await fetchGithubContributions(githubUser);
        setGithubData(data);
      } catch (err: any) {
        if (!err.message?.includes('No GitHub token found')) {
          console.error("Failed to load GitHub contributions:", err);
        }
      } finally {
        setLoadingGraph(false);
      }
    };
    loadContributions();
  }, [profile?.githubUsername]);

  const repos = githubData?.stats?.repos || profile?.githubReposCount || "15+";
  const stars = githubData?.stats?.stars || profile?.githubTotalStars || "5000";
  const forks = githubData?.stats?.forks || profile?.githubTotalForks || "36";
  const contributions = profile?.githubTotalContributions || "56242";

  return (
    <section className="py-stack-lg px-margin-mobile md:px-gutter max-w-container-max mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="glass-card p-8 rounded-xl text-center md:text-left">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
            <span className="material-symbols-outlined">code</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">{loadingGraph ? "..." : repos}</h3>
          <p className="text-text-secondary font-body-md">Repositories</p>
        </div>
        
        <div className="glass-card p-8 rounded-xl text-center md:text-left">
          <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
            <span className="material-symbols-outlined">star</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">{loadingGraph ? "..." : stars}</h3>
          <p className="text-text-secondary font-body-md">Total Stars</p>
        </div>
        
        <div className="glass-card p-8 rounded-xl text-center md:text-left">
          <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
            <span className="material-symbols-outlined">fork_right</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">{loadingGraph ? "..." : forks}</h3>
          <p className="text-text-secondary font-body-md">Total Forks</p>
        </div>
        
        <div className="glass-card p-8 rounded-xl text-center md:text-left border-2 border-primary/20">
          <div className="w-12 h-12 bg-primary-container text-white rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0">
            <span className="material-symbols-outlined">monitoring</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">{loadingGraph ? "..." : contributions}</h3>
          <p className="text-text-secondary font-body-md">Total Contributions</p>
        </div>
      </div>
    </section>
  );
};
