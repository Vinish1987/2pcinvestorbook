import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Edit, Trash2, Filter, ArrowUpDown, Users, Download } from "lucide-react"; // Added Download
import { toast } from "@/hooks/use-toast";
import investmentService, { UserInvestment } from "@/services/investmentService";
import AddInvestorDialog from "./AddInvestorDialog";

export default function InvestorsPage() {
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [investmentTypeFilter, setInvestmentTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof UserInvestment>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [editingInvestor, setEditingInvestor] = useState<UserInvestment | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // Added state for Add dialog
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [exporting, setExporting] = useState(false); // Added exporting state

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const data = await investmentService.getAllInvestments();
      setInvestments(data);
      setFilteredInvestments(data);
    } catch (error) {
      console.error("Failed to load investments:", error);
      toast({
        title: "Error",
        description: "Failed to load investments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportInvestors = async () => {
    try {
      setExporting(true);
      const csvContent = await investmentService.exportInvestorsToCSV();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "2PC_Investors_Report.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Investors report exported successfully.",
      });
    } catch (error) {
      console.error("Failed to export investors:", error);
      toast({
        title: "Error",
        description: "Failed to export investors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  useEffect(() => {
    let filtered = investments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply investment type filter
    if (investmentTypeFilter !== "all") {
      filtered = filtered.filter((inv) => inv.investment_type === investmentTypeFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null values
      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      // Convert to string for comparison if needed
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredInvestments(filtered);
    setCurrentPage(1);
  }, [investments, searchTerm, investmentTypeFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: keyof UserInvestment) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await investmentService.deleteInvestment(id);
      toast({
        title: "Success",
        description: "Investor deleted successfully.",
      });
      loadInvestments();
    } catch (error) {
      console.error("Failed to delete investment:", error);
      toast({
        title: "Error",
        description: "Failed to delete investor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (investor: UserInvestment) => {
    setEditingInvestor(investor);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const isNewlyAdded = (createdAt: string | null) => {
    if (!createdAt) return false;
    const today = new Date();
    const created = new Date(createdAt);
    return today.toDateString() === created.toDateString();
  };

  // Pagination
  const totalPages = Math.ceil(filteredInvestments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvestments = filteredInvestments.slice(startIndex, endIndex);

  const SortableHeader = ({ field, children }: { field: keyof UserInvestment; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3" />
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
    <div className="p-6 space-y-6 bg-background text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Investors</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your investors in one place
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Users className="w-4 h-4 mr-2" />
            Add New Investor
          </Button>
          <Button 
            onClick={handleExportInvestors}
            disabled={exporting || filteredInvestments.length === 0}
            variant="outline"
            className="bg-transparent hover:bg-accent"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Exporting..." : "Export All Investors"}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Select value={investmentTypeFilter} onValueChange={setInvestmentTypeFilter}>
              <SelectTrigger className="bg-input text-foreground">
                <SelectValue placeholder="Investment Type" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="One-time">One-time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-input text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              Total: {filteredInvestments.length} investors
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <Card className="shadow-sm hidden md:block bg-card text-card-foreground">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <SortableHeader field="name">Name</SortableHeader>
                  <SortableHeader field="email">Email</SortableHeader>
                  <SortableHeader field="phone_number">Phone</SortableHeader>
                  <SortableHeader field="invested_amount">Investment</SortableHeader>
                  <SortableHeader field="investment_date">Date</SortableHeader>
                  <SortableHeader field="investment_type">Type</SortableHeader>
                  <TableHead>Return %</TableHead>
                  <TableHead>Monthly Payout</TableHead>
                  <SortableHeader field="upi_transaction_id">UPI ID</SortableHeader>
                  <SortableHeader field="total_paid_out">Total Paid</SortableHeader>
                  <SortableHeader field="status">Status</SortableHeader>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentInvestments.map((investment, index) => (
                  <TableRow 
                    key={investment.id} 
                    className={`
                      ${index % 2 === 0 ? "bg-card" : "bg-muted/50"}
                      ${isNewlyAdded(investment.created_at) ? "bg-green-500/10 border-l-4 border-green-500" : ""}
                      hover:bg-accent transition-colors
                    `}
                  >
                    <TableCell className="font-medium text-foreground">
                      <div>
                        {investment.name}
                        {isNewlyAdded(investment.created_at) && (
                          <Badge variant="secondary" className="ml-2 text-xs bg-green-500/20 text-green-400 border-green-500/30">
                            New Today
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{investment.email}</TableCell>
                    <TableCell className="text-sm text-foreground">{investment.phone_number}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(investment.invested_amount)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(investment.investment_date)}</TableCell>
                    <TableCell>
                      <Badge variant={investment.investment_type === "Monthly" ? "default" : "secondary"}>
                        {investment.investment_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{investment.return_percentage}%</TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {formatCurrency(investment.monthly_payout)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{investment.upi_transaction_id}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      {formatCurrency(investment.total_paid_out)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={investment.status === "Active" ? "default" : "secondary"}>
                        {investment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(investment)}
                          className="bg-transparent hover:bg-accent"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="bg-transparent hover:bg-accent text-destructive-foreground hover:text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card text-card-foreground">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Investor</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Are you sure you want to delete {investment.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent hover:bg-accent">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(investment.id)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
        {currentInvestments.map((investment) => (
          <Card 
            key={investment.id} 
            className={`shadow-sm bg-card text-card-foreground ${isNewlyAdded(investment.created_at) ? "border-l-4 border-green-500 bg-green-500/10" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{investment.name}</h3>
                  {isNewlyAdded(investment.created_at) && (
                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                      New Today
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(investment)} className="bg-transparent hover:bg-accent">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-destructive-foreground hover:text-destructive bg-transparent hover:bg-accent">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card text-card-foreground">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Investor</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Are you sure you want to delete {investment.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent hover:bg-accent">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(investment.id)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium text-foreground">{investment.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium text-foreground">{investment.phone_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Investment:</span>
                  <p className="font-medium text-green-600">{formatCurrency(investment.invested_amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Monthly Payout:</span>
                  <p className="font-medium text-blue-600">{formatCurrency(investment.monthly_payout)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant={investment.investment_type === "Monthly" ? "default" : "secondary"}>
                    {investment.investment_type}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={investment.status === "Active" ? "default" : "secondary"}>
                    {investment.status}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                <p>UPI ID: {investment.upi_transaction_id}</p>
                <p>Date: {formatDate(investment.investment_date)}</p>
                {investment.notes && <p>Notes: {investment.notes}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="shadow-sm bg-card text-card-foreground">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredInvestments.length)} of {filteredInvestments.length} investors
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-transparent hover:bg-accent"
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-primary text-primary-foreground" : "bg-transparent hover:bg-accent"}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-transparent hover:bg-accent"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog / Add Dialog Management */}
      {/* Dialog for Adding Investor */}
      <AddInvestorDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onInvestorAdded={() => {
          loadInvestments();
          setIsAddDialogOpen(false); // Close dialog after adding
        }}
      />

      {/* Dialog for Editing Investor */}
      {editingInvestor && (
        <AddInvestorDialog
          isOpen={!!editingInvestor}
          onOpenChange={(open) => {
            if (!open) setEditingInvestor(null);
          }}
          investorToEdit={editingInvestor} // Corrected prop name
          onInvestorAdded={loadInvestments} // Should be onInvestorUpdated, but AddInvestorDialog handles both via onInvestorAdded/onInvestorUpdated internally
          onInvestorUpdated={() => { // Added for clarity, though AddInvestorDialog might call onInvestorAdded
            loadInvestments();
            setEditingInvestor(null); // Close dialog after editing
          }}
        />
      )}

      {/* Empty State */}
      {filteredInvestments.length === 0 && !loading && (
        <Card className="shadow-sm bg-card text-card-foreground">
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No investors found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || investmentTypeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first investor."}
            </p>
            {!searchTerm && investmentTypeFilter === "all" && statusFilter === "all" && (
               <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">Add First Investor</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
