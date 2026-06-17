import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #6D28D9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Scale of justice icon — two pans + beam */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Center pole */}
          <rect x="11.2" y="4" width="1.6" height="14" rx="0.8" fill="white" opacity="0.95" />
          {/* Base */}
          <rect x="7" y="18" width="10" height="1.8" rx="0.9" fill="white" opacity="0.95" />
          {/* Top beam */}
          <rect x="3" y="6.5" width="18" height="1.4" rx="0.7" fill="white" opacity="0.9" />
          {/* Left pan string */}
          <rect x="5.3" y="7.5" width="1" height="4" rx="0.5" fill="white" opacity="0.75" />
          {/* Right pan string */}
          <rect x="17.7" y="7.5" width="1" height="4" rx="0.5" fill="white" opacity="0.75" />
          {/* Left pan */}
          <ellipse cx="5.8" cy="12" rx="2.8" ry="1.1" fill="white" opacity="0.9" />
          {/* Right pan */}
          <ellipse cx="18.2" cy="12" rx="2.8" ry="1.1" fill="white" opacity="0.9" />
          {/* Top circle */}
          <circle cx="12" cy="5" r="1.2" fill="white" opacity="0.9" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
