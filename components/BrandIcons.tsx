import React from 'react';

export const ReactIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    <ellipse rx="10" ry="4.5" transform="rotate(0 12 12)" stroke="currentColor" strokeWidth="1.5"/>
    <ellipse rx="10" ry="4.5" transform="rotate(60 12 12)" stroke="currentColor" strokeWidth="1.5"/>
    <ellipse rx="10" ry="4.5" transform="rotate(120 12 12)" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const FlutterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M14 2L5 11L8 14L22 0H14Z" fill="currentColor"/>
    <path d="M5 11L2 14L10 22H18L5 11Z" fill="currentColor"/>
    <path d="M14 13.5L10.5 17L14 20.5L17.5 17L14 13.5Z" fill="currentColor"/>
  </svg>
);

export const NodeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L4 6.5V17.5L12 22L20 17.5V6.5L12 2Z" />
    <path d="M12 22V13" />
    <path d="M20 6.5L12 11L4 6.5" />
    <path d="M17 14.5L12 11.5" />
  </svg>
);

export const HtmlCssIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M3 3H21L19.5 18L12 21L4.5 18L3 3Z" strokeLinejoin="round"/>
    <path d="M12 7V17" strokeLinecap="round"/>
    <path d="M16 8L8 11L16 14" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" />
    <path d="M8 8V16" strokeLinecap="round"/>
    <path d="M8 8H10C11.5 8 12.5 9 12.5 10.5C12.5 12 11.5 13 10 13H8" strokeLinecap="round"/>
    <path d="M14 12C14 11 15 10 16 10" strokeLinecap="round"/>
    <path d="M16 10C15 10 14 11 14 12C14 13 15 14.5 16 14.5C16.5 14.5 17 14 17 14V16" strokeLinecap="round"/>
  </svg>
);

export const AiIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" />
    <path d="M6 16L9 8L12 16" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 14H11" strokeLinecap="round"/>
    <path d="M16 8V16" strokeLinecap="round"/>
    <path d="M16 8V9" strokeLinecap="round"/>
  </svg>
);

export const FbIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const VideoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M15 10L20 6V18L15 14" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="4" y="6" width="11" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);