"use client";

import { motion } from "framer-motion";
import { Users, Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export default function EmployeeDirectory() {
  const { isOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? 'ml-0' : 'ml-0'}`}>
        <motion.header 
          className="glass-header sticky top-0 z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <BurgerMenu />
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Users className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-elegant text-gradient">Employee Directory</h1>
                    <p className="text-sm text-muted-foreground font-refined">Human Resources Management</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-6 py-6">
          <motion.div 
            className="mb-8"
            {...fadeInUp}
          >
            <h2 className="text-2xl font-prestigious text-gradient mb-2">
              Employee Directory
            </h2>
            <p className="text-refined text-muted-foreground">
              Comprehensive employee information and contact directory.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Total Employees</span>
                  </CardTitle>
                  <CardDescription>Active workforce</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">247</div>
                  <p className="text-sm text-green-600">+12 new hires this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>Departments</span>
                  </CardTitle>
                  <CardDescription>Active departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">8</div>
                  <p className="text-sm text-blue-600">Across all divisions</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <span>Remote Workers</span>
                  </CardTitle>
                  <CardDescription>Working remotely</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">89</div>
                  <p className="text-sm text-purple-600">36% of workforce</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>New Hires</span>
                  </CardTitle>
                  <CardDescription>This quarter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">23</div>
                  <p className="text-sm text-green-600">+18% growth rate</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <div>
                  <CardTitle className="text-xl font-elegant">Employee Directory</CardTitle>
                  <CardDescription className="text-refined">
                    Browse and manage employee information
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: "Sarah Johnson", role: "Investment Manager", department: "ELEVATE", email: "sarah.j@elevate.com", phone: "+1 (555) 123-4567", avatar: "SJ" },
                    { name: "Michael Chen", role: "Property Manager", department: "Real Estate", email: "michael.c@elevate.com", phone: "+1 (555) 234-5678", avatar: "MC" },
                    { name: "Emily Rodriguez", role: "Operations Lead", department: "MARAH", email: "emily.r@elevate.com", phone: "+1 (555) 345-6789", avatar: "ER" },
                    { name: "David Kim", role: "Financial Analyst", department: "Finance", email: "david.k@elevate.com", phone: "+1 (555) 456-7890", avatar: "DK" },
                    { name: "Lisa Thompson", role: "HR Director", department: "Human Resources", email: "lisa.t@elevate.com", phone: "+1 (555) 567-8901", avatar: "LT" },
                    { name: "James Wilson", role: "IT Manager", department: "Technology", email: "james.w@elevate.com", phone: "+1 (555) 678-9012", avatar: "JW" }
                  ].map((employee, index) => (
                    <motion.div 
                      key={index}
                      className="glass-card p-6 rounded-2xl hover-lift group border-refined"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Avatar className="w-16 h-16 mb-4 ring-2 ring-primary/20">
                            <AvatarImage src={`/api/placeholder/64/64`} />
                            <AvatarFallback className="gradient-primary text-white font-bold">
                              {employee.avatar}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        
                        <h3 className="font-elegant text-lg text-foreground mb-1">{employee.name}</h3>
                        <p className="text-muted-foreground mb-2">{employee.role}</p>
                        
                        <Badge variant="secondary" className="mb-4 border-refined">
                          {employee.department}
                        </Badge>
                        
                        <div className="space-y-2 w-full">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{employee.phone}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 