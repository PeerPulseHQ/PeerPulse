'use client';

import { useEffect } from 'react';

export default function MermaidHydrator() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'base',
        fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
        flowchart: { htmlLabels: false, useMaxWidth: true },
        sequence: { useMaxWidth: true },
        themeVariables: {
          background: '#0c1222',
          // Primary node palette
          primaryColor: '#0c1222',
          primaryTextColor: '#dce8f8',
          primaryBorderColor: '#1e3357',
          // Secondary / tertiary fallbacks (used when style directives override colour)
          secondaryColor: '#0c1222',
          secondaryTextColor: '#dce8f8',
          secondaryBorderColor: '#1e3357',
          tertiaryColor: '#0c1222',
          tertiaryTextColor: '#dce8f8',
          tertiaryBorderColor: '#1e3357',
          // Lines and edge labels
          lineColor: '#7a95b8',
          edgeLabelBackground: '#080c18',
          // Node + cluster background fallbacks
          mainBkg: '#0c1222',
          nodeBkg: '#0c1222',
          nodeBorder: '#1e3357',
          nodeTextColor: '#dce8f8',
          clusterBkg: '#080c18',
          clusterBorder: '#14213a',
          titleColor: '#dce8f8',
          // Sequence diagram
          actorBkg: '#0c1222',
          actorBorder: '#1e3357',
          actorTextColor: '#dce8f8',
          actorLineColor: '#7a95b8',
          signalColor: '#dce8f8',
          signalTextColor: '#dce8f8',
          labelBoxBkgColor: '#080c18',
          labelBoxBorderColor: '#14213a',
          labelTextColor: '#dce8f8',
          loopTextColor: '#dce8f8',
          noteBkgColor: '#14213a',
          noteTextColor: '#dce8f8',
          noteBorderColor: '#1e3357',
          activationBkgColor: '#1e3357',
          activationBorderColor: '#eab308',
        },
        themeCSS: `
          .node rect, .node polygon, .node circle, .node ellipse,
          .node path, .node .label-container { stroke-width: 1.2px; }
          .nodeLabel, .edgeLabel, .label, foreignObject div, .actor, text {
            color: #dce8f8 !important;
            fill: #dce8f8 !important;
          }
          .edgeLabel rect { fill: #080c18 !important; }
          .cluster rect { fill: #080c18 !important; }
        `,
      });
      if (cancelled) return;
      try {
        await mermaid.run({ querySelector: '.mermaid' });
      } catch {
        // mermaid throws when a diagram fails to parse; leave it as raw text
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
