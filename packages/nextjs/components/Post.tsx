'use client';

import { useState } from 'react';
import { useAccount } from "@starknet-react/core";
import { postsApi } from '../services/fakeApi';

interface Comment {
  id: string;
  postId: string;
  userAddress: string;
  content: string;
  timestamp: number;
  userName?: string;
}

interface PostProps {
  id: string;
  creator: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: number;
  likes: string[];
  comments: Comment[];
}

export default function Post({ id, creator, content, timestamp, likes: initialLikes, comments: initialComments }: PostProps) {
  const { address } = useAccount();
  const [likes, setLikes] = useState<string[]>(initialLikes);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (!address) return;
    
    try {
      const updatedPost = postsApi.toggleLike(id, address);
      setLikes(updatedPost.likes);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !newComment.trim()) return;

    try {
      const newCommentObj = postsApi.addComment(id, address, newComment.trim());
      setComments(prev => [...prev, {
        ...newCommentObj,
        timestamp: new Date(newCommentObj.timestamp).getTime(),
        userName: 'You' // TODO: Get actual user name
      }]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
          <span className="text-primary font-semibold text-lg">{creator.name[0]}</span>
        </div>
        <div>
          <h3 className="font-semibold text-base-content">{creator.name}</h3>
          <p className="text-base-content/70 text-sm">{formatTimestamp(timestamp)}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-base-content mb-4">{content}</p>

      {/* Post Actions */}
      <div className="flex items-center space-x-6 mb-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 ${
            address && likes.includes(address) ? 'text-primary' : 'text-base-content/70'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill={address && likes.includes(address) ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{likes.length}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-base-content/70"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 space-y-4">
          <form onSubmit={handleComment} className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-primary text-primary-content px-4 py-2 rounded-lg hover:bg-primary-focus transition-colors"
            >
              Post
            </button>
          </form>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm font-semibold">{comment.userName?.[0] || 'U'}</span>
                </div>
                <div className="flex-1">
                  <div className="bg-base-200 rounded-lg p-3">
                    <p className="text-base-content">{comment.content}</p>
                  </div>
                  <p className="text-base-content/70 text-sm mt-1">{formatTimestamp(comment.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 