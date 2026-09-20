import * as React from "react";

interface SvgEmsa7IconProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SvgEmsa7Icon: React.FC<SvgEmsa7IconProps> = ({ className = '', style, ...props }) => (
  <div
    className={`inline-block bg-[#026F4F] bg-primary shrink-0 ${className}`}
    style={{
      aspectRatio: '58/17',
      maskImage: 'url(/trash/emsa7-logo.svg)',
      WebkitMaskImage: 'url(/trash/emsa7-logo.svg)',
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

export default SvgEmsa7Icon;
