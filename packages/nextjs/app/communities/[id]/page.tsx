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
  const [purchasedArticles, setPurchasedArticles] = useState<string[]>([]);

  useEffect(() => {
    const loadCommunityData = () => {
      const communityId = params.id as string;
      const communityData = communityApi.getCommunity(communityId);

      if (communityData) {
        setCommunity(communityData);
        const creatorData = userApi.getUser(communityData.creatorAddress);
        setCreator(creatorData);
        const communityArticles =
        // marketplaceApi.getCommunityArticles(communityId); // TODO: Enable later with real data
        marketplaceApi.getCommunityArticles("a83fde87-b5b2-415f-8a6b-39f861792e2f"); // Load mock data
        setArticles(communityArticles);

        if (address) {
          const user = userApi.getUser(address);
          setUserTokens(user?.tokens?.[communityData.creatorAddress] || 0);
          setIsSubscribed(
            userApi.isSubscribedToCommunity(address, communityId),
          );
          
          // Load purchased articles for the current user
          const userPurchases = marketplaceApi.getUserPurchasedArticles(address);
          setPurchasedArticles(userPurchases || []);
        }
      }

      setIsLoading(false);
    };

    loadCommunityData();
  }, [params.id, address]);

  const handlePurchase = (articleId: string) => {
    if (!address) return;

    debugger;
    const success = marketplaceApi.purchaseArticle(articleId, address);
    if (success) {
      // Refresh user tokens
      const user = userApi.getUser(address);
      setUserTokens(user?.tokens?.[community?.creatorAddress || ""] || 0);
      
      // Update purchased articles
      setPurchasedArticles(prev => [...prev, articleId]);
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
        <p className="text-base-content/70">
          The community you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Community Header */}
      <div className="bg-base-100 rounded-3xl border border-gradient p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
              {community.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{community.name}</h1>
              <p className="text-base-content/70">
                Created by {creator?.name || "Unknown Creator"}
              </p>
            </div>
          </div>
          {address && address !== community.creatorAddress && (
            <button
              onClick={handleSubscriptionToggle}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                isSubscribed
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isSubscribed ? "Unsubscribe" : "Subscribe"}
            </button>
          )}
        </div>

        <div className="flex gap-8">
          <div className="flex-grow max-w-2xl">
            <p className="text-lg text-base-content/70 mb-6">
              {community.description}
            </p>

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

          {/* Creator Information Box */}
          {creator && (
            <div className="flex-shrink-0">
              <div className="bg-base-200/50 rounded-xl p-6 border border-base-300 w-96">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {creator.name.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-2">
                      {creator.name}
                    </h3>
                    <p className="text-base-content/70 mb-4">{creator.bio}</p>
                    {creator.interests && creator.interests.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-base-content/70">
                          Interests
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {creator.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-base-100 rounded-full text-sm text-base-content/70"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Community Marketplace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Marketplace */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Community Marketplace</h2>
            {address && (
              <div className="bg-base-200/50 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm border border-base-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-primary-focus"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-base-content/80">Balance:</span>
                <span className="text-xl font-bold text-primary-focus">
                  {userTokens}
                </span>
                <span className="text-base-content/80">tokens</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-base-100 rounded-3xl border border-gradient overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-square relative">
                  <img
                    src={
                      article.imageUrl ||
                      `https://picsum.photos/seed/${article.id}/400/400`
                    }
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 text-base-content line-clamp-1">
                    {article.title}
                  </h3>
                  <p className="text-base-content/70 text-sm mb-4 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-primary"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-lg font-semibold text-primary">
                        {article.price} tokens
                      </span>
                    </div>
                    <button
                      onClick={() => handlePurchase(article.id)}
                      disabled={!address || userTokens < article.price || purchasedArticles.includes(article.id)}
                      className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                        !address
                          ? "bg-base-200 text-base-content/50 cursor-not-allowed"
                          : purchasedArticles.includes(article.id)
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : userTokens < article.price
                            ? "bg-base-200 text-base-content/50 cursor-not-allowed"
                            : "bg-secondary text-primary-content hover:bg-primary-focus"
                      }`}
                    >
                      {!address
                        ? "Connect Wallet"
                        : purchasedArticles.includes(article.id)
                          ? "Purchased"
                          : userTokens < article.price
                            ? "Insufficient"
                            : "Purchase"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
