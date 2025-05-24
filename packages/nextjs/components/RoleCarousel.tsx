import { FeatureCard } from './FeatureCard';

export function RoleCarousel() {
  return (
    <div className="bg-container flex-grow w-full mt-16 px-8 py-12">
      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
          <FeatureCard
            icon={{
              src: "/debug-icon.svg",
              alt: "icon",
              width: 40,
              height: 30
            }}
          >
            Follower
          </FeatureCard>
          
          <FeatureCard
            icon={{
              src: "/explorer-icon.svg",
              alt: "icon",
              width: 38,
              height: 32
            }}
          >
            Creator
          </FeatureCard>
      </div>
    </div>
  );
} 