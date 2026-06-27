function BrandIcon({ size = 48, className = "" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bk-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#bk-grad)" />
      <path
        d="M22 14c1.5-3 3-3 4.5 0"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M30 12c1.5-3 3-3 4.5 0"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M38 14c1.5-3 3-3 4.5 0"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <ellipse cx="32" cy="28" rx="14" ry="4" fill="#fff" opacity="0.95" />
      <path d="M18 28h28v2c0 12-6 18-14 18S18 42 18 30z" fill="#fff" />
      <ellipse cx="32" cy="46" rx="10" ry="3" fill="#fed7aa" opacity="0.55" />
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontSize="15"
        fontWeight="900"
        fill="#c2410c"
        letterSpacing="-1"
      >
        BK
      </text>
    </svg>
  );
}

export default BrandIcon;
