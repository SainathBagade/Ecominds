import React, { useContext } from 'react';
import { useAuth } from '@hooks/useAuth';
import { MissionContext } from '@context/MissionContext';
import { ProgressContext } from '@context/ProgressContext';
import api from '@services/api';
import { Flame, Trophy, Star, BookOpen, Target, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CompetitionList from '../Compititions/CompetitionList';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const StudentDashboard = () => {
    const { user } = useAuth();
    const { missions, loading: missionsLoading } = useContext(MissionContext);
    const { progress } = useContext(ProgressContext);
    const [userStats, setUserStats] = React.useState(null);
    const [leaderboard, setLeaderboard] = React.useState([]);
    const [userRank, setUserRank] = React.useState(null);
    const [competitions, setCompetitions] = React.useState([]);
    const [learningProgress, setLearningProgress] = React.useState(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, leaderboardRes] = await Promise.all([
                    api.get('/progress/stats'),
                    api.get('/leaderboard', {
                        params: {
                            grade: user?.grade,
                            type: 'weekly',
                            limit: 3
                        }
                    })
                ]);

                setUserStats(statsRes.data.data);
                setLeaderboard(leaderboardRes.data.data?.rankings || []);
                setUserRank(leaderboardRes.data.data?.userRank);

                try {
                    const [upcomingRes, ongoingRes] = await Promise.all([
                        api.get('/competitions', { params: { status: 'upcoming' } }),
                        api.get('/competitions', { params: { status: 'ongoing' } })
                    ]);
                    const allCompetitions = [
                        ...(ongoingRes.data.data || []),
                        ...(upcomingRes.data.data || [])
                    ];
                    setCompetitions(allCompetitions.slice(0, 2));
                } catch (e) {
                    console.error("Failed to load competitions", e);
                }

                // Fetch learning progress
                try {
                    const progressRes = await api.get('/educational-content/progress');
                    setLearningProgress(progressRes.data.data);
                } catch (e) {
                    console.error("Failed to load learning progress", e);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        if (user?._id) {
            fetchDashboardData();
        }
    }, [user?._id, user?.grade, progress]);

    // Dynamic stats
    const stats = {
        points: userStats?.userProgress?.totalXP || user?.points || 0,
        streak: userStats?.streak?.current || user?.streak || 0,
        badges: userStats?.userProgress?.achievements?.length || user?.badges?.length || 0,
        completedLessons: `${userStats?.userProgress?.stats?.topicsCompleted || 0} / 12`,
        pendingMissions: missions?.filter(m => m.status === 'active').length || 0
    };

    // Get a featured mission for the banner
    const featuredMission = missions?.find(m => m.status === 'active') || missions?.[0];

    const handleJoinCompetition = async (competitionId) => {
        try {
            await api.post(`/competitions/${competitionId}/register`, {});
            toast.success('Successfully joined competition!');
            // Refresh to update UI (e.g. show joined status if we tracked it)
            navigate(`/competitions/${competitionId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join competition');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-600 mt-1">Ready to solve some eco-challenges today?</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Star}
                    label="EcoPoints"
                    value={stats.points}
                    color="bg-yellow-500"
                />
                <StatCard
                    icon={Flame}
                    label="Day Streak"
                    value={stats.streak}
                    color="bg-orange-500"
                />
                <StatCard
                    icon={Trophy}
                    label="Badges"
                    value={(user?.badges?.length || 0) + (user?.achievements?.length || 0)}
                    color="bg-purple-500"
                />
                <StatCard
                    icon={BookOpen}
                    label="Lessons Done"
                    value={stats.completedLessons}
                    color="bg-blue-500"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Main Actions) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Daily Mission */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <div className="flex items-center space-x-2 mb-4">
                                <Target className="w-6 h-6" />
                                <span className="font-semibold tracking-wider uppercase text-sm opacity-90">
                                    {featuredMission ? 'Current Mission' : 'Missions'}
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">
                                {featuredMission ? featuredMission.title : 'Ready for a new task?'}
                            </h2>
                            <p className="text-primary-100 mb-6 max-w-lg text-lg">
                                {featuredMission
                                    ? featuredMission.description || `Complete this ${featuredMission.type.replace('_', ' ')} task to boost your progress!`
                                    : 'Check out your mission board to start earning points and making an impact.'}
                            </p>
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/missions"
                                    className="inline-flex items-center bg-white text-primary-700 px-8 py-3 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-lg hover:-translate-y-1"
                                >
                                    {featuredMission ? 'Complete Mission' : 'View Missions'}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                                {featuredMission?.reward && (
                                    <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
                                        <div className="text-[10px] uppercase font-black opacity-60">Reward</div>
                                        <div className="font-bold text-lg">{featuredMission.reward.xp} XP</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Background Pattern */}
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12 rotate-12">
                            <LeafIcon size={240} />
                        </div>
                    </div>

                    {/* Continue Learning */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
                            <Link to="/learn" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {learningProgress && learningProgress.inProgressModules?.length > 0 ? (
                                learningProgress.inProgressModules.slice(0, 2).map((module) => (
                                    <div key={module._id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100" onClick={() => navigate(`/learn/${module._id}`)}>
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{module.title}</h4>
                                            <p className="text-sm text-gray-500">
                                                {module.completedLessons || 0} of {module.totalLessons || 0} lessons completed
                                            </p>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                                    style={{ width: `${module.progress || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">Resume</span>
                                    </div>
                                ))
                            ) : learningProgress && learningProgress.nextRecommendedModule ? (
                                <div className="flex items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-100 transition-colors cursor-pointer border border-green-100" onClick={() => navigate(`/learn/${learningProgress.nextRecommendedModule._id}`)}>
                                    <div className="p-3 bg-green-100 text-green-600 rounded-lg mr-4">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Recommended Next</div>
                                        <h4 className="font-bold text-gray-900">{learningProgress.nextRecommendedModule.title}</h4>
                                        <p className="text-sm text-gray-500">{learningProgress.nextRecommendedModule.description}</p>
                                    </div>
                                    <span className="text-green-600 hover:text-green-700 font-medium text-sm">Start</span>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No modules in progress</p>
                                    <Link to="/learn" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                                        Start Learning →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Competitions Preview */}
                    {competitions.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Active Competitions</h2>
                                <Link to="/competitions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
                            </div>
                            <CompetitionList
                                competitions={competitions}
                                onJoin={handleJoinCompetition}
                            />
                        </div>
                    )}

                </div>

                {/* Right Column (Leaderboard Preview) */}
                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
                            <Link to="/leaderboard" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {leaderboard.length > 0 ? (
                                leaderboard.map((entry, idx) => (
                                    <div key={entry._id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                                            ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                                                    entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-blue-50 text-blue-700'}`}>
                                            {entry.rank}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {entry.user?.name}
                                                {entry.user?._id === user?._id && <span className="ml-2 text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full uppercase">You</span>}
                                            </p>
                                            <p className="text-xs text-gray-500">{entry.score} XP • Grade {entry.grade}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-400 text-sm">No rankings yet this week</div>
                            )}

                            {userRank && userRank.rank > 3 && (
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex items-center space-x-3 p-2 bg-primary-50 rounded-lg border border-primary-100">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-600 text-white font-bold text-sm">
                                            {userRank.rank}
                                        </div>
                                        <div className="flex-1 font-bold text-primary-700 text-sm">You</div>
                                        <div className="text-right pr-2">
                                            <span className="font-bold text-primary-700">{userRank.score} XP</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Achievements */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">🏆 Recent Achievements</h2>
                            <Link to="/profile" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {(user?.badges?.length > 0 || user?.achievements?.length > 0) ? (
                                [...(user?.badges || []), ...(user?.achievements || [])]
                                    .slice(-3)
                                    .reverse()
                                    .map((achievement, idx) => (
                                        <div key={idx} className="flex items-center p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                                            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full text-2xl mr-3 shadow-lg">
                                                {achievement.icon || achievement.badge || '🏅'}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-sm">
                                                    {achievement.name || achievement.title || 'Achievement Unlocked'}
                                                </h4>
                                                <p className="text-xs text-gray-600">
                                                    {achievement.description || achievement.criteria || 'Keep up the great work!'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Trophy className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium mb-2">No achievements yet</p>
                                    <p className="text-sm text-gray-400">Complete missions and quizzes to earn badges!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

// Helper for background pattern
const LeafIcon = ({ size = 24, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M2.00018 21.9998L2.56084 19.1973C2.88796 17.5619 3.51475 16.0305 4.39893 14.6738C5.07172 13.6397 5.92211 12.7214 6.90807 11.9619L8.43579 10.7853C8.42838 10.7226 8.36979 10.2281 8.36979 10.2281C8.24354 9.16631 8.35645 8.08976 8.69466 7.07817L9.82424 3.68943L12.6715 4.63852L11.5419 8.02726C11.3728 8.5332 11.3168 9.07137 11.3794 9.60265L11.4746 10.4026L18.4239 8.08616L19.373 10.9335L19.349 10.9415C20.9167 10.4189 22.0001 8.9419 22.0001 7.28859V5.99976H20.0001V7.28859C20.0001 8.01959 19.5397 8.64756 18.8954 8.86237L10.5186 11.6546C10.7424 11.7589 10.9577 11.881 11.1611 12.0198L12.5645 12.9774C13.2039 12.4849 13.7846 11.9163 14.2889 11.2858L10.0001 6.99976L11.4143 5.58555L15.8647 10.0359C17.3888 8.51187 18.1509 6.37687 18.1509 4.22151V2.99976H16.1509V4.22151C16.1509 5.86872 15.5683 7.45607 14.4173 8.60742L14.7356 8.92576L16.1498 7.51155L17.5641 8.92576L13.7554 12.7344C13.9015 12.9157 14.0371 13.1042 14.1612 13.2996L14.4754 13.7941C15.6565 15.6521 15.8585 17.9657 15.0135 19.9998H11.535C12.1841 18.5205 12.0406 16.7849 11.1542 15.3912L10.0245 13.6136C9.28187 12.4442 8.35821 11.4053 7.28834 10.5178L6.29524 11.2828C5.55577 11.8524 4.91798 12.5411 4.41338 13.3168C3.75025 14.3364 3.28016 15.485 3.03482 16.7115L2.56084 19.0815L11.0001 18.9998V20.9998H2.00018Z" />
    </svg>
)

export default StudentDashboard;
