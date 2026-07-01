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
          { unitNumber: 'Plot A-102', status: 'BOOKED', bookedByAgentId: 'SBR0003', buyerName: 'Srinivas Murthy' },
          { unitNumber: 'Plot A-103', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot A-104', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null }
        ]
      },
      {
        size: '120 Sq Yards',
        units: [
          { unitNumber: 'Plot B-201', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot B-202', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot B-203', status: 'HOLD', bookedByAgentId: 'SBR0005', buyerName: 'Ramanathan Iyer' }
        ]
      },
      {
        size: '150 Sq Yards',
        units: [
          { unitNumber: 'Plot C-301', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot C-302', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot C-401', status: 'AVAILABLE', bookedByAgentId: null, buyerName: null },
          { unitNumber: 'Plot C-402', status: 'BOOKED', bookedByAgentId: 'SBR0005', buyerName: 'Abhishek Roy' }
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
    id: 'SBR',
    name: 'SBR Company Node',
    email: 'company@sbrassociates.com',
    phone: '+91 99999 00000',
    role: 'AGENT',
    sponsorId: null,
    joinedDate: '2025-01-01',
    rank: 'Crown Club',
    designation: 'Sr. GM',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 710.0,
    dob: '1975-01-01',
    aadhar: '0000 0000 0000',
    pan: 'SBRCO1234A',
    address: 'SBR Corporate Headquarters, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=150',
    password: 'SBR@2026'
  },
  {
    id: 'ADMIN1',
    name: 'Admin Leg 1',
    email: 'admin1@sbrassociates.com',
    phone: '+91 98765 43210',
    role: 'AGENT',
    sponsorId: 'SBR',
    joinedDate: '2025-01-02',
    rank: 'Crown Club',
    designation: 'GM',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 380.0,
    dob: '1980-05-15',
    aadhar: '1111 2222 3333',
    pan: 'ADMN15012A',
    address: 'SBR Office, Leg 1 Wing, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    password: 'Admin1@SBR'
  },
  {
    id: 'ADMIN2',
    name: 'Admin Leg 2',
    email: 'admin2@sbrassociates.com',
    phone: '+91 98765 43211',
    role: 'AGENT',
    sponsorId: 'SBR',
    joinedDate: '2025-01-02',
    rank: 'Crown Club',
    designation: 'GM',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 330.0,
    dob: '1981-08-20',
    aadhar: '1111 2222 4444',
    pan: 'ADMN25012B',
    address: 'SBR Office, Leg 2 Wing, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    password: 'Admin2@SBR'
  },
  {
    id: 'RAM',
    name: 'Ram Family ID',
    email: 'ram@sbrassociates.com',
    phone: '+91 91111 22222',
    role: 'AGENT',
    sponsorId: 'ADMIN1',
    joinedDate: '2025-01-03',
    rank: 'Platinum Elite',
    designation: 'AGM',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 210.0,
    dob: '1985-03-10',
    aadhar: '2222 3333 4444',
    pan: 'RAMP5012A',
    address: 'Indiranagar, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    password: 'Ram@SBR'
  },
  {
    id: 'MANORANJAN',
    name: 'Manoranjan Family ID',
    email: 'manoranjan@sbrassociates.com',
    phone: '+91 92222 33333',
    role: 'AGENT',
    sponsorId: 'ADMIN1',
    joinedDate: '2025-01-03',
    rank: 'Platinum Elite',
    designation: 'AGM',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 170.0,
    dob: '1986-06-18',
    aadhar: '2222 3333 5555',
    pan: 'MANO5012B',
    address: 'HSR Layout, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    password: 'Manoranjan@SBR'
  },
  {
    id: 'VIKAS',
    name: 'Vikas Family ID',
    email: 'vikas@sbrassociates.com',
    phone: '+91 93333 44444',
    role: 'AGENT',
    sponsorId: 'ADMIN2',
    joinedDate: '2025-01-03',
    rank: 'Platinum Elite',
    designation: 'AGM',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 150.0,
    dob: '1987-09-25',
    aadhar: '3333 4444 5555',
    pan: 'VIKA5012C',
    address: 'Koramanagala, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    password: 'Vikas@SBR'
  },
  {
    id: 'DK',
    name: 'DK Family ID',
    email: 'dk@sbrassociates.com',
    phone: '+91 94444 55555',
    role: 'AGENT',
    sponsorId: 'ADMIN2',
    joinedDate: '2025-01-03',
    rank: 'Platinum Elite',
    designation: 'AGM',
    status: 'ACTIVE',
    totalDirectSales: 0.0,
    totalDownlineSales: 180.0,
    dob: '1988-12-12',
    aadhar: '4444 5555 6666',
    pan: 'DKP5012D',
    address: 'Jayanagar, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    password: 'DK@SBR'
  },
  {
    id: 'SBR0001',
    name: 'Rajesh Kumar',
    email: 'rajesh.k@sbrassociates.com',
    phone: '+91 98450 12345',
    role: 'AGENT',
    sponsorId: 'RAM',
    joinedDate: '2025-01-10',
    rank: 'Crown Club',
    designation: 'Associate',
    status: 'ACTIVE',
    totalDirectSales: 160.0,
    totalDownlineSales: 50.0,
    dob: '1979-05-12',
    aadhar: '4532 8912 0041',
    pan: 'APOPK5012A',
    address: 'H-204, Prestige Lakeside Habitat, Whitefield, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    password: 'password'
  },
  {
    id: 'SBR0002',
    name: 'Amit Sharma',
    email: 'amit.sharma@partners.in',
    phone: '+91 97412 88321',
    role: 'AGENT',
    sponsorId: 'MANORANJAN',
    joinedDate: '2025-02-15',
    rank: 'Platinum Elite',
    designation: 'Associate',
    status: 'ACTIVE',
    totalDirectSales: 70.0,
    totalDownlineSales: 100.0,
    dob: '1984-09-22',
    aadhar: '6712 0032 5541',
    pan: 'DFKPS4124F',
    address: '88, 3rd Cross, Indiranagar 2nd Stage, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    password: 'password'
  },
  {
    id: 'SBR0003',
    name: 'Priya Naidu',
    email: 'priya.naidu@reb-realty.com',
    phone: '+91 88612 00452',
    role: 'AGENT',
    sponsorId: 'VIKAS',
    joinedDate: '2025-03-01',
    rank: 'Platinum Elite',
    designation: 'Associate',
    status: 'ACTIVE',
    totalDirectSales: 150.0,
    totalDownlineSales: 0.0,
    dob: '1990-11-04',
    aadhar: '8910 4421 8820',
    pan: 'BVOPD2214K',
    address: 'S-2, Concorde Manhattan, Electronic City, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    password: 'password'
  },
  {
    id: 'SBR0004',
    name: 'Sanjay Mehta',
    email: 'sanjay.mehta@realtors.co.in',
    phone: '+91 90088 12399',
    role: 'AGENT',
    sponsorId: 'DK',
    joinedDate: '2025-03-18',
    rank: 'Gold Partner',
    designation: 'Associate',
    status: 'ACTIVE',
    totalDirectSales: 45.0,
    totalDownlineSales: 135.0,
    dob: '1982-03-15',
    aadhar: '5561 0041 3320',
    pan: 'CSDKK8920C',
    address: 'Flat 504, Sobha Primrose, Belandur, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    password: 'password'
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
    designation: 'Associate',
    status: 'ACTIVE',
    totalDirectSales: 38.0,
    totalDownlineSales: 97.0,
    dob: '1993-07-31',
    aadhar: '7821 5560 9942',
    pan: 'ERFPT9820Z',
    address: 'Villa 14, Adarsh Palm Meadows, Varthur Road, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    password: 'password'
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
    totalDirectSales: 97.0,
    totalDownlineSales: 0.0,
    dob: '1995-12-05',
    aadhar: '3341 0029 8812',
    pan: 'LKOPT8940W',
    address: '22, Orchid Block, Brigade Metropolis, Garudacharpalya, Bengaluru',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    password: 'password'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'SALE-201',
    project: 'IMT Sohna',
    projectId: 'proj-1',
    unitNumber: 'Plot A-102',
    buyerName: 'Dr. Srinivas Murthy',
    saleValue: 3, // 150 Sq Yards = 3 PTS
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
    project: 'IMT Sohna',
    projectId: 'proj-1',
    unitNumber: 'Plot C-402',
    buyerName: 'Abhishek Roy',
    saleValue: 2, // 120 Sq Yards = 2 PTS
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
    project: 'IMT Sohna',
    projectId: 'proj-1',
    unitNumber: 'Plot E-701',
    buyerName: 'Karthik Subramanian',
    saleValue: 3, // 160 Sq Yards = 3 PTS
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
    project: 'IMT Sohna',
    unitNumber: 'Plot A-102',
    saleValue: 3,
    agentId: 'SBR0003',
    agentName: 'Priya Naidu',
    level: 1,
    percentage: 5.0,
    grossCommission: 3,
    tdsDeduction: 0,
    adminFee: 0,
    netCommission: 3,
    status: 'DISBURSED',
    payoutDate: '2026-05-15'
  },
  {
    id: 'PAY-102',
    saleId: 'SALE-201',
    project: 'IMT Sohna',
    unitNumber: 'Plot A-102',
    saleValue: 3,
    agentId: 'SBR0001',
    agentName: 'Rajesh Kumar',
    level: 2,
    percentage: 2.5,
    grossCommission: 3,
    tdsDeduction: 0,
    adminFee: 0,
    netCommission: 3,
    status: 'DISBURSED',
    payoutDate: '2026-05-15'
  },

  // Payouts from SALE-202 (Neha Patel direct, Rajesh Kumar, Amit Sharma, Sanjay Mehta sponsor)
  {
    id: 'PAY-103',
    saleId: 'SALE-202',
    project: 'IMT Sohna',
    unitNumber: 'Plot C-402',
    saleValue: 2,
    agentId: 'SBR0005',
    agentName: 'Neha Patel',
    level: 1,
    percentage: 5.0,
    grossCommission: 2,
    tdsDeduction: 0,
    adminFee: 0,
    netCommission: 2,
    status: 'APPROVED',
    payoutDate: '2026-05-25'
  },
  {
    id: 'PAY-104',
    saleId: 'SALE-202',
    project: 'IMT Sohna',
    unitNumber: 'Plot C-402',
    saleValue: 2,
    agentId: 'SBR0004',
    agentName: 'Sanjay Mehta',
    level: 2,
    percentage: 2.5,
    grossCommission: 2,
    tdsDeduction: 0,
    adminFee: 0,
    netCommission: 2,
    status: 'APPROVED',
    payoutDate: '2026-05-25'
  },
  {
    id: 'PAY-105',
    saleId: 'SALE-202',
    project: 'IMT Sohna',
    unitNumber: 'Plot C-402',
    saleValue: 2,
    agentId: 'SBR0002',
    agentName: 'Amit Sharma',
    level: 3,
    percentage: 1.5,
    grossCommission: 2,
    tdsDeduction: 0,
    adminFee: 0,
    netCommission: 2,
    status: 'APPROVED',
    payoutDate: '2026-05-25'
  },
  {
    id: 'PAY-106',
    saleId: 'SALE-202',
    project: 'IMT Sohna',
    unitNumber: 'Plot C-402',
    saleValue: 2,
    agentId: 'SBR0001',
    agentName: 'Rajesh Kumar',
    level: 4,
    percentage: 1.0,
    grossCommission: 2,
    tdsDeduction: 0,
    adminFee: 0,
    netCommission: 2,
    status: 'APPROVED',
    payoutDate: '2026-05-25'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOT-001',
    userId: 'SBR0003',
    title: 'Commission Credited',
    message: 'Your commission of 3 PTS for IMT Sohna Plot A-102 has been disbursed into your account ledgers.',
    amount: 3,
    timestamp: '2026-05-15 15:30',
    isRead: true
  },
  {
    id: 'NOT-002',
    userId: 'SBR0001',
    title: 'Indirect Downline Commission Credited',
    message: 'Level 2 commission of 3 PTS generated from Priya Naidu\'s sale has been disbursed.',
    amount: 3,
    timestamp: '2026-05-15 15:32',
    isRead: false
  },
  {
    id: 'NOT-003',
    userId: 'SBR0005',
    title: 'Commission Approved',
    message: 'Your commission of 2 PTS for IMT Sohna Plot C-402 is approved and scheduled for next billing cycle.',
    amount: 2,
    timestamp: '2026-05-25 10:00',
    isRead: false
  }
];
