"use client";

import { FeatureCard } from "./FeatureCard";
import { useRouter } from "next/navigation";

export function RoleCarousel() {
  const router = useRouter();

  return (
    <div className="bg-container flex-grow w-full mt-16 px-8 py-12">
      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        <div
          onClick={() => router.push("/follower")}
          className="cursor-pointer"
        >
          <FeatureCard
            icon={{
              src: "/debug-icon.svg",
              alt: "Follower role icon",
              width: 40,
              height: 30,
            }}
          >
            Join as a Follower
          </FeatureCard>
        </div>

        <div onClick={() => router.push("/creator")} className="cursor-pointer">
          <FeatureCard
            icon={{
              src: "/explorer-icon.svg",
              alt: "Creator role icon",
              width: 38,
              height: 32,
            }}
          >
            Join as a Creator
          </FeatureCard>
        </div>
      </div>
    </div>
  );
}
