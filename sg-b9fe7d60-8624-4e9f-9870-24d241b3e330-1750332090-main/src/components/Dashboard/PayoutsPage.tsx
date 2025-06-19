import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Download, RefreshCw, Calendar, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import payoutService, { PayoutWithInvestor, PayoutSummary } from "@/services/payoutService";

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutWithInvestor[]>([]);
  const [filteredPayouts, setFilteredPayouts] = useState<PayoutWithInvestor[]>([]);
  const [summary, setSummary] = useState<PayoutSummary>({
    totalRequired: 0,
    totalPaid: 0,
    pendingPayouts: 0,
    paidCount: 0,
    unpaidCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(payoutService.getCurrentMonthYear());
  const [exporting, setExporting] = useState(false);
  const [generating, ] = useState(false);

  const monthOptions = payoutService.generateMonthOptions();

  const loadPayouts = useCallback(async () => {
    try {
      setLoading(true);
      await payoutService.generatePayoutsForMonth(selectedMonth);
      const [payoutsData, summaryData] = await Promise.all([
        payoutService.getPayoutsForMonth(selectedMonth),
        payoutService.getPayoutSummary(selectedMonth),
      ]);
      
      setPayouts(payoutsData);
      setFilteredPayouts(payoutsData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to load payouts:", error);
      toast({
        title: "Error",
        description: "Failed to load payouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  useEffect(() => {
    let filtered = payouts;

    if (searchTerm) {
      filtered = filtered.filter(
        (payout) =>
          payout.user_investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payout.user_investment.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((payout) => payout.status === statusFilter);
    }

    setFilteredPayouts(filtered);
  }, [payouts, searchTerm, statusFilter]);

  const handleStatusChange = async (payoutId: string, newStatus: "Paid" | "Not Paid") => {
    try {
      await payoutService.updatePayoutStatus(payoutId, newStatus);
      toast({
        title: "Success",
        description: `Payout marked as ${newStatus.toLowerCase()}.`,
      });
      loadPayouts();
    } catch (error) {
      console.error("Failed to update payout status:", error);
      toast({
        title: "Error",
        description: "Failed to update payout status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const csvContent = await payoutService.exportPayoutsToCSV(selectedMonth);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `2PC_Payout_Report_${selectedMonth}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Payout report exported successfully.",
      });
    } catch (error) {
      console.error("Failed to export payouts:", error);
      toast({
        title: "Error",
        description: "Failed to export payouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const isOverdue = (status: string) => {
    if (status === "Paid") return false;
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonthYear = payoutService.getCurrentMonthYear();
    return selectedMonth === currentMonthYear && currentDay > 5;
  };

  const summaryCards = [
    {
      title: "Total Required",
      value: formatCurrency(summary.totalRequired),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Paid",
      value: formatCurrency(summary.totalPaid),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Amount",
      value: formatCurrency(summary.pendingPayouts),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completion Rate",
      value: summary.totalRequired > 0 ? `${Math.round((summary.totalPaid / summary.totalRequired) * 100)}%` : "0%",
      icon: XCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Payout Tracker</h1>
          <p className="text-gray-600 mt-1">
            Track and manage monthly payouts for {payoutService.formatMonthYear(selectedMonth)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleExport}
            disabled={exporting || payouts.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export Report"}
          </Button>
          <Button 
            variant="outline" 
            onClick={loadPayouts}
            disabled={loading}
            className="bg-transparent hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Not Paid">Not Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <p>Total: {filteredPayouts.length} payouts</p>
                <p>Paid: {summary.paidCount} | Pending: {summary.unpaidCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <Card className="shadow-sm hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>User Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Invested Amount</TableHead>
                  <TableHead>Monthly Payout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Paid</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayouts.map((payout, index) => (
                  <TableRow 
                    key={payout.id} 
                    className={`
                      ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      ${isOverdue(payout.status) ? "bg-red-50 border-l-4 border-red-500" : ""}
                      hover:bg-gray-100 transition-colors
                    `}
                  >
                    <TableCell className="font-medium">
                      <div>
                        {payout.user_investment.name}
                        {isOverdue(payout.status) && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {payout.user_investment.email}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payout.user_investment.phone_number}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(payout.user_investment.invested_amount)}
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {formatCurrency(payout.payout_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payout.status === "Paid" ? "default" : "secondary"}>
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(payout.date_paid)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {payout.status === "Not Paid" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Mark as Paid
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Mark as Paid</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to mark the payout for {payout.user_investment.name} as paid?
                                  Amount: {formatCurrency(payout.payout_amount)}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleStatusChange(payout.id, "Paid")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Mark as Paid
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(payout.id, "Not Paid")}
                            className="bg-transparent hover:bg-gray-50"
                          >
                            Undo
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredPayouts.map((payout) => (
          <Card 
            key={payout.id} 
            className={`shadow-sm ${isOverdue(payout.status) ? "border-l-4 border-red-500 bg-red-50" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{payout.user_investment.name}</h3>
                  {isOverdue(payout.status) && (
                    <Badge variant="destructive" className="text-xs">
                      Overdue
                    </Badge>
                  )}
                </div>
                <Badge variant={payout.status === "Paid" ? "default" : "secondary"}>
                  {payout.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{payout.user_investment.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium">{payout.user_investment.phone_number}</p>
                </div>
                <div>
                  <span className="text-gray-600">Investment:</span>
                  <p className="font-medium text-green-600">
                    {formatCurrency(payout.user_investment.invested_amount)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Payout:</span>
                  <p className="font-medium text-blue-600">
                    {formatCurrency(payout.payout_amount)}
                  </p>
                </div>
                {payout.date_paid && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Date Paid:</span>
                    <p className="font-medium">{formatDate(payout.date_paid)}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {payout.status === "Not Paid" ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1">
                        Mark as Paid
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark as Paid</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to mark the payout for {payout.user_investment.name} as paid?
                          Amount: {formatCurrency(payout.payout_amount)}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleStatusChange(payout.id, "Paid")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark as Paid
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(payout.id, "Not Paid")}
                    className="bg-transparent hover:bg-gray-50 flex-1"
                  >
                    Undo Payment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPayouts.length === 0 && !loading && (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <DollarSign className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No payouts found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : `No payouts generated for ${payoutService.formatMonthYear(selectedMonth)} yet.`}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={loadPayouts} disabled={generating}>
                {generating ? "Generating..." : "Generate Payouts"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
