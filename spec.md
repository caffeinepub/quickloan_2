# QuickLoan

## Current State
New project. No existing application.

## Requested Changes (Diff)

### Add
- Loan application form for amounts ₹1,000 to ₹5,000 with slider UI
- CIBIL score input with minimum 650 validation
- Applicant type selection: Salaried or Unemployed
- Salaried: monthly salary input; Unemployed: income source details
- e-NACH auto-debit setup form: bank name, account number, IFSC, account holder name
- EMI calculator showing monthly repayment based on amount and tenure (3, 6, 12 months)
- Application submission storing all data on-chain
- Application status page showing PENDING / APPROVED / REJECTED
- Admin view listing all applications with approve/reject actions
- Role-based access: admin vs applicant

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Select `authorization` component for role-based access
2. Generate Motoko backend with: loan application CRUD, eligibility check logic (CIBIL >= 650, amount 1000–5000), e-NACH data storage, admin approve/reject, status query
3. Build frontend: landing hero with EMI slider, multi-step application form, e-NACH setup, status tracker, admin dashboard
