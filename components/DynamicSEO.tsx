import { SEO } from './SEO';
import { useProfileStore } from './stores/useProfileStore';
import { useDataStore } from './stores/useDataStore';

interface DynamicSEOProps {
  title?: string;
  description?: string;
}

export const DynamicSEO: React.FC<DynamicSEOProps> = ({ title: customTitle, description: customDescription }) => {
  const { profile } = useProfileStore();
  const { projects, skills } = useDataStore();

  const pNames = projects.map(p => p.title).join(', ');
  const sNames = skills.map(s => s.name).join(', ');

  const name = profile?.name || 'Muhammad Al-amin';
  const role = profile?.role || 'Digital Solutions Architect';
  const description = profile?.aboutMe?.substring(0, 150) || 'I build highly scalable, fast, and secure web applications.';
  
  const allKeywords = [
    name,
    role,
    'Developer',
    'Portfolio',
    pNames,
    sNames
  ].filter(Boolean).join(', ');

  return (
    <SEO 
      title={customTitle || (profile ? `${profile.name || 'Muhammad Al-amin'} | ${profile.role || 'Digital Solutions Architect'}` : undefined)}
      description={customDescription || description}
      keywords={allKeywords}
      image={profile?.image}
      favicon={profile?.favicon}
    />
  );
};
