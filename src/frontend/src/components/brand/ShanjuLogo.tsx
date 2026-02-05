import { useState } from 'react';

interface ShanjuLogoProps {
  className?: string;
  size?: number;
}

export default function ShanjuLogo({ className = '', size = 40 }: ShanjuLogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        SJ
      </div>
    );
  }

  return (
    <img
      src="/assets/generated/shanju-logo.dim_512x512.png"
      alt="Shanju"
      className={`rounded-lg ${className}`}
      style={{ width: size, height: size }}
      onError={() => setImageError(true)}
    />
  );
}

