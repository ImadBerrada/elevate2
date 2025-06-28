"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  Plus, 
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Settings,
  Zap,
  Droplets,
  Thermometer,
  Shield,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  User,
  Phone,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  category: 'HVAC' | 'PLUMBING' | 'ELECTRICAL' | 'GENERAL' | 'SAFETY' | 'APPLIANCE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  status: 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  location: string;
  roomNumber?: string;
  reportedBy: string;
  assignedTo?: string;
  vendor?: string;
  estimatedCost: number;
  actualCost?: number;
  estimatedTime: number; // in hours
  actualTime?: number;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Equipment {
  id: string;
  name: string;
  category: 'HVAC' | 'PLUMBING' | 'ELECTRICAL' | 'KITCHEN' | 'SAFETY' | 'OTHER';
  location: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  installDate: string;
  warrantyExpiry?: string;
  lastMaintenance?: string;
  nextMaintenance: string;
  status: 'OPERATIONAL' | 'NEEDS_ATTENTION' | 'OUT_OF_ORDER' | 'UNDER_MAINTENANCE';
  maintenanceHistory: MaintenanceRecord[];
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
  description: string;
  performedBy: string;
  cost: number;
  nextDue?: string;
}

interface Vendor {
  id: string;
  name: string;
  category: 'HVAC' | 'PLUMBING' | 'ELECTRICAL' | 'GENERAL' | 'CLEANING' | 'SECURITY';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  isPreferred: boolean;
  responseTime: string; // in hours
  hourlyRate?: number;
  lastServiceDate?: string;
  totalJobs: number;
}

export default function MaintenancePage() {
  const { isOpen } = useSidebar();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("work-orders");
  const [isAddWorkOrderOpen, setIsAddWorkOrderOpen] = useState(false);

  // Work order form data
  const [workOrderData, setWorkOrderData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
    location: "",
    roomNumber: "",
    reportedBy: "",
    estimatedCost: "",
    estimatedTime: "",
    scheduledDate: ""
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch work orders
        const workOrdersResponse = await fetch('/api/bridge-retreats/maintenance/work-orders');
        const workOrdersData = await workOrdersResponse.json();
        
        if (workOrdersData.workOrders) {
          const formattedWorkOrders = workOrdersData.workOrders.map((order: any) => ({
            id: order.id,
            title: order.title,
            description: order.description,
            category: order.category,
            priority: order.priority,
            status: order.status,
            location: order.facility?.name || 'Unknown Location',
            roomNumber: order.roomNumber,
            reportedBy: order.reportedBy,
            assignedTo: order.assignedTo,
            vendor: order.vendor,
            estimatedCost: order.estimatedCost || 0,
            actualCost: order.actualCost,
            estimatedTime: order.estimatedTime || 0,
            actualTime: order.actualTime,
            scheduledDate: order.scheduledDate,
            completedDate: order.completedDate,
            notes: order.notes,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          }));
          setWorkOrders(formattedWorkOrders);
        }
        
        // For now, use empty arrays for equipment and vendors until we implement their APIs
        setEquipment([]);
        setVendors([]);
        
      } catch (error) {
        console.error('Error fetching maintenance data:', error);
        setWorkOrders([]);
        setEquipment([]);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();


  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'ON_HOLD':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'OPERATIONAL':
        return 'bg-green-100 text-green-800';
      case 'NEEDS_ATTENTION':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_ORDER':
        return 'bg-red-100 text-red-800';
      case 'UNDER_MAINTENANCE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HVAC':
        return <Thermometer className="w-4 h-4" />;
      case 'PLUMBING':
        return <Droplets className="w-4 h-4" />;
      case 'ELECTRICAL':
        return <Zap className="w-4 h-4" />;
      case 'SAFETY':
        return <Shield className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newWorkOrder: WorkOrder = {
      id: Date.now().toString(),
      title: workOrderData.title,
      description: workOrderData.description,
      category: workOrderData.category as WorkOrder['category'],
      priority: workOrderData.priority as WorkOrder['priority'],
      status: 'OPEN',
      location: workOrderData.location,
      roomNumber: workOrderData.roomNumber || undefined,
      reportedBy: workOrderData.reportedBy,
      estimatedCost: parseFloat(workOrderData.estimatedCost),
      estimatedTime: parseFloat(workOrderData.estimatedTime),
      scheduledDate: workOrderData.scheduledDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setWorkOrders(prev => [newWorkOrder, ...prev]);
    setIsAddWorkOrderOpen(false);
    setWorkOrderData({
      title: "",
      description: "",
      category: "",
      priority: "MEDIUM",
      location: "",
      roomNumber: "",
      reportedBy: "",
      estimatedCost: "",
      estimatedTime: "",
      scheduledDate: ""
    });
  };

  const workOrderColumns = [
    {
      accessorKey: "title",
      header: "Work Order",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          {getCategoryIcon(row.original.category)}
          <div>
            <p className="font-medium">{row.original.title}</p>
            <p className="text-sm text-gray-500">{row.original.category}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }: any) => (
        <div>
          <p>{row.original.location}</p>
          {row.original.roomNumber && (
            <p className="text-sm text-gray-500">Room {row.original.roomNumber}</p>
          )}
        </div>
      )
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: any) => (
        <Badge className={getPriorityColor(row.getValue("priority"))}>
          {row.getValue("priority")}
        </Badge>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.getValue("status"))}>
          {row.getValue("status").replace('_', ' ')}
        </Badge>
      )
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }: any) => row.original.assignedTo || "Unassigned"
    },
    {
      accessorKey: "estimatedCost",
      header: "Est. Cost",
      cell: ({ row }: any) => formatCurrency(row.getValue("estimatedCost"))
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: any) => format(new Date(row.getValue("createdAt")), "MMM dd")
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit Order
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Assign Technician
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const equipmentColumns = [
    {
      accessorKey: "name",
      header: "Equipment",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          {getCategoryIcon(row.original.category)}
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-sm text-gray-500">{row.original.model}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: "location",
      header: "Location"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.getValue("status"))}>
          {row.getValue("status").replace('_', ' ')}
        </Badge>
      )
    },
    {
      accessorKey: "lastMaintenance",
      header: "Last Maintenance",
      cell: ({ row }: any) => {
        const date = row.original.lastMaintenance;
        return date ? format(new Date(date), "MMM dd, yyyy") : "Never";
      }
    },
    {
      accessorKey: "nextMaintenance",
      header: "Next Due",
      cell: ({ row }: any) => {
        const date = new Date(row.getValue("nextMaintenance"));
        const isOverdue = date < new Date();
        return (
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {format(date, "MMM dd, yyyy")}
          </span>
        );
      }
    },
    {
      accessorKey: "warrantyExpiry",
      header: "Warranty",
      cell: ({ row }: any) => {
        const date = row.original.warrantyExpiry;
        if (!date) return "No warranty";
        const expiry = new Date(date);
        const isExpired = expiry < new Date();
        return (
          <span className={isExpired ? "text-red-600" : ""}>
            {format(expiry, "MMM dd, yyyy")}
          </span>
        );
      }
    }
  ];

  const vendorColumns = [
    {
      accessorKey: "name",
      header: "Vendor",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          {getCategoryIcon(row.original.category)}
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-sm text-gray-500">{row.original.category}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: "contactPerson",
      header: "Contact",
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.contactPerson}</p>
          <p className="text-sm text-gray-500">{row.original.phone}</p>
        </div>
      )
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">{row.getValue("rating")}</span>
          <span className="text-yellow-500">★</span>
        </div>
      )
    },
    {
      accessorKey: "responseTime",
      header: "Response Time",
      cell: ({ row }: any) => `${row.getValue("responseTime")} hours`
    },
    {
      accessorKey: "hourlyRate",
      header: "Rate",
      cell: ({ row }: any) => {
        const rate = row.original.hourlyRate;
        return rate ? formatCurrency(rate) + "/hr" : "Quote based";
      }
    },
    {
      accessorKey: "totalJobs",
      header: "Total Jobs"
    },
    {
      accessorKey: "isPreferred",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={row.getValue("isPreferred") ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {row.getValue("isPreferred") ? "Preferred" : "Standard"}
        </Badge>
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
                <h1 className="text-3xl font-bold text-gray-900">Maintenance Management</h1>
                <p className="text-gray-600">Manage work orders, equipment maintenance, and vendor relationships</p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isAddWorkOrderOpen} onOpenChange={setIsAddWorkOrderOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Work Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Work Order</DialogTitle>
                      <DialogDescription>Create a new maintenance work order</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateWorkOrder} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Work Order Title</Label>
                        <Input
                          id="title"
                          value={workOrderData.title}
                          onChange={(e) => setWorkOrderData(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={workOrderData.description}
                          onChange={(e) => setWorkOrderData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select 
                            value={workOrderData.category} 
                            onValueChange={(value) => setWorkOrderData(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HVAC">HVAC</SelectItem>
                              <SelectItem value="PLUMBING">Plumbing</SelectItem>
                              <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                              <SelectItem value="GENERAL">General</SelectItem>
                              <SelectItem value="SAFETY">Safety</SelectItem>
                              <SelectItem value="APPLIANCE">Appliance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select 
                            value={workOrderData.priority} 
                            onValueChange={(value) => setWorkOrderData(prev => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="EMERGENCY">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={workOrderData.location}
                            onChange={(e) => setWorkOrderData(prev => ({ ...prev, location: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="roomNumber">Room Number (Optional)</Label>
                          <Input
                            id="roomNumber"
                            value={workOrderData.roomNumber}
                            onChange={(e) => setWorkOrderData(prev => ({ ...prev, roomNumber: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reportedBy">Reported By</Label>
                          <Input
                            id="reportedBy"
                            value={workOrderData.reportedBy}
                            onChange={(e) => setWorkOrderData(prev => ({ ...prev, reportedBy: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scheduledDate">Scheduled Date (Optional)</Label>
                          <Input
                            id="scheduledDate"
                            type="date"
                            value={workOrderData.scheduledDate}
                            onChange={(e) => setWorkOrderData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="estimatedCost">Estimated Cost (AED)</Label>
                          <Input
                            id="estimatedCost"
                            type="number"
                            value={workOrderData.estimatedCost}
                            onChange={(e) => setWorkOrderData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estimatedTime">Estimated Time (hours)</Label>
                          <Input
                            id="estimatedTime"
                            type="number"
                            value={workOrderData.estimatedTime}
                            onChange={(e) => setWorkOrderData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                            min="0.5"
                            step="0.5"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <Button type="submit">Create Work Order</Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddWorkOrderOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Work Orders</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workOrders.filter(w => w.status === 'OPEN').length}</div>
                  <p className="text-xs text-muted-foreground">
                    {workOrders.filter(w => w.priority === 'HIGH' || w.priority === 'EMERGENCY').length} high priority
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workOrders.filter(w => w.status === 'IN_PROGRESS').length}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently being worked on
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Equipment Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{equipment.filter(e => e.status === 'NEEDS_ATTENTION').length}</div>
                  <p className="text-xs text-muted-foreground">
                    Need maintenance attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(workOrders.reduce((sum, w) => sum + (w.actualCost || w.estimatedCost), 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total maintenance costs
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="work-orders" className="gap-2">
                  <Wrench className="w-4 h-4" />
                  Work Orders
                </TabsTrigger>
                <TabsTrigger value="equipment" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Equipment
                </TabsTrigger>
                <TabsTrigger value="vendors" className="gap-2">
                  <User className="w-4 h-4" />
                  Vendors
                </TabsTrigger>
              </TabsList>

              {/* Work Orders Tab */}
              <TabsContent value="work-orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Work Orders</CardTitle>
                    <CardDescription>Track and manage all maintenance work orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={workOrderColumns}
                      data={workOrders}
                      searchKey="title"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Equipment Tab */}
              <TabsContent value="equipment">
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Management</CardTitle>
                    <CardDescription>Monitor equipment status and maintenance schedules</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={equipmentColumns}
                      data={equipment}
                      searchKey="name"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vendors Tab */}
              <TabsContent value="vendors">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendor Management</CardTitle>
                    <CardDescription>Manage relationships with maintenance service providers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={vendorColumns}
                      data={vendors}
                      searchKey="name"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
} 