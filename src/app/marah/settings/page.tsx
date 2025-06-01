"use client";

import { motion } from "framer-motion";
import { 
  Settings, 
  Truck, 
  DollarSign,
  MapPin,
  Clock,
  Users,
  Bell,
  Shield,
  Search,
  Save,
  RotateCcw,
  Eye,
  Edit,
  Sliders
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

// Simple Switch component since the UI library doesn't have one
const Switch = ({ checked, className }: { checked: boolean; className?: string }) => (
  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-200'} ${className}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </div>
);

export default function MarahSettings() {
  const deliverySettings = [
    {
      category: "Delivery Zones",
      settings: [
        { name: "Dubai Marina", enabled: true, baseCharge: "$5.00", description: "Premium zone with high demand" },
        { name: "Downtown Dubai", enabled: true, baseCharge: "$6.50", description: "Business district with traffic considerations" },
        { name: "Jumeirah", enabled: true, baseCharge: "$4.50", description: "Residential area with standard rates" },
        { name: "Business Bay", enabled: false, baseCharge: "$5.50", description: "Currently under maintenance" }
      ]
    },
    {
      category: "Delivery Times",
      settings: [
        { name: "Express Delivery", enabled: true, timeLimit: "30 mins", description: "Premium fast delivery service" },
        { name: "Standard Delivery", enabled: true, timeLimit: "60 mins", description: "Regular delivery timeframe" },
        { name: "Scheduled Delivery", enabled: true, timeLimit: "Custom", description: "Customer-selected time slots" },
        { name: "Night Delivery", enabled: false, timeLimit: "120 mins", description: "After-hours delivery option" }
      ]
    }
  ];

  const pricingSettings = [
    { name: "Base Delivery Fee", value: "$3.50", description: "Minimum charge for all deliveries" },
    { name: "Distance Multiplier", value: "$0.75/km", description: "Additional charge per kilometer" },
    { name: "Peak Hour Surcharge", value: "25%", description: "Extra charge during busy periods" },
    { name: "Express Delivery Premium", value: "$2.00", description: "Additional fee for express service" },
    { name: "Fuel Surcharge", value: "$0.50", description: "Current fuel adjustment fee" }
  ];

  const systemSettings = [
    { name: "Auto-assign Orders", enabled: true, description: "Automatically assign orders to nearest available driver" },
    { name: "Real-time Tracking", enabled: true, description: "Enable GPS tracking for all deliveries" },
    { name: "SMS Notifications", enabled: true, description: "Send SMS updates to customers" },
    { name: "Email Notifications", enabled: true, description: "Send email confirmations and updates" },
    { name: "Driver Rating System", enabled: true, description: "Allow customers to rate drivers" },
    { name: "Surge Pricing", enabled: false, description: "Dynamic pricing during high demand" },
    { name: "Multi-stop Deliveries", enabled: true, description: "Allow drivers to handle multiple orders" },
    { name: "Cash on Delivery", enabled: true, description: "Accept cash payments on delivery" }
  ];

  const operationalMetrics = [
    { metric: "Active Zones", value: "12", status: "operational" },
    { metric: "Avg Delivery Time", value: "28 mins", status: "good" },
    { metric: "Driver Utilization", value: "78%", status: "optimal" },
    { metric: "Customer Satisfaction", value: "4.6/5", status: "excellent" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "optimal": return "text-green-600";
      case "operational": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "excellent": return "bg-green-100 text-green-800";
      case "good": return "bg-blue-100 text-blue-800";
      case "optimal": return "bg-green-100 text-green-800";
      case "operational": return "bg-blue-100 text-blue-800";
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
                    <Settings className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">MARAH Settings</h1>
                    <p className="text-sm text-muted-foreground">System configuration and preferences</p>
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
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Default
                </Button>
                <Button className="btn-premium">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-8 py-8">
          {/* Operational Metrics */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {operationalMetrics.map((metric, index) => (
              <motion.div key={index} variants={fadeInUp} className="hover-lift">
                <Card className="card-premium border-0 bg-gradient-to-br from-blue-50/80 to-white/80">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.metric}
                    </CardTitle>
                    <Badge 
                      className={`text-xs ${getStatusBg(metric.status)}`}
                      variant="outline"
                    >
                      {metric.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gradient mb-2">{metric.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* System Settings */}
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
                      <Sliders className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>System Settings</CardTitle>
                      <CardDescription>
                        Core system configuration options
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {systemSettings.map((setting, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center justify-between p-4 glass-card rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{setting.name}</h4>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        <Switch 
                          checked={setting.enabled}
                          className="ml-4"
                        />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pricing Settings */}
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
                      <DollarSign className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Pricing Configuration</CardTitle>
                      <CardDescription>
                        Delivery charges and fee structure
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pricingSettings.map((setting, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{setting.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gradient">{setting.value}</span>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Delivery Settings */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.8 }}
          >
            <Card className="card-premium border-0">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Truck className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Delivery Configuration</CardTitle>
                    <CardDescription>
                      Zone management and delivery time settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {deliverySettings.map((category, categoryIndex) => (
                    <motion.div 
                      key={categoryIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + categoryIndex * 0.2 }}
                    >
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                        {category.category === "Delivery Zones" ? (
                          <MapPin className="w-5 h-5 mr-2 text-primary" />
                        ) : (
                          <Clock className="w-5 h-5 mr-2 text-primary" />
                        )}
                        {category.category}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.settings.map((setting, index) => (
                          <motion.div 
                            key={index}
                            className="glass-card p-6 rounded-2xl hover-lift group"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.0 + categoryIndex * 0.2 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-lg text-foreground">{setting.name}</h4>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  checked={setting.enabled}
                                  className="scale-90"
                                />
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">{setting.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {category.category === "Delivery Zones" ? (
                                  <>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Base Charge</p>
                                      <p className="font-semibold text-gradient">
                                        {'baseCharge' in setting ? setting.baseCharge : 'N/A'}
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Time Limit</p>
                                      <p className="font-semibold text-gradient">
                                        {'timeLimit' in setting ? setting.timeLimit : 'N/A'}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${setting.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                              >
                                {setting.enabled ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
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