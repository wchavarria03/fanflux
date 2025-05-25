// Types
export interface User {
  walletAddress: string;
  role: "creator" | "follower";
  name: string;
  bio: string;
  interests?: string[];
  tags?: string[];
  createdAt: string;
  tokens?: { [creatorAddress: string]: number }; // Map of creator address to token amount
  subscriptions?: string[]; // Array of community IDs the user is subscribed to
}

export interface Community {
  id: string;
  name: string;
  description: string;
  creatorAddress: string;
  createdAt: string;
  tags?: string[];
  followers?: string[]; // Array of follower wallet addresses
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
  createdAt: string;
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

export interface Article {
  id: string;
  communityId: string;
  title: string;
  description: string;
  content: string;
  price: number;
  createdAt: string;
  creatorAddress: string;
  imageUrl: string;
}

// Storage keys
const USERS_KEY = "fanflux_users";
const POSTS_KEY = "fanflux_posts";
const TOKEN_REWARDS_KEY = "fanflux_token_rewards";
const COMMUNITIES_KEY = "fanflux_communities";
const ARTICLES_KEY = "fanflux_articles";

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

const getCommunities = (): Community[] => {
  const communities = localStorage.getItem(COMMUNITIES_KEY);
  return communities ? JSON.parse(communities) : [];
};

const getArticles = (): Article[] => {
  const articles = localStorage.getItem(ARTICLES_KEY);
  return articles ? JSON.parse(articles) : [];
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

const saveCommunities = (communities: Community[]) => {
  localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(communities));
};

const saveArticles = (articles: Article[]) => {
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
};

// User API
export const userApi = {
  // Register a new user
  registerUser: (
    walletAddress: string,
    role: "creator" | "follower",
    userData: Partial<User>,
  ): User => {
    const users = getUsers();

    // Check if user already exists
    const existingUser = users.find((u) => u.walletAddress === walletAddress);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser: User = {
      walletAddress,
      role,
      name: userData.name || "",
      bio: userData.bio || "",
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
    const userIndex = users.findIndex((u) => u.walletAddress === walletAddress);

    if (userIndex === -1) {
      throw new Error("User not found");
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
    return users.find((u) => u.walletAddress === walletAddress) || null;
  },

  // Get all creators
  getCreators: (): User[] => {
    const users = getUsers();
    return users.filter((u) => u.role === "creator");
  },

  // Get all followers
  getFollowers: (): User[] => {
    const users = getUsers();
    return users.filter((u) => u.role === "follower");
  },

  // Subscribe to a community
  subscribeToCommunity: (userAddress: string, communityId: string): User => {
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.walletAddress === userAddress);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const user = users[userIndex];
    user.subscriptions = user.subscriptions || [];

    if (!user.subscriptions.includes(communityId)) {
      user.subscriptions.push(communityId);
      saveUsers(users);
    }

    return user;
  },

  // Unsubscribe from a community
  unsubscribeFromCommunity: (
    userAddress: string,
    communityId: string,
  ): User => {
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.walletAddress === userAddress);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const user = users[userIndex];
    user.subscriptions = user.subscriptions || [];
    user.subscriptions = user.subscriptions.filter((id) => id !== communityId);
    saveUsers(users);

    return user;
  },

  // Check if user is subscribed to a community
  isSubscribedToCommunity: (
    userAddress: string,
    communityId: string,
  ): boolean => {
    const users = getUsers();
    const user = users.find((u) => u.walletAddress === userAddress);
    return user?.subscriptions?.includes(communityId) || false;
  },

  // Get user's subscribed communities
  getUserSubscriptions: (userAddress: string): string[] => {
    const users = getUsers();
    const user = users.find((u) => u.walletAddress === userAddress);
    return user?.subscriptions || [];
  },
};

// Posts API
export const postsApi = {
  // Create a new post
  createPost: (creatorAddress: string, content: string): Post => {
    const posts = getPosts();
    const users = getUsers();

    // Verify creator exists
    const creator = users.find(
      (u) => u.walletAddress === creatorAddress && u.role === "creator",
    );
    if (!creator) {
      throw new Error("Creator not found");
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
    return posts.filter((p) => p.creatorAddress === creatorAddress);
  },

  // Like/Unlike a post
  toggleLike: (postId: string, userAddress: string): Post => {
    const posts = getPosts();
    const postIndex = posts.findIndex((p) => p.id === postId);

    if (postIndex === -1) {
      throw new Error("Post not found");
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
  addComment: (
    postId: string,
    userAddress: string,
    content: string,
  ): Comment => {
    const posts = getPosts();
    const postIndex = posts.findIndex((p) => p.id === postId);

    if (postIndex === -1) {
      throw new Error("Post not found");
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
    const post = posts.find((p) => p.id === postId);
    return post ? post.comments : [];
  },
};

// Token API
export const tokenApi = {
  // Create a new token reward
  createTokenReward: (
    creatorAddress: string,
    data: Omit<
      TokenReward,
      "id" | "creatorAddress" | "mintedSupply" | "createdAt"
    >,
  ): TokenReward => {
    const rewards = getTokenRewards();
    const newReward: TokenReward = {
      id: crypto.randomUUID(),
      creatorAddress,
      mintedSupply: 0,
      totalSupply: data.totalSupply,
      createdAt: new Date().toISOString(),
      rewards: {
        likes: {
          amount: data.rewards.likes?.amount || 0,
        },
        comments: {
          amount: data.rewards.comments?.amount || 0,
        },
        followers: {
          amount: data.rewards.followers?.amount || 0,
        },
      },
    };
    rewards.push(newReward);
    saveTokenRewards(rewards);
    return newReward;
  },

  // Get all token rewards for a creator
  getCreatorTokenRewards: (creatorAddress: string): TokenReward[] => {
    const rewards = getTokenRewards();
    return rewards.filter((r) => r.creatorAddress === creatorAddress);
  },

  // Award tokens to a user based on their interactions
  awardTokens: (userAddress: string, creatorAddress: string): number => {
    const users = getUsers();
    const posts = getPosts();
    const rewards = getTokenRewards();

    // Get user's interactions with creator's posts
    const userInteractions = posts
      .filter((p) => p.creatorAddress === creatorAddress)
      .reduce(
        (acc, post) => {
          const likes = post.likes.includes(userAddress) ? 1 : 0;
          const comments = post.comments.filter(
            (c) => c.userAddress === userAddress,
          ).length;
          return {
            likes: acc.likes + likes,
            comments: acc.comments + comments,
          };
        },
        { likes: 0, comments: 0 },
      );

    // Check if user is a follower
    const user = users.find((u) => u.walletAddress === userAddress);
    const isFollower = user?.role === "follower";

    // Find applicable reward
    const applicableReward = rewards
      .filter((r) => r.creatorAddress === creatorAddress)
      .find((r) => r.mintedSupply < r.totalSupply);

    if (applicableReward) {
      // Calculate tokens to award
      const likeTokens =
        userInteractions.likes * applicableReward.rewards.likes.amount;
      const commentTokens =
        userInteractions.comments * applicableReward.rewards.comments.amount;
      const followerTokens = isFollower
        ? applicableReward.rewards.followers.amount
        : 0;
      const totalTokens = likeTokens + commentTokens + followerTokens;

      // Check if we can mint these tokens
      if (
        totalTokens > 0 &&
        applicableReward.mintedSupply + totalTokens <=
          applicableReward.totalSupply
      ) {
        // Update user's token balance
        const userIndex = users.findIndex(
          (u) => u.walletAddress === userAddress,
        );
        if (userIndex !== -1) {
          const user = users[userIndex];
          user.tokens = user.tokens || {};
          user.tokens[creatorAddress] =
            (user.tokens[creatorAddress] || 0) + totalTokens;
          saveUsers(users);

          // Update minted supply
          const rewardIndex = rewards.findIndex(
            (r) => r.id === applicableReward.id,
          );
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
    const user = users.find((u) => u.walletAddress === userAddress);
    return user?.tokens?.[creatorAddress] || 0;
  },

  // Get user's total token balances across all creators
  getUserAllTokens: (
    userAddress: string,
  ): { [creatorAddress: string]: number } => {
    const users = getUsers();
    const user = users.find((u) => u.walletAddress === userAddress);
    return user?.tokens || {};
  },
};

// Community API
export const communityApi = {
  // Create a new community
  createCommunity: (
    creatorAddress: string,
    data: Omit<Community, "id" | "creatorAddress" | "createdAt">,
  ): Community => {
    const communities = getCommunities();
    const newCommunity: Community = {
      id: crypto.randomUUID(),
      creatorAddress,
      createdAt: new Date().toISOString(),
      ...data,
    };
    communities.push(newCommunity);
    saveCommunities(communities);
    return newCommunity;
  },

  // Get community by creator address
  getCreatorCommunity: (creatorAddress: string): Community | null => {
    const communities = getCommunities();
    return communities.find((c) => c.creatorAddress === creatorAddress) || null;
  },

  // Get community by ID
  getCommunity: (id: string): Community | null => {
    const communities = getCommunities();
    return communities.find((c) => c.id === id) || null;
  },

  // Update community
  updateCommunity: (
    id: string,
    data: Partial<Omit<Community, "id" | "creatorAddress" | "createdAt">>,
  ): Community => {
    const communities = getCommunities();
    const index = communities.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Community not found");
    }
    communities[index] = {
      ...communities[index],
      ...data,
    };
    saveCommunities(communities);
    return communities[index];
  },

  // Delete community
  deleteCommunity: (id: string): void => {
    const communities = getCommunities();
    const filteredCommunities = communities.filter((c) => c.id !== id);
    if (filteredCommunities.length === communities.length) {
      throw new Error("Community not found");
    }
    saveCommunities(filteredCommunities);
  },

  // Get all communities
  getAllCommunities: (): Community[] => {
    return getCommunities();
  },
};

// Marketplace API
export const marketplaceApi = {
  createArticle: (
    communityId: string,
    creatorAddress: string,
    data: Omit<Article, "id" | "communityId" | "creatorAddress" | "createdAt">,
  ): Article => {
    const articles = getArticles();
    const newArticle: Article = {
      id: crypto.randomUUID(),
      communityId,
      creatorAddress,
      createdAt: new Date().toISOString(),
      ...data,
    };
    articles.push(newArticle);
    saveArticles(articles);
    return newArticle;
  },

  getCommunityArticles: (communityId: string): Article[] => {
    const articles = getArticles();
    return articles.filter((a) => a.communityId === communityId);
  },

  getArticle: (id: string): Article | null => {
    const articles = getArticles();
    return articles.find((a) => a.id === id) || null;
  },

  purchaseArticle: (articleId: string, userAddress: string): boolean => {
    const articles = getArticles();
    const users = getUsers();

    const article = articles.find((a) => a.id === articleId);
    if (!article) return false;

    const user = users.find((u) => u.walletAddress === userAddress);
    if (!user || !user.tokens || !user.tokens[article.creatorAddress])
      return false;

    const userTokens = user.tokens[article.creatorAddress];
    if (userTokens < article.price) return false;

    // Deduct tokens
    user.tokens[article.creatorAddress] -= article.price;
    saveUsers(users);

    return true;
  },

  updateArticle: (
    id: string,
    data: Partial<
      Omit<Article, "id" | "communityId" | "creatorAddress" | "createdAt">
    >,
  ): Article => {
    const articles = getArticles();
    const index = articles.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error("Article not found");
    }
    articles[index] = {
      ...articles[index],
      ...data,
    };
    saveArticles(articles);
    return articles[index];
  },

  deleteArticle: (id: string): void => {
    const articles = getArticles();
    const filteredArticles = articles.filter((a) => a.id !== id);
    if (filteredArticles.length === articles.length) {
      throw new Error("Article not found");
    }
    saveArticles(filteredArticles);
  },
};

// Initialize with some mock data if empty
const initializeMockData = () => {
  const users = getUsers();
  const posts = getPosts();
  const articles = getArticles();

  if (users.length === 0) {
    const mockUsers: User[] = [];
    saveUsers(mockUsers);
  }

  if (posts.length === 0) {
    const mockPosts: Post[] = [
      {
        id: "1",
        creatorAddress: "0x123",
        content:
          "Just launched my new NFT collection! Check it out and let me know what you think. This collection represents my journey in digital art over the past year.",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        likes: ["0x456", "0xabc"],
        comments: [
          {
            id: "1",
            postId: "1",
            userAddress: "0x456",
            content: "Looks amazing! Can't wait to see more.",
            timestamp: new Date(Date.now() - 3500000).toISOString(),
          },
          {
            id: "2",
            postId: "1",
            userAddress: "0xabc",
            content:
              "The colors in this collection are stunning! What inspired you?",
            timestamp: new Date(Date.now() - 3400000).toISOString(),
          },
          {
            id: "3",
            postId: "1",
            userAddress: "0x123",
            content:
              "Thanks everyone! The inspiration came from my travels through Southeast Asia last summer.",
            timestamp: new Date(Date.now() - 3300000).toISOString(),
          },
        ],
      },
      {
        id: "2",
        creatorAddress: "0x789",
        content:
          "Just published a new tutorial on building smart contracts with Cairo! Check it out and let me know if you have any questions. Link in bio.",
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        likes: ["0x456", "0xabc", "0x123"],
        comments: [
          {
            id: "4",
            postId: "2",
            userAddress: "0x456",
            content:
              "This is exactly what I needed! Been struggling with Cairo for weeks.",
            timestamp: new Date(Date.now() - 7100000).toISOString(),
          },
          {
            id: "5",
            postId: "2",
            userAddress: "0xabc",
            content:
              "Great tutorial! Would love to see more content about testing strategies.",
            timestamp: new Date(Date.now() - 7000000).toISOString(),
          },
        ],
      },
      {
        id: "3",
        creatorAddress: "0x123",
        content:
          "Working on some exciting new pieces for my next collection. Here's a sneak peek at the concept art. What do you think about the direction?",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        likes: ["0x789", "0xabc"],
        comments: [
          {
            id: "6",
            postId: "3",
            userAddress: "0x789",
            content:
              "The geometric patterns are fascinating! Are you using any specific algorithms to generate these?",
            timestamp: new Date(Date.now() - 86000000).toISOString(),
          },
          {
            id: "7",
            postId: "3",
            userAddress: "0xabc",
            content:
              "This style reminds me of your early work, but with a more refined approach. Love it!",
            timestamp: new Date(Date.now() - 85800000).toISOString(),
          },
          {
            id: "8",
            postId: "3",
            userAddress: "0x456",
            content:
              "Can't wait to see the final pieces! Will there be an auction?",
            timestamp: new Date(Date.now() - 85600000).toISOString(),
          },
          {
            id: "9",
            postId: "3",
            userAddress: "0x123",
            content:
              "Thanks for the feedback! Yes, I'm using a custom algorithm I developed. And yes, there will be an auction next month!",
            timestamp: new Date(Date.now() - 85400000).toISOString(),
          },
        ],
      },
      {
        id: "4",
        creatorAddress: "0x789",
        content:
          "Just wrapped up a successful workshop on StarkNet development! Thanks to everyone who participated. The community questions were fantastic. I'll be posting the recording soon.",
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        likes: ["0x123", "0x456", "0xabc"],
        comments: [
          {
            id: "10",
            postId: "4",
            userAddress: "0x123",
            content:
              "The workshop was incredibly helpful! Learned so much about account abstraction.",
            timestamp: new Date(Date.now() - 172000000).toISOString(),
          },
          {
            id: "11",
            postId: "4",
            userAddress: "0x456",
            content:
              "Will you be doing more workshops soon? I missed this one but would love to join the next.",
            timestamp: new Date(Date.now() - 171000000).toISOString(),
          },
          {
            id: "12",
            postId: "4",
            userAddress: "0x789",
            content:
              "Yes! Planning another one next month. I'll announce the date soon.",
            timestamp: new Date(Date.now() - 170000000).toISOString(),
          },
        ],
      },
    ];
    savePosts(mockPosts);
  }

  if (articles.length === 0) {
    const mockArticles: Article[] = [
      {
        id: "1",
        communityId: "a83fde87-b5b2-415f-8a6b-39f861792e2f",
        title: "Exclusive NFT Collection",
        description: "Get access to our exclusive NFT collection featuring unique digital art pieces.",
        content: "Full content here...",
        price: 100,
        createdAt: new Date().toISOString(),
        creatorAddress: "0x123",
        imageUrl: "https://picsum.photos/seed/nft1/400/400"
      },
      {
        id: "2",
        communityId: "a83fde87-b5b2-415f-8a6b-39f861792e2f",
        title: "Premium Workshop Access",
        description: "Access to our premium workshop series on digital art creation.",
        content: "Full content here...",
        price: 250,
        createdAt: new Date().toISOString(),
        creatorAddress: "0x123",
        imageUrl: "https://picsum.photos/seed/workshop1/400/400"
      },
      {
        id: "3",
        communityId: "a83fde87-b5b2-415f-8a6b-39f861792e2f",
        title: "Digital Art Masterclass",
        description: "Learn advanced techniques in digital art creation.",
        content: "Full content here...",
        price: 150,
        createdAt: new Date().toISOString(),
        creatorAddress: "0x123",
        imageUrl: "https://picsum.photos/seed/masterclass1/400/400"
      },
      {
        id: "4",
        communityId: "a83fde87-b5b2-415f-8a6b-39f861792e2f",
        title: "Community Membership",
        description: "Get exclusive access to our community events and discussions.",
        content: "Full content here...",
        price: 75,
        createdAt: new Date().toISOString(),
        creatorAddress: "0x123",
        imageUrl: "https://picsum.photos/seed/membership1/400/400"
      },
      {
        id: "5",
        communityId: "a83fde87-b5b2-415f-8a6b-39f861792e2f",
        title: "Art Tools Bundle",
        description: "Premium digital art tools and resources bundle.",
        content: "Full content here...",
        price: 200,
        createdAt: new Date().toISOString(),
        creatorAddress: "0x123",
        imageUrl: "https://picsum.photos/seed/tools1/400/400"
      },
      {
        id: "6",
        communityId: "a83fde87-b5b2-415f-8a6b-39f861792e2f",
        title: "One-on-One Mentoring",
        description: "Personal mentoring session with our expert artists.",
        content: "Full content here...",
        price: 300,
        createdAt: new Date().toISOString(),
        creatorAddress: "0x123",
        imageUrl: "https://picsum.photos/seed/mentoring1/400/400"
      },
      {
        id: "7",
        communityId: "a83fde87-b5b2-415f-8a6b-39f861792e2f",
        title: "Art Portfolio Review",
        description: "Professional review of your art portfolio.",
        content: "Full content here...",
        price: 125,
        createdAt: new Date().toISOString(),
        creatorAddress: "0x123",
        imageUrl: "https://picsum.photos/seed/portfolio1/400/400"
      },
      {
        id: "8",
        communityId: "a83fde87-b5b2-415f-8a6b-39f861792e2f",
        title: "Digital Art Templates",
        description: "Collection of premium digital art templates.",
        content: "Full content here...",
        price: 50,
        createdAt: new Date().toISOString(),
        creatorAddress: "0x123",
        imageUrl: "https://picsum.photos/seed/templates1/400/400"
      }
    ];
    saveArticles(mockArticles);
  }
};

// Initialize mock data
initializeMockData();
