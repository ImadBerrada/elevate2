"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Shield, 
  Search, 
  Plus,
  Mail,
  Building,
  Edit,
  Trash2,
  UserCheck,
  Loader2,
  Crown,
  Eye,
  Users,
  Sparkles,
  AlertTriangle,
  Briefcase,
  X
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
import { ImageUpload } from "@/components/ui/image-upload";
import { RoleSelector } from "@/components/ui/role-selector";
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

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: string;
  assignedCompanyId?: string;
  createdAt: string;
  updatedAt: string;
  assignedCompany?: {
    id: string;
    name: string;
    industry: string;
    location: string;
    status: string;
  };
  managerAssignments: {
    id: string;
    companyId: string;
    platforms: string[];
    permissions: any;
    isActive: boolean;
    company: {
      id: string;
      name: string;
      industry: string;
      location: string;
      status: string;
    };
  }[];
}

interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  status: string;
}

interface ManagerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  companyIds: string[]; // Changed to support multiple companies
  platforms: string[];
  department: string;
  role: string | string[]; // Updated to support multiple roles
  startDate: string;
  salary: string;
  actualSalary: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  skills: string;
  avatar: string;
  permissions: {
    canManageAssets: boolean;
    canModifyCompanies: boolean;
    canCreateCompanies: boolean;
    canDeleteCompanies: boolean;
  };
}

interface AssignmentFormData {
  managerId: string;
  companyId: string;
  platforms: string[];
}

const availablePlatforms = [
  { id: 'MARAH Games', name: 'MARAH Games', description: 'Gaming platform management and operations' },
  { id: 'Real Estate', name: 'Real Estate', description: 'Property listings and real estate management' },
  { id: 'Employee Management', name: 'Employee Management', description: 'HR operations and employee administration' },
  { id: 'Investor Relations', name: 'Investor Relations', description: 'Investor communications and relations' },
];

// Helper functions for role handling
const formatArrayField = (field: string | string[]) => {
  if (Array.isArray(field)) {
    return field.length > 0 ? field[0] : ''; // Use first item as primary
  }
  return field || '';
};

const parseArrayField = (field: string | string[]): string[] => {
  if (Array.isArray(field)) {
    return field;
  }
  return field ? field.split(',').map(s => s.trim()).filter(Boolean) : [];
};

export default function ManagersPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false);
  const [isAssignManagerOpen, setIsAssignManagerOpen] = useState(false);
  const [isManagerDetailOpen, setIsManagerDetailOpen] = useState(false);
  const [isEditManagerOpen, setIsEditManagerOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Department management states
  const [departments, setDepartments] = useState<string[]>([
    "Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"
  ]);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  
  const [managerData, setManagerData] = useState<ManagerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    companyIds: [],
    platforms: [],
    department: "",
    role: [], // Initialize as empty array for multi-select
    startDate: "",
    salary: "",
    actualSalary: "",
    location: "",
    status: 'ACTIVE',
    skills: "",
    avatar: "",
    permissions: {
      canManageAssets: false,
      canModifyCompanies: false,
      canCreateCompanies: false,
      canDeleteCompanies: false,
    },
  });

  const [assignmentData, setAssignmentData] = useState<AssignmentFormData>({
    managerId: "",
    companyId: "",
    platforms: []
  });

  useEffect(() => {
    fetchManagers();
    fetchCompanies();
    fetchEmployees();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchManagers();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, companyFilter]);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const params: any = {
        includeAssigned: true,
      };

      if (companyFilter !== 'ALL') {
        params.companyId = companyFilter;
      }

      const data = await apiClient.getManagers(params);
      setManagers(data.managers || []);
    } catch (err) {
      console.error('Failed to fetch managers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch managers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await apiClient.getCompaniesList();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await apiClient.getEmployees({ limit: 1000 });
      setEmployees(data.employees || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleCreateManager = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!managerData.firstName || !managerData.lastName || !managerData.email || !managerData.password) {
        throw new Error('Please fill in all required fields (Name, Email, Password)');
      }

      if (managerData.companyIds.length === 0) {
        throw new Error('Please select at least one company');
      }

      console.log('Creating manager with data:', {
        firstName: managerData.firstName,
        lastName: managerData.lastName,
        email: managerData.email,
        companyIds: managerData.companyIds,
        platforms: managerData.platforms,
        permissions: managerData.permissions,
      });

      // Create manager with all company assignments at once
      const managerResponse = await apiClient.createManager({
        firstName: managerData.firstName,
        lastName: managerData.lastName,
        email: managerData.email,
        password: managerData.password,
        avatar: managerData.avatar,
        companyIds: managerData.companyIds, // Send all companies at once
        platforms: managerData.platforms,
        permissions: {
          ...generatePermissions(managerData.platforms),
          canManageAssets: managerData.permissions.canManageAssets,
          canModifyCompanies: managerData.permissions.canModifyCompanies,
          canCreateCompanies: managerData.permissions.canCreateCompanies,
          canDeleteCompanies: managerData.permissions.canDeleteCompanies,
        }
      });

      // Create employee record for the primary company (first in the list)
      if (managerData.companyIds.length > 0) {
        try {
          await apiClient.createEmployee({
            firstName: managerData.firstName,
            lastName: managerData.lastName,
            email: managerData.email,
            phone: managerData.phone,
            department: managerData.department,
            role: formatArrayField(managerData.role), // Convert array to string for API
            companyId: managerData.companyIds[0], // Use first company as primary
            actualCompanyId: managerData.companyIds[0],
            employerId: "",
            salary: managerData.salary,
            actualSalary: managerData.actualSalary,
            startDate: managerData.startDate,
            status: managerData.status,
            location: managerData.location,
            manager: "",
            skills: managerData.skills,
            avatar: managerData.avatar,
            // Additional employee fields
            licenseNumber: "",
            vehicleInfo: "",
            dateOfBirth: "",
            emergencyContact: "",
            emergencyPhone: "",
            experience: "",
            licenseDocument: "",
            vehicleRegistration: "",
          });
        } catch (employeeErr) {
          console.warn('Manager created but failed to create employee record:', employeeErr);
        }
      }

      console.log('Manager and all assignments created successfully');

      setSuccess('Manager created successfully and added to employees!');
      setTimeout(() => setSuccess(null), 5000);
      
      setIsCreateManagerOpen(false);
      setManagerData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        companyIds: [],
        platforms: [],
        department: "",
        role: [],
        startDate: "",
        salary: "",
        actualSalary: "",
        location: "",
        status: 'ACTIVE',
        skills: "",
        avatar: "",
        permissions: {
          canManageAssets: false,
          canModifyCompanies: false,
          canCreateCompanies: false,
          canDeleteCompanies: false,
        },
      });
      resetDepartmentForm();
      
      fetchManagers();
      fetchEmployees(); // Refresh employees list as well
    } catch (err) {
      console.error('Failed to create manager:', err);
      setError(err instanceof Error ? err.message : 'Failed to create manager');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignManager = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Check if the selected person is an employee (not already a manager)
      const selectedEmployee = employees.find(emp => emp.id === assignmentData.managerId);
      const selectedManager = managers.find(mgr => mgr.id === assignmentData.managerId);
      
      if (selectedEmployee && !selectedManager) {
        // This is an employee being promoted to manager
        await apiClient.createManager({
          firstName: selectedEmployee.firstName,
          lastName: selectedEmployee.lastName,
          email: selectedEmployee.email,
          password: "TempPassword123!", // Temporary password - should be changed
          companyId: assignmentData.companyId,
          platforms: assignmentData.platforms.length > 0 ? assignmentData.platforms : ['Employee Management'], // Default to employee management if no platforms selected
          permissions: generatePermissions(assignmentData.platforms.length > 0 ? assignmentData.platforms : ['Employee Management'])
        });
        
        setSuccess('Employee promoted to manager and assigned successfully!');
      } else {
        // This is an existing manager being assigned to a company
        await apiClient.createManagerAssignment({
          userId: assignmentData.managerId,
          companyId: assignmentData.companyId,
          platforms: assignmentData.platforms.length > 0 ? assignmentData.platforms : ['Employee Management'], // Default to employee management
          permissions: generatePermissions(assignmentData.platforms.length > 0 ? assignmentData.platforms : ['Employee Management'])
        });
        
        setSuccess('Manager assigned to company successfully!');
      }

      setTimeout(() => setSuccess(null), 5000);
      
      setIsAssignManagerOpen(false);
      setAssignmentData({
        managerId: "",
        companyId: "",
        platforms: []
      });
      
      fetchManagers();
      fetchEmployees(); // Refresh employees list as well
    } catch (err) {
      console.error('Failed to assign manager:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign manager');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (managerId: string, companyId: string) => {
    if (!confirm('Are you sure you want to remove this manager assignment?')) return;

    try {
      await apiClient.deleteManagerAssignment({
        userId: managerId,
        companyId
      });

      setSuccess('Manager assignment removed successfully!');
      setTimeout(() => setSuccess(null), 5000);
      
      fetchManagers();
    } catch (err) {
      console.error('Failed to remove assignment:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove assignment');
    }
  };

  const handleManagerClick = async (manager: Manager) => {
    try {
      // For now, we'll use the manager data we already have
      // In a real app, you might want to fetch more detailed data
      setSelectedManager(manager);
      setIsManagerDetailOpen(true);
    } catch (err) {
      console.error('Failed to fetch manager details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch manager details');
    }
  };

  const handleEditManager = (manager: Manager) => {
    setSelectedManager(manager);
    
    // Collect all unique platforms from all assignments
    const allPlatforms: string[] = [];
    if (manager.managerAssignments && manager.managerAssignments.length > 0) {
      manager.managerAssignments.forEach(assignment => {
        if (assignment.platforms && Array.isArray(assignment.platforms)) {
          assignment.platforms.forEach(platform => {
            if (!allPlatforms.includes(platform)) {
              allPlatforms.push(platform);
            }
          });
        }
      });
    }
    
    // Get permissions from the first assignment (they should be consistent across assignments)
    const firstAssignment = manager.managerAssignments && manager.managerAssignments.length > 0 ? manager.managerAssignments[0] : null;
    
    setManagerData({
      firstName: manager.firstName,
      lastName: manager.lastName,
      email: manager.email,
      phone: '', // Manager interface doesn't have phone, set empty
      password: '', // Don't populate password for security
      companyIds: (manager.managerAssignments || []).map(assignment => assignment.companyId),
      platforms: allPlatforms, // Use all unique platforms instead of just first assignment
      department: '', // Manager interface doesn't have department, set empty
      role: manager.role || '',
      startDate: manager.createdAt ? manager.createdAt.split('T')[0] : '',
      salary: '',
      actualSalary: '',
      location: '',
      status: 'ACTIVE', // Default status
      skills: '',
      avatar: manager.avatar || '',
      permissions: {
        canManageAssets: firstAssignment?.permissions?.canManageAssets || false,
        canModifyCompanies: firstAssignment?.permissions?.canModifyCompanies || false,
        canCreateCompanies: firstAssignment?.permissions?.canCreateCompanies || false,
        canDeleteCompanies: firstAssignment?.permissions?.canDeleteCompanies || false,
      },
    });
    setIsEditManagerOpen(true);
  };

  const handleUpdateManager = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedManager) return;

    setSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!managerData.firstName || !managerData.lastName || !managerData.email) {
        throw new Error('Please fill in all required fields (Name and Email)');
      }

      console.log('Updating manager with data:', {
        firstName: managerData.firstName,
        lastName: managerData.lastName,
        email: managerData.email,
        companyIds: managerData.companyIds,
        platforms: managerData.platforms,
      });

      console.log('=== MANAGER UPDATE DEBUG ===');
      console.log('Manager ID:', selectedManager.id);
      console.log('Form data - Companies:', managerData.companyIds);
      console.log('Form data - Platforms:', managerData.platforms);
      console.log('Form data - Permissions:', managerData.permissions);
      console.log('Current assignments:', selectedManager.managerAssignments);
      console.log('==============================');

      // Update manager (assuming managers are users)
      const updatedManager = await apiClient.updateUser(selectedManager.id, {
        firstName: managerData.firstName,
        lastName: managerData.lastName,
        email: managerData.email,
        avatar: managerData.avatar,
      });

      console.log('Manager updated successfully:', updatedManager);

      // Update manager company assignments
      const currentCompanyIds = (selectedManager.managerAssignments || []).map(assignment => assignment.companyId);
      const newCompanyIds = managerData.companyIds;

      console.log('Current company assignments:', currentCompanyIds);
      console.log('New company assignments:', newCompanyIds);

      // Find assignments to remove
      const assignmentsToRemove = currentCompanyIds.filter(companyId => !newCompanyIds.includes(companyId));
      
      // Find assignments to add
      const assignmentsToAdd = newCompanyIds.filter(companyId => !currentCompanyIds.includes(companyId));
      
      // Find assignments to update (existing assignments that remain)
      const assignmentsToUpdate = currentCompanyIds.filter(companyId => newCompanyIds.includes(companyId));

      console.log('Assignments to remove:', assignmentsToRemove);
      console.log('Assignments to add:', assignmentsToAdd);
      console.log('Assignments to update:', assignmentsToUpdate);

      // Remove old assignments
      for (const companyId of assignmentsToRemove) {
        try {
          await apiClient.deleteManagerAssignment({
            userId: selectedManager.id,
            companyId: companyId
          });
          console.log(`Removed assignment for company ${companyId}`);
        } catch (assignmentErr) {
          console.error(`Failed to remove assignment for company ${companyId}:`, assignmentErr);
        }
      }

      // Update existing assignments with new platforms and permissions
      for (const companyId of assignmentsToUpdate) {
        try {
          // Use the more efficient update method instead of delete-and-recreate
          await apiClient.updateManagerAssignment({
            userId: selectedManager.id,
            companyId: companyId,
            platforms: managerData.platforms.length > 0 ? managerData.platforms : ['Employee Management'],
            permissions: {
              ...generatePermissions(managerData.platforms.length > 0 ? managerData.platforms : ['Employee Management']),
              canManageAssets: managerData.permissions.canManageAssets,
              canModifyCompanies: managerData.permissions.canModifyCompanies,
              canCreateCompanies: managerData.permissions.canCreateCompanies,
              canDeleteCompanies: managerData.permissions.canDeleteCompanies,
            }
          });
          console.log(`Updated assignment for company ${companyId} with new platforms:`, managerData.platforms);
        } catch (assignmentErr) {
          console.error(`Failed to update assignment for company ${companyId}:`, assignmentErr);
        }
      }

      // Add new assignments
      for (const companyId of assignmentsToAdd) {
        try {
          await apiClient.createManagerAssignment({
            userId: selectedManager.id,
            companyId: companyId,
            platforms: managerData.platforms.length > 0 ? managerData.platforms : ['Employee Management'],
            permissions: {
              ...generatePermissions(managerData.platforms.length > 0 ? managerData.platforms : ['Employee Management']),
              canManageAssets: managerData.permissions.canManageAssets,
              canModifyCompanies: managerData.permissions.canModifyCompanies,
              canCreateCompanies: managerData.permissions.canCreateCompanies,
              canDeleteCompanies: managerData.permissions.canDeleteCompanies,
            }
          });
          console.log(`Added assignment for company ${companyId}`);
        } catch (assignmentErr) {
          console.error(`Failed to add assignment for company ${companyId}:`, assignmentErr);
        }
      }

      // Update local state (refresh from server to get latest assignments)
      await fetchManagers();
      
      // Verify the updates were successful
      console.log('=== VERIFICATION ===');
      const updatedManagerFromServer = managers.find(m => m.id === selectedManager.id);
      if (updatedManagerFromServer) {
        console.log('Updated manager assignments from server:', updatedManagerFromServer.managerAssignments);
        updatedManagerFromServer.managerAssignments.forEach((assignment, index) => {
          console.log(`Assignment ${index + 1}:`, {
            company: assignment.company.name,
            platforms: assignment.platforms,
            permissions: assignment.permissions
          });
        });
      }
      console.log('===================');
      
      if (assignmentsToRemove.length > 0 || assignmentsToAdd.length > 0 || assignmentsToUpdate.length > 0) {
        const messages = [];
        if (assignmentsToAdd.length > 0) messages.push(`Added ${assignmentsToAdd.length} company assignment(s)`);
        if (assignmentsToRemove.length > 0) messages.push(`Removed ${assignmentsToRemove.length} company assignment(s)`);
        if (assignmentsToUpdate.length > 0) messages.push(`Updated ${assignmentsToUpdate.length} existing assignment(s) with new platforms`);
        
        setSuccess(`Manager updated successfully! ${messages.join('. ')}.`);
      } else {
        setSuccess('Manager updated successfully!');
      }
      setTimeout(() => setSuccess(null), 5000);
      
      setIsEditManagerOpen(false);
      setSelectedManager(null);
      
      // Reset form
      setManagerData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        companyIds: [],
        platforms: [],
        department: "",
        role: [], // Initialize as empty array for multi-select
        startDate: "",
        salary: "",
        actualSalary: "",
        location: "",
        status: 'ACTIVE',
        skills: "",
        avatar: "",
        permissions: {
          canManageAssets: false,
          canModifyCompanies: false,
          canCreateCompanies: false,
          canDeleteCompanies: false,
        },
      });
      resetDepartmentForm();
      
      fetchManagers();
    } catch (err) {
      console.error('Failed to update manager:', err);
      setError(err instanceof Error ? err.message : 'Failed to update manager');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteManager = async (managerId: string) => {
    if (!confirm('Are you sure you want to delete this manager? This action cannot be undone.')) return;

    try {
      // Delete manager (assuming managers are users)
      await apiClient.deleteUser(managerId);
      setManagers(prev => prev.filter(mgr => mgr.id !== managerId));
      setSuccess('Manager deleted successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to delete manager:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete manager');
    }
  };

  const generatePermissions = (platforms: string[]) => {
    const permissions: Record<string, {
      read: boolean;
      write: boolean;
      delete: boolean;
      manage: boolean;
    }> = {};
    platforms.forEach(platform => {
      permissions[platform] = {
        read: true,
        write: true,
        delete: false, // Managers typically don't have delete permissions
        manage: false
      };
    });
    return permissions;
  };

  // Department management functions
  const filteredDepartments = departments.filter(dept => 
    dept.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  const handleAddDepartment = () => {
    if (newDepartmentName.trim() && !departments.includes(newDepartmentName.trim())) {
      setDepartments(prev => [...prev, newDepartmentName.trim()]);
      setNewDepartmentName("");
      setIsAddDepartmentOpen(false);
    }
  };

  const handleDeleteDepartment = (departmentToDelete: string) => {
    // Don't allow deletion of core departments
    const coreDepartments = ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"];
    if (coreDepartments.includes(departmentToDelete)) {
      return;
    }
    setDepartments(prev => prev.filter(dept => dept !== departmentToDelete));
  };

  // Reset department search when forms are closed
  const resetDepartmentForm = () => {
    setDepartmentSearch("");
    setNewDepartmentName("");
    setIsAddDepartmentOpen(false);
  };

  const filteredManagers = managers.filter(manager => {
    const matchesSearch = 
      manager.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = companyFilter === 'ALL' || 
      manager.assignedCompanyId === companyFilter ||
      (manager.managerAssignments && manager.managerAssignments.some(assignment => assignment.companyId === companyFilter));
      
    return matchesSearch && matchesCompany;
  });



  const unassignedManagers = managers.filter(manager => 
    !manager.assignedCompanyId && (!manager.managerAssignments || manager.managerAssignments.length === 0)
  );

  // Get available people for assignment (managers and employees not assigned to the selected company)
  const getAvailablePeople = () => {
    if (!assignmentData.companyId) return [];
    
    const availableManagers = managers.filter(manager => 
      manager.role === 'MANAGER' && 
      (!manager.managerAssignments || !manager.managerAssignments.some(assignment => assignment.companyId === assignmentData.companyId))
    );

    const availableEmployees = employees.filter(employee => 
      employee.companyId !== assignmentData.companyId && // Not already working for this company
      !managers.some(manager => manager.email === employee.email) // Not already a manager
    );

    // Combine and sort by name
    const allAvailable = [
      ...availableManagers.map(manager => ({
        id: manager.id,
        firstName: manager.firstName,
        lastName: manager.lastName,
        email: manager.email,
        type: 'manager',
        currentRole: 'Manager',
        companyName: manager.assignedCompany?.name || 'Unassigned'
      })),
      ...availableEmployees.map(employee => ({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        type: 'employee',
        currentRole: employee.role || employee.position,
        companyName: employee.companyName
      }))
    ].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

    return allAvailable;
  };

  if (loading) {
  return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading managers...</span>
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

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4">
          {/* Header */}
          <motion.div {...fadeInUp} className="text-center space-y-2 mb-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Manager Administration
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Create and manage company managers with platform access controls
                </p>
              </div>
            </div>
          </motion.div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-3 shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-green-800 font-medium text-sm">{success}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-3 shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-red-800 font-medium text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unassigned Managers Alert */}
          {unassignedManagers.length > 0 && (
            <motion.div {...fadeInUp}>
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-900">
                          {unassignedManagers.length} Unassigned Manager{unassignedManagers.length !== 1 ? 's' : ''}
                        </h3>
                        <p className="text-sm text-amber-700">
                          These managers need to be assigned to companies to access platforms
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      onClick={() => setIsAssignManagerOpen(true)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Assign Managers
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {unassignedManagers.slice(0, 5).map((manager) => (
                      <div key={manager.id} className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-amber-200">
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-amber-700">
                            {manager.firstName[0]}{manager.lastName[0]}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-amber-900">
                          {manager.firstName} {manager.lastName}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 hover:bg-amber-200"
                          onClick={() => {
                            setAssignmentData(prev => ({ ...prev, managerId: manager.id }));
                            setIsAssignManagerOpen(true);
                          }}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {unassignedManagers.length > 5 && (
                      <span className="text-sm text-amber-600 px-3 py-1">
                        +{unassignedManagers.length - 5} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Controls */}
          <motion.div {...fadeInUp} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
                <div className="relative flex-1 min-w-0 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search managers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500 h-9"
                  />
                </div>
                
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-full sm:w-64 bg-white border-gray-200 h-9">
                    <SelectValue placeholder="Filter by company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Companies</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <Dialog open={isAssignManagerOpen} onOpenChange={setIsAssignManagerOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 h-9"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Assign Manager
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2 text-xl">
                        <Users className="w-6 h-6 text-purple-600" />
                        <span>Assign Manager to Company</span>
                      </DialogTitle>
                      <DialogDescription>
                        Assign an existing manager to a company with platform access permissions
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAssignManager} className="space-y-6 py-4">
                      <div>
                        <Label htmlFor="manager" className="text-sm font-medium text-gray-700">Select Manager</Label>
                        <Select 
                          value={assignmentData.managerId} 
                          onValueChange={(value) => setAssignmentData(prev => ({ ...prev, managerId: value }))}
                          required
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Choose a manager to assign" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailablePeople().map((person) => (
                              <SelectItem key={person.id} value={person.id}>
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-semibold text-purple-700">
                                      {person.firstName[0]}{person.lastName[0]}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{person.firstName} {person.lastName}</span>
                                    <span className="text-sm text-gray-500">{person.email}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {getAvailablePeople().length === 0 && (
                          <p className="text-sm text-amber-600 mt-1">
                            No available people found. All managers and employees are already assigned to this company.
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="assignCompany" className="text-sm font-medium text-gray-700">Assign to Company</Label>
                        <Select 
                          value={assignmentData.companyId} 
                          onValueChange={(value) => setAssignmentData(prev => ({ ...prev, companyId: value, managerId: "" }))}
                          required
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select company for assignment" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{company.name}</span>
                                  <span className="text-sm text-gray-500">{company.industry} • {company.location}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700">Platform Access Permissions (Optional)</Label>
                        <p className="text-sm text-gray-500 mb-3">Select which platforms this manager can access. If none selected, Employee Management will be assigned by default.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availablePlatforms.map((platform) => (
                            <label key={platform.id} className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group">
                              <input
                                type="checkbox"
                                checked={assignmentData.platforms.includes(platform.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignmentData(prev => ({ ...prev, platforms: [...prev.platforms, platform.id] }));
                                  } else {
                                    setAssignmentData(prev => ({ ...prev, platforms: prev.platforms.filter(p => p !== platform.id) }));
                                  }
                                }}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                                  {platform.name}
                                </span>
                                <p className="text-xs text-gray-500">
                                  {platform.description}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsAssignManagerOpen(false);
                            setAssignmentData({
                              managerId: "",
                              companyId: "",
                              platforms: []
                            });
                          }}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting || !assignmentData.managerId || !assignmentData.companyId}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 min-w-[120px]"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Assigning...
                            </>
                          ) : (
                            'Assign Manager'
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isCreateManagerOpen} onOpenChange={setIsCreateManagerOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg h-9">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Manager
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] glass-card border-refined max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-elegant text-gradient">Create New Manager</DialogTitle>
                                          <DialogDescription className="text-refined">
                      Create a new manager profile with company assignment and platform permissions.
                      <br />
                      <span className="text-xs text-amber-600 mt-1 block">
                        📌 Note: Only Super Admin users can create managers.
                      </span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                      <form onSubmit={handleCreateManager} className="space-y-6">
                        <ImageUpload
                          id="manager-avatar"
                          label="Profile Photo"
                          value={managerData.avatar}
                          onChange={(value) => setManagerData(prev => ({ ...prev, avatar: value || "" }))}
                          placeholder="Upload profile photo"
                          size="lg"
                          shape="circle"
                        />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                          <Input
                            id="firstName"
                              placeholder="Enter first name..."
                            value={managerData.firstName}
                            onChange={(e) => setManagerData(prev => ({ ...prev, firstName: e.target.value }))}
                              className="border-refined"
                            required
                          />
                        </div>

                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                          <Input
                            id="lastName"
                              placeholder="Enter last name..."
                            value={managerData.lastName}
                            onChange={(e) => setManagerData(prev => ({ ...prev, lastName: e.target.value }))}
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
                              placeholder="manager@company.com"
                          value={managerData.email}
                          onChange={(e) => setManagerData(prev => ({ ...prev, email: e.target.value }))}
                              className="border-refined"
                          required
                        />
                      </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                        <Input
                              id="phone"
                              placeholder="+971 50 123 4567"
                              value={managerData.phone}
                              onChange={(e) => setManagerData(prev => ({ ...prev, phone: e.target.value }))}
                              className="border-refined"
                            />
                          </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter secure password..."
                          value={managerData.password}
                          onChange={(e) => setManagerData(prev => ({ ...prev, password: e.target.value }))}
                          className="border-refined"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Manager will use this password to log into the system
                        </p>
                      </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center space-x-2">
                            <Building className="w-4 h-4" />
                            <span>Companies to Manage *</span>
                          </Label>
                          <p className="text-xs text-muted-foreground mb-3">Select multiple companies this manager will oversee</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                            {companies.map((company) => (
                              <label key={company.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-white cursor-pointer transition-colors duration-200 group">
                                <input
                                  type="checkbox"
                                  checked={managerData.companyIds.includes(company.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setManagerData(prev => ({ ...prev, companyIds: [...prev.companyIds, company.id] }));
                                    } else {
                                      setManagerData(prev => ({ ...prev, companyIds: prev.companyIds.filter(id => id !== company.id) }));
                                    }
                                  }}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                                    {company.name}
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    {company.industry} • {company.location}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                          {managerData.companyIds.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-green-600 font-medium">
                                ✓ {managerData.companyIds.length} company{managerData.companyIds.length !== 1 ? 'ies' : 'y'} selected
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                          <Select value={managerData.department} onValueChange={(value) => setManagerData(prev => ({ ...prev, department: value }))} required>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                              <div className="p-2 space-y-2">
                                {/* Search Input */}
                                <div className="relative">
                                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search departments..."
                                    value={departmentSearch}
                                    onChange={(e) => setDepartmentSearch(e.target.value)}
                                    className="pl-8"
                                  />
                                </div>
                                
                                {/* Add Department Button */}
                                <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full justify-start text-left border-dashed"
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add New Department
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Add New Department</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="newDepartment">Department Name</Label>
                                        <Input
                                          id="newDepartment"
                                          placeholder="Enter department name..."
                                          value={newDepartmentName}
                                          onChange={(e) => setNewDepartmentName(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleAddDepartment();
                                            }
                                          }}
                                        />
                                      </div>
                                      <div className="flex justify-end space-x-2">
                                        <Button 
                                          variant="outline" 
                                          onClick={() => setIsAddDepartmentOpen(false)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button onClick={handleAddDepartment}>
                                          Add Department
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              
                              {/* Department Options */}
                              {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept) => (
                                  <SelectItem key={dept} value={dept}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{dept === "HR" ? "Human Resources" : dept}</span>
                                      {!["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"].includes(dept) && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0 ml-2 hover:bg-red-100 hover:text-red-600"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteDepartment(dept);
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                </div>
                              </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                  No departments found
                                </div>
                              )}
                          </SelectContent>
                        </Select>
                      </div>

                        {/* Role/Function */}
                        <div className="space-y-2">
                          <RoleSelector
                            value={managerData.role}
                            onChange={(value) => setManagerData(prev => ({ ...prev, role: value }))}
                            label="Role/Function"
                            placeholder="Select manager roles..."
                            required
                            multi={true}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-sm font-medium">Start Date *</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={managerData.startDate}
                              onChange={(e) => setManagerData(prev => ({ ...prev, startDate: e.target.value }))}
                              className="border-refined"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="salary" className="text-sm font-medium">Official Salary</Label>
                            <Input
                              id="salary"
                              placeholder="AED 15,000"
                              value={managerData.salary}
                              onChange={(e) => setManagerData(prev => ({ ...prev, salary: e.target.value }))}
                              className="border-refined"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="actualSalary" className="text-sm font-medium">Actual Salary</Label>
                            <Input
                              id="actualSalary"
                              placeholder="AED 18,000"
                              value={managerData.actualSalary}
                              onChange={(e) => setManagerData(prev => ({ ...prev, actualSalary: e.target.value }))}
                              className="border-refined"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                            <Input
                              id="location"
                              placeholder="Dubai, UAE"
                              value={managerData.location}
                              onChange={(e) => setManagerData(prev => ({ ...prev, location: e.target.value }))}
                              className="border-refined"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                                                      <Select value={managerData.status} onValueChange={(value) => setManagerData(prev => ({ ...prev, status: value as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' }))}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="skills" className="text-sm font-medium">Skills</Label>
                            <Input
                              id="skills"
                              placeholder="Leadership, Strategy, Communication (comma separated)"
                              value={managerData.skills}
                              onChange={(e) => setManagerData(prev => ({ ...prev, skills: e.target.value }))}
                              className="border-refined"
                            />
                          </div>
                        </div>

                        {/* Platform Access Permissions */}
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            <span>Platform Access Permissions</span>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">Select which platforms this manager can access</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availablePlatforms.map((platform) => (
                            <label key={platform.id} className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group">
                              <input
                                type="checkbox"
                                checked={managerData.platforms.includes(platform.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setManagerData(prev => ({ ...prev, platforms: [...prev.platforms, platform.id] }));
                                  } else {
                                    setManagerData(prev => ({ ...prev, platforms: prev.platforms.filter(p => p !== platform.id) }));
                                  }
                                }}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                                  {platform.name}
                                </span>
                                <p className="text-xs text-gray-500">
                                  {platform.description}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>

                        {/* Management Permissions */}
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                            <Crown className="w-5 h-5 text-amber-600" />
                            <span>Management Capabilities</span>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">Additional management permissions for this manager</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group">
                              <input
                                type="checkbox"
                                checked={managerData.permissions.canManageAssets}
                                onChange={(e) => {
                                  setManagerData(prev => ({ 
                                    ...prev, 
                                    permissions: { 
                                      ...prev.permissions, 
                                      canManageAssets: e.target.checked 
                                    } 
                                  }));
                                }}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-amber-700 transition-colors duration-200">
                                  Asset Management
                                </span>
                                <p className="text-xs text-gray-500">
                                  Can add, edit, and manage company assets
                                </p>
                              </div>
                            </label>

                            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group">
                              <input
                                type="checkbox"
                                checked={managerData.permissions.canModifyCompanies}
                                onChange={(e) => {
                                  setManagerData(prev => ({ 
                                    ...prev, 
                                    permissions: { 
                                      ...prev.permissions, 
                                      canModifyCompanies: e.target.checked 
                                    } 
                                  }));
                                }}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-amber-700 transition-colors duration-200">
                                  Company Modification
                                </span>
                                <p className="text-xs text-gray-500">
                                  Can edit company information and settings
                                </p>
                              </div>
                            </label>

                            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group">
                              <input
                                type="checkbox"
                                checked={managerData.permissions.canCreateCompanies}
                                onChange={(e) => {
                                  setManagerData(prev => ({ 
                                    ...prev, 
                                    permissions: { 
                                      ...prev.permissions, 
                                      canCreateCompanies: e.target.checked 
                                    } 
                                  }));
                                }}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-amber-700 transition-colors duration-200">
                                  Company Creation
                                </span>
                                <p className="text-xs text-gray-500">
                                  Can create new companies in the system
                                </p>
                              </div>
                            </label>

                            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group">
                              <input
                                type="checkbox"
                                checked={managerData.permissions.canDeleteCompanies}
                                onChange={(e) => {
                                  setManagerData(prev => ({ 
                                    ...prev, 
                                    permissions: { 
                                      ...prev.permissions, 
                                      canDeleteCompanies: e.target.checked 
                                    } 
                                  }));
                                }}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-red-700 transition-colors duration-200 flex items-center">
                                  Company Deletion
                                  <AlertTriangle className="w-3 h-3 ml-1 text-red-500" />
                                </span>
                                <p className="text-xs text-gray-500">
                                  Can delete companies (use with caution)
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                          type="button"
                          variant="outline"
                            onClick={() => {
                              setIsCreateManagerOpen(false);
                              resetDepartmentForm();
                            }}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 min-w-[120px]"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Manager'
                          )}
                        </Button>
                      </div>
                    </form>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Manager Detail Dialog */}
                <Dialog open={isManagerDetailOpen} onOpenChange={setIsManagerDetailOpen}>
                  <DialogContent className="sm:max-w-[600px] glass-card border-refined max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-elegant text-gradient">Manager Details</DialogTitle>
                      <DialogDescription className="text-refined">
                        View detailed information about this manager.
                      </DialogDescription>
                    </DialogHeader>
                    {selectedManager && (
                      <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2 space-y-6">
                        {/* Profile Section */}
                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                          <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                            <AvatarImage src={selectedManager.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 font-semibold text-lg">
                              {selectedManager.firstName[0]}{selectedManager.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {selectedManager.firstName} {selectedManager.lastName}
                            </h3>
                            <p className="text-gray-600 flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {selectedManager.email}
                            </p>
                            <Badge className="mt-2 bg-purple-100 text-purple-700 border border-purple-200">
                              {selectedManager.role || 'Manager'}
                            </Badge>
                          </div>
                        </div>

                        {/* Companies Managed */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 flex items-center">
                              <Building className="w-4 h-4 mr-2 text-indigo-600" />
                              Companies Managed
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {(selectedManager.managerAssignments?.length || 0) + (selectedManager.assignedCompany ? 1 : 0)} Companies
                            </Badge>
                          </div>
                          
                          {selectedManager.assignedCompany ? (
                            <div className="border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                                      {selectedManager.assignedCompany.name.charAt(0)}
                                    </div>
                                    <div>
                                      <h5 className="font-semibold text-gray-900">{selectedManager.assignedCompany.name}</h5>
                                      <p className="text-sm text-gray-600">{selectedManager.assignedCompany.industry}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                                      {selectedManager.assignedCompany.location}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                                      {employees.filter(emp => emp.companyId === selectedManager.assignedCompany?.id).length} Employees
                                    </div>
                                  </div>
                                </div>
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  {selectedManager.assignedCompany.status}
                                </Badge>
                              </div>
                            </div>
                          ) : null}

                          {(selectedManager.managerAssignments && selectedManager.managerAssignments.length > 0) ? (
                            <div className="space-y-3">
                              {selectedManager.managerAssignments.map((assignment, index) => (
                                <div key={assignment.id} className="border border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 hover:shadow-md transition-all duration-200 group">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                                          {assignment.company.name.charAt(0)}
                                        </div>
                                        <div>
                                          <h5 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                            {assignment.company.name}
                                          </h5>
                                          <p className="text-sm text-gray-600">{assignment.company.industry}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                        <div className="flex items-center text-sm text-gray-600">
                                          <Building className="w-4 h-4 mr-2 text-gray-400" />
                                          {assignment.company.location}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                                          {employees.filter(emp => emp.companyId === assignment.companyId).length} Employees
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                          <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                                          {assignment.platforms.length} Platforms
                                        </div>
                                      </div>

                                      {/* Platform badges for this company */}
                                      <div className="flex flex-wrap gap-1 mt-3">
                                        {assignment.platforms.map((platform) => {
                                          const platformInfo = availablePlatforms.find(p => p.id === platform);
                                          return (
                                            <Badge 
                                              key={`${assignment.id}-${platform}`} 
                                              variant="secondary" 
                                              className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200"
                                            >
                                              {platformInfo?.name || platform}
                                            </Badge>
                                          );
                                        })}
                                      </div>

                                      {/* Permissions summary */}
                                      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-600 font-medium mb-1">Permissions:</div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                          {assignment.permissions?.canManageAssets && (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Manage Assets</span>
                                          )}
                                          {assignment.permissions?.canModifyCompanies && (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Modify Companies</span>
                                          )}
                                          {assignment.permissions?.canCreateCompanies && (
                                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Create Companies</span>
                                          )}
                                          {assignment.permissions?.canDeleteCompanies && (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Delete Companies</span>
                                          )}
                                          {!assignment.permissions?.canManageAssets && 
                                           !assignment.permissions?.canModifyCompanies && 
                                           !assignment.permissions?.canCreateCompanies && 
                                           !assignment.permissions?.canDeleteCompanies && (
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">View Only</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2">
                                      <Badge className={`text-xs ${assignment.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                        {assignment.isActive ? 'Active' : 'Inactive'}
                                      </Badge>
                                      <Badge className={`text-xs ${assignment.company.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                        {assignment.company.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {!selectedManager.assignedCompany && (!selectedManager.managerAssignments || selectedManager.managerAssignments.length === 0) && (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                              <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500 font-medium">No companies assigned</p>
                              <p className="text-sm text-gray-400 mt-1">This manager hasn't been assigned to manage any companies yet.</p>
                            </div>
                          )}
                        </div>

                        {/* Platform Access Summary */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 flex items-center">
                              <Shield className="w-4 h-4 mr-2 text-purple-600" />
                              Platform Access Summary
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {selectedManager.managerAssignments ? 
                                [...new Set(selectedManager.managerAssignments.flatMap(a => a.platforms))].length : 0} Platforms
                            </Badge>
                          </div>
                          
                          {(selectedManager.managerAssignments && selectedManager.managerAssignments.length > 0) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[...new Set(selectedManager.managerAssignments.flatMap(a => a.platforms))].map((platform) => {
                                const platformInfo = availablePlatforms.find(p => p.id === platform);
                                const companiesWithThisPlatform = selectedManager.managerAssignments?.filter(a => a.platforms.includes(platform)) || [];
                                
                                return (
                                  <div key={platform} className="border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center">
                                          <Shield className="w-3 h-3 text-white" />
                                        </div>
                                        <h5 className="font-medium text-gray-900">{platformInfo?.name || platform}</h5>
                                      </div>
                                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                        {companiesWithThisPlatform.length} {companiesWithThisPlatform.length === 1 ? 'Company' : 'Companies'}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">{platformInfo?.description || 'Platform access'}</p>
                                    <div className="text-xs text-gray-500">
                                      Used in: {companiesWithThisPlatform.map(a => a.company.name).join(', ')}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-purple-50 rounded-xl border-2 border-dashed border-purple-200">
                              <Shield className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                              <p className="text-purple-600 font-medium">No platform access assigned</p>
                              <p className="text-sm text-purple-400 mt-1">This manager doesn't have access to any platforms yet.</p>
                            </div>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Created:</span>
                            <p>{new Date(selectedManager.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Last Updated:</span>
                            <p>{new Date(selectedManager.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Edit Manager Dialog */}
                <Dialog open={isEditManagerOpen} onOpenChange={setIsEditManagerOpen}>
                  <DialogContent className="sm:max-w-[600px] glass-card border-refined max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-elegant text-gradient">Edit Manager</DialogTitle>
                      <DialogDescription className="text-refined">
                        Update manager information and platform permissions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                      <form onSubmit={handleUpdateManager} className="space-y-6">
                        <ImageUpload
                          id="edit-manager-avatar"
                          label="Profile Photo"
                          value={managerData.avatar}
                          onChange={(value) => setManagerData(prev => ({ ...prev, avatar: value || "" }))}
                          placeholder="Upload profile photo"
                          size="lg"
                          shape="circle"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-firstName" className="text-sm font-medium">First Name *</Label>
                            <Input
                              id="edit-firstName"
                              placeholder="Enter first name..."
                              value={managerData.firstName}
                              onChange={(e) => setManagerData(prev => ({ ...prev, firstName: e.target.value }))}
                              className="border-refined"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-lastName" className="text-sm font-medium">Last Name *</Label>
                            <Input
                              id="edit-lastName"
                              placeholder="Enter last name..."
                              value={managerData.lastName}
                              onChange={(e) => setManagerData(prev => ({ ...prev, lastName: e.target.value }))}
                              className="border-refined"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-email" className="text-sm font-medium">Email *</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            placeholder="manager@company.com"
                            value={managerData.email}
                            onChange={(e) => setManagerData(prev => ({ ...prev, email: e.target.value }))}
                            className="border-refined"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center space-x-2">
                            <Building className="w-4 h-4" />
                            <span>Companies to Manage</span>
                          </Label>
                          <p className="text-xs text-muted-foreground mb-3">Select multiple companies this manager will oversee</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                            {companies.map((company) => (
                              <label key={company.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-white cursor-pointer transition-colors duration-200 group">
                                <input
                                  type="checkbox"
                                  checked={managerData.companyIds.includes(company.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setManagerData(prev => ({ ...prev, companyIds: [...prev.companyIds, company.id] }));
                                    } else {
                                      setManagerData(prev => ({ ...prev, companyIds: prev.companyIds.filter(id => id !== company.id) }));
                                    }
                                  }}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                                    {company.name}
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    {company.industry} • {company.location}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                          {managerData.companyIds.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-green-600 font-medium">
                                ✓ {managerData.companyIds.length} company{managerData.companyIds.length !== 1 ? 'ies' : 'y'} selected
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Platform Access Permissions */}
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            <span>Platform Access Permissions</span>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">Select which platforms this manager can access</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {availablePlatforms.map((platform) => (
                              <label key={platform.id} className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group">
                                <input
                                  type="checkbox"
                                  checked={managerData.platforms.includes(platform.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setManagerData(prev => ({ ...prev, platforms: [...prev.platforms, platform.id] }));
                                    } else {
                                      setManagerData(prev => ({ ...prev, platforms: prev.platforms.filter(p => p !== platform.id) }));
                                    }
                                  }}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                                    {platform.name}
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    {platform.description}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Management Permissions */}
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                            <Crown className="w-5 h-5 text-amber-600" />
                            <span>Management Capabilities</span>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">Additional management permissions for this manager</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group">
                              <input
                                type="checkbox"
                                checked={managerData.permissions.canManageAssets}
                                onChange={(e) => {
                                  setManagerData(prev => ({ 
                                    ...prev, 
                                    permissions: { 
                                      ...prev.permissions, 
                                      canManageAssets: e.target.checked 
                                    } 
                                  }));
                                }}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-amber-700 transition-colors duration-200">
                                  Asset Management
                                </span>
                                <p className="text-xs text-gray-500">
                                  Can add, edit, and manage company assets
                                </p>
                              </div>
                            </label>

                            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group">
                              <input
                                type="checkbox"
                                checked={managerData.permissions.canModifyCompanies}
                                onChange={(e) => {
                                  setManagerData(prev => ({ 
                                    ...prev, 
                                    permissions: { 
                                      ...prev.permissions, 
                                      canModifyCompanies: e.target.checked 
                                    } 
                                  }));
                                }}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-amber-700 transition-colors duration-200">
                                  Company Modification
                                </span>
                                <p className="text-xs text-gray-500">
                                  Can edit company information and settings
                                </p>
                              </div>
                            </label>

                            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group">
                              <input
                                type="checkbox"
                                checked={managerData.permissions.canCreateCompanies}
                                onChange={(e) => {
                                  setManagerData(prev => ({ 
                                    ...prev, 
                                    permissions: { 
                                      ...prev.permissions, 
                                      canCreateCompanies: e.target.checked 
                                    } 
                                  }));
                                }}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-amber-700 transition-colors duration-200">
                                  Company Creation
                                </span>
                                <p className="text-xs text-gray-500">
                                  Can create new companies in the system
                                </p>
                              </div>
                            </label>

                            <label className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group">
                              <input
                                type="checkbox"
                                checked={managerData.permissions.canDeleteCompanies}
                                onChange={(e) => {
                                  setManagerData(prev => ({ 
                                    ...prev, 
                                    permissions: { 
                                      ...prev.permissions, 
                                      canDeleteCompanies: e.target.checked 
                                    } 
                                  }));
                                }}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 group-hover:text-red-700 transition-colors duration-200 flex items-center">
                                  Company Deletion
                                  <AlertTriangle className="w-3 h-3 ml-1 text-red-500" />
                                </span>
                                <p className="text-xs text-gray-500">
                                  Can delete companies (use with caution)
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditManagerOpen(false);
                              setSelectedManager(null);
                            }}
                            disabled={submitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 min-w-[120px]"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              'Update Manager'
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>

          {/* Managers Table */}
          <motion.div {...fadeInUp}>
            <Card className="shadow-lg border-0 bg-white overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50 p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg text-gray-800 flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span>Platform Managers</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm mt-1">
                      Manage company managers and their platform access permissions
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white text-purple-700 border-purple-200 px-2 py-1 text-xs">
                      {filteredManagers.length} Manager{filteredManagers.length !== 1 ? 's' : ''}
                    </Badge>
                    {unassignedManagers.length > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-2 py-1 text-xs">
                        {unassignedManagers.length} Unassigned
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-3" />
                      <span className="text-gray-600 font-medium text-sm">Loading managers...</span>
                    </div>
                  </div>
                ) : filteredManagers.length === 0 ? (
                  <div className="text-center py-8 px-6">
                    <div className="max-w-md mx-auto">
                      <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No managers found</h3>
                      <p className="text-gray-500 mb-4 text-sm">
                        {searchTerm || companyFilter !== 'ALL' 
                          ? 'No managers match your current filters. Try adjusting your search criteria.' 
                          : 'Get started by creating your first manager to manage company platforms and employees.'
                        }
                      </p>
                      {!searchTerm && companyFilter === 'ALL' && (
                        <Button
                          onClick={() => setIsCreateManagerOpen(true)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Manager
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-100 bg-gray-50/50">
                          <TableHead className="font-semibold text-gray-700 py-3 text-sm">Manager</TableHead>
                          <TableHead className="font-semibold text-gray-700 py-3 text-sm">Company Assignment</TableHead>
                          <TableHead className="font-semibold text-gray-700 py-3 text-sm">Platform Access</TableHead>
                          <TableHead className="font-semibold text-gray-700 py-3 text-sm">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-right py-3 text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredManagers.map((manager) => (
                          <TableRow key={manager.id} className="border-gray-50 hover:bg-purple-50/30 transition-colors duration-200">
                            <TableCell className="py-3">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8 border-2 border-purple-100">
                                  <AvatarImage src={manager.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 font-semibold text-xs">
                                    {manager.firstName[0]}{manager.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-gray-900 text-sm">
                                    {manager.firstName} {manager.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {manager.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              {manager.assignedCompany ? (
                                <div className="flex items-center space-x-2">
                                  <Building className="w-4 h-4 text-indigo-600" />
                                  <div>
                                    <div className="font-medium text-gray-900 text-sm">{manager.assignedCompany.name}</div>
                                    <div className="text-xs text-gray-500">{manager.assignedCompany.industry}</div>
                                  </div>
                                </div>
                              ) : (manager.managerAssignments && manager.managerAssignments.length > 0) ? (
                                <div className="space-y-1">
                                  {manager.managerAssignments.map((assignment) => (
                                    <div key={assignment.id} className="flex items-center space-x-2">
                                      <Building className="w-4 h-4 text-indigo-600" />
                                      <div>
                                        <div className="font-medium text-gray-900 text-sm">{assignment.company.name}</div>
                                        <div className="text-xs text-gray-500">{assignment.company.industry}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic text-sm">Not assigned</span>
                              )}
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {(manager.managerAssignments && manager.managerAssignments.length > 0) ? (
                                  [...new Set(manager.managerAssignments.flatMap(assignment => assignment.platforms))].map((platform) => {
                                    const platformName = availablePlatforms.find(p => p.id === platform)?.name || platform;
                                    const companiesWithPlatform = manager.managerAssignments?.filter(a => a.platforms.includes(platform)) || [];
                                    return (
                                      <Badge 
                                        key={platform} 
                                        variant="secondary" 
                                        className="text-xs bg-indigo-100 text-indigo-700 border border-indigo-200"
                                        title={`${platformName} - Used in ${companiesWithPlatform.length} ${companiesWithPlatform.length === 1 ? 'company' : 'companies'}`}
                                      >
                                        {platformName}
                                      </Badge>
                                    );
                                  })
                                ) : (
                                  <span className="text-gray-400 italic text-xs">No access</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge 
                                variant={(manager.managerAssignments && manager.managerAssignments.some(a => a.isActive)) ? "default" : "secondary"} 
                                className={(manager.managerAssignments && manager.managerAssignments.some(a => a.isActive)) 
                                  ? "bg-green-100 text-green-700 border border-green-200 text-xs" 
                                  : "bg-gray-100 text-gray-700 border border-gray-200 text-xs"
                                }
                              >
                                {(manager.managerAssignments && manager.managerAssignments.some(a => a.isActive)) ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right py-3">
                              <div className="flex items-center justify-end space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 hover:bg-purple-100 hover:text-purple-700"
                                  onClick={() => handleManagerClick(manager)}
                                  title="View details"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-700"
                                  onClick={() => handleEditManager(manager)}
                                  title="Edit manager"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                
                                {/* Quick assign button for unassigned managers */}
                                {(!manager.managerAssignments || manager.managerAssignments.length === 0) && !manager.assignedCompanyId && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-green-100 hover:text-green-700"
                                    onClick={() => {
                                      setAssignmentData(prev => ({ ...prev, managerId: manager.id }));
                                      setIsAssignManagerOpen(true);
                                    }}
                                    title="Assign to company"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                )}
                                
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-700"
                                  onClick={() => handleDeleteManager(manager.id)}
                                  title="Delete manager"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                
                                {(manager.managerAssignments && manager.managerAssignments.length > 0) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-orange-100 hover:text-orange-700"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to remove all assignments for this manager?')) {
                                        (manager.managerAssignments || []).forEach(assignment => {
                                          handleRemoveAssignment(manager.id, assignment.companyId);
                                        });
                                      }
                                    }}
                                    title="Remove assignments"
                                  >
                                    <UserCheck className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 