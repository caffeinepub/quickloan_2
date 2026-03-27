import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Clock,
  Loader2,
  ShieldAlert,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { EmploymentType, LoanStatus, LoanTenure } from "../backend.d";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllApplications,
  useApproveApplication,
  useIsAdmin,
  useRejectApplication,
} from "../hooks/useQueries";

type FilterStatus = "all" | LoanStatus;

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
        Approved
      </Badge>
    );
  if (status === LoanStatus.rejected)
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
    );
  return (
    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
      Pending
    </Badge>
  );
}

export default function AdminDashboard() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: applications, isLoading } = useAllApplications();
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [actionId, setActionId] = useState<string | null>(null);

  const filtered =
    applications?.filter((a) => filter === "all" || a.status === filter) ?? [];
  const pendingCount =
    applications?.filter((a) => a.status === LoanStatus.pending).length ?? 0;
  const approvedCount =
    applications?.filter((a) => a.status === LoanStatus.approved).length ?? 0;
  const totalAmount =
    applications?.reduce((acc, a) => acc + Number(a.amount), 0) ?? 0;

  const handleApprove = async (index: number) => {
    setActionId(`approve-${index}`);
    try {
      await approveMutation.mutateAsync(BigInt(index));
      toast.success("Application approved!");
    } catch {
      toast.error("Failed to approve");
    }
    setActionId(null);
  };

  const handleReject = async (index: number) => {
    setActionId(`reject-${index}`);
    try {
      await rejectMutation.mutateAsync(BigInt(index));
      toast.success("Application rejected.");
    } catch {
      toast.error("Failed to reject");
    }
    setActionId(null);
  };

  if (!identity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-bold text-xl mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-6">
                Please log in with an admin account.
              </p>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="bg-primary hover:bg-primary/90 w-full"
                data-ocid="admin.login.primary_button"
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

  if (adminLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2
            className="w-8 h-8 animate-spin text-primary"
            data-ocid="admin.loading_state"
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <Card className="max-w-md w-full mx-4" data-ocid="admin.error_state">
            <CardContent className="p-8 text-center">
              <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="font-bold text-xl mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have admin privileges.
              </p>
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
      <main className="flex-1 py-10 bg-muted/20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Manage loan applications
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Applications",
                value: applications?.length ?? 0,
                icon: <Users className="w-5 h-5" />,
                color: "text-primary",
              },
              {
                label: "Pending Review",
                value: pendingCount,
                icon: <Clock className="w-5 h-5" />,
                color: "text-yellow-600",
              },
              {
                label: "Approved",
                value: approvedCount,
                icon: <CheckCircle className="w-5 h-5" />,
                color: "text-green-600",
              },
              {
                label: "Total Loan Value",
                value: `₹${totalAmount.toLocaleString("en-IN")}`,
                icon: <TrendingUp className="w-5 h-5" />,
                color: "text-primary",
              },
            ].map((stat) => (
              <Card key={stat.label} className="border-border shadow-xs">
                <CardContent className="p-5">
                  <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter */}
          <div className="mb-6">
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as FilterStatus)}
            >
              <TabsList>
                <TabsTrigger value="all" data-ocid="admin.filter.tab">
                  All
                </TabsTrigger>
                <TabsTrigger
                  value={LoanStatus.pending}
                  data-ocid="admin.filter.tab"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value={LoanStatus.approved}
                  data-ocid="admin.filter.tab"
                >
                  Approved
                </TabsTrigger>
                <TabsTrigger
                  value={LoanStatus.rejected}
                  data-ocid="admin.filter.tab"
                >
                  Rejected
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3" data-ocid="admin.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i + 1} className="h-16 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card data-ocid="admin.empty_state">
              <CardContent className="p-12 text-center text-muted-foreground">
                No applications match this filter.
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tenure / EMI</TableHead>
                      <TableHead>CIBIL</TableHead>
                      <TableHead>Employment</TableHead>
                      <TableHead>Bank (e-NACH)</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((app, i) => {
                      const months = tenureMonths(app.tenure);
                      const amount = Number(app.amount);
                      const emi = calcEMI(amount, months);
                      const date = new Date(
                        Number(app.applicationTime) / 1_000_000,
                      );
                      const isActing =
                        actionId === `approve-${i}` ||
                        actionId === `reject-${i}`;
                      return (
                        <TableRow
                          key={`${app.applicant.toString()}-${app.applicationTime.toString()}`}
                          data-ocid={`admin.row.${i + 1}`}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {i + 1}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-xs">
                              {app.applicant.toString().slice(0, 12)}…
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{amount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{months}mo</div>
                            <div className="text-xs text-muted-foreground">
                              ₹{emi}/mo
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-semibold ${Number(app.cibilScore) >= 700 ? "text-green-600" : "text-yellow-600"}`}
                            >
                              {app.cibilScore.toString()}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize text-sm">
                            {app.employmentType === EmploymentType.salaried
                              ? "Salaried"
                              : "Self-Employed"}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div className="font-medium">
                                {app.enachDetails.bankName}
                              </div>
                              <div className="text-muted-foreground">
                                {app.enachDetails.accountNumber.slice(0, 4)}****
                              </div>
                              <div className="text-muted-foreground">
                                {app.enachDetails.ifscCode}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {date.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={app.status} />
                          </TableCell>
                          <TableCell>
                            {app.status === LoanStatus.pending ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  disabled={isActing}
                                  onClick={() => handleApprove(i)}
                                  className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs gap-1"
                                  data-ocid={`admin.approve.button.${i + 1}`}
                                >
                                  {actionId === `approve-${i}` ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3" />
                                  )}{" "}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={isActing}
                                  onClick={() => handleReject(i)}
                                  className="h-7 px-2 text-xs gap-1"
                                  data-ocid={`admin.delete_button.${i + 1}`}
                                >
                                  {actionId === `reject-${i}` ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3 h-3" />
                                  )}{" "}
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Done
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
