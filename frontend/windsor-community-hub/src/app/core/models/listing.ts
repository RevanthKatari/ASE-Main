import { User } from './user';

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  contact: string;
  photos: string[];
  verified: boolean;
  verified_by_id?: number;
  created_at: string;
  owner: User;
}

