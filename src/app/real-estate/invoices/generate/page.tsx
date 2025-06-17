"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Printer,
  Menu,
  Settings,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Home,
  Calculator,
  Receipt,
  MoreHorizontal,
  Copy,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

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

// Interfaces for API integration
interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  area?: string;
  propertyType?: {
    id: string;
    name: string;
  };
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  totalMonthlyRent?: number;
  totalUnits?: number;
  occupiedUnits?: number;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Agreement {
  id: string;
  agreementNumber: string;
  rentAmount: number;
  tenant: Tenant;
  property: Property;
  rentalUnit: {
    id: string;
    unitNumber: string;
    unitType?: {
      id: string;
      name: string;
    };
  };
  startDate: string;
  endDate: string;
  status?: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING';
  paymentDueDate?: number;
  paymentFrequency?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  type: 'RENT' | 'MAINTENANCE' | 'UTILITY' | 'SERVICE' | 'CUSTOM';
  defaultItems: InvoiceItem[];
  isActive: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  agreement: Agreement;
  type: 'RENT' | 'MAINTENANCE' | 'UTILITY' | 'SERVICE' | 'CUSTOM';
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
}

function GenerateInvoicesContent() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // URL parameter handling
  const [urlParams, setUrlParams] = useState<{
    tenant?: string;
    agreement?: string;
    property?: string;
    type?: string;
  }>({});
  
  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState<{
    agreementId: string;
    type: string;
    templateId: string;
    issueDate: string;
    dueDate: string;
    notes: string;
    terms: string;
    items: InvoiceItem[];
  }>({
    agreementId: '',
    type: '',
    templateId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    terms: '',
    items: []
  });
  
  // Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    // Handle URL parameters for navigation context
    const fromParam = searchParams.get('from');
    const successParam = searchParams.get('success');
    const tenantParam = searchParams.get('tenant');
    const agreementParam = searchParams.get('agreement');
    const propertyParam = searchParams.get('property');
    const typeParam = searchParams.get('type');
    
      const newUrlParams = {
      tenant: tenantParam || undefined,
      agreement: agreementParam || undefined,
      property: propertyParam || undefined,
      type: typeParam || undefined,
      };
      setUrlParams(newUrlParams);
    
    if (successParam) {
      setSuccess(successParam);
      setTimeout(() => setSuccess(null), 5000);
    }
    
    if (fromParam) {
      setSuccess(`Navigated from ${fromParam} module`);
      setTimeout(() => setSuccess(null), 4000);
    }
      
      // Auto-fill form based on URL parameters
      if (newUrlParams.agreement) {
        setInvoiceForm(prev => ({ ...prev, agreementId: newUrlParams.agreement! }));
        setSuccess(`Creating invoice for selected agreement`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      if (newUrlParams.type) {
        setInvoiceForm(prev => ({ ...prev, type: newUrlParams.type! }));
      }
      
      if (newUrlParams.tenant) {
        setSuccess(`Creating invoice for selected tenant`);
        setTimeout(() => setSuccess(null), 3000);
      }
      
      if (newUrlParams.property) {
        setSuccess(`Creating invoice for selected property - showing related agreements`);
        setTimeout(() => setSuccess(null), 3000);
    }
    
    fetchData();
  }, [searchParams]);

  const navigateToModule = (module: string, params?: Record<string, string>) => {
    const queryParams = new URLSearchParams(params);
    queryParams.set('from', 'invoices/generate');
    router.push(`/real-estate/${module}?${queryParams}`);
  };

  // Auto-dismiss notifications
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAgreements(),
        fetchInvoiceTemplates(),
        fetchRecentInvoices()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  // Refetch agreements when URL parameters change
  useEffect(() => {
    if (Object.keys(urlParams).length > 0) {
      fetchAgreements();
    }
  }, [urlParams]);

  const fetchAgreements = async () => {
    try {
      // Build query parameters based on URL context
      const queryParams = new URLSearchParams();
      if (urlParams.property) {
        queryParams.append('propertyId', urlParams.property);
      }
      if (urlParams.tenant) {
        queryParams.append('tenantId', urlParams.tenant);
      }
      
      const url = `/api/real-estate/agreements${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setAgreements(data.agreements || []);
      } else {
        setError('Failed to fetch agreements');
      }
    } catch (error) {
      console.error('Error fetching agreements:', error);
      setError('Failed to fetch agreements');
    }
  };

  const fetchInvoiceTemplates = async () => {
    try {
      const response = await fetch('/api/real-estate/invoice-templates');
      if (response.ok) {
        const data = await response.json();
        setInvoiceTemplates(data.templates || []);
      } else {
        // Fallback to default templates
        setInvoiceTemplates([
          {
            id: 'rent',
            name: 'Monthly Rent Invoice',
            description: 'Standard monthly rent collection',
            type: 'RENT',
            defaultItems: [
              {
                id: '1',
                description: 'Monthly Rent',
                quantity: 1,
                unitPrice: 0,
                amount: 0
              }
            ],
            isActive: true
          },
          {
            id: 'maintenance',
            name: 'Maintenance Invoice',
            description: 'Property maintenance and repairs',
            type: 'MAINTENANCE',
            defaultItems: [
              {
                id: '1',
                description: 'Maintenance Services',
                quantity: 1,
                unitPrice: 0,
                amount: 0
              }
            ],
            isActive: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching invoice templates:', error);
    }
  };

  const fetchRecentInvoices = async () => {
    try {
      const response = await fetch('/api/real-estate/invoices/recent?limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching recent invoices:', error);
    }
  };

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
      case "PAID": return "bg-green-100 text-green-800";
      case "SENT": return "bg-blue-100 text-blue-800";
      case "DRAFT": return "bg-yellow-100 text-yellow-800";
      case "OVERDUE": return "bg-red-100 text-red-800";
      case "CANCELLED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Cross-module navigation handlers
  const handleViewTenant = (invoice: Invoice) => {
    navigateToModule('tenants/management', { 
      success: 'Viewing tenant details from invoice generation',
      highlight: invoice.agreement.tenant.id,
      invoice: invoice.id
    });
  };

  const handleViewProperty = (invoice: Invoice) => {
    navigateToModule('properties/management', { 
      success: 'Viewing property details from invoice generation',
      highlight: invoice.agreement.property.id,
      tenant: invoice.agreement.tenant.id
    });
  };

  const handleViewAgreement = (invoice: Invoice) => {
    navigateToModule('tenants/leases', { 
      success: 'Viewing lease details from invoice generation',
      agreement: invoice.agreement.id,
      highlight: invoice.agreement.id
    });
  };

  const handleViewPayments = (invoice: Invoice) => {
    navigateToModule('payments/history', { 
      success: 'Viewing payment history from invoice generation',
      invoice: invoice.id,
      agreement: invoice.agreement.id
    });
  };

  // Cross-module navigation for properties
  const handleNavigateToProperties = () => {
    navigateToModule('properties/management', { 
      success: 'Viewing properties from invoice generation'
    });
  };

  const handleNavigateToTenants = () => {
    navigateToModule('tenants/management', { 
      success: 'Viewing tenants from invoice generation'
    });
  };

  const handleNavigateToLeases = () => {
    navigateToModule('tenants/leases', { 
      success: 'Viewing leases from invoice generation'
    });
  };

  const handleNavigateToPayments = () => {
    window.location.href = '/real-estate/payments/processing';
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateInvoiceTotal = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * 0.05; // 5% VAT
    return { subtotal, taxAmount, total: subtotal + taxAmount };
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = invoiceTemplates.find(t => t.id === templateId);
    if (template) {
      setInvoiceForm(prev => ({
        ...prev,
        templateId,
        type: template.type,
        items: template.defaultItems.map(item => ({ ...item, id: Date.now().toString() + Math.random() }))
      }));
    }
  };

  const handleAgreementSelect = (agreementId: string) => {
    const agreement = agreements.find(a => a.id === agreementId);
    if (agreement) {
      setInvoiceForm(prev => ({
        ...prev,
        agreementId,
        items: prev.items.map(item => 
          item.description.toLowerCase().includes('rent') 
            ? { ...item, unitPrice: agreement.rentAmount, amount: agreement.rentAmount }
            : item
        )
      }));
    }
  };

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateInvoiceItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeInvoiceItem = (itemId: string) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleGenerateInvoice = async (action: 'draft' | 'send') => {
    try {
      const { subtotal, taxAmount, total } = calculateInvoiceTotal();
      
      const invoiceData = {
        ...invoiceForm,
        status: action === 'draft' ? 'DRAFT' : 'SENT',
        subtotal,
        taxAmount,
        totalAmount: total
      };

      const response = await fetch('/api/real-estate/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (data.success) {
        await fetchRecentInvoices();
        setSuccess(`Invoice ${action === 'draft' ? 'saved as draft' : 'generated and sent'} successfully`);
        
        // Reset form
        setInvoiceForm({
          agreementId: '',
          type: '',
          templateId: '',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: '',
          terms: '',
          items: []
        });
      } else {
        setError(data.error || 'Failed to generate invoice');
      }
    } catch (error) {
      setError('Failed to generate invoice');
      console.error('Error generating invoice:', error);
    }
  };

  const handlePreviewInvoice = () => {
    const agreement = agreements.find(a => a.id === invoiceForm.agreementId);
    if (!agreement) {
      setError('Please select an agreement first');
      return;
    }

    const { subtotal, taxAmount, total } = calculateInvoiceTotal();
    
    const preview: Invoice = {
      id: 'preview',
      invoiceNumber: 'PREVIEW-' + Date.now(),
      agreement,
      type: invoiceForm.type as Invoice['type'],
      status: 'DRAFT',
      issueDate: invoiceForm.issueDate,
      dueDate: invoiceForm.dueDate,
      items: invoiceForm.items,
      subtotal,
      taxAmount,
      totalAmount: total,
      notes: invoiceForm.notes,
      terms: invoiceForm.terms
    };

    setPreviewInvoice(preview);
    setIsPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading invoice data...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <BurgerMenu />
                <motion.div
                  className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Receipt className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">Generate Invoices</h1>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  variant="outline" 
                  onClick={handlePreviewInvoice}
                  disabled={!invoiceForm.agreementId || invoiceForm.items.length === 0}
                  className="glass-card border-0 hover-glow"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="glass-card border-0 hover-glow">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleNavigateToProperties}>
                      <Building2 className="w-4 h-4 mr-2" />
                      Property Management
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNavigateToTenants}>
                      <Users className="w-4 h-4 mr-2" />
                      Tenant Management
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNavigateToLeases}>
                      <FileText className="w-4 h-4 mr-2" />
                      Lease Agreements
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleNavigateToPayments}>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Payment Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = '/real-estate/invoices/history'}>
                      <Receipt className="w-4 h-4 mr-2" />
                      Invoice History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      <Select value={invoiceForm.type} onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="glass-card border-0">
                          <SelectValue placeholder="Select invoice type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RENT">Rent Invoice</SelectItem>
                          <SelectItem value="MAINTENANCE">Maintenance Invoice</SelectItem>
                          <SelectItem value="UTILITY">Utility Invoice</SelectItem>
                          <SelectItem value="SERVICE">Service Invoice</SelectItem>
                          <SelectItem value="CUSTOM">Custom Invoice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Tenant Agreement</label>
                      <Select value={invoiceForm.agreementId} onValueChange={handleAgreementSelect}>
                        <SelectTrigger className="glass-card border-0">
                          <SelectValue placeholder="Select tenant agreement" />
                        </SelectTrigger>
                        <SelectContent>
                          {agreements.map((agreement) => (
                            <SelectItem key={agreement.id} value={agreement.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {agreement.property.name} - Unit {agreement.rentalUnit.unitNumber}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {agreement.tenant.firstName} {agreement.tenant.lastName} • AED {agreement.rentAmount.toLocaleString()}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {invoiceForm.agreementId && (
                    <>
                      {/* Agreement & Property Information */}
                      <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                          <Building2 className="w-5 h-5 mr-2 text-primary" />
                          Agreement & Property Details
                        </h3>
                        {(() => {
                          const selectedAgreement = agreements.find(a => a.id === invoiceForm.agreementId);
                          if (!selectedAgreement) return null;
                          
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Property</label>
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-left justify-start font-medium text-foreground hover:text-primary"
                                    onClick={() => window.location.href = `/real-estate/properties/management?highlight=${selectedAgreement.property.id}&tenant=${selectedAgreement.tenant.id}`}
                                  >
                                    {selectedAgreement.property.name}
                                  </Button>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedAgreement.property.address}
                                    {selectedAgreement.property.city && `, ${selectedAgreement.property.city}`}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Unit</label>
                                  <p className="text-foreground font-medium">
                                    Unit {selectedAgreement.rentalUnit.unitNumber}
                                    {selectedAgreement.rentalUnit.unitType && (
                                      <span className="text-sm text-muted-foreground ml-2">
                                        ({selectedAgreement.rentalUnit.unitType.name})
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Agreement Number</label>
                                  <p className="text-foreground font-medium">{selectedAgreement.agreementNumber}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Tenant</label>
                                  <p className="text-foreground font-medium">
                                    {selectedAgreement.tenant.firstName} {selectedAgreement.tenant.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{selectedAgreement.tenant.email}</p>
                                  {selectedAgreement.tenant.phone && (
                                    <p className="text-sm text-muted-foreground">{selectedAgreement.tenant.phone}</p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Monthly Rent</label>
                                  <p className="text-foreground font-medium text-lg text-gradient">
                                    AED {selectedAgreement.rentAmount.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Agreement Period</label>
                                  <p className="text-foreground">
                                    {formatDate(selectedAgreement.startDate)} - {formatDate(selectedAgreement.endDate)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </>
                  )}

                  {/* Invoice Items */}
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-primary" />
                        Invoice Items
                      </h3>
                      <Button 
                        type="button" 
                        onClick={addInvoiceItem}
                        size="sm" 
                        className="btn-premium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                        <div className="col-span-4">Description</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Rate (AED)</div>
                        <div className="col-span-3">Amount (AED)</div>
                        <div className="col-span-1">Action</div>
                      </div>
                      
                      {invoiceForm.items.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-4">
                            <Input 
                              value={item.description}
                              onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                              placeholder="Item description" 
                              className="glass-card border-0"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              placeholder="1" 
                              className="glass-card border-0"
                              min="0"
                              step="1"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input 
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              placeholder="0.00" 
                              className="glass-card border-0"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="col-span-3">
                            <div className="text-lg font-semibold text-gradient">
                              AED {item.amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => removeInvoiceItem(item.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
                            >
                              <X className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {invoiceForm.items.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No items added yet</p>
                          <p className="text-sm">Click "Add Item" to start building your invoice</p>
                        </div>
                      )}
                    </div>
                    
                    {invoiceForm.items.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-primary/20">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Subtotal:</span>
                            <span className="font-medium">AED {calculateInvoiceTotal().subtotal.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>VAT (5%):</span>
                            <span className="font-medium">AED {calculateInvoiceTotal().taxAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t border-primary/10">
                            <span>Total Amount:</span>
                            <span className="text-gradient">AED {calculateInvoiceTotal().total.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Invoice Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Issue Date</label>
                      <Input 
                        type="date"
                        value={invoiceForm.issueDate}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, issueDate: e.target.value }))}
                        className="glass-card border-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Due Date</label>
                      <Input 
                        type="date"
                        value={invoiceForm.dueDate}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="glass-card border-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Notes</label>
                    <Textarea 
                      value={invoiceForm.notes}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes or terms..."
                      className="glass-card border-0 min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Terms & Conditions</label>
                    <Textarea 
                      value={invoiceForm.terms}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, terms: e.target.value }))}
                      placeholder="Payment terms and conditions..."
                      className="glass-card border-0 min-h-[80px] resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button 
                      onClick={() => handleGenerateInvoice('draft')}
                      disabled={!invoiceForm.agreementId || invoiceForm.items.length === 0}
                      className="btn-premium"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button 
                      onClick={() => handleGenerateInvoice('send')}
                      disabled={!invoiceForm.agreementId || invoiceForm.items.length === 0}
                      variant="outline" 
                      className="glass-card border-0 hover-glow"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Invoice
                    </Button>
                    <Button 
                      onClick={handlePreviewInvoice}
                      disabled={!invoiceForm.agreementId || invoiceForm.items.length === 0}
                      variant="outline" 
                      className="glass-card border-0 hover-glow"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
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
                            {template.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <Button 
                          size="sm" 
                          className="w-full btn-premium"
                          onClick={() => handleTemplateSelect(template.id)}
                        >
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
                          <span className="text-sm font-semibold text-gradient">{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{invoice.agreement.tenant.firstName} {invoice.agreement.tenant.lastName}</p>
                        <p className="text-xs text-muted-foreground">{invoice.agreement.property.name} - Unit {invoice.agreement.rentalUnit.unitNumber}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">Due: {formatDate(invoice.dueDate)}</span>
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

      {/* Success/Error Notifications */}
      {success && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSuccess(null)}
              className="ml-2 hover:bg-green-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setError(null)}
              className="ml-2 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Receipt className="w-5 h-5" />
              <span>Invoice Preview</span>
            </DialogTitle>
            <DialogDescription>
              Preview your invoice before generating
            </DialogDescription>
          </DialogHeader>
          
          {previewInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gradient mb-2">INVOICE</h2>
                    <p className="text-sm text-muted-foreground">#{previewInvoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Issue Date</p>
                    <p className="font-medium">{formatDate(previewInvoice.issueDate)}</p>
                    <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                    <p className="font-medium">{formatDate(previewInvoice.dueDate)}</p>
                  </div>
                </div>

                {/* Tenant Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Bill To:</h3>
                    <p className="font-medium">{previewInvoice.agreement.tenant.firstName} {previewInvoice.agreement.tenant.lastName}</p>
                    <p className="text-sm text-muted-foreground">{previewInvoice.agreement.tenant.email}</p>
                    {previewInvoice.agreement.tenant.phone && (
                      <p className="text-sm text-muted-foreground">{previewInvoice.agreement.tenant.phone}</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Property:</h3>
                    <p className="font-medium">{previewInvoice.agreement.property.name}</p>
                    <p className="text-sm text-muted-foreground">Unit {previewInvoice.agreement.rentalUnit.unitNumber}</p>
                    <p className="text-sm text-muted-foreground">{previewInvoice.agreement.property.address}</p>
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-right p-3 font-medium">Qty</th>
                        <th className="text-right p-3 font-medium">Unit Price</th>
                        <th className="text-right p-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewInvoice.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="p-3 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(previewInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>VAT (5%):</span>
                      <span>{formatCurrency(previewInvoice.taxAmount)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between py-2 text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-gradient">{formatCurrency(previewInvoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {previewInvoice.notes && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Notes:</h3>
                    <p className="text-sm text-muted-foreground">{previewInvoice.notes}</p>
                  </div>
                )}

                {/* Terms */}
                {previewInvoice.terms && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
                    <p className="text-sm text-muted-foreground">{previewInvoice.terms}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button 
              className="btn-premium"
              onClick={() => {
                setIsPreviewOpen(false);
                handleGenerateInvoice('send');
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              Generate & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GenerateInvoices() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <GenerateInvoicesContent />
    </Suspense>
  );
} 