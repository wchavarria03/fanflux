'use client';

import { useAccount } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Post from "../../components/Post";

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    creator: {
      name: 'Alice',
      avatar: '',
    },
    content: 'Just launched my new NFT collection! Check it out and let me know what you think.',
    timestamp: new Date().toISOString(),
    likes: 42,
    comments: [
      {
        id: '1',
        user: 'Bob',
        content: 'Looks amazing! Can\'t wait to see more.',
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: '2',
    creator: {
      name: 'Charlie',
      avatar: '',
    },
    content: 'Working on some exciting new content for my subscribers. Stay tuned!',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    likes: 28,
    comments: [],
  },
];

export default function FeedPage() {
  const { isConnected, isConnecting } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState(mockPosts);

  useEffect(() => {
    if (!isConnecting && !isConnected) {
        // TODO: Fix this redirect
        // router.push('/');
    }
    if (!isConnecting) {
      setIsLoading(false);
    }
  }, [isConnected, isConnecting, router]);

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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Feed</h1>
        
        {/* Feed Content */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Post
              key={post.id}
              id={post.id}
              creator={post.creator}
              content={post.content}
              timestamp={post.timestamp}
              likes={post.likes}
              comments={post.comments}
            />
          ))}
        </div>

        {/* No Posts Message */}
        {posts.length === 0 && (
          <div className="bg-base-100 rounded-3xl border border-gradient p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">No Posts Yet</h2>
            <p className="text-gray-600">
              Follow some creators to see their posts here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 