/*
  # Employee Portal Database Schema

  ## Overview
  This migration creates the complete database schema for an employee portal system
  with PTO (Paid Time Off) management and payment stub viewing capabilities.

  ## New Tables

  ### 1. `employees`
  Core employee information table
  - `id` (uuid, primary key) - Unique employee identifier, linked to auth.users
  - `employee_id` (text, unique) - Human-readable employee ID (e.g., EMP001)
  - `first_name` (text) - Employee first name
  - `last_name` (text) - Employee last name
  - `email` (text, unique) - Employee email address
  - `department` (text) - Department name
  - `position` (text) - Job title/position
  - `hire_date` (date) - Date of hire
  - `pto_balance` (numeric) - Current PTO balance in days
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record last update timestamp

  ### 2. `pto_requests`
  PTO request and tracking table
  - `id` (uuid, primary key) - Unique request identifier
  - `employee_id` (uuid, foreign key) - References employees table
  - `start_date` (date) - PTO start date
  - `end_date` (date) - PTO end date
  - `days_requested` (numeric) - Number of days requested
  - `request_type` (text) - Type: vacation, sick, personal, etc.
  - `status` (text) - Status: pending, approved, denied
  - `reason` (text) - Employee's reason for request
  - `created_at` (timestamptz) - Request submission timestamp
  - `updated_at` (timestamptz) - Request last update timestamp

  ### 3. `payment_stubs`
  Payment stub records table
  - `id` (uuid, primary key) - Unique stub identifier
  - `employee_id` (uuid, foreign key) - References employees table
  - `pay_period_start` (date) - Pay period start date
  - `pay_period_end` (date) - Pay period end date
  - `pay_date` (date) - Actual payment date
  - `gross_pay` (numeric) - Gross payment amount
  - `net_pay` (numeric) - Net payment after deductions
  - `federal_tax` (numeric) - Federal tax withholding
  - `state_tax` (numeric) - State tax withholding
  - `social_security` (numeric) - Social security deduction
  - `medicare` (numeric) - Medicare deduction
  - `retirement_401k` (numeric) - 401k contribution
  - `health_insurance` (numeric) - Health insurance deduction
  - `other_deductions` (numeric) - Other deductions
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies:

  #### Employees Table
  - Authenticated users can only view their own employee record
  - Authenticated users can only update their own basic information

  #### PTO Requests Table
  - Employees can view only their own PTO requests
  - Employees can create new PTO requests for themselves
  - Employees can update their own pending requests

  #### Payment Stubs Table
  - Employees can only view their own payment stubs
  - No modification allowed (read-only for employees)

  ## Important Notes
  - All monetary values use numeric type for precision
  - RLS policies ensure employees can only access their own data
  - Employee ID in auth.users is linked to employees.id for authentication
  - Default values set for timestamps and status fields
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  department text NOT NULL DEFAULT '',
  position text NOT NULL DEFAULT '',
  hire_date date NOT NULL DEFAULT CURRENT_DATE,
  pto_balance numeric NOT NULL DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create PTO requests table
CREATE TABLE IF NOT EXISTS pto_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days_requested numeric NOT NULL,
  request_type text NOT NULL DEFAULT 'vacation',
  status text NOT NULL DEFAULT 'pending',
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_days CHECK (days_requested > 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'denied'))
);

-- Create payment stubs table
CREATE TABLE IF NOT EXISTS payment_stubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  pay_period_start date NOT NULL,
  pay_period_end date NOT NULL,
  pay_date date NOT NULL,
  gross_pay numeric NOT NULL DEFAULT 0,
  net_pay numeric NOT NULL DEFAULT 0,
  federal_tax numeric NOT NULL DEFAULT 0,
  state_tax numeric NOT NULL DEFAULT 0,
  social_security numeric NOT NULL DEFAULT 0,
  medicare numeric NOT NULL DEFAULT 0,
  retirement_401k numeric NOT NULL DEFAULT 0,
  health_insurance numeric NOT NULL DEFAULT 0,
  other_deductions numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_pay_period CHECK (pay_period_end >= pay_period_start)
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_stubs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees table
CREATE POLICY "Employees can view own profile"
  ON employees FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Employees can update own profile"
  ON employees FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for pto_requests table
CREATE POLICY "Employees can view own PTO requests"
  ON pto_requests FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Employees can create own PTO requests"
  ON pto_requests FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own pending PTO requests"
  ON pto_requests FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid() AND status = 'pending')
  WITH CHECK (employee_id = auth.uid());

-- RLS Policies for payment_stubs table
CREATE POLICY "Employees can view own payment stubs"
  ON payment_stubs FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pto_requests_employee_id ON pto_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_pto_requests_status ON pto_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_stubs_employee_id ON payment_stubs(employee_id);
CREATE INDEX IF NOT EXISTS idx_payment_stubs_pay_date ON payment_stubs(pay_date DESC);