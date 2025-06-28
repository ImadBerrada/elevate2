"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  Plus, 
  DollarSign,
  Edit,
  Trash2,
  Calendar,
  Percent,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Star,
  Gift,
  MoreHorizontal,
  Save
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface BaseRate {
  id: string;
  name: string;
  description: string;
  retreatType: string;
  basePrice: number;
  currency: string;
  duration: number; // in days
  maxGuests: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SeasonalRate {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  rateType: 'PERCENTAGE' | 'FIXED';
  adjustment: number; // percentage or fixed amount
  applicableRates: string[]; // base rate IDs
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Discount {
  id: string;
  name: string;
  description: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minStay?: number;
  maxGuests?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Package {
  id: string;
  name: string;
  description: string;
  includes: string[];
  price: number;
  currency: string;
  duration: number;
  maxGuests: number;
  category: 'WELLNESS' | 'ADVENTURE' | 'SPIRITUAL' | 'CORPORATE' | 'FAMILY';
  isActive: boolean;
  popularity: number;
  createdAt: string;
  updatedAt: string;
}

export default function RateManagementPage() {
  const { isOpen } = useSidebar();
  const [baseRates, setBaseRates] = useState<BaseRate[]>([]);
  const [seasonalRates, setSeasonalRates] = useState<SeasonalRate[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("base-rates");

  // Modal states
  const [isAddRateOpen, setIsAddRateOpen] = useState(false);
  const [isAddSeasonalOpen, setIsAddSeasonalOpen] = useState(false);
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);

  // Form data
  const [rateData, setRateData] = useState({
    name: "",
    description: "",
    retreatType: "",
    basePrice: "",
    duration: "",
    maxGuests: ""
  });

  const [seasonalData, setSeasonalData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    rateType: "PERCENTAGE",
    adjustment: "",
    applicableRates: [] as string[]
  });

  const [discountData, setDiscountData] = useState({
    name: "",
    description: "",
    code: "",
    type: "PERCENTAGE",
    value: "",
    minStay: "",
    maxGuests: "",
    startDate: "",
    endDate: "",
    usageLimit: ""
  });

  const [packageData, setPackageData] = useState({
    name: "",
    description: "",
    includes: [] as string[],
    price: "",
    duration: "",
    maxGuests: "",
    category: "WELLNESS"
  });

  // Mock data
  useEffect(() => {
    const mockBaseRates: BaseRate[] = [
      {
        id: '1',
        name: 'Standard Retreat',
        description: 'Basic retreat package with accommodation and meals',
        retreatType: 'Wellness',
        basePrice: 1500,
        currency: 'AED',
        duration: 3,
        maxGuests: 20,
        isActive: true,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z'
      },
      {
        id: '2',
        name: 'Premium Retreat',
        description: 'Enhanced retreat with spa services and private sessions',
        retreatType: 'Wellness',
        basePrice: 2500,
        currency: 'AED',
        duration: 5,
        maxGuests: 15,
        isActive: true,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z'
      },
      {
        id: '3',
        name: 'Corporate Retreat',
        description: 'Team building and leadership development program',
        retreatType: 'Corporate',
        basePrice: 2000,
        currency: 'AED',
        duration: 2,
        maxGuests: 30,
        isActive: true,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z'
      }
    ];

    const mockSeasonalRates: SeasonalRate[] = [
      {
        id: '1',
        name: 'Winter Season',
        description: 'Peak season pricing for winter months',
        startDate: '2024-12-01',
        endDate: '2024-02-28',
        rateType: 'PERCENTAGE',
        adjustment: 25,
        applicableRates: ['1', '2'],
        isActive: true,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z'
      },
      {
        id: '2',
        name: 'Summer Special',
        description: 'Discounted rates for hot summer months',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        rateType: 'PERCENTAGE',
        adjustment: -15,
        applicableRates: ['1', '2', '3'],
        isActive: true,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z'
      }
    ];

    const mockDiscounts: Discount[] = [
      {
        id: '1',
        name: 'Early Bird',
        description: '20% discount for bookings made 30 days in advance',
        code: 'EARLY20',
        type: 'PERCENTAGE',
        value: 20,
        minStay: 3,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        usageLimit: 100,
        usedCount: 45,
        isActive: true,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        name: 'Group Discount',
        description: 'AED 500 off for groups of 10 or more',
        code: 'GROUP500',
        type: 'FIXED',
        value: 500,
        maxGuests: 10,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        usageLimit: 50,
        usedCount: 12,
        isActive: true,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-10T11:20:00Z'
      }
    ];

    const mockPackages: Package[] = [
      {
        id: '1',
        name: 'Mindfulness Escape',
        description: 'Complete wellness package with meditation and yoga',
        includes: ['Accommodation', 'All Meals', 'Yoga Sessions', 'Meditation Classes', 'Spa Treatment'],
        price: 3200,
        currency: 'AED',
        duration: 7,
        maxGuests: 12,
        category: 'WELLNESS',
        isActive: true,
        popularity: 95,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z'
      },
      {
        id: '2',  
        name: 'Family Bonding',
        description: 'Special family retreat with activities for all ages',
        includes: ['Family Accommodation', 'All Meals', 'Family Activities', 'Kids Club', 'Nature Walks'],
        price: 4500,
        currency: 'AED',
        duration: 5,
        maxGuests: 20,
        category: 'FAMILY',
        isActive: true,
        popularity: 88,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T09:00:00Z'
      }
    ];

    setBaseRates(mockBaseRates);
    setSeasonalRates(mockSeasonalRates);
    setDiscounts(mockDiscounts);
    setPackages(mockPackages);
    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const handleCreateBaseRate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate: BaseRate = {
      id: Date.now().toString(),
      name: rateData.name,
      description: rateData.description,
      retreatType: rateData.retreatType,
      basePrice: parseFloat(rateData.basePrice),
      currency: 'AED',
      duration: parseInt(rateData.duration),
      maxGuests: parseInt(rateData.maxGuests),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setBaseRates(prev => [newRate, ...prev]);
    setIsAddRateOpen(false);
    setRateData({ name: "", description: "", retreatType: "", basePrice: "", duration: "", maxGuests: "" });
  };

  const handleToggleRate = (id: string) => {
    setBaseRates(prev => prev.map(rate => 
      rate.id === id ? { ...rate, isActive: !rate.isActive, updatedAt: new Date().toISOString() } : rate
    ));
  };

  const baseRateColumns = [
    {
      accessorKey: "name",
      header: "Rate Name",
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-gray-500">{row.original.retreatType}</p>
        </div>
      )
    },
    {
      accessorKey: "basePrice",
      header: "Base Price",
      cell: ({ row }: any) => formatCurrency(row.getValue("basePrice"))
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }: any) => `${row.getValue("duration")} days`
    },
    {
      accessorKey: "maxGuests",
      header: "Max Guests",
      cell: ({ row }: any) => `${row.getValue("maxGuests")} guests`
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={row.getValue("isActive") ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit Rate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleRate(row.original.id)}>
              {row.original.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Rate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const seasonalColumns = [
    {
      accessorKey: "name",
      header: "Season Name"
    },
    {
      accessorKey: "period",
      header: "Period",
      cell: ({ row }: any) => `${format(new Date(row.original.startDate), "MMM dd")} - ${format(new Date(row.original.endDate), "MMM dd")}`
    },
    {
      accessorKey: "adjustment",
      header: "Adjustment",
      cell: ({ row }: any) => {
        const adjustment = row.original.adjustment;
        const type = row.original.rateType;
        return (
          <div className="flex items-center gap-1">
            {adjustment > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
            <span className={adjustment > 0 ? "text-green-600" : "text-red-600"}>
              {adjustment > 0 ? "+" : ""}{adjustment}{type === 'PERCENTAGE' ? '%' : ' AED'}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={row.getValue("isActive") ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      )
    }
  ];

  const discountColumns = [
    {
      accessorKey: "name",
      header: "Discount Name",
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-gray-500 font-mono">{row.original.code}</p>
        </div>
      )
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }: any) => {
        const value = row.original.value;
        const type = row.original.type;
        return type === 'PERCENTAGE' ? `${value}%` : formatCurrency(value);
      }
    },
    {
      accessorKey: "usage",
      header: "Usage",
      cell: ({ row }: any) => {
        const used = row.original.usedCount;
        const limit = row.original.usageLimit;
        return limit ? `${used}/${limit}` : `${used}/∞`;
      }
    },
    {
      accessorKey: "validity",
      header: "Valid Until",
      cell: ({ row }: any) => format(new Date(row.original.endDate), "MMM dd, yyyy")
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={row.getValue("isActive") ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      )
    }
  ];

  const packageColumns = [
    {
      accessorKey: "name",
      header: "Package Name",
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <Badge variant="outline">{row.original.category}</Badge>
        </div>
      )
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: any) => formatCurrency(row.getValue("price"))
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }: any) => `${row.getValue("duration")} days`
    },
    {
      accessorKey: "popularity",
      header: "Popularity",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{row.getValue("popularity")}%</span>
        </div>
      )
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={row.getValue("isActive") ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className={cn("flex-1 flex flex-col overflow-hidden", isOpen ? "lg:ml-64" : "lg:ml-20")}>
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Rate Management</h1>
                <p className="text-gray-600">Manage pricing structure, seasonal rates, discounts, and packages</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="base-rates" className="gap-2">
                  <DollarSign className="w-4 h-4" />
                  Base Rates
                </TabsTrigger>
                <TabsTrigger value="seasonal" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Seasonal Rates
                </TabsTrigger>
                <TabsTrigger value="discounts" className="gap-2">
                  <Percent className="w-4 h-4" />
                  Discounts
                </TabsTrigger>
                <TabsTrigger value="packages" className="gap-2">
                  <Package className="w-4 h-4" />
                  Packages
                </TabsTrigger>
              </TabsList>

              {/* Base Rates Tab */}
              <TabsContent value="base-rates">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">Base Rates</h2>
                      <p className="text-gray-600">Standard pricing for different retreat types</p>
                    </div>
                    <Dialog open={isAddRateOpen} onOpenChange={setIsAddRateOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Base Rate
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Base Rate</DialogTitle>
                          <DialogDescription>Create a new base rate for retreat pricing</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateBaseRate} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Rate Name</Label>
                            <Input
                              id="name"
                              value={rateData.name}
                              onChange={(e) => setRateData(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={rateData.description}
                              onChange={(e) => setRateData(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="retreatType">Retreat Type</Label>
                              <Select 
                                value={rateData.retreatType} 
                                onValueChange={(value) => setRateData(prev => ({ ...prev, retreatType: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Wellness">Wellness</SelectItem>
                                  <SelectItem value="Corporate">Corporate</SelectItem>
                                  <SelectItem value="Spiritual">Spiritual</SelectItem>
                                  <SelectItem value="Adventure">Adventure</SelectItem>
                                  <SelectItem value="Family">Family</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="basePrice">Base Price (AED)</Label>
                              <Input
                                id="basePrice"
                                type="number"
                                value={rateData.basePrice}
                                onChange={(e) => setRateData(prev => ({ ...prev, basePrice: e.target.value }))}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="duration">Duration (days)</Label>
                              <Input
                                id="duration"
                                type="number"
                                value={rateData.duration}
                                onChange={(e) => setRateData(prev => ({ ...prev, duration: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxGuests">Max Guests</Label>
                              <Input
                                id="maxGuests"
                                type="number"
                                value={rateData.maxGuests}
                                onChange={(e) => setRateData(prev => ({ ...prev, maxGuests: e.target.value }))}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-4">
                            <Button type="submit">Create Rate</Button>
                            <Button type="button" variant="outline" onClick={() => setIsAddRateOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Card>
                    <CardContent>
                      <DataTable
                        columns={baseRateColumns}
                        data={baseRates}
                        searchKey="name"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Seasonal Rates Tab */}
              <TabsContent value="seasonal">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">Seasonal Rates</h2>
                      <p className="text-gray-600">Adjust pricing based on seasons and demand</p>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Seasonal Rate
                    </Button>
                  </div>

                  <Card>
                    <CardContent>
                      <DataTable
                        columns={seasonalColumns}
                        data={seasonalRates}
                        searchKey="name"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Discounts Tab */}
              <TabsContent value="discounts">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">Discount Management</h2>
                      <p className="text-gray-600">Create and manage promotional discounts</p>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Discount
                    </Button>
                  </div>

                  <Card>
                    <CardContent>
                      <DataTable
                        columns={discountColumns}
                        data={discounts}
                        searchKey="name"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Packages Tab */}
              <TabsContent value="packages">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">Package Pricing</h2>
                      <p className="text-gray-600">Comprehensive packages with bundled services</p>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Package
                    </Button>
                  </div>

                  <Card>
                    <CardContent>
                      <DataTable
                        columns={packageColumns}
                        data={packages}
                        searchKey="name"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
} 