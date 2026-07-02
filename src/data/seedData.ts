import { User, RealEstateProject, Sale, CommissionPayout, Notification, MLMConfig } from '../types';

export const INITIAL_MLM_CONFIG: MLMConfig = {
  tdsPercentage: 5.0, // 5% standard withholding tax on points
  adminFeePercentage: 1.0, // 1% administrative service fee in points
  levels: [
    { level: 1, percentage: 7.0 },  // Level 1: 7.0% Direct Broker
    { level: 2, percentage: 2.0 },  // Level 2: 2.0% Upline 1
    { level: 3, percentage: 1.5 },  // Level 3: 1.5% Upline 2
    { level: 4, percentage: 1.0 },  // Level 4: 1.0%
    { level: 5, percentage: 1.0 },  // Level 5: 1.0%
    { level: 6, percentage: 0.5 },  // Level 6: 0.5%
    { level: 7, percentage: 0.4 },  // Level 7: 0.4%
    { level: 8, percentage: 0.3 },  // Level 8: 0.3%
    { level: 9, percentage: 0.6 },  // Level 9: 0.6%
    { level: 10, percentage: 0.7 }  // Level 10: 0.7%
  ],
  rewards: [
    { id: 'rew-1', title: 'Bronze SBR Shield', targetVolume: 20, rewardName: 'Gold Electroplated Shield & 5 PTS Bonus', achievedCount: 4 },
    { id: 'rew-2', title: 'Silver Milestone', targetVolume: 50, rewardName: 'Apple iPad & 10 PTS Bonus', achievedCount: 2 },
    { id: 'rew-3', title: 'Gold Partner Ride', targetVolume: 100, rewardName: 'Incredible India Travel Voucher (25 PTS)', achievedCount: 1 },
    { id: 'rew-4', title: 'Platinum Elite Cruising', targetVolume: 200, rewardName: '6-Day Luxury Tour Or 50 PTS Bonus', achievedCount: 0 },
    { id: 'rew-5', title: 'Crown Ultimate Legend', targetVolume: 500, rewardName: 'Elite Club Membership Or 150 PTS Bonus', achievedCount: 0 }
  ],
  salaries: [
    { id: 'sal-1', rank: 'Broker Affiliate', fixedSalary: 10, targetRequired: 10 },
    { id: 'sal-2', rank: 'Silver Agent', fixedSalary: 25, targetRequired: 20 },
    { id: 'sal-3', rank: 'Gold Partner', fixedSalary: 50, targetRequired: 50 },
    { id: 'sal-4', rank: 'Platinum Elite', fixedSalary: 100, targetRequired: 100 },
    { id: 'sal-5', rank: 'Crown Club', fixedSalary: 250, targetRequired: 250 }
  ],
  leadershipConfigs: [
    { designation: 'Manager', condition: '4 Direct, 12 Team Members', directVol: 10000, incentivePrice: 5100, rules: 'Standard baseline distribution rules.' },
    { designation: 'Sr. Manager', condition: '7 Direct (4 + 3 new), 30 Team Members (Total 42 in leg setup)', directVol: 15000, incentivePrice: 3100, rules: 'Requires 1 active Manager downline.' },
    { designation: 'AGM', condition: '9 Direct (7 + 2 new), 60 Team Members (Total 102 in leg setup)', directVol: 30000, incentivePrice: 2200, rules: 'Requires 2 Sr. Managers from separate legs.' },
    { designation: 'GM', condition: '10 Direct (9 + 1 new), 100 Team Members (Total 202 in leg setup)', directVol: 50000, incentivePrice: 2100, rules: 'Requires 2 AGMs from separate legs.' },
    { designation: 'Sr. GM', condition: '11 Direct (10 + 1 new), 200 Team Members (Total 402 in leg setup)', directVol: 70000, incentivePrice: 1100, rules: 'Requires 2 GMs from separate legs.' }
  ],
  promotionalMilestones: [
    { id: 'prm-1', condition: '4 Direct', award: 'Company Certificate' },
    { id: 'prm-2', condition: '6 Direct', award: 'Smart Phone' },
    { id: 'prm-3', condition: '8 Direct', award: 'Fridge' },
    { id: 'prm-4', condition: '10 Direct', award: 'Washing Machine' },
    { id: 'prm-5', condition: '4 Direct, 12 Group Members', award: '₹5,100 Cash + Domestic Tour Package' },
    { id: 'prm-6', condition: '7 Direct, 42 Group Members', award: 'LED TV' },
    { id: 'prm-7', condition: '7 Direct, 60 Group Members', award: '₹31,000 Cash + Tour Package' },
    { id: 'prm-8', condition: '9 Direct, 150 Group Members', award: '₹41,000 Cash + Family Tour' },
    { id: 'prm-9', condition: '10 Direct, 300 Group Members', award: 'Car + ₹51,000 Cash + Tour Package' },
    { id: 'prm-10', condition: '11 Direct, 500 Group Members', award: 'Residential Plot (Size: 50-100 Gaj)' }
  ],
  specialMonthlyOffers: [
    { id: 'smo-1', volumeSqYds: 500, paymentPercentage: 100, perkName: 'Royal Enfield Bullet 350 Classic (Cash Option)', startDate: '2026-06-01', endDate: '2026-06-30' },
    { id: 'smo-2', volumeSqYds: 1000, paymentPercentage: 50, perkName: 'Car + Gifts + 3-Day Family Tour', startDate: '2026-06-01', endDate: '2026-07-15' },
    { id: 'smo-3', volumeSqYds: 250, paymentPercentage: 100, perkName: 'Apple iPhone', startDate: '2026-06-01', endDate: '2026-12-31' },
    { id: 'smo-4', volumeSqYds: 200, paymentPercentage: 100, perkName: 'Electronic Activa Scooter', startDate: '2026-06-10', endDate: '2026-06-25' },
    { id: 'smo-5', volumeSqYds: 750, paymentPercentage: 70, perkName: '50 sq. yds Plot (50% Payment Co-sponsored by Company)', startDate: '2026-05-01', endDate: '2026-06-15' },
    { id: 'smo-6', volumeSqYds: 1500, paymentPercentage: 80, perkName: '100 sq. yds Plot (100% Payment Fully Sponsored by Company)', startDate: '2026-07-01', endDate: '2026-07-31' }
  ],
  termsAndConditions: [
    'Tax Deductions: T.D.S. will be released strictly as per prevailing statutory government rules.',
    'Compliance: Payout funds will be released solely upon submission and validation of a valid PAN card number.',
    'Sales Crediting: A sale is officially validated and credited only after a minimum of 30% payment for the plot is successfully received.',
    'Disbursement: All accrued payments will be released as a unified, one-time settlement.',
    'Standard Metric Conversion: For calculation purposes, 50 sq. yards precisely denotes 1 unit sale.',
    'Bigger Leg Split: 50% of overall income calculation will be credited from the higher volume/bigger leg.',
    'Weak Leg Split: 100% of overall income calculation will be credited from the lower volume/weak leg.',
    'Evaluation Window: The annual program eligibility and rewards tracking cycle spans from 1st January to 31st December.',
    'Award Handover: Promotional milestone awards will physically manifest only after 100% full payment is received for the sales of the plots.',
    'Dashboard Visibility: Qualified awards are prominently displayed on performance dashboards once 60% payment milestones are reached.',
    'Account Activation: Securing a minimum of 1 unit sale is mandatory for permanent network account ID activation.'
  ]
};

export const INITIAL_PROJECTS: RealEstateProject[] = [
  {
    id: 'proj-1',
    name: 'IMT Sohna',
    location: 'IMT Sohna, Gurugram, Haryana',
    minPrice: 2.0,
    maxPrice: 5.0,
    sqYardStartingPrice: 15000,
    imageMapUrl: '/imt_sohna_map.jpg',
    inventory: [
      {
        size: '100 Sq Yards',
        units: [
          { unitNumber: 'Plot A-101', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot A-102', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot A-103', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot A-104', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null }
        ]
      },
      {
        size: '120 Sq Yards',
        units: [
          { unitNumber: 'Plot B-201', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot B-202', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot B-203', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null }
        ]
      },
      {
        size: '150 Sq Yards',
        units: [
          { unitNumber: 'Plot C-301', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot C-302', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot C-401', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot C-402', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null }
        ]
      },
      {
        size: '180 Sq Yards',
        units: [
          { unitNumber: 'Plot D-01', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot D-02', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null }
        ]
      },
      {
        size: '250 Sq Yards',
        units: [
          { unitNumber: 'Plot E-701', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot E-702', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot E-703', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null }
        ]
      }
    ]
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'C',
    name: 'Company Profile C',
    email: 'c@sbrassociates.com',
    phone: '+91 99999 00000',
    role: 'ADMIN',
    sponsorId: null,
    joinedDate: '2025-01-01',
    designation: 'Exempt',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 0.0,
    dob: '1975-01-01',
    aadhar: '0000 0000 0000',
    pan: 'SBRCO1234A',
    address: 'SBR Corporate Headquarters, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=150',
    password: 'C@SBR'
  },
  {
    id: 'A1',
    name: 'Admin A1',
    email: 'a1@sbrassociates.com',
    phone: '+91 98765 43210',
    role: 'ADMIN',
    sponsorId: 'C',
    joinedDate: '2025-01-02',
    designation: 'Exempt',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 0.0,
    dob: '1980-05-15',
    aadhar: '1111 2222 3333',
    pan: 'ADMN15012A',
    address: 'SBR Office, Leg 1 Wing, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    password: 'A1@SBR'
  },
  {
    id: 'A2',
    name: 'Admin A2',
    email: 'a2@sbrassociates.com',
    phone: '+91 98765 43211',
    role: 'ADMIN',
    sponsorId: 'C',
    joinedDate: '2025-01-02',
    designation: 'Exempt',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 0.0,
    dob: '1981-08-20',
    aadhar: '1111 2222 4444',
    pan: 'ADMN25012B',
    address: 'SBR Office, Leg 2 Wing, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    password: 'A2@SBR'
  },
  {
    id: 'MANORANJAN',
    name: 'Manoranjan Family ID',
    email: 'manoranjan@sbrassociates.com',
    phone: '+91 92222 33333',
    role: 'ADMIN',
    sponsorId: 'A1',
    joinedDate: '2025-01-03',
    designation: 'Exempt',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 0.0,
    dob: '1986-06-18',
    aadhar: '2222 3333 5555',
    pan: 'MANO5012B',
    address: 'HSR Layout, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    password: 'Manoranjan@SBR'
  },
  {
    id: 'RAM',
    name: 'Ram Family ID',
    email: 'ram@sbrassociates.com',
    phone: '+91 91111 22222',
    role: 'ADMIN',
    sponsorId: 'A1',
    joinedDate: '2025-01-03',
    designation: 'Exempt',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 0.0,
    dob: '1985-03-10',
    aadhar: '2222 3333 4444',
    pan: 'RAMP5012A',
    address: 'Indiranagar, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    password: 'Ram@SBR'
  },
  {
    id: 'DK',
    name: 'DK Family ID',
    email: 'dk@sbrassociates.com',
    phone: '+91 94444 55555',
    role: 'ADMIN',
    sponsorId: 'A2',
    joinedDate: '2025-01-03',
    designation: 'Exempt',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 0.0,
    dob: '1988-12-12',
    aadhar: '4444 5555 6666',
    pan: 'DKP5012D',
    address: 'Jayanagar, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    password: 'DK@SBR'
  },
  {
    id: 'VIKAS',
    name: 'Vikas Family ID',
    email: 'vikas@sbrassociates.com',
    phone: '+91 93333 44444',
    role: 'ADMIN',
    sponsorId: 'A2',
    joinedDate: '2025-01-03',
    designation: 'Exempt',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 0.0,
    dob: '1987-09-25',
    aadhar: '3333 4444 5555',
    pan: 'VIKA5012C',
    address: 'Koramanagala, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    password: 'Vikas@SBR'
  }
];

export const INITIAL_SALES: Sale[] = [];

export const INITIAL_PAYOUTS: CommissionPayout[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];
