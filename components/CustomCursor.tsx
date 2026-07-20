import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Use MotionValues for absolute zero-latency tracking
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring animation for the outer ring (slight lag for effect)
  const springConfig = { damping: 25, stiffness: 400, mass: 0.1 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only show custom cursor on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleHoverStart = () => setIsHovering(true);
    const handleHoverEnd = () => setIsHovering(false);

    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Setup hover listeners for interactive elements
    const setupInteractions = () => {
      const interactables = document.querySelectorAll('a, button, input, textarea, select, [role="button"], .cursor-pointer');
      
      interactables.forEach((el) => {
        el.addEventListener('mouseenter', handleHoverStart);
        el.addEventListener('mouseleave', handleHoverEnd);
      });
    };

    // Run initially and set up a mutation observer for dynamic elements
    setupInteractions();
    
    const observer = new MutationObserver((mutations) => {
      let shouldSetup = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldSetup = true;
          break;
        }
      }
      if (shouldSetup) {
        setupInteractions();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      
      const interactables = document.querySelectorAll('a, button, input, textarea, select, [role="button"], .cursor-pointer');
      interactables.forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
      observer.disconnect();
    };
  }, [isVisible, cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center will-change-transform"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 2.5 : 1,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 300, damping: 20 },
        }}
      >
        <div className="w-full h-full rounded-full border-[1.5px] border-white bg-white/10 backdrop-blur-sm" />
      </motion.div>
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[10000] mix-blend-difference hidden md:block will-change-transform"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 0 : 1,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 300, damping: 20 },
        }}
      />
    </>
  );
};
