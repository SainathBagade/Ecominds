import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LessonList from '@components/Learn/LessonList';
import LearningProgress from '@components/Learn/LearningProgress';
import Loader from '@components/Common/Loader';
import { BookOpen, Filter, ArrowRight, Layout, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@services/api';
import { useAuth } from '@hooks/useAuth';
import { GRADE_LEVELS } from '@utils/constants';

const Learn = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    grade: searchParams.get('grade') || user?.grade || '',
    subject: searchParams.get('subject') || '',
    search: ''
  });

  useEffect(() => {
    if (user?.grade && !filters.grade) {
      setFilters(prev => ({ ...prev, grade: user.grade }));
    }
  }, [user, filters.grade]);

  const fetchSubjects = React.useCallback(async () => {
    try {
      const params = {};
      if (filters.grade) params.gradeLevel = filters.grade;
      const response = await api.get('/subjects', { params });
      setSubjects(Array.isArray(response.data) ? response.data : response.data.subjects || response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, [filters.grade]);

  const fetchLessons = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.grade) params.grade = filters.grade;
      if (filters.subject) params.subject = filters.subject;

      const response = await api.get('/lessons', { params });
      setLessons(Array.isArray(response.data) ? response.data : response.data.lessons || []);
    } catch (error) {
      toast.error('Failed to load lessons');
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.grade, filters.subject]);

  useEffect(() => {
    fetchSubjects();
    fetchLessons();
  }, [fetchSubjects, fetchLessons]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.grade) params.set('grade', newFilters.grade);
    if (newFilters.subject) params.set('subject', newFilters.subject);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ grade: user?.grade || '', subject: '', search: '' });
    if (!user?.grade) setSearchParams({});
    else setSearchParams({ grade: user.grade });
  };

  const filteredLessons = lessons.filter(lesson => {
    if (filters.search) {
      return lesson.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        lesson.description?.toLowerCase().includes(filters.search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Learn
              </h1>
              <p className="text-gray-600">
                {user?.grade ? `Standard ${user.grade} Curriculum` : 'Explore environmental education'}
              </p>
            </div>
          </div>

          <LearningProgress />
        </div>

        {/* Standard-specific Stats Banner */}
        {filters.grade && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="card bg-white p-6 border-b-4 border-primary-500 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                <Layout size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-black uppercase tracking-widest">Standard</div>
                <div className="text-xl font-black text-gray-900">Grade {filters.grade}</div>
              </div>
            </div>
            <div className="card bg-white p-6 border-b-4 border-blue-500 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-black uppercase tracking-widest">Curriculum</div>
                <div className="text-xl font-black text-gray-900">{subjects.length} Subjects</div>
              </div>
            </div>
            <div className="card bg-white p-6 border-b-4 border-purple-500 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                <Info size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-black uppercase tracking-widest">Modules</div>
                <div className="text-xl font-black text-gray-900">
                  {subjects.reduce((sum, s) => sum + (s.moduleCount || 0), 0)} Total
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Factual Data banner */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          <div className="lg:col-span-3 card bg-gradient-to-br from-indigo-600 via-purple-600 to-primary-600 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-widest mb-4">
                  Interactive Learning
                </div>
                <h2 className="text-3xl font-black mb-4 leading-tight">Animated Videos for Grade {filters.grade}</h2>
                <p className="text-purple-100 mb-6 text-lg leading-relaxed">
                  Complex topics simplified through fractal visualizations and real-world statistics.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                    <span className="text-2xl font-bold">420</span>
                    <span className="text-xs text-purple-200 leading-tight">PPM CO2<br />Highest level</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                    <span className="text-2xl font-bold">12m</span>
                    <span className="text-xs text-purple-200 leading-tight">Green Jobs<br />Projected</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-64 h-48 bg-black/30 rounded-2xl border-2 border-white/20 flex items-center justify-center overflow-hidden">
                <BookOpen size={48} className="opacity-50" />
              </div>
            </div>
          </div>

          <div className="card bg-white border border-gray-100 p-6 flex flex-col justify-between">
            <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-ping"></span>
              Eco-Fact
            </h3>
            <div className="flex-1 flex flex-col justify-center text-center">
              <div className="text-4xl font-black text-primary-600 mb-2">30%</div>
              <p className="text-gray-600 text-sm italic leading-relaxed">
                "Of all food produced globally is wasted, yet 800 million go hungry."
              </p>
            </div>
          </div>
        </div>

        {/* Filters/Navigation */}
        <div className="card mb-12 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-bold text-gray-900 lowercase tracking-tighter">Navigation</h3>
            </div>
            {filters.subject && (
              <button
                onClick={() => handleFilterChange('subject', '')}
                className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:underline"
              >
                Back to All Subjects
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Grade Filter - only show for non-students or if grade not set */}
            {(!user?.grade) && (
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Grade</label>
                <select
                  value={filters.grade}
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
                  className="input font-bold"
                >
                  <option value="">All Grades</option>
                  {GRADE_LEVELS.map((grade) => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={user?.grade ? 'md:col-span-2' : ''}>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="input font-bold"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Find a topic..."
                className="input"
              />
            </div>

            {!user?.grade && (
              <div className="flex items-end">
                <button onClick={clearFilters} className="w-full btn btn-secondary font-bold">Reset</button>
              </div>
            )}
          </div>
        </div>

        {/* Subject Explorer or Lessons */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : !filters.subject && subjects.length > 0 ? (
          <div className="mb-20 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                Subject Explorer
                <span className="text-sm font-normal text-gray-400">Select to start</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  onClick={() => handleFilterChange('subject', subject._id)}
                  className="card bg-white border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary-100 scale-95 group-hover:scale-100 transition-transform">
                      <BookOpen size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">{subject.name}</h3>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed line-clamp-3">{subject.description || 'Dive into key environmental principles and practical sustainable actions.'}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xl font-black text-blue-600 leading-none">{subject.moduleCount || 0}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Modules</div>
                        </div>
                      </div>
                      <span className="text-primary-600 font-bold text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                        Explore Subject <ArrowRight size={18} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {filters.subject && (
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {subjects.find(s => s._id === filters.subject)?.name} Lessons
                </h2>
                <span className="text-sm text-gray-400">{filteredLessons.length} Topics Available</span>
              </div>
            )}
            <LessonList lessons={filteredLessons} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;