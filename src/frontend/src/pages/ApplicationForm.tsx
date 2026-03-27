import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  User,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { EmploymentType, LoanTenure } from "../backend.d";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useApplyForLoan } from "../hooks/useQueries";

const STEPS = [
  { id: 1, label: "Personal Info", icon: <User className="w-4 h-4" /> },
  { id: 2, label: "Loan Details", icon: <FileText className="w-4 h-4" /> },
  { id: 3, label: "Employment", icon: <Briefcase className="w-4 h-4" /> },
  { id: 4, label: "Bank / e-NACH", icon: <Building2 className="w-4 h-4" /> },
  { id: 5, label: "Review", icon: <CheckCircle className="w-4 h-4" /> },
];

const TENURE_OPTIONS = [
  { label: "3 Months", value: LoanTenure.threeMonths, months: 3 },
  { label: "6 Months", value: LoanTenure.sixMonths, months: 6 },
  { label: "12 Months", value: LoanTenure.twelveMonths, months: 12 },
];

function calcEMI(amount: number, months: number) {
  return Math.round((amount * (1 + 0.02 * months)) / months);
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  pan: string;
  amount: number;
  tenure: (typeof TENURE_OPTIONS)[0];
  cibilScore: string;
  employmentType: EmploymentType;
  employerName: string;
  monthlySalary: string;
  incomeSource: string;
  monthlyIncome: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  accountType: "Savings" | "Current";
}

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const applyMutation = useApplyForLoan();
  const [step, setStep] = useState(1);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    pan: "",
    amount: 3000,
    tenure: TENURE_OPTIONS[1],
    cibilScore: "",
    employmentType: EmploymentType.salaried,
    employerName: "",
    monthlySalary: "",
    incomeSource: "",
    monthlyIncome: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "Savings",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const set = (
    field: keyof FormData,
    value:
      | string
      | number
      | (typeof TENURE_OPTIONS)[0]
      | EmploymentType
      | "Savings"
      | "Current",
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const cibilNum = Number.parseInt(form.cibilScore, 10);
  const cibilError =
    form.cibilScore !== "" && (!Number.isFinite(cibilNum) || cibilNum < 650);
  const emi = calcEMI(form.amount, form.tenure.months);

  const validateStep = (s: number): boolean => {
    const errs: typeof errors = {};
    if (s === 1) {
      if (!form.name.trim()) errs.name = "Name is required";
      if (!form.email.includes("@")) errs.email = "Valid email required";
      if (form.phone.replace(/\D/g, "").length < 10)
        errs.phone = "Valid 10-digit phone required";
      if (form.pan.length !== 10) errs.pan = "PAN must be 10 characters";
    }
    if (s === 2) {
      const cs = Number.parseInt(form.cibilScore, 10);
      if (!form.cibilScore || !Number.isFinite(cs))
        errs.cibilScore = "CIBIL score is required";
      else if (cs < 650) errs.cibilScore = "CIBIL score must be 650 or above";
    }
    if (s === 3) {
      if (form.employmentType === EmploymentType.salaried) {
        if (!form.employerName.trim())
          errs.employerName = "Employer name is required";
        if (!form.monthlySalary || Number.parseFloat(form.monthlySalary) < 5000)
          errs.monthlySalary = "Salary must be at least ₹5,000";
      } else {
        if (!form.incomeSource.trim())
          errs.incomeSource = "Income source is required";
        if (!form.monthlyIncome || Number.parseFloat(form.monthlyIncome) < 5000)
          errs.monthlyIncome = "Monthly income must be at least ₹5,000";
      }
    }
    if (s === 4) {
      if (!form.bankName.trim()) errs.bankName = "Bank name is required";
      if (!form.accountHolder.trim())
        errs.accountHolder = "Account holder name is required";
      if (form.accountNumber.length < 9)
        errs.accountNumber = "Valid account number required";
      if (form.ifscCode.length !== 11)
        errs.ifscCode = "IFSC must be 11 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    const income =
      form.employmentType === EmploymentType.salaried
        ? Number.parseFloat(form.monthlySalary)
        : Number.parseFloat(form.monthlyIncome);
    const empDetails =
      form.employmentType === EmploymentType.salaried
        ? `${form.employerName} | Salary: ₹${form.monthlySalary}`
        : form.incomeSource;
    try {
      const id = await applyMutation.mutateAsync({
        amount: BigInt(form.amount),
        tenure: form.tenure.value,
        cibilScore: BigInt(Number.parseInt(form.cibilScore, 10)),
        employmentType: form.employmentType,
        employmentDetails: empDetails,
        monthlyIncome: BigInt(Math.round(income)),
        enachDetails: {
          bankName: form.bankName,
          accountHolder: form.accountHolder,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode.toUpperCase(),
        },
      });
      setSubmittedId(id.toString());
      toast.success("Application submitted successfully!");
    } catch {
      toast.error("Submission failed. Please try again.");
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main
          className="flex-1 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #DFF4F9 0%, #DFF7E6 100%)",
          }}
        >
          <Card className="max-w-md w-full mx-4 shadow-card">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Please log in to submit your loan application.
              </p>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full rounded-full bg-primary hover:bg-primary/90"
                data-ocid="login.primary_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Connecting...
                  </>
                ) : (
                  "Login to Apply"
                )}
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (submittedId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main
          className="flex-1 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #DFF4F9 0%, #DFF7E6 100%)",
          }}
        >
          <Card
            className="max-w-md w-full mx-4 shadow-card"
            data-ocid="application.success_state"
          >
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Application Submitted!
              </h2>
              <p className="text-muted-foreground mb-4">
                Your loan application is under review.
              </p>
              <div className="bg-secondary rounded-xl p-4 mb-6">
                <div className="text-sm text-muted-foreground">
                  Application ID
                </div>
                <div className="font-bold text-lg text-primary">
                  #{submittedId}
                </div>
                <Badge className="mt-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                  PENDING
                </Badge>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate({ to: "/" })}
                  data-ocid="success.secondary_button"
                >
                  Go Home
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => navigate({ to: "/my-applications" })}
                  data-ocid="success.primary_button"
                >
                  My Applications
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        className="flex-1 py-12"
        style={{
          background: "linear-gradient(135deg, #DFF4F9 0%, #DFF7E6 100%)",
        }}
      >
        <div className="container mx-auto max-w-2xl px-4">
          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8 gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex flex-col items-center gap-1 ${step === s.id ? "text-primary" : step > s.id ? "text-primary" : "text-muted-foreground"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      step > s.id
                        ? "bg-primary border-primary text-white"
                        : step === s.id
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-border"
                    }`}
                  >
                    {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                  </div>
                  <span className="hidden sm:block text-xs font-medium whitespace-nowrap">
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-8 md:w-14 mx-1 mb-4 transition-all ${step > s.id ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {STEPS[step - 1].icon}
                    </span>
                    {STEPS[step - 1].label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Step 1 */}
                  {step === 1 && (
                    <>
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Rahul Kumar"
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                          className="mt-1"
                          data-ocid="personal.input"
                        />
                        {errors.name && (
                          <p
                            className="text-destructive text-xs mt-1"
                            data-ocid="personal.name_error"
                          >
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="rahul@example.com"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          className="mt-1"
                          data-ocid="personal.input"
                        />
                        {errors.email && (
                          <p
                            className="text-destructive text-xs mt-1"
                            data-ocid="personal.email_error"
                          >
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Mobile Number</Label>
                        <Input
                          id="phone"
                          placeholder="9876543210"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          className="mt-1"
                          data-ocid="personal.input"
                        />
                        {errors.phone && (
                          <p
                            className="text-destructive text-xs mt-1"
                            data-ocid="personal.phone_error"
                          >
                            {errors.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pan">PAN Number</Label>
                        <Input
                          id="pan"
                          placeholder="ABCDE1234F"
                          maxLength={10}
                          value={form.pan}
                          onChange={(e) =>
                            set("pan", e.target.value.toUpperCase())
                          }
                          className="mt-1"
                          data-ocid="personal.input"
                        />
                        {errors.pan && (
                          <p
                            className="text-destructive text-xs mt-1"
                            data-ocid="personal.pan_error"
                          >
                            {errors.pan}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Loan Amount</Label>
                          <span className="font-bold text-primary">
                            ₹{form.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <Slider
                          min={1000}
                          max={5000}
                          step={500}
                          value={[form.amount]}
                          onValueChange={([v]) => set("amount", v)}
                          className="[&>[role=slider]]:bg-primary [&>[role=slider]]:border-primary"
                          data-ocid="loan.input"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>₹1,000</span>
                          <span>₹5,000</span>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block">Tenure</Label>
                        <div className="flex gap-3">
                          {TENURE_OPTIONS.map((t) => (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => set("tenure", t)}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${form.tenure.value === t.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary hover:text-primary"}`}
                              data-ocid="loan.tab"
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="bg-secondary rounded-xl p-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Monthly EMI
                          </span>
                          <span className="font-bold text-primary">
                            ₹{emi.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-muted-foreground">
                            Total Payable
                          </span>
                          <span className="font-medium">
                            ₹
                            {(emi * form.tenure.months).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cibil">CIBIL Score</Label>
                        <Input
                          id="cibil"
                          type="number"
                          placeholder="750"
                          min={300}
                          max={900}
                          value={form.cibilScore}
                          onChange={(e) => set("cibilScore", e.target.value)}
                          className={`mt-1 ${cibilError ? "border-destructive" : ""}`}
                          data-ocid="loan.input"
                        />
                        {cibilError && (
                          <div
                            className="flex items-center gap-1 mt-1"
                            data-ocid="loan.cibil_error"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                            <p className="text-destructive text-xs">
                              CIBIL score must be 650 or above
                            </p>
                          </div>
                        )}
                        {errors.cibilScore && !cibilError && (
                          <p
                            className="text-destructive text-xs mt-1"
                            data-ocid="loan.error_state"
                          >
                            {errors.cibilScore}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Minimum required: 650
                        </p>
                      </div>
                    </>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <>
                      <div>
                        <Label className="mb-2 block">Employment Type</Label>
                        <div className="flex gap-3">
                          {[
                            {
                              label: "Salaried",
                              value: EmploymentType.salaried,
                            },
                            {
                              label: "Self-Employed / Unemployed",
                              value: EmploymentType.selfEmployed,
                            },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => set("employmentType", opt.value)}
                              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${form.employmentType === opt.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
                              data-ocid="employment.toggle"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {form.employmentType === EmploymentType.salaried ? (
                        <>
                          <div>
                            <Label htmlFor="employer">Employer Name</Label>
                            <Input
                              id="employer"
                              placeholder="Infosys Ltd."
                              value={form.employerName}
                              onChange={(e) =>
                                set("employerName", e.target.value)
                              }
                              className="mt-1"
                              data-ocid="employment.input"
                            />
                            {errors.employerName && (
                              <p
                                className="text-destructive text-xs mt-1"
                                data-ocid="employment.error_state"
                              >
                                {errors.employerName}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="salary">Monthly Salary (₹)</Label>
                            <Input
                              id="salary"
                              type="number"
                              placeholder="25000"
                              value={form.monthlySalary}
                              onChange={(e) =>
                                set("monthlySalary", e.target.value)
                              }
                              className="mt-1"
                              data-ocid="employment.input"
                            />
                            {errors.monthlySalary && (
                              <p
                                className="text-destructive text-xs mt-1"
                                data-ocid="employment.error_state"
                              >
                                {errors.monthlySalary}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label htmlFor="incomeSource">Income Source</Label>
                            <Input
                              id="incomeSource"
                              placeholder="Freelance / Business / Family support"
                              value={form.incomeSource}
                              onChange={(e) =>
                                set("incomeSource", e.target.value)
                              }
                              className="mt-1"
                              data-ocid="employment.input"
                            />
                            {errors.incomeSource && (
                              <p
                                className="text-destructive text-xs mt-1"
                                data-ocid="employment.error_state"
                              >
                                {errors.incomeSource}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="monthlyIncome">
                              Monthly Income (₹)
                            </Label>
                            <Input
                              id="monthlyIncome"
                              type="number"
                              placeholder="10000"
                              value={form.monthlyIncome}
                              onChange={(e) =>
                                set("monthlyIncome", e.target.value)
                              }
                              className="mt-1"
                              data-ocid="employment.input"
                            />
                            {errors.monthlyIncome && (
                              <p
                                className="text-destructive text-xs mt-1"
                                data-ocid="employment.error_state"
                              >
                                {errors.monthlyIncome}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Step 4 */}
                  {step === 4 && (
                    <>
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3">
                        <Building2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-primary mb-1">
                            e-NACH Auto Debit Authorization
                          </p>
                          <p className="text-muted-foreground">
                            By submitting this form, you authorize FinFlow to
                            automatically debit your monthly EMI from the bank
                            account provided below via e-NACH mandate.
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          placeholder="State Bank of India"
                          value={form.bankName}
                          onChange={(e) => set("bankName", e.target.value)}
                          className="mt-1"
                          data-ocid="enach.input"
                        />
                        {errors.bankName && (
                          <p
                            className="text-destructive text-xs mt-1"
                            data-ocid="enach.error_state"
                          >
                            {errors.bankName}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="accountHolder">
                          Account Holder Name
                        </Label>
                        <Input
                          id="accountHolder"
                          placeholder="Rahul Kumar"
                          value={form.accountHolder}
                          onChange={(e) => set("accountHolder", e.target.value)}
                          className="mt-1"
                          data-ocid="enach.input"
                        />
                        {errors.accountHolder && (
                          <p
                            className="text-destructive text-xs mt-1"
                            data-ocid="enach.error_state"
                          >
                            {errors.accountHolder}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          placeholder="123456789012"
                          value={form.accountNumber}
                          onChange={(e) => set("accountNumber", e.target.value)}
                          className="mt-1"
                          data-ocid="enach.input"
                        />
                        {errors.accountNumber && (
                          <p
                            className="text-destructive text-xs mt-1"
                            data-ocid="enach.error_state"
                          >
                            {errors.accountNumber}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="ifsc">IFSC Code</Label>
                        <Input
                          id="ifsc"
                          placeholder="SBIN0001234"
                          maxLength={11}
                          value={form.ifscCode}
                          onChange={(e) =>
                            set("ifscCode", e.target.value.toUpperCase())
                          }
                          className="mt-1"
                          data-ocid="enach.input"
                        />
                        {errors.ifscCode && (
                          <p
                            className="text-destructive text-xs mt-1"
                            data-ocid="enach.error_state"
                          >
                            {errors.ifscCode}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="mb-2 block">Account Type</Label>
                        <div className="flex gap-3">
                          {(["Savings", "Current"] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => set("accountType", type)}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${form.accountType === type ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}
                              data-ocid="enach.toggle"
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 5 */}
                  {step === 5 && (
                    <>
                      <div className="space-y-4 text-sm">
                        <ReviewSection title="Personal Info">
                          <Row label="Name" value={form.name} />
                          <Row label="Email" value={form.email} />
                          <Row label="Phone" value={form.phone} />
                          <Row label="PAN" value={form.pan} />
                        </ReviewSection>
                        <ReviewSection title="Loan Details">
                          <Row
                            label="Amount"
                            value={`₹${form.amount.toLocaleString("en-IN")}`}
                          />
                          <Row label="Tenure" value={form.tenure.label} />
                          <Row
                            label="Monthly EMI"
                            value={`₹${emi.toLocaleString("en-IN")}`}
                          />
                          <Row label="CIBIL Score" value={form.cibilScore} />
                        </ReviewSection>
                        <ReviewSection title="Employment">
                          <Row
                            label="Type"
                            value={
                              form.employmentType === EmploymentType.salaried
                                ? "Salaried"
                                : "Self-Employed / Unemployed"
                            }
                          />
                          {form.employmentType === EmploymentType.salaried ? (
                            <>
                              <Row label="Employer" value={form.employerName} />
                              <Row
                                label="Monthly Salary"
                                value={`₹${form.monthlySalary}`}
                              />
                            </>
                          ) : (
                            <>
                              <Row
                                label="Income Source"
                                value={form.incomeSource}
                              />
                              <Row
                                label="Monthly Income"
                                value={`₹${form.monthlyIncome}`}
                              />
                            </>
                          )}
                        </ReviewSection>
                        <ReviewSection title="e-NACH Bank Details">
                          <Row label="Bank" value={form.bankName} />
                          <Row
                            label="Account Holder"
                            value={form.accountHolder}
                          />
                          <Row label="Account No." value={form.accountNumber} />
                          <Row label="IFSC" value={form.ifscCode} />
                          <Row label="Account Type" value={form.accountType} />
                        </ReviewSection>
                      </div>
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm">
                        <p className="text-primary font-semibold mb-1">
                          Authorization Notice
                        </p>
                        <p className="text-muted-foreground">
                          By clicking Submit, you authorize FinFlow to
                          auto-debit your EMI of{" "}
                          <strong>₹{emi.toLocaleString("en-IN")}</strong>{" "}
                          monthly from your bank account via e-NACH mandate.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-4 border-t border-border">
                    {step > 1 ? (
                      <Button
                        variant="outline"
                        onClick={() => setStep((s) => s - 1)}
                        className="gap-2"
                        data-ocid="form.secondary_button"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => navigate({ to: "/" })}
                        data-ocid="form.cancel_button"
                      >
                        Cancel
                      </Button>
                    )}
                    {step < 5 ? (
                      <Button
                        onClick={handleNext}
                        className="bg-primary hover:bg-primary/90 gap-2"
                        data-ocid="form.primary_button"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={applyMutation.isPending}
                        className="bg-primary hover:bg-primary/90 gap-2"
                        data-ocid="form.submit_button"
                      >
                        {applyMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" /> Submit
                            Application
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-secondary px-4 py-2 font-semibold text-sm text-primary">
        {title}
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
