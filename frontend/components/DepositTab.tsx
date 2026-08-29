"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Contract,
    TransactionBuilder,
    SorobanRpc,
    TimeoutInfinite,
    nativeToScVal,
} from "@stellar/stellar-sdk";
import {
    isConnected,
    requestAccess,
    signTransaction,
} from "@stellar/freighter-api";
import { SigningOverlay, type SigningStatus } from "./SigningOverlay";
import { useContractAddress } from "@/hooks/useContractAddress";
import { useNetwork } from "@/contexts/NetworkContext";
import { useVaultContext } from "@/contexts/VaultContext";
import { LegalModal } from "./LegalModal";
import { TermsOfServiceContent, PrivacyPolicyContent } from "./LegalContents";

export function DepositTab() {
    const contractId = useContractAddress("vault");
    const { networkConfig } = useNetwork();
    const rpcUrl = networkConfig.rpcUrl;
    const networkPassphrase = networkConfig.networkPassphrase;

    const [address, setAddress] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [estimatedFee, setEstimatedFee] = useState<string>("Loading...");
    const [overlayOpen, setOverlayOpen] = useState<boolean>(false);
    const [overlayStatus, setOverlayStatus] = useState<SigningStatus>("building");
    const [overlayTxHash, setOverlayTxHash] = useState<string | null>(null);
    const [overlayError, setOverlayError] = useState<string | null>(null);

    const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
    const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);

    const { optimisticBalance, addOptimisticTransaction, updateOptimisticTransaction } = useVaultContext();

    useEffect(() => {
        async function checkConnection() {
            try {
                const connected = await isConnected();
                if (connected) {
                    const addr = await requestAccess();
                    if (addr && typeof addr === "string") setAddress(addr);
                }
            } catch (e) {
                console.error("Connection check failed:", e);
            }
        }
        async function fetchFee() {
            try {
                const server = new SorobanRpc.Server(rpcUrl);
                const feeStats = await server.getFeeStats();
                setEstimatedFee(`${feeStats.sorobanInclusionFee.min} stroops`);
            } catch {
                setEstimatedFee("100 stroops (fallback)");
            }
        }
        checkConnection();
        fetchFee();
        
        // Initialize terms acceptance state from local storage
        if (typeof window !== "undefined") {
            const hasAccepted = localStorage.getItem("hasAcceptedTerms") === "true";
            setAcceptedTerms(hasAccepted);
        }
    }, []);

    const handleConnect = async () => {
        try {
            if (!(await isConnected())) {
                toast.error("Please install Freighter wallet extension!");
                return;
            }
            const addr = await requestAccess();
            if (addr && typeof addr === "string") {
                setAddress(addr);
                toast.success("Wallet connected successfully.");
            }
        } catch (e: unknown) {
            toast.error("Failed to connect: " + (e instanceof Error ? e.message : String(e)));
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) {
            toast.warning("Please connect your wallet first.");
            return;
        }

        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            toast.warning("Please enter a valid amount greater than 0.");
            return;
        }

        if (depositAmount > optimisticBalance) {
            toast.error(`Insufficient balance. (Available: ${optimisticBalance})`);
            return;
        }

        setIsLoading(true);
        setOverlayOpen(true);
        setOverlayStatus("building");
        setOverlayTxHash(null);
        setOverlayError(null);

        try {
            const server = new SorobanRpc.Server(rpcUrl);

            const account = await server.getAccount(address);

            setOverlayStatus("building");
            const contract = new Contract(contractId);

            const tx = new TransactionBuilder(account, {
                fee: "1000",
                networkPassphrase: networkPassphrase,
            })
                .addOperation(
                    contract.call(
                        "deposit",
                        nativeToScVal(address, { type: "address" }),
                        nativeToScVal(
                            (BigInt(Math.floor(depositAmount * 10_000_000))).toString(),
                            { type: "i128" }
                        )
                    )
                )
                .setTimeout(TimeoutInfinite)
                .build();

            setOverlayStatus("simulating");
            const sim = await server.simulateTransaction(tx);
            if (!SorobanRpc.Api.isSimulationSuccess(sim)) {
                setOverlayStatus("error");
                setOverlayError("Simulation failed. Check console for details.");
                console.error("Simulation failed:", sim);
                return;
            }

            const preparedTxBuilder = SorobanRpc.assembleTransaction(tx, sim);

            setOverlayStatus("signing");
            const signedXdr = await signTransaction(preparedTxBuilder.build().toXDR(), {
                networkPassphrase: networkPassphrase,
            });

            setOverlayStatus("submitting");
            const txToSubmit = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
            const result = await server.sendTransaction(txToSubmit);

            if (result.status !== "PENDING") {
                setOverlayStatus("error");
                setOverlayError("Transaction submission failed.");
                console.error("Submission failed:", result);
                return;
            }

            setOverlayTxHash(result.hash);
            setOverlayStatus("success");
            toast.success(`Deposit successful! Hash: ${result.hash}`);
            
            addOptimisticTransaction({
                id: result.hash,
                kind: "DEPOSIT",
                txHash: result.hash,
                timestampISO: new Date().toISOString(),
                amount: depositAmount.toString(),
                asset: "USDC",
                account: address,
                status: "submitted"
            });

            setAmount("");
        } catch (error: unknown) {
            console.error(error);
            setOverlayStatus("error");
            setOverlayError(error instanceof Error ? error.message : String(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <SigningOverlay
                isOpen={overlayOpen}
                status={overlayStatus}
                txHash={overlayTxHash}
                error={overlayError}
                onClose={() => setOverlayOpen(false)}
            />
            <div className="w-full mx-auto p-4 sm:p-6 bg-transparent">
                <h2 id="deposit-form-title" className="text-2xl font-semibold mb-4 text-card-foreground">
                    Deposit Funds
                </h2>

                {!address && (
                    <button
                        type="button"
                        onClick={handleConnect}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors mb-4"
                        aria-label="Connect Freighter wallet"
                    >
                        Connect Freighter Wallet
                    </button>
                )}

                {address && (
                    <p className="text-sm text-muted-foreground mb-6 break-all" id="deposit-wallet-status">
                        Connected: {address}
                    </p>
                )}

                <form onSubmit={handleDeposit} className="space-y-4" aria-labelledby="deposit-form-title">
                    <div>
                        <label htmlFor="deposit-amount" className="block text-sm font-medium mb-1">
                            Amount (USDC)
                        </label>
                        <input
                            id="deposit-amount"
                            name="deposit-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isLoading || !address}
                            className="w-full border rounded p-2 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0.00"
                            required
                            aria-label="Deposit amount in USDC"
                            aria-describedby="deposit-amount-balance deposit-network-fee"
                        />
                        <div
                            id="deposit-amount-balance"
                            className="flex justify-between mt-1 text-xs text-muted-foreground"
                        >
                            <span>Available Balance:</span>
                            <span>{optimisticBalance} USDC</span>
                        </div>
                    </div>

                    <div
                        id="deposit-network-fee"
                        className="flex justify-between items-center text-sm text-muted-foreground bg-secondary/20 p-2 rounded"
                    >
                        <span>Estimated Network Fee:</span>
                        <span>{estimatedFee}</span>
                    </div>

                    <div className="flex items-start gap-2 mt-4 text-sm">
                        <input
                            type="checkbox"
                            id="accept-terms"
                            checked={acceptedTerms}
                            onChange={(e) => {
                                setAcceptedTerms(e.target.checked);
                                localStorage.setItem("hasAcceptedTerms", e.target.checked ? "true" : "false");
                            }}
                            className="mt-1 flex-shrink-0 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-background"
                        />
                        <label htmlFor="accept-terms" className="text-muted-foreground leading-snug select-none">
                            I accept the{" "}
                            <button
                                type="button"
                                onClick={() => setIsTermsOpen(true)}
                                className="text-blue-500 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-0.5"
                            >
                                Terms of Service
                            </button>{" "}
                            and{" "}
                            <button
                                type="button"
                                onClick={() => setIsPrivacyOpen(true)}
                                className="text-blue-500 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-0.5"
                            >
                                Privacy Policy
                            </button>
                            .
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !amount || !address || !acceptedTerms}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors mt-2"
                    >
                        {isLoading ? "Processing..." : "Deposit"}
                    </button>
                </form>
            </div>

            <LegalModal
                isOpen={isTermsOpen}
                onClose={() => setIsTermsOpen(false)}
                title="Terms of Service"
            >
                <TermsOfServiceContent />
            </LegalModal>

            <LegalModal
                isOpen={isPrivacyOpen}
                onClose={() => setIsPrivacyOpen(false)}
                title="Privacy Policy"
            >
                <PrivacyPolicyContent />
            </LegalModal>
        </>
    );
}
