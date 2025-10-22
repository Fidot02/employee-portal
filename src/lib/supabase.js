import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * @typedef {Object} Employee
 * @property {string} id
 * @property {string} employee_id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {string} department
 * @property {string} position
 * @property {string} hire_date
 * @property {number} pto_balance
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} PTORequest
 * @property {string} id
 * @property {string} employee_id
 * @property {string} start_date
 * @property {string} end_date
 * @property {number} days_requested
 * @property {'vacation'|'sick'|'personal'} request_type
 * @property {'pending'|'approved'|'denied'} status
 * @property {string} reason
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} PaymentStub
 * @property {string} id
 * @property {string} employee_id
 * @property {string} pay_period_start
 * @property {string} pay_period_end
 * @property {string} pay_date
 * @property {number} gross_pay
 * @property {number} net_pay
 * @property {number} federal_tax
 * @property {number} state_tax
 * @property {number} social_security
 * @property {number} medicare
 * @property {number} retirement_401k
 * @property {number} health_insurance
 * @property {number} other_deductions
 * @property {string} created_at
 */
