
import { LucideIcon } from 'lucide-react';

export interface Project {
  id: string;
  title: string;
  category: string;
  description?: string; 
  link?: string;
  tags?: string[];
  image?: string;
  role?: string;
  result?: string;
  techStack?: string[];
}

export interface Skill {
  name: string;
  icon: LucideIcon;
  category: 'Tech' | 'Creative' | 'Platform';
}

export interface Tool {
  id?: string;
  name: string;
  tag: string;
  icon: string;
  benefit: string;
}

export interface Blog {
  id?: string;
  title: string;
  content: string;
  image: string;
  date: string;
  author: string;
}

export interface Review {
  id?: string;
  clientName: string;
  role: string;
  content: string;
  rating?: number;
  isApproved: boolean;
  createdAt?: any;
}

export interface Stat {
  value: string;
  suffix?: string;
  label: string;
}

export interface SocialLink {
  name: string;
  url: string;
  iconName: string;
}

export interface Service {
  title: string;
  description: string;
  iconName: string;
  benefit: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface Profile {
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
  tagline: string;
  image: string;
  supportingLine: string;
  aboutMe: string;
  whoIHelp: string;
  problemsSolved: string;
  trustFactor: string;
  socialLinks: SocialLink[];
  stats: Stat[];
  services: Service[];
  process: ProcessStep[];
}

export interface NavItem {
  label: string;
  href: string;
  isAction?: boolean;
}
