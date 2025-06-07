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
  Building2,
  Loader2,
  User,
  Briefcase,
  DollarSign,
  Award,
  Clock,
  UserPlus,
  FileImage,
  TrendingUp,
  Car,
  CreditCard
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
import { ImageUpload } from "@/components/ui/image-upload";
import { EmployeeCardGenerator } from "@/components/ui/employee-card-generator";
import { VisaScanner } from "@/components/ui/visa-scanner";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  companyId: string;
  companyName: string;
  actualCompanyId?: string;
  actualCompanyName?: string;
  salary?: string;
  actualSalary?: string;
  startDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  location?: string;
  manager?: string;
  skills?: string[];
  avatar?: string;
  visa?: {
    id: string;
    visaNumber?: string;
    visaType?: string;
    issueDate?: string;
    expiryDate?: string;
    sponsor?: string;
    nationality?: string;
    passportNumber?: string;
    passportExpiry?: string;
    emiratesId?: string;
    emiratesIdExpiry?: string;
    laborCardNumber?: string;
    laborCardExpiry?: string;
    firstName?: string;
    lastName?: string;
    profession?: string;
    salary?: string;
    placeOfBirth?: string;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  name: string;
  industry: string;
  logo?: string;
}

interface Employer {
  id: string;
  nameEnglish: string;
  nameArabic?: string;
  category: string;
  picture?: string;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  companyId: string;
  actualCompanyId: string;
  employerId: string;
  salary: string;
  actualSalary: string;
  startDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  location: string;
  manager: string;
  skills: string;
  avatar: string;
  // Driver-specific fields
  licenseNumber: string;
  vehicleInfo: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyPhone: string;
  experience: string;
  licenseDocument: string;
  vehicleRegistration: string;
}

export default function EmployeesPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEmployeeDetailOpen, setIsEmployeeDetailOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
  const [isCardGeneratorOpen, setIsCardGeneratorOpen] = useState(false);
  const [selectedEmployeeForCard, setSelectedEmployeeForCard] = useState<Employee | null>(null);
  const [isVisaScannerOpen, setIsVisaScannerOpen] = useState(false);
  const [visaData, setVisaData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    companyId: "",
    actualCompanyId: "",
    employerId: "none",
    salary: "",
    actualSalary: "",
    startDate: "",
    status: "ACTIVE",
    location: "",
    manager: "",
    skills: "",
    avatar: "",
    // Driver-specific fields
    licenseNumber: "",
    vehicleInfo: "",
    dateOfBirth: "",
    emergencyContact: "",
    emergencyPhone: "",
    experience: "",
    licenseDocument: "",
    vehicleRegistration: ""
  });

  useEffect(() => {
    fetchEmployees();
    fetchCompanies();
    fetchEmployers();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, companyFilter, departmentFilter, statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100,
        ...(searchTerm && { search: searchTerm }),
        ...(companyFilter !== 'ALL' && { companyId: companyFilter }),
        ...(departmentFilter !== 'ALL' && { department: departmentFilter }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      };

      const data = await apiClient.getEmployees(params);
      setEmployees(data.employees || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await apiClient.getCompanies({ limit: 1000 });
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchEmployers = async () => {
    try {
      const data = await apiClient.getEmployers({ limit: 1000 });
      setEmployers(data.employers || []);
    } catch (err) {
      console.error('Failed to fetch employers:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800';
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

  const handleEmployeeClick = async (employee: Employee) => {
    try {
      const detailedEmployee = await apiClient.getEmployeeById(employee.id);
      setSelectedEmployee(detailedEmployee);
      setIsEmployeeDetailOpen(true);
    } catch (err) {
      console.error('Failed to fetch employee details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employee details');
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Client-side validation
    if (!employeeData.firstName.trim()) {
      setError('First name is required');
      setSubmitting(false);
      return;
    }
    if (!employeeData.lastName.trim()) {
      setError('Last name is required');
      setSubmitting(false);
      return;
    }
    if (!employeeData.email.trim()) {
      setError('Email is required');
      setSubmitting(false);
      return;
    }
    if (!employeeData.department.trim()) {
      setError('Department is required');
      setSubmitting(false);
      return;
    }
    if (!employeeData.role.trim()) {
      setError('Role selection is required');
      setSubmitting(false);
      return;
    }
    if (!employeeData.companyId.trim()) {
      setError('Company selection is required');
      setSubmitting(false);
      return;
    }

    // Additional validation for driver role
    const isDriverRole = employeeData.role === 'DRIVER' || employeeData.role.toLowerCase().includes('driver');
    const isMarahCompany = companies.find(company => 
      company.id === employeeData.companyId && 
      company.name === 'MARAH Inflatable Games Rental'
    );

    if (isDriverRole && isMarahCompany) {
      if (!employeeData.phone.trim()) {
        setError('Phone number is required for drivers in MARAH company');
        setSubmitting(false);
        return;
      }
    }

    try {
      // Create employee payload without driver-specific fields and employerId
      const {
        licenseNumber,
        vehicleInfo,
        dateOfBirth,
        emergencyContact,
        emergencyPhone,
        experience,
        licenseDocument,
        vehicleRegistration,
        employerId,
        ...employeeFields
      } = employeeData;

      const payload = {
        ...employeeFields,
        actualCompanyId: employeeData.actualCompanyId === "SAME_AS_OFFICIAL" ? undefined : employeeData.actualCompanyId,
        startDate: employeeData.startDate || new Date().toISOString().split('T')[0],
        avatar: employeeData.avatar || undefined,
        // Convert skills string to array
        skills: employeeData.skills ? employeeData.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
      };

      console.log('Creating employee with payload:', payload);
      const newEmployee = await apiClient.createEmployee(payload);
      
      // If visa data exists, save it for the new employee
      if (visaData && newEmployee.id) {
        try {
          await apiClient.createOrUpdateEmployeeVisa(newEmployee.id, visaData);
        } catch (visaErr) {
          console.error('Failed to save visa data:', visaErr);
          // Don't fail the entire operation if visa save fails
        }
      }

      // Auto-create driver if employee is assigned to MARAH and has a driver role
      await handleAutoCreateDriver(newEmployee, employeeData);
      
      setEmployees(prev => [...prev, newEmployee]);
      setIsAddEmployeeOpen(false);
      
      // Reset form and visa data
      setEmployeeData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        role: "",
        companyId: "",
        actualCompanyId: "",
        employerId: "none",
        salary: "",
        actualSalary: "",
        startDate: "",
        status: "ACTIVE",
        location: "",
        manager: "",
        skills: "",
        avatar: "",
        // Driver-specific fields
        licenseNumber: "",
        vehicleInfo: "",
        dateOfBirth: "",
        emergencyContact: "",
        emergencyPhone: "",
        experience: "",
        licenseDocument: "",
        vehicleRegistration: ""
      });
      setVisaData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoCreateDriver = async (employee: any, employeeData: EmployeeFormData) => {
    try {
      // Check if employee is assigned to MARAH company and has a driver role
      const isMarahEmployee = companies.find(company => 
        company.id === employeeData.companyId && 
        company.name === 'MARAH Inflatable Games Rental'
      );
      
      const isDriverRole = employeeData.role === 'DRIVER' || 
                          employeeData.role.toLowerCase().includes('driver');
      
      if (isMarahEmployee && isDriverRole) {
        console.log('Creating driver for MARAH employee:', employee.firstName, employee.lastName);
        
        // Validate required fields for driver creation
        if (!employeeData.phone?.trim()) {
          console.error('Cannot create driver: Phone number is required');
          setError('Phone number is required for driver creation');
          return;
        }
        
        // Create driver in MARAH system with only driver-specific fields
        const driverPayload = {
          name: `${employee.firstName} ${employee.lastName}`,
          phone: employeeData.phone.trim(),
          email: employeeData.email.trim(),
          licenseNumber: employeeData.licenseNumber?.trim() || undefined,
          vehicleInfo: employeeData.vehicleInfo?.trim() || undefined,
          vehicleRegistration: employeeData.vehicleRegistration?.trim() || undefined,
          status: 'ACTIVE' as const,
          profilePicture: employeeData.avatar?.trim() || undefined,
          dateOfBirth: employeeData.dateOfBirth?.trim() || undefined,
          address: employeeData.location?.trim() || undefined,
          emergencyContact: employeeData.emergencyContact?.trim() || undefined,
          emergencyPhone: employeeData.emergencyPhone?.trim() || undefined,
          experience: employeeData.experience?.trim() || undefined,
          licenseDocument: employeeData.licenseDocument?.trim() || undefined,
          salary: employeeData.salary ? parseFloat(employeeData.salary.replace(/[^0-9.]/g, '')) : undefined,
          companyId: employeeData.companyId,
        };

        // Remove undefined values to avoid API validation issues
        const cleanPayload = Object.fromEntries(
          Object.entries(driverPayload).filter(([_, value]) => value !== undefined)
        );

        console.log('Driver payload:', cleanPayload);

        const response = await fetch('/api/marah/drivers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(cleanPayload),
        });

        if (response.ok) {
          const createdDriver = await response.json();
          console.log('Driver created successfully for employee:', employee.firstName, employee.lastName, createdDriver);
        } else {
          const errorData = await response.json();
          console.error('Failed to create driver:', errorData);
          
          // Show specific error messages to user
          if (errorData.error?.includes('Phone number already exists')) {
            setError(`Driver creation failed: Phone number ${employeeData.phone} is already registered as a driver`);
          } else if (errorData.details) {
            const validationErrors = errorData.details.map((err: any) => err.message).join(', ');
            setError(`Driver creation failed: ${validationErrors}`);
          } else {
            setError(`Driver creation failed: ${errorData.error || 'Unknown error'}`);
          }
        }
      }
    } catch (error) {
      console.error('Error in auto-create driver:', error);
      setError('Failed to create driver record. Employee was created successfully.');
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || "",
      department: employee.department,
      role: (employee as any).role || "",
      companyId: employee.companyId,
      actualCompanyId: employee.actualCompanyId || "SAME_AS_OFFICIAL",
      employerId: (employee as any).employerId || "none",
      salary: employee.salary || "",
      actualSalary: employee.actualSalary || "",
      startDate: employee.startDate.split('T')[0], // Format for date input
      status: employee.status,
      location: employee.location || "",
      manager: employee.manager || "",
      skills: employee.skills?.join(', ') || "",
      avatar: employee.avatar || "",
      // Driver-specific fields
      licenseNumber: (employee as any).licenseNumber || "",
      vehicleInfo: (employee as any).vehicleInfo || "",
      dateOfBirth: (employee as any).dateOfBirth || "",
      emergencyContact: (employee as any).emergencyContact || "",
      emergencyPhone: (employee as any).emergencyPhone || "",
      experience: (employee as any).experience || "",
      licenseDocument: (employee as any).licenseDocument || "",
      vehicleRegistration: (employee as any).vehicleRegistration || ""
    });
    setIsEditEmployeeOpen(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setSubmitting(true);
    setError(null);

    // Client-side validation
    if (!employeeData.firstName.trim()) {
      setError('First name is required');
      setSubmitting(false);
      return;
    }
    if (!employeeData.lastName.trim()) {
      setError('Last name is required');
      setSubmitting(false);
      return;
    }
    if (!employeeData.email.trim()) {
      setError('Email is required');
      setSubmitting(false);
      return;
    }
    if (!employeeData.department.trim()) {
      setError('Department is required');
      setSubmitting(false);
      return;
    }
    if (!employeeData.role.trim()) {
      setError('Role selection is required');
      setSubmitting(false);
      return;
    }
    if (!employeeData.companyId.trim()) {
      setError('Company selection is required');
      setSubmitting(false);
      return;
    }

    // Additional validation for driver role
    const isDriverRole = employeeData.role === 'DRIVER' || employeeData.role.toLowerCase().includes('driver');
    const isMarahCompany = companies.find(company => 
      company.id === employeeData.companyId && 
      company.name === 'MARAH Inflatable Games Rental'
    );

    if (isDriverRole && isMarahCompany) {
      if (!employeeData.phone.trim()) {
        setError('Phone number is required for drivers in MARAH company');
        setSubmitting(false);
        return;
      }
    }

    try {
      // Create employee payload without driver-specific fields and employerId
      const {
        licenseNumber,
        vehicleInfo,
        dateOfBirth,
        emergencyContact,
        emergencyPhone,
        experience,
        licenseDocument,
        vehicleRegistration,
        employerId,
        ...employeeFields
      } = employeeData;

      const payload = {
        ...employeeFields,
        actualCompanyId: employeeData.actualCompanyId === "SAME_AS_OFFICIAL" ? undefined : employeeData.actualCompanyId,
        startDate: employeeData.startDate || selectedEmployee.startDate,
        avatar: employeeData.avatar || undefined,
        // Convert skills string to array
        skills: employeeData.skills ? employeeData.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
      };

      const updatedEmployee = await apiClient.updateEmployee(selectedEmployee.id, payload);
      
      // If visa data exists, save it for the employee
      if (visaData && selectedEmployee.id) {
        try {
          await apiClient.createOrUpdateEmployeeVisa(selectedEmployee.id, visaData);
        } catch (visaErr) {
          console.error('Failed to save visa data:', visaErr);
          // Don't fail the entire operation if visa save fails
        }
      }
      
      setEmployees(prev => prev.map(emp => emp.id === selectedEmployee.id ? updatedEmployee : emp));
      setIsEditEmployeeOpen(false);
      setSelectedEmployee(null);
      
      // Reset form and visa data
      setEmployeeData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        role: "",
        companyId: "",
        actualCompanyId: "",
        employerId: "none",
        salary: "",
        actualSalary: "",
        startDate: "",
        status: "ACTIVE",
        location: "",
        manager: "",
        skills: "",
        avatar: "",
        // Driver-specific fields
        licenseNumber: "",
        vehicleInfo: "",
        dateOfBirth: "",
        emergencyContact: "",
        emergencyPhone: "",
        experience: "",
        licenseDocument: "",
        vehicleRegistration: ""
      });
      setVisaData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await apiClient.deleteEmployee(employeeId);
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete employee');
      }
    }
  };

  const handleGenerateCard = (employee: Employee) => {
    setSelectedEmployeeForCard(employee);
    setIsCardGeneratorOpen(true);
  };

  const updateEmployeeData = (field: string, value: string) => {
    setEmployeeData(prev => ({ ...prev, [field]: value }));
  };

  const handleVisaDataExtracted = (data: any) => {
    setVisaData(data);
    
    console.log('Visa data received for auto-fill:', data);
    console.log('Current employee form data:', employeeData);
    
    // Auto-fill employee data from visa with comprehensive mapping
    // Always update names if they exist in visa data (even if form fields are not empty)
    if (data.firstName) {
      console.log('Auto-filling first name:', data.firstName);
      updateEmployeeData("firstName", data.firstName);
    }
    if (data.lastName) {
      console.log('Auto-filling last name:', data.lastName);
      updateEmployeeData("lastName", data.lastName);
    }
    
    // Auto-fill other fields only if form fields are empty
    if (data.nationality && !employeeData.location) {
      console.log('Auto-filling location from nationality:', data.nationality);
      updateEmployeeData("location", data.nationality);
    }
    
    // Auto-fill sponsor as company if available
    if (data.sponsor && !employeeData.companyId) {
      console.log('Looking for matching company for sponsor:', data.sponsor);
      // Try to find matching company by name
      const matchingCompany = companies.find(company => 
        company.name.toLowerCase().includes(data.sponsor.toLowerCase()) ||
        data.sponsor.toLowerCase().includes(company.name.toLowerCase())
      );
      if (matchingCompany) {
        console.log('Found matching company:', matchingCompany.name);
        updateEmployeeData("companyId", matchingCompany.id);
      } else {
        console.log('No matching company found for sponsor:', data.sponsor);
      }
    }



    // Auto-fill salary if available
    if (data.salary && !employeeData.salary) {
      console.log('Auto-filling salary:', data.salary);
      updateEmployeeData("salary", data.salary);
    }

    // Set default department based on profession
    if (data.profession && !employeeData.department) {
      const professionToDepartment: { [key: string]: string } = {
        'engineer': 'Engineering',
        'developer': 'Engineering',
        'programmer': 'Engineering',
        'software': 'Engineering',
        'manager': 'Operations',
        'supervisor': 'Operations',
        'accountant': 'Finance',
        'finance': 'Finance',
        'marketing': 'Marketing',
        'sales': 'Sales',
        'hr': 'HR',
        'human resources': 'HR',
        'designer': 'Design',
        'analyst': 'Product',
      };

      const profession = data.profession.toLowerCase();
      for (const [keyword, department] of Object.entries(professionToDepartment)) {
        if (profession.includes(keyword)) {
          console.log('Auto-filling department based on profession:', department);
          updateEmployeeData("department", department);
          break;
        }
      }
    }

    console.log('Visa data extracted and auto-filled:', data);
    console.log('Updated employee form data will be:', {
      ...employeeData,
      firstName: data.firstName || employeeData.firstName,
      lastName: data.lastName || employeeData.lastName,
    });
  };

  const handleVisaDocumentUploaded = (document: string) => {
    // Store the visa document for later use
    console.log('Visa document uploaded:', document);
  };

  const filteredEmployees = employees;

  const uniqueDepartments = [...new Set(employees.map(e => e.department))];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading employees...</span>
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

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Page Header */}
          <motion.div 
            className="mb-6 sm:mb-8"
            {...fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl font-prestigious text-gradient mb-2">
              Employee Management
            </h2>
            <p className="text-sm sm:text-base text-refined text-muted-foreground">
              Manage employees across all companies and departments.
            </p>
          </motion.div>

          {/* Action Bar */}
          <motion.div 
            className="flex flex-col gap-4 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search and Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-refined h-11"
                />
              </div>
              
              {/* Filters - Stack on mobile, inline on larger screens */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-full sm:w-40 border-refined h-11">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Companies</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-32 border-refined h-11">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Departments</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32 border-refined h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Mode and Add Button Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center border border-border rounded-lg p-1 w-fit">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-9 px-4"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-9 px-4"
                >
                  Table
                </Button>
              </div>

              <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-premium h-11 w-full sm:w-auto">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] glass-card border-refined max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-elegant text-gradient">Add New Employee</DialogTitle>
                    <DialogDescription className="text-refined">
                      Create a new employee profile with company assignment.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                    <form onSubmit={handleCreateEmployee} className="space-y-6">
                      <ImageUpload
                        id="employee-avatar"
                        label="Profile Photo"
                        value={employeeData.avatar}
                        onChange={(value) => updateEmployeeData("avatar", value || "")}
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
                            value={employeeData.firstName}
                            onChange={(e) => updateEmployeeData("firstName", e.target.value)}
                            className="border-refined"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                          <Input
                            id="lastName"
                            placeholder="Enter last name..."
                            value={employeeData.lastName}
                            onChange={(e) => updateEmployeeData("lastName", e.target.value)}
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
                            placeholder="employee@company.com"
                            value={employeeData.email}
                            onChange={(e) => updateEmployeeData("email", e.target.value)}
                            className="border-refined"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium">
                            Phone
                            {(() => {
                              const isDriverRole = employeeData.role === 'DRIVER' || employeeData.role.toLowerCase().includes('driver');
                              const isMarahCompany = companies.find(company => 
                                company.id === employeeData.companyId && 
                                company.name === 'MARAH Inflatable Games Rental'
                              );
                              return isDriverRole && isMarahCompany ? <span className="text-red-500 ml-1">*</span> : null;
                            })()}
                          </Label>
                          <Input
                            id="phone"
                            placeholder="+971 50 123 4567"
                            value={employeeData.phone}
                            onChange={(e) => updateEmployeeData("phone", e.target.value)}
                            className="border-refined"
                            required={(() => {
                              const isDriverRole = employeeData.role === 'DRIVER' || employeeData.role.toLowerCase().includes('driver');
                              const isMarahCompany = companies.find(company => 
                                company.id === employeeData.companyId && 
                                company.name === 'MARAH Inflatable Games Rental'
                              );
                              return Boolean(isDriverRole && isMarahCompany);
                            })()}
                          />
                          {(() => {
                            const isDriverRole = employeeData.role === 'DRIVER' || employeeData.role.toLowerCase().includes('driver');
                            const isMarahCompany = companies.find(company => 
                              company.id === employeeData.companyId && 
                              company.name === 'MARAH Inflatable Games Rental'
                            );
                            return isDriverRole && isMarahCompany ? (
                              <p className="text-xs text-blue-600">Required for MARAH drivers</p>
                            ) : null;
                          })()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyId" className="text-sm font-medium">Company *</Label>
                        <Select value={employeeData.companyId} onValueChange={(value) => updateEmployeeData("companyId", value)} required>
                          <SelectTrigger className="border-refined">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map(company => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                        <Select value={employeeData.department} onValueChange={(value) => updateEmployeeData("department", value)} required>
                          <SelectTrigger className="border-refined">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Product">Product</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="HR">Human Resources</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Role/Function and Employer Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-sm font-medium flex items-center space-x-2">
                            <Briefcase className="w-4 h-4" />
                            <span>Role/Function *</span>
                          </Label>
                          <Select value={employeeData.role} onValueChange={(value) => updateEmployeeData("role", value)} required>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select employee role..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              <div className="px-2 py-1">
                                <div className="text-xs font-medium text-muted-foreground mb-1">Standard Roles</div>
                                <SelectItem value="MANAGER">Manager</SelectItem>
                                <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                                <SelectItem value="DRIVER">
                                  <div className="flex items-center space-x-2">
                                    <span>Driver</span>
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                      Driver
                                    </Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="SALES_REPRESENTATIVE">Sales Representative</SelectItem>
                                <SelectItem value="CUSTOMER_SERVICE">Customer Service</SelectItem>
                                <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                                <SelectItem value="HR_SPECIALIST">HR Specialist</SelectItem>
                                <SelectItem value="MARKETING_SPECIALIST">Marketing Specialist</SelectItem>
                                <SelectItem value="OPERATIONS_COORDINATOR">Operations Coordinator</SelectItem>
                                <SelectItem value="WAREHOUSE_STAFF">Warehouse Staff</SelectItem>
                                <SelectItem value="MAINTENANCE_TECHNICIAN">Maintenance Technician</SelectItem>
                                <SelectItem value="DELIVERY_COORDINATOR">Delivery Coordinator</SelectItem>
                                <SelectItem value="GAME_SETUP_SPECIALIST">Game Setup Specialist</SelectItem>
                                <SelectItem value="QUALITY_INSPECTOR">Quality Inspector</SelectItem>
                                <SelectItem value="ADMIN_ASSISTANT">Administrative Assistant</SelectItem>
                                <SelectItem value="IT_SUPPORT">IT Support</SelectItem>
                                <SelectItem value="SECURITY_GUARD">Security Guard</SelectItem>
                                <SelectItem value="CLEANER">Cleaner</SelectItem>
                                <SelectItem value="INTERN">Intern</SelectItem>
                                <SelectItem value="CONSULTANT">Consultant</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </div>
                            </SelectContent>
                          </Select>
                          {employeeData.role && (employeeData.role === 'DRIVER' || employeeData.role.toLowerCase().includes('driver')) && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                Will be added to MARAH drivers if assigned to MARAH
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="employerId" className="text-sm font-medium flex items-center space-x-2">
                            <Building2 className="w-4 h-4" />
                            <span>Employer</span>
                          </Label>
                          <Select value={employeeData.employerId} onValueChange={(value) => updateEmployeeData("employerId", value)}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select employer (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No specific employer</SelectItem>
                              {employers.map(employer => (
                                <SelectItem key={employer.id} value={employer.id}>
                                  <div className="flex items-center space-x-2">
                                    {employer.picture && (
                                      <img 
                                        src={employer.picture} 
                                        alt={employer.nameEnglish}
                                        className="w-4 h-4 rounded object-cover"
                                      />
                                    )}
                                    <span>{employer.nameEnglish}</span>
                                    {employer.nameArabic && (
                                      <span className="text-xs text-muted-foreground">({employer.nameArabic})</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate" className="text-sm font-medium">Start Date *</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={employeeData.startDate}
                            onChange={(e) => updateEmployeeData("startDate", e.target.value)}
                            className="border-refined"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="salary" className="text-sm font-medium">Official Salary</Label>
                          <Input
                            id="salary"
                            placeholder="AED 440,000"
                            value={employeeData.salary}
                            onChange={(e) => updateEmployeeData("salary", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="actualSalary" className="text-sm font-medium">Actual Salary</Label>
                          <Input
                            id="actualSalary"
                            placeholder="AED 477,000"
                            value={employeeData.actualSalary}
                            onChange={(e) => updateEmployeeData("actualSalary", e.target.value)}
                            className="border-refined"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="actualCompanyId" className="text-sm font-medium">Actual Company</Label>
                          <Select value={employeeData.actualCompanyId} onValueChange={(value) => updateEmployeeData("actualCompanyId", value)}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select actual company (if different)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SAME_AS_OFFICIAL">Same as official company</SelectItem>
                              {companies.map(company => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                          <Input
                            id="location"
                            placeholder="San Francisco, CA"
                            value={employeeData.location}
                            onChange={(e) => updateEmployeeData("location", e.target.value)}
                            className="border-refined"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="manager" className="text-sm font-medium">Manager</Label>
                          <Input
                            id="manager"
                            placeholder="Manager name"
                            value={employeeData.manager}
                            onChange={(e) => updateEmployeeData("manager", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                          <Select value={employeeData.status} onValueChange={(value) => updateEmployeeData("status", value)}>
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
                            placeholder="React, Node.js, TypeScript (comma separated)"
                            value={employeeData.skills}
                            onChange={(e) => updateEmployeeData("skills", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                      </div>

                      {/* Driver-Specific Fields - Show only when DRIVER role is selected */}
                      {(employeeData.role === 'DRIVER' || employeeData.role.toLowerCase().includes('driver')) && (
                        <>
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                              <Car className="w-5 h-5 text-blue-600" />
                              <span>Driver Information</span>
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                Required for MARAH drivers
                              </Badge>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                                <Input
                                  id="dateOfBirth"
                                  type="date"
                                  value={employeeData.dateOfBirth}
                                  onChange={(e) => updateEmployeeData("dateOfBirth", e.target.value)}
                                  className="border-refined"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="experience" className="text-sm font-medium">Years of Experience</Label>
                                <Input
                                  id="experience"
                                  type="number"
                                  min="0"
                                  placeholder="Years of driving experience"
                                  value={employeeData.experience}
                                  onChange={(e) => updateEmployeeData("experience", e.target.value)}
                                  className="border-refined"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <Label htmlFor="licenseNumber" className="text-sm font-medium">License Number</Label>
                                <div className="relative">
                                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                  <Input
                                    id="licenseNumber"
                                    placeholder="DL123456789"
                                    value={employeeData.licenseNumber}
                                    onChange={(e) => updateEmployeeData("licenseNumber", e.target.value)}
                                    className="pl-10 border-refined"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="vehicleInfo" className="text-sm font-medium">Vehicle Information</Label>
                                <div className="relative">
                                  <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                  <Input
                                    id="vehicleInfo"
                                    placeholder="Toyota Hiace - ABC123"
                                    value={employeeData.vehicleInfo}
                                    onChange={(e) => updateEmployeeData("vehicleInfo", e.target.value)}
                                    className="pl-10 border-refined"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact Name</Label>
                                <Input
                                  id="emergencyContact"
                                  placeholder="Emergency contact person"
                                  value={employeeData.emergencyContact}
                                  onChange={(e) => updateEmployeeData("emergencyContact", e.target.value)}
                                  className="border-refined"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="emergencyPhone" className="text-sm font-medium">Emergency Phone</Label>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                  <Input
                                    id="emergencyPhone"
                                    placeholder="+971 50 123 4567"
                                    value={employeeData.emergencyPhone}
                                    onChange={(e) => updateEmployeeData("emergencyPhone", e.target.value)}
                                    className="pl-10 border-refined"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Visa Scanner Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Visa Information</Label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsVisaScannerOpen(true)}
                            className="text-sm"
                          >
                            Scan Visa Document
                          </Button>
                        </div>
                        {visaData && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-600 text-sm font-medium mb-3">Visa data extracted successfully!</p>
                            
                            {/* Personal Information */}
                            {(visaData.firstName || visaData.lastName || visaData.nationality || visaData.dateOfBirth || visaData.gender) && (
                              <div className="mb-4">
                                <h6 className="text-xs font-semibold text-green-800 mb-2">Personal Information</h6>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {visaData.firstName && (
                                    <div><span className="text-muted-foreground">First Name:</span> {visaData.firstName}</div>
                                  )}
                                  {visaData.lastName && (
                                    <div><span className="text-muted-foreground">Last Name:</span> {visaData.lastName}</div>
                                  )}
                                  {visaData.nationality && (
                                    <div><span className="text-muted-foreground">Nationality:</span> {visaData.nationality}</div>
                                  )}
                                  {visaData.dateOfBirth && (
                                    <div><span className="text-muted-foreground">Date of Birth:</span> {visaData.dateOfBirth}</div>
                                  )}
                                  {visaData.gender && (
                                    <div><span className="text-muted-foreground">Gender:</span> {visaData.gender}</div>
                                  )}
                                  {visaData.maritalStatus && (
                                    <div><span className="text-muted-foreground">Marital Status:</span> {visaData.maritalStatus}</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Visa Information */}
                            {(visaData.visaNumber || visaData.visaType || visaData.issueDate || visaData.expiryDate) && (
                              <div className="mb-4">
                                <h6 className="text-xs font-semibold text-green-800 mb-2">Visa Information</h6>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {visaData.visaNumber && (
                                    <div><span className="text-muted-foreground">Visa Number:</span> {visaData.visaNumber}</div>
                                  )}
                                  {visaData.visaType && (
                                    <div><span className="text-muted-foreground">Visa Type:</span> {visaData.visaType}</div>
                                  )}
                                  {visaData.issueDate && (
                                    <div><span className="text-muted-foreground">Issue Date:</span> {visaData.issueDate}</div>
                                  )}
                                  {visaData.expiryDate && (
                                    <div><span className="text-muted-foreground">Expiry Date:</span> {visaData.expiryDate}</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Document Information */}
                            {(visaData.passportNumber || visaData.emiratesId || visaData.laborCardNumber) && (
                              <div className="mb-4">
                                <h6 className="text-xs font-semibold text-green-800 mb-2">Document Information</h6>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {visaData.passportNumber && (
                                    <div><span className="text-muted-foreground">Passport:</span> {visaData.passportNumber}</div>
                                  )}
                                  {visaData.emiratesId && (
                                    <div><span className="text-muted-foreground">Emirates ID:</span> {visaData.emiratesId}</div>
                                  )}
                                  {visaData.laborCardNumber && (
                                    <div><span className="text-muted-foreground">Labor Card:</span> {visaData.laborCardNumber}</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Employment Information */}
                            {(visaData.sponsor || visaData.profession || visaData.salary) && (
                              <div>
                                <h6 className="text-xs font-semibold text-green-800 mb-2">Employment Information</h6>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {visaData.sponsor && (
                                    <div><span className="text-muted-foreground">Sponsor:</span> {visaData.sponsor}</div>
                                  )}
                                  {visaData.profession && (
                                    <div><span className="text-muted-foreground">Profession:</span> {visaData.profession}</div>
                                  )}
                                  {visaData.salary && (
                                    <div><span className="text-muted-foreground">Salary:</span> {visaData.salary}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
                          onClick={() => setIsAddEmployeeOpen(false)}
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
                              <UserPlus className="w-4 h-4 mr-2" />
                              Create Employee
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Total Employees</span>
                    <span className="sm:hidden">Total</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-gradient">
                    {employees.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Employees registered
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    <span className="hidden sm:inline">Active Employees</span>
                    <span className="sm:hidden">Active</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {employees.filter(e => e.status === 'ACTIVE').length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Currently active
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="hidden sm:inline">Departments</span>
                    <span className="sm:hidden">Depts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {uniqueDepartments.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Different departments
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="hidden sm:inline">Companies</span>
                    <span className="sm:hidden">Companies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {companies.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    Total companies
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Employees Display */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-xl font-elegant">Employee Directory</CardTitle>
                <CardDescription className="text-refined">
                  {filteredEmployees.length} employees found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredEmployees.map((employee, index) => (
                      <motion.div
                        key={employee.id}
                        className="group p-4 sm:p-6 rounded-xl bg-gradient-to-br from-white to-gray-50/50 hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 border border-border/30 hover:border-blue-200 cursor-pointer shadow-sm hover:shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => handleEmployeeClick(employee)}
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-105 transition-transform duration-300">
                            {employee.avatar ? (
                              <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base sm:text-lg text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                              {employee.firstName} {employee.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">{employee.position}</p>
                            <p className="text-xs text-muted-foreground truncate">{employee.companyName}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={cn("text-xs", getStatusColor(employee.status))}>
                                {employee.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{employee.department}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                          {employee.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{employee.location}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">Started {formatDate(employee.startDate)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmployeeClick(employee);
                              }}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEmployee(employee);
                              }}
                              title="Edit Employee"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateCard(employee);
                              }}
                              title="Generate ID Card"
                            >
                              <FileImage className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(employee.id);
                            }}
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-full inline-block align-middle">
                      <div className="overflow-hidden border border-border/30 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/50">
                              <TableHead className="font-semibold text-gray-900 min-w-[200px]">Employee</TableHead>
                              <TableHead className="font-semibold text-gray-900 min-w-[150px]">Position</TableHead>
                              <TableHead className="font-semibold text-gray-900 min-w-[150px]">Company</TableHead>
                              <TableHead className="font-semibold text-gray-900 min-w-[120px]">Department</TableHead>
                              <TableHead className="font-semibold text-gray-900 min-w-[100px]">Status</TableHead>
                              <TableHead className="font-semibold text-gray-900 min-w-[140px] text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredEmployees.map((employee) => (
                              <TableRow 
                                key={employee.id} 
                                className="cursor-pointer hover:bg-blue-50/50 transition-colors border-b border-border/20" 
                                onClick={() => handleEmployeeClick(employee)}
                              >
                                <TableCell className="py-4">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="w-10 h-10">
                                      {employee.avatar ? (
                                        <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                                      ) : null}
                                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                                        {employee.firstName[0]}{employee.lastName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <div className="font-semibold text-gray-900 truncate">{employee.firstName} {employee.lastName}</div>
                                      <div className="text-sm text-muted-foreground truncate">{employee.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="text-sm font-medium truncate">{employee.position}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="text-sm text-gray-600 truncate">{employee.companyName}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span className="text-sm text-gray-600 truncate">{employee.department}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                  <Badge className={cn("text-xs", getStatusColor(employee.status))}>
                                    {employee.status.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="flex items-center justify-end space-x-1">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEmployeeClick(employee);
                                      }}
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditEmployee(employee);
                                      }}
                                      title="Edit Employee"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateCard(employee);
                                      }}
                                      title="Generate ID Card"
                                    >
                                      <FileImage className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteEmployee(employee.id);
                                      }}
                                      title="Delete Employee"
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
                    </div>
                  </div>
                )}

                {filteredEmployees.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        {searchTerm || companyFilter !== "ALL" || departmentFilter !== "ALL" || statusFilter !== "ALL" ? 'No employees found' : 'No employees yet'}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 max-w-md mx-auto">
                        {searchTerm || companyFilter !== "ALL" || departmentFilter !== "ALL" || statusFilter !== "ALL"
                          ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                          : 'Start building your team by adding your first employee to the platform.'
                        }
                      </p>
                      {!(searchTerm || companyFilter !== "ALL" || departmentFilter !== "ALL" || statusFilter !== "ALL") && (
                        <Button 
                          onClick={() => setIsAddEmployeeOpen(true)}
                          className="btn-premium"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Your First Employee
                        </Button>
                      )}
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Employee Detail Dialog */}
          <Dialog open={isEmployeeDetailOpen} onOpenChange={setIsEmployeeDetailOpen}>
            <DialogContent className="sm:max-w-[800px] glass-card border-refined max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-elegant text-gradient">Employee Details</DialogTitle>
                <DialogDescription className="text-refined">
                  Complete employee information and profile
                </DialogDescription>
              </DialogHeader>
              {selectedEmployee && (
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      {selectedEmployee.avatar ? (
                        <AvatarImage src={selectedEmployee.avatar} alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                      <p className="text-muted-foreground">{selectedEmployee.position}</p>
                      <p className="text-sm text-muted-foreground">{selectedEmployee.companyName} • {selectedEmployee.department}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getStatusColor(selectedEmployee.status)}>
                          {selectedEmployee.status.replace('_', ' ')}
                        </Badge>
                        {selectedEmployee.salary && (
                          <Badge variant="outline">{selectedEmployee.salary}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          {selectedEmployee.email}
                        </div>
                        {selectedEmployee.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                            {selectedEmployee.phone}
                          </div>
                        )}
                        {selectedEmployee.location && (
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                            {selectedEmployee.location}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Employment Details</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Start Date:</span> {formatDate(selectedEmployee.startDate)}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Department:</span> {selectedEmployee.department}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Status:</span> {selectedEmployee.status.replace('_', ' ')}
                        </div>
                        {selectedEmployee.manager && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Manager:</span> {selectedEmployee.manager}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Salary Information */}
                  {(selectedEmployee.salary || selectedEmployee.actualSalary) && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Salary Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedEmployee.salary && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-sm font-medium text-blue-800">Official Contract Salary</div>
                            <div className="text-lg font-bold text-blue-900">{selectedEmployee.salary}</div>
                          </div>
                        )}
                        {selectedEmployee.actualSalary && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-sm font-medium text-green-800">Actual Salary</div>
                            <div className="text-lg font-bold text-green-900">{selectedEmployee.actualSalary}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Company Information */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Company Assignment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-sm font-medium text-gray-700">Official Company</div>
                        <div className="text-base font-semibold text-gray-900">{selectedEmployee.companyName}</div>
                      </div>
                      {selectedEmployee.actualCompanyName && selectedEmployee.actualCompanyName !== selectedEmployee.companyName && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="text-sm font-medium text-orange-700">Actual Working Company</div>
                          <div className="text-base font-semibold text-orange-900">{selectedEmployee.actualCompanyName}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visa Information */}
                  {selectedEmployee.visa && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Visa & Immigration Details</h4>
                      
                      {/* Personal Information from Visa */}
                      {(selectedEmployee.visa.firstName || selectedEmployee.visa.lastName || selectedEmployee.visa.nationality || selectedEmployee.visa.dateOfBirth || selectedEmployee.visa.gender || selectedEmployee.visa.maritalStatus || selectedEmployee.visa.placeOfBirth) && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm text-blue-800 border-b border-blue-200 pb-1">Personal Information (from Visa)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedEmployee.visa.firstName && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">First Name (Visa):</span> {selectedEmployee.visa.firstName}
                              </div>
                            )}
                            {selectedEmployee.visa.lastName && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Last Name (Visa):</span> {selectedEmployee.visa.lastName}
                              </div>
                            )}
                            {selectedEmployee.visa.nationality && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Nationality:</span> {selectedEmployee.visa.nationality}
                              </div>
                            )}
                            {selectedEmployee.visa.dateOfBirth && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Date of Birth:</span> {formatDate(selectedEmployee.visa.dateOfBirth)}
                              </div>
                            )}
                            {selectedEmployee.visa.gender && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Gender:</span> {selectedEmployee.visa.gender}
                              </div>
                            )}
                            {selectedEmployee.visa.maritalStatus && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Marital Status:</span> {selectedEmployee.visa.maritalStatus}
                              </div>
                            )}
                            {selectedEmployee.visa.placeOfBirth && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Place of Birth:</span> {selectedEmployee.visa.placeOfBirth}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Visa Information Section */}
                      {(selectedEmployee.visa.visaNumber || selectedEmployee.visa.visaType || selectedEmployee.visa.issueDate || selectedEmployee.visa.expiryDate) && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm text-green-800 border-b border-green-200 pb-1">Visa Information</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedEmployee.visa.visaNumber && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Visa Number:</span> {selectedEmployee.visa.visaNumber}
                              </div>
                            )}
                            {selectedEmployee.visa.visaType && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Visa Type:</span> {selectedEmployee.visa.visaType}
                              </div>
                            )}
                            {selectedEmployee.visa.issueDate && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Issue Date:</span> {formatDate(selectedEmployee.visa.issueDate)}
                              </div>
                            )}
                            {selectedEmployee.visa.expiryDate && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Expiry Date:</span> {formatDate(selectedEmployee.visa.expiryDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Document Information Section */}
                      {(selectedEmployee.visa.passportNumber || selectedEmployee.visa.passportExpiry || selectedEmployee.visa.emiratesId || selectedEmployee.visa.laborCardNumber) && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm text-purple-800 border-b border-purple-200 pb-1">Document Information</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedEmployee.visa.passportNumber && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Passport Number:</span> {selectedEmployee.visa.passportNumber}
                              </div>
                            )}
                            {selectedEmployee.visa.passportExpiry && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Passport Expiry:</span> {formatDate(selectedEmployee.visa.passportExpiry)}
                              </div>
                            )}
                            {selectedEmployee.visa.emiratesId && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Emirates ID:</span> {selectedEmployee.visa.emiratesId}
                              </div>
                            )}
                            {selectedEmployee.visa.emiratesIdExpiry && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Emirates ID Expiry:</span> {formatDate(selectedEmployee.visa.emiratesIdExpiry)}
                              </div>
                            )}
                            {selectedEmployee.visa.laborCardNumber && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Labor Card:</span> {selectedEmployee.visa.laborCardNumber}
                              </div>
                            )}
                            {selectedEmployee.visa.laborCardExpiry && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Labor Card Expiry:</span> {formatDate(selectedEmployee.visa.laborCardExpiry)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Employment Information Section */}
                      {(selectedEmployee.visa.sponsor || selectedEmployee.visa.profession || selectedEmployee.visa.salary) && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm text-orange-800 border-b border-orange-200 pb-1">Employment Information (from Visa)</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedEmployee.visa.sponsor && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Sponsor/Employer:</span> {selectedEmployee.visa.sponsor}
                              </div>
                            )}
                            {selectedEmployee.visa.profession && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Profession (Visa):</span> {selectedEmployee.visa.profession}
                              </div>
                            )}
                            {selectedEmployee.visa.salary && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Salary (Visa):</span> {selectedEmployee.visa.salary}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Skills & Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployee.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setIsEmployeeDetailOpen(false)}>
                      Close
                    </Button>
                    <Button className="btn-premium" onClick={() => handleEditEmployee(selectedEmployee)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Employee
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Employee Dialog */}
          <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
            <DialogContent className="sm:max-w-[600px] glass-card border-refined max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-elegant text-gradient">Edit Employee</DialogTitle>
                <DialogDescription className="text-refined">
                  Update employee information and details.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                <form onSubmit={handleUpdateEmployee} className="space-y-6">
                  <ImageUpload
                    id="edit-employee-avatar"
                    label="Profile Photo"
                    value={employeeData.avatar}
                    onChange={(value) => updateEmployeeData("avatar", value || "")}
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
                        value={employeeData.firstName}
                        onChange={(e) => updateEmployeeData("firstName", e.target.value)}
                        className="border-refined"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name..."
                        value={employeeData.lastName}
                        onChange={(e) => updateEmployeeData("lastName", e.target.value)}
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
                        placeholder="employee@company.com"
                        value={employeeData.email}
                        onChange={(e) => updateEmployeeData("email", e.target.value)}
                        className="border-refined"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone
                        {(() => {
                          const isDriverRole = employeeData.role === 'DRIVER' || employeeData.role.toLowerCase().includes('driver');
                          const isMarahCompany = companies.find(company => 
                            company.id === employeeData.companyId && 
                            company.name === 'MARAH Inflatable Games Rental'
                          );
                          return isDriverRole && isMarahCompany ? <span className="text-red-500 ml-1">*</span> : null;
                        })()}
                      </Label>
                      <Input
                        id="phone"
                        placeholder="+971 50 123 4567"
                        value={employeeData.phone}
                        onChange={(e) => updateEmployeeData("phone", e.target.value)}
                        className="border-refined"
                        required={(() => {
                          const isDriverRole = employeeData.role === 'DRIVER' || employeeData.role.toLowerCase().includes('driver');
                          const isMarahCompany = companies.find(company => 
                            company.id === employeeData.companyId && 
                            company.name === 'MARAH Inflatable Games Rental'
                          );
                          return Boolean(isDriverRole && isMarahCompany);
                        })()}
                      />
                      {(() => {
                        const isDriverRole = employeeData.role === 'DRIVER' || employeeData.role.toLowerCase().includes('driver');
                        const isMarahCompany = companies.find(company => 
                          company.id === employeeData.companyId && 
                          company.name === 'MARAH Inflatable Games Rental'
                        );
                        return isDriverRole && isMarahCompany ? (
                          <p className="text-xs text-blue-600">Required for MARAH drivers</p>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyId" className="text-sm font-medium">Company *</Label>
                    <Select value={employeeData.companyId} onValueChange={(value) => updateEmployeeData("companyId", value)} required>
                      <SelectTrigger className="border-refined">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                      <Select value={employeeData.department} onValueChange={(value) => updateEmployeeData("department", value)} required>
                        <SelectTrigger className="border-refined">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="HR">Human Resources</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-medium">Role/Function *</Label>
                      <Select value={employeeData.role} onValueChange={(value) => updateEmployeeData("role", value)} required>
                        <SelectTrigger className="border-refined">
                          <SelectValue placeholder="Select employee role..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <div className="px-2 py-1">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Standard Roles</div>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                            <SelectItem value="DRIVER">Driver</SelectItem>
                            <SelectItem value="SALES_REPRESENTATIVE">Sales Representative</SelectItem>
                            <SelectItem value="CUSTOMER_SERVICE">Customer Service</SelectItem>
                            <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                            <SelectItem value="HR_SPECIALIST">HR Specialist</SelectItem>
                            <SelectItem value="MARKETING_SPECIALIST">Marketing Specialist</SelectItem>
                            <SelectItem value="OPERATIONS_COORDINATOR">Operations Coordinator</SelectItem>
                            <SelectItem value="WAREHOUSE_STAFF">Warehouse Staff</SelectItem>
                            <SelectItem value="MAINTENANCE_TECHNICIAN">Maintenance Technician</SelectItem>
                            <SelectItem value="DELIVERY_COORDINATOR">Delivery Coordinator</SelectItem>
                            <SelectItem value="GAME_SETUP_SPECIALIST">Game Setup Specialist</SelectItem>
                            <SelectItem value="QUALITY_INSPECTOR">Quality Inspector</SelectItem>
                            <SelectItem value="ADMIN_ASSISTANT">Administrative Assistant</SelectItem>
                            <SelectItem value="IT_SUPPORT">IT Support</SelectItem>
                            <SelectItem value="SECURITY_GUARD">Security Guard</SelectItem>
                            <SelectItem value="CLEANER">Cleaner</SelectItem>
                            <SelectItem value="INTERN">Intern</SelectItem>
                            <SelectItem value="CONSULTANT">Consultant</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm font-medium">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={employeeData.startDate}
                        onChange={(e) => updateEmployeeData("startDate", e.target.value)}
                        className="border-refined"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary" className="text-sm font-medium">Official Salary</Label>
                      <Input
                        id="salary"
                        placeholder="AED 440,000"
                        value={employeeData.salary}
                        onChange={(e) => updateEmployeeData("salary", e.target.value)}
                        className="border-refined"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="actualSalary" className="text-sm font-medium">Actual Salary</Label>
                      <Input
                        id="actualSalary"
                        placeholder="AED 477,000"
                        value={employeeData.actualSalary}
                        onChange={(e) => updateEmployeeData("actualSalary", e.target.value)}
                        className="border-refined"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="actualCompanyId" className="text-sm font-medium">Actual Company</Label>
                      <Select value={employeeData.actualCompanyId} onValueChange={(value) => updateEmployeeData("actualCompanyId", value)}>
                        <SelectTrigger className="border-refined">
                          <SelectValue placeholder="Select actual company (if different)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAME_AS_OFFICIAL">Same as official company</SelectItem>
                          {companies.map(company => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                      <Input
                        id="location"
                        placeholder="San Francisco, CA"
                        value={employeeData.location}
                        onChange={(e) => updateEmployeeData("location", e.target.value)}
                        className="border-refined"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manager" className="text-sm font-medium">Manager</Label>
                      <Input
                        id="manager"
                        placeholder="Manager name"
                        value={employeeData.manager}
                        onChange={(e) => updateEmployeeData("manager", e.target.value)}
                        className="border-refined"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select value={employeeData.status} onValueChange={(value) => updateEmployeeData("status", value)}>
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
                        placeholder="React, Node.js, TypeScript (comma separated)"
                        value={employeeData.skills}
                        onChange={(e) => updateEmployeeData("skills", e.target.value)}
                        className="border-refined"
                      />
                    </div>
                  </div>

                  {/* Driver-Specific Fields - Show only when DRIVER role is selected */}
                  {(employeeData.role === 'DRIVER' || employeeData.role.toLowerCase().includes('driver')) && (
                    <>
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                          <Car className="w-5 h-5 text-blue-600" />
                          <span>Driver Information</span>
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            Required for MARAH drivers
                          </Badge>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={employeeData.dateOfBirth}
                              onChange={(e) => updateEmployeeData("dateOfBirth", e.target.value)}
                              className="border-refined"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="experience" className="text-sm font-medium">Years of Experience</Label>
                            <Input
                              id="experience"
                              type="number"
                              min="0"
                              placeholder="Years of driving experience"
                              value={employeeData.experience}
                              onChange={(e) => updateEmployeeData("experience", e.target.value)}
                              className="border-refined"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor="licenseNumber" className="text-sm font-medium">License Number</Label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                id="licenseNumber"
                                placeholder="DL123456789"
                                value={employeeData.licenseNumber}
                                onChange={(e) => updateEmployeeData("licenseNumber", e.target.value)}
                                className="pl-10 border-refined"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="vehicleInfo" className="text-sm font-medium">Vehicle Information</Label>
                            <div className="relative">
                              <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                id="vehicleInfo"
                                placeholder="Toyota Hiace - ABC123"
                                value={employeeData.vehicleInfo}
                                onChange={(e) => updateEmployeeData("vehicleInfo", e.target.value)}
                                className="pl-10 border-refined"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact Name</Label>
                            <Input
                              id="emergencyContact"
                              placeholder="Emergency contact person"
                              value={employeeData.emergencyContact}
                              onChange={(e) => updateEmployeeData("emergencyContact", e.target.value)}
                              className="border-refined"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="emergencyPhone" className="text-sm font-medium">Emergency Phone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                id="emergencyPhone"
                                placeholder="+971 50 123 4567"
                                value={employeeData.emergencyPhone}
                                onChange={(e) => updateEmployeeData("emergencyPhone", e.target.value)}
                                className="pl-10 border-refined"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Visa Scanner Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Visa Information</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsVisaScannerOpen(true)}
                        className="text-sm"
                      >
                        Scan Visa Document
                      </Button>
                    </div>
                    {visaData && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 text-sm font-medium mb-3">Visa data extracted successfully!</p>
                        
                        {/* Personal Information */}
                        {(visaData.firstName || visaData.lastName || visaData.nationality || visaData.dateOfBirth || visaData.gender) && (
                          <div className="mb-4">
                            <h6 className="text-xs font-semibold text-green-800 mb-2">Personal Information</h6>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {visaData.firstName && (
                                <div><span className="text-muted-foreground">First Name:</span> {visaData.firstName}</div>
                              )}
                              {visaData.lastName && (
                                <div><span className="text-muted-foreground">Last Name:</span> {visaData.lastName}</div>
                              )}
                              {visaData.nationality && (
                                <div><span className="text-muted-foreground">Nationality:</span> {visaData.nationality}</div>
                              )}
                              {visaData.dateOfBirth && (
                                <div><span className="text-muted-foreground">Date of Birth:</span> {visaData.dateOfBirth}</div>
                              )}
                              {visaData.gender && (
                                <div><span className="text-muted-foreground">Gender:</span> {visaData.gender}</div>
                              )}
                              {visaData.maritalStatus && (
                                <div><span className="text-muted-foreground">Marital Status:</span> {visaData.maritalStatus}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Visa Information */}
                        {(visaData.visaNumber || visaData.visaType || visaData.issueDate || visaData.expiryDate) && (
                          <div className="mb-4">
                            <h6 className="text-xs font-semibold text-green-800 mb-2">Visa Information</h6>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {visaData.visaNumber && (
                                <div><span className="text-muted-foreground">Visa Number:</span> {visaData.visaNumber}</div>
                              )}
                              {visaData.visaType && (
                                <div><span className="text-muted-foreground">Visa Type:</span> {visaData.visaType}</div>
                              )}
                              {visaData.issueDate && (
                                <div><span className="text-muted-foreground">Issue Date:</span> {visaData.issueDate}</div>
                              )}
                              {visaData.expiryDate && (
                                <div><span className="text-muted-foreground">Expiry Date:</span> {visaData.expiryDate}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Document Information */}
                        {(visaData.passportNumber || visaData.emiratesId || visaData.laborCardNumber) && (
                          <div className="mb-4">
                            <h6 className="text-xs font-semibold text-green-800 mb-2">Document Information</h6>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {visaData.passportNumber && (
                                <div><span className="text-muted-foreground">Passport:</span> {visaData.passportNumber}</div>
                              )}
                              {visaData.emiratesId && (
                                <div><span className="text-muted-foreground">Emirates ID:</span> {visaData.emiratesId}</div>
                              )}
                              {visaData.laborCardNumber && (
                                <div><span className="text-muted-foreground">Labor Card:</span> {visaData.laborCardNumber}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Employment Information */}
                        {(visaData.sponsor || visaData.profession || visaData.salary) && (
                          <div>
                            <h6 className="text-xs font-semibold text-green-800 mb-2">Employment Information</h6>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {visaData.sponsor && (
                                <div><span className="text-muted-foreground">Sponsor:</span> {visaData.sponsor}</div>
                              )}
                              {visaData.profession && (
                                <div><span className="text-muted-foreground">Profession:</span> {visaData.profession}</div>
                              )}
                              {visaData.salary && (
                                <div><span className="text-muted-foreground">Salary:</span> {visaData.salary}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                      onClick={() => setIsEditEmployeeOpen(false)}
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
                          Update Employee
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>

          {/* Card Generator Dialog */}
          <Dialog open={isCardGeneratorOpen} onOpenChange={setIsCardGeneratorOpen}>
            <DialogContent className="sm:max-w-[900px] glass-card border-refined max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-elegant text-gradient">Employee ID Card Generator</DialogTitle>
                <DialogDescription className="text-refined">
                  Generate a professional ID card for {selectedEmployeeForCard?.firstName} {selectedEmployeeForCard?.lastName}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                {selectedEmployeeForCard && (
                  <EmployeeCardGenerator
                    employee={selectedEmployeeForCard}
                    company={companies.find(c => c.id === selectedEmployeeForCard.companyId) || { id: '', name: 'Unknown Company' }}
                    onClose={() => setIsCardGeneratorOpen(false)}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Visa Scanner Dialog */}
          <Dialog open={isVisaScannerOpen} onOpenChange={setIsVisaScannerOpen}>
            <DialogContent className="sm:max-w-[800px] glass-card border-refined max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-elegant text-gradient">Visa Document Scanner</DialogTitle>
                <DialogDescription className="text-refined">
                  Upload and scan visa documents to automatically extract employee information
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                <VisaScanner
                  onDataExtracted={handleVisaDataExtracted}
                  onDocumentUploaded={handleVisaDocumentUploaded}
                />
                <div className="flex justify-end mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsVisaScannerOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
} 