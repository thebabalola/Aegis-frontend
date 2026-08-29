import { Timeframe } from '@/components/TimeframeFilter';
import { fetchHistoricalSharePriceWithFallback, NetworkType } from './stellar';

export interface DataPoint {
  date: string;
  apy: number;
}

export function convertSharePricesToAPY(prices: Array<{ date: string; price: number }>): DataPoint[] {
  if (prices.length < 2) return [];

  const initialPrice = prices[0].price;
  const dataPoints: DataPoint[] = [];

  prices.forEach((point, index) => {
    const daysPassed = index;
    if (daysPassed === 0) {
      dataPoints.push({ date: point.date, apy: 0 });
      return;
    }

    const priceRatio = point.price / initialPrice;
    const daysInYear = 365;
    const apy = (Math.pow(priceRatio, daysInYear / daysPassed) - 1) * 100;

    dataPoints.push({
      date: point.date,
      apy: Math.max(0, parseFloat(apy.toFixed(2))),
    });
  });

  return dataPoints;
}

function getDateRange(timeframe: Timeframe): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();

  switch (timeframe) {
    case '1D':
      from.setDate(to.getDate() - 1);
      break;
    case '1W':
      from.setDate(to.getDate() - 7);
      break;
    case '1M':
      from.setDate(to.getDate() - 30);
      break;
    case '3M':
      from.setDate(to.getDate() - 90);
      break;
    case '1Y':
      from.setFullYear(to.getFullYear() - 1);
      break;
  }

  return { from, to };
}

export async function fetchApyData(
  timeframe: Timeframe,
  contractId?: string,
  network: NetworkType = NetworkType.TESTNET
): Promise<DataPoint[]> {
  try {
    if (!contractId) {
      return [];
    }

    const { from, to } = getDateRange(timeframe);
    const historicalPrices = await fetchHistoricalSharePriceWithFallback(
      contractId,
      network,
      from,
      to
    );

    if (!historicalPrices || historicalPrices.length === 0) {
      return [];
    }

    const apyData = convertSharePricesToAPY(
      historicalPrices.map((hp) => ({
        date: hp.date,
        price: hp.price,
      }))
    );

    return apyData;
  } catch (error) {
    console.error('Failed to fetch APY data:', error);
    return [];
  }
}
