"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Shield,
  Crown,
  User,
  Building,
  Loader2,
  Download,
  Upload
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'USER' | 'MANAGER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
  company?: string;
  department?: string;
  position?: string;
  location?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'USER' | 'MANAGER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  company: string;
  department: string;
  position: string;
  location: string;
  password?: string;
}

// Map frontend roles to backend roles
const mapRoleToBackend = (role: string): 'USER' | 'ADMIN' | 'SUPER_ADMIN' => {
  switch (role) {
    case 'ADMIN':
    case 'MANAGER':
      return 'ADMIN';
    case 'VIEWER':
    case 'USER':
      return 'USER';
    default:
      return 'USER';
  }
};

// Map backend roles to frontend roles for display
const mapRoleToFrontend = (role: string): 'ADMIN' | 'USER' | 'MANAGER' | 'VIEWER' => {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'ADMIN';
    case 'ADMIN':
      return 'MANAGER';
    case 'USER':
      return 'USER';
    default:
      return 'USER';
  }
};

export default function UsersPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [stats, setStats] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "USER",
    status: "ACTIVE",
    company: "",
    department: "",
    position: "",
    location: "",
    password: ""
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers({
        limit: 50,
        search: searchTerm || undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined
      });
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.getUserStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
      // Fallback to general stats if user stats endpoint doesn't exist
      try {
        const generalStats = await apiClient.getStats();
        setStats({
          total: generalStats.users?.total || 0,
          active: generalStats.users?.active || 0,
          inactive: generalStats.users?.inactive || 0,
          suspended: generalStats.users?.suspended || 0,
          admins: generalStats.users?.admins || 0,
          managers: generalStats.users?.managers || 0,
          users: generalStats.users?.users || 0,
          newThisMonth: generalStats.users?.newThisMonth || 0
        });
      } catch (fallbackErr) {
        console.error('Failed to fetch fallback stats:', fallbackErr);
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'MANAGER': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'USER': return <User className="w-4 h-4 text-green-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const createData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password || "",
        role: mapRoleToBackend(userData.role),
        phone: userData.phone,
        status: userData.status,
        company: userData.company,
        department: userData.department,
        position: userData.position,
        location: userData.location
      };
      await apiClient.createUser(createData);
      setIsAddUserOpen(false);
      // Reset form
      setUserData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "USER",
        status: "ACTIVE",
        company: "",
        department: "",
        position: "",
        location: "",
        password: ""
      });
      
      // Refresh users and stats
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const updateData: Partial<UserFormData> = { ...userData };
      // Remove password if empty
      if (!updateData.password) {
        delete updateData.password;
      }
      
      // Map role to backend format and create properly typed update data
      const backendUpdateData: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
        status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
        company?: string;
        department?: string;
        position?: string;
        location?: string;
        password?: string;
      } = {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phone: updateData.phone,
        role: updateData.role ? mapRoleToBackend(updateData.role) : undefined,
        status: updateData.status,
        company: updateData.company,
        department: updateData.department,
        position: updateData.position,
        location: updateData.location,
        password: updateData.password
      };
      
      await apiClient.updateUser(selectedUser.id, backendUpdateData);
      setIsEditUserOpen(false);
      setSelectedUser(null);
      
      // Refresh users and stats
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteUser(userId);
      // Refresh users and stats
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      status: user.status,
      company: user.company || "",
      department: user.department || "",
      position: user.position || "",
      location: user.location || "",
      password: ""
    });
    setIsEditUserOpen(true);
  };

  const updateUserData = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading users...</span>
          </div>
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

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Page Header */}
          <motion.div 
            className="mb-6"
            {...fadeInUp}
          >
            <h2 className="text-2xl font-prestigious text-gradient mb-2">
              User Management
            </h2>
            <p className="text-refined text-muted-foreground">
              Manage users, roles, and permissions across all ELEVATE platforms.
            </p>
          </motion.div>

          {/* Action Bar */}
          <motion.div 
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-refined"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32 border-refined">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 border-refined">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-3"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-8 px-3"
                >
                  Table
                </Button>
              </div>

              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-premium">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] glass-card border-refined">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-elegant text-gradient">Add New User</DialogTitle>
                    <DialogDescription className="text-refined">
                      Create a new user account with role and permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="Enter first name..."
                          value={userData.firstName}
                          onChange={(e) => updateUserData("firstName", e.target.value)}
                          className="border-refined"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Enter last name..."
                          value={userData.lastName}
                          onChange={(e) => updateUserData("lastName", e.target.value)}
                          className="border-refined"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address..."
                          value={userData.email}
                          onChange={(e) => updateUserData("email", e.target.value)}
                          className="border-refined"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                        <Input
                          id="phone"
                          placeholder="Enter phone number..."
                          value={userData.phone}
                          onChange={(e) => updateUserData("phone", e.target.value)}
                          className="border-refined"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium">Role *</Label>
                        <Select value={userData.role} onValueChange={(value) => updateUserData("role", value)}>
                          <SelectTrigger className="border-refined">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="ADMIN">Administrator</SelectItem>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
                        <Select value={userData.status} onValueChange={(value) => updateUserData("status", value)}>
                          <SelectTrigger className="border-refined">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                        <Input
                          id="company"
                          placeholder="Enter company name..."
                          value={userData.company}
                          onChange={(e) => updateUserData("company", e.target.value)}
                          className="border-refined"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                        <Input
                          id="department"
                          placeholder="Enter department..."
                          value={userData.department}
                          onChange={(e) => updateUserData("department", e.target.value)}
                          className="border-refined"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="position" className="text-sm font-medium">Position</Label>
                        <Input
                          id="position"
                          placeholder="Enter position/title..."
                          value={userData.position}
                          onChange={(e) => updateUserData("position", e.target.value)}
                          className="border-refined"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                        <Input
                          id="location"
                          placeholder="Enter location..."
                          value={userData.location}
                          onChange={(e) => updateUserData("location", e.target.value)}
                          className="border-refined"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password (min 6 characters)..."
                        value={userData.password}
                        onChange={(e) => updateUserData("password", e.target.value)}
                        className="border-refined"
                        required
                        minLength={6}
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddUserOpen(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="btn-premium"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create User
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.total || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.active || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats?.admins || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.newThisMonth || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Users Display */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-xl font-elegant">Users Directory</CardTitle>
                <CardDescription className="text-refined">
                  {users.length} users found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user, index) => (
                      <motion.div
                        key={user.id}
                        className="p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30 cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => handleUserClick(user)}
                      >
                        <div className="flex items-start space-x-4 mb-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium text-lg">
                              {user.firstName} {user.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">{user.position}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              {getRoleIcon(user.role)}
                              <Badge className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="w-4 h-4 mr-2" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="w-4 h-4 mr-2" />
                              {user.phone}
                            </div>
                          )}
                          {user.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2" />
                              {user.location}
                            </div>
                          )}
                          {user.lastLogin && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-2" />
                              Last login: {formatLastLogin(user.lastLogin)}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-refined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUserClick(user);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-refined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditUser(user);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-refined hover:border-red-300 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleUserClick(user)}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {user.firstName[0]}{user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getRoleIcon(user.role)}
                                <span>{user.role}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.company}</TableCell>
                            <TableCell>
                              {user.lastLogin ? formatLastLogin(user.lastLogin) : 'Never'}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-refined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUserClick(user);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-refined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditUser(user);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-refined hover:border-red-300 hover:text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(user.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {users.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL" ? 'No users found' : 'No users yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL"
                        ? 'Try adjusting your search criteria or filters.'
                        : 'Start by adding users to your organization.'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* User Detail Dialog */}
          <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
            <DialogContent className="sm:max-w-[600px] glass-card border-refined">
              <DialogHeader>
                <DialogTitle className="text-xl font-elegant text-gradient">User Details</DialogTitle>
                <DialogDescription className="text-refined">
                  Complete user information and activity
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                      <p className="text-muted-foreground">{selectedUser.position}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getRoleIcon(selectedUser.role)}
                        <Badge className={getStatusColor(selectedUser.status)}>
                          {selectedUser.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          {selectedUser.email}
                        </div>
                        {selectedUser.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                            {selectedUser.phone}
                          </div>
                        )}
                        {selectedUser.location && (
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                            {selectedUser.location}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Work Information</h4>
                      <div className="space-y-2">
                        {selectedUser.company && (
                          <div className="flex items-center text-sm">
                            <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                            {selectedUser.company}
                          </div>
                        )}
                        {selectedUser.department && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Department:</span> {selectedUser.department}
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="text-muted-foreground">Role:</span> {selectedUser.role}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created:</span> {formatDate(selectedUser.createdAt)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Updated:</span> {formatDate(selectedUser.updatedAt)}
                      </div>
                      {selectedUser.lastLogin && (
                        <div>
                          <span className="text-muted-foreground">Last Login:</span> {formatLastLogin(selectedUser.lastLogin)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setIsUserDetailOpen(false)}>
                      Close
                    </Button>
                    <Button className="btn-premium">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit User
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent className="sm:max-w-[600px] glass-card border-refined max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-elegant text-gradient">Edit User</DialogTitle>
                <DialogDescription className="text-refined">
                  Update user information and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                <form onSubmit={handleUpdateUser} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-firstName" className="text-sm font-medium">First Name *</Label>
                      <Input
                        id="edit-firstName"
                        placeholder="Enter first name..."
                        value={userData.firstName}
                        onChange={(e) => updateUserData("firstName", e.target.value)}
                        className="border-refined"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-lastName" className="text-sm font-medium">Last Name *</Label>
                      <Input
                        id="edit-lastName"
                        placeholder="Enter last name..."
                        value={userData.lastName}
                        onChange={(e) => updateUserData("lastName", e.target.value)}
                        className="border-refined"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-email" className="text-sm font-medium">Email *</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        placeholder="Enter email address..."
                        value={userData.email}
                        onChange={(e) => updateUserData("email", e.target.value)}
                        className="border-refined"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-phone" className="text-sm font-medium">Phone</Label>
                      <Input
                        id="edit-phone"
                        placeholder="Enter phone number..."
                        value={userData.phone}
                        onChange={(e) => updateUserData("phone", e.target.value)}
                        className="border-refined"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-role" className="text-sm font-medium">Role *</Label>
                      <Select value={userData.role} onValueChange={(value) => updateUserData("role", value)}>
                        <SelectTrigger className="border-refined">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Administrator</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-status" className="text-sm font-medium">Status *</Label>
                      <Select value={userData.status} onValueChange={(value) => updateUserData("status", value)}>
                        <SelectTrigger className="border-refined">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-company" className="text-sm font-medium">Company</Label>
                      <Input
                        id="edit-company"
                        placeholder="Enter company name..."
                        value={userData.company}
                        onChange={(e) => updateUserData("company", e.target.value)}
                        className="border-refined"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-department" className="text-sm font-medium">Department</Label>
                      <Input
                        id="edit-department"
                        placeholder="Enter department..."
                        value={userData.department}
                        onChange={(e) => updateUserData("department", e.target.value)}
                        className="border-refined"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-position" className="text-sm font-medium">Position</Label>
                      <Input
                        id="edit-position"
                        placeholder="Enter position/title..."
                        value={userData.position}
                        onChange={(e) => updateUserData("position", e.target.value)}
                        className="border-refined"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-location" className="text-sm font-medium">Location</Label>
                      <Input
                        id="edit-location"
                        placeholder="Enter location..."
                        value={userData.location}
                        onChange={(e) => updateUserData("location", e.target.value)}
                        className="border-refined"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-password" className="text-sm font-medium">New Password</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      placeholder="Leave empty to keep current password..."
                      value={userData.password}
                      onChange={(e) => updateUserData("password", e.target.value)}
                      className="border-refined"
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to keep the current password. Minimum 6 characters if changing.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditUserOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="btn-premium"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update User
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
} 