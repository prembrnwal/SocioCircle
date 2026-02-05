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

export const Avatar = ({ src, alt, size = 'md', fallback, className = '', ...props }: AvatarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayFallback = fallback || getInitials(alt);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden ${className}`}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.avatar-fallback')) {
              const fallbackEl = document.createElement('div');
              fallbackEl.className = 'avatar-fallback text-gray-600 dark:text-gray-300 font-semibold';
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
