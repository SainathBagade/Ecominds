import React, { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Globe, Building, ShieldAlert, Plus, Check, X, Server, Activity } from 'lucide-react';
import api from '@services/api';
import toast from 'react-hot-toast';
import Loader from '@components/Common/Loader';

const SystemCard = ({ icon: Icon, label, value, status, onClick, active }) => (
    <button
        onClick={onClick}
        className={`w-full text-left bg-white p-6 rounded-3xl shadow-sm border transition-all hover:shadow-lg hover:-translate-y-1 ${active ? 'border-primary-600 ring-2 ring-primary-50' : 'border-gray-100'
            }`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${active ? 'bg-primary-600 text-white' : 'bg-gray-50 text-primary-600'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${status === 'Green' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                {status}
            </span>
        </div>
        <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
    </button>
);

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    console.log('Active Super Admin User:', user?.name);
    const [activeTab, setActiveTab] = useState('overview');
    const [schools, setSchools] = useState([]);
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [selectedSchoolForAdmin, setSelectedSchoolForAdmin] = useState(null);
    const [newSchool, setNewSchool] = useState({ name: '', schoolID: '', address: '', contactEmail: '' });
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        fetchSuperAdminData();
    }, []);

    const fetchSuperAdminData = async () => {
        setLoading(true);
        try {
            const [schoolsRes, adminsRes, analyticsRes] = await Promise.all([
                api.get('/superadmin/schools'),
                api.get('/superadmin/pending-admins'),
                api.get('/superadmin/analytics')
            ]);
            setSchools(schoolsRes.data);
            setPendingAdmins(adminsRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Error fetching super admin data:', error);
            toast.error('Failed to load platform data');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAdmin = async (adminId) => {
        try {
            await api.put(`/superadmin/approve-admin/${adminId}`);
            toast.success('Admin approved successfully');
            fetchSuperAdminData();
        } catch (error) {
            toast.error('Failed to approve admin');
        }
    };

    const handleAddSchool = async (e) => {
        e.preventDefault();
        try {
            await api.post('/superadmin/schools', newSchool);
            toast.success('School added successfully');
            setIsAddSchoolOpen(false);
            setNewSchool({ name: '', schoolID: '', address: '', contactEmail: '' });
            fetchSuperAdminData();
        } catch (error) {
            toast.error('Failed to add school');
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        if (!selectedSchoolForAdmin) return;
        try {
            await api.post('/superadmin/create-admin', {
                ...newAdmin,
                schoolID: selectedSchoolForAdmin.schoolID
            });
            toast.success(`Admin authorized for ${selectedSchoolForAdmin.name}`);
            setIsAddAdminOpen(false);
            setNewAdmin({ name: '', email: '', password: '' });
            setSelectedSchoolForAdmin(null);
            fetchSuperAdminData(); // Refresh counters immediately
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create admin');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Platform <span className="text-primary-600">Commander</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg mt-1">
                        Global Hub Control | System Uptime: <span className="text-emerald-500 font-bold">99.99%</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAddAdminOpen(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        <ShieldAlert className="w-5 h-5" />
                        Create Admin
                    </button>
                    <button
                        onClick={() => setIsAddSchoolOpen(true)}
                        className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Organization
                    </button>
                </div>
            </div>

            {/* System Status Grid (Now Clickable) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <SystemCard
                    icon={Activity}
                    label="Platform Overview"
                    value="Dashboard"
                    status="Green"
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                />
                <SystemCard
                    icon={Building}
                    label="School Network"
                    value={analytics?.totalSchools || 0}
                    status="Green"
                    active={activeTab === 'organizations'}
                    onClick={() => setActiveTab('organizations')}
                />
                <SystemCard
                    icon={ShieldAlert}
                    label="Admin Controls"
                    value={pendingAdmins.length}
                    status={pendingAdmins.length > 0 ? 'Amber' : 'Green'}
                    active={activeTab === 'approvals'}
                    onClick={() => setActiveTab('approvals')}
                />
                <SystemCard
                    icon={Globe}
                    label="Global Impact"
                    value={analytics?.totalUsers || 0}
                    status="Green"
                    active={activeTab === 'users'}
                    onClick={() => setActiveTab('users')}
                />
            </div>

            <div className="grid grid-cols-1 gap-8">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                        {/* Summary Section */}
                        <div className="bg-gradient-to-br from-primary-600 to-primary-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                            <Plus className="w-64 h-64 absolute -bottom-20 -right-20 opacity-10 rotate-12" />
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Command Center</h3>
                            <p className="text-primary-100 font-medium mb-8 pr-12">Monitor your global environmental educational network. System is fully operational.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white/10 rounded-3xl border border-white/10">
                                    <p className="text-[10px] text-primary-200 font-bold uppercase tracking-widest mb-1">Growth</p>
                                    <span className="text-2xl font-black text-white">+12.5%</span>
                                </div>
                                <div className="p-6 bg-white/10 rounded-3xl border border-white/10">
                                    <p className="text-[10px] text-primary-200 font-bold uppercase tracking-widest mb-1">Impact</p>
                                    <span className="text-2xl font-black text-white">Global</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Metrics */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                                <Activity className="w-8 h-8 text-primary-600 mb-4" />
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">System Uptime</h4>
                                <p className="text-3xl font-black text-gray-900">99.9%</p>
                            </div>
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                                <Server className="w-8 h-8 text-emerald-600 mb-4" />
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Latency</h4>
                                <p className="text-3xl font-black text-gray-900">24ms</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'organizations' && (
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Organization Network</h2>
                                <p className="text-sm text-gray-400 font-medium">Manage and authorize school administrators</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsAddSchoolOpen(true)}
                                    className="p-3 bg-primary-100 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                    title="Add New School"
                                >
                                    <Building className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {schools.map((s) => (
                                <div key={s._id} className="p-8 flex items-center justify-between hover:bg-gray-50 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-gray-100 text-gray-400 group-hover:bg-primary-100 group-hover:text-primary-600 rounded-[22px] flex items-center justify-center font-black text-xl transition-all">
                                            {s.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-gray-900">{s.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 rounded-lg">ID: {s.schoolID}</span>
                                                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{s.contactEmail}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden md:block">
                                            <p className="text-sm font-black text-gray-700">{s.adminId?.name || 'VIRTUAL NODE'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.adminId ? 'AUTHORIZED' : 'MISSING ADMIN'}</p>
                                        </div>
                                        {!s.adminId && (
                                            <button
                                                onClick={() => {
                                                    setSelectedSchoolForAdmin(s);
                                                    setIsAddAdminOpen(true);
                                                }}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                                            >
                                                <ShieldAlert className="w-4 h-4" /> Delegate
                                            </button>
                                        )}
                                        {s.adminId && (
                                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                                <Check className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Candidate Verification</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {pendingAdmins.length > 0 ? (
                                pendingAdmins.map((a) => (
                                    <div key={a._id} className="p-8 flex items-center justify-between hover:bg-gray-50 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">
                                                {a.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-gray-900">{a.name}</p>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Wants to join ID: {a.schoolID}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApproveAdmin(a._id)}
                                                className="px-6 py-3 bg-emerald-100 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                            >
                                                Verify Admin
                                            </button>
                                            <button className="p-3 bg-gray-100 text-gray-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-40 text-center">
                                    <Check className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                    <p className="text-gray-400 font-black uppercase tracking-widest">Protocol Clear. No pending requests.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add School Modal */}
            {isAddSchoolOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-scale-up">
                        <h2 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">Establish New Organization</h2>
                        <form onSubmit={handleAddSchool} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Organization Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all"
                                    value={newSchool.name}
                                    onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Unique Access ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all"
                                    value={newSchool.schoolID}
                                    onChange={(e) => setNewSchool({ ...newSchool, schoolID: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Contact Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all"
                                    value={newSchool.contactEmail}
                                    onChange={(e) => setNewSchool({ ...newSchool, contactEmail: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddSchoolOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
                                >
                                    Deploy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Admin Modal */}
            {isAddAdminOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-scale-up">
                        <div className="mb-8">
                            <p className="text-[10px] text-primary-600 font-black uppercase tracking-[0.2em] mb-1">Authorizing Admin for</p>
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none">{selectedSchoolForAdmin?.name}</h2>
                        </div>
                        <form onSubmit={handleAddAdmin} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Admin Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Login Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Secure System Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest leading-none mb-1">Assigned Organization ID</p>
                                <p className="text-lg font-black text-indigo-900">{selectedSchoolForAdmin?.schoolID}</p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddAdminOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                                >
                                    Authorize
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
