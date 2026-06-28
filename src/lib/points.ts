/**
 * Calculates the loyalty/commission points based on plot size in square yards.
 * 
 * Rules:
 * - Size upto 80 sq yds: 1 point
 * - 81-130 sq yds: 2 points
 * - 131-180 sq yds: 3 points
 * - 181-230 sq yds: 4 points
 * - 231-280 sq yds: 5 points
 * - 281-330 sq yds: 6 points
 * - 331-380 sq yds: 7 points
 * - 381-430 sq yds: 8 points
 * - 431-480 sq yds: 9 points
 * - 481-530 sq yds: 10 points
 */
export function calculatePointsFromSize(size: number): number {
  if (size <= 0) return 0;
  if (size <= 80) return 1;
  if (size <= 130) return 2;
  if (size <= 180) return 3;
  if (size <= 230) return 4;
  if (size <= 280) return 5;
  if (size <= 330) return 6;
  if (size <= 380) return 7;
  if (size <= 430) return 8;
  if (size <= 480) return 9;
  return 10; // 481 to 530 and above is 10 points
}
