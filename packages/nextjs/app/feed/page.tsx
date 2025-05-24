"use client";

import { useAccount } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { useEffect, useState, SetStateAction } from "react";
import Post from "../../components/Post";
import {
  postsApi,
  userApi,
  Post as PostType,
  Comment as CommentType,
} from "../../services/fakeApi";

interface EnrichedPost
  extends Omit<PostType, "timestamp" | "comments" | "creator"> {
  timestamp: number;
  comments: EnrichedComment[];
  creator: {
    name: string;
    avatar?: string;
  };
}

interface EnrichedComment extends Omit<CommentType, "timestamp"> {
  timestamp: number;
  userName?: string;
}

export default function FeedPage() {
  const { isConnected, isConnecting, address } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<EnrichedPost[]>([]);

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
      // Get all posts and enrich them with creator information
      const allPosts = postsApi.getPosts();
      const enrichedPosts: EnrichedPost[] = allPosts.map((post) => {
        const creator = userApi.getUser(post.creatorAddress);
        const enrichedComments: EnrichedComment[] = post.comments.map(
          (comment) => {
            const commentUser = userApi.getUser(comment.userAddress);
            return {
              id: comment.id,
              postId: comment.postId,
              userAddress: comment.userAddress,
              content: comment.content,
              timestamp: new Date(comment.timestamp).getTime(),
              userName: commentUser?.name || "Unknown User",
            };
          },
        );

        const enrichedPost: EnrichedPost = {
          id: post.id,
          creatorAddress: post.creatorAddress,
          content: post.content,
          likes: post.likes,
          creator: {
            name: creator?.name || "Unknown Creator",
          },
          timestamp: new Date(post.timestamp).getTime(),
          comments: enrichedComments,
        };

        return enrichedPost;
      });
      setPosts(enrichedPosts);
    }
  }, [isConnected, address]);

  const handleLike = (postId: string) => {
    if (!address) return;
    const updatedPost = postsApi.toggleLike(postId, address);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes: updatedPost.likes,
            }
          : p,
      ),
    );
  };

  const handleComment = (postId: string, content: string) => {
    if (!address) return;
    const comment = postsApi.addComment(postId, address, content);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [...p.comments, comment],
            }
          : p,
      ),
    );
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-base-content">Your Feed</h1>

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
          <div className="bg-base-100 rounded-3xl border border-base-300 p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-base-content">
              No Posts Yet
            </h2>
            <p className="text-base-content/70">
              Follow some creators to see their posts here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
