/**
 * PeerPulse horizontal lockup, inlined as JSX so `currentColor` inherits
 * from the host CSS — which lets the runtime theme toggle (and the
 * `prefers-color-scheme` media query in globals.css) repaint it.
 *
 * Source of truth: brand/logo/peerpulse-lockup.svg
 * Geometry kept in sync by hand.
 */
export default function PeerPulseLockup({
  height = 32,
  ariaLabel = 'PeerPulse',
  className,
}: {
  height?: number;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 250 64"
      height={height}
      fill="currentColor"
      aria-label={ariaLabel}
      className={className}
      style={{ display: 'block', height, width: 'auto' }}
    >
      <title>PeerPulse</title>
      <g fill="none" stroke="currentColor">
        <circle cx="32" cy="32" r="27" strokeWidth="4" opacity="0.4" />
        <circle cx="32" cy="32" r="20" strokeWidth="5" opacity="0.7" />
        <circle cx="32" cy="32" r="9"  strokeWidth="8" />
      </g>
      <path d="M 19 32 L 26 32 L 26 58.5 A 3.5 3.5 0 0 1 19 58.5 Z" fill="currentColor" />
      <text
        x="70"
        y="43"
        fontFamily="'IBM Plex Sans', 'IBM Plex Sans Bold', system-ui, -apple-system, sans-serif"
        fontSize="30"
        fontWeight="700"
        letterSpacing="2.4"
        textLength="180"
        lengthAdjust="spacing"
      >
        PEERPULSE
      </text>
    </svg>
  );
}
