/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView, useAnimationFrame, useMotionValue } from 'motion/react';
import { ArrowUpRight, Play, Plus, ArrowLeft, ArrowRight, Globe, MapPin, Menu, X, Copy, Phone } from 'lucide-react';
import { BrowserRouter, Routes, Route, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import PhoneAnimation from './components/PhoneAnimation';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Word = ({ children, progress, range }: any) => {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <span className="relative mr-[0.25em] inline-block">
      <span className="absolute opacity-10">{children}</span>
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
};

const ScrollChar = ({ char, progress, index, length }: { key?: number, char: string, progress: any, index: number, length: number }) => {
  const center = length / 2;
  const dist = Math.abs(index - center);
  const maxDist = length / 2;
  const normalizedDist = dist / maxDist; 
  
  const start = normalizedDist * 0.2;
  const end = start + 0.5;

  const y = useTransform(progress, [start, end], ["110%", "0%"]);
  
  return (
    <motion.span style={{ y }} className="inline-block origin-bottom">
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
};

const CenterRevealText = ({ text, className }: { text: string, className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "center 0.5"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);

  return (
    <div ref={ref} className="overflow-hidden flex justify-center w-full">
      <motion.h2 style={{ y }} className={className}>
        {text}
      </motion.h2>
    </div>
  );
};

const ScrollRevealText = ({ value, className, children }: { value: string, className?: string, children?: React.ReactNode }) => {
  const element = useRef(null);
  const { scrollYProgress } = useScroll({
    target: element,
    offset: ['start 0.9', 'start 0.25']
  });

  const words = useMemo(() => value.split(" "), [value]);
  return (
    <div ref={element} className={className}>
      <p className="flex flex-wrap text-inherit font-inherit leading-inherit tracking-inherit items-center justify-center md:justify-start">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + (1 / words.length);
          return <Word key={i} progress={scrollYProgress} range={[start, end]}>{word}</Word>
        })}
        {children}
      </p>
    </div>
  );
}

const TypewriterScrollText = ({ text, progress, range, className = "justify-center" }: { text: string, progress: any, range: [number, number], className?: string }) => {
  const characters = text.split("");
  return (
    <div className={`flex flex-wrap ${className}`}>
      {characters.map((char, i) => {
        const charStart = range[0] + (i / characters.length) * (range[1] - range[0]);
        const charEnd = charStart + (1 / characters.length) * (range[1] - range[0]);
        const opacity = useTransform(progress, [charStart, charEnd], [0, 1]);
        return (
          <motion.span key={i} style={{ opacity }} className="inline-block">
            {char === " " ? "\u00A0" : char}
          </motion.span>
        );
      })}
    </div>
  );
};

const ScrollCounter = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.5"]
  });

  // Tens: 0 -> 8 (Up)
  const tens = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  // Height of one item is 0.95em
  // Move from 0 (index 0) to -7.6em (index 8)
  const tensY = useTransform(scrollYProgress, [0, 1], ["0em", "-7.6em"]);

  // Units: 0 -> 7 (Down)
  // Strip: 7, 6, 5, 4, 3, 2, 1, 0
  const units = [7, 6, 5, 4, 3, 2, 1, 0];
  // Move from -6.65em (index 7, value 0) to 0em (index 0, value 7)
  const unitsY = useTransform(scrollYProgress, [0, 1], ["-6.65em", "0em"]);

  return (
    <div ref={ref} className="mt-8 md:mt-32 flex flex-col items-end w-full md:w-auto">
       <div className="flex items-center gap-4 mb-4 md:mb-6 border border-current px-3 py-1 md:px-4 md:py-2 rounded-sm origin-right scale-90 md:scale-100">
           <Plus size={16} />
           <span className="font-sans text-xs md:text-sm tracking-[0.2em] font-medium uppercase">WYKONANE PROJEKTY</span>
           <div className="flex gap-1 ml-2">
              <div className="w-[1px] h-4 bg-current"></div>
              <div className="w-[1px] h-4 bg-current"></div>
           </div>
       </div>
       
       <div className="flex gap-[1vw] md:gap-4 text-[30vw] md:text-[16vw] leading-none font-light font-display tracking-tighter overflow-hidden h-[0.95em] pr-0 md:pr-[1vw]">
         <motion.div style={{ y: tensY }} className="flex flex-col will-change-transform">
            {tens.map(n => (
              <span key={n} className="h-[0.95em] flex items-center justify-center">{n}</span>
            ))}
         </motion.div>
         <motion.div style={{ y: unitsY }} className="flex flex-col will-change-transform">
            {units.map(n => (
              <span key={n} className="h-[0.95em] flex items-center justify-center">{n}</span>
            ))}
         </motion.div>
       </div>
    </div>
  );
};

const SlotCounter = ({ value, duration = 3 }: { value: number, duration?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    
    // Create a sequence of numbers for the "spin" effect
    // We want it to look like it's spinning multiple times
    const tensArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8];
    const unitsArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7];

    return (
        <div ref={ref} className="flex overflow-hidden h-[0.95em] items-center justify-center leading-none">
            <div className="relative h-[0.95em] flex">
                <motion.div
                    initial={{ y: "0%" }}
                    animate={isInView ? { y: `-${(tensArray.length - 1) * 100 / tensArray.length}%` } : { y: "0%" }}
                    transition={{ duration: duration, ease: [0.45, 0.05, 0.55, 0.95], delay: 0.2 }}
                    className="flex flex-col h-fit"
                >
                    {tensArray.map((n, i) => (
                        <span key={i} className="h-[0.95em] flex items-center justify-center min-w-[0.6em]">{n}</span>
                    ))}
                </motion.div>
                <motion.div
                    initial={{ y: "0%" }}
                    animate={isInView ? { y: `-${(unitsArray.length - 1) * 100 / unitsArray.length}%` } : { y: "0%" }}
                    transition={{ duration: duration + 0.5, ease: [0.45, 0.05, 0.55, 0.95], delay: 0.2 }}
                    className="flex flex-col h-fit"
                >
                    {unitsArray.map((n, i) => (
                        <span key={i} className="h-[0.95em] flex items-center justify-center min-w-[0.6em]">{n}</span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

const Navbar = ({ isMenuOpen, setIsMenuOpen }: { isMenuOpen: boolean, setIsMenuOpen: (val: boolean) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navLinks = [
    { name: "O MNIE", href: "/#about" },
    { name: "OFERTA", href: "/#work" },
    { name: "PYTANIA", href: "/#faq" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const id = href.replace('/#', '');
    const element = document.getElementById(id);
    
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    } else if (href.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-[100] text-[#E6E1DC] mix-blend-difference pointer-events-none">
        <div className="text-2xl font-display tracking-tighter uppercase pointer-events-auto">
          {location.pathname !== "/" && (
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-50 transition-opacity"
            >
              <ArrowLeft size={16} /> Powrót
            </button>
          )}
        </div>

        {/* Desktop Nav - Centered */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-16 text-[10px] font-sans font-semibold uppercase tracking-[0.15em] pointer-events-auto">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.href} 
              onClick={(e) => handleNavClick(e, link.href)}
              className="hover:opacity-50 transition-opacity flex items-center gap-2"
            >
              <Plus size={12} />
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Nav - Right Corner */}
        <div className="hidden md:flex items-center gap-8 pointer-events-auto">
          <Link 
            to="/#contact" 
            onClick={(e) => handleNavClick(e, '/#contact')}
            className="hover:bg-[#E6E1DC] hover:text-black transition-all duration-300 flex items-center gap-2 border border-current px-5 py-2.5 rounded-sm text-[10px] font-sans font-semibold uppercase tracking-[0.15em]"
          >
            <div className="w-1.5 h-1.5 bg-current rounded-full"></div> KONTAKT
          </Link>
        </div>

        {/* Mobile Nav Button */}
        <button 
          className="md:hidden z-50 relative pointer-events-auto"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "tween", duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-[#0a0a0a] z-[90] flex flex-col items-center justify-start pt-32 gap-8 md:hidden"
          >
            <nav className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (i + 1) }}
                >
                  <Link 
                    to={link.href} 
                    onClick={(e) => {
                      handleNavClick(e, link.href);
                      setIsMenuOpen(false);
                    }} 
                    className="text-white text-3xl font-syne font-bold uppercase tracking-tighter hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link 
                  to="/#contact" 
                  onClick={(e) => {
                    handleNavClick(e, '/#contact');
                    setIsMenuOpen(false);
                  }} 
                  className="text-white text-3xl font-syne font-bold uppercase tracking-tighter hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all"
                >
                  KONTAKT
                </Link>
              </motion.div>
            </nav>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-12 flex flex-col items-center gap-4 text-sm font-sans text-neutral-400"
              >
                <a href="tel:+48795042610" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone size={16} />
                  +48 795 042 610
                </a>
                <a href="mailto:pawel.webdev@protonmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  pawel.webdev@protonmail.com
                </a>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const GlobeBackground = ({ maskColor }: { maskColor?: any }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Rotate 180 degrees as the section passes through the viewport
  const rotate = useTransform(scrollYProgress, [0, 1], [-90, 90]);

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <motion.div 
        style={{ rotate }}
        className="w-[120vw] h-[120vw] md:w-[60vw] md:h-[60vw] max-w-[800px] max-h-[800px] flex items-center justify-center relative"
      >
        {/* Wireframe with masking circle inside SVG for perfect alignment */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-current overflow-visible">
            {/* Solid Masking Circle - Matches background to "cut" the fixed lines */}
            <motion.circle 
              cx="50" cy="50" r="49" 
              style={{ fill: maskColor }} 
              stroke="none"
            />
            
            {/* Wireframe group with opacity */}
            <g className="opacity-[0.25]">
              <circle cx="50" cy="50" r="48" fill="none" strokeWidth="0.12" />
              {/* Meridians (Vertical lines) */}
              {[...Array(12)].map((_, i) => (
                <ellipse 
                  key={`m-${i}`} 
                  cx="50" cy="50" rx={48 * Math.cos((i * Math.PI) / 12)} ry="48" 
                  fill="none" strokeWidth="0.12" 
                />
              ))}
              {/* Parallels (Horizontal lines) */}
              {[...Array(9)].map((_, i) => {
                const step = i - 4; // -4 to 4
                const y = 50 + (step * 10); 
                const r = Math.sqrt(Math.max(0, Math.pow(48, 2) - Math.pow(y - 50, 2))); 
                return (
                  <ellipse 
                    key={`p-${i}`} 
                    cx="50" cy={y} rx={r} ry={r * 0.1} 
                    fill="none" strokeWidth="0.12" 
                  />
                );
              })}
            </g>
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

const Preloader = ({ onComplete, ...props }: { onComplete: () => void, key?: string }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Inicjalizacja...");

  useEffect(() => {
    // List of critical assets to preload
    const assets = [
      "https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/FILMHOMEPAGE1.mp4",
      "https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/BRAZOWYMONITOR1.mp4",
      "https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/ZIELONYTELEFON1.mp4",
      "https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/POMARANCZOWYMONITOR1.mp4",
      "https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/LAPTOPMORYTZAUTO1.mp4",
      "https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/NIEBIESKIMONITOR1.mp4",
      "https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/TELEFONPINK1.mp4",
      "https://i.ibb.co/4Rs8nf7w/apple-pro-display-xdr-roundup-header-800x564.webp",
      "https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/WIDEOTELEFON1.mp4"
    ];

    let loadedCount = 0;
    const totalAssets = assets.length;
    let isComplete = false;

    const handleAssetLoad = () => {
      if (isComplete) return;
      loadedCount++;
      const newProgress = Math.round((loadedCount / totalAssets) * 100);
      setProgress(newProgress);
      
      if (newProgress < 30) setLoadingText("Pobieranie zasobów...");
      else if (newProgress < 70) setLoadingText("Optymalizacja multimediów...");
      else setLoadingText("Przygotowanie do startu...");

      if (loadedCount === totalAssets) {
        isComplete = true;
        setTimeout(onComplete, 1000); // small delay for smooth transition
      }
    };

    assets.forEach((src) => {
      if (src.endsWith('.mp4') || src.endsWith('.mov')) {
        const video = document.createElement('video');
        video.src = src;
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        
        const onLoaded = () => handleAssetLoad();
        video.oncanplaythrough = onLoaded;
        video.onloadeddata = onLoaded;
        video.onerror = onLoaded; // Continue even if one fails
        video.load();
      } else {
        const img = new Image();
        img.src = src;
        img.onload = handleAssetLoad;
        img.onerror = handleAssetLoad;
      }
    });

    // Fallback timeout in case some assets hang (e.g., slow network)
    const timeout = setTimeout(() => {
      if (!isComplete) {
        isComplete = true;
        setProgress(100);
        onComplete();
      }
    }, 30000); // Increased to 30s for large videos

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center"
    >
      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] relative"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <path
              id="preloaderCirclePath"
              d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
              fill="transparent"
            />
            <text className="text-[6px] font-syne font-bold uppercase tracking-[0.50em] fill-[#E6E1DC]">
              <textPath 
                href="#preloaderCirclePath" 
                startOffset="0%" 
                textLength="219.9" 
                lengthAdjust="spacing"
              >
                PAWELSTUDIO - PAWEL STUDIO - PAWELSTUDIO - PAWEL STUDIO - 
              </textPath>
            </text>
          </svg>
        </motion.div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          <div className="text-[10px] md:text-xs font-mono text-[#E6E1DC]/50 tracking-widest uppercase text-center min-w-[200px]">
            {loadingText}
          </div>
          <div className="text-sm md:text-base font-mono text-[#E6E1DC] tracking-widest font-bold">
            {progress}%
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!isAppLoaded && <Preloader key="preloader" onComplete={() => setIsAppLoaded(true)} />}
      </AnimatePresence>
      
      {isAppLoaded && (
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/o-mnie" element={<AboutMePage />} />
            <Route path="/oferta/:serviceId" element={<ServiceDetailPage />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  });

  const monitorY = useTransform(heroProgress, [0, 1], isMobile ? [40, 0] : [800, 0]);
  const monitorRotateX = useTransform(heroProgress, [0, 1], isMobile ? [60, 0] : [85, 0]);
  const monitorScale = useTransform(heroProgress, [0, 1], isMobile ? [0.7, 1] : [0.3, 1]);

  useEffect(() => {
    setIsLoaded(true);
    
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener("mousemove", mouseMove);
    return () => window.removeEventListener("mousemove", mouseMove);
  }, []);

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      backgroundColor: "rgba(255, 255, 255, 1)",
      mixBlendMode: "difference" as const,
      scale: 1
    },
    text: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      backgroundColor: "rgba(255, 255, 255, 1)",
      mixBlendMode: "difference" as const,
      scale: 3
    }
  };

  const textEnter = () => setCursorVariant("text");
  const textLeave = () => setCursorVariant("default");

  const { scrollYProgress } = useScroll();
  const scrollRanges = isMobile ? [0.1, 0.25, 0.4, 0.55] : [0.2, 0.4, 0.6, 0.9];
  const bgColor = useTransform(scrollYProgress, scrollRanges, ["#0a0a0a", "#1a1a1a", "#E6E1DC", "#E6E1DC"]);
  const textColor = useTransform(scrollYProgress, scrollRanges, ["#E6E1DC", "#cccccc", "#111111", "#000000"]);
  
  // Synchronize border color with background color transitions
  const borderRanges = isMobile ? [0.25, 0.4] : [0.4, 0.6];
  const borderColor = useTransform(scrollYProgress, borderRanges, ["rgba(255,255,255,0.1)", "rgba(0,0,0,0.05)"]);

  return (
    <motion.div 
      ref={containerRef} 
      style={{ color: textColor, backgroundColor: bgColor }}
      className="min-h-screen font-sans selection:bg-[#E6E1DC] selection:text-[#111] relative"
    >
      {/* Global Background Pattern (Lines) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="h-full w-full grid grid-cols-3 px-6 md:grid-cols-5 md:px-8">
          {Array(5).fill(0).map((_, i) => (
            <motion.div 
              key={i} 
              style={{ borderColor: borderColor }}
              className={`border-r h-full ${i === 0 ? 'border-l' : ''} ${i >= 3 ? 'hidden md:block' : ''}`}
            ></motion.div>
          ))}
        </div>
      </div>

      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-50 hidden md:block"
        variants={variants}
        animate={cursorVariant}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      />

      {/* Navigation */}
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Hero Section */}
      <section ref={heroRef} className="h-[200vh] relative z-10">
        <div 
          className="sticky top-0 h-screen flex flex-col justify-center items-center overflow-hidden px-4" 
          style={{ 
            perspective: isMobile ? "800px" : "1200px",
            background: "linear-gradient(to bottom, #0a0a0a 0%, #0b0b0b 5%, #0d0d0d 10%, #0f0f0f 15%, #121212 20%, #161616 25%, #1a1a1a 30%, #202020 35%, #282828 40%, #333333 45%, #404040 50%, #505050 55%, #606060 60%, #757575 65%, #8a8a8a 70%, #a0a0a0 75%, #b5b5b5 80%, #c8c8c8 85%, #d8d8d8 90%, #e0e0e0 95%, #E6E1DC 100%)"
          }}
        >
          {/* Local Hero Lines - visible on gradient, below text/monitor */}
          <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="h-full w-full grid grid-cols-3 px-6 md:grid-cols-5 md:px-8">
                {Array(5).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className={`border-r border-[#E6E1DC]/10 h-full ${i === 0 ? 'border-l' : ''} ${i >= 3 ? 'hidden md:block' : ''}`}
                  ></div>
                ))}
             </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center z-30 w-full max-w-7xl mx-auto -mt-48 md:-mt-48"
          >
            <h1 
              className="text-[10vw] md:text-[7vw] leading-[0.85] font-syne uppercase tracking-tighter text-center flex flex-col items-center overflow-visible"
              onMouseEnter={textEnter} 
              onMouseLeave={textLeave}
            >
              <span className="text-[#E6E1DC] block drop-shadow-2xl font-bold py-4 -my-4">
                STRONY, KTÓRE
              </span>
              <span className="text-[#E6E1DC] block drop-shadow-2xl font-extrabold py-4 -my-4">
                ZARABIAJĄ.
              </span>
            </h1>
          </motion.div>

          {/* Hero Monitor Image */}
          <motion.div 
            style={{ 
              y: monitorY, 
              rotateX: monitorRotateX, 
              scale: monitorScale,
              transformStyle: "preserve-3d"
            }}
            className="absolute bottom-[13%] md:bottom-[-5%] left-1/2 -translate-x-1/2 w-[90%] md:w-full max-w-5xl z-30 origin-bottom flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full aspect-[1600/1128]"
            >
              {/* Monitor Frame Image */}
              <img 
                src="https://i.ibb.co/4Rs8nf7w/apple-pro-display-xdr-roundup-header-800x564.webp"
                alt="Pro Display XDR"
                className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                referrerPolicy="no-referrer"
              />
              
              {/* Screen Content Area */}
              <div 
                className="absolute overflow-hidden bg-black z-20"
                style={{
                  left: "9.25%",
                  top: "2.22%",
                  width: "81.44%",
                  height: "65.25%",
                  borderRadius: "2px"
                }}
              >
                <video 
                  ref={videoRef}
                  muted 
                  loop 
                  playsInline
                  webkit-playsinline="true"
                  disablePictureInPicture
                  disableRemotePlayback
                  className="w-full h-full object-cover"
                  style={{ backgroundColor: "#050505" }}
                >
                  <source src="https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/FILMHOMEPAGE1.mp4" type="video/mp4" />
                </video>
                {!isVideoPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
                     <button 
                       onClick={() => {
                         setIsVideoPlaying(true);
                         if (videoRef.current) {
                           videoRef.current.play();
                           videoRef.current.muted = true;
                         }
                       }}
                       className="flex items-center gap-2 bg-[#E6E1DC] text-black px-4 py-2 md:px-6 md:py-3.5 rounded-full text-[10px] md:text-xs font-sans font-bold uppercase tracking-[0.1em] hover:scale-105 transition-transform shadow-xl"
                     >
                       <Play size={12} fill="black" className="md:w-[14px] md:h-[14px]" /> WŁĄCZ WIDEO
                     </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Meta */}
          <div className="absolute bottom-0 left-0 right-0 w-full bg-[#0a0a0a] py-8 px-4 md:bg-transparent md:bottom-8 md:left-auto md:right-8 md:w-auto md:p-0 text-center md:text-right z-30 md:mix-blend-difference">
             <div className="relative inline-block">
               <h2 className="text-[15vw] md:text-[6vw] leading-none text-center md:text-right text-[#E6E1DC]/30 font-syne font-extrabold tracking-tighter">
                STUDIO
              </h2>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12vw] md:text-[4.5vw] font-birthstone text-[#E6E1DC] whitespace-nowrap z-10 pointer-events-none">
                Paweł
              </span>
             </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="pt-12 pb-12 md:py-32 px-2 md:px-8 max-w-full md:max-w-[95vw] mx-auto relative z-30 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
        >
          <div className="md:col-span-12">
            <ScrollRevealText 
              className="text-[5.2vw] md:text-5xl lg:text-6xl font-manrope font-semibold leading-[1.1] tracking-tight mb-12 text-center md:text-left w-full"
              value="Cześć, jestem Paweł. Jako niezależny twórca buduję strony, które zarabiają. Pomagam markom wyróżnić się na tle konkurencji i zamieniać ich obecność w sieci w realny zysk. Skutecznie odblokuję potencjał Twojego biznesu." 
            />
            
            <div className="w-full border-b border-current mb-12"></div>
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="max-w-2xl pb-4">
                 <h3 
                   className="text-[10vw] md:text-7xl font-syne uppercase tracking-tighter mb-8 leading-[0.8] flex flex-col items-start overflow-visible"
                   onMouseEnter={textEnter} 
                   onMouseLeave={textLeave}
                 >
                   <span className="text-[#E6E1DC] block font-bold py-2 -my-2">
                     Liczby, które
                   </span>
                   <span className="text-[#E6E1DC] block font-extrabold py-2 -my-2">
                     budują
                   </span>
                   <span className="text-[#E6E1DC] block font-extrabold py-2 -my-2 text-[0.92em]">
                     zaufanie
                   </span>
                 </h3>
                 <p className="text-xl md:text-2xl opacity-100 leading-[1.3] md:leading-relaxed font-manrope font-normal tracking-tight">
                   Ponad 8 lat doświadczenia w dostarczaniu rozwiązań cyfrowych, które realnie wpływają na rozwój biznesu moich klientów.
                 </p>
              </div>
              <ScrollCounter />
            </div>
          </div>
          
          <div className="md:col-span-12 mt-24 w-[98vw] relative left-1/2 -translate-x-1/2">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                {/* 1. Full Width Image */}
                <div className="md:col-span-12 relative aspect-[2272/1420] overflow-hidden bg-[#1a1a1a]">
                   <video 
                     src="https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/BRAZOWYMONITOR1.mp4" 
                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                     autoPlay
                     muted
                     loop
                     playsInline
                     preload="auto"
                     webkit-playsinline="true"
                     disablePictureInPicture
                     disableRemotePlayback
                   />
                </div>

                {/* 2. Left Narrow (5 cols) */}
                <div className="md:col-span-5 relative aspect-[935/1154] overflow-hidden bg-[#1a1a1a]">
                   <video 
                     src="https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/ZIELONYTELEFON1.mp4" 
                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                     autoPlay
                     muted
                     loop
                     playsInline
                     preload="auto"
                     webkit-playsinline="true"
                     disablePictureInPicture
                     disableRemotePlayback
                   />
                </div>

                {/* 3. Right Wide (7 cols) */}
                <div className="md:col-span-7 relative aspect-[1317/1154] overflow-hidden bg-[#1a1a1a]">
                   <video 
                     src="https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/POMARANCZOWYMONITOR1.mp4" 
                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                     autoPlay
                     muted
                     loop
                     playsInline
                     preload="auto"
                     webkit-playsinline="true"
                     disablePictureInPicture
                     disableRemotePlayback
                   />
                </div>

                {/* 4. Full Width Image (Repeat) */}
                <div className="md:col-span-12 relative aspect-[2272/1420] overflow-hidden bg-[#1a1a1a]">
                   <video 
                     src="https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/LAPTOPMORYTZAUTO1.mp4" 
                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                     autoPlay
                     muted
                     loop
                     playsInline
                     preload="auto"
                     webkit-playsinline="true"
                     disablePictureInPicture
                     disableRemotePlayback
                   />
                </div>

                {/* 5. Left Wide (7 cols) */}
                <div className="md:col-span-7 relative aspect-[1317/1154] overflow-hidden">
                   <video 
                     src="https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/NIEBIESKIMONITOR1.mp4" 
                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                     autoPlay
                     muted
                     loop
                     playsInline
                     webkit-playsinline="true"
                     disablePictureInPicture
                     disableRemotePlayback
                   />
                </div>

                {/* 6. Right Narrow (5 cols) */}
                <div className="md:col-span-5 relative aspect-[935/1154] overflow-hidden">
                   <video 
                     src="https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/TELEFONPINK1.mp4" 
                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                     autoPlay
                     muted
                     loop
                     playsInline
                     webkit-playsinline="true"
                     disablePictureInPicture
                     disableRemotePlayback
                   />
                </div>
             </div>
          </div>


        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="pt-16 pb-20 md:py-64 relative z-30 flex flex-col items-center justify-center text-center px-4 w-full overflow-hidden">
        <div className="relative w-full flex flex-col items-center justify-center">
          <GlobeBackground maskColor={bgColor} />
          <h2 
            className="text-[6vw] md:text-[5vw] leading-[0.85] font-syne uppercase tracking-tighter text-center flex flex-col items-center overflow-visible mb-8 relative z-10 text-[#000000]"
            onMouseEnter={textEnter} 
            onMouseLeave={textLeave}
          >
            <span className="block font-bold py-4 -my-4">
              GOTOWY/A NA DARMOWY
            </span>
            <span className="block font-extrabold py-4 -my-4">
              PROJEKT?
            </span>
          </h2>
          
          <p className="text-lg md:text-2xl text-[#333] max-w-3xl leading-snug font-manrope font-normal tracking-tight relative z-10">
            Skontaktuj się ze mną, a przygotuję dla Ciebie wstępną koncepcję i wycenę bez żadnych zobowiązań.
          </p>

          <motion.button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ backgroundColor: textColor, color: bgColor }}
            className="mt-12 px-10 py-5 rounded-full font-sans text-[11px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-3 border border-transparent relative z-10"
          >
            Napisz do mnie <ArrowUpRight size={18} />
          </motion.button>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="pt-8 pb-12 md:pt-32 md:pb-12 relative z-10 w-full">
        <div className="w-full">
          <div className="px-4 md:px-8">
            <div className="relative flex justify-center items-end border-b border-current pb-8 w-full">
              <CenterRevealText 
                text="MOJA OFERTA" 
                className="text-[7.5vw] md:text-[6vw] leading-none font-syne font-extrabold uppercase tracking-tighter text-center pb-2 text-[#000000]" 
              />
            </div>
          </div>

          <motion.div style={{ backgroundColor: bgColor }} className="w-full px-4 md:px-8 pt-16">
            <div className="flex flex-col border-t border-x border-current/20">
            {[
              { 
                title: "Strony", 
                subtitle: "internetowe",
                desc: "Nowoczesne, szybkie i responsywne wizytówki Twojego biznesu. Tworzę strony, które nie tylko wyglądają, ale przede wszystkim sprzedają.",
                includes: ["Certyfikat SSL & Domena .PL", "Optymalizacja SEO", "Wsparcie techniczne 24/7", "hosting w cenie"],
                img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
              },
              { 
                title: "Sklepy", 
                subtitle: "internetowe",
                desc: "Skuteczne platformy e-commerce nastawione na konwersję. Pełna integracja z płatnościami i kurierami.",
                includes: ["Techniczne SEO", "Integracje płatności & kurierów", "wsparcie techniczne 24/7", "certyfikat SSL & Domena .PL"],
                img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop"
              },
              { 
                title: "Reklamy", 
                subtitle: "Google",
                desc: "Precyzyjne kampanie PPC docierające do idealnych klientów. Maksymalny zwrot z inwestycji przy optymalnym budżecie.",
                includes: ["OPTYMALIZACJA BUDŻETU", "RAPORTY WYNIKÓW", "WSPARCIE TECHNICZNE 24/7", "monitoring konkurencji"],
                img: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1000&auto=format&fit=crop"
              },
              { 
                title: "Automatyzacja", 
                subtitle: "Procesów",
                desc: "Wdrażanie inteligentnych rozwiązań oszczędzających Twój czas. Chatboty, generowanie treści i analiza danych.",
                includes: ["INTELIGENTNE ODPOWIEDZI", "ANALIZA DANYCH", "CYFROWY ASYSTENT", "INTEGRACJA SYSTEMÓW"],
                img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop"
              }
            ].map((service, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group grid grid-cols-1 md:grid-cols-12 border-b border-current/20 min-h-[350px]"
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                {/* Column 1: Content */}
                <div className="md:col-span-9 border-r border-current/20 p-6 md:p-10 flex flex-col justify-center relative">
                   <span className="font-sans text-[10px] font-bold opacity-40 mb-2 tracking-[0.2em] block">0{index + 1}</span>
                   <h3 className="text-[clamp(1.5rem,6vw,6rem)] font-syne font-bold uppercase tracking-tighter mb-4 leading-[0.75] md:leading-[0.8]">
                     <span className="text-[#000000] block pb-0 pt-0">
                       {service.title}
                     </span>
                     <span className="text-[#000000] block pb-0 pt-0">
                       {service.subtitle}
                     </span>
                   </h3>
                   <p className="text-[clamp(1rem,1.5vw,1.5rem)] opacity-70 max-w-2xl leading-relaxed font-manrope font-normal tracking-tight mb-8">
                     {service.desc}
                   </p>
                   <Link
                     to={`/oferta/${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                     className="flex items-center gap-4 border border-current px-6 py-3.5 rounded-sm text-[11px] font-manrope font-medium uppercase tracking-[0.2em] hover:bg-[#141414] hover:text-[#E6E1DC] transition-all duration-300 w-fit hover:translate-x-1"
                   >
                     Dowiedz się więcej <ArrowUpRight size={16} />
                   </Link>
                </div>

                {/* Column 2: Includes */}
                <div className="md:col-span-3 p-6 md:p-10 flex flex-col justify-center bg-current/5">
                   <span className="font-manrope font-medium text-[10px] uppercase tracking-[0.15em] mb-6 opacity-40">ZAWIERA:</span>
                   <div className="flex flex-col gap-2.5">
                     {service.includes.map((item, i) => (
                       <div key={i} className="border border-current/10 bg-current/[0.03] px-4 py-2.5 text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-center hover:bg-[#141414] hover:text-[#E6E1DC] transition-colors duration-300 cursor-default">
                         {item}
                       </div>
                     ))}
                   </div>
                </div>
              </motion.div>
            ))}
            </div>
          </motion.div>
        </div>
      </section>



      {/* Clients Marquee */}
      <section className="pt-12 pb-24 overflow-hidden border-y border-[#E6E1DC]/10 relative z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
          <h3 className="text-2xl md:text-3xl font-syne font-bold uppercase tracking-tighter max-w-2xl leading-[1.1] md:leading-normal">Firmy, które zaufały mojemu doświadczeniu:</h3>
        </div>
        <div className="relative flex overflow-x-hidden">
          <motion.div 
            className="flex whitespace-nowrap items-center gap-16 px-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 35, repeat: Infinity }}
          >
            {/* Duplicate for seamless loop */}
            {Array(2).fill([
              "© MORYTZ AUTO", "Lumière Studio", "Ostoja Nieruchomości", "MindFlow", "ArchiBud Inwest", "AURA ESTATE", "Pure Derm", "Auto-Care Detailing", "SpeedWay Serwis", "Vibe Beauty", "Chroma Hair Salon"
            ]).flat().map((client, i) => (
              <div key={i} className="text-4xl md:text-6xl font-display uppercase opacity-30 hover:opacity-100 transition-opacity cursor-default py-4 leading-normal">
                {client}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 relative z-30 border-t border-current/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left Column: Title (Sticky) */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 mb-12 lg:mb-0">
              <h2 className="text-[10vw] lg:text-[4.5vw] font-syne font-bold leading-[0.9] uppercase tracking-tighter mb-6">
                CZĘSTE PYTANIA
              </h2>
              <p className="text-lg md:text-xl opacity-60 font-manrope font-normal tracking-tight max-w-[280px] leading-snug">
                Jeśli nie znalazłeś odpowiedzi na swoje pytanie, napisz do mnie bezpośrednio.
              </p>
            </div>

            {/* Right Column: Questions */}
            <div className="lg:col-span-7 flex flex-col border-t border-current/20">
              {[
                { 
                  q: "Jak wygląda współpraca?", 
                  a: "Współpracujesz bezpośrednio ze mną – nie jestem agencją. Unikasz pośredników i zbędnych kosztów. Zaczynamy od rozmowy o Twoich potrzebach, po której przygotowuję dla Ciebie darmowy projekt wstępny. Jeśli moja wizja Ci się spodoba, dopracowujemy detale i uruchamiamy stronę. Dzięki relacji 1:1 masz gwarancję błyskawicznego kontaktu 24/7 i pełnego zaangażowania."
                },
                { 
                  q: "Ile trwa stworzenie strony?", 
                  a: "Czas realizacji zależy od konkretnego projektu – zazwyczaj zamykam się w przedziale od 3 dni do maksymalnie 2 tygodni (przy bardziej rozbudowanym serwisie). Nie przeciągam terminów – jeśli dostarczysz mi materiały szybko, strona będzie gotowa ekspresowo."
                },
                { 
                  q: "Czy zajmujesz się utrzymaniem stron?", 
                  a: "Tak. Biorę na siebie całe zaplecze techniczne: szybki hosting, certyfikaty bezpieczeństwa i regularne kopie zapasowe. Ty skupiasz się na swoim biznesie, a ja pilnuję, żeby Twoja strona była szybka, bezpieczna i zawsze dostępna dla klientów."
                },
                { 
                  q: "Czy zapewniasz wsparcie techniczne po wdrożeniu?", 
                  a: "Oczywiście. Jako niezależny twórca jestem dla Ciebie dostępny 24/7. Jeśli będziesz potrzebować pilnej zmiany, nie czekasz dniami na odpowiedź z działu technicznego. Piszesz lub dzwonisz bezpośrednio do mnie i rozwiązujemy sprawę od ręki."
                },
                { 
                  q: "Ile kosztuje stworzenie strony internetowej?", 
                  a: "Każdy projekt wyceniam indywidualnie, w zależności od skomplikowania projektu. Oferuję ceny znacznie niższe niż agencje, zachowując przy tym kilkukrotnie wyższą jakość i efekty."
                },
                { 
                  q: "Jak wygląda proces płatności?", 
                  a: "Zasady są czyste i bezpieczne: najpierw przygotowuję dla Ciebie darmowy projekt wstępny. Dopiero gdy go zaakceptujesz i zobaczysz realny efekt mojej pracy, dogadujemy się co do rozliczenia. Płatność w większości przypadków jest po wdrożeniu strony. Zero ryzyka z Twojej strony!"
                }
              ].map((item, index) => (
                <FAQItem key={index} index={index} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </motion.div>
  );
}

const FAQItem = ({ index, q, a }: { key?: number, index: number, q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`border-b border-current/20 overflow-hidden transition-colors duration-500 ${isOpen ? 'bg-current/5' : 'hover:bg-current/[0.02]'}`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 md:py-8 flex items-center justify-between text-left group px-0"
      >
        <h3 className="text-lg md:text-2xl font-syne font-bold uppercase tracking-tight leading-tight">
          {q}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="flex-shrink-0 ml-4"
        >
          <Plus size={24} className="opacity-40 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="pb-8 pr-8">
              <p className="text-base md:text-lg opacity-80 leading-relaxed font-manrope font-normal tracking-tight max-w-3xl">
                {a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AboutMePage = () => {
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#E6E1DC] text-[#111] min-h-screen p-8 md:p-24 relative"
    >
      <div className="fixed top-0 left-0 w-full p-8 z-[100] pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-50 transition-opacity pointer-events-auto mix-blend-difference text-[#E6E1DC]"
        >
          <ArrowLeft size={16} /> Powrót
        </button>
      </div>
      
      <div className="max-w-4xl pt-16 md:pt-0">
        <h1 className="text-[12vw] md:text-[8vw] font-display leading-[0.8] uppercase tracking-tighter mb-12">
          O MNIE
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6 text-lg md:text-xl font-manrope font-normal opacity-70 leading-relaxed tracking-tight">
            <p>Jestem projektantem cyfrowym i deweloperem, który wierzy, że design to coś więcej niż tylko estetyka – to narzędzie do rozwiązywania problemów biznesowych.</p>
            <p>Moja przygoda z projektowaniem zaczęła się ponad 8 lat temu. Od tego czasu miałem okazję pracować z dziesiątkami marek, pomagając im wyróżnić się w cyfrowym świecie.</p>
          </div>
          <div className="space-y-6 text-lg md:text-xl font-manrope font-normal opacity-70 leading-relaxed tracking-tight">
            <p>Specjalizuję się w tworzeniu stron, które nie tylko pięknie wyglądają, ale przede wszystkim konwertują i są intuicyjne dla użytkownika.</p>
            <p>Moje podejście łączy precyzję techniczną z artystyczną wizją, co pozwala mi dostarczać unikalne rozwiązania skrojone pod konkretne potrzeby.</p>
          </div>
        </div>
        
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-current/20 pt-12">
          <div>
            <span className="font-sans text-[10px] font-bold opacity-40 uppercase block mb-2 tracking-[0.15em]">Lokalizacja</span>
            <span className="text-xl font-syne font-bold uppercase">Warszawa, PL</span>
          </div>
          <div>
            <span className="font-sans text-[10px] font-bold opacity-40 uppercase block mb-2 tracking-[0.15em]">Doświadczenie</span>
            <span className="text-xl font-syne font-bold uppercase">8+ LAT</span>
          </div>
          <div>
            <span className="font-sans text-[10px] font-bold opacity-40 uppercase block mb-2 tracking-[0.15em]">Projekty</span>
            <span className="text-xl font-syne font-bold uppercase">120+</span>
          </div>
          <div>
            <span className="font-sans text-[10px] font-bold opacity-40 uppercase block mb-2 tracking-[0.15em]">Status</span>
            <span className="text-xl font-syne font-bold uppercase">Dostępny</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProcessStep = ({ item, index, isLast }: any) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "start 40%"]
  });

  const pillBg = useTransform(scrollYProgress, [0, 1], ["#111", "#E6E1DC"]);
  const pillText = useTransform(scrollYProgress, [0, 1], ["#888", "#111"]);
  const titleColor = useTransform(scrollYProgress, [0, 1], ["#888", "#E6E1DC"]);
  const descOpacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  return (
    <div ref={ref} className={`flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0 relative ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        
        {/* Content Side */}
        <div className={`w-full md:w-1/2 pl-16 md:pl-0 mt-16 md:mt-0 ${index % 2 === 0 ? 'md:pr-24 md:text-right' : 'md:pl-24 md:text-left'}`}>
            <motion.h3 style={{ color: titleColor }} className="text-2xl md:text-5xl font-syne font-bold uppercase mb-4 tracking-tight transition-colors duration-500">{item.title}</motion.h3>
            <motion.p style={{ opacity: descOpacity }} className="font-sans font-normal text-base md:text-xl leading-relaxed tracking-tight max-w-md ml-0 md:ml-auto md:mr-0 inline-block text-left md:text-inherit transition-opacity duration-500">
                {item.desc}
            </motion.p>
        </div>

        {/* Center Pill */}
        <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 -translate-y-0 md:-translate-y-1/2 md:-translate-x-1/2 z-10">
            <motion.div 
              style={{ backgroundColor: pillBg, color: pillText }}
              className="font-sans text-[10px] font-bold px-5 py-2.5 rounded-full uppercase tracking-[0.2em] shadow-sm whitespace-nowrap transition-colors duration-500 border border-[#E6E1DC]/10"
            >
                {item.code}
            </motion.div>
        </div>

        {/* Empty Side for balance on desktop */}
        <div className="hidden md:block w-1/2"></div>
    </div>
  );
};

const TimelineProcess = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 50%", "end 50%"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const items = [
    { code: "01 - RS", title: "ROZMOWA & STRATEGIA", desc: "Omawiamy Twoje cele i potrzeby. Tworzę plan, który realnie przyciągnie nowych klientów szukających usług, które oferujesz." },
    { code: "02 - DP", title: "DARMOWY PROJEKT", desc: "Przygotowuję wstępną wizję strony bez żadnych kosztów - nic nie ryzykujesz, przy czym masz możliwość sprawdzenia moich umiejętności." },
    { code: "03 - WP", title: "Wdrożenie & Poprawki", desc: "Buduję pełną wersję witryny zoptymalizowaną pod zyski i dopracowuję każdy detal, aż będziesz w 100% zadowolony." },
    { code: "04 - US", title: "Uruchomienie & Serwis", desc: "Wrzucam stronę do sieci i zostaję Twoim wsparciem 24/7, by wszystko zawsze działało idealnie." }
  ];

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto relative">
        {/* Background Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[#E6E1DC]/10 md:-translate-x-1/2"></div>
        
        {/* Foreground Line (Animated) */}
        <motion.div 
          style={{ height: lineHeight }}
          className="absolute left-4 md:left-1/2 top-0 w-px bg-[#E6E1DC] md:-translate-x-1/2 origin-top z-0"
        />

        <div className="space-y-24 md:space-y-48 pb-24">
            {items.map((item, i) => (
                <ProcessStep key={i} item={item} index={i} isLast={i === items.length - 1} />
            ))}
        </div>
    </div>
  );
};

const AutoTypewriterText = ({ text, delay = 0, onComplete, className = "" }: { text: string, delay?: number, onComplete?: () => void, className?: string }) => {
  const lines = text.split("\n");
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
    },
  };

  return (
    <motion.div
      className={`flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
    >
      {lines.map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {line.split(" ").map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.3em]">
              {word.split("").map((char, charIndex) => (
                <motion.span
                  variants={child}
                  key={charIndex}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
          {lineIndex < lines.length - 1 && <div className="w-full h-0" />}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

const PinnedInvestmentSection = () => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const isInView = useInView(containerRef, { amount: 0.3, once: true });

  useEffect(() => {
    if (isInView && currentStep === 0) {
      setCurrentStep(1);
    }
  }, [isInView, currentStep]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const features = [
    { 
        label: "DARMOWY HOSTING", 
        icon: "01",
        description: "Zapewniam stabilny i szybki hosting dla Twojej strony przez pierwszy rok współpracy. Bez ukrytych kosztów i skomplikowanych konfiguracji."
    },
    { 
        label: "CERTYFIKAT SSL", 
        icon: "02",
        description: "Bezpieczeństwo Twoich użytkowników jest priorytetem. Każda strona otrzymuje certyfikat SSL, który buduje zaufanie i poprawia pozycję w Google."
    },
    { 
        label: "DOMENA .PL", 
        icon: "03",
        description: "Pomagam w wyborze i rejestracji idealnej domeny .pl, która stanie się Twoją unikalną wizytówką w sieci."
    },
    { 
        label: "OPTYMALIZACJA SEO", 
        icon: "04",
        description: "Twoja strona będzie od początku zoptymalizowana pod kątem wyszukiwarek, co ułatwi potencjalnym klientom znalezienie Twojego biznesu."
    },
    { 
        label: "OPIEKA TECHNICZNA", 
        icon: "05",
        description: "Nie zostawiam Cię po wdrożeniu strony. Oferuję wsparcie techniczne i regularne aktualizacje, aby Twoja strona zawsze działała bez zarzutu."
    }
  ];

  return (
    <section ref={containerRef} className="relative bg-[#111] text-[#E6E1DC]">
      <div className="relative">
        <div className="min-h-screen flex flex-col justify-start overflow-hidden w-full relative">
            
            {/* Header Bar - Transparent */}
            <div className="relative z-30 w-full py-8 md:py-12 px-4 md:px-24 shrink-0 border-b border-[#E6E1DC]/10">
                <h2 className="text-[6vw] md:text-[3.5vw] font-syne font-bold uppercase tracking-tighter text-center text-[#E6E1DC] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                TWÓJ BIZNES NA WYŻSZYM POZIOMIE.
                </h2>
            </div>

            {/* Scrolling Texts Container */}
            <div className="relative z-10 w-full flex-grow overflow-visible px-4 md:px-10 pb-20">
                <div 
                    className="flex flex-col gap-10 md:gap-16 pb-0 pt-12 md:pt-24 mix-blend-normal"
                >
                    {/* Main Text - Centered */}
                    <div className="w-[95%] md:w-[85%] lg:w-[80%] self-center text-[4.2vw] md:text-[2.5vw] lg:text-[2.2vw] font-manrope font-light tracking-tight leading-[1.1] text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-[#E6E1DC]">
                        Tworzę narzędzie nastawione na Twój zysk. Zamiast wisieć w sieci, zacznij zgarniać zlecenia. Wyciągam Twoją firmę na szczyt wyszukiwarki i wyróżniam Cię na tle konkurencji, byś to Ty był pierwszym wyborem klienta.
                    </div>

                    {/* Separator */}
                    <div className="w-12 md:w-20 h-[1px] bg-[#E6E1DC]/30 mx-auto" />

                    {/* Secondary Text - Centered */}
                    <div className="w-[95%] md:w-[85%] lg:w-[80%] self-center text-center text-[4.2vw] md:text-[2.5vw] lg:text-[2.2vw] font-manrope font-light tracking-tight leading-[1.1] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-[#E6E1DC] whitespace-pre-line">
                        {"Traktuj swoją stronę jako inwestycję, która\nma zarabiać, a nie generować koszty. Dzięki współpracy ze mną zyskujesz narzędzie, które buduje Twój autorytet i realnie domyka sprzedaż."}
                    </div>

                    {/* New Centered Texts */}
                    <div className="flex flex-col items-center gap-6 mt-4 md:mt-6 border-t border-[#E6E1DC]/30 pt-12 md:pt-24">
                        <div className="w-full md:w-[70%] text-center text-[5vw] sm:text-[4vw] md:text-[3vw] lg:text-[2.8vw] font-syne font-bold uppercase tracking-tighter leading-[1.3] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-[#E6E1DC]">
                            Gotów na krok do przodu?
                        </div>

                        <div className="w-[90%] sm:w-[75%] md:w-[60%] lg:w-[50%] text-center text-[4vw] sm:text-[2.8vw] md:text-[1.8vw] lg:text-[1.4vw] font-manrope font-light tracking-tight leading-[1.4] [text-shadow:_0_2px_4px_rgb(0_0_0_/_70%)] text-[#E6E1DC]">
                            Tam, gdzie agencje szukają dodatkowych opłat, ja daję Ci gotowe rozwiązanie w cenie. Zdejmuję z Ciebie techniczne koszty, byś mógł od razu skupić się na zarabianiu, a nie na kolejnych fakturach.
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Features List - Outside Sticky - Scrolls naturally after texts */}
      <div className="relative z-20 py-8 md:py-12 text-[#E6E1DC]">
          <div className="flex flex-col w-full max-w-5xl mx-auto border-t border-[#E6E1DC]/20 px-4 md:px-0">
              {features.map((feature, i) => (
                  <div
                      key={i}
                      className="group flex flex-col border-b border-[#E6E1DC]/20 transition-colors duration-500 cursor-pointer overflow-hidden"
                      onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  >
                      <div className="flex items-center justify-between py-5 md:py-8 px-4 md:px-8 group-hover:bg-[#E6E1DC] group-hover:text-[#111] transition-colors duration-500">
                          <div className="flex items-center gap-4 md:gap-12 flex-1 pr-4">
                              <span className="text-[12px] md:text-[14px] font-mono opacity-60 group-hover:opacity-100 shrink-0">{feature.icon}</span>
                              <span className="text-[16px] sm:text-[18px] md:text-[28px] lg:text-[32px] font-syne font-bold tracking-tight uppercase text-[#E6E1DC] group-hover:text-[#111] leading-tight">{feature.label}</span>
                          </div>
                          <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0">
                              <span className="text-[8px] md:text-[10px] font-mono opacity-40 group-hover:opacity-100 transition-opacity text-right leading-tight">
                                  <span className="block md:inline">KLIKNIJ ABY</span>
                                  <span className="hidden md:inline"> </span>
                                  <span className="block md:inline">ROZWINĄĆ</span>
                              </span>
                              <div>
                                  <Plus className="opacity-40 group-hover:opacity-100 transition-all text-[#E6E1DC] group-hover:text-[#111]" size={isMobile ? 20 : 32} />
                              </div>
                          </div>
                      </div>
                      
                      {expandedIndex === i && (
                          <div className="bg-[#E6E1DC]/5">
                              <div className="px-8 md:px-24 py-8 md:py-12">
                                  <p className="text-[16px] md:text-[20px] lg:text-[22px] font-manrope font-normal leading-relaxed max-w-2xl text-[#E6E1DC]">
                                      {feature.description}
                                  </p>
                              </div>
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>
    </section>
  );
};

const SpiralImageCylinder = ({ scrollYProgress }: { scrollYProgress: any }) => {
  // Responsive check
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-rotation state
  const autoRotation = useMotionValue(0);
  
  // Animate auto-rotation: 360 degrees every 120 seconds (very slow)
  useAnimationFrame((time) => {
    const degrees = (time / 120000) * -360; 
    autoRotation.set(degrees);
  });

  // Rotation based on scroll - finishes later (0.9) to allow more development
  const scrollRotation = useTransform(scrollYProgress, [0, 0.9], [-20, -120]); 
  
  // Combine scroll rotation and auto-rotation
  const rotation = useTransform([scrollRotation, autoRotation], ([s, a]) => (s as number) + (a as number));
  
  // Move up based on scroll - moves further up (-100vh)
  // Mobile: 35vh, Desktop: 60vh (original)
  const startY = isMobile ? "35vh" : "60vh";
  const translateY = useTransform(scrollYProgress, [0, 0.9], [startY, "-100vh"]);

  const baseImages = [
    "https://i.imgur.com/RBxFJ57.jpeg",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558655146-d09347e0b7a8?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1481487484168-9b930d5b7d9d?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400&auto=format&fit=crop"
  ];

  // Triple the images for a longer spiral
  const images = [...baseImages, ...baseImages, ...baseImages];

  // Configuration
  const radius = 380; 
  const imgWidth = 160; 
  const imgHeight = 220; 
  
  // Slicing configuration for curved effect
  const segments = 5; // Reduced from 8 to 5 for performance
  const segmentWidth = imgWidth / segments;
  
  // Calculate exact angle to prevent gaps: (Width / Circumference) * 360
  const anglePerImage = (imgWidth / (2 * Math.PI * radius)) * 360; 
  const anglePerSegment = anglePerImage / segments;
  
  const verticalStep = 17; 
  const segmentVerticalStep = verticalStep / segments;
  
  // Calculate the slope angle to align images like a ribbon
  // tan(theta) = verticalStep / imgWidth
  const slopeAngle = (Math.atan(verticalStep / imgWidth) * 180) / Math.PI;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden" style={{ perspective: "2000px" }}>
        {/* Outer wrapper for vertical movement - unscaled to preserve full screen travel */}
        <motion.div 
            className="relative w-0 h-0"
            style={{ 
                y: translateY,
                transformStyle: "preserve-3d"
            }}
        >
            {/* Scaling wrapper for responsive size - scales down on mobile */}
            <div className="w-0 h-0 scale-[0.4] md:scale-100" style={{ transformStyle: "preserve-3d" }}>
                {/* Inner wrapper for rotation */}
                <motion.div 
                    className="relative w-0 h-0"
                    style={{ 
                        rotateY: rotation,
                        rotateZ: -5, // Slight tilt for global perspective
                        transformStyle: "preserve-3d",
                        willChange: "transform" // Hint to browser for optimization
                    }}
                >
                    {images.map((src, i) => (
                        <React.Fragment key={i}>
                            {Array.from({ length: segments }).map((_, j) => {
                                const globalIndex = i * segments + j;
                                const angle = globalIndex * anglePerSegment;
                                // Calculate Y position for this specific slice to create a smooth spiral
                                const y = (globalIndex * segmentVerticalStep) - (images.length * segments * segmentVerticalStep) / 2;
                                
                                return (
                                    <div 
                                        key={`${i}-${j}`}
                                        className="absolute top-0 left-0 backface-visible bg-[#111]"
                                        style={{
                                            width: `${segmentWidth + 1}px`, // +1px to prevent sub-pixel gaps
                                            height: `${imgHeight}px`,
                                            // Apply rotateZ(slopeAngle) to align corners
                                            transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px) translateY(${y}px) rotateZ(${slopeAngle}deg)`,
                                            backgroundImage: `url(${src})`,
                                            backgroundSize: `${imgWidth}px ${imgHeight}px`,
                                            backgroundPosition: `${-j * segmentWidth}px 0px`,
                                            filter: "brightness(0.9) contrast(1.1)"
                                        }}
                                    />
                                )
                            })}
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    </div>
  );
};

const PinnedProjectsShowcase = () => {
    const containerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // 9 projects organized in 3 staggered "waves" or rows with variable speeds
    const projects = [
        // Wave 1 - Starts early
        // Left: Fastest, Right: Medium, Middle: Slowest
        { url: "https://i.imgur.com/s7YNuCH.jpg", title: "Mobile App Design", x: "5%", start: "120vh", end: "-450vh" },
        { url: "https://i.imgur.com/uWpD7Tt.jpg", title: "Social Platform", x: "38%", start: "140vh", end: "-280vh" },
        { url: "https://i.imgur.com/ht7UQn4.jpg", title: "E-commerce App", x: "70%", start: "130vh", end: "-380vh" },
        
        // Wave 2 - Middle section
        { url: "https://i.imgur.com/Y46chbj.jpg", title: "Fintech Solution", x: "12%", start: "260vh", end: "-320vh" },
        { url: "https://i.imgur.com/RoUixxo.jpg", title: "Health & Fitness", x: "45%", start: "280vh", end: "-150vh" },
        { url: "https://i.imgur.com/LseZjwQ.jpg", title: "Travel Guide", x: "75%", start: "270vh", end: "-250vh" },
        
        // Wave 3 - Starts late
        { url: "https://i.imgur.com/tz8K11j.jpg", title: "Food Delivery", x: "2%", mx: "5%", start: "400vh", end: "-180vh", mStart: "400vh", mEnd: "-180vh" },
        { url: "https://i.imgur.com/Ag3JShE.jpg", title: "Real Estate", x: "36%", mx: "36.5%", start: "420vh", end: "-20vh", mStart: "440vh", mEnd: "-120vh" },
        { url: "https://i.imgur.com/LGcC83e.jpg", title: "Booking System", x: "78%", mx: "57.5%", start: "410vh", end: "-100vh", mStart: "480vh", mEnd: "-80vh" }
    ];

    return (
        <div ref={containerRef} className={`relative ${isMobile ? 'h-[550vh]' : 'h-[800vh]'} border-t border-[#E6E1DC]/10`}>
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center">
                {/* Background Text & Number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                    <motion.div 
                        style={{ 
                            scale: useTransform(scrollYProgress, [0, 1], isMobile ? [0.63, 0.85] : [0.85, 1.15])
                        }}
                        className="relative flex flex-col items-center justify-center"
                    >
                        <motion.span 
                            style={{ 
                                opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.03, 0.1, 0.03])
                            }}
                            className="text-[50vw] md:text-[45vw] font-syne font-black leading-none text-[#E6E1DC] select-none absolute z-0 flex items-center justify-center"
                        >
                            <SlotCounter value={87} />
                        </motion.span>
                        
                            <h2 className="relative z-10 text-3xl md:text-8xl font-syne font-extrabold uppercase tracking-tighter text-center leading-none text-[#E6E1DC] drop-shadow-2xl">
                            WYKONANE<br/>PROJEKTY
                        </h2>
                    </motion.div>
                </div>

                {/* Floating Images Container */}
                <div className="absolute inset-0 w-full h-full z-10">
                    {projects.map((item, i) => {
                        // Movement from start position to end position over 0-1 progress
                        const y = useTransform(
                            scrollYProgress, 
                            [0, 1], 
                            [
                                isMobile ? (item.mStart || item.start) : item.start, 
                                isMobile ? (item.mEnd || item.end) : item.end
                            ]
                        );
                        
                        // Smooth fade in only
                        const opacity = useTransform(
                            scrollYProgress,
                            [0, 0.05],
                            [0, 1]
                        );

                        return (
                            <motion.div
                                key={i}
                                style={{ 
                                    y, 
                                    opacity,
                                    left: isMobile ? (item.mx || `calc(${item.x} * 0.7 + 5%)`) : item.x,
                                }}
                                className="absolute w-[30vw] md:w-[20vw] min-w-[120px] md:min-w-[180px] overflow-hidden bg-[#111] border border-[#E6E1DC]/10 shadow-2xl z-20 flex items-center justify-center"
                            >
                                <motion.img 
                                    src={item.url} 
                                    alt={item.title}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-auto object-contain opacity-100 block"
                                />
                                <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#E6E1DC]/20"></div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const WordFlipAnimation = () => {
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const wordArrayRef = useRef<HTMLSpanElement[][]>([]);
  const currentWordRef = useRef(0);

  useEffect(() => {
    const words = wordsRef.current;
    wordArrayRef.current = [];
    currentWordRef.current = 0;
    
    words[0].style.opacity = '1';
    words.forEach(word => {
        const content = word.innerText;
        word.innerHTML = '';
        const letters: HTMLSpanElement[] = [];
        for (let i = 0; i < content.length; i++) {
            const char = content.charAt(i);
            if (char === ' ') {
                word.appendChild(document.createTextNode('\u00A0'));
                continue;
            }
            const letter = document.createElement('span');
            letter.className = 'letter';
            letter.innerText = char;
            word.appendChild(letter);
            letters.push(letter);
        }
        wordArrayRef.current.push(letters);
    });

    const changeWord = () => {
        const cw = wordArrayRef.current[currentWordRef.current];
        const nw = currentWordRef.current == words.length - 1 ? wordArrayRef.current[0] : wordArrayRef.current[currentWordRef.current + 1];
        
        cw.forEach((letter, i) => setTimeout(() => letter.className = 'letter out', i * 80));
        
        nw.forEach((letter, i) => {
            letter.className = 'letter behind';
            letter.parentElement!.style.opacity = '1';
            setTimeout(() => letter.className = 'letter in', 340 + (i * 80));
        });
        
        currentWordRef.current = (currentWordRef.current == wordArrayRef.current.length - 1) ? 0 : currentWordRef.current + 1;
    };

    const interval = setInterval(changeWord, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center mt-2 md:mt-4 font-syne font-bold uppercase tracking-tighter text-[inherit]">
        <div className="text relative w-[450px] md:w-[800px] flex justify-center mt-2 md:mt-0 md:text-4xl">
          <span className="word wisteria" ref={el => el && (wordsRef.current[0] = el)}>pozycjonują wyżej w sieci.</span>
          <span className="word belize" ref={el => el && (wordsRef.current[1] = el)}>wyróżniają na tle konkurencji.</span>
          <span className="word pomegranate" ref={el => el && (wordsRef.current[2] = el)}>pozyskują nowych klientów.</span>
        </div>
    </div>
  );
};

const InteractiveGridBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  return (
    <div 
      className="absolute inset-0 z-0 overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.2) 0%, transparent 300px), linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px'
        }}
      />
    </div>
  );
};

const WebsitesPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef(null);
  const cardsScrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (cardsScrollRef.current) {
      const isMobile = window.innerWidth < 1024;
      const scrollAmount = isMobile ? window.innerWidth * 0.85 : 480;
      cardsScrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (cardsScrollRef.current) {
      const isMobile = window.innerWidth < 1024;
      const scrollAmount = isMobile ? window.innerWidth * 0.85 : 480;
      cardsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#E6E1DC] text-[#111] min-h-screen font-sans relative z-10"
    >
        {/* Premium Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Simple solid background */}
            <div className="absolute inset-0 bg-[#E6E1DC]" />
            {/* Local Hero Lines - matching homepage style but adapted for light bg */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-100">
               <div className="h-full w-full grid grid-cols-3 px-6 md:grid-cols-5 md:px-8">
                  {Array(5).fill(0).map((_, i) => (
                    <div 
                      key={i} 
                      className={`border-r border-[#111]/20 h-full ${i === 0 ? 'border-l' : ''} ${i >= 3 ? 'hidden md:block' : ''}`}
                    ></div>
                  ))}
               </div>
            </div>
        </div>

        {/* Hero Section Wrapper */}
        <div className="relative min-h-screen flex flex-col justify-center items-center px-4 md:px-24 overflow-hidden z-10">
                <div className="relative z-10 w-full text-[#111] flex flex-col md:grid md:grid-cols-2 gap-12 items-center pl-0 md:pl-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center w-full flex flex-col items-center md:items-center md:pl-8 pt-12 md:pt-0 order-1"
                    >
                        <h1 className="leading-[0.85] font-syne uppercase tracking-tighter flex flex-col items-center md:items-center overflow-visible text-[#000000] mt-12 md:mt-0">
                            <span className="text-[8vw] md:text-[5vw] block drop-shadow-2xl font-bold py-2 -my-2 whitespace-nowrap text-center">
                                STRONY DLA FIRM,
                            </span>
                            <span className="text-[8vw] md:text-[5vw] block drop-shadow-2xl font-bold py-2 -my-2 whitespace-nowrap text-center">
                                KTÓRE
                            </span>
                        </h1>
                        
                        <div className="order-2">
                            <WordFlipAnimation />
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="max-w-4xl mt-8 md:mt-12 text-center md:text-center w-full flex flex-col items-center md:items-center px-0 md:px-0 order-3"
                        >
                            <p className="text-[18px] md:text-[26px] font-manrope font-light leading-snug text-[#000000] tracking-tight text-center w-full">
                                Tworzę strony, które dominują w Google i generują zlecenia. Zapewniam przewagę nad konkurencją oraz rozwiązania, które <span className="font-bold">realnie zwiększają</span> Twoje przychody.
                            </p>
                        </motion.div>
                    </motion.div>
                    
                    <div className="flex flex-col items-center md:items-center gap-0 md:gap-8 pr-0 md:pr-16 order-2 md:order-2">
                        <div className="flex justify-center scale-[0.6] md:scale-100 mt-0 md:mt-0 mb-0 md:mb-0">
                            <PhoneAnimation />
                        </div>
                        <div className="flex flex-col items-center gap-2 text-[12px] md:text-sm font-syne font-bold uppercase tracking-widest text-black text-center relative z-20 pb-20 md:pb-0 mt-8 md:mt-0">
                            <span className="opacity-90 drop-shadow-sm">Zrealizowane projekty w 11+ krajach</span>
                            <div className="w-16 h-[2px] bg-black opacity-90"></div>
                            <span className="opacity-90 drop-shadow-sm">Rekordowy wzrost: +120%</span>
                        </div>
                    </div>
                </div>
            </div>

        {/* Scrolling Content Wrapper */}
        <div className="relative z-30 bg-[#E6E1DC]">
            {/* Investment Section */}
            <PinnedInvestmentSection />

            {/* Dark Mode Wrapper for the rest of the page */}
            <div 
                className="text-[#E6E1DC] relative z-10 font-syne"
                style={{ background: "linear-gradient(to bottom, #111 0%, #111 40%, #333 100%)" }}
            >
                {/* Why Me Section */}
                <section className="pt-16 md:pt-24 lg:pt-32 pb-24 md:pb-32 border-t border-[#E6E1DC]/10 overflow-hidden relative">
                    <div className="max-w-[1920px] mx-auto h-full flex flex-col justify-center">
                        <div className="flex flex-col lg:flex-row h-full items-center">
                            {/* Left Column - Text */}
                            <div className="w-full lg:w-1/2 px-4 md:px-12 lg:pl-24 flex flex-col justify-center relative z-10 mb-12 lg:mb-0">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-1 w-12 md:w-16 bg-gradient-to-r from-[#E6E1DC]/80 to-transparent"></div>
                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-syne font-medium uppercase tracking-tight">
                                        CZYM SIĘ
                                    </h2>
                                </div>
                                <h2 className="text-[7vw] sm:text-[7vw] md:text-[5vw] lg:text-[2.8vw] xl:text-[3.2vw] leading-[0.85] font-syne font-extrabold uppercase tracking-tighter mb-8 whitespace-nowrap">
                                    WYRÓŻNIAM
                                </h2>
                                
                                <p className="font-sans text-[16px] md:text-[18px] opacity-80 max-w-md mb-10 leading-relaxed tracking-tight">
                                    Nie jestem agencją, dlatego stawiam na partnerstwo i konkret. Przygotuję dla Ciebie darmowy projekt poglądowy, byś mógł sprawdzić moją koncepcję jeszcze przed startem prac. Zyskujesz bezpośredni kontakt z twórcą i rozwiązania dopasowane do Twoich potrzeb.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                                    <button 
                                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="group relative px-8 py-3.5 bg-transparent text-[#E6E1DC] font-sans text-[11px] font-bold uppercase tracking-[0.2em] overflow-hidden transition-all hover:bg-[#E6E1DC] hover:text-black"
                                    >
                                        <div className="absolute inset-0 border border-[#E6E1DC]/30" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}></div>
                                        <span className="relative z-10">SKONTAKTUJ SIĘ</span>
                                    </button>

                                    {/* Navigation Arrows - Desktop */}
                                    <div className="hidden lg:flex gap-4">
                                        <button 
                                            onClick={scrollLeft}
                                            className="w-10 h-10 border border-[#E6E1DC]/20 flex items-center justify-center hover:bg-[#E6E1DC] hover:text-black transition-colors"
                                        >
                                            <ArrowLeft size={16} />
                                        </button>
                                        <button 
                                            onClick={scrollRight}
                                            className="w-10 h-10 border border-[#E6E1DC]/20 flex items-center justify-center hover:bg-[#E6E1DC] hover:text-black transition-colors"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Scroll Container */}
                            <div className="w-full lg:w-1/2 min-w-0 flex flex-col">
                                <div 
                                    ref={cardsScrollRef}
                                    className="flex overflow-x-auto pb-6 lg:pb-12 gap-6 md:gap-8 snap-x snap-mandatory scrollbar-hide px-4 lg:px-0"
                                >
                                    {[
                                        { num: "01", label: "RELACJA", title: ["PARTNER", "NIE AGENCJA"], desc: "Pracujesz bezpośrednio z twórcą. Brak głuchych telefonów, brak account managerów. Płacisz za moją ekspertyzę." },
                                        { num: "02", label: "WYNIKI", title: ["REALNE", "EFEKTY"], desc: "Nie tworzę tylko ładnych obrazków. Moje projekty są nastawione na konwersję i realizację Twoich celów biznesowych." },
                                        { num: "03", label: "KONTAKT", title: ["POMOC", "BEZ PRZERWY"], desc: "Masz mój prywatny numer. Problemy rozwiązujemy od ręki. Relacja 1:1 to gwarancja pełnego zaangażowania." },
                                        { num: "04", label: "WIZJA", title: ["DARMOWY", "PROJEKT"], desc: "Nie kupujesz kota w worku. Przygotuję wstępny projekt strony głównej bezpłatnie, zanim podejmiesz decyzję o współpracy." }
                                    ].map((feat, i) => (
                                        <div 
                                            key={i} 
                                            className="min-w-[85vw] md:min-w-[400px] lg:min-w-[450px] bg-[#E6E1DC] text-black p-6 md:p-10 flex flex-col h-[360px] md:h-[460px] relative snap-center group transition-transform hover:-translate-y-2 duration-300 first:ml-0"
                                            style={{
                                                clipPath: "polygon(20px 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)"
                                            }}
                                        >
                                            {/* Card Header */}
                                            <div className="flex items-center gap-3 font-sans text-[10px] font-bold tracking-[0.2em] mb-4 md:mb-6 opacity-40">
                                                <span className="font-bold">{feat.label}</span>
                                                <div className="h-[1px] w-8 bg-black"></div>
                                                <span>{feat.num}</span>
                                            </div>

                                            {/* Card Title */}
                                            <h3 className="text-xl sm:text-2xl md:text-3xl font-syne font-extrabold uppercase leading-[0.9] mb-3 md:mb-4">
                                                {feat.title.map((line, k) => (
                                                    <span key={k} className="block whitespace-nowrap">{line}</span>
                                                ))}
                                            </h3>

                                            {/* Card Description */}
                                            <div className="mt-2 md:mt-4 mb-4">
                                                <p className="font-sans text-[14px] md:text-lg leading-relaxed opacity-90 max-w-xs tracking-tight">
                                                    {feat.desc}
                                                </p>
                                            </div>

                                            {/* Decorative Barcode */}
                                            <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 flex gap-1 h-6 items-end opacity-40">
                                                {[...Array(6)].map((_, j) => (
                                                    <div key={j} className="w-[2px] bg-black" style={{ height: `${Math.random() * 100}%` }}></div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Navigation Arrows - Mobile */}
                                <div className="flex lg:hidden gap-4 px-4 mt-2 justify-center">
                                    <button 
                                        onClick={scrollLeft}
                                        className="w-10 h-10 border border-[#E6E1DC]/20 flex items-center justify-center hover:bg-[#E6E1DC] hover:text-black transition-colors"
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                    <button 
                                        onClick={scrollRight}
                                        className="w-10 h-10 border border-[#E6E1DC]/20 flex items-center justify-center hover:bg-[#E6E1DC] hover:text-black transition-colors"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Projects Stats & Showcase Section */}
                <PinnedProjectsShowcase />

                {/* For Whom Section */}
                <section className="py-32 px-4 md:px-24 border-t border-[#E6E1DC]/10">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-16 items-start">
                             <div className="w-full md:w-1/3 md:sticky md:top-32">
                                <h2 className="text-[8vw] md:text-6xl font-syne font-extrabold uppercase tracking-tighter mb-6 break-words">Dla kogo?</h2>
                                <p className="font-manrope text-lg text-[#E6E1DC]/80 tracking-tight">Idealny wybór dla tych, którzy nie uznają kompromisów w kwestii jakości.</p>
                            </div>
                            <div className="w-full md:w-2/3 space-y-12">
                                {[
                                    { title: "Małe i średnie firmy", desc: "Właściciele, którzy chcą, aby strona w końcu zaczęła zarabiać, a nie tylko „wisieć” w sieci." },
                                    { title: "Modernizacja", desc: "Przedsiębiorcy, których obecna witryna jest przestarzała, wolna, nie wyświetla się poprawnie w sieci i nie generuje oczekiwanych dochodów." },
                                    { title: "Startupy", desc: "Firmy, które potrzebują nowoczesnego wizerunku, by budować zaufanie od pierwszego kliknięcia." }
                                ].map((item, i) => (
                                    <div key={i} className="group cursor-default border-b border-[#E6E1DC]/10 pb-12 last:border-0 flex gap-8">
                                        <span className="font-syne text-sm md:text-base opacity-30 mt-2">0{i + 1}</span>
                                        <div>
                                            <h3 className="text-3xl md:text-4xl font-syne font-bold uppercase mb-4 group-hover:translate-x-2 transition-transform duration-500">{item.title}</h3>
                                            <p className="font-manrope text-lg md:text-xl text-[#E6E1DC]/70 max-w-xl group-hover:translate-x-2 transition-transform duration-500 delay-75 tracking-tight leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Process Section */}
                <section className="py-32 px-4 md:px-24 border-t border-[#E6E1DC]/10">
                    <h2 className="text-[8vw] md:text-6xl font-syne font-extrabold uppercase tracking-tighter mb-32 text-center break-words">Proces Tworzenia</h2>
                    <TimelineProcess />
                </section>

                {/* Clients Marquee */}
                <section className="pt-12 pb-24 overflow-hidden border-y border-[#E6E1DC]/10 relative z-30">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
                    <h3 className="text-2xl md:text-3xl font-syne font-bold uppercase tracking-tighter max-w-2xl leading-[1.1] md:leading-normal">Firmy, które zaufały mojemu doświadczeniu:</h3>
                    </div>
                    <div className="relative flex overflow-x-hidden">
                    <motion.div 
                        className="flex whitespace-nowrap items-center gap-16 px-8"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ ease: "linear", duration: 35, repeat: Infinity }}
                    >
                        {/* Duplicate for seamless loop */}
                        {Array(2).fill([
                        "© MORYTZ AUTO", "Lumière Studio", "Ostoja Nieruchomości", "MindFlow", "ArchiBud Inwest", "AURA ESTATE", "Pure Derm", "Auto-Care Detailing", "SpeedWay Serwis", "Vibe Beauty", "Chroma Hair Salon"
                        ]).flat().map((client, i) => (
                        <div key={i} className="text-4xl md:text-6xl font-display uppercase opacity-30 hover:opacity-100 transition-opacity cursor-default py-4 leading-normal">
                            {client}
                        </div>
                        ))}
                    </motion.div>
                    </div>
                </section>

                {/* CTA Section (Replaced with Globe version) */}
                <section className="pt-16 pb-20 md:py-64 relative z-30 flex flex-col items-center justify-center text-center px-4 w-full border-t border-[#E6E1DC]/10 overflow-hidden">
                    <div className="relative w-full flex flex-col items-center justify-center">
                        <GlobeBackground maskColor="transparent" />
                        <h2 className="text-[6vw] md:text-[5vw] leading-[0.85] font-syne uppercase tracking-tighter text-center flex flex-col items-center overflow-visible mb-8 relative z-10 text-[#E6E1DC]">
                            <span className="block font-bold py-4 -my-4">
                                GOTOWY/A NA DARMOWY
                            </span>
                            <span className="block font-extrabold py-4 -my-4">
                                PROJEKT?
                            </span>
                        </h2>
                        
                        <p className="text-lg md:text-2xl text-[#ccc] max-w-3xl leading-snug font-manrope font-normal tracking-tight relative z-10">
                            Skontaktuj się ze mną, a przygotuję dla Ciebie wstępną koncepcję i wycenę bez żadnych zobowiązań.
                        </p>

                        <a href="#contact" onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                        }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-12 px-10 py-5 rounded-full font-sans text-[11px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-3 border border-transparent relative z-10 bg-[#E6E1DC] text-[#111] hover:bg-[#E6E1DC]"
                            >
                                Napisz do mnie <ArrowUpRight size={18} />
                            </motion.button>
                        </a>
                    </div>
                </section>

                {/* Footer with Parallax */}
                <Footer />
            </div>
        </div>

        {/* Navigation */}
        <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </motion.div>
  );
};

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  if (serviceId === 'strony') {
    return <WebsitesPage />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#E6E1DC] text-[#111] min-h-screen relative flex items-center justify-center overflow-hidden"
    >
      {/* Background Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-100">
         <div className="h-full w-full grid grid-cols-3 px-6 md:grid-cols-5 md:px-8">
            {Array(5).fill(0).map((_, i) => (
              <div 
                key={i} 
                className={`border-r border-[#111]/20 h-full ${i === 0 ? 'border-l' : ''} ${i >= 3 ? 'hidden md:block' : ''}`}
              ></div>
            ))}
         </div>
      </div>
      
{/* Rotating Circle */}
<div className="relative z-10 flex items-center justify-center">
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
    className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] relative"
  >
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <path
        id="circlePath"
        d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
        fill="transparent"
      />
      <text className="text-[6px] font-syne font-bold uppercase tracking-[0.50em] fill-[#111]">
        <textPath 
          href="#circlePath" 
          startOffset="0%" 
          textLength="219.9" 
          lengthAdjust="spacing"
        >
          SKONTAKTUJ SIĘ - JUŻ WKRÓTCE - SKONTAKTUJ SIĘ - JUŻ WKRÓTCE - 
        </textPath>
      </text>
    </svg>
  </motion.div>
</div>

      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </motion.div>
  );
};

const Footer = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-200, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('pawel.webdev@protonmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    const formData = new FormData(e.currentTarget);
    
    // Klucz dostępu Web3Forms - dodaj go w pliku .env jako VITE_WEB3FORMS_ACCESS_KEY
    const accessKey = (import.meta as any).env.VITE_WEB3FORMS_ACCESS_KEY;
    
    if (!accessKey) {
      alert("Brak klucza Web3Forms! Dodaj VITE_WEB3FORMS_ACCESS_KEY w ustawieniach (Environment Variables).");
      setFormStatus('error');
      return;
    }

    formData.append("access_key", accessKey);
    formData.append("subject", "Nowa wiadomość z formularza kontaktowego!");
    formData.append("from_name", "Portfolio - Formularz");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setFormStatus('success');
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setFormStatus('idle'), 5000);
      } else {
        setFormStatus('error');
      }
    } catch (err) {
      setFormStatus('error');
    }
  };

  return (
    <footer 
      ref={containerRef}
      id="contact" 
      className="text-[#E6E1DC] pt-32 pb-0 relative overflow-hidden z-0 min-h-screen flex flex-col justify-between"
      style={{ 
        background: "linear-gradient(to bottom, #111111 0%, #0a0a0a 100%)"
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-full z-0 opacity-10 pointer-events-none hidden md:block">
         <div className="grid grid-cols-4 h-full border-x border-[#333]">
            <div className="border-r border-[#333]"></div>
            <div className="border-r border-[#333]"></div>
            <div className="border-r border-[#333]"></div>
            <div></div>
         </div>
      </div>

      <motion.div 
        style={{ y, opacity }}
        className="max-w-7xl mx-auto relative z-10 px-4 md:px-8 flex-grow flex flex-col justify-center w-full"
      >
        <div className="flex flex-col mb-24 items-center w-full">
          <h2 className="text-[8vw] md:text-[6vw] leading-none font-display uppercase tracking-tighter opacity-30 mb-20 -mt-10 md:-mt-20 text-center w-full">
            © DESIGN BY PAWEŁ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">
            {/* Left: Contact Info */}
            <div className="flex flex-col items-center overflow-hidden w-full text-center">
              <div 
                className="text-[12vw] md:text-6xl lg:text-8xl font-syne font-bold uppercase tracking-tighter leading-none mb-8 break-all max-w-full cursor-default"
              >
                KONTAKT
              </div>
              <div className="flex flex-col gap-4 font-sans text-[4.5vw] md:text-xl uppercase tracking-[0.1em] font-semibold opacity-70 items-center w-full">
                <div className="flex items-center gap-3 justify-center w-full">
                  <button onClick={handleCopy} className="hover:text-white transition-colors whitespace-nowrap text-[3.2vw] sm:text-[3.5vw] md:text-xl cursor-pointer">
                    {copied ? "SKOPIOWANO!" : "pawel.webdev@protonmail.com"}
                  </button>
                  <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Skopiuj email">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 justify-center w-full">
                  <a href="tel:+48795042610" className="hover:text-white transition-colors whitespace-nowrap">+48 795 042 610</a>
                  <a href="tel:+48795042610" className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Zadzwoń">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
                
                <div className="mt-8 flex flex-col gap-4 text-sm md:text-base font-bold opacity-60 font-sans tracking-[0.15em] items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    <span>DOSTĘPNY NA DARMOWY PROJEKT</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4" />
                    <span>DZIAŁAM GLOBALNIE</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4" />
                    <span>LUBLIN, POLSKA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="w-full bg-[#E6E1DC]/5 p-8 rounded-sm border border-[#E6E1DC]/10">
              <h3 className="text-xl font-syne font-bold uppercase mb-6 tracking-tight">Wyślij zapytanie</h3>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="name" required placeholder="IMIĘ" className="bg-transparent border-b border-[#E6E1DC]/10 py-3 text-[10px] font-sans font-bold tracking-[0.2em] focus:border-[#F27D26] outline-none transition-colors" />
                  <input type="email" name="email" required placeholder="EMAIL" className="bg-transparent border-b border-[#E6E1DC]/10 py-3 text-[10px] font-sans font-bold tracking-[0.2em] focus:border-[#F27D26] outline-none transition-colors" />
                </div>
                <input type="tel" name="phone" placeholder="NUMER TELEFONU" className="bg-transparent border-b border-[#E6E1DC]/10 py-3 text-[10px] font-sans font-bold tracking-[0.2em] focus:border-[#F27D26] outline-none transition-colors" />
                <textarea name="message" required placeholder="TWOJA WIADOMOŚĆ" rows={3} className="bg-transparent border-b border-[#E6E1DC]/10 py-3 text-[10px] font-sans font-bold tracking-[0.2em] focus:border-[#F27D26] outline-none transition-colors resize-none"></textarea>
                
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />
                
                <button 
                  type="submit" 
                  disabled={formStatus === 'submitting'}
                  className="mt-4 border border-[#E6E1DC] px-8 py-3.5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] hover:bg-[#E6E1DC] hover:text-[#111] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formStatus === 'submitting' ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                </button>
                
                {formStatus === 'success' && (
                  <p className="text-green-500 text-[10px] font-sans font-bold tracking-wider mt-2 text-center uppercase">Wiadomość została wysłana!</p>
                )}
                {formStatus === 'error' && (
                  <p className="text-red-500 text-[10px] font-sans font-bold tracking-wider mt-2 text-center uppercase">Wystąpił błąd. Spróbuj ponownie.</p>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center py-8 border-t border-[#333] text-[10px] font-sans font-bold uppercase tracking-[0.2em] opacity-40">
          <p>©2024 All Rights Reserved</p>
        </div>
      </motion.div>
    </footer>
  );
};
