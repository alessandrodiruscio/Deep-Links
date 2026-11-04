import React from 'react';

interface SmartJumpLogoProps {
  className?: string;
  imgClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SmartJumpLogo: React.FC<SmartJumpLogoProps> = ({
  className = '',
  imgClassName = '',
  size = 'md',
}) => {
  const heightClass =
    size === 'sm'
      ? 'h-6 sm:h-7'
      : size === 'lg'
      ? 'h-9 sm:h-11'
      : 'h-7 sm:h-8 md:h-9';

  return (
    <div className={`flex items-center select-none ${className}`}>
      <div className="relative flex items-center transition-transform hover:scale-[1.02] duration-200 dark:bg-white/95 dark:px-2.5 dark:py-1 dark:rounded-xl dark:shadow-sm">
        <img
          src="/assets/aistudio/smartjump-small_f72cb2a2.png"
          alt="smartjump"
          className={`${heightClass} w-auto object-contain max-w-[220px] ${imgClassName}`}
          loading="eager"
        />
      </div>
    </div>
  );
};
