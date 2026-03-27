import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  PlusCircle,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { LoanStatus, LoanTenure } from "../backend.d";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyApplications } from "../hooks/useQueries";

function tenureLabel(t: LoanTenure) {
  if (t === LoanTenure.threeMonths) return "3 Months";
  if (t === LoanTenure.sixMonths) return "6 Months";
  return "12 Months";
}

function tenureMonths(t: LoanTenure) {
  if (t === LoanTenure.threeMonths) return 3;
  if (t === LoanTenure.sixMonths) return 6;
  return 12;
}

function calcEMI(amount: number, months: number) {
  return Math.round((amount * (1 + 0.02 * months)) / months);
}

function StatusBadge({ status }: { status: LoanStatus }) {
  if (status === LoanStatus.approved)
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        APPROVED
      </Badge>
    );
  if (status === LoanStatus.rejected)
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">REJECTED</Badge>
    );
  return (
    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
      PENDING
    </Badge>
  );
}

export default function MyApplications() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: applications, isLoading, error } = useMyApplications();

  if (!identity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-bold text-xl mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Log in to view your loan applications.
              </p>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="bg-primary hover:bg-primary/90 w-full"
                data-ocid="login.primary_button"
              >
                Login
              </Button>
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
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">My Applications</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Track your loan applications
              </p>
            </div>
            <Button
              onClick={() => navigate({ to: "/apply" })}
              className="bg-primary hover:bg-primary/90 gap-2"
              data-ocid="applications.primary_button"
            >
              <PlusCircle className="w-4 h-4" /> New Application
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-4" data-ocid="applications.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i + 1} className="h-36 w-full rounded-xl" />
              ))}
            </div>
          )}

          {error && (
            <Card
              className="border-destructive"
              data-ocid="applications.error_state"
            >
              <CardContent className="p-6 text-center text-destructive">
                Failed to load applications. Please refresh.
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && (applications?.length ?? 0) === 0 && (
            <Card data-ocid="applications.empty_state">
              <CardContent className="p-12 text-center">
                <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  No Applications Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  You haven't applied for any loans. Start your first
                  application today.
                </p>
                <Button
                  onClick={() => navigate({ to: "/apply" })}
                  className="bg-primary hover:bg-primary/90"
                  data-ocid="empty.primary_button"
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && (applications?.length ?? 0) > 0 && (
            <div className="space-y-4">
              {applications?.map((app, i) => {
                const months = tenureMonths(app.tenure);
                const amount = Number(app.amount);
                const emi = calcEMI(amount, months);
                const date = new Date(Number(app.applicationTime) / 1_000_000);
                return (
                  <motion.div
                    key={`${app.applicant.toString()}-${app.applicationTime.toString()}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card
                      className="border-border shadow-xs hover:shadow-card transition-shadow"
                      data-ocid={`applications.item.${i + 1}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-lg">
                                ₹{amount.toLocaleString("en-IN")}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {tenureLabel(app.tenure)} · CIBIL{" "}
                                {app.cibilScore.toString()}
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={app.status} />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-border text-center">
                          <div>
                            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                              <CreditCard className="w-3 h-3" /> Monthly EMI
                            </div>
                            <div className="font-semibold">
                              ₹{emi.toLocaleString("en-IN")}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                              <Calendar className="w-3 h-3" /> Applied
                            </div>
                            <div className="font-semibold">
                              {date.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs mb-1">
                              Employment
                            </div>
                            <div className="font-semibold capitalize">
                              {app.employmentType}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
