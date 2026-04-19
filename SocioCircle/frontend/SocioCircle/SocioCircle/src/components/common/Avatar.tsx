import { ImgHTMLAttributes } from 'react';

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

// Backend serves uploaded files at http://localhost:9090/uploads/...
const BACKEND_ORIGIN = import.meta.env.VITE_API_URL ?? 'http://localhost:9090';

/**
 * Resolves a profile picture src to an absolute URL.
 * Relative backend paths like /uploads/... are prefixed with the backend origin.
 */
function resolveSrc(src?: string): string | undefined {
  if (!src) return undefined;
  // Already an absolute URL (http/https/data URI)
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  // Relative backend upload path — handle both /uploads/... and uploads/... (legacy)
  if (src.startsWith('/uploads/') || src.startsWith('uploads/')) {
    const cleanPath = src.startsWith('/') ? src : `/${src}`;
    return `${BACKEND_ORIGIN}${cleanPath}`;
  }
  return src;
}

export const Avatar = ({ src, alt, size = 'md', fallback, className = '', ...props }: AvatarProps) => {
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayFallback = fallback || getInitials(alt);
  const resolvedSrc = resolveSrc(src);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden ${className}`}
      {...props}
    >
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.avatar-fallback')) {
              const fallbackEl = document.createElement('div');
              fallbackEl.className = 'avatar-fallback text-gray-600 dark:text-gray-300 font-semibold text-sm';
              fallbackEl.textContent = displayFallback;
              parent.appendChild(fallbackEl);
            }
          }}
        />
      ) : (
        <div className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
          {displayFallback}
        </div>
      )}
    </div>
  );
};
