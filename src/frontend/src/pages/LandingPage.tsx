import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  CheckCircle,
  ChevronRight,
  ShieldCheck,
  Star,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";

const TENURE_OPTIONS = [
  { label: "3 Months", months: 3 },
  { label: "6 Months", months: 6 },
  { label: "12 Months", months: 12 },
];

function calcEMI(amount: number, months: number) {
  return Math.round((amount * (1 + 0.02 * months)) / months);
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState(3000);
  const [tenureIdx, setTenureIdx] = useState(1);
  const tenure = TENURE_OPTIONS[tenureIdx];
  const emi = calcEMI(loanAmount, tenure.months);
  const total = emi * tenure.months;
  const interest = total - loanAmount;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #DFF4F9 0%, #DFF7E6 100%)",
        }}
        className="py-20 md:py-28"
      >
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 rounded-full px-3 py-1">
                Instant Approval · No Collateral
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-5">
                Quick Loans
                <br />
                <span className="text-primary">₹1,000 – ₹5,000</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Fast personal loans for salaried &amp; self-employed
                individuals. CIBIL 650+, e-NACH auto-debit, same-day disbursal.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8"
                  onClick={() => navigate({ to: "/apply" })}
                  data-ocid="hero.primary_button"
                >
                  Apply Now <ChevronRight className="w-4 h-4" />
                </Button>
                <a href="#how-it-works">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full border-primary/30 text-primary"
                    data-ocid="hero.secondary_button"
                  >
                    How It Works
                  </Button>
                </a>
              </div>
              <div className="flex gap-6 mt-8 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-primary" /> No hidden
                  charges
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-primary" /> 100% digital
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-primary" /> Same-day
                  funds
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden md:flex justify-center"
            >
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 rounded-3xl bg-primary/10" />
                <div className="absolute top-6 left-6 right-6 bottom-6 rounded-2xl bg-white shadow-card flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-primary">
                      ₹5,000
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Max Loan Amount
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {[
                      { v: "650+", l: "CIBIL" },
                      { v: "2%", l: "Monthly" },
                      { v: "24h", l: "Disbursal" },
                    ].map((item) => (
                      <div
                        key={item.l}
                        className="text-center px-3 py-2 rounded-xl bg-secondary"
                      >
                        <div className="font-bold text-primary text-sm">
                          {item.v}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.l}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* EMI Calculator */}
      <section className="py-0" id="calculator">
        <div className="container mx-auto max-w-6xl px-4 -mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-card border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 border-r border-border">
                    <h3 className="font-bold text-lg mb-6">EMI Calculator</h3>
                    <div className="mb-8">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium">Loan Amount</span>
                        <span className="text-sm font-bold text-primary">
                          ₹{loanAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <Slider
                        min={1000}
                        max={5000}
                        step={500}
                        value={[loanAmount]}
                        onValueChange={([v]) => setLoanAmount(v)}
                        className="[&>[role=slider]]:bg-primary [&>[role=slider]]:border-primary"
                        data-ocid="calculator.input"
                      />
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>₹1,000</span>
                        <span>₹5,000</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium">Tenure</span>
                        <span className="text-sm font-bold text-primary">
                          {tenure.label}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {TENURE_OPTIONS.map((t, i) => (
                          <button
                            type="button"
                            key={t.months}
                            onClick={() => setTenureIdx(i)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${tenureIdx === i ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                            data-ocid="calculator.tab"
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-8" style={{ background: "#D7EEF0" }}>
                    <h3 className="font-bold text-lg mb-6">Your EMI Summary</h3>
                    <div className="text-center mb-6">
                      <div className="text-5xl font-extrabold text-primary mb-1">
                        ₹{emi.toLocaleString("en-IN")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Monthly EMI
                      </div>
                    </div>
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Principal</span>
                        <span className="font-medium">
                          ₹{loanAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Interest ({tenure.months} × 2%)
                        </span>
                        <span className="font-medium">
                          ₹{interest.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-3">
                        <span className="font-semibold">Total Payable</span>
                        <span className="font-bold text-primary">
                          ₹{total.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full rounded-full bg-primary hover:bg-primary/90"
                      onClick={() => navigate({ to: "/apply" })}
                      data-ocid="calculator.primary_button"
                    >
                      Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground">
              Get funded in 3 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Users className="w-6 h-6" />,
                title: "Apply Online",
                desc: "Fill in your personal & employment details in minutes. No paperwork required.",
              },
              {
                step: "02",
                icon: <BadgeCheck className="w-6 h-6" />,
                title: "Instant Approval",
                desc: "Our system checks CIBIL score & eligibility. Get approved within hours.",
              },
              {
                step: "03",
                icon: <Wallet className="w-6 h-6" />,
                title: "Get Funded",
                desc: "Funds transferred directly to your bank account same day via NEFT/IMPS.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="border-border shadow-xs hover:shadow-card transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-primary mb-1">
                          Step {s.step}
                        </div>
                        <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Choose FinFlow?</h2>
            <p className="text-muted-foreground">
              Built for speed, security, and simplicity
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Fast Approval",
                desc: "AI-driven assessment. Approval decision within minutes of applying.",
              },
              {
                icon: <Building2 className="w-6 h-6" />,
                title: "e-NACH Auto Debit",
                desc: "Seamless EMI auto-debit directly from your bank. Never miss a payment.",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Salaried & Self-Employed",
                desc: "Available for both salaried employees and self-employed/unemployed individuals.",
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: "CIBIL 650+",
                desc: "Minimum CIBIL score of 650 required. Check & improve your score instantly.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-border shadow-xs hover:shadow-card transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                      {f.icon}
                    </div>
                    <h3 className="font-bold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section
        id="eligibility"
        className="py-20"
        style={{ background: "#DFF4F9" }}
      >
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Eligibility Criteria</h2>
            <p className="text-muted-foreground">
              Simple requirements to qualify for a FinFlow loan
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              "Indian citizen aged 21–55 years",
              "Minimum CIBIL score of 650",
              "Salaried or self-employed / unemployed",
              "Monthly income of at least ₹5,000",
              "Valid PAN card & Aadhaar",
              "Active bank account for e-NACH",
              "Loan amount: ₹1,000 to ₹5,000",
              "Tenure: 3, 6, or 12 months",
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 shadow-xs"
                data-ocid={`eligibility.item.${i + 1}`}
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2">What Our Customers Say</h2>
            <p className="text-muted-foreground">
              Trusted by thousands across India
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                role: "Salaried – IT Professional",
                text: "Got ₹5,000 in less than 4 hours! The e-NACH setup was seamless. Highly recommend FinFlow.",
                rating: 5,
              },
              {
                name: "Raju Patel",
                role: "Self-Employed – Shopkeeper",
                text: "Even as a self-employed person my application was approved. The process was fully digital — no branch visit needed.",
                rating: 5,
              },
            ].map((t, i) => (
              <Card
                key={t.name}
                className="border-border shadow-xs"
                data-ocid={`testimonials.item.${i + 1}`}
              >
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {["1", "2", "3", "4", "5"].slice(0, t.rating).map((n) => (
                      <Star
                        key={n}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    “{t.text}”
                  </p>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card
              className="border-primary/20 shadow-card"
              style={{
                background: "linear-gradient(135deg, #DFF4F9, #DFF7E6)",
              }}
            >
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">For Everyone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Whether you're salaried or unemployed — FinFlow welcomes all
                    applicants with CIBIL 650+.
                  </p>
                </div>
                <Button
                  className="rounded-full bg-primary hover:bg-primary/90 w-full"
                  onClick={() => navigate({ to: "/apply" })}
                  data-ocid="promo.primary_button"
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "What is CIBIL score and why 650?",
                a: "CIBIL score reflects your credit history. A score of 650+ indicates responsible repayment behaviour, which is our minimum eligibility criteria.",
              },
              {
                q: "What is e-NACH and how does it work?",
                a: "e-NACH (Electronic National Automated Clearing House) is a digital mandate that authorises automatic EMI deduction from your bank account on the due date each month.",
              },
              {
                q: "How quickly will I receive my loan?",
                a: "Once approved, funds are typically credited to your bank account within 24 hours via NEFT/IMPS transfer.",
              },
              {
                q: "Can unemployed individuals apply?",
                a: "Yes! Self-employed and currently unemployed individuals with a regular income source and CIBIL 650+ can apply.",
              },
            ].map((faq, idx) => (
              <Card
                key={faq.q}
                className="border-border"
                data-ocid={`faq.item.${idx + 1}`}
              >
                <CardContent className="p-5">
                  <h4 className="font-semibold mb-2">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
