"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  Plus, 
  Receipt, 
  Download, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Building2,
  Target,
  Activity,
  Loader2,
  Filter,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Expense {
  id: string;
  roomId: string;
  roomName: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  vendor: string;
  receiptUrl?: string;
  approvedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  budgetLimit?: number;
}

interface Room {
  id: string;
  name: string;
  type: string;
}

const expenseCategories: ExpenseCategory[] = [
  { id: '1', name: 'Maintenance', description: 'Room maintenance and repairs', budgetLimit: 5000 },
  { id: '2', name: 'Cleaning', description: 'Cleaning supplies and services', budgetLimit: 2000 },
  { id: '3', name: 'Utilities', description: 'Electricity, water, gas', budgetLimit: 3000 },
  { id: '4', name: 'Amenities', description: 'Guest amenities and supplies', budgetLimit: 1500 },
  { id: '5', name: 'Food & Beverage', description: 'Kitchen supplies and refreshments', budgetLimit: 4000 },
  { id: '6', name: 'Technology', description: 'IT equipment and software', budgetLimit: 2500 },
  { id: '7', name: 'Marketing', description: 'Promotional materials and advertising', budgetLimit: 3000 },
  { id: '8', name: 'Other', description: 'Miscellaneous expenses' }
];

export default function ExpensesPage() {
  const { isOpen } = useSidebar();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isExpenseDetailOpen, setIsExpenseDetailOpen] = useState(false);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Form data
  const [expenseData, setExpenseData] = useState({
    roomId: "",
    category: "",
    description: "",
    amount: "",
    vendor: "",
    receiptUrl: "",
    date: format(new Date(), "yyyy-MM-dd")
  });

  // Mock data
  useEffect(() => {
    const mockRooms: Room[] = [
      { id: '1', name: 'Meditation Hall', type: 'Common Area' },
      { id: '2', name: 'Yoga Studio', type: 'Activity Room' },
      { id: '3', name: 'Guest Room 101', type: 'Accommodation' },
      { id: '4', name: 'Guest Room 102', type: 'Accommodation' },
      { id: '5', name: 'Kitchen', type: 'Service Area' },
      { id: '6', name: 'Dining Hall', type: 'Common Area' }
    ];

    const mockExpenses: Expense[] = [
      {
        id: '1',
        roomId: '1',
        roomName: 'Meditation Hall',
        category: 'Maintenance',
        description: 'Air conditioning repair',
        amount: 850,
        currency: 'AED',
        date: '2024-01-15',
        vendor: 'Cool Air Services',
        receiptUrl: '/receipts/receipt-1.pdf',
        approvedBy: 'John Manager',
        status: 'APPROVED',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        roomId: '2',
        roomName: 'Yoga Studio',
        category: 'Cleaning',
        description: 'Professional carpet cleaning',
        amount: 450,
        currency: 'AED',
        date: '2024-01-12',
        vendor: 'Clean Pro',
        status: 'PENDING',
        createdAt: '2024-01-12T14:30:00Z',
        updatedAt: '2024-01-12T14:30:00Z'
      },
      {
        id: '3',
        roomId: '5',
        roomName: 'Kitchen',
        category: 'Amenities',
        description: 'Kitchen utensils and supplies',
        amount: 320,
        currency: 'AED',
        date: '2024-01-10',
        vendor: 'Kitchen Supplies Co',
        receiptUrl: '/receipts/receipt-3.pdf',
        status: 'APPROVED',
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-10T09:15:00Z'
      },
      {
        id: '4',
        roomId: '1',
        roomName: 'Meditation Hall',
        category: 'Utilities',
        description: 'Monthly electricity bill',
        amount: 1200,
        currency: 'AED',
        date: '2024-01-08',
        vendor: 'DEWA',
        status: 'APPROVED',
        createdAt: '2024-01-08T11:00:00Z',
        updatedAt: '2024-01-08T11:00:00Z'
      }
    ];

    setRooms(mockRooms);
    setExpenses(mockExpenses);
    setLoading(false);
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const room = rooms.find(r => r.id === expenseData.roomId);
    if (!room) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      roomId: expenseData.roomId,
      roomName: room.name,
      category: expenseData.category,
      description: expenseData.description,
      amount: parseFloat(expenseData.amount),
      currency: 'AED',
      date: expenseData.date,
      vendor: expenseData.vendor,
      receiptUrl: expenseData.receiptUrl || undefined,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setExpenses(prev => [newExpense, ...prev]);
    setIsAddExpenseOpen(false);
    
    // Reset form
    setExpenseData({
      roomId: "",
      category: "",
      description: "",
      amount: "",
      vendor: "",
      receiptUrl: "",
      date: format(new Date(), "yyyy-MM-dd")
    });
  };

  const handleApproveExpense = (expenseId: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === expenseId 
        ? { ...expense, status: 'APPROVED' as const, approvedBy: 'Current User', updatedAt: new Date().toISOString() }
        : expense
    ));
  };

  const handleRejectExpense = (expenseId: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === expenseId 
        ? { ...expense, status: 'REJECTED' as const, updatedAt: new Date().toISOString() }
        : expense
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Receipt className="w-4 h-4 text-gray-600" />;
    }
  };

  // Filter data
  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = categoryFilter === "ALL" || expense.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || expense.status === statusFilter;
    const matchesRoom = roomFilter === "ALL" || expense.roomId === roomFilter;
    const matchesSearch = searchQuery === "" || 
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.roomName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesRoom && matchesSearch;
  });

  // Calculate summary statistics
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedExpenses = filteredExpenses.filter(expense => expense.status === 'APPROVED').reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = filteredExpenses.filter(expense => expense.status === 'PENDING').reduce((sum, expense) => sum + expense.amount, 0);

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: any) => format(new Date(row.getValue("date")), "MMM dd, yyyy")
    },
    {
      accessorKey: "roomName",
      header: "Room/Area"
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.getValue("category")}</Badge>
      )
    },
    {
      accessorKey: "description",
      header: "Description"
    },
    {
      accessorKey: "vendor",
      header: "Vendor"
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => formatCurrency(row.getValue("amount"))
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.getValue("status"))}
          <Badge className={getStatusColor(row.getValue("status"))}>
            {row.getValue("status")}
          </Badge>
        </div>
      )
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
              setSelectedExpense(row.original);
              setIsExpenseDetailOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.original.receiptUrl && (
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          )}
          {row.original.status === 'PENDING' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApproveExpense(row.original.id)}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRejectExpense(row.original.id)}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className={cn("flex-1 flex flex-col overflow-hidden", isOpen ? "lg:ml-64" : "lg:ml-20")}>
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
                <p className="text-gray-600">Track all expenses per room, manage receipts, and monitor budgets</p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Expense</DialogTitle>
                      <DialogDescription>
                        Record a new expense for room maintenance, supplies, or services
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateExpense} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="roomId">Room/Area</Label>
                          <Select 
                            value={expenseData.roomId} 
                            onValueChange={(value) => setExpenseData(prev => ({ ...prev, roomId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                            <SelectContent>
                              {rooms.map((room) => (
                                <SelectItem key={room.id} value={room.id}>
                                  {room.name} ({room.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select 
                            value={expenseData.category} 
                            onValueChange={(value) => setExpenseData(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {expenseCategories.map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={expenseData.description}
                          onChange={(e) => setExpenseData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the expense..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (AED)</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={expenseData.amount}
                            onChange={(e) => setExpenseData(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vendor">Vendor</Label>
                          <Input
                            id="vendor"
                            value={expenseData.vendor}
                            onChange={(e) => setExpenseData(prev => ({ ...prev, vendor: e.target.value }))}
                            placeholder="Vendor name"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={expenseData.date}
                          onChange={(e) => setExpenseData(prev => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="receiptUrl">Receipt URL (Optional)</Label>
                        <Input
                          id="receiptUrl"
                          value={expenseData.receiptUrl}
                          onChange={(e) => setExpenseData(prev => ({ ...prev, receiptUrl: e.target.value }))}
                          placeholder="Upload receipt or enter URL"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <Button type="submit">Add Expense</Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                  <p className="text-xs text-muted-foreground">
                    {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(approvedExpenses)}</div>
                  <p className="text-xs text-muted-foreground">
                    {filteredExpenses.filter(e => e.status === 'APPROVED').length} approved
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(pendingExpenses)}</div>
                  <p className="text-xs text-muted-foreground">
                    {filteredExpenses.filter(e => e.status === 'PENDING').length} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{expenseCategories.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Expense categories
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={roomFilter} onValueChange={setRoomFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Rooms</SelectItem>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Expenses Table */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Records</CardTitle>
                <CardDescription>Complete list of all recorded expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={filteredExpenses}
                  searchKey="description"
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Expense Detail Modal */}
      <Dialog open={isExpenseDetailOpen} onOpenChange={setIsExpenseDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>
              {selectedExpense && `${selectedExpense.category} - ${selectedExpense.roomName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Room/Area</Label>
                  <p className="text-sm">{selectedExpense.roomName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Category</Label>
                  <p className="text-sm">{selectedExpense.category}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-sm">{selectedExpense.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Amount</Label>
                  <p className="text-sm font-medium">{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Vendor</Label>
                  <p className="text-sm">{selectedExpense.vendor}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date</Label>
                  <p className="text-sm">{format(new Date(selectedExpense.date), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedExpense.status)}
                    <Badge className={getStatusColor(selectedExpense.status)}>
                      {selectedExpense.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {selectedExpense.approvedBy && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Approved By</Label>
                  <p className="text-sm">{selectedExpense.approvedBy}</p>
                </div>
              )}
              
              {selectedExpense.receiptUrl && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Receipt</Label>
                  <Button variant="outline" size="sm" className="mt-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2 pt-4">
                {selectedExpense.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => {
                        handleApproveExpense(selectedExpense.id);
                        setIsExpenseDetailOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleRejectExpense(selectedExpense.id);
                        setIsExpenseDetailOpen(false);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setIsExpenseDetailOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 