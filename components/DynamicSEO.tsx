import { SEO } from './SEO';
import { useProfile } from './ProfileContext';
import { useData } from './DataContext';

interface DynamicSEOProps {
  title?: string;
  description?: string;
}

export const DynamicSEO: React.FC<DynamicSEOProps> = ({ title: customTitle, description: customDescription }) => {
  const { profile } = useProfile();
  const { projects, skills } = useData();

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
      title={customTitle || `${name} | ${role}`}
      description={customDescription || description}
      keywords={allKeywords}
      image={profile?.image}
      favicon={profile?.favicon}
    />
  );
};
