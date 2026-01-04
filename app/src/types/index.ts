/* eslint-disable */

// src/types/index.ts

// Use const objects instead of enums for better Tree Shaking
export const Role = {
  Farmer: 0,
  Aggregator: 1,
  Processor: 2,
  Retailer: 3,
  Regulator: 4,
} as const;

export const EventType = {
  Harvest: 0,
  Shipment: 1,
  Processing: 2,
  QualityCheck: 3,
  Sale: 4,
} as const;

// Create the actual types from the const objects
export type Role = typeof Role[keyof typeof Role];
export type EventType = typeof EventType[keyof typeof EventType];

// Renamed from 'Event' to 'SupplyChainEvent' to avoid conflict with global Event type
export interface SupplyChainEvent {
  eventType: EventType;
  actor: string;
  timestamp: number;
  dataHash: string;
}

export interface Batch {
  id: number;
  creator: string;
  productType: string;
  creationTimestamp: number;
}

// Firebase user profile
export interface UserProfile {
  walletAddress: string;
  name: string;
  location: string;
  role: Role;
  createdAt?: Date; // Make optional with ?
}

// App context types
export interface AppState {
  userAddress: string | null;
  userProfile: UserProfile | null;
  isConnected: boolean;
  isRegistered: boolean;
}

// Ethereum window extension
declare global {
  interface Window {
    ethereum?: any;
  }
}