import React, { useEffect, useRef } from 'react';

const PhoneAnimation = () => {
  const phoneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const phone = phoneRef.current;
    const screen = screenRef.current;
    const scene = sceneRef.current;

    if (!phone || !screen || !scene) return;

    // Logic from the provided JS
    const corners = ['tl', 'tr', 'bl', 'br'];
    corners.forEach(c => {
      const cornerEl = document.createElement('div');
      cornerEl.className = `corner corner-${c}`;
      for (let i = 1; i <= 16; i++) {
        const layer = document.createElement('div');
        layer.className = 'c-layer';
        layer.style.transform = `translateZ(-${i}px)`;
        cornerEl.appendChild(layer);
      }
      phone.appendChild(cornerEl);
    });

    let targetRx = 0, targetRy = 0;
    let rx = 0, ry = 0;
    let hasInteracted = false;
    let time = 0;

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function tick() {
      if (!hasInteracted) {
        time += 0.015;
        targetRy = Math.sin(time) * 25; 
        targetRx = Math.cos(time * 0.8) * 15;
      }

      rx = lerp(rx, targetRx, 0.08);
      ry = lerp(ry, targetRy, 0.08);

      phone.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

      requestAnimationFrame(tick);
    }

    tick();

    const handleMouseMove = (e: MouseEvent) => {
        hasInteracted = true;
        
        // Calculate center of the screen
        var cx = window.innerWidth / 2;
        var cy = window.innerHeight / 2;

        var dx = e.clientX - cx;
        var dy = e.clientY - cy;

        var maxDist = Math.min(window.innerWidth, window.innerHeight) * 0.5;
        
        // Increased maxTilt for more dramatic 3D effect
        var maxTilt = 60; 
        targetRy = (dx / maxDist) * maxTilt;
        targetRx = -(dy / maxDist) * maxTilt;
        targetRy = Math.max(-maxTilt, Math.min(maxTilt, targetRy));
        targetRx = Math.max(-maxTilt, Math.min(maxTilt, targetRx));
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="scene" ref={sceneRef}>
      <style>{`
        .scene { perspective: 800px; display: flex; align-items: center; gap: 3.5rem; }
        .phone { width: 256px; height: 537px; position: relative; transform-style: preserve-3d; border-radius: 30px; box-shadow: 0 30px 80px rgba(0,0,0,0.12); transition: transform 0.1s ease-out; }
        .back { position: absolute; inset: 0; background: linear-gradient(160deg, #c0d0de, #a8bcd0, #b4c4d4); border-radius: 30px; transform: translateZ(-16px); }
        .edge { position: absolute; background: linear-gradient(180deg, #c8d8e5, #a8b8ca, #b8c8d6); }
        .edge-r { top: 30px; bottom: 30px; right: 0; width: 16px; transform-origin: right center; transform: rotateY(-90deg); }
        .edge-l { top: 30px; bottom: 30px; left: 0; width: 16px; transform-origin: left center; transform: rotateY(90deg); }
        .edge-t { left: 30px; right: 30px; top: 0; height: 16px; transform-origin: center top; transform: rotateX(-90deg); background: linear-gradient(90deg, #c0d0de, #b0c2d2, #c4d4e2); }
        .edge-b { left: 30px; right: 30px; bottom: 0; height: 16px; transform-origin: center bottom; transform: rotateX(90deg); background: linear-gradient(90deg, #b0c0d0, #a0b0c2, #b8c8d6); }
        .corner { position: absolute; width: 30px; height: 30px; transform-style: preserve-3d; }
        .corner-tl { top: 0; left: 0; } .corner-tr { top: 0; right: 0; } .corner-bl { bottom: 0; left: 0; } .corner-br { bottom: 0; right: 0; }
        .c-layer { position: absolute; inset: 0; }
        .corner-tl .c-layer { border-top: 2px solid #b3c3d3; border-left: 2px solid #b3c3d3; border-radius: 30px 0 0 0; }
        .corner-tr .c-layer { border-top: 2px solid #b3c3d3; border-right: 2px solid #b3c3d3; border-radius: 0 30px 0 0; }
        .corner-bl .c-layer { border-bottom: 2px solid #b3c3d3; border-left: 2px solid #b3c3d3; border-radius: 0 0 0 30px; }
        .corner-br .c-layer { border-bottom: 2px solid #b3c3d3; border-right: 2px solid #b3c3d3; border-radius: 0 0 30px 0; }
        .bezel { width: 100%; height: 100%; background: linear-gradient(160deg, #d0dde8, #b8cad8, #c4d4e2); border-radius: 30px; padding: 3px; position: relative; transform: translateZ(1px); }
        .inner { width: 100%; height: 100%; background: #080808; border-radius: 27px; padding: 3px; }
        .screen { width: 100%; height: 100%; border-radius: 24px; overflow: hidden; position: relative; background: #080808; }
        .wallpaper { position: absolute; inset: 0; z-index: 1; border-radius: inherit; }
        .status-bar { display: flex; justify-content: space-between; align-items: center; padding: 4px 16px 0; position: relative; z-index: 10; height: 28px; }
        .time { font-size: 0.62rem; font-weight: 600; color: rgba(255,255,255,0.92); }
        .home-bar { position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); width: 88px; height: 3.5px; background: rgba(255,255,255,0.35); border-radius: 2px; z-index: 10; }
      `}</style>
      <div className="phone" ref={phoneRef}>
        <div className="back"></div>
        <div className="edge edge-r"></div>
        <div className="edge edge-l"></div>
        <div className="edge edge-t"></div>
        <div className="edge edge-b"></div>
        <div className="bezel">
          <div className="inner">
          <div className="screen" ref={screenRef}>
            <div className="wallpaper">
                <video 
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  webkit-playsinline="true"
                >
                  <source src="https://github.com/kidiee558/wideo-do-strony/raw/refs/heads/main/WIDEOTELEFON1.mp4" type="video/mp4" />
                </video>
            </div>
            <div className="status-bar">
              <span className="time">12:45</span>
            </div>
            <div className="home-bar"></div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneAnimation;
