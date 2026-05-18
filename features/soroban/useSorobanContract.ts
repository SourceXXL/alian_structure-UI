import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import { SorobanContractFactory } from "../../lib/soroban/client";
import { invokeContract } from "../../lib/soroban/transactions";
import { getHumanReadableError } from "../../lib/soroban/errors";
import { StellarNetwork } from "../../lib/types";

/**
 * Hook for interacting with a Soroban contract
 */
export function useSorobanContract(
    contractId: string,
    network: StellarNetwork,
    specJson?: any
) {
    const queryClient = useQueryClient();
    const factory = useMemo(() => new SorobanContractFactory(network), [network]);

    /**
     * Fetch contract instance
     */
    const { data: contract, isLoading: isLoadingContract } = useQuery(
        ["soroban-contract", contractId, network],
        () => factory.getContract(contractId, specJson),
        { enabled: !!contractId }
    );

    /**
     * Read-only call (Query)
     */
    const useRead = (functionName: string, args: any[] = []) => {
        return useQuery(
            ["soroban-read", contractId, functionName, ...args],
            async () => {
                if (!contract) throw new Error("Contract not initialized");
                return await contract.callReadOnly(functionName, args);
            },
            { enabled: !!contract && !!functionName }
        );
    };

    /**
     * Invoke call (Mutation)
     */
    const useInvoke = (functionName: string) => {
        return useMutation(
            async ({ args, publicKey, signCallback }: {
                args: any[];
                publicKey: string;
                signCallback: any
            }) => {
                if (!contract) throw new Error("Contract not initialized");

                const result = await invokeContract(
                    contract,
                    functionName,
                    args,
                    publicKey,
                    signCallback
                );

                if (!result.success) {
                    throw new Error(getHumanReadableError(result.error));
                }

                return result;
            },
            {
                onSuccess: () => {
                    // Invalidate related reads
                    queryClient.invalidateQueries(["soroban-read", contractId]);
                },
            }
        );
    };

    return {
        contract,
        isLoadingContract,
        useRead,
        useInvoke,
    };
}
