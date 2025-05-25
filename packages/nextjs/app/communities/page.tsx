"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { communityApi, Community } from "../../services/fakeApi";
import { userApi } from "../../services/fakeApi";

export default function CommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommunities = () => {
      const allCommunities = communityApi.getAllCommunities();
      setCommunities(allCommunities);
      setIsLoading(false);
    };

    loadCommunities();
  }, []);

  const handleCommunityClick = (communityId: string) => {
    router.push(`/communities/${communityId}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Communities</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => {
          const creator = userApi.getUser(community.creatorAddress);
          return (
            <div
              key={community.id}
              onClick={() => handleCommunityClick(community.id)}
              className="bg-base-100 rounded-3xl border border-gradient p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {community.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{community.name}</h2>
                  <p className="text-base-content/70">
                    by {creator?.name || "Unknown Creator"}
                  </p>
                </div>
              </div>

              <p className="text-base-content/70 mb-4 line-clamp-2">
                {community.description}
              </p>

              {community.tags && community.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {community.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-base-200 rounded-full text-sm text-base-content/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-base-200">
                <p className="text-sm text-base-content/70">
                  Created {new Date(community.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
