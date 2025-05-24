'use client';

import { useState } from 'react';

interface Comment {
  id: string;
  user: string;
  content: string;
  timestamp: string;
}

interface PostProps {
  id: string;
  creator: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
}

export default function Post({ id, creator, content, timestamp, likes: initialLikes, comments: initialComments }: PostProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: 'You', // TODO: Replace with actual user
      content: newComment,
      timestamp: new Date().toISOString()
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  return (
    <div className="bg-base-100 rounded-3xl border border-gradient p-6 mb-6">
      {/* Post Header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0">
          {creator.avatar && (
            <img src={creator.avatar} alt={creator.name} className="w-full h-full rounded-full object-cover" />
          )}
        </div>
        <div>
          <h3 className="font-semibold">{creator.name}</h3>
          <p className="text-sm text-gray-500">{new Date(timestamp).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-700">{content}</p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center space-x-6 mb-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 ${
            isLiked ? 'text-blue-600' : 'text-gray-500'
          } hover:text-blue-600 transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill={isLiked ? 'currentColor' : 'none'}
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
          <span>{likes}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
          {/* Comment Form */}
          <form onSubmit={handleComment} className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="font-semibold text-sm">{comment.user}</p>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 