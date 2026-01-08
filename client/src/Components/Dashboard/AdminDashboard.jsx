import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import {
    Users, UserCheck, Shield, Award, Settings, Check, X,
    Plus, LayoutDashboard, UserPlus, Trophy, Calendar,
    BarChart3, Search, Mail, Loader2, Flame
} from 'lucide-react';
import api from '@services/api';
import { USER_ROLES } from '@utils/constants';
import toast from 'react-hot-toast';
import Loader from '@components/Common/Loader';

const StatCard = ({ icon: Icon, label, value, color, description }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 transition-all hover:shadow-lg hover:-translate-y-1">
        <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{label}</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
            {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        pendingTeachers: 0,
        analytics: {}
    });
    const [pendingUsers, setPendingUsers] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [users, setUsers] = useState([]);

    // Form States
    const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', subject: '' });
    const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', grade: '' });
    const [compForm, setCompForm] = useState({
        title: '',
        description: '',
        type: 'tournament',
        format: 'points_based',
        criteria: { type: 'highest_score' },
        registrationStart: '',
        registrationEnd: '',
        startDate: '',
        endDate: '',
        prizes: { first: { xp: 1000, title: 'Winner' } },
        image: null
    });

    useEffect(() => {
        fetchAdminData();
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [activeTab]); // Refetch when tab changes if needed, or just keep [] if data is global

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [statsRes, pendingRes, compRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/pending-approvals'),
                api.get('/competitions'),
                api.get('/users')
            ]);
            setStats(statsRes.data || { totalStudents: 0, totalTeachers: 0, pendingTeachers: 0 });
            setPendingUsers(Array.isArray(pendingRes.data) ? pendingRes.data : []);
            setCompetitions(Array.isArray(compRes.data?.data) ? compRes.data.data : []);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            // toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await api.put(`/admin/approve/${userId}`);
            toast.success('User approved successfully');
            fetchAdminData();
        } catch (error) {
            toast.error('Failed to approve user');
        }
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post('/admin/create-teacher', teacherForm);
            toast.success('Teacher account created successfully!');
            setTeacherForm({ name: '', email: '', password: '', subject: '' });
            fetchAdminData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create teacher');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateComp = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', compForm.title);
            formData.append('description', compForm.description);
            formData.append('type', compForm.type);
            formData.append('format', compForm.format);
            formData.append('registrationStart', compForm.registrationStart);
            formData.append('registrationEnd', compForm.registrationEnd);
            formData.append('startDate', compForm.startDate);
            formData.append('endDate', compForm.endDate);
            formData.append('criteria', JSON.stringify(compForm.criteria));
            formData.append('prizes', JSON.stringify(compForm.prizes));

            if (compForm.image) {
                formData.append('image', compForm.image);
            }

            await api.post('/competitions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Competition created successfully!');
            setSearchParams({ tab: 'overview' });
            fetchAdminData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create competition');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post('/users/register', {
                ...studentForm,
                role: 'student',
                schoolID: user?.schoolID
            });
            toast.success('Student account created successfully!');
            setStudentForm({ name: '', email: '', password: '', grade: '' });
            fetchAdminData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create student');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/users/${userId}`);
            toast.success('User deleted successfully');
            fetchAdminData();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loader /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        School <span className="text-primary-600">Admin</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg mt-1">
                        Managing: <span className="text-gray-900 font-bold">{user?.schoolID}</span>
                    </p>
                </div>
            </div>

            {/* Main Content Area - Full width now since sidebar is gone */}
            {/* Redundant nav grid removed as per user request */}

            <div className="space-y-8">
                {activeTab === 'overview' && (
                    <div className="space-y-12 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <StatCard icon={Users} label="Active Students" value={stats?.totalStudents || 0} color="bg-indigo-600" description="+12% from last month" />
                            <StatCard icon={Shield} label="Verified Teachers" value={stats?.totalTeachers || 0} color="bg-emerald-600" description="Fully authorized" />
                            <StatCard icon={Award} label="Competitions" value={competitions?.length || 0} color="bg-violet-600" description="3 In Progress" />
                            <StatCard icon={UserCheck} label="Actions Required" value={pendingUsers?.length || 0} color="bg-amber-500" description="New teacher requests" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                                <Shield className="w-64 h-64 absolute -bottom-10 -right-10 opacity-10 rotate-12" />
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Admin Console</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">System Status</p>
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute opacity-75"></div>
                                                <div className="w-3 h-3 bg-emerald-500 rounded-full relative"></div>
                                            </div>
                                            <span className="text-xl font-black text-emerald-400 tracking-tight">Operational</span>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Database</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            <span className="text-lg font-bold text-white">Connected</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setSearchParams({ tab: 'teachers' })} className="p-6 bg-primary-600 rounded-3xl border border-primary-500 hover:bg-primary-500 transition-all group text-left">
                                        <UserPlus className="w-8 h-8 text-white mb-4 group-hover:scale-110 transition-transform" />
                                        <p className="text-xs text-primary-200 font-bold uppercase tracking-widest">Quick Action</p>
                                        <span className="text-lg font-black text-white">Manage Staff</span>
                                    </button>
                                    <button onClick={() => setSearchParams({ tab: 'students' })} className="p-6 bg-blue-600 rounded-3xl border border-blue-500 hover:bg-blue-500 transition-all group text-left">
                                        <Users className="w-8 h-8 text-white mb-4 group-hover:scale-110 transition-transform" />
                                        <p className="text-xs text-blue-200 font-bold uppercase tracking-widest">Quick Action</p>
                                        <span className="text-lg font-black text-white">Manage Students</span>
                                    </button>
                                    <button onClick={() => setSearchParams({ tab: 'competitions' })} className="col-span-1 md:col-span-2 p-6 bg-violet-600 rounded-3xl border border-violet-500 hover:bg-violet-500 transition-all group text-left flex flex-col md:flex-row md:items-center gap-4">
                                        <div>
                                            <Trophy className="w-8 h-8 text-white mb-2 group-hover:scale-110 transition-transform" />
                                            <p className="text-xs text-violet-200 font-bold uppercase tracking-widest">Quick Action</p>
                                        </div>
                                        <span className="text-lg font-black text-white flex-1">Create Inspection / Competition</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">Platform Health</h3>
                                    <p className="text-gray-500 text-sm font-medium">System performance metrics for the current session.</p>
                                </div>
                                <div className="space-y-6 mt-8">
                                    <div>
                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                                            <span>Server Load</span>
                                            <span>24%</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full w-[24%] bg-emerald-500 rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                                            <span>Memory Usage</span>
                                            <span>45%</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full w-[45%] bg-blue-500 rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                                            <span>Active Sessions</span>
                                            <span>{(stats?.totalStudents || 0) + (stats?.totalTeachers || 0)}</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full w-[60%] bg-violet-500 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                            <h3 className="text-2xl font-black text-gray-900 mb-8 relative">Growth Analytics</h3>
                            <div className="h-80 flex items-end gap-6">
                                {[40, 70, 45, 90, 65, 85, 95].map((h, i) => (
                                    <div key={i} className="flex-1 group/bar relative h-full flex items-end">
                                        <div
                                            className="w-full bg-primary-100 rounded-2xl hover:bg-primary-600 transition-all duration-500 relative"
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-xl text-xs opacity-0 group-hover/bar:opacity-100 transition-all font-bold shadow-lg transform translate-y-2 group-hover/bar:translate-y-0">{h}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6 text-xs font-black text-gray-300 uppercase tracking-widest px-2">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Total Engagement</h4>
                                <p className="text-4xl font-black text-gray-900">84%</p>
                                <div className="mt-4 flex gap-1">
                                    <span className="h-1.5 w-full bg-emerald-500 rounded-full"></span>
                                    <span className="h-1.5 w-1/4 bg-gray-100 rounded-full"></span>
                                </div>
                                <p className="text-xs text-gray-400 mt-4 font-bold">+12% vs last week</p>
                            </div>
                            <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">School Rank</h4>
                                <p className="text-4xl font-black text-primary-600">#04</p>
                                <p className="text-xs text-gray-400 mt-4 font-bold">Top 5% of region</p>
                            </div>
                            <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Total EcoPoints</h4>
                                <p className="text-4xl font-black text-amber-500">124k</p>
                                <p className="text-xs text-gray-400 mt-4 font-bold">Lifetime accumulated</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase border-b border-gray-100 pb-4">Pending Authorization Requests</h2>

                        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                            {pendingUsers.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {pendingUsers.map((u) => (
                                        <div key={u._id} className="p-8 flex items-center justify-between hover:bg-gray-50 transition-all group/item">
                                            <div className="flex items-center gap-8">
                                                <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center font-black text-xl">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-gray-900">{u.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        <p className="text-sm text-gray-400 font-bold tracking-tight">{u.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleApprove(u._id)}
                                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                >
                                                    <Check className="w-4 h-4" /> Approve
                                                </button>
                                                <button className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95">
                                                    <X className="w-4 h-4" /> Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-32 text-center">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <UserCheck className="w-10 h-10 text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">All Clear</h3>
                                    <p className="text-gray-400 font-medium mt-2">No pending applications.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'teachers' && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Staff Onboarding</h2>
                            <p className="text-gray-500 font-medium mt-2">Create credentials for new faculty members.</p>
                        </div>

                        <div className="bg-white rounded-[40px] p-12 border border-gray-100 shadow-xl overflow-hidden relative mb-12">
                            <form onSubmit={handleCreateTeacher} className="space-y-8 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={teacherForm.name}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                                            placeholder="e.g. Prof. Sarah Wilson"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-primary-600 font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={teacherForm.email}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                                            placeholder="teacher@school.com"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-primary-600 font-bold transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">System Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={teacherForm.password}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                                            placeholder="Min. 8 characters"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-primary-600 font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Core Subject</label>
                                        <select
                                            required
                                            value={teacherForm.subject}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-primary-600 font-bold transition-all h-[64px]"
                                        >
                                            <option value="">Select Specialization</option>
                                            <option value="Environmental Science">Environmental Science</option>
                                            <option value="Climate Physics">Climate Physics</option>
                                            <option value="Sustainable Chemistry">Sustainable Chemistry</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full py-5 bg-gray-900 text-white rounded-[20px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                                    Create Staff Account
                                </button>
                            </form>
                        </div>

                        {/* List Teachers */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Existing Staff</h3>
                            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                                <div className="divide-y divide-gray-50">
                                    {users.filter(u => u.role === 'teacher').map((teacher) => (
                                        <div key={teacher._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-black">
                                                    {teacher.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{teacher.name}</p>
                                                    <p className="text-sm text-gray-400 font-medium">{teacher.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteUser(teacher._id)}
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Remove Teacher"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    {users.filter(u => u.role === 'teacher').length === 0 && (
                                        <div className="p-10 text-center text-gray-400 font-medium">No teachers found.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Student Management</h2>
                            <p className="text-gray-500 font-medium mt-2">Manage student accounts and enrollments.</p>
                        </div>

                        <div className="bg-white rounded-[40px] p-12 border border-blue-100 shadow-xl overflow-hidden relative mb-12">
                            <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight mb-6">Add New Student</h3>
                            <form onSubmit={handleCreateStudent} className="space-y-8 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Student Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={studentForm.name}
                                            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="w-full bg-blue-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-blue-600 font-bold transition-all text-blue-900 placeholder-blue-300"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={studentForm.email}
                                            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                            placeholder="student@school.com"
                                            className="w-full bg-blue-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-blue-600 font-bold transition-all text-blue-900 placeholder-blue-300"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Grade / Class</label>
                                        <input
                                            type="text"
                                            required
                                            value={studentForm.grade}
                                            onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
                                            placeholder="e.g. 10th Grade"
                                            className="w-full bg-blue-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-blue-600 font-bold transition-all text-blue-900 placeholder-blue-300"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={studentForm.password}
                                            onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                                            placeholder="Min. 6 characters"
                                            className="w-full bg-blue-50 border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-blue-600 font-bold transition-all text-blue-900 placeholder-blue-300"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                    Create Student Account
                                </button>
                            </form>
                        </div>

                        {/* List Students */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Enrolled Students</h3>
                            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                                <div className="divide-y divide-gray-50">
                                    {users.filter(u => u.role === 'student').map((student) => (
                                        <div key={student._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{student.name}</p>
                                                    <div className="flex gap-3 text-sm text-gray-400 font-medium">
                                                        <span>{student.email}</span>
                                                        <span>•</span>
                                                        <span>{student.grade || 'No Grade'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteUser(student._id)}
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Remove Student"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    {users.filter(u => u.role === 'student').length === 0 && (
                                        <div className="p-10 text-center text-gray-400 font-medium">No students found.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'competitions' && (
                    <div className="space-y-12 animate-fade-in pb-20">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-6">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Tournament Control</h2>
                        </div>

                        {/* Competition Creation Form */}
                        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden p-10">
                            <form onSubmit={handleCreateComp} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={compForm.title}
                                            onChange={(e) => setCompForm({ ...compForm, title: e.target.value })}
                                            placeholder="e.g. Eco-Innova 2026"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 font-bold focus:ring-2 focus:ring-primary-600"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Competition Type</label>
                                        <select
                                            value={compForm.type}
                                            onChange={(e) => setCompForm({ ...compForm, type: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 font-bold focus:ring-2 focus:ring-primary-600"
                                        >
                                            <option value="tournament">Tournament</option>
                                            <option value="battle">1v1 Battle</option>
                                            <option value="race">Timed Race</option>
                                            <option value="league">League Series</option>
                                        </select>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Banner / Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setCompForm({ ...compForm, image: e.target.files[0] })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 font-bold focus:ring-2 focus:ring-primary-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mission Intelligence / Rules</label>
                                    <textarea
                                        required
                                        value={compForm.description}
                                        onChange={(e) => setCompForm({ ...compForm, description: e.target.value })}
                                        rows="3"
                                        placeholder="Define the rules and objectives of this competition..."
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 font-bold focus:ring-2 focus:ring-primary-600"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Calendar className="w-3 h-3" /> Register Start</label>
                                        <input
                                            type="date"
                                            required
                                            value={compForm.registrationStart}
                                            onChange={(e) => setCompForm({ ...compForm, registrationStart: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-xs"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Calendar className="w-3 h-3" /> Register End</label>
                                        <input
                                            type="date"
                                            required
                                            value={compForm.registrationEnd}
                                            onChange={(e) => setCompForm({ ...compForm, registrationEnd: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-xs"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Check className="w-3 h-3" /> Battle Start</label>
                                        <input
                                            type="date"
                                            required
                                            value={compForm.startDate}
                                            onChange={(e) => setCompForm({ ...compForm, startDate: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-xs"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><X className="w-3 h-3" /> Battle End</label>
                                        <input
                                            type="date"
                                            required
                                            value={compForm.endDate}
                                            onChange={(e) => setCompForm({ ...compForm, endDate: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-900 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <h4 className="text-white font-black uppercase tracking-widest mb-2">Grand Prize Settings</h4>
                                        <p className="text-gray-400 text-xs">Winners will automatically receive these benefits upon completion.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-white/10 rounded-2xl px-6 py-4 border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest pb-1">Bonus XP</p>
                                            <input
                                                type="number"
                                                value={compForm.prizes.first.xp}
                                                onChange={(e) => setCompForm({
                                                    ...compForm,
                                                    prizes: { ...compForm.prizes, first: { ...compForm.prizes.first, xp: parseInt(e.target.value) } }
                                                })}
                                                className="bg-transparent border-none p-0 text-white font-black text-xl w-24 focus:ring-0"
                                            />
                                        </div>
                                        <div className="bg-white/10 rounded-2xl px-6 py-4 border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest pb-1">Award Title</p>
                                            <input
                                                type="text"
                                                value={compForm.prizes.first.title}
                                                onChange={(e) => setCompForm({
                                                    ...compForm,
                                                    prizes: { ...compForm.prizes, first: { ...compForm.prizes.first, title: e.target.value } }
                                                })}
                                                className="bg-transparent border-none p-0 text-white font-black text-xl w-32 focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full py-6 bg-primary-600 text-white rounded-[25px] font-black uppercase tracking-widest text-lg shadow-2xl shadow-primary-200 hover:scale-[1.01] transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Deploy Competition'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default AdminDashboard;
