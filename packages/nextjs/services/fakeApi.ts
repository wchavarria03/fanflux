// Types
export interface User {
  walletAddress: string;
  role: 'creator' | 'follower';
  name: string;
  bio: string;
  interests?: string[];
  tags?: string[];
  createdAt: string;
  tokens?: { [creatorAddress: string]: number }; // Map of creator address to token amount
}

export interface Comment {
  id: string;
  postId: string;
  userAddress: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  creatorAddress: string;
  creator?: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: string[]; // Array of wallet addresses that liked the post
  comments: Comment[];
}

export interface TokenReward {
  id: string;
  creatorAddress: string;
  totalSupply: number;
  mintedSupply: number;
  rewards: {
    likes: {
      amount: number;
    };
    comments: {
      amount: number;
    };
    followers: {
      amount: number;
    };
  };
}

// Storage keys
const USERS_KEY = 'fanflux_users';
const POSTS_KEY = 'fanflux_posts';
const TOKEN_REWARDS_KEY = 'fanflux_token_rewards';

// Helper functions
const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const getPosts = (): Post[] => {
  const posts = localStorage.getItem(POSTS_KEY);
  return posts ? JSON.parse(posts) : [];
};

const getTokenRewards = (): TokenReward[] => {
  const rewards = localStorage.getItem(TOKEN_REWARDS_KEY);
  return rewards ? JSON.parse(rewards) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const savePosts = (posts: Post[]) => {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
};

const saveTokenRewards = (rewards: TokenReward[]) => {
  localStorage.setItem(TOKEN_REWARDS_KEY, JSON.stringify(rewards));
};

// User API
export const userApi = {
  // Register a new user
  registerUser: (walletAddress: string, role: 'creator' | 'follower', userData: Partial<User>): User => {
    const users = getUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.walletAddress === walletAddress);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      walletAddress,
      role,
      name: userData.name || '',
      bio: userData.bio || '',
      interests: userData.interests || [],
      tags: userData.tags || [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    return newUser;
  },

  // Update user profile
  updateUser: (walletAddress: string, userData: Partial<User>): User => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.walletAddress === walletAddress);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = {
      ...users[userIndex],
      ...userData,
    };

    saveUsers(users);
    return users[userIndex];
  },

  // Get user by wallet address
  getUser: (walletAddress: string): User | null => {
    const users = getUsers();
    return users.find(u => u.walletAddress === walletAddress) || null;
  },

  // Get all creators
  getCreators: (): User[] => {
    const users = getUsers();
    return users.filter(u => u.role === 'creator');
  },

  // Get all followers
  getFollowers: (): User[] => {
    const users = getUsers();
    return users.filter(u => u.role === 'follower');
  },
};

// Posts API
export const postsApi = {
  // Create a new post
  createPost: (creatorAddress: string, content: string): Post => {
    const posts = getPosts();
    const users = getUsers();
    
    // Verify creator exists
    const creator = users.find(u => u.walletAddress === creatorAddress && u.role === 'creator');
    if (!creator) {
      throw new Error('Creator not found');
    }

    const newPost: Post = {
      id: Date.now().toString(),
      creatorAddress,
      content,
      timestamp: new Date().toISOString(),
      likes: [],
      comments: [],
    };

    posts.push(newPost);
    savePosts(posts);
    return newPost;
  },

  // Get all posts
  getPosts: (): Post[] => {
    return getPosts();
  },

  // Get posts by creator
  getCreatorPosts: (creatorAddress: string): Post[] => {
    const posts = getPosts();
    return posts.filter(p => p.creatorAddress === creatorAddress);
  },

  // Like/Unlike a post
  toggleLike: (postId: string, userAddress: string): Post => {
    const posts = getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
      throw new Error('Post not found');
    }

    const post = posts[postIndex];
    const likeIndex = post.likes.indexOf(userAddress);

    if (likeIndex === -1) {
      post.likes.push(userAddress);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    savePosts(posts);
    return post;
  },

  // Add a comment
  addComment: (postId: string, userAddress: string, content: string): Comment => {
    const posts = getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) {
      throw new Error('Post not found');
    }

    const comment: Comment = {
      id: Date.now().toString(),
      postId,
      userAddress,
      content,
      timestamp: new Date().toISOString(),
    };

    posts[postIndex].comments.push(comment);
    savePosts(posts);
    return comment;
  },

  // Get comments for a post
  getComments: (postId: string): Comment[] => {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    return post ? post.comments : [];
  },
};

// Token API
export const tokenApi = {
  // Create a new token reward
  createTokenReward: (creatorAddress: string, data: Omit<TokenReward, 'id' | 'creatorAddress' | 'mintedSupply'>): TokenReward => {
    const rewards = getTokenRewards();
    const newReward: TokenReward = {
      id: crypto.randomUUID(),
      creatorAddress,
      mintedSupply: 0,
      totalSupply: data.totalSupply,
      rewards: {
        likes: {
          amount: data.rewards.likes?.amount || 0
        },
        comments: {
          amount: data.rewards.comments?.amount || 0
        },
        followers: {
          amount: data.rewards.followers?.amount || 0
        }
      }
    };
    rewards.push(newReward);
    saveTokenRewards(rewards);
    return newReward;
  },

  // Get all token rewards for a creator
  getCreatorTokenRewards: (creatorAddress: string): TokenReward[] => {
    const rewards = getTokenRewards();
    return rewards.filter(r => r.creatorAddress === creatorAddress);
  },

  // Award tokens to a user based on their interactions
  awardTokens: (userAddress: string, creatorAddress: string): number => {
    const users = getUsers();
    const posts = getPosts();
    const rewards = getTokenRewards();
    
    // Get user's interactions with creator's posts
    const userInteractions = posts
      .filter(p => p.creatorAddress === creatorAddress)
      .reduce((acc, post) => {
        const likes = post.likes.includes(userAddress) ? 1 : 0;
        const comments = post.comments.filter(c => c.userAddress === userAddress).length;
        return {
          likes: acc.likes + likes,
          comments: acc.comments + comments
        };
      }, { likes: 0, comments: 0 });

    // Check if user is a follower
    const user = users.find(u => u.walletAddress === userAddress);
    const isFollower = user?.role === 'follower';

    // Find applicable reward
    const applicableReward = rewards
      .filter(r => r.creatorAddress === creatorAddress)
      .find(r => r.mintedSupply < r.totalSupply);

    if (applicableReward) {
      // Calculate tokens to award
      const likeTokens = userInteractions.likes * applicableReward.rewards.likes.amount;
      const commentTokens = userInteractions.comments * applicableReward.rewards.comments.amount;
      const followerTokens = isFollower ? applicableReward.rewards.followers.amount : 0;
      const totalTokens = likeTokens + commentTokens + followerTokens;
      
      // Check if we can mint these tokens
      if (totalTokens > 0 && (applicableReward.mintedSupply + totalTokens) <= applicableReward.totalSupply) {
        // Update user's token balance
        const userIndex = users.findIndex(u => u.walletAddress === userAddress);
        if (userIndex !== -1) {
          const user = users[userIndex];
          user.tokens = user.tokens || {};
          user.tokens[creatorAddress] = (user.tokens[creatorAddress] || 0) + totalTokens;
          saveUsers(users);

          // Update minted supply
          const rewardIndex = rewards.findIndex(r => r.id === applicableReward.id);
          if (rewardIndex !== -1) {
            rewards[rewardIndex].mintedSupply += totalTokens;
            saveTokenRewards(rewards);
          }

          return totalTokens;
        }
      }
    }

    return 0;
  },

  // Get user's token balance for a specific creator
  getUserTokens: (userAddress: string, creatorAddress: string): number => {
    const users = getUsers();
    const user = users.find(u => u.walletAddress === userAddress);
    return user?.tokens?.[creatorAddress] || 0;
  },

  // Get user's total token balances across all creators
  getUserAllTokens: (userAddress: string): { [creatorAddress: string]: number } => {
    const users = getUsers();
    const user = users.find(u => u.walletAddress === userAddress);
    return user?.tokens || {};
  }
};

// Initialize with some mock data if empty
const initializeMockData = () => {
  const users = getUsers();
  const posts = getPosts();

  if (users.length === 0) {
    const mockUsers: User[] = [
      {
        walletAddress: '0x123',
        role: 'creator',
        name: 'Alice',
        bio: 'Digital artist and NFT creator',
        tags: ['art', 'nft', 'digital'],
        createdAt: new Date().toISOString(),
      },
      {
        walletAddress: '0x456',
        role: 'follower',
        name: 'Bob',
        bio: 'NFT enthusiast',
        interests: ['art', 'collecting'],
        createdAt: new Date().toISOString(),
      },
      {
        walletAddress: '0x789',
        role: 'creator',
        name: 'Charlie',
        bio: 'Web3 developer and educator',
        tags: ['web3', 'development', 'education'],
        createdAt: new Date().toISOString(),
      },
      {
        walletAddress: '0xabc',
        role: 'follower',
        name: 'Diana',
        bio: 'Crypto investor and tech enthusiast',
        interests: ['crypto', 'web3', 'technology'],
        createdAt: new Date().toISOString(),
      },
    ];
    saveUsers(mockUsers);
  }

  if (posts.length === 0) {
    const mockPosts: Post[] = [
      {
        id: '1',
        creatorAddress: '0x123',
        content: 'Just launched my new NFT collection! Check it out and let me know what you think. This collection represents my journey in digital art over the past year.',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        likes: ['0x456', '0xabc'],
        comments: [
          {
            id: '1',
            postId: '1',
            userAddress: '0x456',
            content: 'Looks amazing! Can\'t wait to see more.',
            timestamp: new Date(Date.now() - 3500000).toISOString(),
          },
          {
            id: '2',
            postId: '1',
            userAddress: '0xabc',
            content: 'The colors in this collection are stunning! What inspired you?',
            timestamp: new Date(Date.now() - 3400000).toISOString(),
          },
          {
            id: '3',
            postId: '1',
            userAddress: '0x123',
            content: 'Thanks everyone! The inspiration came from my travels through Southeast Asia last summer.',
            timestamp: new Date(Date.now() - 3300000).toISOString(),
          },
        ],
      },
      {
        id: '2',
        creatorAddress: '0x789',
        content: 'Just published a new tutorial on building smart contracts with Cairo! Check it out and let me know if you have any questions. Link in bio.',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        likes: ['0x456', '0xabc', '0x123'],
        comments: [
          {
            id: '4',
            postId: '2',
            userAddress: '0x456',
            content: 'This is exactly what I needed! Been struggling with Cairo for weeks.',
            timestamp: new Date(Date.now() - 7100000).toISOString(),
          },
          {
            id: '5',
            postId: '2',
            userAddress: '0xabc',
            content: 'Great tutorial! Would love to see more content about testing strategies.',
            timestamp: new Date(Date.now() - 7000000).toISOString(),
          },
        ],
      },
      {
        id: '3',
        creatorAddress: '0x123',
        content: 'Working on some exciting new pieces for my next collection. Here\'s a sneak peek at the concept art. What do you think about the direction?',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        likes: ['0x789', '0xabc'],
        comments: [
          {
            id: '6',
            postId: '3',
            userAddress: '0x789',
            content: 'The geometric patterns are fascinating! Are you using any specific algorithms to generate these?',
            timestamp: new Date(Date.now() - 86000000).toISOString(),
          },
          {
            id: '7',
            postId: '3',
            userAddress: '0xabc',
            content: 'This style reminds me of your early work, but with a more refined approach. Love it!',
            timestamp: new Date(Date.now() - 85800000).toISOString(),
          },
          {
            id: '8',
            postId: '3',
            userAddress: '0x456',
            content: 'Can\'t wait to see the final pieces! Will there be an auction?',
            timestamp: new Date(Date.now() - 85600000).toISOString(),
          },
          {
            id: '9',
            postId: '3',
            userAddress: '0x123',
            content: 'Thanks for the feedback! Yes, I\'m using a custom algorithm I developed. And yes, there will be an auction next month!',
            timestamp: new Date(Date.now() - 85400000).toISOString(),
          },
        ],
      },
      {
        id: '4',
        creatorAddress: '0x789',
        content: 'Just wrapped up a successful workshop on StarkNet development! Thanks to everyone who participated. The community questions were fantastic. I\'ll be posting the recording soon.',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        likes: ['0x123', '0x456', '0xabc'],
        comments: [
          {
            id: '10',
            postId: '4',
            userAddress: '0x123',
            content: 'The workshop was incredibly helpful! Learned so much about account abstraction.',
            timestamp: new Date(Date.now() - 172000000).toISOString(),
          },
          {
            id: '11',
            postId: '4',
            userAddress: '0x456',
            content: 'Will you be doing more workshops soon? I missed this one but would love to join the next.',
            timestamp: new Date(Date.now() - 171000000).toISOString(),
          },
          {
            id: '12',
            postId: '4',
            userAddress: '0x789',
            content: 'Yes! Planning another one next month. I\'ll announce the date soon.',
            timestamp: new Date(Date.now() - 170000000).toISOString(),
          },
        ],
      },
    ];
    savePosts(mockPosts);
  }
};

// Initialize mock data
initializeMockData(); 