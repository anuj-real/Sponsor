import { Sale } from '../types';

/**
 * Calculates the loyalty/commission points based on plot size in square yards.
 * 
 * Rules:
 * - Size 1-80 sq yds: 1 point
 * - 81-130 sq yds: 2 points
 * - 131-180 sq yds: 3 points
 * - 181-230 sq yds: 4 points
 * - 231-280 sq yds: 5 points
 * - 281-330 sq yds: 6 points
 * - 331-380 sq yds: 7 points
 * - 381-430 sq yds: 8 points
 * - 431-480 sq yds: 9 points
 * - 481+ sq yds: 10 points
 */
export function calculatePointsFromSize(size: number): number {
  if (size <= 0) return 0;
  if (size <= 80) return 1;    // 1 to 80 sq yds: 1 point
  if (size <= 130) return 2;   // 81 to 130 sq yds: 2 points
  if (size <= 180) return 3;   // 131 to 180 sq yds: 3 points
  if (size <= 230) return 4;   // 181 to 230 sq yds: 4 points
  if (size <= 280) return 5;   // 231 to 280 sq yds: 5 points
  if (size <= 330) return 6;   // 281 to 330 sq yds: 6 points
  if (size <= 380) return 7;   // 331 to 380 sq yds: 7 points
  if (size <= 430) return 8;   // 381 to 430 sq yds: 8 points
  if (size <= 480) return 9;   // 431 to 480 sq yds: 9 points
  return 10;                   // 481+ sq yds: 10 points
}

/**
 * Calculates total points for a sale based on plot size (Sq Yds) and unit count.
 * Agreement price in INR is NOT used for points calculation.
 */
export function getSalePoints(sale: Partial<Sale>): number {
  if (!sale) return 0;

  let unitCount = 1;
  if (sale.unitNumber) {
    const units = sale.unitNumber.split(',').map(u => u.trim()).filter(Boolean);
    if (units.length > 0) unitCount = units.length;
  }

  if (sale.sizeSqYards) {
    const numericSize = parseFloat(String(sale.sizeSqYards).replace(/[^\d.]/g, '')) || 0;
    if (numericSize > 0) {
      const pointsPerUnit = calculatePointsFromSize(numericSize);
      return pointsPerUnit * unitCount;
    }
  }

  if (sale.saleValue && sale.saleValue <= 100) {
    return Math.round(sale.saleValue);
  }

  return 0;
}

/**
 * Calculates total agreement price in INR for a sale (Plot Size * Units * Rate per Sq Yd).
 */
export function getSaleAgreementValueINR(sale: Partial<Sale>): number {
  if (!sale) return 0;
  const numericSize = parseFloat(String(sale.sizeSqYards || '').replace(/[^\d.]/g, '')) || 0;
  let unitCount = 1;
  if (sale.unitNumber) {
    const units = sale.unitNumber.split(',').map(u => u.trim()).filter(Boolean);
    if (units.length > 0) unitCount = units.length;
  }
  const rate = sale.ratePerSqYard || 15000;
  const calc = numericSize * unitCount * rate;
  if (calc > 0) return calc;

  if (sale.saleValue && sale.saleValue > 100) {
    return sale.saleValue;
  }

  return 0;
}

