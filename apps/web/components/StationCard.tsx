'use client';

import { useEffect, useRef } from 'react';

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    type Node = { x: number; y: number; vx: number; vy: number; r: number; color: string };
    let nodes: Node[] = [];
    let W = 0;
    let H = 0;
    let animId = 0;

    function resize() {
      W = canvas!.width = canvas!.offsetWidth;
      H = canvas!.height = canvas!.offsetHeight;
    }

    function initCanvas() {
      resize();
      nodes = [];
      const count = Math.floor((W * H) / 18000);
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.8 + 0.8,
          color:
            r < 0.55 ? '#eab308' : r < 0.82 ? '#60a5fa' : '#22c55e',
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      const D = 140;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < D) {
            ctx!.strokeStyle = `rgba(96,165,250,${(1 - d / D) * 0.18})`;
            ctx!.lineWidth = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
        ctx!.beginPath();
        ctx!.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx!.fillStyle = a.color + '99';
        ctx!.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    const onResize = () => {
      resize();
      initCanvas();
    };
    window.addEventListener('resize', onResize);
    initCanvas();
    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="heroCanvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        opacity: 0.45,
        width: '100%',
        height: '100%',
      }}
    />
  );
}

export function StationCard() {
  return (
    <div className="presence-card">
      <div className="pc-title">Station · Live View</div>
      <div className="pc-station-id">ELD-001</div>
      <div className="pc-station-name">Rift Valley · Eldoret · Uasin Gishu</div>

      <div className="pc-signals">
        <div className="pc-sig">
          <div className="pc-sig-dot done" />
          <span className="pc-sig-label">Intent declared</span>
          <span className="pc-sig-val">2,104</span>
        </div>
        <div className="pc-sig">
          <div className="pc-sig-dot done" />
          <span className="pc-sig-label">Checked in</span>
          <span className="pc-sig-val">847</span>
        </div>
        <div className="pc-sig">
          <div className="pc-sig-dot live" />
          <span className="pc-sig-label">Observing now</span>
          <span className="pc-sig-val">12 ●</span>
        </div>
        <div className="pc-sig">
          <div className="pc-sig-dot live" />
          <span className="pc-sig-label">BLE witnesses</span>
          <span className="pc-sig-val">12 ●</span>
        </div>
        <div className="pc-sig">
          <div className="pc-sig-dot done" />
          <span className="pc-sig-label">Tallies submitted</span>
          <span className="pc-sig-val">8</span>
        </div>
      </div>

      <div className="pc-witnesses">
        <div className="pc-wit-title">Co-witnesses · 12 present</div>
        <div className="pc-wit-row">
          <div className="pc-wit-dot" />12D3Koo…WJmN · 2s ago
        </div>
        <div className="pc-wit-row">
          <div className="pc-wit-dot" />12D3Koo…R4Ft · just now
        </div>
        <div className="pc-wit-row">
          <div className="pc-wit-dot" />12D3Koo…P2Xc · 1s ago
        </div>
        <div className="pc-wit-row" style={{ color: 'var(--text-3)' }}>
          + 9 more observers
        </div>
      </div>

      <div className="pc-tally">
        <div className="pc-tally-row">
          <div className="pc-tally-dot" style={{ background: 'var(--tab)' }} />
          <span className="pc-tally-name">W. Ruto</span>
          <span className="pc-tally-votes" style={{ color: 'var(--tab)' }}>2,104</span>
          <div className="pc-tally-bar-wrap">
            <div className="pc-tally-bar" style={{ width: '82%', background: 'var(--tab)' }} />
          </div>
        </div>
        <div className="pc-tally-row">
          <div className="pc-tally-dot" style={{ background: 'var(--svy)' }} />
          <span className="pc-tally-name">R. Gachagua</span>
          <span className="pc-tally-votes" style={{ color: 'var(--svy)' }}>284</span>
          <div className="pc-tally-bar-wrap">
            <div className="pc-tally-bar" style={{ width: '11%', background: 'var(--svy)' }} />
          </div>
        </div>
        <div className="pc-tally-row">
          <div className="pc-tally-dot" style={{ background: 'var(--jrn)' }} />
          <span className="pc-tally-name">K. Musyoka</span>
          <span className="pc-tally-votes" style={{ color: 'var(--jrn)' }}>167</span>
          <div className="pc-tally-bar-wrap">
            <div className="pc-tally-bar" style={{ width: '7%', background: 'var(--jrn)' }} />
          </div>
        </div>
      </div>

      <div className="pc-confirmed">
        ✓ CONFIRMED · lead trust score 3.4× nearest challenger
      </div>
    </div>
  );
}
