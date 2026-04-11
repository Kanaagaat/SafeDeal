export type DealStatus = 'money_secured' | 'shipped' | 'payment_pending' | 'completed' | 'in_progress' | 'cancelled';

export interface Deal {
  id: number;
  title: string;
  buyer: string;
  seller: string;
  price: number;
  status: DealStatus;
  role: 'buyer' | 'seller';
  createdAt?: string;
}

export interface Transaction {
  id: number;
  description: string;
  date: string;
  amount: number;
  type: 'escrow' | 'deposit' | 'release';
  status: 'completed' | 'held';
}

export interface WalletData {
  totalBalance: number;
  available: number;
  inEscrow: number;
  transactions: Transaction[];
}

export interface UserProfile {
  username: string;
  memberSince: string;
  avatar: string;
  trustScore: number;
  completedDeals: number;
  totalVolume: number;
  recentDeals: any[];
  reviews: Review[];
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CreateDealPayload {
  title: string;
  description: string;
  price: number;
  buyerContact: string;
}
