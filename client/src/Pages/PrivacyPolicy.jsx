import React from 'react';
import { Shield, Key, FileText, Lock } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="bg-primary-600 px-6 py-8 sm:px-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display font-bold text-white">Privacy Policy</h1>
                                <p className="text-primary-100 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-10 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-primary-500" />
                                1. Information We Collect
                            </h2>
                            <div className="prose text-gray-600 space-y-3">
                                <p>We collect information to provide better services to all our users:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><strong>Personal Information:</strong> Name, Email, School ID, and Grade Level.</li>
                                    <li><strong>Usage Data:</strong> Quiz scores, Mission progress, and EcoPoints earned.</li>
                                    <li><strong>Device Information:</strong> Browser type and IP address for security purposes.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Key className="w-5 h-5 text-primary-500" />
                                2. How We Use Information
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Your data is used to personalize your learning experience, track your progress on the leaderboard,
                                and verify your student status. We do NOT sell your data to third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Lock className="w-5 h-5 text-primary-500" />
                                3. Data Security
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We implement industry-standard security measures including encryption and secure servers
                                to protect your personal information from unauthorized access.
                            </p>
                        </section>

                        <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2">Contact Us</h3>
                            <p className="text-blue-800 text-sm">
                                If you have any questions about this Privacy Policy, please contact us at: <br />
                                <a href="mailto:support@ecominds.com" className="underline hover:text-blue-700">support@ecominds.com</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
