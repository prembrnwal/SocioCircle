export const API_BASE_URL = 'http://localhost:8080/api';
export const WS_BASE_URL = 'http://localhost:8080/ws-chat';

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  THEME: 'theme',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FEED: '/feed',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  POST_CREATE: '/posts/create',
  POST_DETAIL: '/posts/:postId',
  GROUPS: '/groups',
  GROUP_DETAIL: '/groups/:groupId',
  SESSIONS: '/sessions',
  SESSION_DETAIL: '/sessions/:id',
  CHAT: '/chat/:sessionId',
  FOLLOWERS: '/profile/:email/followers',
  FOLLOWING: '/profile/:email/following',
} as const;

export const POST_PAGE_SIZE = 10;
export const COMMENT_PAGE_SIZE = 20;
export const MESSAGE_PAGE_SIZE = 50;
