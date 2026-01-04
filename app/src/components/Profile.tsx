// src/components/Profile.tsx
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Role } from '../types';

const Profile: React.FC = () => {
    const {
        userAddress,
        userProfile,
        // isRegistered,
        registerUser,
        loading,
        error
    } = useAppContext();

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        role: Role.Farmer
    });
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');

        try {
            await registerUser(formData.name, formData.location, formData.role);
            setSuccessMessage('Profile saved successfully! Complete blockchain registration to create batches.');
        } catch (err) {
            console.error('Registration failed:', err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'role' ? Number(value) : value
        }));
    };

    if (!userAddress) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🔒</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Connect Your Wallet
                </h1>
                <p className="text-lg text-gray-600">
                    Please connect your wallet to view and manage your profile.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {userProfile ? 'Your Profile' : 'Complete Registration'}
                </h1>
                <p className="text-gray-600">
                    {userProfile
                        ? 'Your profile information and role in the supply chain.'
                        : 'Register your profile to start using AgriTrace.'
                    }
                </p>
            </div>

            {/* Wallet Info Card */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Information</h3>
                <p className="text-gray-600 font-mono text-sm">
                    {userAddress}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userProfile
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                        }`}>
                        {userProfile ? 'Profile Registered' : 'Profile Not Registered'}
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            {/* Show Profile Info if registered */}
            {userProfile && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Name</label>
                            <p className="text-gray-900 font-medium">{userProfile.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Location</label>
                            <p className="text-gray-900 font-medium">{userProfile.location}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Role</label>
                            <p className="text-gray-900 font-medium">
                                {userProfile.role === Role.Farmer && 'Farmer'}
                                {userProfile.role === Role.Aggregator && 'Aggregator'}
                                {userProfile.role === Role.Processor && 'Processor'}
                                {userProfile.role === Role.Retailer && 'Retailer'}
                                {userProfile.role === Role.Regulator && 'Regulator'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Registered On</label>
                            <p className="text-gray-900 font-medium">
                                {userProfile.createdAt && (
                                    userProfile.createdAt instanceof Date
                                        ? userProfile.createdAt.toLocaleDateString()
                                        : new Date(userProfile.createdAt).toLocaleDateString()
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Registration Form (only show if not registered) */}
            {!userProfile && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            {/* Location Field */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter your location (e.g., Lagos, Nigeria)"
                                />
                            </div>

                            {/* Role Field */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Role
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value={Role.Farmer}>Farmer</option>
                                    <option value={Role.Aggregator}>Aggregator</option>
                                    <option value={Role.Processor}>Processor</option>
                                    <option value={Role.Retailer}>Retailer</option>
                                    <option value={Role.Regulator}>Regulator</option>
                                </select>
                                <p className="mt-1 text-sm text-gray-500">
                                    Choose your role in the agricultural supply chain
                                </p>
                            </div>
                        </div>

                        {/* Register Button */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Registering...</span>
                                    </>
                                ) : (
                                    <span>Complete Registration</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Role Information */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">About Roles</h3>
                <div className="space-y-2 text-blue-800 text-sm">
                    <p><strong>Farmer:</strong> Creates product batches and records harvest events</p>
                    <p><strong>Aggregator:</strong> Handles transportation and logistics between stakeholders</p>
                    <p><strong>Processor:</strong> Transforms and packages agricultural products</p>
                    <p><strong>Retailer:</strong> Sells products to end consumers</p>
                    <p><strong>Regulator:</strong> Verifies quality, safety, and compliance standards</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;