"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wrench, 
  Calendar, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Settings,
  TrendingUp,
  Menu,
  MoreHorizontal,
  Package,
  Trash2,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/contexts/sidebar-context";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

interface Property {
  id: string;
  name: string;
  address: string;
  propertyType: {
    name: string;
  };
}

interface Appliance {
  id: string;
  name: string;
  brand: string;
  model: string;
  property: Property;
  category: string;
  condition: string;
}

interface MaintenanceTask {
  id: string;
  applianceId: string;
  appliance: string;
  property: string;
  type: string;
  priority: string;
  status: string;
  scheduledDate: string;
  technician: string;
  estimatedDuration: string;
  cost: number;
  description: string;
  completedDate?: string;
  notes?: string;
}

interface Technician {
  name: string;
  specialty: string;
  activeJobs: number;
  rating: number;
  completedJobs: number;
}

export default function ApplianceMaintenance() {
  const { toggle: toggleSidebar } = useSidebar();
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // URL parameters for cross-page navigation
  const [urlParams, setUrlParams] = useState({
    appliance: '',
    property: '',
    createFor: ''
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  
  // Modal states
  const [isNewMaintenanceOpen, setIsNewMaintenanceOpen] = useState(false);
  const [isEditMaintenanceOpen, setIsEditMaintenanceOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  
  // Form data
  const [newMaintenanceData, setNewMaintenanceData] = useState({
    applianceId: "",
    propertyId: "",
    type: "Preventive",
    priority: "medium",
    status: "scheduled",
    scheduledDate: "",
    technician: "",
    estimatedDuration: "",
    cost: "",
    description: "",
    notes: ""
  });

  // Mock technicians data (could be moved to API later)
  const technicians: Technician[] = [
    {
      name: "Ahmed Hassan",
      specialty: "HVAC Systems",
      activeJobs: 3,
      rating: 4.8,
      completedJobs: 156
    },
    {
      name: "Omar Al-Rashid",
      specialty: "Elevator Maintenance",
      activeJobs: 2,
      rating: 4.9,
      completedJobs: 89
    },
    {
      name: "Sarah Johnson",
      specialty: "Kitchen Equipment",
      activeJobs: 4,
      rating: 4.7,
      completedJobs: 203
    },
    {
      name: "David Chen",
      specialty: "Pool & Water Systems",
      activeJobs: 1,
      rating: 4.6,
      completedJobs: 78
    }
  ];

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const appliance = params.get('appliance') || '';
    const property = params.get('property') || '';
    const createFor = params.get('createFor') || '';
    
    setUrlParams({ appliance, property, createFor });
    
    // Set filters based on URL params
    if (appliance) {
      // Filter will be applied in the filtering logic
    }
    if (property) {
      setPropertyFilter(property);
    }
    
    fetchData();
    
    // Auto-open maintenance creation if createFor parameter exists
    if (createFor) {
      setNewMaintenanceData(prev => ({
        ...prev,
        applianceId: createFor,
        propertyId: property
      }));
      setIsNewMaintenanceOpen(true);
      setSuccess('Ready to schedule maintenance for selected appliance');
      setTimeout(() => setSuccess(null), 3000);
    }
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchMaintenanceTasks(),
      fetchAppliances(),
      fetchProperties()
    ]);
    setLoading(false);
  };

  const fetchMaintenanceTasks = async () => {
    try {
      const response = await fetch('/api/real-estate/appliance-maintenance');
      const data = await response.json();
      
      if (data.success) {
        setMaintenanceTasks(data.maintenanceTasks);
      } else {
        setError('Failed to fetch maintenance tasks');
      }
    } catch (error) {
      setError('Failed to fetch maintenance tasks');
      console.error('Error fetching maintenance tasks:', error);
    }
  };

  const fetchAppliances = async () => {
    try {
      const response = await fetch('/api/real-estate/appliances');
      const data = await response.json();
      
      if (data.success) {
        setAppliances(data.appliances);
      } else {
        setError('Failed to fetch appliances');
      }
    } catch (error) {
      setError('Failed to fetch appliances');
      console.error('Error fetching appliances:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/real-estate/properties');
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.properties);
      } else {
        setError('Failed to fetch properties');
      }
    } catch (error) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', error);
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/real-estate/appliance-maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newMaintenanceData,
          cost: newMaintenanceData.cost ? parseFloat(newMaintenanceData.cost) : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchMaintenanceTasks();
        setIsNewMaintenanceOpen(false);
        setNewMaintenanceData({
          applianceId: "",
          propertyId: "",
          type: "Preventive",
          priority: "medium",
          status: "scheduled",
          scheduledDate: "",
          technician: "",
          estimatedDuration: "",
          cost: "",
          description: "",
          notes: ""
        });
        setSuccess('Maintenance task scheduled successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to create maintenance task');
      }
    } catch (error) {
      setError('Failed to create maintenance task');
      console.error('Error creating maintenance task:', error);
    }
  };

  const handleDeleteMaintenance = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this maintenance task?')) return;
    
    try {
      const response = await fetch(`/api/real-estate/appliance-maintenance/${taskId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchMaintenanceTasks();
        setSuccess('Maintenance task deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to delete maintenance task');
      }
    } catch (error) {
      setError('Failed to delete maintenance task');
      console.error('Error deleting maintenance task:', error);
    }
  };

  // Filtering logic
  const filteredMaintenanceTasks = maintenanceTasks.filter((task) => {
    const matchesSearch = 
      task.appliance.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    const matchesProperty = propertyFilter === "all" || task.property === propertyFilter;
    
    // URL parameter filtering
    const matchesUrlAppliance = !urlParams.appliance || task.appliance.toLowerCase().includes(urlParams.appliance.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesProperty && matchesUrlAppliance;
  });

  // Statistics
  const stats = {
    total: maintenanceTasks.length,
    scheduled: maintenanceTasks.filter(t => t.status === 'scheduled').length,
    inProgress: maintenanceTasks.filter(t => t.status === 'in-progress').length,
    pending: maintenanceTasks.filter(t => t.status === 'pending').length,
    completed: maintenanceTasks.filter(t => t.status === 'completed').length,
    urgent: maintenanceTasks.filter(t => t.priority === 'urgent').length,
    totalCost: maintenanceTasks.reduce((sum, t) => sum + (t.cost || 0), 0)
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in-progress": return "text-blue-600";
      case "scheduled": return "text-purple-600";
      case "pending": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "scheduled": return "bg-purple-100 text-purple-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "in-progress": return Wrench;
      case "scheduled": return Calendar;
      case "pending": return Clock;
      default: return Clock;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Preventive": return "text-blue-600";
      case "Corrective": return "text-orange-600";
      case "Emergency": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <Wrench className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
            <p className="mt-4 text-gray-600">Loading maintenance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden relative">
        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-indigo-400/5"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full overflow-y-auto">
          {/* Compact Header */}
          <motion.div 
            className="bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="lg:hidden"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent">
                      Appliance Maintenance
                    </h1>
                    <p className="text-sm text-gray-600">
                      {filteredMaintenanceTasks.length} of {maintenanceTasks.length} maintenance tasks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Controls
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="p-4">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Search</Label>
                            <div className="relative mt-1">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search maintenance tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Status</SelectItem>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Priority</Label>
                              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Priority</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-sm font-medium">Type</Label>
                              <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Types</SelectItem>
                                  <SelectItem value="Preventive">Preventive</SelectItem>
                                  <SelectItem value="Corrective">Corrective</SelectItem>
                                  <SelectItem value="Emergency">Emergency</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Property</Label>
                              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Properties</SelectItem>
                                  {properties.map((prop) => (
                                    <SelectItem key={prop.id} value={prop.name}>
                                      {prop.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="p-2">
                        <Button
                          onClick={() => window.location.href = '/real-estate/appliances/inventory'}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          View Inventory
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    onClick={() => setIsNewMaintenanceOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="p-6">
            {/* Statistics Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeInUp}>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Scheduled</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">In Progress</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                      </div>
                      <Wrench className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Urgent</p>
                        <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Cost</p>
                        <p className="text-2xl font-bold text-green-600">${stats.totalCost.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Maintenance Tasks */}
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Maintenance Schedule
                  </CardTitle>
                  <CardDescription>
                    Manage appliance maintenance tasks and schedules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredMaintenanceTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No maintenance tasks found</h3>
                      <p className="text-gray-600 mb-4">
                        {maintenanceTasks.length === 0 
                          ? "Start by scheduling your first maintenance task."
                          : "Try adjusting your filters to see more results."
                        }
                      </p>
                      <Button 
                        onClick={() => setIsNewMaintenanceOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Maintenance
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredMaintenanceTasks.map((task, index) => {
                        const StatusIcon = getStatusIcon(task.status);
                        return (
                          <motion.div 
                            key={task.id}
                            className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                  <StatusIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg">{task.id}</h3>
                                    <Badge className={getPriorityBg(task.priority)}>
                                      {task.priority}
                                    </Badge>
                                    <Badge className={getStatusBg(task.status)}>
                                      {task.status}
                                    </Badge>
                                    <Badge variant="outline">
                                      {task.type}
                                    </Badge>
                                  </div>
                                  <p className="font-medium text-gray-900 mb-1">{task.appliance}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                    <span>{task.property}</span>
                                    <span>•</span>
                                    <span>Technician: {task.technician}</span>
                                    <span>•</span>
                                    <span>Duration: {task.estimatedDuration}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">{task.description}</p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                                  <div>
                                    <p className="text-sm text-gray-600">Scheduled Date</p>
                                    <p className="font-semibold">{new Date(task.scheduledDate).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Estimated Cost</p>
                                    <p className="text-lg font-bold text-green-600">${task.cost?.toLocaleString()}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Task
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteMaintenance(task.id)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Task
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* New Maintenance Dialog */}
        <Dialog open={isNewMaintenanceOpen} onOpenChange={setIsNewMaintenanceOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Maintenance</DialogTitle>
              <DialogDescription>
                Create a new maintenance task for an appliance
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMaintenance} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Appliance</Label>
                  <Select 
                    value={newMaintenanceData.applianceId} 
                    onValueChange={(value) => setNewMaintenanceData(prev => ({ ...prev, applianceId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select appliance" />
                    </SelectTrigger>
                    <SelectContent>
                      {appliances.map((appliance) => (
                        <SelectItem key={appliance.id} value={appliance.id}>
                          {appliance.name} - {appliance.brand} {appliance.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Property</Label>
                  <Select 
                    value={newMaintenanceData.propertyId} 
                    onValueChange={(value) => setNewMaintenanceData(prev => ({ ...prev, propertyId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={newMaintenanceData.type} 
                    onValueChange={(value) => setNewMaintenanceData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Preventive">Preventive</SelectItem>
                      <SelectItem value="Corrective">Corrective</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={newMaintenanceData.priority} 
                    onValueChange={(value) => setNewMaintenanceData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={newMaintenanceData.status} 
                    onValueChange={(value) => setNewMaintenanceData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Scheduled Date</Label>
                  <Input
                    type="date"
                    value={newMaintenanceData.scheduledDate}
                    onChange={(e) => setNewMaintenanceData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Estimated Duration</Label>
                  <Input
                    placeholder="e.g., 2 hours"
                    value={newMaintenanceData.estimatedDuration}
                    onChange={(e) => setNewMaintenanceData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Estimated Cost</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newMaintenanceData.cost}
                    onChange={(e) => setNewMaintenanceData(prev => ({ ...prev, cost: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Technician</Label>
                <Select 
                  value={newMaintenanceData.technician} 
                  onValueChange={(value) => setNewMaintenanceData(prev => ({ ...prev, technician: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.name} value={tech.name}>
                        {tech.name} - {tech.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the maintenance work to be performed..."
                  value={newMaintenanceData.description}
                  onChange={(e) => setNewMaintenanceData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Additional notes or special instructions..."
                  value={newMaintenanceData.notes}
                  onChange={(e) => setNewMaintenanceData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsNewMaintenanceOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  Schedule Maintenance
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 