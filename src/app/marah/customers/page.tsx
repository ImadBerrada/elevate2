"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Star,
  ShoppingCart,
  TrendingUp,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export default function MarahCustomers() {
  const customers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+971 50 123 4567",
      location: "Downtown Dubai",
      orders: 47,
      totalSpent: "$2,340",
      rating: 4.8,
      status: "premium",
      joinDate: "2023-01-15"
    },
    {
      id: 2,
      name: "Ahmed Al-Mansouri",
      email: "ahmed.mansouri@email.com",
      phone: "+971 55 234 5678",
      location: "Business Bay",
      orders: 23,
      totalSpent: "$1,150",
      rating: 4.6,
      status: "regular",
      joinDate: "2023-03-22"
    },
    {
      id: 3,
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      phone: "+971 52 345 6789",
      location: "Marina",
      orders: 89,
      totalSpent: "$4,560",
      rating: 4.9,
      status: "vip",
      joinDate: "2022-11-08"
    },
    {
      id: 4,
      name: "David Chen",
      email: "david.chen@email.com",
      phone: "+971 56 456 7890",
      location: "Jumeirah",
      orders: 12,
      totalSpent: "$580",
      rating: 4.3,
      status: "new",
      joinDate: "2024-01-10"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vip": return "bg-purple-500";
      case "premium": return "bg-blue-500";
      case "regular": return "bg-green-500";
      case "new": return "bg-orange-500";
      default: return "bg-gray-500";
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
                    <Users className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Customers</h1>
                    <p className="text-sm text-muted-foreground">Manage customer relationships and analytics</p>
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
                    placeholder="Search customers..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
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
                    Total Customers
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">2,847</div>
                  <p className="text-sm text-green-600 font-medium">+156 this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Users
                  </CardTitle>
                  <User className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">1,923</div>
                  <p className="text-sm text-green-600 font-medium">67.5% active rate</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Rating
                  </CardTitle>
                  <Star className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">4.6</div>
                  <p className="text-sm text-green-600 font-medium">Customer satisfaction</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$847K</div>
                  <p className="text-sm text-green-600 font-medium">+22% growth</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Customers List */}
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
                    <CardTitle className="text-xl">Customer Directory</CardTitle>
                    <CardDescription>
                      Manage and analyze customer relationships
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customers.map((customer, index) => (
                    <motion.div 
                      key={customer.id}
                      className="glass-card p-6 rounded-2xl hover-lift group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                            <AvatarImage src={`/api/placeholder/64/64?text=${customer.name.split(' ').map(n => n[0]).join('')}`} />
                            <AvatarFallback className="gradient-primary text-white text-lg">
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(customer.status)} rounded-full border-2 border-white`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg text-foreground">{customer.name}</h3>
                            <Badge 
                              variant={customer.status === "vip" || customer.status === "premium" ? "default" : "secondary"}
                              className="text-xs capitalize"
                            >
                              {customer.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{customer.location}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Orders</p>
                              <p className="font-semibold text-foreground">{customer.orders}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Spent</p>
                              <p className="font-semibold text-foreground">{customer.totalSpent}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">Rating</p>
                              <div className="flex items-center justify-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-semibold text-foreground">{customer.rating}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-4 border-t border-border/30">
                            <Button size="sm" className="btn-premium flex-1">
                              <Mail className="w-4 h-4 mr-2" />
                              Contact
                            </Button>
                            <Button size="sm" variant="outline" className="glass-card border-0 hover-glow flex-1">
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Orders
                            </Button>
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