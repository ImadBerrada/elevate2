"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  Plus, 
  FileText, 
  Download, 
  Send, 
  DollarSign,
  CreditCard,
  Users,
  Building,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Receipt,
  Building2,
  ExternalLink,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'GUEST' | 'VENDOR';
  recipientName: string;
  recipientEmail: string;
  recipientAddress: string;
  bookingId?: string;
  retreatType?: string;
  retreatTitle?: string;
  category?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalPrice: number;
}

interface InvoiceMetrics {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  invoiceCount: number;
}

interface InvoiceApiResponse {
  invoices: Invoice[];
  metrics: InvoiceMetrics;
  statusBreakdown: {
    DRAFT: number;
    SENT: number;
    PAID: number;
    OVERDUE: number;
  };
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function InvoicesPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const [data, setData] = useState<InvoiceApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Dialog states
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);
  
  // Filters
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Form data
  const [invoiceForm, setInvoiceForm] = useState({
    type: 'GUEST' as 'GUEST' | 'VENDOR',
    recipientName: "",
    recipientEmail: "",
    recipientAddress: "",
    bookingId: "",
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 5 }],
    notes: ""
  });

  useEffect(() => {
    fetchInvoicesData();
  }, [statusFilter, typeFilter, activeTab]);

  const fetchInvoicesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        period: '30d',
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(typeFilter !== 'ALL' && { type: typeFilter })
      });

      const response = await fetch(`/api/bridge-retreats/finance/transactions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices data');
      }
      
      const transactionData = await response.json();
      
      // Transform transaction data to invoice format
      const transformedInvoices = transactionData.transactions.map((transaction: any) => ({
        id: transaction.id,
        invoiceNumber: transaction.type === 'INCOME' ? `INV-G-${transaction.id.slice(-6).toUpperCase()}` : `INV-V-${transaction.id.slice(-6).toUpperCase()}`,
        type: transaction.type === 'INCOME' ? 'GUEST' : 'VENDOR',
        recipientName: transaction.guest?.name || transaction.facility?.name || 'Unknown',
        recipientEmail: transaction.guest?.email || 'contact@vendor.com',
        recipientAddress: 'Address not provided',
        bookingId: transaction.bookingId,
        retreatType: transaction.retreat?.type,
        retreatTitle: transaction.retreat?.title,
        category: transaction.category,
        issueDate: transaction.date,
        dueDate: format(new Date(new Date(transaction.date).getTime() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        items: [{
          id: '1',
          description: transaction.description || 'Service/Product',
          quantity: 1,
          unitPrice: transaction.amount,
          taxRate: 5,
          totalPrice: transaction.amount
        }],
        subtotal: transaction.amount / 1.05,
        taxAmount: transaction.amount * 0.05 / 1.05,
        discountAmount: 0,
        totalAmount: transaction.amount,
        status: transaction.status === 'COMPLETED' ? 'PAID' : 
                transaction.status === 'PENDING' ? 'SENT' : 'DRAFT',
        paymentMethod: transaction.type === 'INCOME' ? 'Credit Card' : 'Bank Transfer',
        paymentDate: transaction.status === 'COMPLETED' ? transaction.date : null,
        notes: transaction.reference || '',
        createdAt: transaction.date,
        updatedAt: transaction.date
      }));

      // Calculate metrics
      const totalInvoiced = transformedInvoices.reduce((sum: number, inv: Invoice) => sum + inv.totalAmount, 0);
      const totalPaid = transformedInvoices.filter((inv: Invoice) => inv.status === 'PAID').reduce((sum: number, inv: Invoice) => sum + inv.totalAmount, 0);
      const totalPending = transformedInvoices.filter((inv: Invoice) => inv.status === 'SENT').reduce((sum: number, inv: Invoice) => sum + inv.totalAmount, 0);
      const totalOverdue = transformedInvoices.filter((inv: Invoice) => {
        const dueDate = new Date(inv.dueDate);
        return inv.status !== 'PAID' && dueDate < new Date();
      }).reduce((sum: number, inv: Invoice) => sum + inv.totalAmount, 0);

      const statusBreakdown = {
        DRAFT: transformedInvoices.filter((inv: Invoice) => inv.status === 'DRAFT').length,
        SENT: transformedInvoices.filter((inv: Invoice) => inv.status === 'SENT').length,
        PAID: transformedInvoices.filter((inv: Invoice) => inv.status === 'PAID').length,
        OVERDUE: transformedInvoices.filter((inv: Invoice) => {
          const dueDate = new Date(inv.dueDate);
          return inv.status !== 'PAID' && dueDate < new Date();
        }).length
      };

      setData({
        invoices: transformedInvoices,
        metrics: {
          totalInvoiced,
          totalPaid,
          totalPending,
          totalOverdue,
          invoiceCount: transformedInvoices.length
        },
        statusBreakdown,
        period: '30d',
        dateRange: transactionData.dateRange
      });
      
    } catch (err) {
      console.error('Error fetching invoices data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      setSuccess(null);
      await fetchInvoicesData();
      setSuccess('Invoices data refreshed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/bridge-retreats/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: invoiceForm.type === 'GUEST' ? 'INCOME' : 'EXPENSE',
          category: invoiceForm.type === 'GUEST' ? 'RETREAT_BOOKING' : 'PROFESSIONAL_SERVICES',
          amount: invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (1 + item.taxRate / 100)), 0),
          description: `${invoiceForm.recipientName} - ${invoiceForm.items[0]?.description || 'Service'}`,
          status: 'PENDING',
          reference: `INV-${invoiceForm.type.charAt(0)}-${Date.now()}`,
          bookingId: invoiceForm.bookingId || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      setSuccess('Invoice created successfully');
      setIsCreateInvoiceOpen(false);
      
      // Reset form
      setInvoiceForm({
        type: 'GUEST',
        recipientName: "",
        recipientEmail: "",
        recipientAddress: "",
        bookingId: "",
        dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 5 }],
        notes: ""
      });

      // Refresh data
      await fetchInvoicesData();
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Failed to create invoice. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      setUpdating(invoiceId);
      setError(null);

      const response = await fetch('/api/bridge-retreats/finance/transactions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: invoiceId,
          status: status === 'PAID' ? 'COMPLETED' : 'PENDING'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }

      setSuccess(`Invoice ${status.toLowerCase()} successfully`);
      await fetchInvoicesData();
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Error updating invoice status:', err);
      setError('Failed to update invoice status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'SENT':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'OVERDUE':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'DRAFT':
        return <FileText className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const addInvoiceItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0, taxRate: 5 }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Filter invoices based on search query
  const filteredInvoices = data?.invoices.filter(invoice => {
    const matchesSearch = searchQuery === "" || 
      invoice.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.retreatTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "guest" && invoice.type === "GUEST") ||
      (activeTab === "vendor" && invoice.type === "VENDOR");
    
    return matchesSearch && matchesTab;
  }) || [];

  // Define table columns
  const columns = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }: any) => (
        <div className="font-mono text-sm">{row.getValue("invoiceNumber")}</div>
      )
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => (
        <Badge variant={row.getValue("type") === "GUEST" ? "default" : "secondary"}>
          {row.getValue("type")}
        </Badge>
      )
    },
    {
      accessorKey: "recipientName",
      header: "Recipient",
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue("recipientName")}</div>
          <div className="text-sm text-muted-foreground">{row.original.recipientEmail}</div>
        </div>
      )
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }: any) => formatDate(row.getValue("issueDate"))
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }: any) => formatDate(row.getValue("dueDate"))
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }: any) => (
        <div className="font-semibold">{formatCurrency(row.getValue("totalAmount"))}</div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Badge className={getStatusColor(status)}>
              {status}
            </Badge>
          </div>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedInvoice(row.original);
              setIsInvoiceDetailOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.original.status === 'SENT' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdateInvoiceStatus(row.original.id, 'PAID')}
              disabled={updating === row.original.id}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isDesktop && isOpen ? "ml-0" : "ml-0",
          "min-w-0"
        )}>
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading invoices data...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0"
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <motion.div 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0"
            {...fadeInUp}
          >
            <div>
              <h1 className="text-3xl font-prestigious text-gradient">Invoice Management</h1>
              <p className="text-refined text-muted-foreground mt-1">
                Manage guest and vendor invoices
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                Refresh
              </Button>
              
              <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                      Generate a new invoice for guest bookings or vendor payments
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateInvoice} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Invoice Type</Label>
                        <Select 
                          value={invoiceForm.type} 
                          onValueChange={(value: 'GUEST' | 'VENDOR') => setInvoiceForm(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GUEST">Guest Invoice</SelectItem>
                            <SelectItem value="VENDOR">Vendor Invoice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Recipient Name</Label>
                        <Input
                          value={invoiceForm.recipientName}
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, recipientName: e.target.value }))}
                          placeholder="Enter recipient name"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={invoiceForm.recipientEmail}
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={invoiceForm.dueDate}
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Textarea
                        value={invoiceForm.recipientAddress}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, recipientAddress: e.target.value }))}
                        placeholder="Enter recipient address"
                        rows={2}
                      />
                    </div>

                    {invoiceForm.type === 'GUEST' && (
                      <div className="space-y-2">
                        <Label>Booking ID (Optional)</Label>
                        <Input
                          value={invoiceForm.bookingId}
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, bookingId: e.target.value }))}
                          placeholder="Enter booking ID if applicable"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Invoice Items</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                      
                      {invoiceForm.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-5">
                            <Label className="text-xs">Description</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                              placeholder="Item description"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Qty</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              min="1"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Unit Price</Label>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Tax %</Label>
                            <Input
                              type="number"
                              value={item.taxRate}
                              onChange={(e) => updateInvoiceItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                              step="0.1"
                            />
                          </div>
                          <div className="col-span-1">
                            {invoiceForm.items.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeInvoiceItem(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        value={invoiceForm.notes}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes or terms"
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateInvoiceOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={creating}>
                        {creating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Invoice
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Success/Error Messages */}
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
            >
              {success}
            </motion.div>
          )}
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
            >
              {error}
            </motion.div>
          )}

          {data && (
            <>
              {/* Metrics Cards */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={staggerChildren}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={fadeInUp}>
                  <Card className="card-premium">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gradient">{formatCurrency(data.metrics.totalInvoiced)}</div>
                      <p className="text-xs text-muted-foreground">
                        {data.metrics.invoiceCount} invoices
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Card className="card-premium">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(data.metrics.totalPaid)}</div>
                      <p className="text-xs text-muted-foreground">
                        {data.statusBreakdown.PAID} paid invoices
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Card className="card-premium">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(data.metrics.totalPending)}</div>
                      <p className="text-xs text-muted-foreground">
                        {data.statusBreakdown.SENT} pending invoices
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Card className="card-premium">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{formatCurrency(data.metrics.totalOverdue)}</div>
                      <p className="text-xs text-muted-foreground">
                        {data.statusBreakdown.OVERDUE} overdue invoices
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Filters and Tabs */}
              <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                <Card className="card-premium mb-6">
                  <CardHeader>
                    <CardTitle className="font-elegant">Invoice Management</CardTitle>
                    <CardDescription>
                      Filter and manage all invoices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All Invoices</TabsTrigger>
                        <TabsTrigger value="guest">Guest Invoices</TabsTrigger>
                        <TabsTrigger value="vendor">Vendor Invoices</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="SENT">Sent</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="OVERDUE">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Type</Label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="GUEST">Guest</SelectItem>
                            <SelectItem value="VENDOR">Vendor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Search</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search invoices..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStatusFilter("ALL");
                          setTypeFilter("ALL");
                          setSearchQuery("");
                        }}
                      >
                        Clear Filters
                      </Button>
                      <div className="flex space-x-2">
                        <Link href="/bridge-retreats/finance/dashboard">
                          <Button variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Finance Dashboard
                          </Button>
                        </Link>
                        <Link href="/bridge-retreats/finance/transactions">
                          <Button variant="outline">
                            <Receipt className="h-4 w-4 mr-2" />
                            View Transactions
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Invoices Data Table */}
              <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="font-elegant">Invoice Details</CardTitle>
                    <CardDescription>
                      Showing {filteredInvoices.length} of {data.invoices.length} invoices for {data.period}
                      {data.dateRange && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({formatDate(data.dateRange.start)} - {formatDate(data.dateRange.end)})
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={columns}
                      data={filteredInvoices}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                className="mt-8 flex flex-wrap gap-4 justify-center"
                {...fadeInUp}
                transition={{ delay: 0.5 }}
              >
                <Link href="/bridge-retreats/bookings">
                  <Button variant="outline">
                    <Building2 className="h-4 w-4 mr-2" />
                    View Bookings
                  </Button>
                </Link>
                <Link href="/bridge-retreats/revenue">
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Revenue Analytics
                  </Button>
                </Link>
                <Link href="/bridge-retreats/expenses">
                  <Button variant="outline">
                    <Receipt className="h-4 w-4 mr-2" />
                    View Expenses
                  </Button>
                </Link>
              </motion.div>
            </>
          )}

          {/* Invoice Detail Dialog */}
          <Dialog open={isInvoiceDetailOpen} onOpenChange={setIsInvoiceDetailOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Invoice Details</DialogTitle>
                <DialogDescription>
                  Complete information about this invoice
                </DialogDescription>
              </DialogHeader>
              {selectedInvoice && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Invoice Number</Label>
                      <p className="font-mono">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Type</Label>
                      <Badge variant={selectedInvoice.type === "GUEST" ? "default" : "secondary"}>
                        {selectedInvoice.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Recipient</Label>
                    <p className="font-medium">{selectedInvoice.recipientName}</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.recipientEmail}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Issue Date</Label>
                      <p>{formatDate(selectedInvoice.issueDate)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                      <p>{formatDate(selectedInvoice.dueDate)}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Items</Label>
                    <div className="mt-2 space-y-2">
                      {selectedInvoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × {formatCurrency(item.unitPrice)} (Tax: {item.taxRate}%)
                            </p>
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedInvoice.status)}
                        <Badge className={getStatusColor(selectedInvoice.status)}>
                          {selectedInvoice.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
                      <p className="font-semibold text-lg">{formatCurrency(selectedInvoice.totalAmount)}</p>
                    </div>
                  </div>

                  {selectedInvoice.paymentMethod && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Payment Method</Label>
                      <p>{selectedInvoice.paymentMethod}</p>
                    </div>
                  )}

                  {selectedInvoice.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Notes</Label>
                      <p>{selectedInvoice.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
} 