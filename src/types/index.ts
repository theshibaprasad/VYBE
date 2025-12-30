export type Category = 'Trending' | 'All' | 'News' | 'Sports' | 'Entertainment' | 'Movies' | 'Kids' | 'Music' | 'Documentary';

export interface Program {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number; // minutes
  genre: string[];
  rating: string;
  thumbnail: string;
}

export interface Channel {
  id: string;
  name: string;
  number: string;
  logo: string;
  category: Category;
  programs: Program[]; // Sorted by startTime
  isLive: boolean;
  currentViewerCount: number;
  streamUrl: string;
  streamType?: string; // e.g., 'application/x-mpegURL', 'video/mp4'
  language?: string; // e.g., 'English', 'Hindi'
}

export interface UserSettings {
  volume: number;
  isMuted: boolean;
  quality: 'auto' | '1080p' | '720p' | '480p' | '360p';
  dataSaver: boolean;
}
