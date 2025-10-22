import { useState, useEffect } from 'react';
import { useAuth } from '../context/Authcontext';
import { supabase } from '../lib/supabase';
import PTOManagement from './PTOManagement';
import PaymentStubs from './PaymentStubs';
import {
    User,
    Calendar,
    DollarSign,
    LogOut,
    Menu,
    X,
    Briefcase,
    Mail,
    Clock,
} from 'lucide-react';

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (user) {
            loadEmployee();
        }
    }, [user]);

    const loadEmployee = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (error) throw error;
            if (data) setEmployee(data);
        } catch (err) {
            console.error('Error loading employee:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'pto', label: 'Time Off', icon: Calendar },
        { id: 'payment', label: 'Payment Stubs', icon: DollarSign },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Employee Portal</h1>
                                {employee && (
                                    <p className="text-xs text-slate-600">
                                        {employee.first_name} {employee.last_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                            activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all ml-2"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-white">
                        <div className="px-4 py-3 space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                                            activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'profile' && employee && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-3xl font-bold text-white">
                                                {employee.first_name[0]}
                                                {employee.last_name[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-slate-900">
                                                {employee.first_name} {employee.last_name}
                                            </h2>
                                            <p className="text-slate-600">{employee.position || 'Employee'}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <Mail className="w-5 h-5 text-slate-600" />
                                                <div>
                                                    <p className="text-sm text-slate-600">Email</p>
                                                    <p className="font-medium text-slate-900">{employee.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <Briefcase className="w-5 h-5 text-slate-600" />
                                                <div>
                                                    <p className="text-sm text-slate-600">Employee ID</p>
                                                    <p className="font-medium text-slate-900">{employee.employee_id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <User className="w-5 h-5 text-slate-600" />
                                                <div>
                                                    <p className="text-sm text-slate-600">Department</p>
                                                    <p className="font-medium text-slate-900">{employee.department || 'Not assigned'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Employment Details</h3>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <Clock className="w-5 h-5 text-slate-600" />
                                                <div>
                                                    <p className="text-sm text-slate-600">Hire Date</p>
                                                    <p className="font-medium text-slate-900">
                                                        {new Date(employee.hire_date).toLocaleDateString('en-US', {
                                                            month: 'long',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <Calendar className="w-5 h-5 text-slate-600" />
                                                <div>
                                                    <p className="text-sm text-slate-600">PTO Balance</p>
                                                    <p className="font-medium text-slate-900">{employee.pto_balance} days available</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <Briefcase className="w-5 h-5 text-slate-600" />
                                                <div>
                                                    <p className="text-sm text-slate-600">Position</p>
                                                    <p className="font-medium text-slate-900">{employee.position || 'Not assigned'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pto' && <PTOManagement />}

                        {activeTab === 'payment' && <PaymentStubs />}
                    </>
                )}
            </main>
        </div>
    );
}
