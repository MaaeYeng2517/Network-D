"use client";

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Shape({ type }) {
  switch (type) {
    case "pc":
      return (
        <g>
          <rect x="6" y="5" width="20" height="14" rx="1.5" {...S} />
          <line x1="16" y1="19" x2="16" y2="23" {...S} />
          <line x1="11" y1="24" x2="21" y2="24" {...S} />
          <line x1="9" y1="12" x2="23" y2="12" {...S} opacity="0.5" />
        </g>
      );
    case "laptop":
      return (
        <g>
          <rect x="7" y="6" width="18" height="12" rx="1.5" {...S} />
          <line x1="4" y1="22" x2="28" y2="22" {...S} />
          <line x1="7" y1="18" x2="25" y2="18" {...S} opacity="0.5" />
        </g>
      );
    case "server":
      return (
        <g>
          <rect x="7" y="4" width="18" height="7" rx="1.5" {...S} />
          <rect x="7" y="13" width="18" height="7" rx="1.5" {...S} />
          <rect x="7" y="22" width="18" height="6" rx="1.5" {...S} />
          <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
        </g>
      );
    case "switch":
      return (
        <g>
          <rect x="3" y="11" width="26" height="12" rx="2" {...S} />
          {[7, 11, 15, 19, 23].map((x) => (
            <rect key={x} x={x} y="15" width="2.6" height="4" rx="0.5" {...S} opacity="0.85" />
          ))}
        </g>
      );
    case "router":
      return (
        <g>
          <circle cx="16" cy="16" r="11" {...S} />
          <path d="M10 16h12 M16 10v12" {...S} opacity="0.7" />
          <path d="M20 12l3 4-3 4" {...S} />
        </g>
      );
    case "hub":
      return (
        <g>
          <rect x="3" y="11" width="26" height="12" rx="2" {...S} />
          {[8, 13, 18, 23].map((x) => (
            <circle key={x} cx={x} cy="17" r="1.4" fill="currentColor" stroke="none" />
          ))}
        </g>
      );
    case "ap":
      return (
        <g>
          <circle cx="16" cy="20" r="3" {...S} />
          <path d="M9 20a7 7 0 0 1 14 0" {...S} />
          <path d="M5.5 20a10.5 10.5 0 0 1 21 0" {...S} opacity="0.6" />
          <line x1="16" y1="23" x2="16" y2="27" {...S} />
        </g>
      );
    case "firewall":
      return (
        <g>
          <rect x="5" y="6" width="22" height="20" rx="1.5" {...S} />
          <line x1="5" y1="12" x2="27" y2="12" {...S} />
          <line x1="5" y1="19" x2="27" y2="19" {...S} />
          <line x1="12" y1="6" x2="12" y2="12" {...S} />
          <line x1="20" y1="6" x2="20" y2="12" {...S} />
          <line x1="16" y1="12" x2="16" y2="19" {...S} />
          <line x1="9" y1="19" x2="9" y2="26" {...S} />
          <line x1="22" y1="19" x2="22" y2="26" {...S} />
        </g>
      );
    case "modem":
      return (
        <g>
          <rect x="5" y="16" width="22" height="10" rx="2" {...S} />
          <line x1="16" y1="16" x2="16" y2="7" {...S} />
          <circle cx="16" cy="6" r="1.6" fill="currentColor" stroke="none" />
          {[10, 16, 22].map((x) => (
            <circle key={x} cx={x} cy="21" r="1.1" fill="currentColor" stroke="none" />
          ))}
        </g>
      );
    case "cloud":
      return (
        <path
          d="M9 22h15a5 5 0 0 0 .3-10 7 7 0 0 0-13.3-1.5A4.5 4.5 0 0 0 9 22z"
          {...S}
        />
      );
    default:
      return <circle cx="16" cy="16" r="10" {...S} />;
  }
}

export default function DeviceIcon({ type, size = 34 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <Shape type={type} />
    </svg>
  );
}