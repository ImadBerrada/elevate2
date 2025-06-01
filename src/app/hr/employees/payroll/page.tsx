"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  Users, 
  Calculator, 
  TrendingUp,
  Calendar,
  FileText,
  Download,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";

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

export default function PayrollManagement() {
  const employees = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Senior Investment Analyst",
      department: "ELEVATE",
      employeeId: "EMP-001",
      baseSalary: "$8,500",
      allowances: "$1,200",
      deductions: "$850",
      netSalary: "$8,850",
      status: "processed",
      payDate: "2024-01-31"
    },
    {
      id: 2,
      name: "Ahmed Al-Rashid",
      position: "Property Manager",
      department: "Real Estate",
      employeeId: "EMP-002",
      baseSalary: "$6,800",
      allowances: "$900",
      deductions: "$680",
      netSalary: "$7,020",
      status: "processed",
      payDate: "2024-01-31"
    },
    {
      id: 3,
      name: "Maria Garcia",
      position: "Operations Coordinator",
      department: "MARAH",
      employeeId: "EMP-003",
      baseSalary: "$5,200",
      allowances: "$650",
      deductions: "$520",
      netSalary: "$5,330",
      status: "pending",
      payDate: "2024-01-31"
    },
    {
      id: 4,
      name: "David Chen",
      position: "Financial Analyst",
      department: "ELEVATE",
      employeeId: "EMP-004",
      baseSalary: "$7,200",
      allowances: "$800",
      deductions: "$720",
      netSalary: "$7,280",
      status: "processing",
      payDate: "2024-01-31"
    },
    {
      id: 5,
      name: "Emily Rodriguez",
      position: "HR Specialist",
      department: "Human Resources",
      employeeId: "EMP-005",
      baseSalary: "$6,000",
      allowances: "$750",
      deductions: "$600",
      netSalary: "$6,150",
      status: "processed",
      payDate: "2024-01-31"
    }
  ];

  const payrollSummary = [
    {
      department: "ELEVATE",
      employees: 45,
      totalSalary: "$342,500",
      avgSalary: "$7,611",
      processed: 42,
      pending: 3
    },
    {
      department: "Real Estate",
      employees: 28,
      totalSalary: "$198,400",
      avgSalary: "$7,086",
      processed: 26,
      pending: 2
    },
    {
      department: "MARAH",
      employees: 35,
      totalSalary: "$189,000",
      avgSalary: "$5,400",
      processed: 32,
      pending: 3
    },
    {
      department: "Human Resources",
      employees: 12,
      totalSalary: "$78,000",
      avgSalary: "$6,500",
      processed: 11,
      pending: 1
    }
  ];

  const taxBreakdown = [
    { category: "Income Tax", amount: "$45,200", percentage: 42, color: "bg-red-500" },
    { category: "Social Security", amount: "$28,800", percentage: 27, color: "bg-blue-500" },
    { category: "Health Insurance", amount: "$18,600", percentage: 17, color: "bg-green-500" },
    { category: "Pension Fund", amount: "$15,400", percentage: 14, color: "bg-purple-500" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed": return "text-green-600";
      case "processing": return "text-blue-600";
      case "pending": return "text-yellow-600";
      case "failed": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "processed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed": return CheckCircle;
      case "processing": return Clock;
      case "pending": return Clock;
      case "failed": return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <motion.header 
          className="glass-header sticky top-0 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-4"
                {...fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <DollarSign className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Payroll Management</h1>
                    <p className="text-sm text-muted-foreground">Employee salary processing and payroll analytics</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search employees..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Process Payroll
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-8 py-8">
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Employees
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">120</div>
                  <p className="text-sm text-green-600 font-medium">Across all departments</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Payroll
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$807.9K</div>
                  <p className="text-sm text-green-600 font-medium">+5.2% vs last month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Processed
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">111</div>
                  <p className="text-sm text-green-600 font-medium">92.5% completion</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Salary
                  </CardTitle>
                  <Calculator className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$6,733</div>
                  <p className="text-sm text-green-600 font-medium">+3.8% increase</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Department Summary */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Users className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Department Summary</CardTitle>
                      <CardDescription>
                        Payroll breakdown by department
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payrollSummary.map((dept, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-foreground">{dept.department}</h4>
                          <Badge variant="outline" className="text-xs">
                            {dept.employees} employees
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Salary</p>
                            <p className="font-bold text-gradient">{dept.totalSalary}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Salary</p>
                            <p className="font-bold text-foreground">{dept.avgSalary}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className="text-sm">
                              <span className="text-green-600">{dept.processed} processed</span>
                              {dept.pending > 0 && (
                                <span className="text-yellow-600"> • {dept.pending} pending</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                            style={{ width: `${(dept.processed / dept.employees) * 100}%` }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tax & Deductions */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Calculator className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Tax & Deductions</CardTitle>
                      <CardDescription>
                        Monthly tax and deduction breakdown
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {taxBreakdown.map((tax, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${tax.color}`} />
                          <span className="font-medium text-foreground">{tax.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{tax.percentage}%</p>
                          <p className="text-sm text-muted-foreground">{tax.amount}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Total Deductions</span>
                      <span className="text-xl font-bold text-gradient">$108,000</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">13.4% of total payroll</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Employee Payroll List */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.8 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <FileText className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl">Employee Payroll</CardTitle>
                      <CardDescription>
                        Individual employee salary details and processing status
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" className="glass-card border-0 hover-glow">
                    <Download className="w-4 h-4 mr-2" />
                    Export Payroll
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map((employee, index) => {
                    const StatusIcon = getStatusIcon(employee.status);
                    return (
                      <motion.div 
                        key={employee.id}
                        className="glass-card p-6 rounded-2xl hover-lift group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <motion.div 
                              className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                              whileHover={{ scale: 1.1, rotate: 10 }}
                            >
                              <StatusIcon className={`w-6 h-6 ${getStatusColor(employee.status)}`} />
                            </motion.div>
                            
                            <div>
                              <div className="flex items-center space-x-3 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{employee.name}</h3>
                                <Badge 
                                  className={`text-xs ${getStatusBg(employee.status)}`}
                                  variant="outline"
                                >
                                  {employee.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {employee.position} • {employee.department}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>ID: {employee.employeeId}</span>
                                <span>•</span>
                                <span>Pay Date: {employee.payDate}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-4 gap-4 text-center mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Base Salary</p>
                                <p className="font-bold text-foreground">{employee.baseSalary}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Allowances</p>
                                <p className="font-bold text-green-600">{employee.allowances}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Deductions</p>
                                <p className="font-bold text-red-600">{employee.deductions}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Net Salary</p>
                                <p className="text-lg font-bold text-gradient">{employee.netSalary}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button size="sm" className="btn-premium">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 