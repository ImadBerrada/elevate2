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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  Plus, 
  Users, 
  Edit,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Activity,
  Lock,
  Unlock,
  Search,
  Filter,
  MoreHorizontal,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'RECEPTIONIST' | 'HOUSEKEEPING' | 'MAINTENANCE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  department: string;
  hireDate: string;
  lastLogin: string;
  permissions: string[];
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const availablePermissions: Permission[] = [
  { id: 'bookings.view', name: 'View Bookings', description: 'View booking information', category: 'Bookings' },
  { id: 'bookings.create', name: 'Create Bookings', description: 'Create new bookings', category: 'Bookings' },
  { id: 'bookings.edit', name: 'Edit Bookings', description: 'Modify existing bookings', category: 'Bookings' },
  { id: 'bookings.delete', name: 'Delete Bookings', description: 'Cancel or delete bookings', category: 'Bookings' },
  { id: 'guests.view', name: 'View Guests', description: 'View guest information', category: 'Guests' },
  { id: 'guests.create', name: 'Create Guests', description: 'Add new guest profiles', category: 'Guests' },
  { id: 'guests.edit', name: 'Edit Guests', description: 'Modify guest information', category: 'Guests' },
  { id: 'financial.view', name: 'View Financial Data', description: 'Access financial reports', category: 'Financial' },
  { id: 'financial.manage', name: 'Manage Finances', description: 'Process payments and invoices', category: 'Financial' },
  { id: 'reports.view', name: 'View Reports', description: 'Access system reports', category: 'Reports' },
  { id: 'settings.view', name: 'View Settings', description: 'Access system settings', category: 'Settings' },
  { id: 'settings.manage', name: 'Manage Settings', description: 'Modify system settings', category: 'Settings' },
  { id: 'users.view', name: 'View Users', description: 'View user accounts', category: 'User Management' },
  { id: 'users.manage', name: 'Manage Users', description: 'Create, edit, and delete users', category: 'User Management' }
];

export default function UserManagementPage() {
  const { isOpen } = useSidebar();
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  
  // Filters
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Form data
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    permissions: [] as string[]
  });

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@bridgeretreats.com',
        phone: '+971-50-123-4567',
        role: 'ADMIN',
        status: 'ACTIVE',
        department: 'Administration',
        hireDate: '2023-01-15',
        lastLogin: '2024-01-16T10:30:00Z',
        permissions: ['bookings.view', 'bookings.create', 'bookings.edit', 'financial.view', 'reports.view', 'settings.manage', 'users.manage'],
        createdAt: '2023-01-15T09:00:00Z',
        updatedAt: '2024-01-16T10:30:00Z'
      },
      {
        id: '2',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        email: 'ahmed.hassan@bridgeretreats.com',
        phone: '+971-50-234-5678',
        role: 'MANAGER',
        status: 'ACTIVE',
        department: 'Operations',
        hireDate: '2023-03-20',
        lastLogin: '2024-01-15T16:45:00Z',
        permissions: ['bookings.view', 'bookings.create', 'bookings.edit', 'guests.view', 'guests.edit', 'reports.view'],
        createdAt: '2023-03-20T09:00:00Z',
        updatedAt: '2024-01-15T16:45:00Z'
      },
      {
        id: '3',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@bridgeretreats.com',
        phone: '+971-50-345-6789',
        role: 'RECEPTIONIST',
        status: 'ACTIVE',
        department: 'Front Desk',
        hireDate: '2023-06-10',
        lastLogin: '2024-01-16T08:15:00Z',
        permissions: ['bookings.view', 'bookings.create', 'guests.view', 'guests.create'],
        createdAt: '2023-06-10T09:00:00Z',
        updatedAt: '2024-01-16T08:15:00Z'
      },
      {
        id: '4',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@bridgeretreats.com',
        phone: '+971-50-456-7890',
        role: 'MAINTENANCE',
        status: 'ACTIVE',
        department: 'Facilities',
        hireDate: '2023-08-05',
        lastLogin: '2024-01-14T14:20:00Z',
        permissions: ['bookings.view'],
        createdAt: '2023-08-05T09:00:00Z',
        updatedAt: '2024-01-14T14:20:00Z'
      },
      {
        id: '5',
        firstName: 'Lisa',
        lastName: 'Brown',
        email: 'lisa.brown@bridgeretreats.com',
        phone: '+971-50-567-8901',
        role: 'HOUSEKEEPING',
        status: 'INACTIVE',
        department: 'Housekeeping',
        hireDate: '2023-04-12',
        lastLogin: '2024-01-10T11:30:00Z',
        permissions: ['bookings.view'],
        createdAt: '2023-04-12T09:00:00Z',
        updatedAt: '2024-01-10T11:30:00Z'
      }
    ];

    const mockActivityLogs: ActivityLog[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Sarah Johnson',
        action: 'LOGIN',
        resource: 'System',
        details: 'Successful login',
        timestamp: '2024-01-16T10:30:00Z',
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        userId: '2',
        userName: 'Ahmed Hassan',
        action: 'CREATE',
        resource: 'Booking',
        details: 'Created booking #BK-2024-001',
        timestamp: '2024-01-15T16:45:00Z',
        ipAddress: '192.168.1.101'
      },
      {
        id: '3',
        userId: '3',
        userName: 'Maria Rodriguez',
        action: 'UPDATE',
        resource: 'Guest',
        details: 'Updated guest profile for John Doe',
        timestamp: '2024-01-16T08:15:00Z',
        ipAddress: '192.168.1.102'
      },
      {
        id: '4',
        userId: '1',
        userName: 'Sarah Johnson',
        action: 'DELETE',
        resource: 'User',
        details: 'Deactivated user account for temp staff',
        timestamp: '2024-01-15T14:20:00Z',
        ipAddress: '192.168.1.100'
      }
    ];

    setUsers(mockUsers);
    setActivityLogs(mockActivityLogs);
    setLoading(false);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: User = {
      id: Date.now().toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role as User['role'],
      status: 'ACTIVE',
      department: userData.department,
      hireDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      permissions: userData.permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setUsers(prev => [newUser, ...prev]);
    setIsAddUserOpen(false);
    
    // Reset form
    setUserData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      permissions: []
    });
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' as const, updatedAt: new Date().toISOString() }
        : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'STAFF':
        return 'bg-green-100 text-green-800';
      case 'RECEPTIONIST':
        return 'bg-purple-100 text-purple-800';
      case 'HOUSEKEEPING':
        return 'bg-yellow-100 text-yellow-800';
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter data
  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
    const matchesDepartment = departmentFilter === "ALL" || user.department === departmentFilter;
    const matchesSearch = searchQuery === "" || 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRole && matchesStatus && matchesDepartment && matchesSearch;
  });

  const departments = Array.from(new Set(users.map(user => user.department)));

  const userColumns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
            <p className="text-sm text-gray-500">{row.original.email}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }: any) => (
        <Badge className={getRoleColor(row.getValue("role"))}>
          {row.getValue("role")}
        </Badge>
      )
    },
    {
      accessorKey: "department",
      header: "Department"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.getValue("status"))}>
          {row.getValue("status")}
        </Badge>
      )
    },
    {
      accessorKey: "lastLogin",
      header: "Last Login",
      cell: ({ row }: any) => {
        const lastLogin = row.getValue("lastLogin");
        if (lastLogin === 'Never') return 'Never';
        return format(new Date(lastLogin), "MMM dd, yyyy HH:mm");
      }
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
            <DropdownMenuItem onClick={() => {
              setSelectedUser(row.original);
              setIsUserDetailOpen(true);
            }}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleUserStatus(row.original.id)}>
              {row.original.status === 'ACTIVE' ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteUser(row.original.id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const activityColumns = [
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: ({ row }: any) => format(new Date(row.getValue("timestamp")), "MMM dd, HH:mm")
    },
    {
      accessorKey: "userName",
      header: "User"
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.getValue("action")}</Badge>
      )
    },
    {
      accessorKey: "resource",
      header: "Resource"
    },
    {
      accessorKey: "details",
      header: "Details"
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address"
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
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage staff accounts, permissions, and access control</p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Create a new staff account with appropriate permissions
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={userData.firstName}
                            onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={userData.lastName}
                            onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userData.email}
                            onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={userData.phone}
                            onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select 
                            value={userData.role} 
                            onValueChange={(value) => setUserData(prev => ({ ...prev, role: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">Administrator</SelectItem>
                              <SelectItem value="MANAGER">Manager</SelectItem>
                              <SelectItem value="STAFF">Staff</SelectItem>
                              <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                              <SelectItem value="HOUSEKEEPING">Housekeeping</SelectItem>
                              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={userData.department}
                            onChange={(e) => setUserData(prev => ({ ...prev, department: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                          {availablePermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={permission.id}
                                checked={userData.permissions.includes(permission.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setUserData(prev => ({
                                      ...prev,
                                      permissions: [...prev.permissions, permission.id]
                                    }));
                                  } else {
                                    setUserData(prev => ({
                                      ...prev,
                                      permissions: prev.permissions.filter(p => p !== permission.id)
                                    }));
                                  }
                                }}
                                className="rounded"
                              />
                              <label htmlFor={permission.id} className="text-sm">
                                <span className="font-medium">{permission.name}</span>
                                <span className="text-gray-500 ml-2">({permission.category})</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <Button type="submit">Create User</Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="w-4 h-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Activity Log
                </TabsTrigger>
              </TabsList>

              {/* Users Tab */}
              <TabsContent value="users">
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">
                          All staff accounts
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.status === 'ACTIVE').length}</div>
                        <p className="text-xs text-muted-foreground">
                          Currently active
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{departments.length}</div>
                        <p className="text-xs text-muted-foreground">
                          Active departments
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                        <Settings className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</div>
                        <p className="text-xs text-muted-foreground">
                          System administrators
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
                              placeholder="Search users..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Roles</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="STAFF">Staff</SelectItem>
                            <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                            <SelectItem value="HOUSEKEEPING">Housekeeping</SelectItem>
                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Departments</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Users Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Staff Accounts</CardTitle>
                      <CardDescription>Manage user accounts and permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={userColumns}
                        data={filteredUsers}
                        searchKey="firstName"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Log Tab */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>Track user actions and system access</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={activityColumns}
                      data={activityLogs}
                      searchKey="userName"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* User Detail Modal */}
      <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {selectedUser && `${selectedUser.firstName} ${selectedUser.lastName} - ${selectedUser.role}`}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedUser.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Department</Label>
                  <p className="text-sm">{selectedUser.department}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Role</Label>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Hire Date</Label>
                  <p className="text-sm">{format(new Date(selectedUser.hireDate), "MMM dd, yyyy")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Login</Label>
                  <p className="text-sm">
                    {selectedUser.lastLogin === 'Never' 
                      ? 'Never' 
                      : format(new Date(selectedUser.lastLogin), "MMM dd, yyyy HH:mm")
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Permissions</Label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedUser.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {availablePermissions.find(p => p.id === permission)?.name || permission}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsUserDetailOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 