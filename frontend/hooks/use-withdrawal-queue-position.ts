"use client";

import { useState, useEffect, useCallback } from "react";
import { Account, Contract, Networks, scValToNative, TransactionBuilder } from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";
import { getContractAddress } from "@/lib/contracts.config";
import { useNetwork } from "@/contexts/NetworkContext";
import { useWallet } from "@/hooks/use-wallet";

export interface QueuedWithdrawalData {
  user: string;
  asset: string;
  shares: string;
  timestamp: string;
}

export interface UseWithdrawalQueuePositionResult {
  position: number | null;
  estimatedWaitTime: number | null;
  queueLength: number;
  isProcessing: boolean;
  refresh: () => void;
}

export function useWithdrawalQueuePosition(
  userAddress: string | null
): UseWithdrawalQueuePositionResult {
  const { network } = useNetwork();
  const { address: walletAddress } = useWallet();
  const [position, setPosition] = useState<number | null>(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(null);
  const [queueLength, setQueueLength] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const actualUserAddress = userAddress || walletAddress;

  const fetchQueuePosition = useCallback(async () => {
    if (!actualUserAddress) {
      setPosition(null);
      setEstimatedWaitTime(null);
      setQueueLength(0);
      setIsProcessing(false);
      return;
    }

    try {
      const contractAddress = getContractAddress(network, 'vault');
      const rpcUrl = network === "mainnet"
        ? "https://rpc.mainnet.stellar.org"
        : "https://rpc.testnet.stellar.org";

      const server = new rpc.Server(rpcUrl);
      const contract = new Contract(contractAddress);

      const pendingWithdrawalsCall = contract.call("get_pending_withdrawals");
      const sourceAccount = new Account(actualUserAddress, "0");

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: "100",
        networkPassphrase:
          network === "mainnet"
            ? Networks.PUBLIC
            : Networks.TESTNET,
      })
        .addOperation(pendingWithdrawalsCall)
        .setTimeout(30)
        .build();

      const simulated = await server.simulateTransaction(transaction);

      if (!("error" in simulated) && simulated.result) {
        const nativeResult = scValToNative(simulated.result.retval);
        if (Array.isArray(nativeResult)) {
          const queue: QueuedWithdrawalData[] = nativeResult.map((item: any) => ({
            user: item.user?.toString() || "",
            asset: item.asset?.toString() || "",
            shares: item.shares?.toString() || "0",
            timestamp: item.timestamp?.toString() || "0",
          }));

          const userPosition = queue.findIndex(
            (withdrawal) => withdrawal.user === actualUserAddress
          );

          setPosition(userPosition >= 0 ? userPosition : null);
          setQueueLength(queue.length);

          const estimatedWaitSeconds =
            userPosition >= 0 ? userPosition * 30 : null;
          setEstimatedWaitTime(estimatedWaitSeconds);

          setIsProcessing(queue.length > 0);
        } else {
          setPosition(null);
          setEstimatedWaitTime(null);
          setQueueLength(0);
          setIsProcessing(false);
        }
      } else {
        setPosition(null);
        setEstimatedWaitTime(null);
        setQueueLength(0);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error fetching withdrawal queue position:", error);
      setPosition(null);
      setEstimatedWaitTime(null);
      setQueueLength(0);
      setIsProcessing(false);
    }
  }, [actualUserAddress, network]);

  useEffect(() => {
    fetchQueuePosition();
  }, [actualUserAddress, network, fetchQueuePosition]);

  return {
    position,
    estimatedWaitTime,
    queueLength,
    isProcessing,
    refresh: fetchQueuePosition,
  };
}
