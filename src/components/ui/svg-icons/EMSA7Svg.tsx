import * as React from "react";

interface SvgEmsa7IconProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SvgEmsa7Icon: React.FC<SvgEmsa7IconProps> = ({ className = '', style, ...props }) => {
  const hasBg = className.includes('bg-');
  return (
    <div
      className={`inline-block shrink-0 ${hasBg ? '' : 'bg-[#026F4F]'} ${className}`}
      style={{
        aspectRatio: '790/226',
        maskImage: 'url(/emsa7-logo-clean.png)',
        WebkitMaskImage: 'url(/emsa7-logo-clean.png)',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        ...style,
      }}
      {...props}
    />
  );
};

export default SvgEmsa7Icon;
