"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { useNetwork } from '@/contexts/NetworkContext';
import { fetchVaultData } from '@/lib/stellar';
import { getContractAddress } from '@/lib/contracts.config';

interface MaxAmountButtonProps {
  type: 'deposit' | 'withdraw';
  onAmountSet: (amount: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function MaxAmountButton({
  type,
  onAmountSet,
  disabled = false,
  className = ''
}: MaxAmountButtonProps) {
  const { connected, address } = useWallet();
  const { network } = useNetwork();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMaxClick = useCallback(async () => {
    if (!connected || !address || disabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const vaultId = getContractAddress(network, 'vault');
      const vaultData = await fetchVaultData(vaultId, address, network);

      let maxAmount: number;

      if (type === 'deposit') {
        maxAmount = parseFloat(vaultData.userBalance) / 1e7;
      } else {
        maxAmount = (parseFloat(vaultData.userShares) / 1e7) * parseFloat(vaultData.sharePrice);
      }

      const formattedAmount = maxAmount > 0
        ? maxAmount.toFixed(6).replace(/\.?0+$/, '')
        : '0';

      onAmountSet(formattedAmount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
      console.error('Failed to fetch max amount:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, address, disabled, type, network, onAmountSet]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleMaxClick}
      disabled={!connected || disabled || loading}
      className={`flex items-center gap-1 ${className}`}
      title={type === 'deposit' ? 'Max deposit amount' : 'Max withdraw amount'}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Maximize2 className="h-3 w-3" />
      )}
      Max
    </Button>
  );
}
