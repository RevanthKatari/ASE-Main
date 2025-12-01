import { User } from './user';

export interface CommunityEvent {
  id: number;
  title: string;
  description: string;
  start_time: string;
  location: string;
  iframe_url?: string;
  created_at: string;
  creator: User;
}

