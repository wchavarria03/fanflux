"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { communityApi, Community } from "../../../services/fakeApi";
import { userApi, User } from "../../../services/fakeApi";
import { marketplaceApi, Article } from "../../../services/fakeApi";
import { useAccount } from "@starknet-react/core";

export default function CommunityPage() {
  const params = useParams();
  const { address } = useAccount();
  const [community, setCommunity] = useState<Community | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [userTokens, setUserTokens] = useState<number>(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommunityData = () => {
      const communityId = params.id as string;
      const communityData = communityApi.getCommunity(communityId);
      
      if (communityData) {
        setCommunity(communityData);
        const creatorData = userApi.getUser(communityData.creatorAddress);
        setCreator(creatorData);
        const communityArticles = marketplaceApi.getCommunityArticles(communityId);
        setArticles(communityArticles);
        
        if (address) {
          const user = userApi.getUser(address);
          setUserTokens(user?.tokens?.[communityData.creatorAddress] || 0);
          setIsSubscribed(userApi.isSubscribedToCommunity(address, communityId));
        }
      }
      
      setIsLoading(false);
    };

    loadCommunityData();
  }, [params.id, address]);

  const handlePurchase = (articleId: string) => {
    if (!address) return;
    
    const success = marketplaceApi.purchaseArticle(articleId, address);
    if (success) {
      // Refresh user tokens
      const user = userApi.getUser(address);
      setUserTokens(user?.tokens?.[community?.creatorAddress || ''] || 0);
    }
  };

  const handleSubscriptionToggle = () => {
    if (!address || !community) return;

    if (isSubscribed) {
      userApi.unsubscribeFromCommunity(address, community.id);
    } else {
      userApi.subscribeToCommunity(address, community.id);
    }
    setIsSubscribed(!isSubscribed);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Community Not Found</h1>
        <p className="text-base-content/70">The community you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Community Header */}
      <div className="bg-base-100 rounded-3xl border border-gradient p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
              {community.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{community.name}</h1>
              <p className="text-base-content/70">Created by {creator?.name || "Unknown Creator"}</p>
            </div>
          </div>
          {address && address !== community.creatorAddress && (
            <button
              onClick={handleSubscriptionToggle}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                isSubscribed
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </button>
          )}
        </div>
        
        <p className="text-lg text-base-content/70 mb-6">{community.description}</p>
        
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {community.tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-base-200 rounded-full text-base-content/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Community Marketplace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Marketplace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Community Marketplace</h2>
            {address && (
              <div className="text-base-content/70">
                Your Balance: <span className="font-semibold">{userTokens} tokens</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-base-100 rounded-3xl border border-gradient p-6">
                <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                <p className="text-base-content/70 mb-4 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {article.price} tokens
                  </div>
                  <button
                    onClick={() => handlePurchase(article.id)}
                    disabled={!address || userTokens < article.price}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      !address || userTokens < article.price
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {!address
                      ? 'Connect Wallet'
                      : userTokens < article.price
                      ? 'Insufficient Tokens'
                      : 'Purchase'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-base-100 rounded-3xl border border-gradient p-6">
            <h2 className="text-xl font-semibold mb-4">About Creator</h2>
            {creator && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {creator.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{creator.name}</h3>
                    <p className="text-sm text-base-content/70">Creator</p>
                  </div>
                </div>
                <p className="text-base-content/70">{creator.bio}</p>
                {creator.interests && creator.interests.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {creator.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-base-200 rounded-full text-sm text-base-content/70"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 