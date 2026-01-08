import React from 'react';
import { FileCheck, Users, AlertCircle, Ban } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="bg-gray-900 px-6 py-8 sm:px-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <FileCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display font-bold text-white">Terms of Service</h1>
                                <p className="text-gray-400 mt-1">Effective Date: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-10 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-gray-700" />
                                1. Acceptance of Terms
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                By accessing and using EcoMinds, you accept and agree to be bound by the terms and provision of this agreement.
                                In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <AlertCircle className="w-5 h-5 text-gray-700" />
                                2. User Conduct
                            </h2>
                            <div className="prose text-gray-600 space-y-3">
                                <p>You agree to use the site only for lawful purposes. You are prohibited from:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Posting content that is infringing, defamatory, obscene, or illegal.</li>
                                    <li>Attempting to interfere with the site's network or security features.</li>
                                    <li>Using the service to cheat on quizzes or competitions.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Ban className="w-5 h-5 text-gray-700" />
                                3. Termination
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may terminate or suspend access to our service immediately, without prior notice or liability,
                                for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                        </section>

                        <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-2">Disclaimer</h3>
                            <p className="text-gray-600 text-sm">
                                The materials on EcoMinds's website are provided on an 'as is' basis. EcoMinds makes no warranties,
                                expressed or implied, and hereby disclaims and negates all other warranties including, without limitation,
                                implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
