'use client';

import { useAccount } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { userApi, User } from "../../services/fakeApi";

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
    name: '',
    bio: '',
    interests: ''
  });
  const [user, setUser] = useState<User | null>(null);

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
          interests: existingUser.interests?.join(', ') || '',
        });
      }
    }
  }, [isConnected, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const interests = formData.interests.split(',').map(interest => interest.trim()).filter(Boolean);
      
      if (user) {
        // Update existing user
        const updatedUser = userApi.updateUser(address, {
          name: formData.name,
          bio: formData.bio,
          interests,
        });
        setUser(updatedUser);
      } else {
        // Register new user
        const newUser = userApi.registerUser(address, 'follower', {
          name: formData.name,
          bio: formData.bio,
          interests,
        });
        setUser(newUser);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
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
        {/* Profile Information Form */}
        <div className="bg-base-100 rounded-3xl border border-gradient p-8">
          <h2 className="text-2xl font-semibold mb-6">Your Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your display name"
                required
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself"
                required
              />
            </div>

            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., art, music, technology"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {user ? 'Update Profile' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Getting Started Guide */}
        <div className="space-y-6">
          <div className="bg-base-100 rounded-3xl border border-gradient p-8">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold">Complete your profile</h3>
                  <p className="text-gray-600">Tell us about yourself and your interests</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold">Discover creators</h3>
                  <p className="text-gray-600">Browse and find creators that match your interests</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold">Start following</h3>
                  <p className="text-gray-600">Subscribe to your favorite creators and enjoy their content</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Creators */}
          <div className="bg-base-100 rounded-3xl border border-gradient p-8">
            <h2 className="text-2xl font-semibold mb-4">Recommended Creators</h2>
            <div className="grid grid-cols-1 gap-4">
              {userApi.getCreators().map((creator) => (
                <div key={creator.walletAddress} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <h3 className="font-semibold">{creator.name}</h3>
                      <p className="text-sm text-gray-600">{creator.tags?.join(', ')}</p>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 