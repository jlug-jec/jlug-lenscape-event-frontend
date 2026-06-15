import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ErrorToast from '../components/UI/ErrorToast';
import { User, Artwork, Category, Comment, Achievement, Artist } from '../types';

// Mock Achievements list
const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach1',
    title: 'Creative Pioneer',
    description: 'Submitted your first artwork to the gallery',
    icon: '🚀',
    unlockedAt: new Date(),
  },
  {
    id: 'ach2',
    title: 'Rising Star',
    description: 'Received 5 votes on your artwork',
    icon: '⭐',
    unlockedAt: new Date(),
  },
  {
    id: 'ach3',
    title: 'Acclaimed Artist',
    description: 'Received 10 votes on your artwork',
    icon: '🏆',
    unlockedAt: new Date(),
  },
  {
    id: 'ach4',
    title: 'Master Creator',
    description: 'Received 20 votes on your artwork',
    icon: '👑',
    unlockedAt: new Date(),
  },
  {
    id: 'ach5',
    title: 'Versatile Artist',
    description: 'Received votes in 2 different categories',
    icon: '🎖️',
    unlockedAt: new Date(),
  },
  {
    id: 'ach6',
    title: 'Renaissance Creator',
    description: 'Received votes in all categories',
    icon: '💎',
    unlockedAt: new Date(),
  },
];

// Initial mock categories
const INITIAL_CATEGORIES: Category[] = [
  'photography',
  'filmmaking',
  'animation',
  'digital-art',
  'illustration',
  'motion-graphics',
  'other',
];

// Initial mock users
const MOCK_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Jlug Admin',
    email: 'admin@jlug.club',
    college: 'Jawaharlal Nehru Engineering College',
    branch: 'Computer Science',
    year: '4th Year',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    bio: 'Jlug Club Lead & Lenscape Curator.',
    votedCategories: [],
    commentedArtworks: [],
    submissions: [],
    achievements: [],
    joinedDate: new Date('2025-01-01'),
  },
  {
    id: 'user_alex',
    name: 'Alex Chen',
    email: 'alex@college.edu',
    college: 'JNEC',
    branch: 'Information Technology',
    year: '3rd Year',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
    bio: 'Pixel pusher and retro-futuristic explorer.',
    votedCategories: ['photography'],
    commentedArtworks: ['artwork_2'],
    submissions: [], // will map below
    achievements: [ALL_ACHIEVEMENTS[0]],
    joinedDate: new Date('2026-05-10'),
  },
  {
    id: 'user_sarah',
    name: 'Sarah Kim',
    email: 'sarah@college.edu',
    college: 'Delhi Technological University',
    branch: 'Electronics',
    year: '2nd Year',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sarah',
    bio: 'Cinematographer and street photographer.',
    votedCategories: ['digital-art'],
    commentedArtworks: ['artwork_1'],
    submissions: [], // will map below
    achievements: [ALL_ACHIEVEMENTS[0], ALL_ACHIEVEMENTS[1]],
    joinedDate: new Date('2026-05-15'),
  },
];

// Initial mock artworks
const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: 'artwork_1',
    title: 'Digital Horizon',
    description: 'A 3D simulation of a neon synthwave grid extending into infinity. Created using custom WebGL shaders and procedural noise. The piece aims to represent the endless landscapes of digital memories.',
    category: 'digital-art',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
    videoUrl: null,
    artist: {
      id: MOCK_USERS[1].id,
      name: MOCK_USERS[1].name,
      email: MOCK_USERS[1].email,
      college: MOCK_USERS[1].college,
      branch: MOCK_USERS[1].branch,
      year: MOCK_USERS[1].year,
      avatar: MOCK_USERS[1].avatar,
      bio: MOCK_USERS[1].bio,
      joinedDate: MOCK_USERS[1].joinedDate,
    },
    votes: 42,
    comments: [
      {
        id: 'comment_1',
        artworkId: 'artwork_1',
        userId: MOCK_USERS[2].id,
        userName: MOCK_USERS[2].name,
        content: 'The lighting on the neon grid is absolutely spectacular! Love the retro Y2K grid vibe.',
        createdAt: new Date('2026-06-01T10:00:00Z'),
      }
    ],
    createdAt: new Date('2026-05-20'),
    status: 'approved',
  },
  {
    id: 'artwork_2',
    title: 'Neon Dreams',
    description: 'Street-level long exposure photography of Tokyo in the rain, focusing on neon light reflections on wet pavement. Highlights the moody, cyberpunk energy of urban architectures.',
    category: 'photography',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
    videoUrl: null,
    artist: {
      id: MOCK_USERS[2].id,
      name: MOCK_USERS[2].name,
      email: MOCK_USERS[2].email,
      college: MOCK_USERS[2].college,
      branch: MOCK_USERS[2].branch,
      year: MOCK_USERS[2].year,
      avatar: MOCK_USERS[2].avatar,
      bio: MOCK_USERS[2].bio,
      joinedDate: MOCK_USERS[2].joinedDate,
    },
    votes: 38,
    comments: [
      {
        id: 'comment_2',
        artworkId: 'artwork_2',
        userId: MOCK_USERS[1].id,
        userName: MOCK_USERS[1].name,
        content: 'Wow, the reflection details in the puddles are crisp! What camera settings did you use?',
        createdAt: new Date('2026-06-02T14:30:00Z'),
      }
    ],
    createdAt: new Date('2026-05-22'),
    status: 'approved',
  },
  {
    id: 'artwork_3',
    title: 'Cyberpunk Corridor',
    description: 'A cinematic high-pace short film showing a student navigating a futuristic college campus. Captures elements of retro-futurism and digital dystopia.',
    category: 'filmmaking',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Mock video link
    artist: {
      id: MOCK_USERS[2].id,
      name: MOCK_USERS[2].name,
      email: MOCK_USERS[2].email,
      college: MOCK_USERS[2].college,
      branch: MOCK_USERS[2].branch,
      year: MOCK_USERS[2].year,
      avatar: MOCK_USERS[2].avatar,
      bio: MOCK_USERS[2].bio,
      joinedDate: MOCK_USERS[2].joinedDate,
    },
    votes: 56,
    comments: [],
    createdAt: new Date('2026-05-25'),
    status: 'approved',
  },
  {
    id: 'artwork_4',
    title: 'Chrome Spheres',
    description: 'An interactive 3D HTML5 animation featuring bouncing chrome-plated spheres that distort and morph on collision. Illustrates physical energy transfer in liquid mercury.',
    category: 'animation',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    videoUrl: null,
    artist: {
      id: MOCK_USERS[1].id,
      name: MOCK_USERS[1].name,
      email: MOCK_USERS[1].email,
      college: MOCK_USERS[1].college,
      branch: MOCK_USERS[1].branch,
      year: MOCK_USERS[1].year,
      avatar: MOCK_USERS[1].avatar,
      bio: MOCK_USERS[1].bio,
      joinedDate: MOCK_USERS[1].joinedDate,
    },
    votes: 72,
    comments: [],
    createdAt: new Date('2026-05-28'),
    status: 'approved',
  },
  {
    id: 'artwork_5',
    title: 'Surrealist Flora',
    description: 'A digital vector illustration reimagining botanical forms as robotic cybernetic organisms. Drawn by hand using graphic tablet and metallic brush configurations.',
    category: 'illustration',
    imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600',
    videoUrl: null,
    artist: {
      id: MOCK_USERS[1].id,
      name: MOCK_USERS[1].name,
      email: MOCK_USERS[1].email,
      college: MOCK_USERS[1].college,
      branch: MOCK_USERS[1].branch,
      year: MOCK_USERS[1].year,
      avatar: MOCK_USERS[1].avatar,
      bio: MOCK_USERS[1].bio,
      joinedDate: MOCK_USERS[1].joinedDate,
    },
    votes: 21,
    comments: [],
    createdAt: new Date('2026-05-30'),
    status: 'approved',
  },
  {
    id: 'artwork_6',
    title: 'Liquid Metal Kinetic',
    description: 'A dynamic looping GIF showing fluid chrome metal structures flowing around a wireframe core. Created in Cinema 4D.',
    category: 'motion-graphics',
    imageUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600',
    videoUrl: null,
    artist: {
      id: MOCK_USERS[2].id,
      name: MOCK_USERS[2].name,
      email: MOCK_USERS[2].email,
      college: MOCK_USERS[2].college,
      branch: MOCK_USERS[2].branch,
      year: MOCK_USERS[2].year,
      avatar: MOCK_USERS[2].avatar,
      bio: MOCK_USERS[2].bio,
      joinedDate: MOCK_USERS[2].joinedDate,
    },
    votes: 29,
    comments: [],
    createdAt: new Date('2026-06-02'),
    status: 'approved',
  },
  {
    id: 'artwork_7',
    title: 'Unreleased Cyber Dreams',
    description: 'A concept art of a futuristic museum exhibition. This submission is currently pending review by the Jlug administrators.',
    category: 'digital-art',
    imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600',
    videoUrl: null,
    artist: {
      id: MOCK_USERS[1].id,
      name: MOCK_USERS[1].name,
      email: MOCK_USERS[1].email,
      college: MOCK_USERS[1].college,
      branch: MOCK_USERS[1].branch,
      year: MOCK_USERS[1].year,
      avatar: MOCK_USERS[1].avatar,
      bio: MOCK_USERS[1].bio,
      joinedDate: MOCK_USERS[1].joinedDate,
    },
    votes: 0,
    comments: [],
    createdAt: new Date('2026-06-05'),
    status: 'pending',
  }
];

// Map user submissions initially
MOCK_USERS[1].submissions = INITIAL_ARTWORKS.filter(a => a.artist.id === MOCK_USERS[1].id);
MOCK_USERS[2].submissions = INITIAL_ARTWORKS.filter(a => a.artist.id === MOCK_USERS[2].id);

interface AppContextProps {
  currentUser: User | null;
  users: User[];
  artworks: Artwork[];
  categories: Category[];
  isBanned: (userId: string) => boolean;
  login: (email: string) => boolean;
  signup: (name: string, email: string, college: string, branch: string, year: string, bio: string, avatar: string) => void;
  logout: () => void;
  submitArtwork: (title: string, description: string, category: Category, imageUrl: string, videoUrl?: string, customCode?: string) => void;
  voteArtwork: (artworkId: string) => boolean;
  commentArtwork: (artworkId: string, content: string) => boolean;
  adminApproveArtwork: (artworkId: string) => void;
  adminRejectArtwork: (artworkId: string) => void;
  adminBanUser: (userId: string) => void;
  adminUnbanUser: (userId: string) => void;
  adminAddCategory: (category: string) => void;
  adminRemoveCategory: (category: string) => void;
  getCurrentUserSubmissions: () => Artwork[];
  bannedUsers: string[];
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [artworks, setArtworks] = useState<Artwork[]>(INITIAL_ARTWORKS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);

  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('Error');

  const triggerError = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorToast(true);
    setTimeout(() => setShowErrorToast(false), 4000);
  };


  // Load state from localStorage on mount
  useEffect(() => {
    const localUser = localStorage.getItem('lenscape_curr_user');
    const localUsers = localStorage.getItem('lenscape_users');
    const localArtworks = localStorage.getItem('lenscape_artworks');
    const localCategories = localStorage.getItem('lenscape_categories');
    const localBanned = localStorage.getItem('lenscape_banned');

    if (localUser) setCurrentUser(JSON.parse(localUser));
    if (localUsers) setUsers(JSON.parse(localUsers));
    if (localArtworks) {
      // Parse dates properly
      const parsed = JSON.parse(localArtworks).map((art: any) => ({
        ...art,
        createdAt: new Date(art.createdAt),
        comments: art.comments.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) }))
      }));
      setArtworks(parsed);
    }
    if (localCategories) setCategories(JSON.parse(localCategories));
    if (localBanned) setBannedUsers(JSON.parse(localBanned));
  }, []);

  // Save to localStorage whenever states change
  const saveState = (newCurrUser: User | null, newUsers: User[], newArtworks: Artwork[], newCats: Category[], newBanned: string[]) => {
    localStorage.setItem('lenscape_curr_user', newCurrUser ? JSON.stringify(newCurrUser) : '');
    localStorage.setItem('lenscape_users', JSON.stringify(newUsers));
    localStorage.setItem('lenscape_artworks', JSON.stringify(newArtworks));
    localStorage.setItem('lenscape_categories', JSON.stringify(newCats));
    localStorage.setItem('lenscape_banned', JSON.stringify(newBanned));
  };

  const login = (email: string): boolean => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      if (bannedUsers.includes(foundUser.id)) {
        triggerError("Account Banned", "This account is banned due to code of conduct violation.");
        return false;
      }
      setCurrentUser(foundUser);
      saveState(foundUser, users, artworks, categories, bannedUsers);
      return true;
    }
    return false;
  };

  const signup = (
    name: string,
    email: string,
    college: string,
    branch: string,
    year: string,
    bio: string,
    avatar: string
  ) => {
    const newUser: User = {
      id: 'user_' + Date.now(),
      name,
      email,
      college,
      branch,
      year,
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      bio,
      votedCategories: [],
      commentedArtworks: [],
      submissions: [],
      achievements: [],
      joinedDate: new Date(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    saveState(newUser, updatedUsers, artworks, categories, bannedUsers);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lenscape_curr_user');
  };

  const checkAndUnlockAchievements = (user: User, updatedArtworks: Artwork[]) => {
    const newAchievements = [...user.achievements];
    const userSubs = updatedArtworks.filter(a => a.artist.id === user.id);

    // Calculate total votes received by user across all their artworks
    const totalVotesReceived = userSubs.reduce((sum, artwork) => sum + artwork.votes, 0);

    // Calculate categories where user has received at least 1 vote
    const categoriesWithVotes = new Set(
      userSubs.filter(artwork => artwork.votes > 0).map(artwork => artwork.category)
    );

    // 1. Creative Pioneer: First Submission
    if (userSubs.length > 0 && !newAchievements.some(a => a.id === 'ach1')) {
      newAchievements.push({
        ...ALL_ACHIEVEMENTS[0],
        unlockedAt: new Date()
      });
    }

    // 2. Rising Star: 5 votes received
    if (totalVotesReceived >= 5 && !newAchievements.some(a => a.id === 'ach2')) {
      newAchievements.push({
        ...ALL_ACHIEVEMENTS[1],
        unlockedAt: new Date()
      });
    }

    // 3. Acclaimed Artist: 10 votes received
    if (totalVotesReceived >= 10 && !newAchievements.some(a => a.id === 'ach3')) {
      newAchievements.push({
        ...ALL_ACHIEVEMENTS[2],
        unlockedAt: new Date()
      });
    }

    // 4. Master Creator: 20 votes received
    if (totalVotesReceived >= 20 && !newAchievements.some(a => a.id === 'ach4')) {
      newAchievements.push({
        ...ALL_ACHIEVEMENTS[3],
        unlockedAt: new Date()
      });
    }

    // 5. Versatile Artist: Received votes in 2 different categories
    if (categoriesWithVotes.size >= 2 && !newAchievements.some(a => a.id === 'ach5')) {
      newAchievements.push({
        ...ALL_ACHIEVEMENTS[4],
        unlockedAt: new Date()
      });
    }

    // 6. Renaissance Creator: Received votes in all 4 categories
    if (categoriesWithVotes.size >= 4 && !newAchievements.some(a => a.id === 'ach6')) {
      newAchievements.push({
        ...ALL_ACHIEVEMENTS[5],
        unlockedAt: new Date()
      });
    }

    return newAchievements;
  };

  const submitArtwork = (
    title: string,
    description: string,
    category: Category,
    imageUrl: string,
    videoUrl?: string,
    customCode?: string
  ) => {
    if (!currentUser) return;
    if (bannedUsers.includes(currentUser.id)) {
      triggerError("Action Denied", "You are banned and cannot submit artwork.");
      return;
    }

    const newArt: Artwork = {
      id: 'artwork_' + Date.now(),
      title,
      description,
      category,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200',
      thumbnailUrl: imageUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
      videoUrl: videoUrl || null,
      artist: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        college: currentUser.college,
        branch: currentUser.branch,
        year: currentUser.year,
        avatar: currentUser.avatar,
        bio: currentUser.bio,
        joinedDate: currentUser.joinedDate,
      },
      votes: 0,
      comments: [],
      createdAt: new Date(),
      status: 'pending', // Admins must moderate
    };

    // Auto-approve if submitted by admin for demo ease, otherwise pending
    if (currentUser.id === 'user_admin') {
      newArt.status = 'approved';
    }

    const updatedArtworks = [...artworks, newArt];
    
    // Unlock achievements
    const newAchievements = checkAndUnlockAchievements(currentUser, updatedArtworks);
    
    const updatedUser: User = {
      ...currentUser,
      submissions: [...currentUser.submissions, newArt],
      achievements: newAchievements
    };

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);

    setArtworks(updatedArtworks);
    setCurrentUser(updatedUser);
    setUsers(updatedUsers);
    saveState(updatedUser, updatedUsers, updatedArtworks, categories, bannedUsers);
  };

  const voteArtwork = (artworkId: string): boolean => {
    if (!currentUser) {
      triggerError("Authentication Required", "Please log in to vote.");
      return false;
    }
    if (bannedUsers.includes(currentUser.id)) {
      triggerError("Action Denied", "Your account is banned and cannot vote.");
      return false;
    }

    const targetArtwork = artworks.find(a => a.id === artworkId);
    if (!targetArtwork) return false;

    // A user can vote only ONCE per category/domain.
    if (currentUser.votedCategories.includes(targetArtwork.category)) {
      triggerError("Already Voted", `You have already voted in the "${targetArtwork.category}" category. You can only vote once per category.`);
      return false;
    }

    // Add vote
    const updatedArtworks = artworks.map(a => 
      a.id === artworkId ? { ...a, votes: a.votes + 1 } : a
    );

    const updatedVotedCategories = [...currentUser.votedCategories, targetArtwork.category];
    const updatedUser = {
      ...currentUser,
      votedCategories: updatedVotedCategories
    };

    // Unlock achievements
    updatedUser.achievements = checkAndUnlockAchievements(updatedUser, updatedArtworks);

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);

    setArtworks(updatedArtworks);
    setCurrentUser(updatedUser);
    setUsers(updatedUsers);
    saveState(updatedUser, updatedUsers, updatedArtworks, categories, bannedUsers);
    return true;
  };

  const commentArtwork = (artworkId: string, content: string): boolean => {
    if (!currentUser) {
      triggerError("Authentication Required", "Please log in to comment.");
      return false;
    }
    if (bannedUsers.includes(currentUser.id)) {
      triggerError("Action Denied", "Your account is banned and cannot submit comments.");
      return false;
    }

    // A user can comment only once per artwork.
    if (currentUser.commentedArtworks.includes(artworkId)) {
      triggerError("Already Commented", "You have already commented on this artwork. Only one comment is allowed per artwork.");
      return false;
    }

    const newComment: Comment = {
      id: 'comment_' + Date.now(),
      artworkId,
      userId: currentUser.id,
      userName: currentUser.name,
      content,
      createdAt: new Date(),
    };

    const updatedArtworks = artworks.map(a => 
      a.id === artworkId ? { ...a, comments: [...a.comments, newComment] } : a
    );

    const updatedCommentedArtworks = [...currentUser.commentedArtworks, artworkId];
    const updatedUser = {
      ...currentUser,
      commentedArtworks: updatedCommentedArtworks
    };

    // Unlock achievements
    updatedUser.achievements = checkAndUnlockAchievements(updatedUser, updatedArtworks);

    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);

    setArtworks(updatedArtworks);
    setCurrentUser(updatedUser);
    setUsers(updatedUsers);
    saveState(updatedUser, updatedUsers, updatedArtworks, categories, bannedUsers);
    return true;
  };

  // Admin Actions
  const adminApproveArtwork = (artworkId: string) => {
    const updated = artworks.map(a => a.id === artworkId ? { ...a, status: 'approved' as const } : a);
    setArtworks(updated);
    saveState(currentUser, users, updated, categories, bannedUsers);
  };

  const adminRejectArtwork = (artworkId: string) => {
    const updated = artworks.map(a => a.id === artworkId ? { ...a, status: 'rejected' as const } : a);
    setArtworks(updated);
    saveState(currentUser, users, updated, categories, bannedUsers);
  };

  const adminBanUser = (userId: string) => {
    if (userId === 'user_admin') {
      triggerError("Action Denied", "Cannot ban the administrator account.");
      return;
    }
    const updatedBanned = [...bannedUsers, userId];
    setBannedUsers(updatedBanned);

    // If currently logged in user is this banned user, log them out
    let newCurrUser = currentUser;
    if (currentUser && currentUser.id === userId) {
      newCurrUser = null;
      setCurrentUser(null);
    }
    saveState(newCurrUser, users, artworks, categories, updatedBanned);
  };

  const adminUnbanUser = (userId: string) => {
    const updatedBanned = bannedUsers.filter(id => id !== userId);
    setBannedUsers(updatedBanned);
    saveState(currentUser, users, artworks, categories, updatedBanned);
  };

  const adminAddCategory = (category: string) => {
    const catFormatted = category.toLowerCase().replace(/\s+/g, '-') as Category;
    if (categories.includes(catFormatted)) return;
    const updated = [...categories, catFormatted];
    setCategories(updated);
    saveState(currentUser, users, artworks, updated, bannedUsers);
  };

  const adminRemoveCategory = (category: string) => {
    const updated = categories.filter(c => c !== category);
    setCategories(updated);
    saveState(currentUser, users, artworks, updated, bannedUsers);
  };

  const getCurrentUserSubmissions = (): Artwork[] => {
    if (!currentUser) return [];
    return artworks.filter(a => a.artist.id === currentUser.id);
  };

  const isBanned = (userId: string) => bannedUsers.includes(userId);

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      artworks,
      categories,
      login,
      signup,
      logout,
      submitArtwork,
      voteArtwork,
      commentArtwork,
      adminApproveArtwork,
      adminRejectArtwork,
      adminBanUser,
      adminUnbanUser,
      adminAddCategory,
      adminRemoveCategory,
      getCurrentUserSubmissions,
      bannedUsers,
      isBanned
    }}>
      {children}
      <AnimatePresence>
        {showErrorToast && (
          <ErrorToast
            setShowErrorToast={setShowErrorToast}
            errorMessage={errorMessage}
            title={errorTitle}
          />
        )}
      </AnimatePresence>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
