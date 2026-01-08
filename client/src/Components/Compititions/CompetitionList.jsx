import { Trophy, Calendar, Users, Clock, Award, Target, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@utils/constants';
import { useAuth } from '@hooks/useAuth';

const CompetitionCard = ({ competition, onJoin }) => {
  const { user } = useAuth();
  const statusConfig = {
    registrationTask: {
      label: 'Registration Open',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500'
    },
    in_progress: {
      label: 'Live Now',
      color: 'bg-green-100 text-green-700 border-green-200',
      dotColor: 'bg-green-500'
    },
    completed: {
      label: 'Completed',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      dotColor: 'bg-gray-500'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-700 border-red-200',
      dotColor: 'bg-red-500'
    }
  };

  // Status check for registration/in_progress labels
  const status = statusConfig[competition.status] || statusConfig.registrationTask;

  // Check if current user has already completed the test
  const currentUserId = (user?._id || user?.id)?.toString();
  const participant = competition.participants?.find(p => {
    const pUserId = (p.user?._id || p.user || p)?.toString();
    return pUserId === currentUserId;
  });
  const hasCompleted = participant?.completed || false;

  // Check if registration is currently open
  const now = new Date();
  const regStart = new Date(competition.registrationStart);
  const regEnd = new Date(competition.registrationEnd);
  regEnd.setHours(23, 59, 59, 999);

  const isRegistrationOpen = now >= regStart && now <= regEnd;
  const registrationNotStarted = now < regStart;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group">
      {/* Header Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={competition.image ? (competition.image.startsWith('http') ? competition.image : `${API_BASE_URL.replace('/api', '')}/${competition.image}`) : (competition.thumbnail || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800")}
          alt={competition.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full border backdrop-blur-md ${status.color} flex items-center gap-2 shadow-sm`}>
          <div className={`w-2 h-2 rounded-full ${status.dotColor} ${competition.status === 'in_progress' ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-wider">{status.label}</span>
        </div>

        {/* Category */}
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">
            {competition.type || 'Tournament'}
          </span>
        </div>

        {/* Points Overlay */}
        <div className="absolute bottom-4 right-4 bg-yellow-400 text-yellow-950 px-3 py-1 rounded-lg font-black text-sm shadow-lg flex items-center gap-1">
          <Trophy size={14} />
          {competition.prizes?.first?.xp || 0} XP
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {competition.title}
        </h3>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
          {competition.description}
        </p>

      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-gray-50 text-xs px-6">
        <div className="space-y-1">
          <div className="text-gray-400 font-bold uppercase tracking-wider">Registration</div>
          <div className="font-bold text-gray-700">
            {new Date(competition.registrationStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' - '}
            {new Date(competition.registrationEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-400 font-bold uppercase tracking-wider">Event Date</div>
          <div className="font-bold text-primary-600">
            {new Date(competition.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto p-6 pt-0">
        {competition.status === 'registration' ? (
          registrationNotStarted ? (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-black text-sm uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
            >
              Registration Opens {new Date(competition.registrationStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </button>
          ) : !isRegistrationOpen ? (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-black text-sm uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2"
            >
              Registration Closed
            </button>
          ) : (
            <button
              onClick={() => onJoin && onJoin(competition._id)}
              className="w-full bg-primary-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center justify-center gap-2"
            >
              Join Competition
              <ChevronRight size={18} />
            </button>
          )
        ) : competition.status === 'in_progress' ? (
          hasCompleted ? (
            <button
              disabled
              className="w-full bg-gray-100 text-green-600 py-4 rounded-xl font-black text-sm uppercase tracking-widest cursor-default flex items-center justify-center gap-2 border-2 border-green-100 italic"
            >
              Battle Completed
              <CheckCircle2 size={18} />
            </button>
          ) : (
            <Link
              to={`/competitions/${competition._id}`}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
            >
              Enter Battle
              <Target size={18} />
            </Link>
          )
        ) : (
          <Link
            to={`/competitions/${competition._id}`}
            className="w-full bg-gray-100 text-gray-400 py-4 rounded-xl font-black text-sm uppercase tracking-widest cursor-default flex items-center justify-center gap-2"
          >
            View Results
            <Award size={18} />
          </Link>
        )}
      </div>
    </div>
  );
};

const CompetitionList = ({ competitions = [], onJoin }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {competitions.map((competition) => (
        <CompetitionCard
          key={competition._id}
          competition={competition}
          onJoin={onJoin}
        />
      ))}
    </div>
  );
};

export default CompetitionList;