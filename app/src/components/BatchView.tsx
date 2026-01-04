/* eslint-disable */

// src/components/BatchView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blockchainService } from '../services/blockchain';
import { EventType, type Batch, type SupplyChainEvent } from '../types';

interface EventData {
    notes?: string;
    location?: string;
    qualityScore?: string;
    certificateHash?: string;
    recordedBy?: string;
    role?: number;
}

const BatchView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [batch, setBatch] = useState<Batch | null>(null);
    const [events, setEvents] = useState<SupplyChainEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [selectedEvent, setSelectedEvent] = useState<SupplyChainEvent | null>(null);
    const [parsedEventData, setParsedEventData] = useState<EventData | null>(null);

    useEffect(() => {
        loadBatchData();
    }, [id]);

    // Close modal on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedEvent(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const loadBatchData = async () => {
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            if (!blockchainService.contract) {
                await blockchainService.connect();
            }

            const batchId = parseInt(id);
            const batchData = await blockchainService.getBatch(batchId);
            setBatch(batchData);

            const batchEvents = await blockchainService.getBatchHistory(batchId);
            setEvents(batchEvents);
        } catch (err: any) {
            setError(err.message || 'Failed to load batch data');
            console.error('Error loading batch:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const getEventTypeName = (eventType: EventType) => {
        const names: Record<EventType, string> = {
            [EventType.Harvest]: 'Harvest',
            [EventType.Shipment]: 'Shipment',
            [EventType.Processing]: 'Processing',
            [EventType.QualityCheck]: 'Quality Check',
            [EventType.Sale]: 'Sale',
        };
        return names[eventType] || 'Unknown';
    };

    const getEventColor = (eventType: EventType) => {
        switch (eventType) {
            case EventType.Harvest: return 'bg-green-100 text-green-800';
            case EventType.Shipment: return 'bg-blue-100 text-blue-800';
            case EventType.Processing: return 'bg-purple-100 text-purple-800';
            case EventType.QualityCheck: return 'bg-yellow-100 text-yellow-800';
            case EventType.Sale: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const openEventModal = (event: SupplyChainEvent) => {
        setSelectedEvent(event);
        try {
            const data = event.dataHash ? JSON.parse(event.dataHash) : {};
            setParsedEventData(data);
        } catch (err) {
            console.error('Failed to parse event dataHash:', err);
            setParsedEventData({ notes: 'Invalid or corrupted data' });
        }
    };

    // Same loading/error/not found states as before...
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto text-center py-16">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl font-semibold text-gray-900">Loading Batch Data...</h2>
                <p className="text-gray-600 mt-2">Fetching data from blockchain</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Batch</h3>
                    <p className="text-red-800 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">Not Found</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Batch Not Found</h1>
                <p className="text-lg text-gray-600 mb-8">The batch with ID {id} could not be found.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center text-green-600 hover:text-green-800 font-medium mb-4"
                >
                    ← Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Batch #{batch.id}: {batch.productType}
                </h1>
                <p className="text-gray-600">Complete traceability history from farm to consumer</p>
            </div>

            {/* Batch Info Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Batch Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className="block text-sm font-medium text-gray-600">Batch ID</label><p className="text-gray-900 font-medium text-lg">#{batch.id}</p></div>
                    <div><label className="block text-sm font-medium text-gray-600">Product Type</label><p className="text-gray-900 font-medium text-lg">{batch.productType}</p></div>
                    <div><label className="block text-sm font-medium text-gray-600">Created By</label><p className="text-gray-900 font-medium font-mono text-sm">{formatAddress(batch.creator)}</p></div>
                    <div><label className="block text-sm font-medium text-gray-600">Creation Date</label><p className="text-gray-900 font-medium">{formatTimestamp(batch.creationTimestamp)}</p></div>
                    <div><label className="block text-sm font-medium text-gray-600">Blockchain</label><p className="text-gray-900 font-medium">Polygon Amoy</p></div>
                    <div><label className="block text-sm font-medium text-gray-600">Total Events</label><p className="text-gray-900 font-medium text-lg">{events.length}</p></div>
                </div>
            </div>

            {/* Supply Chain Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Supply Chain Timeline</h2>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => navigate(`/batch/${batch.id}/add-event`)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Record Event
                        </button>
                        <button
                            onClick={loadBatchData}
                            className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors flex items-center space-x-2"
                        >
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {events.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">No Events</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Recorded</h3>
                        <p className="text-gray-600">This batch has no recorded events yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {events.map((event, index) => (
                            <div
                                key={index}
                                className="flex cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                                onClick={() => openEventModal(event)}
                            >
                                {/* Timeline dot and line */}
                                <div className="flex flex-col items-center mr-6 mt-1">
                                    <div className={`w-5 h-5 rounded-full ring-4 ring-white ${index === events.length - 1 ? 'bg-green-600' : 'bg-blue-600'}`} />
                                    {index < events.length - 1 && <div className="w-0.5 h-full bg-gray-300 mt-3" />}
                                </div>

                                {/* Event Card */}
                                <div className="flex-1 bg-gradient-to-r from-gray-50 to-transparent rounded-lg p-5 border border-gray-200">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getEventColor(event.eventType)}`}>
                                                    {getEventTypeName(event.eventType)}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {formatTimestamp(event.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 mt-2">
                                                Recorded by: <span className="font-mono text-sm">{formatAddress(event.actor)}</span>
                                            </p>
                                        </div>
                                        <span className="text-green-600 font-medium text-sm">Click for details →</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Event Details: {getEventTypeName(selectedEvent.eventType)}
                                </h3>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="text-gray-400 hover:text-gray-600 text-3xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Event Type</label>
                                        <p className={`mt-1 text-lg font-semibold ${getEventColor(selectedEvent.eventType)} inline-block px-4 py-2 rounded-full`}>
                                            {getEventTypeName(selectedEvent.eventType)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Timestamp</label>
                                        <p className="mt-1 text-gray-900 font-medium">{formatTimestamp(selectedEvent.timestamp)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Wallet Address</label>
                                        <p className="mt-1 text-gray-900 font-mono">{formatAddress(selectedEvent.actor)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600">Data Hash (on-chain)</label>
                                        <p className="mt-1 text-gray-900 font-mono text-xs break-all bg-gray-100 p-3 rounded">
                                            {selectedEvent.dataHash || 'None'}
                                        </p>
                                    </div>
                                </div>

                                {/* Parsed Event Data */}
                                {parsedEventData && Object.keys(parsedEventData).length > 0 && (
                                    <div className="border-t pt-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Event Information</h4>
                                        <div className="space-y-4">
                                            {parsedEventData.location && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600">Location</label>
                                                    <p className="mt-1 text-gray-900">📍 {parsedEventData.location}</p>
                                                </div>
                                            )}
                                            {parsedEventData.notes && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600">Notes</label>
                                                    <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                                                        {parsedEventData.notes}
                                                    </p>
                                                </div>
                                            )}
                                            {parsedEventData.qualityScore && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600">Quality Score</label>
                                                    <p className="mt-1 text-2xl font-bold text-yellow-600">
                                                        {parsedEventData.qualityScore} / 10
                                                    </p>
                                                </div>
                                            )}
                                            {parsedEventData.certificateHash && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600">Certificate Reference</label>
                                                    <p className="mt-1 text-gray-900 font-mono break-all">
                                                        {parsedEventData.certificateHash}
                                                    </p>
                                                </div>
                                            )}
                                            {parsedEventData.recordedBy && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600">Username</label>
                                                    <p className="mt-1 text-gray-900">{parsedEventData.recordedBy}</p>
                                                </div>
                                            )}
                                            {parsedEventData.role !== undefined && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600">Role</label>
                                                    <p className="mt-1 text-gray-900 font-medium">
                                                        {(() => {
                                                            const roleMap: Record<number, string> = {
                                                                0: 'Farmer',
                                                                1: 'Aggregator',
                                                                2: 'Processor',
                                                                3: 'Retailer',
                                                                4: 'Regulator',
                                                            };
                                                            return roleMap[parsedEventData.role] || 'Unknown Role';
                                                        })()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {parsedEventData && Object.keys(parsedEventData).length === 0 && (
                                    <p className="text-gray-500 italic">No additional data recorded for this event.</p>
                                )}

                                {parsedEventData && Object.keys(parsedEventData).length === 0 && (
                                    <p className="text-gray-500 italic">No additional data recorded for this event.</p>
                                )}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Blockchain Verification */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Blockchain Verification</h3>
                <div className="space-y-2 text-blue-800 text-sm">
                    <p><strong>Immutable Record:</strong> All events are permanently recorded on the Polygon blockchain</p>
                    <p><strong>Transparent History:</strong> Anyone can verify this batch's complete journey</p>
                    <p><strong>Secure & Tamper-proof:</strong> Data cannot be altered or deleted once recorded</p>
                    <p><strong>Contract Address:</strong> <span className="font-mono text-xs ml-2">{import.meta.env.VITE_CONTRACT_ADDRESS}</span></p>
                </div>
            </div>
        </div>
    );
};

export default BatchView;