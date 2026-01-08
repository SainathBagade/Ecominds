import React from 'react';
import ChallengeCard from './ChallengeCard';
import { Target } from 'lucide-react';

const ChallengePage = ({ challenges, onJoin, onSubmitProof }) => {
    if (!challenges || challenges.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">No challenges yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                    New challenges are added weekly. Check back soon for more ways to make an impact!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
                <ChallengeCard
                    key={challenge._id}
                    challenge={challenge}
                    onJoin={onJoin}
                    onSubmitProof={onSubmitProof}
                />
            ))}
        </div>
    );
};

export default ChallengePage;
