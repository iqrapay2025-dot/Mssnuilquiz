export function IslamicBackground({ opacity = 0.08 }: { opacity?: number }) {
  const patternId = 'islamic-pattern';
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* Outer octagon */}
            <polygon
              points="40,4 56,12 68,28 68,52 56,68 40,76 24,68 12,52 12,28 24,12"
              fill="none"
              stroke="#0B5D3B"
              strokeWidth="0.8"
            />
            {/* Inner diamond */}
            <polygon
              points="40,20 56,40 40,60 24,40"
              fill="none"
              stroke="#0B5D3B"
              strokeWidth="0.6"
            />
            {/* Cross lines */}
            <line x1="40" y1="4" x2="40" y2="76" stroke="#0B5D3B" strokeWidth="0.3" />
            <line x1="4" y1="40" x2="76" y2="40" stroke="#0B5D3B" strokeWidth="0.3" />
            <line x1="15" y1="15" x2="65" y2="65" stroke="#0B5D3B" strokeWidth="0.3" />
            <line x1="65" y1="15" x2="15" y2="65" stroke="#0B5D3B" strokeWidth="0.3" />
            {/* Center dot */}
            <circle cx="40" cy="40" r="2" fill="#0B5D3B" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} opacity={opacity} />
      </svg>
    </div>
  );
}
