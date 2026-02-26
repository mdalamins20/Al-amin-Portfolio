
import { 
  Code2, 
  Smartphone, 
  Palette, 
  Zap, 
  Github, 
  Linkedin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Music2, 
  Settings 
} from 'lucide-react';
import { Project, Stat, NavItem, Tool } from './types';

export const USER_INFO = {
  name: "Muhammad Al-amin",
  firstName: "Muhammad",
  lastName: "Al-amin",
  role: "Digital Solutions Architect",
  email: "mdalaminkhalifa2002@gmail.com",
  phone: "+8801778189644",
  tagline: "Transforming Complex Problems into Elegant Digital Solutions.",
  image: "https://i.ibb.co.com/4ZtpFT0b/IMG.png",
  supportingLine: "I help startups and businesses build fast, modern, conversion-focused websites that scale effortlessly."
};

// Custom Translator Language List
export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ur', label: 'Urdu', native: 'اردو', flag: '🇵🇰' },
  { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'zh-CN', label: 'Chinese', native: '简体中文', flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'mi', label: 'Maori', native: 'Te Reo Māori', flag: '🇳🇿' },
  { code: 'tpi', label: 'Tok Pisin', native: 'Tok Pisin', flag: '🇵🇬' }
];

export const ABOUT_ME = `I am a multi-disciplinary developer and strategist who bridges the gap between high-performance engineering and human-centric design. With over 3 years of craftsmanship, I specialize in building scalable MERN stack ecosystems, intelligent automation tools, and professional creative assets. Whether it's architecting complex software automation scripts in Python or crafting high-impact UI/UX systems, my focus is always on delivering strategic value through technical precision.`;

export const STRATEGIC_ABOUT = {
  whoIHelp: "Startups, established businesses, and personal brands looking to modernize their digital presence.",
  problemsSolved: "High bounce rates, slow performance, poor user engagement, and inefficient manual workflows.",
  trustFactor: "Transparent communication, agile delivery cycles, and a result-oriented mindset that prioritizes your business growth."
};

export const SOCIAL_LINKS = [
  { name: 'GitHub', url: 'https://github.com/malaminA03', icon: Github },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/mdalamins20/', icon: Linkedin },
  { name: 'Facebook', url: 'https://www.facebook.com/mdalamins20', icon: Facebook },
  { name: 'X', url: 'https://x.com/mdalamins20', icon: Twitter },
  { name: 'Instagram', url: 'https://www.instagram.com/mdalamins20/', icon: Instagram },
  { name: 'TikTok', url: 'https://www.tiktok.com/@mdalamins200', icon: Music2 },
  { name: 'YouTube', url: 'https://www.youtube.com/@MdalaminS20', icon: Youtube },
];

export const NAV_ITEMS: NavItem[] = [
  { label: 'Why Me', href: '/#advantage' },
  { label: 'Services', href: '/#services' },
  { label: 'Work', href: '/#work' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact' },
  { label: 'View CV', href: '#cv', isAction: true },
];

export const SERVICES = [
  {
    title: "Business Web Development",
    description: "Architecting high-performance MERN stack ecosystems focused on speed, SEO, and user conversion.",
    icon: Code2,
    benefit: "Drives organic traffic and improves lead retention."
  },
  {
    title: "Intelligent Automation",
    description: "Building Python-based tools and AI integrations to automate repetitive tasks and optimize workflows.",
    icon: Zap,
    benefit: "Saves hundreds of hours in manual labor."
  },
  {
    title: "UI/UX & Creative Design",
    description: "Designing high-impact visual systems and cinematic video content that build immediate brand trust.",
    icon: Palette,
    benefit: "Position your brand as a premium leader in your industry."
  },
  {
    title: "Digital Growth Strategy",
    description: "Hardware solutions, Kali Linux administration, and strategic technical consulting for long-term scaling.",
    icon: Settings,
    benefit: "Ensures your infrastructure stays secure and future-proof."
  }
];

export const PROJECTS: Project[] = [];

export const TOOLS: Tool[] = [];

export const STATS: Stat[] = [
  { value: "3", suffix: "+", label: "Years Experience" },
  { value: "25", suffix: "+", label: "Projects Delivered" },
  { value: "100", suffix: "%", label: "Client Satisfaction" }, 
  { value: "24", suffix: "/7", label: "Strategic Support" }, 
];

export const PROCESS = [
  {
    step: "01",
    title: "Strategic Discovery",
    description: "I analyze your business bottlenecks to define a clear technical roadmap that ensures ROI."
  },
  {
    step: "02",
    title: "Interface Architecture",
    description: "Crafting professional UI/UX frameworks designed specifically for your target audience."
  },
  {
    step: "03",
    title: "Engineering Sprint",
    description: "Developing robust, scalable codebases using modern, secure industry standards."
  },
  {
    step: "04",
    title: "Optimization & Launch",
    description: "Rigorous testing and environment setup for a flawless, high-performance launch."
  }
];

export const TESTIMONIALS: any[] = [];
