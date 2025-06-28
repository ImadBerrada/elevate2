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
  CheckCircle,
  Clock,
  AlertTriangle,
  Bed,
  Package,
  User,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  ClipboardList,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: 'CLEAN' | 'DIRTY' | 'MAINTENANCE' | 'OUT_OF_ORDER' | 'OCCUPIED';
  lastCleaned: string;
  nextService: string;
  assignedStaff?: string;
  notes?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  taskType: 'DAILY_CLEANING' | 'DEEP_CLEANING' | 'LAUNDRY' | 'MAINTENANCE' | 'INSPECTION' | 'TURNOVER';
  title: string;
  description: string;
  assignedTo: string;
  assignedStaff: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedTime: number; // in minutes
  actualTime?: number;
  scheduledDate: string;
  scheduledTime: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'CLEANING_SUPPLIES' | 'LINENS' | 'TOILETRIES' | 'EQUIPMENT' | 'OTHER';
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastRestocked: string;
  supplier?: string;
  cost: number;
  location: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT';
  isActive: boolean;
}

export default function HousekeepingPage() {
  const { isOpen } = useSidebar();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rooms");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Task form data
  const [taskData, setTaskData] = useState({
    roomId: "",
    taskType: "",
    title: "",
    description: "",
    assignedTo: "",
    priority: "MEDIUM",
    estimatedTime: "",
    scheduledDate: format(new Date(), "yyyy-MM-dd"),
    scheduledTime: "09:00"
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch rooms
        const roomsResponse = await fetch('/api/bridge-retreats/housekeeping/rooms');
        const roomsData = await roomsResponse.json();
        
        if (roomsData.rooms) {
          const formattedRooms = roomsData.rooms.map((room: any) => ({
            id: room.id,
            number: room.roomNumber,
            type: room.roomType,
            floor: room.floor,
            status: room.cleaningStatus || room.status,
            lastCleaned: room.lastCleaned || new Date().toISOString(),
            nextService: room.nextService || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            assignedStaff: room.assignedHousekeeper,
            priority: room.priority || 'MEDIUM',
            notes: room.housekeepingNotes
          }));
          setRooms(formattedRooms);
        }
        
        // For now, use empty arrays for other data until we implement their APIs
        setTasks([]);
        setInventory([]);
        setStaff([]);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty arrays on error
        setRooms([]);
        setTasks([]);
        setInventory([]);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'CLEAN':
        return 'bg-green-100 text-green-800';
      case 'DIRTY':
        return 'bg-red-100 text-red-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_ORDER':
        return 'bg-gray-100 text-gray-800';
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const room = rooms.find(r => r.id === taskData.roomId);
    const assignedStaff = staff.find(s => s.id === taskData.assignedTo);
    
    if (!room || !assignedStaff) return;

    const newTask: HousekeepingTask = {
      id: Date.now().toString(),
      roomId: taskData.roomId,
      roomNumber: room.number,
      taskType: taskData.taskType as HousekeepingTask['taskType'],
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo,
      assignedStaff: assignedStaff.name,
      status: 'PENDING',
      priority: taskData.priority as HousekeepingTask['priority'],
      estimatedTime: parseInt(taskData.estimatedTime),
      scheduledDate: taskData.scheduledDate,
      scheduledTime: taskData.scheduledTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);
    setIsAddTaskOpen(false);
    setTaskData({
      roomId: "",
      taskType: "",
      title: "",
      description: "",
      assignedTo: "",
      priority: "MEDIUM",
      estimatedTime: "",
      scheduledDate: format(new Date(), "yyyy-MM-dd"),
      scheduledTime: "09:00"
    });
  };

  const roomColumns = [
    {
      accessorKey: "number",
      header: "Room",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <Bed className="w-4 h-4 text-gray-600" />
          <div>
            <p className="font-medium">{row.original.number}</p>
            <p className="text-sm text-gray-500">{row.original.type} - Floor {row.original.floor}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={getRoomStatusColor(row.getValue("status"))}>
          {row.getValue("status").replace('_', ' ')}
        </Badge>
      )
    },
    {
      accessorKey: "assignedStaff",
      header: "Assigned Staff",
      cell: ({ row }: any) => row.original.assignedStaff || "Unassigned"
    },
    {
      accessorKey: "lastCleaned",
      header: "Last Cleaned",
      cell: ({ row }: any) => format(new Date(row.getValue("lastCleaned")), "MMM dd, HH:mm")
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
              Update Status
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ClipboardList className="w-4 h-4 mr-2" />
              Add Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const taskColumns = [
    {
      accessorKey: "roomNumber",
      header: "Room",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Bed className="w-4 h-4 text-gray-600" />
          <span className="font-medium">{row.getValue("roomNumber")}</span>
        </div>
      )
    },
    {
      accessorKey: "title",
      header: "Task",
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-sm text-gray-500">{row.original.taskType.replace('_', ' ')}</p>
        </div>
      )
    },
    {
      accessorKey: "assignedStaff",
      header: "Assigned To"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={getTaskStatusColor(row.getValue("status"))}>
          {row.getValue("status").replace('_', ' ')}
        </Badge>
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
      accessorKey: "scheduledDate",
      header: "Scheduled",
      cell: ({ row }: any) => {
        const date = new Date(`${row.original.scheduledDate}T${row.original.scheduledTime}`);
        return format(date, "MMM dd, HH:mm");
      }
    },
    {
      accessorKey: "estimatedTime",
      header: "Est. Time",
      cell: ({ row }: any) => `${row.getValue("estimatedTime")} min`
    }
  ];

  const inventoryColumns = [
    {
      accessorKey: "name",
      header: "Item",
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-gray-500">{row.original.category.replace('_', ' ')}</p>
        </div>
      )
    },
    {
      accessorKey: "currentStock",
      header: "Current Stock",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <span className={row.original.currentStock <= row.original.minStock ? "text-red-600 font-medium" : ""}>
            {row.original.currentStock} {row.original.unit}
          </span>
          {row.original.currentStock <= row.original.minStock && (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
        </div>
      )
    },
    {
      accessorKey: "minStock",
      header: "Min Stock",
      cell: ({ row }: any) => `${row.getValue("minStock")} ${row.original.unit}`
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span>{row.getValue("location")}</span>
        </div>
      )
    },
    {
      accessorKey: "lastRestocked",
      header: "Last Restocked",
      cell: ({ row }: any) => format(new Date(row.getValue("lastRestocked")), "MMM dd, yyyy")
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
                <h1 className="text-3xl font-bold text-gray-900">Housekeeping Management</h1>
                <p className="text-gray-600">Manage room status, cleaning schedules, and housekeeping inventory</p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Housekeeping Task</DialogTitle>
                      <DialogDescription>Assign a new task to housekeeping staff</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="roomId">Room</Label>
                          <Select 
                            value={taskData.roomId} 
                            onValueChange={(value) => setTaskData(prev => ({ ...prev, roomId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                            <SelectContent>
                              {rooms.map((room) => (
                                <SelectItem key={room.id} value={room.id}>
                                  Room {room.number} - {room.type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taskType">Task Type</Label>
                          <Select 
                            value={taskData.taskType} 
                            onValueChange={(value) => setTaskData(prev => ({ ...prev, taskType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DAILY_CLEANING">Daily Cleaning</SelectItem>
                              <SelectItem value="DEEP_CLEANING">Deep Cleaning</SelectItem>
                              <SelectItem value="TURNOVER">Guest Turnover</SelectItem>
                              <SelectItem value="LAUNDRY">Laundry</SelectItem>
                              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                              <SelectItem value="INSPECTION">Inspection</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                          id="title"
                          value={taskData.title}
                          onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={taskData.description}
                          onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="assignedTo">Assign To</Label>
                          <Select 
                            value={taskData.assignedTo} 
                            onValueChange={(value) => setTaskData(prev => ({ ...prev, assignedTo: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select staff" />
                            </SelectTrigger>
                            <SelectContent>
                              {staff.filter(s => s.isActive).map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name} - {member.role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select 
                            value={taskData.priority} 
                            onValueChange={(value) => setTaskData(prev => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estimatedTime">Est. Time (min)</Label>
                          <Input
                            id="estimatedTime"
                            type="number"
                            value={taskData.estimatedTime}
                            onChange={(e) => setTaskData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="scheduledDate">Scheduled Date</Label>
                          <Input
                            id="scheduledDate"
                            type="date"
                            value={taskData.scheduledDate}
                            onChange={(e) => setTaskData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scheduledTime">Scheduled Time</Label>
                          <Input
                            id="scheduledTime"
                            type="time"
                            value={taskData.scheduledTime}
                            onChange={(e) => setTaskData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <Button type="submit">Create Task</Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddTaskOpen(false)}>
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
                  <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                  <Bed className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rooms.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {Math.max(...rooms.map(r => r.floor))} floors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clean Rooms</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rooms.filter(r => r.status === 'CLEAN').length}</div>
                  <p className="text-xs text-muted-foreground">
                    Ready for guests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'PENDING').length}</div>
                  <p className="text-xs text-muted-foreground">
                    {tasks.filter(t => t.status === 'OVERDUE').length} overdue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inventory.filter(i => i.currentStock <= i.minStock).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Need restocking
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rooms" className="gap-2">
                  <Bed className="w-4 h-4" />
                  Room Status
                </TabsTrigger>
                <TabsTrigger value="tasks" className="gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="inventory" className="gap-2">
                  <Package className="w-4 h-4" />
                  Inventory
                </TabsTrigger>
              </TabsList>

              {/* Room Status Tab */}
              <TabsContent value="rooms">
                <Card>
                  <CardHeader>
                    <CardTitle>Room Status Overview</CardTitle>
                    <CardDescription>Current status and assignment of all rooms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={roomColumns}
                      data={rooms}
                      searchKey="number"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks">
                <Card>
                  <CardHeader>
                    <CardTitle>Housekeeping Tasks</CardTitle>
                    <CardDescription>Assigned tasks and their current status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={taskColumns}
                      data={tasks}
                      searchKey="title"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>Cleaning supplies, linens, and equipment inventory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={inventoryColumns}
                      data={inventory}
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