"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Send,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Printer
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function GenerateInvoices() {
  const invoiceTemplates = [
    { id: 1, name: "Rent Invoice", description: "Monthly rent collection", usage: 156 },
    { id: 2, name: "Maintenance Invoice", description: "Property maintenance charges", usage: 89 },
    { id: 3, name: "Utility Invoice", description: "Utility bills and charges", usage: 234 },
    { id: 4, name: "Service Invoice", description: "Additional services", usage: 67 }
  ];

  const recentInvoices = [
    {
      id: "INV-2024-001",
      tenant: "Ahmed Al-Rashid",
      property: "Marina Heights - Unit 1205",
      amount: "$2,500.00",
      type: "Rent",
      status: "sent",
      date: "2024-01-15",
      dueDate: "2024-02-01"
    },
    {
      id: "INV-2024-002",
      tenant: "Sarah Johnson",
      property: "Downtown Plaza - Unit 304",
      amount: "$450.00",
      type: "Maintenance",
      status: "draft",
      date: "2024-01-14",
      dueDate: "2024-01-30"
    },
    {
      id: "INV-2024-003",
      tenant: "Mohammed Hassan",
      property: "Business Bay Tower - Unit 1501",
      amount: "$3,200.00",
      type: "Rent",
      status: "paid",
      date: "2024-01-13",
      dueDate: "2024-01-28"
    },
    {
      id: "INV-2024-004",
      tenant: "Lisa Chen",
      property: "Jumeirah Residence - Unit 802",
      amount: "$180.00",
      type: "Utility",
      status: "overdue",
      date: "2024-01-10",
      dueDate: "2024-01-25"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "text-green-600";
      case "sent": return "text-blue-600";
      case "draft": return "text-yellow-600";
      case "overdue": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
                    <FileText className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Generate Invoices</h1>
                    <p className="text-sm text-muted-foreground">Create and manage property invoices</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Invoice Creation Form */}
            <motion.div 
              className="lg:col-span-2"
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
                      <FileText className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Create New Invoice</CardTitle>
                      <CardDescription>
                        Generate invoices for tenants and properties
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Invoice Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Invoice Type</label>
                      <Select>
                        <SelectTrigger className="glass-card border-0">
                          <SelectValue placeholder="Select invoice type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rent">Rent Invoice</SelectItem>
                          <SelectItem value="maintenance">Maintenance Invoice</SelectItem>
                          <SelectItem value="utility">Utility Invoice</SelectItem>
                          <SelectItem value="service">Service Invoice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Property</label>
                      <Select>
                        <SelectTrigger className="glass-card border-0">
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="marina-heights">Marina Heights - Unit 1205</SelectItem>
                          <SelectItem value="downtown-plaza">Downtown Plaza - Unit 304</SelectItem>
                          <SelectItem value="business-bay">Business Bay Tower - Unit 1501</SelectItem>
                          <SelectItem value="jumeirah-residence">Jumeirah Residence - Unit 802</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tenant Information */}
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      Tenant Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Tenant Name</label>
                        <Input 
                          placeholder="Enter tenant name" 
                          className="glass-card border-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <Input 
                          type="email"
                          placeholder="tenant@email.com" 
                          className="glass-card border-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Phone</label>
                        <Input 
                          placeholder="+971 50 123 4567" 
                          className="glass-card border-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Address</label>
                        <Input 
                          placeholder="Property address" 
                          className="glass-card border-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-primary" />
                      Invoice Items
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                        <div className="col-span-5">Description</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Rate</div>
                        <div className="col-span-2">Amount</div>
                        <div className="col-span-1">Action</div>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-5">
                          <Input 
                            placeholder="Item description" 
                            className="glass-card border-0"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input 
                            type="number"
                            placeholder="1" 
                            className="glass-card border-0"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input 
                            type="number"
                            placeholder="0.00" 
                            className="glass-card border-0"
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="text-lg font-semibold text-gradient">$0.00</div>
                        </div>
                        <div className="col-span-1">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-primary/20">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-gradient">$0.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Issue Date</label>
                      <Input 
                        type="date"
                        className="glass-card border-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Due Date</label>
                      <Input 
                        type="date"
                        className="glass-card border-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Notes</label>
                    <textarea 
                      placeholder="Additional notes or terms..."
                      className="glass-card border-0 min-h-[100px] w-full p-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button className="btn-premium">
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button variant="outline" className="glass-card border-0 hover-glow">
                      <Send className="w-4 h-4 mr-2" />
                      Send Invoice
                    </Button>
                    <Button variant="outline" className="glass-card border-0 hover-glow">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" className="glass-card border-0 hover-glow">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Templates and Recent Invoices */}
            <motion.div 
              className="space-y-8"
              {...fadeInUp}
              transition={{ delay: 0.6 }}
            >
              {/* Invoice Templates */}
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <FileText className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg">Templates</CardTitle>
                      <CardDescription>
                        Quick invoice templates
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoiceTemplates.map((template, index) => (
                      <motion.div 
                        key={template.id}
                        className="glass-card p-4 rounded-xl hover-lift cursor-pointer group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{template.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {template.usage} used
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <Button size="sm" className="w-full btn-premium">
                          Use Template
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Invoices */}
              <Card className="card-premium border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <Calendar className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg">Recent Invoices</CardTitle>
                      <CardDescription>
                        Latest generated invoices
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentInvoices.slice(0, 4).map((invoice, index) => (
                      <motion.div 
                        key={invoice.id}
                        className="glass-card p-4 rounded-xl hover-lift group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm text-foreground">{invoice.id}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusBg(invoice.status)}`}
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold text-gradient">{invoice.amount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{invoice.tenant}</p>
                        <p className="text-xs text-muted-foreground">{invoice.property}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">Due: {invoice.dueDate}</span>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
} 