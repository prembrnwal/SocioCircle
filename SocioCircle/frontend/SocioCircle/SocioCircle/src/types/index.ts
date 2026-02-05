// User Types
export interface User {
  email: string;
  name: string;
  bio?: string;
  interests?: string;
  profilePicture?: string;
}

export interface UserInfo {
  email: string;
  name: string;
  bio?: string;
  interests?: string;
  profilePicture?: string;
}

// Auth Types
export interface LoginRequest {
  userId: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  bio?: string;
  interests?: string;
}

export interface AuthResponse {
  token: string;
  user: UserInfo;
  tokenType: string;
  expiresIn: number;
}

// Post Types
export interface Post {
  id: number;
  userEmail: string;
  userName: string;
  userProfilePicture?: string;
  caption?: string;
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
}

export interface CreatePostRequest {
  caption: string;
  files: File[];
}

export interface Comment {
  id: number;
  postId: number;
  userEmail: string;
  userName: string;
  userProfilePicture?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination Types
export interface CursorPageResponse<T> {
  content: T[];
  nextCursor: number | null;
  hasNext: boolean;
  size: number;
}

export interface TimeCursorPageResponse<T> {
  content: T[];
  nextCursor: string | null;
  hasNext: boolean;
  size: number;
}

// Following Types
export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

// Interest Group Types
export interface InterestGroup {
  id: number;
  name: string;
  description: string;
  memberCount?: number;
  createdAt?: string;
}

// Jamming Session Types
export interface JammingSession {
  id: number;
  groupId: number;
  groupName?: string;
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  participantCount?: number;
  createdAt?: string;
}

export interface Participant {
  id: number;
  sessionId: number;
  userEmail: string;
  userName: string;
  userProfilePicture?: string;
  joinedAt: string;
}

// Chat Types
export interface ChatMessage {
  id: number;
  sessionId: number;
  userEmail: string;
  userName: string;
  userProfilePicture?: string;
  content: string;
  timestamp: string;
}

export interface SendMessageRequest {
  content: string;
}
