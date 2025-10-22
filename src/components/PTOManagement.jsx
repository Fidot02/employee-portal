import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/Authcontext';
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function PTOManagement() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        requestType: 'vacation',
        reason: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            const [employeeResult, requestsResult] = await Promise.all([
                supabase.from('employees').select('*').eq('id', user.id).maybeSingle(),
                supabase
                    .from('pto_requests')
                    .select('*')
                    .eq('employee_id', user.id)
                    .order('created_at', { ascending: false }),
            ]);

            if (employeeResult.data) setEmployee(employeeResult.data);
            if (requestsResult.data) setRequests(requestsResult.data);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateDays = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const daysRequested = calculateDays(formData.startDate, formData.endDate);

            if (daysRequested > (employee?.pto_balance || 0)) {
                setError('Insufficient PTO balance');
                setSubmitting(false);
                return;
            }

            const { error: insertError } = await supabase.from('pto_requests').insert({
                employee_id: user.id,
                start_date: formData.startDate,
                end_date: formData.endDate,
                days_requested: daysRequested,
                request_type: formData.requestType,
                reason: formData.reason,
                status: 'pending',
            });

            if (insertError) throw insertError;

            setFormData({
                startDate: '',
                endDate: '',
                requestType: 'vacation',
                reason: '',
            });
            setShowForm(false);
            await loadData();
        } catch (err) {
            setError((err && err.message) || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'denied':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'denied':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">PTO Balance</h2>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold">{employee?.pto_balance || 0}</span>
                            <span className="text-xl opacity-90">days available</span>
                        </div>
                    </div>
                    <Calendar className="w-20 h-20 opacity-20" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Time Off Requests</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        New Request
                    </button>
                </div>

                {showForm && (
                    <div className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Submit PTO Request</h3>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Request Type
                                </label>
                                <select
                                    value={formData.requestType}
                                    onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="vacation">Vacation</option>
                                    <option value="sick">Sick Leave</option>
                                    <option value="personal">Personal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Reason (Optional)
                                </label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                    rows={3}
                                    placeholder="Brief description..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setError('');
                                    }}
                                    className="px-6 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="space-y-3">
                    {requests.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No PTO requests yet</p>
                            <p className="text-sm">Click "New Request" to submit your first request</p>
                        </div>
                    ) : (
                        requests.map((request) => (
                            <div
                                key={request.id}
                                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                                    request.status
                                                )}`}
                                            >
                                                {getStatusIcon(request.status)}
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                            <span className="text-sm text-slate-500 capitalize">
                                                {request.request_type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-700">
                                            <div>
                                                <span className="font-medium">
                                                    {new Date(request.start_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                <span className="mx-2">→</span>
                                                <span className="font-medium">
                                                    {new Date(request.end_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                ({request.days_requested} {request.days_requested === 1 ? 'day' : 'days'})
                                            </div>
                                        </div>
                                        {request.reason && (
                                            <p className="mt-2 text-sm text-slate-600">{request.reason}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
