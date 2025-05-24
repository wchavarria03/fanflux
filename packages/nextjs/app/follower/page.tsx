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
  const [isEditing, setIsEditing] = useState(false);
  const [tempFormData, setTempFormData] = useState<FollowerProfile>({
    name: '',
    bio: '',
    interests: ''
  });

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
        setTempFormData({
          name: existingUser.name,
          bio: existingUser.bio,
          interests: existingUser.interests?.join(', ') || '',
        });
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

  const handleTempChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const interests = tempFormData.interests.split(',').map(interest => interest.trim()).filter(Boolean);
      
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
        const newUser = userApi.registerUser(address, 'follower', {
          name: tempFormData.name,
          bio: tempFormData.bio,
          interests,
        });
        setUser(newUser);
        setFormData(tempFormData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      // TODO: Add error handling UI
    }
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
        <div className="bg-base-100 rounded-3xl border border-gradient p-8 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Profile</h2>
            {user && !isEditing && (
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={tempFormData.name}
                  onChange={handleTempChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your display name"
                  required
                />
              ) : (
                <p className="text-lg text-base-content">{formData.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  id="bio"
                  name="bio"
                  value={tempFormData.bio}
                  onChange={handleTempChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself"
                  required
                />
              ) : (
                <p className="text-lg text-base-content whitespace-pre-wrap">{formData.bio}</p>
              )}
            </div>

            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="interests"
                  name="interests"
                  value={tempFormData.interests}
                  onChange={handleTempChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., art, music, technology"
                  required
                />
              ) : (
                <p className="text-lg text-base-content">{formData.interests}</p>
              )}
            </div>

            {isEditing ? (
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : !user && (
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Save Profile
              </button>
            )}
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