import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UserInfo,
  Post,
  CreatePostRequest,
  Comment,
  CursorPageResponse,
  TimeCursorPageResponse,
  FollowStats,
  InterestGroup,
  JammingSession,
  Participant,
  ChatMessage,
  SendMessageRequest,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle 401 errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/loginUser`,
      data
    );
    return response.data;
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await axios.post<User>(`${API_BASE_URL}/adduser`, data);
    return response.data;
  }

  // User Profile APIs
  async getCurrentUser(): Promise<UserInfo> {
    const response = await this.api.get<UserInfo>('/users/me');
    return response.data;
  }

  async getUserByEmail(email: string): Promise<UserInfo> {
    const response = await this.api.get<UserInfo>(`/users/${email}`);
    return response.data;
  }

  async updateProfile(data: Partial<UserInfo>): Promise<UserInfo> {
    const response = await this.api.put<UserInfo>('/users/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.api.put<{ message: string }>('/users/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async uploadProfilePicture(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.api.post<string>('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Posts APIs
  async getFeed(cursor?: number, size: number = 10): Promise<CursorPageResponse<Post>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor.toString());
    params.append('size', size.toString());
    const response = await this.api.get<CursorPageResponse<Post>>(
      `/posts/feed?${params.toString()}`
    );
    return response.data;
  }

  async getFollowingFeed(cursor?: number, size: number = 10): Promise<CursorPageResponse<Post>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor.toString());
    params.append('size', size.toString());
    const response = await this.api.get<CursorPageResponse<Post>>(
      `/posts/feed/following?${params.toString()}`
    );
    return response.data;
  }

  async getPost(postId: number): Promise<Post> {
    const response = await this.api.get<Post>(`/posts/${postId}`);
    return response.data;
  }

  async createPost(data: CreatePostRequest): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('caption', data.caption);
    data.files.forEach((file) => {
      formData.append('files', file);
    });
    const response = await this.api.post<{ message: string }>('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updatePost(postId: number, caption: string): Promise<Post> {
    const response = await this.api.put<Post>(`/posts/${postId}?caption=${encodeURIComponent(caption)}`);
    return response.data;
  }

  async deletePost(postId: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/posts/${postId}`);
    return response.data;
  }

  async likePost(postId: number): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(`/posts/${postId}/like`);
    return response.data;
  }

  async unlikePost(postId: number): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(`/posts/${postId}/unlike`);
    return response.data;
  }

  async getPostLikes(postId: number): Promise<{ likeCount: number; hasLiked: boolean }> {
    const response = await this.api.get<{ likeCount: number; hasLiked: boolean }>(
      `/posts/${postId}/likes`
    );
    return response.data;
  }

  async addComment(postId: number, content: string): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(
      `/posts/${postId}/comment`,
      content,
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
    return response.data;
  }

  async getComments(postId: number): Promise<Comment[]> {
    const response = await this.api.get<Comment[]>(`/posts/${postId}/comments`);
    return response.data;
  }

  async getCommentCount(postId: number): Promise<{ commentCount: number }> {
    const response = await this.api.get<{ commentCount: number }>(
      `/posts/${postId}/comments/count`
    );
    return response.data;
  }

  async updateComment(postId: number, commentId: number, content: string): Promise<Comment> {
    const response = await this.api.put<Comment>(
      `/posts/${postId}/comments/${commentId}`,
      content,
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
    return response.data;
  }

  async deleteComment(postId: number, commentId: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(
      `/posts/${postId}/comments/${commentId}`
    );
    return response.data;
  }

  async getUserPosts(userEmail: string, cursor?: number, size: number = 10): Promise<CursorPageResponse<Post>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor.toString());
    params.append('size', size.toString());
    const response = await this.api.get<CursorPageResponse<Post>>(
      `/posts/user/${userEmail}?${params.toString()}`
    );
    return response.data;
  }

  async getMyPosts(): Promise<Post[]> {
    const response = await this.api.get<Post[]>('/posts/my-posts');
    return response.data;
  }

  // Following APIs
  async followUser(email: string): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(`/users/${email}/follow`);
    return response.data;
  }

  async unfollowUser(email: string): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(`/users/${email}/unfollow`);
    return response.data;
  }

  async getFollowers(email: string): Promise<UserInfo[]> {
    const response = await this.api.get<UserInfo[]>(`/users/${email}/followers`);
    return response.data;
  }

  async getFollowing(email: string): Promise<UserInfo[]> {
    const response = await this.api.get<UserInfo[]>(`/users/${email}/following`);
    return response.data;
  }

  async isFollowing(email: string): Promise<boolean> {
    const response = await this.api.get<boolean>(`/users/${email}/is-following`);
    return response.data;
  }

  async getFollowStats(email: string): Promise<FollowStats> {
    const response = await this.api.get<FollowStats>(`/users/${email}/follow-stats`);
    return response.data;
  }

  async getMyFollowers(): Promise<UserInfo[]> {
    const response = await this.api.get<UserInfo[]>('/users/me/followers');
    return response.data;
  }

  async getMyFollowing(): Promise<UserInfo[]> {
    const response = await this.api.get<UserInfo[]>('/users/me/following');
    return response.data;
  }

  // Interest Groups APIs
  async getGroups(): Promise<InterestGroup[]> {
    const response = await this.api.get<InterestGroup[]>('/groups');
    return response.data;
  }

  async getGroup(groupId: number): Promise<InterestGroup> {
    const response = await this.api.get<InterestGroup>(`/groups/${groupId}`);
    return response.data;
  }

  async createGroup(name: string, description: string): Promise<InterestGroup> {
    const response = await this.api.post<InterestGroup>('/groups', { name, description });
    return response.data;
  }

  async joinGroup(groupId: number): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(`/groups/${groupId}/join`);
    return response.data;
  }

  async leaveGroup(groupId: number): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(`/groups/${groupId}/leave`);
    return response.data;
  }

  // Jamming Sessions APIs
  async getGroupSessions(
    groupId: number,
    cursor?: string,
    limit: number = 10
  ): Promise<TimeCursorPageResponse<JammingSession>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    const response = await this.api.get<TimeCursorPageResponse<JammingSession>>(
      `/sessions/groups/${groupId}?${params.toString()}`
    );
    return response.data;
  }

  async createSession(
    groupId: number,
    title: string,
    description: string,
    startTime: string,
    durationMinutes: number
  ): Promise<JammingSession> {
    const response = await this.api.post<JammingSession>(`/sessions/groups/${groupId}`, {
      title,
      description,
      startTime,
      durationMinutes,
    });
    return response.data;
  }

  async joinSession(sessionId: number): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(`/sessions/${sessionId}/join`);
    return response.data;
  }

  async leaveSession(sessionId: number): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>(`/sessions/${sessionId}/leave`);
    return response.data;
  }

  async getSessionParticipants(
    sessionId: number,
    cursor?: string,
    limit: number = 20
  ): Promise<TimeCursorPageResponse<Participant>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    const response = await this.api.get<TimeCursorPageResponse<Participant>>(
      `/sessions/${sessionId}/participants?${params.toString()}`
    );
    return response.data;
  }

  async getAllSessionParticipants(sessionId: number): Promise<Participant[]> {
    const response = await this.api.get<Participant[]>(`/sessions/${sessionId}/participants/all`);
    return response.data;
  }

  // Chat APIs
  async getChatMessages(
    sessionId: number,
    cursor?: string,
    limit: number = 50
  ): Promise<TimeCursorPageResponse<ChatMessage>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    const response = await this.api.get<TimeCursorPageResponse<ChatMessage>>(
      `/chat/sessions/${sessionId}/messages?${params.toString()}`
    );
    return response.data;
  }
}

export const apiService = new ApiService();
