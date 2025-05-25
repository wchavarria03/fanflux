"use client";

import { useAccount } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  userApi,
  User,
  tokenApi,
  TokenReward,
  communityApi,
  Community,
} from "../../services/fakeApi";

interface CommunityForm {
  name: string;
  description: string;
  tags: string;
}

interface TokenRewardForm {
  likeReward: {
    amount: number;
  };
  commentReward: {
    amount: number;
  };
  followerReward: {
    amount: number;
  };
}

interface TokenGenerationForm {
  amount: number;
}

export default function CreatorPage() {
  const { isConnected, isConnecting, address } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<CommunityForm>({
    name: "",
    description: "",
    tags: "",
  });
  const [tokenFormData, setTokenFormData] = useState<TokenRewardForm>({
    likeReward: {
      amount: 1,
    },
    commentReward: {
      amount: 5,
    },
    followerReward: {
      amount: 10,
    },
  });
  const [tokenGenerationData, setTokenGenerationData] =
    useState<TokenGenerationForm>({
      amount: 1000,
    });
  const [user, setUser] = useState<User | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [tokenRewards, setTokenRewards] = useState<TokenReward[]>([]);
  const [isNewCreator, setIsNewCreator] = useState(true);

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      // Clear localStorage when user disconnects
      localStorage.removeItem("activeUserWallet");
      // TODO: Fix this redirect
      // router.push('/');
    }
    if (!isConnecting) {
      setIsLoading(false);
    }
  }, [isConnected, isConnecting, router]);

  useEffect(() => {
    if (isConnected && address) {
      // Store wallet address in localStorage
      localStorage.setItem("activeUserWallet", address);

      const existingUser = userApi.getUser(address);
      if (existingUser) {
        setUser(existingUser);
        setIsNewCreator(false);
      }

      // Load community data
      const existingCommunity = communityApi.getCreatorCommunity(address);
      if (existingCommunity) {
        setCommunity(existingCommunity);
        setFormData({
          name: existingCommunity.name,
          description: existingCommunity.description,
          tags: existingCommunity.tags?.join(", ") || "",
        });
      }

      // Load token rewards
      const rewards = tokenApi.getCreatorTokenRewards(address);
      setTokenRewards(rewards);
    }
  }, [isConnected, address]);

  // Add a function to get the active user's wallet
  const getActiveUserWallet = (): string | null => {
    return localStorage.getItem("activeUserWallet");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      // Create new community first
      const newCommunity = communityApi.createCommunity(address, {
        name: formData.name,
        description: formData.description,
        tags,
      });
      setCommunity(newCommunity);

      // Then register or update user
      if (user) {
        // Update existing user
        const updatedUser = userApi.updateUser(address, {
          name: formData.name,
          bio: formData.description,
          tags,
        });
        setUser(updatedUser);
      } else {
        // Register new user with creator role
        const newUser = userApi.registerUser(address, "creator", {
          name: formData.name,
          bio: formData.description,
          tags,
        });
        setUser(newUser);
      }

      setIsNewCreator(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      // TODO: Add error handling UI
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const newReward = tokenApi.createTokenReward(address, {
        totalSupply: tokenGenerationData.amount,
        rewards: {
          likes: tokenFormData.likeReward,
          comments: tokenFormData.commentReward,
          followers: tokenFormData.followerReward,
        },
      });
      setTokenRewards((prev) => [...prev, newReward]);
      setTokenFormData({
        likeReward: {
          amount: 1,
        },
        commentReward: {
          amount: 5,
        },
        followerReward: {
          amount: 10,
        },
      });
      setTokenGenerationData({
        amount: 1000,
      });
    } catch (error) {
      console.error("Error creating token reward:", error);
      // TODO: Add error handling UI
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTokenChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (
      name.startsWith("likeReward.") ||
      name.startsWith("commentReward.") ||
      name.startsWith("followerReward.")
    ) {
      const [rewardType, field] = name.split(".");
      setTokenFormData((prev) => ({
        ...prev,
        [rewardType]: {
          ...prev[
            rewardType as "likeReward" | "commentReward" | "followerReward"
          ],
          [field]: parseInt(value) || 0,
        },
      }));
    } else {
      setTokenFormData((prev) => ({
        ...prev,
        [name]: name === "totalSupply" ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleTokenGenerationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { value } = e.target;
    setTokenGenerationData((prev) => ({
      ...prev,
      amount: parseInt(value) || 0,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isConnected) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-base-content">
        Creator Portal
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Community Information */}
          <div className="bg-base-100 rounded-3xl border border-base-300 p-8">
            <h2 className="text-2xl font-semibold mb-6 text-base-content">
              Community Information
            </h2>
            {isNewCreator ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-base-content mb-2"
                  >
                    Community Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your community name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-base-content mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe your community"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-base-content mb-2"
                  >
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., art, music, technology"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-content py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors font-semibold"
                >
                  Create Community
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-base-content/70 mb-1">
                    Community Name
                  </h3>
                  <p className="text-lg text-base-content">{community?.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-base-content/70 mb-1">
                    Description
                  </h3>
                  <p className="text-base-content whitespace-pre-wrap">
                    {community?.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-base-content/70 mb-1">
                    Followers
                  </h3>
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-base-content/70"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    </svg>
                    <p className="text-lg font-semibold text-base-content">
                      {community?.followers?.length || 0}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-base-content/70 mb-1">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {community?.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-base-200 text-base-content rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tokens History */}
          <div className="bg-base-100 rounded-3xl border border-base-300 p-8">
            <h3 className="text-xl font-semibold mb-4 text-base-content">
              Tokens History
            </h3>
            <div className="space-y-4">
              {tokenRewards.length > 0 ? (
                tokenRewards.map((reward) => (
                  <div key={reward.id} className="bg-base-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-base-content/70">
                          Tokens Generated: {reward.totalSupply}
                        </p>
                        <p className="text-base-content/70 mt-2">
                          Generated:{" "}
                          {new Date(reward.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-base-content/70">
                          Likes: {reward.rewards?.likes?.amount || 0} tokens
                        </p>
                        <p className="text-base-content/70">
                          Comments: {reward.rewards?.comments?.amount || 0}{" "}
                          tokens
                        </p>
                        <p className="text-base-content/70">
                          Followers: {reward.rewards?.followers?.amount || 0}{" "}
                          tokens
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-base-content/70 text-center">
                  No tokens generated yet
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Token Statistics */}
          <div className="bg-base-100 rounded-3xl border border-base-300 p-8">
            <h2 className="text-2xl font-semibold mb-6 text-base-content">
              Token Statistics
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-base-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-base-content/70 mb-2">
                  Total Tokens Generated
                </h3>
                <p className="text-2xl font-bold text-base-content">
                  {tokenRewards.reduce(
                    (total, reward) => total + reward.totalSupply,
                    0,
                  )}
                </p>
              </div>
              <div className="bg-base-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-base-content/70 mb-2">
                  Remaining Tokens
                </h3>
                <p className="text-2xl font-bold text-base-content">
                  {tokenRewards.reduce(
                    (total, reward) =>
                      total + (reward.totalSupply - reward.mintedSupply),
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Token Generation */}
          <div className="bg-base-100 rounded-3xl border border-base-300 p-8">
            <h2 className="text-2xl font-semibold mb-6 text-base-content">
              Token Generation
            </h2>
            {!community ? (
              <div className="text-center py-8">
                <p className="text-base-content/70 mb-4">
                  Please create a community first to enable token generation.
                </p>
                <div className="w-16 h-16 mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-full h-full text-base-content/50"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
              </div>
            ) : tokenRewards.length > 0 &&
              tokenRewards.reduce(
                (total, reward) =>
                  total + (reward.totalSupply - reward.mintedSupply),
                0,
              ) > 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-full h-full text-warning"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-warning mb-2">
                  Tokens Still Available
                </h3>
                <p className="text-base-content/70 mb-4">
                  You have{" "}
                  {tokenRewards.reduce(
                    (total, reward) =>
                      total + (reward.totalSupply - reward.mintedSupply),
                    0,
                  )}{" "}
                  tokens remaining.
                </p>
                <p className="text-base-content/70">
                  Please use all remaining tokens before generating new ones.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTokenSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-base-content">
                    Like Rewards
                  </h3>
                  <div>
                    <label
                      htmlFor="likeAmount"
                      className="block text-sm font-medium text-base-content mb-2"
                    >
                      Tokens per Like
                    </label>
                    <input
                      type="number"
                      id="likeAmount"
                      name="likeReward.amount"
                      value={tokenFormData.likeReward.amount}
                      onChange={handleTokenChange}
                      min="0"
                      className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-base-content">
                    Comment Rewards
                  </h3>
                  <div>
                    <label
                      htmlFor="commentAmount"
                      className="block text-sm font-medium text-base-content mb-2"
                    >
                      Tokens per Comment
                    </label>
                    <input
                      type="number"
                      id="commentAmount"
                      name="commentReward.amount"
                      value={tokenFormData.commentReward.amount}
                      onChange={handleTokenChange}
                      min="0"
                      className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-base-content">
                    Follower Rewards
                  </h3>
                  <div>
                    <label
                      htmlFor="followerAmount"
                      className="block text-sm font-medium text-base-content mb-2"
                    >
                      Tokens per Follower
                    </label>
                    <input
                      type="number"
                      id="followerAmount"
                      name="followerReward.amount"
                      value={tokenFormData.followerReward.amount}
                      onChange={handleTokenChange}
                      min="0"
                      className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-base-content">
                    Generate New Tokens
                  </h3>
                  <div>
                    <label
                      htmlFor="tokenAmount"
                      className="block text-sm font-medium text-base-content mb-2"
                    >
                      Amount to Generate
                    </label>
                    <input
                      type="number"
                      id="tokenAmount"
                      name="amount"
                      value={tokenGenerationData.amount}
                      onChange={handleTokenGenerationChange}
                      min="1"
                      className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-content py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors font-semibold"
                >
                  Generate Tokens
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
