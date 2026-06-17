import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #6D28D9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="110" height="110" viewBox="0 0 24 24" fill="none">
          <rect x="11.2" y="4" width="1.6" height="14" rx="0.8" fill="white" opacity="0.95" />
          <rect x="7" y="18" width="10" height="1.8" rx="0.9" fill="white" opacity="0.95" />
          <rect x="3" y="6.5" width="18" height="1.4" rx="0.7" fill="white" opacity="0.9" />
          <rect x="5.3" y="7.5" width="1" height="4" rx="0.5" fill="white" opacity="0.75" />
          <rect x="17.7" y="7.5" width="1" height="4" rx="0.5" fill="white" opacity="0.75" />
          <ellipse cx="5.8" cy="12" rx="2.8" ry="1.1" fill="white" opacity="0.9" />
          <ellipse cx="18.2" cy="12" rx="2.8" ry="1.1" fill="white" opacity="0.9" />
          <circle cx="12" cy="5" r="1.2" fill="white" opacity="0.9" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
