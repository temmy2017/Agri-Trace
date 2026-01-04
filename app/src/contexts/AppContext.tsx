/* eslint-disable */

// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type AppState, type UserProfile, Role } from '../types';
import { blockchainService } from '../services/blockchain';
import { userProfileService } from '../services/firebase';
import { ethers } from 'ethers'; // Add this import

interface AppContextType extends AppState {
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    registerUser: (name: string, location: string, role: Role) => Promise<void>;
    loading: boolean;
    error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if wallet was previously connected
    useEffect(() => {
        checkPreviousConnection();
    }, []);

    // Load user profile when address changes
    useEffect(() => {
        if (userAddress) {
            loadUserProfile(userAddress);
            checkRegistration(userAddress);
        }
    }, [userAddress]);

    const checkPreviousConnection = async () => {
        if (window.ethereum && window.ethereum.selectedAddress) {
            try {
                setUserAddress(window.ethereum.selectedAddress);
                setIsConnected(true);
            } catch (err) {
                console.error('Error checking previous connection:', err);
            }
        }
    };

    const loadUserProfile = async (address: string) => {
        try {
            const profile = await userProfileService.getUserProfile(address);
            if (profile) {
                setUserProfile(profile);
            }
        } catch (err) {
            console.error('Error loading user profile:', err);
        }
    };

    const checkRegistration = async (address: string) => {
        try {
            // Just check Firebase profile, not blockchain
            const profile = await userProfileService.getUserProfile(address);
            if (profile) {
                setIsRegistered(true); // Just means they have a Firebase profile
            }
        } catch (err) {
            console.error('Error checking registration:', err);
        }
    };

    const ensureCorrectNetwork = async () => {
        if (!window.ethereum) return false;

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();

            if (network.chainId !== BigInt(import.meta.env.VITE_NETWORK_CHAIN_ID)) {
                // Try to switch network
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${Number(import.meta.env.VITE_NETWORK_CHAIN_ID).toString(16)}` }],
                    });
                    return true;
                } catch (switchError: any) {
                    // If network doesn't exist in MetaMask, add it
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: `0x${Number(import.meta.env.VITE_NETWORK_CHAIN_ID).toString(16)}`,
                                chainName: 'Polygon Amoy Testnet',
                                nativeCurrency: {
                                    name: 'MATIC',
                                    symbol: 'MATIC',
                                    decimals: 18
                                },
                                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                                blockExplorerUrls: ['https://amoy.polygonscan.com/']
                            }]
                        });
                        return true;
                    }
                    throw switchError;
                }
            }
            return true;
        } catch (err) {
            console.error('Network switching failed:', err);
            return false;
        }
    };

    const connectWallet = async () => {
        setLoading(true);
        setError(null);
        try {
            // Ensure correct network first
            const networkOk = await ensureCorrectNetwork();
            if (!networkOk) {
                throw new Error('Please switch to Polygon Amoy network in MetaMask');
            }

            const address = await blockchainService.connect();
            setUserAddress(address);
            setIsConnected(true);

            // Only check Firebase profile
            const profile = await userProfileService.getUserProfile(address);
            if (profile) {
                setUserProfile(profile);
                setIsRegistered(true);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet');
            console.error('Wallet connection error:', err);
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = () => {
        setUserAddress(null);
        setUserProfile(null);
        setIsConnected(false);
        setIsRegistered(false);
        setError(null);
    };

    const registerUser = async (name: string, location: string, role: Role) => {
        if (!userAddress) throw new Error('Wallet not connected');

        setLoading(true);
        setError(null);
        try {
            // Save profile to Firebase
            const profile: UserProfile = {
                walletAddress: userAddress,
                name,
                location,
                role,
                createdAt: new Date(),
            };

            await userProfileService.saveUserProfile(profile);
            setUserProfile(profile);
            setIsRegistered(true);

        } catch (err: any) {
            setError(err.message || 'Failed to register user');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value: AppContextType = {
        userAddress,
        userProfile,
        isConnected,
        isRegistered,
        connectWallet,
        disconnectWallet,
        registerUser,
        loading,
        error,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// MOVE THIS OUTSIDE THE AppProvider COMPONENT
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};