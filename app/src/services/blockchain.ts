/* eslint-disable */

// src/services/blockchain.ts

import { ethers } from 'ethers';
import { EventType } from '../types';
import type { Batch, SupplyChainEvent } from '../types';

const SUPPLY_CHAIN_ABI = [
    // Simple functions only
    "function createBatch(string memory _productType) external returns (uint256)",
    "function recordEvent(uint256 _batchId, uint8 _eventType, string memory _dataHash) external",
    "function getBatch(uint256 _batchId) external view returns (uint256, address, string memory, uint256)",
    "function getBatchHistoryCount(uint256 _batchId) external view returns (uint256)",
    "function getBatchEvent(uint256 _batchId, uint256 _index) external view returns ((uint8,address,uint256,string) memory)",
    "function nextBatchId() external view returns (uint256)",
    "event BatchCreated(uint256 indexed batchId, address indexed creator, string productType)",
    "event EventRecorded(uint256 indexed batchId, uint8 eventType, address indexed actor, string dataHash)"
] as const;

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const chainId = import.meta.env.VITE_NETWORK_CHAIN_ID;

export class BlockchainService {
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.Signer | null = null;
    public contract: ethers.Contract | null = null;

    // Connect to MetaMask and initialize contract
    async connect(): Promise<string> {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        try {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.contract = new ethers.Contract(contractAddress, SUPPLY_CHAIN_ABI, this.signer);

            // Check network - but handle errors gracefully
            try {
                const network = await this.provider.getNetwork();
                if (network.chainId !== BigInt(chainId)) {
                    throw new Error(`Please switch to Polygon Amoy network (Chain ID: ${chainId})`);
                }
            } catch (networkError) {
                console.warn('Network check failed:', networkError);
                // Continue anyway - the user might fix the network later
            }

            return await this.signer.getAddress();
        } catch (err: any) {
            // Provide more specific error messages
            if (err.message?.includes('user rejected')) {
                throw new Error('Connection rejected by user');
            } else if (err.message?.includes('chain')) {
                throw new Error(`Please switch to Polygon Amoy network (Chain ID: ${chainId})`);
            } else {
                throw new Error(`Failed to connect: ${err.message}`);
            }
        }
    }

    async createBatch(productType: string): Promise<number> {
        try {
            if (!this.contract) {
                await this.connect();
            }

            if (!this.contract) {
                throw new Error('Not connected to blockchain');
            }

            const tx = await this.contract.createBatch(productType);
            const receipt = await tx.wait();

            // Find the log from your contract
            const log = receipt.logs.find((log: any) =>
                log.address.toLowerCase() === contractAddress.toLowerCase()
            );

            if (!log) {
                throw new Error('BatchCreated event not found in transaction receipt');
            }

            const parsedLog = this.contract.interface.parseLog(log);

            // Now properly check if parsing succeeded
            if (!parsedLog) {
                throw new Error('Failed to parse log - event signature may not match');
            }

            // Now safe to access args
            const batchId = parsedLog.args.batchId;

            // Handle different possible types
            let batchIdNumber: number;

            if (typeof batchId === 'bigint') {
                // It's a BigInt
                batchIdNumber = Number(batchId);
            } else if (batchId?.toNumber) {
                // It's a BigNumber
                batchIdNumber = batchId.toNumber();
            } else if (batchId?.toString) {
                // It has a toString method (BigNumber or similar)
                batchIdNumber = parseInt(batchId.toString(), 10);
            } else if (typeof batchId === 'number') {
                // Already a number
                batchIdNumber = batchId;
            } else if (typeof batchId === 'string') {
                // It's a string
                batchIdNumber = parseInt(batchId, 10);
            } else {
                // Unknown type, try to convert
                batchIdNumber = Number(batchId);
            }

            // Validate the batch ID
            if (isNaN(batchIdNumber) || batchIdNumber <= 0) {
                console.warn('Invalid batch ID returned, trying alternative method...');

                // Alternative: Get the latest batch ID from the contract
                const nextId = await this.contract.nextBatchId();
                batchIdNumber = Number(nextId) - 1; // The just created batch ID
            }

            return batchIdNumber;

        } catch (err: any) {
            if (err.message.includes('Not connected to blockchain')) {
                throw new Error('Please connect your wallet first');
            }
            throw err;
        }
    }

    // Record an event for a batch
    async recordEvent(batchId: number, eventType: EventType, dataHash: string = ""): Promise<void> {
        try {
            // Try to connect if not already connected
            if (!this.contract) {
                await this.connect();
            }

            if (!this.contract) throw new Error('Not connected to blockchain');

            const eventTypeNumber = typeof eventType === 'number' ? eventType : EventType[eventType as keyof typeof EventType];
            const tx = await this.contract.recordEvent(batchId, eventTypeNumber, dataHash);
            await tx.wait();
        } catch (err: any) {
            if (err.message.includes('Not connected to blockchain')) {
                throw new Error('Please connect your wallet first');
            }
            throw err;
        }
    }

    // Get batch information
    async getBatch(batchId: number): Promise<Batch> {
        try {
            // Try to connect if not already connected
            if (!this.contract) {
                await this.connect();
            }

            if (!this.contract) throw new Error('Not connected to blockchain');

            const [id, creator, productType, creationTimestamp] = await this.contract.getBatch(batchId);
            return {
                id: Number(id),
                creator,
                productType,
                creationTimestamp: Number(creationTimestamp)
            };
        } catch (err: any) {
            // Re-throw with better error message
            if (err.message.includes('Not connected to blockchain')) {
                throw new Error('Please connect your wallet first');
            }
            throw err;
        }
    }

    // Update getBatchHistory method:
    async getBatchHistory(batchId: number): Promise<SupplyChainEvent[]> {
        try {
            if (!this.contract) {
                await this.connect();
            }

            if (!this.contract) {
                console.warn('Not connected to blockchain for batch history');
                return [];
            }

            try {
                const eventCount = await this.contract.getBatchHistoryCount(batchId);

                const events: SupplyChainEvent[] = [];

                for (let i = 0; i < eventCount; i++) {
                    try {
                        const result = await this.contract.getBatchEvent(batchId, i);

                        if (Array.isArray(result) && result.length >= 4) {
                            const [eventType, actor, timestamp, dataHash] = result;

                            events.push({
                                eventType: Number(eventType) as EventType,
                                actor,
                                timestamp: Number(timestamp),
                                dataHash: dataHash || ''
                            });
                        }
                    } catch (eventError: any) {
                        console.error(`Error fetching event ${i} for batch ${batchId}:`, eventError);
                        continue;
                    }
                }

                return events;
            } catch (historyError: any) {
                console.error(`Error getting event count for batch ${batchId}:`, historyError);
                return [];
            }
        } catch (err: any) {
            console.error(`General error getting history for batch ${batchId}:`, err);
            return [];
        }
    }

    // Get all batches (limited for now - in production you'd use events)
    async getAllBatches(limit: number = 10): Promise<Batch[]> {
        try {
            if (!this.contract) {
                await this.connect();
            }

            if (!this.contract) throw new Error('Not connected to blockchain');

            const batches: Batch[] = [];
            const nextId = await this.contract.nextBatchId();
            const totalBatches = Number(nextId) - 1; // Subtract 1 because nextId is the next available ID

            // Start from the most recent batch and work backwards
            const start = Math.max(1, totalBatches - limit + 1);

            for (let i = totalBatches; i >= start && i > 0; i--) {
                try {
                    const batch = await this.getBatch(i);
                    batches.push(batch);
                } catch (err) {
                    console.warn(`Could not fetch batch ${i}:`, err);
                }
            }

            return batches;
        } catch (err: any) {
            console.error('Error getting all batches:', err);
            return [];
        }
    }

    // Get batches created by a specific address
    async getBatchesByCreator(creatorAddress: string, limit: number = 10): Promise<Batch[]> {
        try {
            if (!this.contract) {
                await this.connect();
            }

            if (!this.contract) throw new Error('Not connected to blockchain');

            const allBatches = await this.getAllBatches(50); // Get more to filter
            const creatorBatches = allBatches.filter(batch =>
                batch.creator.toLowerCase() === creatorAddress.toLowerCase()
            );

            return creatorBatches.slice(0, limit);
        } catch (err: any) {
            console.error('Error getting batches by creator:', err);
            return [];
        }
    }

    async getBatchesWithUserEvents(userAddress: string, limit: number = 10): Promise<Batch[]> {
        try {
            if (!this.contract) {
                await this.connect();
            }

            if (!this.contract) throw new Error('Not connected to blockchain');

            const allBatches = await this.getAllBatches(50);
            const userInvolvedBatches: Batch[] = [];

            for (const batch of allBatches) {
                try {
                    const events = await this.getBatchHistory(batch.id);
                    // Check if user recorded any event in this batch
                    const userEvents = events.filter(event =>
                        event.actor.toLowerCase() === userAddress.toLowerCase()
                    );

                    if (userEvents.length > 0) {
                        userInvolvedBatches.push(batch);
                    }
                } catch (err) {
                    continue;
                }

                if (userInvolvedBatches.length >= limit) break;
            }

            return userInvolvedBatches;
        } catch (err: any) {
            console.error('Error getting batches with user events:', err);
            return [];
        }
    }
}

export const blockchainService = new BlockchainService();