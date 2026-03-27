import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NewApplication {
    cibilScore: bigint;
    enachDetails: ENACHDetails;
    employmentType: EmploymentType;
    tenure: LoanTenure;
    amount: bigint;
    employmentDetails: string;
    monthlyIncome: bigint;
}
export type Time = bigint;
export interface LoanApplicationPublic {
    status: LoanStatus;
    applicant: Principal;
    cibilScore: bigint;
    enachDetails: ENACHDetails;
    employmentType: EmploymentType;
    tenure: LoanTenure;
    amount: bigint;
    employmentDetails: string;
    applicationTime: Time;
    monthlyIncome: bigint;
}
export interface ENACHDetails {
    ifscCode: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}
export enum EmploymentType {
    salaried = "salaried",
    selfEmployed = "selfEmployed"
}
export enum LoanStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum LoanTenure {
    twelveMonths = "twelveMonths",
    threeMonths = "threeMonths",
    sixMonths = "sixMonths"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    applyForLoan(newApp: NewApplication): Promise<bigint>;
    approveApplication(applicationId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateEMI(amount: bigint, tenure: LoanTenure): Promise<{
        principal: bigint;
        interest: bigint;
        tenureMonths: bigint;
        totalPayable: bigint;
        monthlyEMI: bigint;
    }>;
    checkEligibility(cibilScore: bigint, amount: bigint): Promise<boolean>;
    deleteApplication(applicationId: bigint): Promise<void>;
    getAllApplications(): Promise<Array<LoanApplicationPublic>>;
    getApplication(applicationId: bigint): Promise<LoanApplicationPublic>;
    getCallerUserRole(): Promise<UserRole>;
    getMyApplications(): Promise<Array<LoanApplicationPublic>>;
    getPendingApplications(): Promise<Array<LoanApplicationPublic>>;
    isCallerAdmin(): Promise<boolean>;
    modifyApplication(applicationId: bigint, updatedApp: NewApplication): Promise<void>;
    rejectApplication(applicationId: bigint): Promise<void>;
}
