"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface StrategyDetail {
  address: string;
  name: string;
  allocation: number;
  balance: number;
  apy: number;
  riskScore: number;
  isHealthy: boolean;
  lastRebalance: string;
  totalEarnings: number;
}

interface StrategyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyAddress: string | null;
}

export default function StrategyDetailModal({
  isOpen,
  onClose,
  strategyAddress,
}: StrategyDetailModalProps) {
  const [detail, setDetail] = useState<StrategyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !strategyAddress) {
      setDetail(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Mock data for demonstration
    const mockDetail: StrategyDetail = {
      address: strategyAddress,
      name: 'USDC Lending Pool',
      allocation: 45.5,
      balance: 455000,
      apy: 12.4,
      riskScore: 25,
      isHealthy: true,
      lastRebalance: '2 hours ago',
      totalEarnings: 5642.30,
    };

    setTimeout(() => {
      setDetail(mockDetail);
      setLoading(false);
    }, 1000);
  }, [isOpen, strategyAddress]);

  const getRiskLabel = (score: number) => {
    if (score <= 30) return { label: 'Low Risk', variant: 'default' as const };
    if (score <= 60) return { label: 'Medium Risk', variant: 'secondary' as const };
    return { label: 'High Risk', variant: 'destructive' as const };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Strategy Details"
      size="lg"
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-destructive font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 flex items-center gap-2 text-primary hover:underline"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : detail ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{detail.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">{detail.address}</p>
            </div>
            <Badge variant={getRiskLabel(detail.riskScore).variant}>
              {getRiskLabel(detail.riskScore).label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Allocation</p>
              <p className="text-2xl font-bold">{detail.allocation}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Balance</p>
              <p className="text-2xl font-bold">${detail.balance.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">APY</p>
              <p className="text-2xl font-bold text-green-500">{detail.apy}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
              <p className="text-2xl font-bold">${detail.totalEarnings.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {detail.isHealthy ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span>{detail.isHealthy ? 'Healthy' : 'Needs Attention'}</span>
            </div>
            <span className="text-muted-foreground">Last rebalance: {detail.lastRebalance}</span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
