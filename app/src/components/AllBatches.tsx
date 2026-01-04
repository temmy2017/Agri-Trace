/* eslint-disable */

// src/components/AllBatches.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blockchainService } from '../services/blockchain';
import { type Batch } from '../types';

const ITEMS_PER_PAGE = 10;

const AllBatches: React.FC = () => {
    const navigate = useNavigate();

    const [allBatches, setAllBatches] = useState<Batch[]>([]);     // Full list from blockchain
    const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]); // After search
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAllBatches();
    }, []);

    const loadAllBatches = async () => {
        setLoading(true);
        setError(null);
        try {
            // Note: Adjust this number if you expect more than 20 batches long-term
            // Or implement true on-chain pagination in your smart contract later
            const batches = await blockchainService.getAllBatches(100); // Increase if needed
            setAllBatches(batches);
            setFilteredBatches(batches);
        } catch (err: any) {
            setError(err.message || 'Failed to load batches');
            console.error('Error loading batches:', err);
        } finally {
            setLoading(false);
            setCurrentPage(1); // Reset to first page on reload
        }
    };

    // Search effect
    useEffect(() => {
        const term = searchTerm.toLowerCase().trim();
        if (term === '') {
            setFilteredBatches(allBatches);
        } else {
            const filtered = allBatches.filter(batch =>
                batch.productType.toLowerCase().includes(term)
            );
            setFilteredBatches(filtered);
        }
        setCurrentPage(1); // Always go back to page 1 when searching
    }, [searchTerm, allBatches]);

    const totalPages = Math.ceil(filteredBatches.length / ITEMS_PER_PAGE);
    const paginatedBatches = filteredBatches.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto text-center py-16">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl font-semibold text-gray-900">Loading All Batches...</h2>
                <p className="text-gray-600 mt-2">Fetching data from blockchain</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">All Product Batches</h1>
                <p className="text-gray-600">Search and explore all tracked batches in the supply chain</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search by product type (e.g., Maize, Cocoa)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
                </div>

                <button
                    onClick={loadAllBatches}
                    disabled={loading}
                    className="px-6 py-3 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors flex items-center space-x-2"
                >
                    <span>🔄</span>
                    <span>Refresh</span>
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Total Batches: {allBatches.length}
                            </h2>
                            {searchTerm && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Showing {filteredBatches.length} result{filteredBatches.length !== 1 ? 's' : ''} for "{searchTerm}"
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {filteredBatches.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">📦</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchTerm ? 'No Matching Batches' : 'No Batches Found'}
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm
                                ? 'Try adjusting your search term.'
                                : 'No product batches have been created yet.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y">
                            {paginatedBatches.map(batch => (
                                <div
                                    key={batch.id}
                                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/batch/${batch.id}`)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-2">
                                                <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                                    Batch #{batch.id}
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {batch.productType}
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Created by:</span>{' '}
                                                    {formatAddress(batch.creator)}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Created:</span>{' '}
                                                    {new Date(batch.creationTimestamp * 1000).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Status:</span>{' '}
                                                    <span className="text-green-600">Active</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <span className="text-green-600 font-medium">View →</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="p-6 border-t flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages} ({filteredBatches.length} total)
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {/* Page numbers - show up to 5 for simplicity */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => goToPage(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === pageNum
                                                        ? 'bg-green-600 text-white'
                                                        : 'border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AllBatches;