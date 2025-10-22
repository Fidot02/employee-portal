import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/Authcontext';
import { DollarSign, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';

export default function PaymentStubs() {
    const { user } = useAuth();
    const [stubs, setStubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedStub, setExpandedStub] = useState(null);

    useEffect(() => {
        if (user) {
            loadStubs();
        }
    }, [user]);

    const loadStubs = async () => {
        try {
            const { data, error } = await supabase
                .from('payment_stubs')
                .select('*')
                .eq('employee_id', user.id)
                .order('pay_date', { ascending: false });

            if (error) throw error;
            if (data) setStubs(data);
        } catch (err) {
            console.error('Error loading payment stubs:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const toggleExpand = (stubId) => {
        setExpandedStub(expandedStub === stubId ? null : stubId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const latestStub = stubs[0];

    return (
        <div className="space-y-6">
            {latestStub && (
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-green-100 mb-1">Latest Payment</p>
                            <h2 className="text-4xl font-bold">{formatCurrency(latestStub.net_pay)}</h2>
                        </div>
                        <DollarSign className="w-20 h-20 opacity-20" />
                    </div>
                    <div className="flex items-center justify-between text-green-100">
                        <span>Pay Date: {formatDate(latestStub.pay_date)}</span>
                        <span>
                            {formatDate(latestStub.pay_period_start)} - {formatDate(latestStub.pay_period_end)}
                        </span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Payment History</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText className="w-5 h-5" />
                        <span>{stubs.length} {stubs.length === 1 ? 'stub' : 'stubs'}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {stubs.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No payment stubs available</p>
                            <p className="text-sm">Payment stubs will appear here once processed</p>
                        </div>
                    ) : (
                        stubs.map((stub) => {
                            const isExpanded = expandedStub === stub.id;
                            const totalDeductions =
                                Number(stub.federal_tax) +
                                Number(stub.state_tax) +
                                Number(stub.social_security) +
                                Number(stub.medicare) +
                                Number(stub.retirement_401k) +
                                Number(stub.health_insurance) +
                                Number(stub.other_deductions);

                            return (
                                <div
                                    key={stub.id}
                                    className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div
                                        onClick={() => toggleExpand(stub.id)}
                                        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                        {formatDate(stub.pay_date)}
                                                    </h3>
                                                    <span className="text-sm text-slate-500">
                                                        {formatDate(stub.pay_period_start)} - {formatDate(stub.pay_period_end)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div>
                                                        <span className="text-slate-600">Gross: </span>
                                                        <span className="font-semibold text-slate-900">
                                                            {formatCurrency(stub.gross_pay)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-600">Net: </span>
                                                        <span className="font-semibold text-green-600">
                                                            {formatCurrency(stub.net_pay)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                                {isExpanded ? (
                                                    <ChevronUp className="w-5 h-5 text-slate-400" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-slate-200 bg-slate-50 p-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                                                        Earnings
                                                    </h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600">Gross Pay</span>
                                                            <span className="font-medium text-slate-900">
                                                                {formatCurrency(stub.gross_pay)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                                                        Deductions
                                                    </h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600">Federal Tax</span>
                                                            <span className="font-medium text-slate-900">
                                                                {formatCurrency(stub.federal_tax)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600">State Tax</span>
                                                            <span className="font-medium text-slate-900">
                                                                {formatCurrency(stub.state_tax)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600">Social Security</span>
                                                            <span className="font-medium text-slate-900">
                                                                {formatCurrency(stub.social_security)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600">Medicare</span>
                                                            <span className="font-medium text-slate-900">
                                                                {formatCurrency(stub.medicare)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600">401(k)</span>
                                                            <span className="font-medium text-slate-900">
                                                                {formatCurrency(stub.retirement_401k)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-600">Health Insurance</span>
                                                            <span className="font-medium text-slate-900">
                                                                {formatCurrency(stub.health_insurance)}
                                                            </span>
                                                        </div>
                                                        {Number(stub.other_deductions) > 0 && (
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-600">Other Deductions</span>
                                                                <span className="font-medium text-slate-900">
                                                                    {formatCurrency(stub.other_deductions)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between text-sm pt-2 border-t border-slate-300">
                                                            <span className="text-slate-700 font-medium">Total Deductions</span>
                                                            <span className="font-semibold text-slate-900">
                                                                {formatCurrency(totalDeductions)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t-2 border-slate-300">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-semibold text-slate-900">Net Pay</span>
                                                    <span className="text-2xl font-bold text-green-600">
                                                        {formatCurrency(stub.net_pay)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}