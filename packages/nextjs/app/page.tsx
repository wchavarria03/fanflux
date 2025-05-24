"use client";
import { useAccount } from "@starknet-react/core";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { HowItWorks } from "../components/HowItWorks";
import { FeaturedCreators } from "../components/FeaturedCreators";
import { CTASection } from "../components/CTASection";

const Home = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900">
      <HeroSection />
      <CTASection isConnected={isConnected} />
      <FeaturesSection />
      <FeaturedCreators />
      <HowItWorks />
    </div>
  );
};

export default Home;
