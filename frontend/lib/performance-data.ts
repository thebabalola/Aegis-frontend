import { getNetworkPassphrase, NetworkType } from './stellar';

export interface HeatmapDataPoint {
  date: string;
  return: number;
}

export async function fetchSharePriceHistory(
  network: string,
  years: number = 3
): Promise<HeatmapDataPoint[]> {
  try {
    getNetworkPassphrase(network as NetworkType);

    const mockData = generateMockSharePriceHistory(years);
    return mockData;
  } catch (error) {
    console.error('Failed to fetch share price history:', error);
    throw new Error('Failed to fetch share price history');
  }
}

function generateMockSharePriceHistory(years: number): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - years);

  let currentSharePrice = 100;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      const dailyReturn = (Math.random() - 0.5) * 6;

      data.push({
        date: currentDate.toISOString().split('T')[0],
        return: dailyReturn
      });

      currentSharePrice *= (1 + dailyReturn / 100);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

export function calculateDailyReturns(
  sharePrices: Array<{ date: string; price: number }>
): HeatmapDataPoint[] {
  const returns: HeatmapDataPoint[] = [];

  for (let i = 1; i < sharePrices.length; i++) {
    const previousPrice = sharePrices[i - 1].price;
    const currentPrice = sharePrices[i].price;
    const dailyReturn = ((currentPrice - previousPrice) / previousPrice) * 100;

    returns.push({
      date: sharePrices[i].date,
      return: dailyReturn
    });
  }

  return returns;
}

export async function fetchSharePriceData(
  network: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{ date: string; price: number }>> {
  try {
    getNetworkPassphrase(network as NetworkType);

    return generateMockSharePriceData(startDate, endDate);
  } catch (error) {
    console.error('Failed to fetch share price data:', error);
    throw new Error('Failed to fetch share price data');
  }
}

function generateMockSharePriceData(
  startDate: Date,
  endDate: Date
): Array<{ date: string; price: number }> {
  const data: Array<{ date: string; price: number }> = [];
  let currentPrice = 100;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      const priceChange = (Math.random() - 0.5) * 2;
      currentPrice = Math.max(currentPrice + priceChange, 1);

      data.push({
        date: currentDate.toISOString().split('T')[0],
        price: currentPrice
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}
