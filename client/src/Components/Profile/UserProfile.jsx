import React from 'react';
import { Mail, Calendar, MapPin, Award } from 'lucide-react';

const UserProfile = ({ user }) => {
    if (!user) return null;

    return (
        <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900">Personal Details</h2>
                <button className="text-sm font-bold text-primary-600 hover:text-primary-700">Edit Profile</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            <Mail size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</div>
                            <div className="text-lg font-bold text-gray-900">{user.email}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Joined On</div>
                            <div className="text-lg font-bold text-gray-900">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">School / Location</div>
                            <div className="text-lg font-bold text-gray-900">{user.school || 'EcoMinds Primary'}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            <Award size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Top Subject</div>
                            <div className="text-lg font-bold text-gray-900">Sustainability 101</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                    <Award size={200} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black mb-2">Eco Ambassador Progress</h3>
                    <p className="text-white/80 mb-6 text-sm">
                        You are at level {Math.floor((user.points || 0) / 100) + 1}. Earn {100 - ((user.points || 0) % 100)} more XP to reach the next rank.
                    </p>
                    <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-2">
                        <div
                            className="bg-white h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(user.points || 0) % 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                        <span>{(user.points || 0) % 100}% to next level</span>
                        <span>{user.points || 0} Total XP</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
