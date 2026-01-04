// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Role } from '../types';

const Header: React.FC = () => {
    const {
        userAddress,
        isConnected,
        isRegistered,
        userProfile,
        connectWallet,
        disconnectWallet,
        loading
    } = useAppContext();

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getRoleName = (role: Role) => {
        const roleNames = {
            [Role.Farmer]: 'Farmer',
            [Role.Aggregator]: 'Aggregator',
            [Role.Processor]: 'Processor',
            [Role.Retailer]: 'Retailer',
            [Role.Regulator]: 'Regulator',
        };
        return roleNames[role];
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and Brand */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">🌱</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">AgriTrace</h1>
                            <p className="text-sm text-gray-500">Nigeria Agricultural Supply Chain</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center space-x-8">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                        >
                            Dashboard
                        </Link>

                        {isRegistered && userProfile?.role === Role.Farmer && (
                            <Link
                                to="/create-batch"
                                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                            >
                                Create Batch
                            </Link>
                        )}

                        <Link
                            to="/profile"
                            className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                        >
                            Profile
                        </Link>

                        <Link
                            to="/all-batches"
                            className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                        >
                            All Batches
                        </Link>
                    </nav>

                    {/* Wallet Connection */}
                    <div className="flex items-center space-x-4">
                        {isConnected ? (
                            <div className="flex items-center space-x-3">
                                {/* User Info */}
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        {userProfile ? userProfile.name : formatAddress(userAddress!)}
                                    </div>
                                    {userProfile && (
                                        <div className="text-xs text-gray-500">
                                            {getRoleName(userProfile.role)} • {userProfile.location}
                                        </div>
                                    )}
                                    {!userProfile && (
                                        <div className="text-xs text-orange-600 font-medium">
                                            Complete Profile
                                        </div>
                                    )}
                                </div>

                                {/* Connection Status */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Connected</span>
                                </div>

                                {/* Disconnect Button */}
                                <button
                                    onClick={disconnectWallet}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={connectWallet}
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🔗</span>
                                        <span>Connect Wallet</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;