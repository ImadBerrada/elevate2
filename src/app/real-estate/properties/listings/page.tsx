"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Bed,
  Bath,
  Square,
  Search,
  Filter,
  Plus,
  Eye,
  Edit
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

export default function PropertyListings() {
  const properties = [
    {
      id: 1,
      title: "Luxury Downtown Apartment",
      address: "Downtown Dubai, Building A",
      price: "$2,500,000",
      rent: "$8,500/month",
      type: "Apartment",
      bedrooms: 3,
      bathrooms: 2,
      area: "1,850 sq ft",
      status: "available",
      image: "/api/placeholder/400/300"
    },
    {
      id: 2,
      title: "Modern Business Bay Office",
      address: "Business Bay, Tower B",
      price: "$1,800,000",
      rent: "$12,000/month",
      type: "Office",
      bedrooms: 0,
      bathrooms: 3,
      area: "2,200 sq ft",
      status: "rented",
      image: "/api/placeholder/400/300"
    },
    {
      id: 3,
      title: "Marina View Penthouse",
      address: "Dubai Marina, Tower C",
      price: "$4,200,000",
      rent: "$15,000/month",
      type: "Penthouse",
      bedrooms: 4,
      bathrooms: 3,
      area: "3,500 sq ft",
      status: "available",
      image: "/api/placeholder/400/300"
    },
    {
      id: 4,
      title: "Jumeirah Villa",
      address: "Jumeirah, Villa District",
      price: "$3,800,000",
      rent: "$18,000/month",
      type: "Villa",
      bedrooms: 5,
      bathrooms: 4,
      area: "4,200 sq ft",
      status: "maintenance",
      image: "/api/placeholder/400/300"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "rented": return "bg-blue-100 text-blue-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      case "sold": return "bg-gray-100 text-gray-800";
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
                    <Building2 className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold text-gradient">Property Listings</h1>
                    <p className="text-sm text-muted-foreground">Manage real estate property portfolio</p>
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
                    placeholder="Search properties..." 
                    className="pl-10 w-64 glass-card border-0 focus-premium"
                  />
                </div>
                <Button variant="outline" className="glass-card border-0 hover-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
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
                    Total Properties
                  </CardTitle>
                  <Building2 className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">247</div>
                  <p className="text-sm text-green-600 font-medium">+12 this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Available
                  </CardTitle>
                  <MapPin className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">89</div>
                  <p className="text-sm text-green-600 font-medium">36% availability</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$847M</div>
                  <p className="text-sm text-green-600 font-medium">+8.2% appreciation</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-orange-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">$2.4M</div>
                  <p className="text-sm text-green-600 font-medium">+15% from last month</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Property Grid */}
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
                    <Building2 className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Property Portfolio</CardTitle>
                    <CardDescription>
                      Manage and view all properties
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((property, index) => (
                    <motion.div 
                      key={property.id}
                      className="glass-card rounded-2xl overflow-hidden hover-lift group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Property Image */}
                      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-primary/40" />
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge 
                            className={`text-xs ${getStatusColor(property.status)}`}
                            variant="outline"
                          >
                            {property.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Property Details */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="font-semibold text-lg text-foreground mb-1">{property.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{property.address}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Sale Price</p>
                            <p className="text-lg font-bold text-gradient">{property.price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Rent</p>
                            <p className="text-lg font-bold text-foreground">{property.rent}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Square className="w-4 h-4" />
                            <span>{property.area}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {property.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="btn-premium flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="glass-card border-0 hover-glow">
                            <Edit className="w-4 h-4" />
                          </Button>
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