import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  children: ReactNode;
  link?: {
    href: string;
    text: string;
  };
}

export function FeatureCard({ icon, children, link }: FeatureCardProps) {
  return (
    <div className="flex flex-col bg-base-100 hover:bg-base-200 transition-colors duration-200 cursor-pointer relative px-10 py-10 text-center items-center max-w-sm rounded-3xl border border-gradient min-h-[220px] min-w-[200px]">
      <div className="trapeze"></div>
      <Image
        src={icon.src}
        alt={icon.alt}
        width={icon.width}
        height={icon.height}
        className="mb-4"
      />
      <p className="text-lg font-semibold">
        {children}
        {link && (
          <>
            {' '}
            <Link href={link.href} passHref className="link hover:text-primary">
              {link.text}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}