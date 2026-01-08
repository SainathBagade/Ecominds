import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@components/Common/Loader';
import { BookOpen, Brain, ChevronRight, PlayCircle, Lock, Trophy, Target, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@services/api';
import { useAuth } from '@hooks/useAuth';

const Quizzes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({ totalPassed: 0, totalAttempted: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState(null);

  useEffect(() => {
    if (user?.grade) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const gradeId = typeof user.grade === 'object' ? user.grade._id : user.grade;

      // Parallel fetch for hierarchy and stats
      const [hierarchyRes, statsRes] = await Promise.all([
        api.get('/quizzes/hierarchy', { params: { gradeId } }),
        api.get('/quizzes/stats')
      ]);

      const hierarchyData = hierarchyRes.data || [];
      setSubjects(hierarchyData);
      setStats(statsRes.data || { totalPassed: 0, totalAttempted: 0 });

      if (hierarchyData.length > 0) {
        setActiveSubject(hierarchyData[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load quizzes');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  if (!user?.grade) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <Brain className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Grade Required</h2>
          <p className="text-gray-600">Please update your profile with your current grade to view relevant quizzes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header & Stats Banner */}
        <div className="mb-10 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                Neural Assessments
              </h1>
              <p className="text-gray-500 font-medium text-lg">
                Curriculum: <span className="text-primary-600 font-black">{typeof user?.grade === 'object' ? user.grade.name : `Grade ${user?.grade}`}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-white p-6 border-l-4 border-yellow-500 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Trophy size={28} />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-black uppercase tracking-widest">Quizzes Done</div>
                <div className="text-3xl font-black text-gray-900">{stats.totalPassed}</div>
              </div>
            </div>

            <div className="card bg-white p-6 border-l-4 border-primary-500 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Target size={28} />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-black uppercase tracking-widest">Total Attempts</div>
                <div className="text-3xl font-black text-gray-900">{stats.totalAttempted}</div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white border-none shadow-lg flex items-center gap-5 group cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Star size={28} className="text-white fill-white" />
              </div>
              <div>
                <div className="text-xs text-primary-100 font-black uppercase tracking-widest">Current Rank</div>
                <div className="text-3xl font-black">Eco Cadet</div>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Tabs */}
        {subjects.length > 0 ? (
          <div className="mb-8 overflow-x-auto no-scrollbar">
            <div className="flex space-x-3 border-b border-gray-100 pb-1">
              {subjects.map((subject) => (
                <button
                  key={subject._id}
                  onClick={() => setActiveSubject(subject._id)}
                  className={`
                    px-8 py-4 rounded-t-2xl font-black text-sm transition-all whitespace-nowrap uppercase tracking-widest
                    ${activeSubject === subject._id
                      ? 'bg-white text-primary-600 border-b-4 border-primary-600 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{subject.icon || '📚'}</span>
                    {subject.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <BookOpen className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900">Curriculum Pending</h3>
            <p className="text-gray-400 font-medium max-w-xs mx-auto mt-2">Our neural networks are still indexing your educational content. Check back in a bit!</p>
          </div>
        )}

        {/* Modules & Quizzes Content */}
        {subjects
          .filter(s => s._id === activeSubject)
          .map(subject => (
            <div key={subject._id} className="space-y-8 animate-fade-in">
              {subject.modules && subject.modules.length > 0 ? (
                subject.modules.map((module) => (
                  <div key={module._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:border-primary-100 transition-colors">
                    {/* Module Header */}
                    <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm text-primary-600 flex items-center justify-center text-lg font-black border border-gray-100">
                          {module.order || '•'}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                            {module.title}
                          </h3>
                          <p className="text-sm text-gray-400 font-medium mt-1">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black px-3 py-1 bg-primary-50 text-primary-600 rounded-full border border-primary-100 uppercase tracking-[0.2em]">
                          {module.difficulty || 'CORE'}
                        </span>
                      </div>
                    </div>

                    {/* Lessons & Quizzes List */}
                    <div className="divide-y divide-gray-50 px-4">
                      {module.lessons && module.lessons.length > 0 ? (
                        module.lessons.map(lesson => {
                          const hasQuizzes = lesson.quizzes && lesson.quizzes.length > 0;
                          if (!hasQuizzes) return null;

                          return (
                            <div key={lesson._id} className="p-6 transition-all rounded-2xl hover:bg-gray-50/80 m-2 border border-transparent hover:border-gray-100">
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-start gap-5">
                                  <div className="mt-1 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                                    <PlayCircle className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-black text-gray-800 leading-tight">
                                      {lesson.title}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-2">
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lesson.quizzes.length} Knowledge Check Available</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                  {lesson.quizzes.map(quiz => (
                                    <button
                                      key={quiz._id}
                                      onClick={() => handleStartQuiz(quiz._id)}
                                      className="group/btn flex items-center gap-3 px-6 py-3 bg-white text-gray-700 rounded-2xl hover:bg-primary-600 hover:text-white transition-all shadow-sm border border-gray-100 hover:border-primary-600 font-black text-sm uppercase tracking-tighter"
                                    >
                                      <Brain className="w-5 h-5 text-primary-500 group-hover/btn:text-white transition-colors" />
                                      <span>{quiz.title}</span>
                                      <ChevronRight className="w-5 h-5 opacity-30 group-hover/btn:opacity-100 transition-all group-hover/btn:translate-x-1" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-12 text-center text-gray-400 font-medium">
                          No assessment data found for this module.
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400 font-medium">No modules found for this stream.</p>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Quizzes;
