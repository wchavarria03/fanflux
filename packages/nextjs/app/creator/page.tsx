'use client';

import { useAccount } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { userApi, User, tokenApi, TokenReward, communityApi, Community } from "../../services/fakeApi";

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
    name: '',
    description: '',
    tags: ''
  });
  const [tokenFormData, setTokenFormData] = useState<TokenRewardForm>({
    likeReward: {
      amount: 1
    },
    commentReward: {
      amount: 5
    },
    followerReward: {
      amount: 10
    }
  });
  const [tokenGenerationData, setTokenGenerationData] = useState<TokenGenerationForm>({
    amount: 1000
  });
  const [user, setUser] = useState<User | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [tokenRewards, setTokenRewards] = useState<TokenReward[]>([]);
  const [isNewCreator, setIsNewCreator] = useState(true);

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      // Clear localStorage when user disconnects
      localStorage.removeItem('activeUserWallet');
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
      localStorage.setItem('activeUserWallet', address);
      
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
          tags: existingCommunity.tags.join(', '),
        });
      }

      // Load token rewards
      const rewards = tokenApi.getCreatorTokenRewards(address);
      setTokenRewards(rewards);
    }
  }, [isConnected, address]);

  // Add a function to get the active user's wallet
  const getActiveUserWallet = (): string | null => {
    return localStorage.getItem('activeUserWallet');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      if (user) {
        // Update existing user
        const updatedUser = userApi.updateUser(address, {
          name: formData.name,
          bio: formData.description,
          tags,
        });
        setUser(updatedUser);

        // Update community
        if (community) {
          const updatedCommunity = communityApi.updateCommunity(address, {
            name: formData.name,
            description: formData.description,
            tags,
          });
          setCommunity(updatedCommunity);
        }
      } else {
        // Register new user
        const newUser = userApi.registerUser(address, 'creator', {
          name: formData.name,
          bio: formData.description,
          tags,
        });
        setUser(newUser);

        // Create new community
        const newCommunity = communityApi.createCommunity(address, {
          name: formData.name,
          description: formData.description,
          tags,
        });
        setCommunity(newCommunity);
        setIsNewCreator(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
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
          followers: tokenFormData.followerReward
        }
      });
      setTokenRewards(prev => [...prev, newReward]);
      setTokenFormData({
        likeReward: {
          amount: 1
        },
        commentReward: {
          amount: 5
        },
        followerReward: {
          amount: 10
        }
      });
      setTokenGenerationData({
        amount: 1000
      });
    } catch (error) {
      console.error('Error creating token reward:', error);
      // TODO: Add error handling UI
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('likeReward.') || name.startsWith('commentReward.') || name.startsWith('followerReward.')) {
      const [rewardType, field] = name.split('.');
      setTokenFormData(prev => ({
        ...prev,
        [rewardType]: {
          ...prev[rewardType as 'likeReward' | 'commentReward' | 'followerReward'],
          [field]: parseInt(value) || 0
        }
      }));
    } else {
      setTokenFormData(prev => ({
        ...prev,
        [name]: name === 'totalSupply' ? parseInt(value) || 0 : value
      }));
    }
  };

  const handleTokenGenerationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTokenGenerationData(prev => ({
      ...prev,
      amount: parseInt(value) || 0
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
      <h1 className="text-4xl font-bold mb-8 text-base-content">Creator Portal</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Community Information */}
          <div className="bg-base-100 rounded-3xl border border-base-300 p-8">
            <h2 className="text-2xl font-semibold mb-6 text-base-content">Community Information</h2>
            {isNewCreator ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-base-content mb-2">
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
                  <label htmlFor="description" className="block text-sm font-medium text-base-content mb-2">
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
                  <label htmlFor="tags" className="block text-sm font-medium text-base-content mb-2">
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
                  <h3 className="text-sm font-medium text-base-content/70 mb-1">Community Name</h3>
                  <p className="text-lg text-base-content">{community?.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-base-content/70 mb-1">Description</h3>
                  <p className="text-base-content whitespace-pre-wrap">{community?.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-base-content/70 mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {community?.tags.map((tag, index) => (
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
            <h3 className="text-xl font-semibold mb-4 text-base-content">Tokens History</h3>
            <div className="space-y-4">
              {tokenRewards.length > 0 ? (
                tokenRewards.map((reward) => (
                  <div key={reward.id} className="bg-base-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-base-content/70">Total Supply: {reward.totalSupply}</p>
                        <p className="text-base-content/70">Minted: {reward.mintedSupply}</p>
                        <p className="text-base-content/70">Remaining: {reward.totalSupply - reward.mintedSupply}</p>
                        <p className="text-base-content/70 mt-2">Generated: {new Date(reward.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-base-content/70">Likes: {reward.rewards?.likes?.amount || 0} tokens</p>
                        <p className="text-base-content/70">Comments: {reward.rewards?.comments?.amount || 0} tokens</p>
                        <p className="text-base-content/70">Followers: {reward.rewards?.followers?.amount || 0} tokens</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-base-content/70 text-center">No tokens generated yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Token Settings */}
        <div className="bg-base-100 rounded-3xl border border-base-300 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-base-content">Token Settings</h2>
          {!community ? (
            <div className="text-center py-8">
              <p className="text-base-content/70 mb-4">Please create a community first to enable token generation.</p>
              <div className="w-16 h-16 mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full text-base-content/50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            </div>
          ) : (
            <form onSubmit={handleTokenSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-base-content">Like Rewards</h3>
                <div>
                  <label htmlFor="likeAmount" className="block text-sm font-medium text-base-content mb-2">
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
                <h3 className="text-lg font-medium text-base-content">Comment Rewards</h3>
                <div>
                  <label htmlFor="commentAmount" className="block text-sm font-medium text-base-content mb-2">
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
                <h3 className="text-lg font-medium text-base-content">Follower Rewards</h3>
                <div>
                  <label htmlFor="followerAmount" className="block text-sm font-medium text-base-content mb-2">
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
                <h3 className="text-lg font-medium text-base-content">Generate New Tokens</h3>
                <div>
                  <label htmlFor="tokenAmount" className="block text-sm font-medium text-base-content mb-2">
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
  );
} 