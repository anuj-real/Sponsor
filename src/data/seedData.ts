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
    name: 'SBR Keerthi Prime Phase II',
    location: 'Whitefield Main Road, Bengaluru',
    minPrice: 3, // Since min size is 150 Sq Yards = 3 PTS
    maxPrice: 4, // Since max size is 200 Sq Yards = 4 PTS
    sqYardStartingPrice: 15000, // INR per Sq Yard
    imageMapUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=650',
    inventory: [
      {
        size: '150 Sq Yards',
        units: [
          { unitNumber: 'Villa A-101', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Villa A-102', status: 'BOOKED', bookedByAgentId: 'SBR0003', buyerName: 'Srinivas Murthy' },
          { unitNumber: 'Villa A-103', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Villa A-104', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null }
        ]
      },
      {
        size: '200 Sq Yards',
        units: [
          { unitNumber: 'Villa B-201', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Villa B-202', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Villa B-203', status: 'HOLD', bookedByAgentId: 'SBR0005', buyerName: 'Ramanathan Iyer' }
        ]
      }
    ]
  },
  {
    id: 'proj-2',
    name: 'SBR Elanza Luxury Suites',
    location: 'Seegehalli Main Road, Bengaluru',
    minPrice: 2.4, // 120 Sq Yards = 2.4 PTS
    maxPrice: 3.6, // 180 Sq Yards = 3.6 PTS
    sqYardStartingPrice: 15000,
    imageMapUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=650',
    inventory: [
      {
        size: '120 Sq Yards',
        units: [
          { unitNumber: 'Suite 301', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Suite 302', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Suite 401', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Suite 402', status: 'BOOKED', bookedByAgentId: 'SBR0005', buyerName: 'Abhishek Roy' }
        ]
      },
      {
        size: '180 Sq Yards',
        units: [
          { unitNumber: 'Villa S-01', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Villa S-02', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null }
        ]
      }
    ]
  },
  {
    id: 'proj-3',
    name: 'SBR Minara High-Rise',
    location: 'Sarjapur Road, Bengaluru',
    minPrice: 2.0, // 100 Sq Yards = 2 PTS
    maxPrice: 3.2, // 160 Sq Yards = 3.2 PTS
    sqYardStartingPrice: 15000,
    imageMapUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=650',
    inventory: [
      {
        size: '100 Sq Yards',
        units: [
          { unitNumber: 'Flat 1201', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Flat 1202', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Flat 1505', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null }
        ]
      },
      {
        size: '160 Sq Yards',
        units: [
          { unitNumber: 'Penthouse B-1801', status: 'BOOKED', bookedByAgentId: 'SBR0006', buyerName: 'Karthik Subramanian' },
          { unitNumber: 'Penthouse B-1802', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null }
        ]
      }
    ]
  },
  {
    id: 'proj-4',
    name: 'SBR Horizon Commercial Hub',
    location: 'ITPL Road, Bengaluru',
    minPrice: 5.0, // 250 Sq Yards = 5 PTS
    maxPrice: 5.0,
    sqYardStartingPrice: 15000,
    imageMapUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=650',
    inventory: [
      {
        size: '250 Sq Yards',
        units: [
          { unitNumber: 'Office 701', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Office 702', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Retail G-05', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null }
        ]
      }
    ]
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'SBR0001',
    name: 'Rajesh Kumar',
    email: 'rajesh.k@sbrassociates.com',
    phone: '+91 98450 12345',
    role: 'AGENT',
    sponsorId: null,
    joinedDate: '2025-01-10',
    rank: 'Crown Club',
    designation: 'Sr. GM',
    status: 'ACTIVE',
    totalDirectSales: 160.0, // in Points
    totalDownlineSales: 450.0, // in Points
    dob: '1979-05-12',
    aadhar: '4532 8912 0041',
    pan: 'APOPK5012A',
    address: 'H-204, Prestige Lakeside Habitat, Whitefield, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'SBR0002',
    name: 'Amit Sharma',
    email: 'amit.sharma@partners.in',
    phone: '+91 97412 88321',
    role: 'AGENT',
    sponsorId: 'SBR0001',
    joinedDate: '2025-02-15',
    rank: 'Platinum Elite',
    designation: 'GM',
    status: 'ACTIVE',
    totalDirectSales: 70.0, // in Points
    totalDownlineSales: 150.0, // in Points
    dob: '1984-09-22',
    aadhar: '6712 0032 5541',
    pan: 'DFKPS4124F',
    address: '88, 3rd Cross, Indiranagar 2nd Stage, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'SBR0003',
    name: 'Priya Naidu',
    email: 'priya.naidu@reb-realty.com',
    phone: '+91 88612 00452',
    role: 'AGENT',
    sponsorId: 'SBR0001',
    joinedDate: '2025-03-01',
    rank: 'Platinum Elite',
    designation: 'Manager',
    status: 'ACTIVE',
    totalDirectSales: 50.0, // in Points
    totalDownlineSales: 0.0,
    dob: '1990-11-04',
    aadhar: '8910 4421 8820',
    pan: 'BVOPD2214K',
    address: 'S-2, Concorde Manhattan, Electronic City, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'SBR0004',
    name: 'Sanjay Mehta',
    email: 'sanjay.mehta@realtors.co.in',
    phone: '+91 90088 12399',
    role: 'AGENT',
    sponsorId: 'SBR0002',
    joinedDate: '2025-03-18',
    rank: 'Gold Partner',
    designation: 'AGM',
    status: 'ACTIVE',
    totalDirectSales: 45.0, // in Points
    totalDownlineSales: 110.0, // in Points
    dob: '1982-03-15',
    aadhar: '5561 0041 3320',
    pan: 'CSDKK8920C',
    address: 'Flat 504, Sobha Primrose, Belandur, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'SBR0005',
    name: 'Neha Patel',
    email: 'neha.p@apexrealty.org',
    phone: '+91 96112 55431',
    role: 'AGENT',
    sponsorId: 'SBR0004',
    joinedDate: '2025-04-05',
    rank: 'Silver Agent',
    designation: 'Manager',
    status: 'ACTIVE',
    totalDirectSales: 38.0, // in Points
    totalDownlineSales: 25.0, // in Points
    dob: '1993-07-31',
    aadhar: '7821 5560 9942',
    pan: 'ERFPT9820Z',
    address: 'Villa 14, Adarsh Palm Meadows, Varthur Road, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'SBR0006',
    name: 'Deepak Rao',
    email: 'deepak.rao@brokers.in',
    phone: '+91 94488 77521',
    role: 'AGENT',
    sponsorId: 'SBR0005',
    joinedDate: '2025-04-22',
    rank: 'Broker Affiliate',
    designation: 'Associate',
    status: 'ACTIVE',
    totalDirectSales: 12.0, // in Points
    totalDownlineSales: 0.0,
    dob: '1995-12-05',
    aadhar: '3341 0029 8812',
    pan: 'LKOPT8940W',
    address: '22, Orchid Block, Brigade Metropolis, Garudacharpalya, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'SALE-201',
    project: 'SBR Keerthi Prime Phase II',
    projectId: 'proj-1',
    unitNumber: 'Villa A-102',
    buyerName: 'Dr. Srinivas Murthy',
    saleValue: 3.0, // 150 Sq Yards = 3 PTS
    agentId: 'SBR0003',
    agentName: 'Priya Naidu',
    saleDate: '2026-05-10',
    referenceNumber: 'REF-SBR-KPR-012',
    sizeSqYards: '150 Sq Yards',
    status: 'CONFIRMED',
    bookingStatus: 'REGISTRY_DONE',
    ratePerSqYard: 15000,
    tokenAmount: 75000
  },
  {
    id: 'SALE-202',
    project: 'SBR Elanza Luxury Suites',
    projectId: 'proj-2',
    unitNumber: 'Suite 402',
    buyerName: 'Abhishek Roy',
    saleValue: 2.4, // 120 Sq Yards = 2.4 PTS
    agentId: 'SBR0005',
    agentName: 'Neha Patel',
    saleDate: '2026-05-18',
    referenceNumber: 'REF-SBR-ELZ-402',
    sizeSqYards: '120 Sq Yards',
    status: 'CONFIRMED',
    bookingStatus: 'BOOKING_DONE',
    ratePerSqYard: 15000,
    tokenAmount: 75000
  },
  {
    id: 'SALE-203',
    project: 'SBR Minara High-Rise',
    projectId: 'proj-3',
    unitNumber: 'Penthouse B-1801',
    buyerName: 'Karthik Subramanian',
    saleValue: 3.2, // 160 Sq Yards = 3.2 PTS
    agentId: 'SBR0006',
    agentName: 'Deepak Rao',
    saleDate: '2026-05-24',
    referenceNumber: 'REF-SBR-MIN-1801',
    sizeSqYards: '160 Sq Yards',
    status: 'BOOKED',
    bookingStatus: 'TOKEN_RECEIVED',
    ratePerSqYard: 15000,
    tokenAmount: 187500
  }
];

export const INITIAL_PAYOUTS: CommissionPayout[] = [
  // Payouts from SALE-201 (Priya Naidu direct, Rajesh Kumar sponsor)
  {
    id: 'PAY-101',
    saleId: 'SALE-201',
    project: 'SBR Keerthi Prime Phase II',
    unitNumber: 'Villa A-102',
    saleValue: 3.0,
    agentId: 'SBR0003',
    agentName: 'Priya Naidu',
    level: 1,
    percentage: 5.0,
    grossCommission: 0.15, // 5% of 3.0 PTS
    tdsDeduction: 0.0075,  // 5% TDS
    adminFee: 0.0015,      // 1% admin
    netCommission: 0.141,
    status: 'DISBURSED',
    payoutDate: '2026-05-15'
  },
  {
    id: 'PAY-102',
    saleId: 'SALE-201',
    project: 'SBR Keerthi Prime Phase II',
    unitNumber: 'Villa A-102',
    saleValue: 3.0,
    agentId: 'SBR0001',
    agentName: 'Rajesh Kumar',
    level: 2,
    percentage: 2.5,
    grossCommission: 0.075, // 2.5% of 3.0 PTS
    tdsDeduction: 0.00375,
    adminFee: 0.00075,
    netCommission: 0.0705,
    status: 'DISBURSED',
    payoutDate: '2026-05-15'
  },

  // Payouts from SALE-202 (Neha Patel direct, Rajesh Kumar, Amit Sharma, Sanjay Mehta sponsor)
  {
    id: 'PAY-103',
    saleId: 'SALE-202',
    project: 'SBR Elanza Luxury Suites',
    unitNumber: 'Suite 402',
    saleValue: 2.4,
    agentId: 'SBR0005',
    agentName: 'Neha Patel',
    level: 1,
    percentage: 5.0,
    grossCommission: 0.12, // 5% of 2.4 PTS
    tdsDeduction: 0.006,
    adminFee: 0.0012,
    netCommission: 0.1128,
    status: 'APPROVED',
    payoutDate: '2026-05-25'
  },
  {
    id: 'PAY-104',
    saleId: 'SALE-202',
    project: 'SBR Elanza Luxury Suites',
    unitNumber: 'Suite 402',
    saleValue: 2.4,
    agentId: 'SBR0004',
    agentName: 'Sanjay Mehta',
    level: 2,
    percentage: 2.5,
    grossCommission: 0.06, // 2.5% of 2.4 PTS
    tdsDeduction: 0.003,
    adminFee: 0.0006,
    netCommission: 0.0564,
    status: 'APPROVED',
    payoutDate: '2026-05-25'
  },
  {
    id: 'PAY-105',
    saleId: 'SALE-202',
    project: 'SBR Elanza Luxury Suites',
    unitNumber: 'Suite 402',
    saleValue: 2.4,
    agentId: 'SBR0002',
    agentName: 'Amit Sharma',
    level: 3,
    percentage: 1.5,
    grossCommission: 0.036, // 1.5% of 2.4 PTS
    tdsDeduction: 0.0018,
    adminFee: 0.00036,
    netCommission: 0.03384,
    status: 'APPROVED',
    payoutDate: '2026-05-25'
  },
  {
    id: 'PAY-106',
    saleId: 'SALE-202',
    project: 'SBR Elanza Luxury Suites',
    unitNumber: 'Suite 402',
    saleValue: 2.4,
    agentId: 'SBR0001',
    agentName: 'Rajesh Kumar',
    level: 4,
    percentage: 1.0,
    grossCommission: 0.024, // 1.0% of 2.4 PTS
    tdsDeduction: 0.0012,
    adminFee: 0.00024,
    netCommission: 0.02256,
    status: 'APPROVED',
    payoutDate: '2026-05-25'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOT-001',
    userId: 'SBR0003',
    title: 'Commission Credited',
    message: 'Your commission of 0.141 PTS for SBR Keerthi Prime Villa A-102 has been disbursed into your account ledgers.',
    amount: 0.141,
    timestamp: '2026-05-15 15:30',
    isRead: true
  },
  {
    id: 'NOT-002',
    userId: 'SBR0001',
    title: 'Indirect Downline Commission Credited',
    message: 'Level 2 commission of 0.0705 PTS generated from Priya Naidu\'s sale has been disbursed.',
    amount: 0.0705,
    timestamp: '2026-05-15 15:32',
    isRead: false
  },
  {
    id: 'NOT-003',
    userId: 'SBR0005',
    title: 'Commission Approved',
    message: 'Your commission of 0.1128 PTS for SBR Elanza Suite 402 is approved and scheduled for next billing cycle.',
    amount: 0.1128,
    timestamp: '2026-05-25 10:00',
    isRead: false
  }
];
