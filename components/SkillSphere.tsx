import React, { useEffect, useRef } from 'react';
import TagCloud from 'TagCloud';
import { Skill } from '../types';

interface SkillSphereProps {
  skills: Skill[];
}

export default function SkillSphere({ skills }: SkillSphereProps) {
  const cloudContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (skills.length > 0 && cloudContainerRef.current) {
      cloudContainerRef.current.innerHTML = ''; 

      const radius = window.innerWidth < 768 ? 200 : 350;
      const texts = skills.map(s => s.name);
      
      const tc = TagCloud([cloudContainerRef.current] as any, texts, {
        radius: radius,
        maxSpeed: 'fast',
        initSpeed: 'normal',
        keep: true,
      });

      const items = cloudContainerRef.current.querySelectorAll('.tagcloud--item');
      items.forEach((item, i) => {
        const skill = skills[i];
        if (skill) {
          item.innerHTML = `
            <div class="flex flex-col items-center justify-center p-3 glass-card rounded-2xl hover:-translate-y-1 transition-transform cursor-pointer">
              <img src="${skill.icon}" alt="${skill.name}" class="w-8 h-8 md:w-10 md:h-10 object-contain mb-2" />
              <span class="text-[10px] md:text-xs font-label-bold text-on-surface">${skill.name}</span>
            </div>
          `;
        }
      });

      return () => {
        tc.destroy();
      };
    }
  }, [skills]);

  return (
    <div className="flex justify-center items-center min-h-[400px] md:min-h-[700px] overflow-hidden">
      <div 
        ref={cloudContainerRef} 
        className="tagcloud-container text-primary font-bold"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      ></div>
    </div>
  );
}
