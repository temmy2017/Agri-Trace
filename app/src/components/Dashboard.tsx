/* eslint-disable */

// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate
import { useAppContext } from '../contexts/AppContext';
import { Role, type Batch } from '../types';
import { blockchainService } from '../services/blockchain';

const Dashboard: React.FC = () => {
    const { isConnected, userProfile, userAddress } = useAppContext();
    const navigate = useNavigate(); // Add this
    const [userBatches, setUserBatches] = useState<Batch[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [userEventsBatches, setUserEventsBatches] = useState<Batch[]>([]);

    useEffect(() => {
        if (userAddress && isConnected) {
            loadUserBatches();
            loadBatchesWithUserEvents();
        }
    }, [userAddress, isConnected]);

    const loadUserBatches = async () => {
        if (!userAddress) return;

        setLoadingBatches(true);
        try {
            // Get batches created by the current user
            const batches = await blockchainService.getBatchesByCreator(userAddress, 5);
            setUserBatches(batches);
        } catch (err) {
            console.error('Error loading batches:', err);
            setUserBatches([]); // Set empty array on error
        } finally {
            setLoadingBatches(false);
        }
    };

    const loadBatchesWithUserEvents = async () => {
        if (!userAddress) return;

        setLoadingBatches(true);
        try {
            const batches = await blockchainService.getBatchesWithUserEvents(userAddress, 5);
            setUserEventsBatches(batches);
        } catch (err) {
            console.error('Error loading batches with events:', err);
            setUserEventsBatches([]);
        } finally {
            setLoadingBatches(false);
        }
    };

    const renderBatchList = (batches: Batch[], title: string) => {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                    <button
                        onClick={() => {
                            loadUserBatches();
                            loadBatchesWithUserEvents();
                        }}
                        disabled={loadingBatches}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1"
                    >
                        {loadingBatches ? (
                            <>
                                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Refreshing...</span>
                            </>
                        ) : (
                            <span>Refresh</span>
                        )}
                    </button>
                </div>

                <div className="space-y-3">
                    {loadingBatches ? (
                        <div className="text-center py-6">
                            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-600 mt-3 text-sm">Loading batches...</p>
                        </div>
                    ) : batches.length > 0 ? (
                        batches.map(batch => (
                            <div
                                key={batch.id}
                                className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                                onClick={() => navigate(`/batch/${batch.id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Batch #{batch.id}</h4>
                                        <p className="text-sm text-gray-600">{batch.productType}</p>
                                    </div>
                                    <span className="text-green-600 text-sm font-medium">View →</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-600 mb-4">No batches found.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };


    if (!isConnected) {
        return (
            <div className="max-w-4xl mx-auto text-center py-16">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🌱</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to AgriTrace
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Transparent and traceable agricultural supply chain for Nigeria.
                    Connect your wallet to start tracking your products from farm to consumer.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        How it works:
                    </h3>
                    <ul className="text-blue-800 text-left space-y-2">
                        <li>• Farmers create product batches and record harvest events</li>
                        <li>• Aggregators handle transportation and logistics</li>
                        <li>• Processors transform and package products</li>
                        <li>• Regulators verify quality and compliance</li>
                        <li>• Consumers trace product origin and journey</li>
                    </ul>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">📝</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Complete Your Profile
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    You need to complete your profile to start using AgriTrace.
                </p>
                <Link
                    to="/profile"
                    className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                    Complete Profile
                </Link>
            </div>
        );
    }

    // Role-specific dashboard content
    const renderRoleSpecificContent = () => {
        if (!userProfile) return null;

        switch (userProfile.role) {
            case Role.Farmer:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Left Card – stays compact */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Farmer Dashboard
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create new product batches and manage your harvest records.
                            </p>
                            <Link
                                to="/create-batch"
                                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Create New Batch
                            </Link>
                        </div>

                        {/* Right Card – grows as needed */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Your Batches
                                </h3>
                                <button
                                    onClick={loadUserBatches}
                                    disabled={loadingBatches}
                                    className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1"
                                >
                                    {loadingBatches ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Refreshing...</span>
                                        </>
                                    ) : (
                                        <span>Refresh</span>
                                    )}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {loadingBatches ? (
                                    <div className="text-center py-12">
                                        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-gray-600 mt-3 text-sm">Loading batches...</p>
                                    </div>
                                ) : userBatches.length > 0 ? (
                                    <div className="space-y-3">
                                        {userBatches.map(batch => (
                                            <div
                                                key={batch.id}
                                                className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/batch/${batch.id}`)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">Batch #{batch.id}</h4>
                                                        <p className="text-sm text-gray-600">{batch.productType}</p>
                                                    </div>
                                                    <span className="text-green-600 text-sm font-medium">View →</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600 mb-4">You haven't created any batches yet.</p>
                                        <Link
                                            to="/create-batch"
                                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Create Your First Batch
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            // In Dashboard.tsx, update each role case:

            case Role.Aggregator:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Aggregator Dashboard
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Manage product shipments and transportation logistics.
                            </p>
                            <Link
                                to="/all-batches"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mb-3"
                            >
                                View All Batches
                            </Link>
                            <p className="text-sm text-gray-500">
                                Record shipment events for batches in transit
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    to="/all-batches"
                                    className="block px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors"
                                >
                                    📦 View Shipment Queue
                                </Link>
                                <button className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-500 font-medium rounded-lg">
                                    📊 View Statistics (Coming Soon)
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case Role.Processor:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Processor Dashboard
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Track products for processing and quality control.
                            </p>
                            <Link
                                to="/all-batches"
                                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors mb-3"
                            >
                                View All Batches
                            </Link>
                            <p className="text-sm text-gray-500">
                                Record processing and quality check events
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Processing Tasks
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    to="/all-batches"
                                    className="block px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded-lg transition-colors"
                                >
                                    🏭 View Processing Queue
                                </Link>
                                <button className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-500 font-medium rounded-lg">
                                    ✅ Quality Control Log (Coming Soon)
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case Role.Regulator:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Regulator Dashboard
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Monitor supply chain compliance and conduct quality checks.
                            </p>
                            <Link
                                to="/all-batches"
                                className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors mb-3"
                            >
                                View All Batches
                            </Link>
                            <p className="text-sm text-gray-500">
                                Conduct audits and verify compliance standards
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Regulatory Tools
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    to="/all-batches"
                                    className="block px-4 py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium rounded-lg transition-colors"
                                >
                                    🔍 Audit Trail
                                </Link>
                                <button className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-500 font-medium rounded-lg">
                                    📋 Compliance Reports (Coming Soon)
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Welcome to AgriTrace
                        </h3>
                        <p className="text-gray-600">
                            Explore the transparent agricultural supply chain.
                        </p>
                    </div>
                );
        }
    };

    // return (
    //     <div className="max-w-6xl mx-auto">
    //         <div className="mb-8">
    //             <h1 className="text-3xl font-bold text-gray-900 mb-2">
    //                 Welcome back, {userProfile?.name}!
    //             </h1>
    //             <p className="text-gray-600">
    //                 Manage your agricultural supply chain activities.
    //             </p>
    //         </div>

    //         {renderRoleSpecificContent()}

    //         {/* Quick Stats - Update these with real data later */}
    //         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
    //             <div className="bg-white rounded-lg shadow-sm border p-6">
    //                 <div className="text-2xl font-bold text-gray-900 mb-2">{userBatches.length}</div>
    //                 <div className="text-gray-600">Total Batches</div>
    //             </div>
    //             <div className="bg-white rounded-lg shadow-sm border p-6">
    //                 <div className="text-2xl font-bold text-gray-900 mb-2">0</div>
    //                 <div className="text-gray-600">Pending Actions</div>
    //             </div>
    //             <div className="bg-white rounded-lg shadow-sm border p-6">
    //                 <div className="text-2xl font-bold text-gray-900 mb-2">0</div>
    //                 <div className="text-gray-600">Recent Events</div>
    //             </div>
    //         </div>
    //     </div>
    // );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {userProfile?.name}!
                </h1>
                <p className="text-gray-600">
                    Manage your agricultural supply chain activities.
                </p>
            </div>

            {renderRoleSpecificContent()}

            {/* Add this section to show batches with user events */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderBatchList(userBatches, "Batches You Created")}
                {renderBatchList(userEventsBatches, "Batches You've Interacted With")}
            </div>

            {/* Quick Stats - Update these with real data later */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="text-2xl font-bold text-gray-900 mb-2">{userBatches.length}</div>
                    <div className="text-gray-600">Batches Created</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="text-2xl font-bold text-gray-900 mb-2">{userEventsBatches.length}</div>
                    <div className="text-gray-600">Batches with Events</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="text-2xl font-bold text-gray-900 mb-2">0</div>
                    <div className="text-gray-600">Pending Actions</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;