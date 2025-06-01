"use client";

import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  CheckCircle,
  Truck,
  MapPin,
  User,
  DollarSign,
  Search,
  Filter,
  Plus
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

export default function MarahOrders() {
  const orders = [
    {
      id: "ORD-001",
      customer: "Sarah Johnson",
      items: "2x Pizza Margherita, 1x Coca Cola",
      amount: "$24.50",
      status: "delivered",
      driver: "Ahmed Al-Rashid",
      address: "Downtown Dubai, Building A",
      orderTime: "2:30 PM",
      deliveryTime: "3:15 PM"
    },
    {
      id: "ORD-002",
      customer: "Ahmed Al-Mansouri",
      items: "1x Burger Combo, 1x Fries",
      amount: "$18.75",
      status: "in_transit",
      driver: "Omar Hassan",
      address: "Business Bay, Tower B",
      orderTime: "3:45 PM",
      deliveryTime: "4:30 PM (Est.)"
    },
    {
      id: "ORD-003",
      customer: "Maria Garcia",
      items: "3x Sushi Rolls, 1x Miso Soup",
      amount: "$32.00",
      status: "preparing",
      driver: "Khalid Mohammed",
      address: "Marina, Apartment 205",
      orderTime: "4:10 PM",
      deliveryTime: "5:00 PM (Est.)"
    },
    {
      id: "ORD-004",
      customer: "David Chen",
      items: "1x Chicken Shawarma, 1x Juice",
      amount: "$15.25",
      status: "pending",
      driver: "Not Assigned",
      address: "Jumeirah, Villa 12",
      orderTime: "4:25 PM",
      deliveryTime: "5:15 PM (Est.)"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "text-green-600";
      case "in_transit": return "text-blue-600";
      case "preparing": return "text-yellow-600";
      case "pending": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return CheckCircle;
      case "in_transit": return Truck;
      case "preparing": return Package;
      case "pending": return Clock;
      default: return Clock;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "delivered": return "from-green-50/80 to-white/80";
      case "in_transit": return "from-blue-50/80 to-white/80";
      case "preparing": return "from-yellow-50/80 to-white/80";
      case "pending": return "from-orange-50/80 to-white/80";
      default: return "from-gray-50/80 to-white/80";
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
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Orders</h1>
                    <p className="text-sm text-muted-foreground">Track and manage delivery orders</p>
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
                    placeholder="Search orders..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
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
                    Total Orders
                  </CardTitle>
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">1,247</div>
                  <p className="text-sm text-green-600 font-medium">+18% from yesterday</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Delivered
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">1,089</div>
                  <p className="text-sm text-green-600 font-medium">87.3% success rate</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    In Transit
                  </CardTitle>
                  <Truck className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">89</div>
                  <p className="text-sm text-muted-foreground">Currently delivering</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Revenue Today
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$24.8K</div>
                  <p className="text-sm text-green-600 font-medium">+22% from yesterday</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Orders List */}
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
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Recent Orders</CardTitle>
                    <CardDescription>
                      Track and manage all delivery orders
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order, index) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <motion.div 
                        key={order.id}
                        className={`glass-card p-6 rounded-2xl hover-lift group bg-gradient-to-br ${getStatusBg(order.status)}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <motion.div 
                              className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                              whileHover={{ scale: 1.1, rotate: 10 }}
                            >
                              <StatusIcon className={`w-6 h-6 ${getStatusColor(order.status)}`} />
                            </motion.div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-lg text-foreground">{order.id}</h3>
                                <Badge 
                                  variant={order.status === "delivered" ? "default" : "secondary"}
                                  className="text-xs capitalize"
                                >
                                  {order.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                                    <User className="w-4 h-4" />
                                    <span>{order.customer}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                                    <Package className="w-4 h-4" />
                                    <span>{order.items}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{order.address}</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Ordered: {order.orderTime}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                                    <Truck className="w-4 h-4" />
                                    <span>Driver: {order.driver}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Delivery: {order.deliveryTime}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gradient mb-2">{order.amount}</p>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" className="btn-premium">
                                <MapPin className="w-4 h-4 mr-2" />
                                Track
                              </Button>
                              <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                                Details
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