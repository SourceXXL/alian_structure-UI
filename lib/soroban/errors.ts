/**
 * Utility to map Soroban/Stellar error codes to human-readable messages
 */
export function getHumanReadableError(error: any): string {
    const message = error.message || String(error);

    if (message.includes("User rejected")) {
        return "Transaction was cancelled by the user.";
    }

    if (message.includes("Simulation failed")) {
        return "Contract simulation failed. This usually means the contract execution would trigger an assertion or error with current parameters.";
    }

    if (message.includes("Insufficient balance")) {
        return "Your account does not have enough XLM to cover the transaction fees.";
    }

    // Handle specific Soroban error codes if available (e.g., in XDR or result)
    if (message.includes("HostError")) {
        return "The Soroban host encountered an error. Check contract logs for details.";
    }

    return message || "An unexpected error occurred during contract interaction.";
}

/**
 * Common Soroban Error Codes (References)
 */
export const SOROBAN_ERROR_CODES = {
    CONTRACT_ERR: 1,
    HOST_ERR: 2,
    AUTH_ERR: 3,
    // Add more as needed based on Soroban spec
};
