/* eslint-disable */
// src/components/AddEvent.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { blockchainService } from '../services/blockchain';
import { EventType, type Batch } from '../types';

const AddEvent: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { userProfile } = useAppContext();

    const [batch, setBatch] = useState<Batch | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Initial form state — eventType will be set dynamically
    const [formData, setFormData] = useState<{
        eventType: EventType;
        notes: string;
        location: string;
        qualityScore: string;
        certificateHash: string;
    }>({
        eventType: EventType.Shipment, // temporary placeholder
        notes: '',
        location: '',
        qualityScore: '',
        certificateHash: ''
    });

    useEffect(() => {
        loadBatchData();
    }, [id]);

    const loadBatchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const batchData = await blockchainService.getBatch(parseInt(id));
            setBatch(batchData);
        } catch (err: any) {
            setError(err.message || 'Failed to load batch');
        } finally {
            setLoading(false);
        }
    };

    // Set default event type based on user's allowed events
    useEffect(() => {
        if (userProfile) {
            const available = getAvailableEventTypes();
            if (available.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    eventType: available[0].value // First allowed event as default
                }));
            }
        }
    }, [userProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !userProfile) return;

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const dataHash = JSON.stringify({
                notes: formData.notes,
                location: formData.location,
                qualityScore: formData.qualityScore || undefined,
                certificateHash: formData.certificateHash || undefined,
                recordedBy: userProfile.name,
                role: userProfile.role
            });

            await blockchainService.recordEvent(parseInt(id), formData.eventType, dataHash);

            console.log('Event recorded:', { batchId: id, eventType: formData.eventType });

            setSuccess('Event recorded successfully!');
            setTimeout(() => {
                navigate(`/batch/${id}`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to record event');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'eventType' ? Number(value) as EventType : value
        }));
    };

    const getAvailableEventTypes = () => {
        if (!userProfile) return [];

        const allEvents = [
            { value: EventType.Shipment, label: 'Shipment', roles: [1] },         // Aggregator
            { value: EventType.Processing, label: 'Processing', roles: [2] },     // Processor
            { value: EventType.QualityCheck, label: 'Quality Check', roles: [2, 4] }, // Processor & Regulator
            { value: EventType.Sale, label: 'Sale', roles: [3] },                // Retailer
        ];

        return allEvents.filter(event => event.roles.includes(userProfile.role));
    };

    const availableEvents = getAvailableEventTypes();

    // Safeguard: no permissions
    if (userProfile && availableEvents.length === 0) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 inline-block">
                    <h3 className="text-xl font-semibold text-yellow-900 mb-4">
                        No Permission
                    </h3>
                    <p className="text-yellow-800">
                        Your role does not allow recording any events for batches.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl font-semibold text-gray-900">Loading Batch...</h2>
            </div>
        );
    }

    if (error && !batch) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                    <p className="text-red-800 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => navigate(`/batch/${id}`)}
                    className="inline-flex items-center text-green-600 hover:text-green-800 font-medium mb-4"
                >
                    ← Back to Batch #{id}
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Record Event for Batch #{id}
                </h1>
                <p className="text-gray-600">
                    {batch && `Product: ${batch.productType}`}
                </p>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">{success}</p>
                    <p className="text-green-700 text-sm mt-1">Redirecting to batch view...</p>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Event Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Type
                            </label>
                            <select
                                name="eventType"
                                value={formData.eventType}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                {availableEvents.map(event => (
                                    <option key={event.value} value={event.value}>
                                        {event.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-sm text-gray-500">
                                Available based on your role ({userProfile?.role})
                            </p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="e.g., Lagos Warehouse, Processing Plant"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Additional information about this event..."
                            />
                        </div>

                        {/* Quality Check Specific Fields */}
                        {formData.eventType === EventType.QualityCheck && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quality Score (1-10)
                                    </label>
                                    <input
                                        type="number"
                                        name="qualityScore"
                                        value={formData.qualityScore}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="10"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g., 8"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Certificate Reference (optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="certificateHash"
                                        value={formData.certificateHash}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g., Certificate ID, IPFS hash, or reference number"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={submitting || availableEvents.length === 0}
                            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Recording Event...</span>
                                </>
                            ) : (
                                <>
                                    <span>📝</span>
                                    <span>Record Event on Blockchain</span>
                                </>
                            )}
                        </button>
                        <p className="mt-2 text-sm text-gray-500 text-center">
                            This will create an immutable record on the Polygon blockchain
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEvent;