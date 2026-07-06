export type UserRole = 'ADMIN' | 'AGENT';

export interface User {
  id: string; // Sequential Sponsor ID, e.g. SBR0001, SBR0002...
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  sponsorId: string | null; // ID of the person who onboarded them
  joinedDate: string;
  rank?: 'Crown Club' | 'Platinum Elite' | 'Gold Partner' | 'Silver Agent' | 'Broker Affiliate';
  designation?: 'Associate' | 'Manager' | 'Sr. Manager' | 'AGM' | 'GM' | 'Sr. GM' | 'Exempt' | 'N/A';
  status: 'ACTIVE' | 'INACTIVE';
  totalDirectSales: number; // Sum of direct sales driven by this agent (in Points)
  totalDownlineSales: number; // Sum of sales driven by their network (in Points)
  
  // Custom metadata fields required for sponsors
  dob?: string;
  aadhar?: string;
  pan?: string;
  address?: string;
  photo?: string; // SBR associate photo URL or base64 placeholder
  password?: string; // Optional user password

  // Bank details section
  bankAccountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  nominee?: string;
  nomineeRelation?: string;
}

export interface InventoryUnit {
  unitNumber: string;
  size: string; // e.g. "120 Sq Yards"
  status: 'AVAILABLE' | 'BOOKED' | 'HOLD';
  bookedByAgentId?: string | null;
  buyerName?: string;
  type?: string; // e.g. "Residential" or "Commercial"
}

export interface RealEstateProject {
  id: string;
  name: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  sqYardStartingPrice: number; // Per square yard starting price in INR (normally 15000)
  imageMapUrl?: string; // Uploaded/Input map blueprint image
  inventory: {
    size: string; // Size category (e.g. "150 Sq Yards")
    units: {
      unitNumber: string;
      status: 'AVAILABLE' | 'BOOKED' | 'HOLD';
      bookedByAgentId?: string | null;
      buyerName?: string | null;
      type?: string; // e.g. "Residential" or "Commercial"
    }[];
  }[];
}

export interface Sale {
  id: string;
  project: string; // Name or ID of the SBR project
  projectId: string;
  unitNumber: string; // e.g. 'Villa A-101'
  buyerName: string;
  saleValue: number; // in Points
  agentId: string; // Broker who closed the deal
  agentName: string;
  saleDate: string;
  referenceNumber: string;
  sizeSqYards: string; // Confirmed size in square yards
  status: 'BOOKED' | 'CONFIRMED' | 'HOLD';
  bookingStatus?: 'TOKEN_RECEIVED' | 'BOOKING_DONE' | 'REGISTRY_DONE';
  tokenAmount?: number;
  ratePerSqYard?: number;
  payments?: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  amount: number; // in INR
  date: string; // YYYY-MM-DD
  paymentMode: 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';
  reference?: string;
  notes?: string;
}

export interface CommissionPayout {
  id: string;
  saleId: string;
  project: string;
  unitNumber: string;
  saleValue: number;
  agentId: string; // Broker getting paid
  agentName: string;
  level: number; // Level 1 to 10
  percentage: number; // Percentage configured for this level
  grossCommission: number; // gross commission in Points
  tdsDeduction: number; // Indian TDS
  adminFee: number; // Configured platform fee
  netCommission: number; // gross - withholding tax - admin fee (all in Points)
  status: 'PENDING' | 'APPROVED' | 'DISBURSED';
  payoutDate: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  amount?: number;
  timestamp: string;
  isRead: boolean;
}

export interface RewardConfig {
  id: string;
  title: string;
  targetVolume: number; // in Points
  rewardName: string; // e.g. "Slab Bonus", "Thar SUV", "Thailand Cruise"
  achievedCount: number;
}

export interface SalaryConfig {
  id: string;
  rank: 'Crown Club' | 'Platinum Elite' | 'Gold Partner' | 'Silver Agent' | 'Broker Affiliate';
  fixedSalary: number; // Monthly Points salary
  targetRequired: number; // Direct monthly target required
}

export interface LeadershipConfig {
  designation: 'Associate' | 'Manager' | 'Sr. Manager' | 'AGM' | 'GM' | 'Sr. GM';
  condition: string; // e.g. "4 Direct, 12 Team Members", "7 Direct (4+3 new), 30 Team Members", etc.
  directVol: number; // in Sq Yds, e.g. 10000, 15000, 30000, etc.
  incentivePrice: number; // in INR per Sq Yard, e.g. 5100, 3100, etc.
  rules: string; // Lineage & Qualification rules
}

export interface PromotionalMilestoneConfig {
  id: string;
  condition: string; // e.g. "4 Direct", "4 Direct, 12 Group Members", etc.
  award: string; // e.g. "Company Certificate", "Smart Phone", "Fridge", etc.
}

export interface SpecialMonthlyOfferConfig {
  id: string;
  volumeSqYds: number; // e.g. 500, 1000, 250, etc.
  paymentPercentage: number; // e.g. 100, 50, etc.
  perkName: string; // e.g. "Royal Enfield Bullet 350 Classic (Cash Option)"
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface MLMConfig {
  tdsPercentage: number;
  adminFeePercentage: number;
  levels: {
    level: number;
    percentage: number; // Configured level wise commissions L1 to L10
  }[];
  rewards: RewardConfig[];
  salaries: SalaryConfig[];
  leadershipConfigs: LeadershipConfig[];
  promotionalMilestones: PromotionalMilestoneConfig[];
  specialMonthlyOffers: SpecialMonthlyOfferConfig[];
  termsAndConditions: string[];
}

