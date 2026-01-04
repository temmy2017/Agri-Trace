/* eslint-disable */

// src/components/BatchCreation.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { blockchainService } from '../services/blockchain';

const BatchCreation: React.FC = () => {
    const { isConnected } = useAppContext();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        productType: '',
        description: '',
        harvestDate: '',
        location: '',
        quantity: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [batchId, setBatchId] = useState<number | null>(null);

    // Common agricultural products in Nigeria
    const productTypes = [
        'Maize',
        'Cassava',
        'Rice',
        'Yam',
        'Tomato',
        'Pepper',
        'Beans',
        'Soybean',
        'Millet',
        'Sorghum',
        'Cocoa',
        'Palm Oil',
        'Groundnut',
        'Plantain',
        'Banana'
    ];

    if (!isConnected) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🔗</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Connect Your Wallet
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                    Please connect your wallet to create product batches.
                </p>
            </div>
        );
    }

    // In BatchCreation.tsx, update the handleSubmit function:
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Ensure blockchain service is connected
            if (!blockchainService.contract) {
                await blockchainService.connect();
            }

            console.log('Starting batch creation...');

            // Create batch on blockchain
            const newBatchId = await blockchainService.createBatch(formData.productType);

            console.log('Batch created with ID:', newBatchId);
            setBatchId(newBatchId);
            setSuccess(`Batch created successfully! Batch ID: ${newBatchId}`);

            // Reset form
            setFormData({
                productType: '',
                description: '',
                harvestDate: '',
                location: '',
                quantity: ''
            });

            // Auto-record harvest event if harvest date is provided
            if (formData.harvestDate) {
                try {
                    const harvestDataHash = JSON.stringify({
                        description: formData.description,
                        harvestDate: formData.harvestDate,
                        location: formData.location,
                        quantity: formData.quantity
                    });

                    await blockchainService.recordEvent(newBatchId, 0, harvestDataHash); // EventType.Harvest = 0
                    setSuccess(prev => prev + ' Harvest event recorded automatically.');
                } catch (harvestError) {
                    console.warn('Could not record harvest event:', harvestError);
                    // Don't fail the entire batch creation if harvest event fails
                }
            }

        } catch (err: any) {
            console.error('Batch creation error details:', err);

            // Check if it's just the batch ID parsing error
            if (err.message.includes('batchId.toNumber') || err.message.includes('batch ID')) {
                // The batch was created but we couldn't get the ID
                setSuccess('Batch created successfully! The transaction was confirmed on the blockchain.');
                setError('Note: Could not retrieve batch ID automatically. Please check your dashboard for the new batch.');
            } else {
                setError(err.message || 'Failed to create batch. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create New Product Batch
                </h1>
                <p className="text-gray-600">
                    Create a new agricultural product batch to start tracking its journey through the supply chain.
                </p>
            </div>

            {/* Success Card */}
            {success && (
                <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-sm">✓</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-green-900 mb-2">
                                Batch Created Successfully!
                            </h3>
                            <p className="text-green-800 mb-4">{success}</p>
                            {batchId && (
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => navigate(`/batch/${batchId}`)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        View Batch Details
                                    </button>
                                    <button
                                        onClick={() => setSuccess(null)}
                                        className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 font-medium rounded-lg transition-colors"
                                    >
                                        Create Another Batch
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Error Card */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-red-800 font-semibold mb-1">Error Creating Batch</h4>
                    <p className="text-red-700">{error}</p>
                    {error.includes('connect') && (
                        <p className="text-red-600 text-sm mt-2">
                            Try reconnecting your wallet or checking your network connection.
                        </p>
                    )}
                    {error.includes('gas') && (
                        <p className="text-red-600 text-sm mt-2">
                            Make sure you have enough MATIC in your wallet for gas fees.
                        </p>
                    )}
                </div>
            )}

            {/* Batch Creation Form */}
            {!success && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6">

                            {/* Product Type */}
                            <div>
                                <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Type *
                                </label>
                                <select
                                    id="productType"
                                    name="productType"
                                    value={formData.productType}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select a product type</option>
                                    {productTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Describe the product batch (e.g., organic, grade A, etc.)"
                                />
                            </div>

                            {/* Harvest Date */}
                            <div>
                                <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-2">
                                    Harvest Date
                                </label>
                                <input
                                    type="date"
                                    id="harvestDate"
                                    name="harvestDate"
                                    value={formData.harvestDate}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    If provided, a harvest event will be automatically recorded
                                </p>
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                    Farm Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Specific farm location (e.g., Oyo State, Ibadan)"
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                    Estimated Quantity
                                </label>
                                <input
                                    type="text"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="e.g., 100kg, 50 bags, 2000 units"
                                />
                            </div>

                        </div>

                        {/* Submit Button */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Creating Batch...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🌱</span>
                                        <span>Create Batch on Blockchain</span>
                                    </>
                                )}
                            </button>
                            <p className="mt-2 text-sm text-gray-500 text-center">
                                This will create an immutable record on the Polygon blockchain
                            </p>
                        </div>
                    </form>
                </div>
            )}

            {/* Information Card */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">About Batch Creation</h3>
                <div className="space-y-2 text-blue-800 text-sm">
                    <p><strong>Immutable Record:</strong> Once created, batch information cannot be altered</p>
                    <p><strong>Unique ID:</strong> Each batch gets a unique identifier for tracking</p>
                    <p><strong>Supply Chain Start:</strong> This begins the product's journey through the supply chain</p>
                    <p><strong>Gas Fees:</strong> Creating a batch requires a small gas fee (paid in MATIC)</p>
                </div>
            </div>
        </div>
    );
};

export default BatchCreation;