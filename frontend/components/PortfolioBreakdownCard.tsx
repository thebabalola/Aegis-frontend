"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRealtimeVault } from "@/hooks/useRealtimeVault";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PieChart, Activity, AlertCircle, RefreshCw } from "lucide-react";
import { fetchUserBasis } from "@/lib/stellar";
import { getVolatilityShieldAddress } from "@/lib/contracts.config";

function PortfolioBreakdownCardSkeleton() {
  return (
    <Card className="p-6 shadow-sm border bg-card" data-testid="portfolio-skeleton">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 rounded bg-muted animate-pulse" />
        <div className="h-5 w-48 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-8 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="h-3 w-28 rounded bg-muted animate-pulse" />
          <div className="h-5 w-20 rounded bg-muted animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-28 rounded bg-muted animate-pulse" />
          <div className="h-5 w-20 rounded bg-muted animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

export function PortfolioBreakdownCard() {
  const { address, connected } = useWallet();
  const { network } = useNetwork();
  const { metrics } = useRealtimeVault(address);
  const { format } = useCurrency();
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [loadingBasis, setLoadingBasis] = useState(false);
  const [basisError, setBasisError] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const loadBasis = useCallback(async () => {
    if (!address || !connected || !network) return;
    setLoadingBasis(true);
    setBasisError(false);
    try {
      const contractId = getVolatilityShieldAddress(network);
      const basis = await fetchUserBasis(contractId, address, network);
      if (basis.totalSharesMinted > 0) {
        setEntryPrice(basis.averageEntryPrice);
      }
    } catch (err) {
      console.error("Failed to load user basis:", err);
      setBasisError(true);
    } finally {
      setLoadingBasis(false);
      setInitialLoad(false);
    }
  }, [address, connected, network]);

  useEffect(() => {
    loadBasis();
  }, [loadBasis]);

  const stats = useMemo(() => {
    if (!metrics || !connected) return null;

    const userShares = parseFloat(metrics.userShares) / 1e7;
    const totalShares = parseFloat(metrics.totalShares) / 1e7;
    const currentSharePrice = parseFloat(metrics.sharePrice);

    const sharePercentage = totalShares > 0 ? (userShares / totalShares) * 100 : 0;
    const currentValue = userShares * currentSharePrice;

    let unrealizedPnL = 0;
    let unrealizedPnLPercentage = 0;

    if (entryPrice && entryPrice > 0) {
      unrealizedPnL = (currentSharePrice - entryPrice) * userShares;
      unrealizedPnLPercentage = ((currentSharePrice - entryPrice) / entryPrice) * 100;
    }

    return {
      userShares,
      sharePercentage,
      entryPrice: entryPrice || currentSharePrice,
      currentSharePrice,
      currentValue,
      unrealizedPnL,
      unrealizedPnLPercentage,
    };
  }, [metrics, connected, entryPrice]);

  if (!connected || !stats || stats.userShares <= 0) {
    return null;
  }

  if (initialLoad || loadingBasis) {
    return <PortfolioBreakdownCardSkeleton />;
  }

  const isPositive = stats.unrealizedPnL >= 0;

  return (
    <Card className="p-6 shadow-sm border bg-card">
      <div className="flex items-center gap-3 mb-6">
        <PieChart className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Your Portfolio Breakdown</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Wallet className="w-3 h-3" />
            Shares Held
          </p>
          <p className="text-2xl font-bold">{stats.userShares.toFixed(2)} XHS</p>
          <p className="text-xs text-muted-foreground">
            {stats.sharePercentage < 0.0001 && stats.sharePercentage > 0
              ? "< 0.0001"
              : stats.sharePercentage.toFixed(4)}% of vault
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Activity className="w-3 h-3" />
            P&L (Unrealized)
          </p>
          {basisError ? (
            <div data-testid="basis-error-state">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-destructive" />
                P&L data unavailable
              </p>
              <button
                data-testid="basis-retry-button"
                onClick={loadBasis}
                className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          ) : (
            <>
              <p className={`text-2xl font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? "+" : ""}{format(stats.unrealizedPnL)}
              </p>
              <p className={`text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"} flex items-center gap-1`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? "+" : ""}{stats.unrealizedPnLPercentage.toFixed(2)}%
              </p>
            </>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Estimated Value
          </p>
          <p className="text-2xl font-bold text-primary">{format(stats.currentValue)}</p>
          <p className="text-xs text-muted-foreground">at {format(stats.currentSharePrice)} / share</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Entry Share Price</p>
          <p className="font-medium">{format(stats.entryPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Current Share Price</p>
          <p className="font-medium">{format(stats.currentSharePrice)}</p>
        </div>
      </div>
    </Card>
  );
}
