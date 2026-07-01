import { User, MLMConfig, Sale, CommissionPayout } from '../types';

/**
 * Counts the total recursive downline network size of a user.
 */
export function getRecursiveDownlineCount(userId: string, allUsers: { id: string; sponsorId: string | null }[]): number {
  const directRecruits = allUsers.filter(u => u.sponsorId === userId);
  let count = directRecruits.length;
  for (const u of directRecruits) {
    count += getRecursiveDownlineCount(u.id, allUsers);
  }
  return count;
}

/**
 * Helper to parse condition string like "4 Direct, 12 Team Members"
 */
export function parseConditionString(condition: string) {
  let reqDirects = 0;
  let reqTeam = 0;
  if (!condition) return { reqDirects, reqTeam };
  const directsMatch = condition.match(/(\d+)\s+Direct/i);
  if (directsMatch) reqDirects = parseInt(directsMatch[1], 10);
  const teamMatch = condition.match(/(\d+)\s+(Group|Team|Member)/i);
  if (teamMatch) reqTeam = parseInt(teamMatch[1], 10);
  return { reqDirects, reqTeam };
}

/**
 * Dynamically computes a user's eligible designation based on their stats and downline size.
 */
export function calculateUserDesignation(user: User, allUsers: User[], config?: MLMConfig): User['designation'] {
  // Administrative nodes (SBR, ADMIN1, ADMIN2, RAM, MANORANJAN, VIKAS, DK) are grandfathered.
  const adminIds = ['SBR', 'ADMIN1', 'ADMIN2', 'RAM', 'MANORANJAN', 'VIKAS', 'DK'];
  if (adminIds.includes(user.id)) {
    return user.designation || 'Associate';
  }

  const directSales = user.totalDirectSales || 0;
  const downlineCount = getRecursiveDownlineCount(user.id, allUsers);

  // Parse requirements from leadership configurations if available, otherwise use correct defaults
  const getRequirements = (designationName: string, defaultDirects: number, defaultTeam: number) => {
    const leadCfg = (config?.leadershipConfigs || []).find(l => l.designation === designationName);
    if (leadCfg) {
      const parsed = parseConditionString(leadCfg.condition);
      return {
        directsRequired: parsed.reqDirects || defaultDirects,
        teamRequired: parsed.reqTeam || defaultTeam,
      };
    }
    return {
      directsRequired: defaultDirects,
      teamRequired: defaultTeam,
    };
  };

  const srGmReq = getRequirements('Sr. GM', 11, 200);
  const gmReq = getRequirements('GM', 10, 100);
  const agmReq = getRequirements('AGM', 9, 60);
  const srManagerReq = getRequirements('Sr. Manager', 7, 30);
  const managerReq = getRequirements('Manager', 4, 12);

  if (directSales >= srGmReq.directsRequired && downlineCount >= srGmReq.teamRequired) {
    return 'Sr. GM';
  }
  if (directSales >= gmReq.directsRequired && downlineCount >= gmReq.teamRequired) {
    return 'GM';
  }
  if (directSales >= agmReq.directsRequired && downlineCount >= agmReq.teamRequired) {
    return 'AGM';
  }
  if (directSales >= srManagerReq.directsRequired && downlineCount >= srManagerReq.teamRequired) {
    return 'Sr. Manager';
  }
  if (directSales >= managerReq.directsRequired && downlineCount >= managerReq.teamRequired) {
    return 'Manager';
  }

  return 'Associate';
}

/**
 * Normalizes all users' designations based on their active stats.
 */
export function normalizeUsers(users: User[], config?: MLMConfig): User[] {
  return users.map(user => {
    const correctDesignation = calculateUserDesignation(user, users, config);
    if (user.designation !== correctDesignation) {
      return {
        ...user,
        designation: correctDesignation
      };
    }
    return user;
  });
}

/**
 * Normalizes all users' stats (totalDirectSales, totalDownlineSales) and designations based on the current sales list.
 */
export function normalizeUsersWithSales(users: User[], sales: Sale[], config?: MLMConfig): User[] {
  // 1. Calculate direct sales for each user based on actual sales list
  const directSalesMap: Record<string, number> = {};
  users.forEach(u => {
    directSalesMap[u.id] = 0;
  });
  sales.forEach(s => {
    const pt = Math.round(s.saleValue || 0);
    if (directSalesMap[s.agentId] !== undefined) {
      directSalesMap[s.agentId] += pt;
    } else {
      directSalesMap[s.agentId] = pt;
    }
  });

  // 2. Helper to get recursive downline sales for a user
  const getDownlineSalesRecursive = (userId: string): number => {
    const directSponsees = users.filter(u => u.sponsorId === userId);
    let total = 0;
    directSponsees.forEach(child => {
      // Add child's direct sales
      total += directSalesMap[child.id] || 0;
      // Add child's downline sales recursively
      total += getDownlineSalesRecursive(child.id);
    });
    return total;
  };

  // 3. Update each user's stats
  const updatedUsers = users.map(user => {
    const direct = directSalesMap[user.id] || 0;
    const downline = getDownlineSalesRecursive(user.id);
    return {
      ...user,
      totalDirectSales: direct,
      totalDownlineSales: downline
    };
  });

  // 4. Update designations based on these fresh stats
  return updatedUsers.map(user => {
    const correctDesignation = calculateUserDesignation(user, updatedUsers, config);
    return {
      ...user,
      designation: correctDesignation
    };
  });
}

/**
 * Rebuilds/normalizes all commission payouts based on current sales and user tree to ensure strict consistency.
 */
export function rebuildPayoutsFromSales(
  sales: Sale[],
  users: User[],
  config: MLMConfig,
  existingPayouts: CommissionPayout[]
): CommissionPayout[] {
  const rebuilt: CommissionPayout[] = [];

  sales.forEach(sale => {
    let currentAgentId: string | null = sale.agentId;
    let currentLevel = 1;

    while (currentAgentId && currentLevel <= (config?.levels?.length || 10)) {
      const levelConfig = config?.levels?.find(l => l.level === currentLevel);
      if (!levelConfig) break;

      const currentAgent = users.find(u => u.id === currentAgentId);
      if (!currentAgent) break;

      const value = Math.round(sale.saleValue);
      const gross = value;
      const tds = 0;
      const admin = 0;
      const net = value;

      // Look up if a payout already exists for this sale, agent, and level to preserve its status & id
      const match = existingPayouts.find(
        p => p.saleId === sale.id && p.agentId === currentAgent.id && p.level === currentLevel
      );

      const payoutId = match?.id || `PAY-${sale.id.replace('SALE-', '')}-${currentLevel}-${Math.floor(100 + Math.random() * 900)}`;
      const status = match?.status || 'PENDING';
      const payoutDate = match?.payoutDate || new Date(new Date(sale.saleDate).setDate(new Date(sale.saleDate).getDate() + 14)).toISOString().split('T')[0];

      rebuilt.push({
        id: payoutId,
        saleId: sale.id,
        project: sale.project,
        unitNumber: sale.unitNumber,
        saleValue: value,
        agentId: currentAgent.id,
        agentName: currentAgent.name,
        level: currentLevel,
        percentage: levelConfig.percentage,
        grossCommission: gross,
        tdsDeduction: tds,
        adminFee: admin,
        netCommission: net,
        status,
        payoutDate
      });

      currentAgentId = currentAgent.sponsorId;
      currentLevel++;
    }
  });

  return rebuilt;
}

