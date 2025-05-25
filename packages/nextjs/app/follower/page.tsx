"use client";

import { useAccount } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { userApi, User, communityApi, Community } from "../../services/fakeApi";

interface FollowerProfile {
  name: string;
  bio: string;
  interests: string;
}

export default function FollowerPage() {
  const { isConnected, isConnecting, address } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FollowerProfile>({
    name: "",
    bio: "",
    interests: "",
  });
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempFormData, setTempFormData] = useState<FollowerProfile>({
    name: "",
    bio: "",
    interests: "",
  });
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([]);
  const [subscribedCommunities, setSubscribedCommunities] = useState<Community[]>([]);

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      // TODO: Fix this redirect
      // router.push('/');
    }
    if (!isConnecting) {
      setIsLoading(false);
    }
  }, [isConnected, isConnecting, router]);

  useEffect(() => {
    if (isConnected && address) {
      const existingUser = userApi.getUser(address);
      if (existingUser) {
        setUser(existingUser);
        setFormData({
          name: existingUser.name,
          bio: existingUser.bio,
          interests: existingUser.interests?.join(", ") || "",
        });
        setTempFormData({
          name: existingUser.name,
          bio: existingUser.bio,
          interests: existingUser.interests?.join(", ") || "",
        });

        // Load subscribed communities
        const subscriptions = userApi.getUserSubscriptions(address);
        const subscribedComms = subscriptions
          .map(id => communityApi.getCommunity(id))
          .filter((comm): comm is Community => comm !== null);
        setSubscribedCommunities(subscribedComms);

        // Load recommended communities (excluding user's own communities and subscribed ones)
        const allCommunities = communityApi.getAllCommunities();
        const recommendedComms = allCommunities.filter(
          community => 
            community.creatorAddress !== address && 
            !subscriptions.includes(community.id)
        );

        // Add dummy communities if no recommendations are available
        if (recommendedComms.length === 0) {
          const dummyCommunities: Community[] = [
            {
              id: "dummy1",
              name: "Web3 Developers Hub",
              description: "A community for web3 developers to share knowledge, collaborate on projects, and stay updated with the latest blockchain technologies.",
              creatorAddress: "0x123456789",
              tags: ["Web3", "Development", "Blockchain"],
              createdAt: new Date().toISOString()
            },
            {
              id: "dummy2",
              name: "NFT Artists Collective",
              description: "Join fellow NFT artists to showcase your work, get feedback, and learn about the latest trends in digital art and NFT creation.",
              creatorAddress: "0x987654321",
              tags: ["NFT", "Art", "Digital"],
              createdAt: new Date().toISOString()
            }
          ];
          setRecommendedCommunities(dummyCommunities);
        } else {
          setRecommendedCommunities(recommendedComms);
        }
      } else {
        // For new users, show dummy communities
        const dummyCommunities: Community[] = [
          {
            id: "dummy1",
            name: "Web3 Developers Hub",
            description: "A community for web3 developers to share knowledge, collaborate on projects, and stay updated with the latest blockchain technologies.",
            creatorAddress: "0x123456789",
            tags: ["Web3", "Development", "Blockchain"],
            createdAt: new Date().toISOString()
          },
          {
            id: "dummy2",
            name: "NFT Artists Collective",
            description: "Join fellow NFT artists to showcase your work, get feedback, and learn about the latest trends in digital art and NFT creation.",
            creatorAddress: "0x987654321",
            tags: ["NFT", "Art", "Digital"],
            createdAt: new Date().toISOString()
          }
        ];
        setRecommendedCommunities(dummyCommunities);
      }
    }
  }, [isConnected, address]);

  const handleEdit = () => {
    setTempFormData(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempFormData(formData);
    setIsEditing(false);
  };

  const handleTempChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTempFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const interests = tempFormData.interests
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean);

      if (user) {
        // Update existing user
        const updatedUser = userApi.updateUser(address, {
          name: tempFormData.name,
          bio: tempFormData.bio,
          interests,
        });
        setUser(updatedUser);
        setFormData(tempFormData);
      } else {
        // Register new user
        const newUser = userApi.registerUser(address, "follower", {
          name: tempFormData.name,
          bio: tempFormData.bio,
          interests,
        });
        setUser(newUser);
        setFormData(tempFormData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      // TODO: Add error handling UI
    }
  };

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

  if (!isConnected) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Follower Portal</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Information Form */}
          <div className="bg-base-100 rounded-3xl border border-gradient p-8 h-[450px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Your Profile</h2>
              {user && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit Profile
                </button>
              )}
              {isEditing && (
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-grow pr-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-base-content/70 mb-2"
                >
                  Display Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={tempFormData.name}
                    onChange={handleTempChange}
                    className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your display name"
                    required
                  />
                ) : (
                  <p className="text-lg text-base-content">{formData.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-base-content/70 mb-2"
                >
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    name="bio"
                    value={tempFormData.bio}
                    onChange={handleTempChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell us about yourself"
                    required
                  />
                ) : (
                  <p className="text-base-content whitespace-pre-wrap">
                    {formData.bio}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="interests"
                  className="block text-sm font-medium text-base-content/70 mb-2"
                >
                  Interests
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="interests"
                    name="interests"
                    value={tempFormData.interests}
                    onChange={handleTempChange}
                    className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., art, music, technology"
                    required
                  />
                ) : (
                  <p className="text-base-content">{formData.interests}</p>
                )}
              </div>

              {!user && !isEditing && (
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-content py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors font-semibold"
                >
                  Save Profile
                </button>
              )}
            </form>
          </div>

          {/* Your Communities */}
          <div className="bg-base-100 rounded-3xl border border-gradient p-8">
            <h2 className="text-2xl font-semibold mb-4">Your Communities</h2>
            <div className="grid grid-cols-1 gap-4">
              {subscribedCommunities.length > 0 ? (
                subscribedCommunities.map((community) => {
                  const creator = userApi.getUser(community.creatorAddress);
                  return (
                    <div
                      key={community.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleCommunityClick(community.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {community.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{community.name}</h3>
                          <p className="text-sm text-gray-600">
                            by {creator?.name || "Unknown Creator"}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {community.description}
                      </p>
                      {community.tags && community.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {community.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-base-content/70 text-center">
                  You haven't subscribed to any communities yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Getting Started Guide */}
          <div className="bg-base-100 rounded-3xl border border-gradient p-8 h-[450px] flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <div className="space-y-4 overflow-y-auto flex-grow pr-2">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold">Complete your profile</h3>
                  <p className="text-gray-600">
                    Tell us about yourself and your interests
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold">Discover creators</h3>
                  <p className="text-gray-600">
                    Browse and find creators that match your interests
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold">Start following</h3>
                  <p className="text-gray-600">
                    Subscribe to your favorite creators and enjoy their content
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Communities */}
          <div className="bg-base-100 rounded-3xl border border-gradient p-8">
            <h2 className="text-2xl font-semibold mb-4">Recommended Communities</h2>
            <div className="grid grid-cols-1 gap-4">
              {recommendedCommunities.length > 0 ? (
                recommendedCommunities.map((community) => {
                  const creator = userApi.getUser(community.creatorAddress);
                  return (
                    <div
                      key={community.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleCommunityClick(community.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {community.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{community.name}</h3>
                          <p className="text-sm text-gray-600">
                            by {creator?.name || "Unknown Creator"}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {community.description}
                      </p>
                      {community.tags && community.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {community.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-lg font-medium text-base-content mb-2">No Communities Found</p>
                  <p className="text-base-content/70">
                    We couldn't find any communities to recommend at the moment. Check back later for new communities!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
