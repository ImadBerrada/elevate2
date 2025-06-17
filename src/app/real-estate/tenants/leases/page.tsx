"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  FileText, 
  Calendar, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Download,
  RefreshCw,
  MapPin,
  Building,
  CreditCard,
  Receipt,
  FileBarChart,
  UserPlus,
  Home,
  X,
  Menu,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/contexts/sidebar-context";
import PDFGeneratorService, { InvoicePDFData } from "@/lib/pdf/pdfGenerator";

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

// Interfaces
interface Property {
  id: string;
  name: string;
  address: string;
  rentalUnits: RentalUnit[];
}

interface RentalUnit {
  id: string;
  unitNumber: string;
  unitType: {
    name: string;
  };
  rentAmount: number;
  status: string;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
}

interface TenantAgreement {
  id: string;
  agreementNumber: string;
  tenant: Tenant;
  property: Property;
  rentalUnit: RentalUnit;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number;
  status: string;
  totalPaid: number;
  pendingInvoices: number;
  overdueInvoices: number;
  daysUntilExpiry: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  issueDate: string;
  status: string;
  description?: string;
  notes?: string;
}

export default function LeaseAgreements() {
  const { toggle: toggleSidebar } = useSidebar();
  const [agreements, setAgreements] = useState<TenantAgreement[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // URL parameter handling
  const [urlParams, setUrlParams] = useState<{
    tenant?: string;
    createFor?: string;
    property?: string;
    agreement?: string;
  }>({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  
  // Modal states
  const [isNewAgreementOpen, setIsNewAgreementOpen] = useState(false);
  const [isEditAgreementOpen, setIsEditAgreementOpen] = useState(false);
  const [isDeleteAgreementOpen, setIsDeleteAgreementOpen] = useState(false);
  const [isNewTenantOpen, setIsNewTenantOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<TenantAgreement | null>(null);
  const [isViewAgreementOpen, setIsViewAgreementOpen] = useState(false);
  
  // Form states
  const [agreementForm, setAgreementForm] = useState({
    tenantId: '',
    propertyId: '',
    rentalUnitId: '',
    startDate: '',
    endDate: '',
    rentAmount: 0,
    securityDeposit: 0,
    commissionAmount: 0,
    paymentDueDate: 1,
    paymentFrequency: 'MONTHLY',
    utilities: '',
    terms: '',
    notes: '',
    status: 'PENDING'
  });
  
  const [tenantForm, setTenantForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    nationality: '',
    passportNumber: '',
    emiratesId: '',
    occupation: '',
    company: '',
    monthlyIncome: 0,
    notes: '',
    status: 'ACTIVE'
  });
  
  const [paymentForm, setPaymentForm] = useState({
    agreementId: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethodId: '',
    referenceNumber: '',
    notes: '',
    status: 'COMPLETED'
  });
  
  const [invoiceForm, setInvoiceForm] = useState({
    agreementId: '',
    amount: 0,
    dueDate: '',
    description: '',
    taxAmount: 0,
    notes: '',
    status: 'PENDING'
  });

  // Statistics
  const [stats, setStats] = useState({
    totalAgreements: 0,
    activeAgreements: 0,
    monthlyRevenue: 0,
    pendingRenewals: 0
  });

  useEffect(() => {
    // Check URL parameters on mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
             const newUrlParams = {
         tenant: params.get('tenant') || undefined,
         createFor: params.get('createFor') || undefined,
         property: params.get('property') || undefined,
         agreement: params.get('agreement') || undefined,
       };
      setUrlParams(newUrlParams);
      
      // Auto-open create agreement modal if createFor parameter exists
      if (newUrlParams.createFor) {
        setIsNewAgreementOpen(true);
        setAgreementForm(prev => ({
          ...prev,
          tenantId: newUrlParams.createFor!
        }));
        setSuccess(`Creating new agreement for selected tenant`);
      }
      
             // Auto-filter by tenant if tenant parameter exists
       if (newUrlParams.tenant) {
         setSearchTerm(''); // Clear search to show tenant filter
         setSuccess(`Showing agreements for selected tenant`);
       }
       
       // Auto-filter by property if property parameter exists
       if (newUrlParams.property) {
         setPropertyFilter(newUrlParams.property);
         setSuccess(`Showing agreements for selected property`);
       }
       
       // Auto-highlight agreement if agreement parameter exists
       if (newUrlParams.agreement) {
         setSuccess(`Highlighting selected agreement`);
         // Clear filters to ensure highlighted agreement is visible
         setSearchTerm('');
         setStatusFilter('all');
         setPropertyFilter('all');
       }
    }
    
    fetchData();
  }, []);

  // Auto-dismiss success notifications after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAgreements(),
        fetchProperties(),
        fetchTenants(),
        fetchPaymentMethods()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgreements = async () => {
    try {
      const response = await fetch('/api/real-estate/agreements');
      if (response.ok) {
        const data = await response.json();
        setAgreements(data.agreements || []);
        
        // Calculate stats with proper decimal handling
        const totalAgreements = data.agreements?.length || 0;
        const activeAgreements = data.agreements?.filter((a: TenantAgreement) => a.status === 'ACTIVE').length || 0;
        
        // Properly convert rentAmount to number (handle both Decimal objects and regular numbers)
        const monthlyRevenue = data.agreements
          ?.filter((a: TenantAgreement) => a.status === 'ACTIVE')
          ?.reduce((sum: number, a: TenantAgreement) => {
            let rentAmount = a.rentAmount;
            // Handle Prisma Decimal objects
            if (typeof rentAmount === 'object' && rentAmount !== null && 'toNumber' in rentAmount) {
              rentAmount = (rentAmount as any).toNumber();
            } else if (typeof rentAmount === 'string') {
              rentAmount = parseFloat(rentAmount) || 0;
            } else if (typeof rentAmount !== 'number') {
              rentAmount = 0;
            }
            return sum + rentAmount;
          }, 0) || 0;
          
        const pendingRenewals = data.agreements
          ?.filter((a: TenantAgreement) => a.daysUntilExpiry <= 90 && a.daysUntilExpiry > 0).length || 0;
        
        setStats({
          totalAgreements,
          activeAgreements,
          monthlyRevenue,
          pendingRenewals
        });
      }
    } catch (error) {
      console.error('Error fetching agreements:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/real-estate/properties?limit=100');
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/real-estate/tenants?limit=100');
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/real-estate/payment-methods');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      } else {
        // Fallback to default payment methods if API doesn't exist yet
        setPaymentMethods([
          { id: 'cash', name: 'Cash', isActive: true },
          { id: 'bank_transfer', name: 'Bank Transfer', isActive: true },
          { id: 'credit_card', name: 'Credit Card', isActive: true },
          { id: 'cheque', name: 'Cheque', isActive: true }
        ]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback to default payment methods
      setPaymentMethods([
        { id: 'cash', name: 'Cash', isActive: true },
        { id: 'bank_transfer', name: 'Bank Transfer', isActive: true },
        { id: 'credit_card', name: 'Credit Card', isActive: true },
        { id: 'cheque', name: 'Cheque', isActive: true }
      ]);
    }
  };

  const fetchInvoicesForAgreement = async (agreementId: string) => {
    try {
      const response = await fetch(`/api/real-estate/invoices?agreementId=${agreementId}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  // Filtered agreements
  const filteredAgreements = agreements.filter(agreement => {
    const matchesSearch = !searchTerm || 
      agreement.agreementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${agreement.tenant.firstName} ${agreement.tenant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.property.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || agreement.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesProperty = propertyFilter === 'all' || agreement.property.id === propertyFilter;
    
    // Filter by URL parameters
    const matchesTenant = !urlParams.tenant || agreement.tenant.id === urlParams.tenant;
    const matchesAgreement = !urlParams.agreement || agreement.id === urlParams.agreement;
    
    return matchesSearch && matchesStatus && matchesProperty && matchesTenant && matchesAgreement;
  });

  // Available units for selected property (for both create and edit forms)
  const availableUnits = agreementForm.propertyId 
    ? properties.find(p => p.id === agreementForm.propertyId)?.rentalUnits.filter(unit => 
        unit.status === 'VACANT' || 
        (selectedAgreement && unit.id === selectedAgreement.rentalUnit.id) // Include current unit when editing
      ) || []
    : [];

  // Create new tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure numeric fields are numbers
      const tenantData = {
        ...tenantForm,
        monthlyIncome: Number(tenantForm.monthlyIncome)
      };
      
      const response = await fetch('/api/real-estate/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData)
      });
      
      if (response.ok) {
        await fetchTenants();
        setIsNewTenantOpen(false);
        setSuccess('Tenant created successfully');
        setTenantForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          alternatePhone: '',
          nationality: '',
          passportNumber: '',
          emiratesId: '',
          occupation: '',
          company: '',
          monthlyIncome: 0,
          notes: '',
          status: 'ACTIVE'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create tenant');
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      setError('Failed to create tenant');
    }
  };

  // Create new agreement
  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure all numeric fields are numbers
      const agreementData = {
        ...agreementForm,
        rentAmount: Number(agreementForm.rentAmount),
        securityDeposit: Number(agreementForm.securityDeposit),
        commissionAmount: Number(agreementForm.commissionAmount),
        paymentDueDate: Number(agreementForm.paymentDueDate)
      };
      
      const response = await fetch('/api/real-estate/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agreementData)
      });
      
      if (response.ok) {
        await fetchAgreements();
        setIsNewAgreementOpen(false);
        setSuccess('Agreement created successfully');
        setAgreementForm({
          tenantId: '',
          propertyId: '',
          rentalUnitId: '',
          startDate: '',
          endDate: '',
          rentAmount: 0,
          securityDeposit: 0,
          commissionAmount: 0,
          paymentDueDate: 1,
          paymentFrequency: 'MONTHLY',
          utilities: '',
          terms: '',
          notes: '',
          status: 'PENDING'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create agreement');
      }
    } catch (error) {
      console.error('Error creating agreement:', error);
      setError('Failed to create agreement');
    }
  };

  // Edit existing agreement
  const handleEditAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgreement) return;
    
    try {
      // Ensure all numeric fields are numbers
      const agreementData = {
        ...agreementForm,
        rentAmount: Number(agreementForm.rentAmount),
        securityDeposit: Number(agreementForm.securityDeposit),
        commissionAmount: Number(agreementForm.commissionAmount),
        paymentDueDate: Number(agreementForm.paymentDueDate)
      };
      
      const response = await fetch(`/api/real-estate/agreements/${selectedAgreement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agreementData)
      });
      
      if (response.ok) {
        await fetchAgreements();
        setIsEditAgreementOpen(false);
        setSuccess('Agreement updated successfully');
        setSelectedAgreement(null);
        setAgreementForm({
          tenantId: '',
          propertyId: '',
          rentalUnitId: '',
          startDate: '',
          endDate: '',
          rentAmount: 0,
          securityDeposit: 0,
          commissionAmount: 0,
          paymentDueDate: 1,
          paymentFrequency: 'MONTHLY',
          utilities: '',
          terms: '',
          notes: '',
          status: 'PENDING'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update agreement');
      }
    } catch (error) {
      console.error('Error updating agreement:', error);
      setError('Failed to update agreement');
    }
  };

  // Delete agreement
  const handleDeleteAgreement = async () => {
    if (!selectedAgreement) return;
    
    try {
      const response = await fetch(`/api/real-estate/agreements/${selectedAgreement.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchAgreements();
        setIsDeleteAgreementOpen(false);
        setSuccess('Agreement deleted successfully');
        setSelectedAgreement(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete agreement');
      }
    } catch (error) {
      console.error('Error deleting agreement:', error);
      setError('Failed to delete agreement');
    }
  };

  // Open edit modal with selected agreement data
  const handleOpenEditAgreement = (agreement: TenantAgreement) => {
    setSelectedAgreement(agreement);
    setAgreementForm({
      tenantId: agreement.tenant.id,
      propertyId: agreement.property.id,
      rentalUnitId: agreement.rentalUnit.id,
      startDate: agreement.startDate.split('T')[0], // Convert to YYYY-MM-DD format
      endDate: agreement.endDate.split('T')[0],
      rentAmount: agreement.rentAmount,
      securityDeposit: agreement.securityDeposit,
      commissionAmount: 0, // This might not be in the interface, set default
      paymentDueDate: 1, // Default value
      paymentFrequency: 'MONTHLY',
      utilities: '',
      terms: '',
      notes: '',
      status: agreement.status
    });
    setIsEditAgreementOpen(true);
  };

  // Create payment
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure amount is a number
      const paymentData = {
        ...paymentForm,
        amount: Number(paymentForm.amount)
      };
      
      const response = await fetch('/api/real-estate/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      
      if (response.ok) {
        await fetchAgreements();
        setIsPaymentModalOpen(false);
        setSuccess('Payment recorded successfully');
        setPaymentForm({
          agreementId: '',
          amount: 0,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethodId: '',
          referenceNumber: '',
          notes: '',
          status: 'COMPLETED'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setError('Failed to create payment');
    }
  };

  // Create invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure amounts are numbers
      const invoiceData = {
        ...invoiceForm,
        amount: Number(invoiceForm.amount),
        taxAmount: Number(invoiceForm.taxAmount)
      };
      
      const response = await fetch('/api/real-estate/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      
      if (response.ok) {
        await fetchAgreements();
        setIsInvoiceModalOpen(false);
        setSuccess('Invoice generated successfully');
        setInvoiceForm({
          agreementId: '',
          amount: 0,
          dueDate: '',
          description: '',
          taxAmount: 0,
          notes: '',
          status: 'PENDING'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Failed to create invoice');
    }
  };

  // Update rent amount when rental unit changes
  const handleRentalUnitChange = (unitId: string) => {
    const selectedUnit = availableUnits.find(unit => unit.id === unitId);
    if (selectedUnit) {
      setAgreementForm({
        ...agreementForm,
        rentalUnitId: unitId,
        rentAmount: selectedUnit.rentAmount
      });
    }
  };

  // Handle agreement renewal
  const handleRenewAgreement = async (agreement: TenantAgreement) => {
    try {
      // Create a new agreement based on the existing one
      const renewalData = {
        tenantId: agreement.tenant.id,
        propertyId: agreement.property.id,
        rentalUnitId: agreement.rentalUnit.id,
        rentAmount: Number(agreement.rentAmount),
        securityDeposit: Number(agreement.securityDeposit),
        commissionAmount: 0,
        paymentDueDate: 1,
        paymentFrequency: 'MONTHLY',
        utilities: '',
        terms: '',
        notes: `Renewal of agreement ${agreement.agreementNumber}`,
        status: 'PENDING',
        startDate: new Date(agreement.endDate).toISOString().split('T')[0], // Start from old end date
        endDate: new Date(new Date(agreement.endDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Add 1 year
      };

      const response = await fetch('/api/real-estate/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(renewalData)
      });

      if (response.ok) {
        await fetchAgreements();
        setSuccess('Agreement renewal created successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create renewal agreement');
      }
    } catch (error) {
      console.error('Error renewing agreement:', error);
      setError('Failed to create renewal agreement');
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "text-green-600";
      case "expired": return "text-red-600";
      case "terminated": return "text-gray-600";
      case "pending": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "expired": return "bg-red-100 text-red-800";
      case "terminated": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getExpiryUrgency = (days: number) => {
    if (days < 0) return "text-red-600";
    if (days <= 30) return "text-orange-600";
    if (days <= 90) return "text-yellow-600";
    return "text-green-600";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  // PDF Generation Functions
  const handleDownloadInvoicePDF = async (invoiceId: string) => {
    try {
      setLoading(true);
      
      // Download PDF directly from API endpoint
      window.open(`/api/real-estate/invoices/${invoiceId}/pdf`, '_blank');
      
      setSuccess('PDF download started successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewInvoicePDF = async (invoiceId: string) => {
    try {
      setLoading(true);
      
      // Preview PDF in new tab
      const response = await fetch(`/api/real-estate/invoices/${invoiceId}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preview: true })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Cleanup URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        setSuccess('PDF preview opened successfully');
      } else {
        throw new Error('Failed to preview PDF');
      }
    } catch (error) {
      console.error('Error previewing PDF:', error);
      setError('Failed to preview PDF. Please try again.');
    } finally {
      setLoading(false);    
    }
  };

  const handleGenerateInvoicePDFClient = async (agreement: TenantAgreement, invoiceData?: any) => {
    try {
      setLoading(true);
      
      // Create invoice data structure for PDF generation
      const pdfData: InvoicePDFData = {
        id: invoiceData?.id || 'temp-id',
        invoiceNumber: invoiceData?.invoiceNumber || `INV-${Date.now()}`,
        issueDate: invoiceData?.issueDate || new Date().toISOString(),
        dueDate: invoiceData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: invoiceData?.status || 'PENDING',
        amount: invoiceData?.amount || agreement.rentAmount,
        taxAmount: invoiceData?.taxAmount || 0,
        totalAmount: invoiceData?.totalAmount || (invoiceData?.amount || agreement.rentAmount) + (invoiceData?.taxAmount || 0),
        description: invoiceData?.description || 'Monthly Rent',
        notes: invoiceData?.notes,
        agreement: {
          id: agreement.id,
          agreementNumber: agreement.agreementNumber,
          rentAmount: agreement.rentAmount,
          tenant: {
            id: agreement.tenant.id,
            firstName: agreement.tenant.firstName,
            lastName: agreement.tenant.lastName,
            email: agreement.tenant.email,
            phone: agreement.tenant.phone,
          },
          property: {
            id: agreement.property.id,
            name: agreement.property.name,
            address: agreement.property.address,
          },
          rentalUnit: {
            id: agreement.rentalUnit.id,
            unitNumber: agreement.rentalUnit.unitNumber,
            unitType: {
              name: agreement.rentalUnit.unitType.name,
            },
          },
        },
      };

      // Validate data before generating PDF
      const validation = PDFGeneratorService.validateInvoiceData(pdfData);
      if (!validation.isValid) {
        setError(`PDF generation failed: ${validation.errors.join(', ')}`);
        return;
      }

      // Generate PDF
      await PDFGeneratorService.generateInvoicePDF(pdfData);
      
      setSuccess('PDF generated and downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDownloadPDFs = async (agreements: TenantAgreement[]) => {
    try {
      setLoading(true);
      
      const pdfDataArray: InvoicePDFData[] = agreements.map(agreement => ({
        id: `temp-${agreement.id}`,
        invoiceNumber: `INV-${agreement.agreementNumber}-${Date.now()}`,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
        amount: agreement.rentAmount,
        taxAmount: 0,
        totalAmount: agreement.rentAmount,
        description: 'Monthly Rent',
        agreement: {
          id: agreement.id,
          agreementNumber: agreement.agreementNumber,
          rentAmount: agreement.rentAmount,
          tenant: {
            id: agreement.tenant.id,
            firstName: agreement.tenant.firstName,
            lastName: agreement.tenant.lastName,
            email: agreement.tenant.email,
            phone: agreement.tenant.phone,
          },
          property: {
            id: agreement.property.id,
            name: agreement.property.name,
            address: agreement.property.address,
          },
          rentalUnit: {
            id: agreement.rentalUnit.id,
            unitNumber: agreement.rentalUnit.unitNumber,
            unitType: {
              name: agreement.rentalUnit.unitType.name,
            },
          },
        },
      }));

      // Generate batch PDFs
      await PDFGeneratorService.generateBatchInvoicePDFs(pdfDataArray);
      
      setSuccess(`Successfully generated ${pdfDataArray.length} PDF invoices`);
    } catch (error) {
      console.error('Error generating batch PDFs:', error);
      setError('Failed to generate batch PDFs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cross-module navigation handlers
  const handleViewTenant = (agreement: TenantAgreement) => {
    window.location.href = `/real-estate/tenants/management?highlight=${agreement.tenant.id}&agreement=${agreement.id}`;
  };

  const handleViewProperty = (agreement: TenantAgreement) => {
    window.location.href = `/real-estate/properties/management?highlight=${agreement.property.id}&tenant=${agreement.tenant.id}`;
  };

  const handleViewRentPayments = (agreement: TenantAgreement) => {
    window.location.href = `/real-estate/tenants/rent?agreement=${agreement.id}&tenant=${agreement.tenant.id}`;
  };

  const handleViewPropertyAppliances = (agreement: TenantAgreement) => {
    window.location.href = `/real-estate/appliances/inventory?property=${encodeURIComponent(agreement.property.name)}&unit=${agreement.rentalUnit.unitNumber}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading tenant agreements...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate renewal pipeline from real data
  const renewalPipeline = [
    { 
      period: "Next 30 Days", 
      count: agreements.filter(a => a.daysUntilExpiry <= 30 && a.daysUntilExpiry > 0).length,
      value: formatCurrency(agreements.filter(a => a.daysUntilExpiry <= 30 && a.daysUntilExpiry > 0).reduce((sum, a) => {
        let rentAmount = a.rentAmount;
        if (typeof rentAmount === 'object' && rentAmount !== null && 'toNumber' in rentAmount) {
          rentAmount = (rentAmount as any).toNumber();
        } else if (typeof rentAmount === 'string') {
          rentAmount = parseFloat(rentAmount) || 0;
        } else if (typeof rentAmount !== 'number') {
          rentAmount = 0;
        }
        return sum + rentAmount;
      }, 0))
    },
    { 
      period: "Next 60 Days", 
      count: agreements.filter(a => a.daysUntilExpiry <= 60 && a.daysUntilExpiry > 0).length,
      value: formatCurrency(agreements.filter(a => a.daysUntilExpiry <= 60 && a.daysUntilExpiry > 0).reduce((sum, a) => {
        let rentAmount = a.rentAmount;
        if (typeof rentAmount === 'object' && rentAmount !== null && 'toNumber' in rentAmount) {
          rentAmount = (rentAmount as any).toNumber();
        } else if (typeof rentAmount === 'string') {
          rentAmount = parseFloat(rentAmount) || 0;
        } else if (typeof rentAmount !== 'number') {
          rentAmount = 0;
        }
        return sum + rentAmount;
      }, 0))
    },
    { 
      period: "Next 90 Days", 
      count: agreements.filter(a => a.daysUntilExpiry <= 90 && a.daysUntilExpiry > 0).length,
      value: formatCurrency(agreements.filter(a => a.daysUntilExpiry <= 90 && a.daysUntilExpiry > 0).reduce((sum, a) => {
        let rentAmount = a.rentAmount;
        if (typeof rentAmount === 'object' && rentAmount !== null && 'toNumber' in rentAmount) {
          rentAmount = (rentAmount as any).toNumber();
        } else if (typeof rentAmount === 'string') {
          rentAmount = parseFloat(rentAmount) || 0;
        } else if (typeof rentAmount !== 'number') {
          rentAmount = 0;
        }
        return sum + rentAmount;
      }, 0))
    },
    { 
      period: "Next 6 Months", 
      count: agreements.filter(a => a.daysUntilExpiry <= 180 && a.daysUntilExpiry > 0).length,
      value: formatCurrency(agreements.filter(a => a.daysUntilExpiry <= 180 && a.daysUntilExpiry > 0).reduce((sum, a) => {
        let rentAmount = a.rentAmount;
        if (typeof rentAmount === 'object' && rentAmount !== null && 'toNumber' in rentAmount) {
          rentAmount = (rentAmount as any).toNumber();
        } else if (typeof rentAmount === 'string') {
          rentAmount = parseFloat(rentAmount) || 0;
        } else if (typeof rentAmount !== 'number') {
          rentAmount = 0;
        }
        return sum + rentAmount;
      }, 0))
    }
  ];



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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="hover:bg-white/10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <motion.div
                  className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FileText className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">Lease Agreements</h1>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Dialog open={isNewAgreementOpen} onOpenChange={(open) => {
                  setIsNewAgreementOpen(open);
                  if (open) {
                    setError(null);
                    setSuccess(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="btn-premium">
                      <Plus className="w-4 h-4 mr-2" />
                      New Lease
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="glass-card border-0 hover-glow">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Search Agreements</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input 
                            placeholder="Search leases..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Status</label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="terminated">Terminated</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Property</label>
                          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                            <SelectTrigger>
                              <Building className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Property" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Properties</SelectItem>
                              {properties.map(property => (
                                <SelectItem key={property.id} value={property.id}>
                                  {property.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <DropdownMenuSeparator />
                      
                      <div className="flex space-x-2">
                        <Dialog open={isNewTenantOpen} onOpenChange={(open) => {
                          setIsNewTenantOpen(open);
                          if (open) {
                            setError(null);
                            setSuccess(null);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
                              <UserPlus className="w-4 h-4 mr-2" />
                              New Tenant
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/real-estate/tenants/management'}
                          className="flex-1"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Tenants
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/real-estate/tenants/rent'}
                          className="flex-1"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Payments
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleBatchDownloadPDFs(filteredAgreements)}
                          disabled={filteredAgreements.length === 0}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Batch PDF
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                    Active Leases
                  </CardTitle>
                  <FileText className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.activeAgreements}</div>
                  <p className="text-sm text-green-600 font-medium">Currently active</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-yellow-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expiring Soon
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{stats.pendingRenewals}</div>
                  <p className="text-sm text-yellow-600 font-medium">Next 90 days</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-green-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Occupancy Rate
                  </CardTitle>
                  <RefreshCw className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">
                    {stats.totalAgreements > 0 ? ((stats.activeAgreements / stats.totalAgreements) * 100).toFixed(1) : '0'}%
                  </div>
                  <p className="text-sm text-green-600 font-medium">Active agreements</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="hover-lift">
              <Card className="card-premium border-0 bg-gradient-to-br from-purple-50/80 to-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gradient mb-2">{formatCurrency(stats.monthlyRevenue)}</div>
                  <p className="text-sm text-green-600 font-medium">Active agreements</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Renewal Pipeline */}
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
                      <Calendar className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Renewal Pipeline</CardTitle>
                      <CardDescription>
                        Upcoming lease renewals
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {renewalPipeline.map((item, index) => (
                      <motion.div 
                        key={index}
                        className="glass-card p-4 rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{item.period}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.count} leases
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-gradient">{item.value}</p>
                        <p className="text-sm text-muted-foreground">Total monthly value</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Lease Types Distribution */}
            <motion.div 
              className="lg:col-span-2"
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
                      <Users className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle>Lease Portfolio Overview</CardTitle>
                      <CardDescription>
                        Distribution by property type and status
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">By Agreement Status</h4>
                      {(() => {
                        const statusCounts = {
                          ACTIVE: agreements.filter(a => a.status === 'ACTIVE').length,
                          PENDING: agreements.filter(a => a.status === 'PENDING').length,
                          EXPIRED: agreements.filter(a => a.status === 'EXPIRED').length,
                          TERMINATED: agreements.filter(a => a.status === 'TERMINATED').length
                        };
                        const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
                        const statusData = [
                          { type: "Active", count: statusCounts.ACTIVE, percentage: total ? Math.round((statusCounts.ACTIVE / total) * 100) : 0, color: "bg-green-500" },
                          { type: "Pending", count: statusCounts.PENDING, percentage: total ? Math.round((statusCounts.PENDING / total) * 100) : 0, color: "bg-yellow-500" },
                          { type: "Expired", count: statusCounts.EXPIRED, percentage: total ? Math.round((statusCounts.EXPIRED / total) * 100) : 0, color: "bg-red-500" },
                          { type: "Terminated", count: statusCounts.TERMINATED, percentage: total ? Math.round((statusCounts.TERMINATED / total) * 100) : 0, color: "bg-gray-500" }
                        ].filter(item => item.count > 0);
                        
                        return statusData.map((item, index) => (
                          <motion.div 
                            key={index}
                            className="flex items-center justify-between"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${item.color}`} />
                              <span className="font-medium text-foreground">{item.type}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">{item.count}</p>
                              <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                            </div>
                          </motion.div>
                        ));
                      })()}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Agreement Performance</h4>
                      <div className="space-y-3">
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Agreements</p>
                          <p className="text-lg font-bold text-gradient">{stats.totalAgreements}</p>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Avg Monthly Rent</p>
                          <p className="text-lg font-bold text-gradient">
                            {stats.activeAgreements > 0 ? formatCurrency(stats.monthlyRevenue / stats.activeAgreements) : formatCurrency(0)}
                          </p>
                        </div>
                        <div className="glass-card p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Active Rate</p>
                          <p className="text-lg font-bold text-gradient">
                            {stats.totalAgreements > 0 ? ((stats.activeAgreements / stats.totalAgreements) * 100).toFixed(1) : '0'}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Lease Agreements List */}
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
                      <CardTitle className="text-xl">Lease Agreements</CardTitle>
                      <CardDescription>
                        Manage lease contracts and renewals
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="glass-card border-0 hover-glow"
                      onClick={fetchData}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button 
                      variant="outline" 
                      className="glass-card border-0 hover-glow"
                      onClick={() => handleBatchDownloadPDFs(filteredAgreements)}
                      disabled={loading || filteredAgreements.length === 0}
                    >
                      <FileBarChart className="w-4 h-4 mr-2" />
                      Batch PDF
                    </Button>
                    <Button variant="outline" className="glass-card border-0 hover-glow">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAgreements.length === 0 ? (
                    <div className="text-center py-12">
                      <motion.div
                        className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <FileText className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Lease Agreements Found</h3>
                      <p className="text-muted-foreground mb-6">
                        {agreements.length === 0 
                          ? "Start by creating your first lease agreement" 
                          : "No agreements match your current filters"
                        }
                      </p>
                      {agreements.length === 0 && (
                        <Button 
                          className="btn-premium"
                          onClick={() => setIsNewAgreementOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Agreement
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredAgreements.map((agreement, index) => (
                    <motion.div 
                      key={agreement.id}
                      className={`glass-card p-6 rounded-2xl hover-lift group ${
                        urlParams.agreement === agreement.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50/50 border-blue-200' 
                          : ''
                      }`}
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
                            <FileText className="w-6 h-6 text-white" />
                          </motion.div>
                          
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-semibold text-lg text-foreground">{agreement.agreementNumber}</h3>
                              <Badge 
                                className={`text-xs ${getStatusBg(agreement.status.toLowerCase())}`}
                                variant="outline"
                              >
                                {agreement.status}
                              </Badge>
                              {agreement.daysUntilExpiry <= 90 && agreement.daysUntilExpiry > 0 && (
                                <Badge 
                                  className="text-xs bg-yellow-100 text-yellow-800"
                                  variant="outline"
                                >
                                  Renewal Due
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium text-foreground mb-1">
                              {agreement.tenant.firstName} {agreement.tenant.lastName} • {agreement.rentalUnit.unitType.name}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                              <span>{agreement.property.name} - {agreement.rentalUnit.unitNumber}</span>
                              <span>•</span>
                              <span>{new Date(agreement.startDate).toLocaleDateString()} to {new Date(agreement.endDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-muted-foreground">
                                Expires in: 
                                <span className={`ml-1 font-medium ${getExpiryUrgency(agreement.daysUntilExpiry)}`}>
                                  {agreement.daysUntilExpiry > 0 ? `${agreement.daysUntilExpiry} days` : 'Expired'}
                                </span>
                              </span>
                              {agreement.pendingInvoices > 0 && (
                                <span className="text-red-600 font-medium">
                                  {agreement.pendingInvoices} pending invoices
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="grid grid-cols-2 gap-4 text-center mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Monthly Rent</p>
                              <p className="text-lg font-bold text-gradient">{formatCurrency(agreement.rentAmount)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Security Deposit</p>
                              <p className="font-bold text-foreground">{formatCurrency(agreement.securityDeposit)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-wrap">
                            <Button 
                              size="sm" 
                              className="btn-premium"
                              onClick={() => {
                                setSelectedAgreement(agreement);
                                setIsViewAgreementOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="glass-card border-0 hover-glow"
                              onClick={() => handleOpenEditAgreement(agreement)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="glass-card border-0 hover-glow"
                              onClick={() => {
                                setSelectedAgreement(agreement);
                                setPaymentForm({
                                  ...paymentForm,
                                  agreementId: agreement.id,
                                  amount: agreement.rentAmount
                                });
                                setIsPaymentModalOpen(true);
                              }}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Payment
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="glass-card border-0 hover-glow"
                              onClick={() => {
                                setSelectedAgreement(agreement);
                                setInvoiceForm({
                                  ...invoiceForm,
                                  agreementId: agreement.id,
                                  amount: agreement.rentAmount
                                });
                                setIsInvoiceModalOpen(true);
                              }}
                            >
                              <Receipt className="w-4 h-4 mr-2" />
                              Invoice
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="glass-card border-0 hover-glow"
                              onClick={() => handleGenerateInvoicePDFClient(agreement)}
                              disabled={loading}
                            >
                              <FileBarChart className="w-4 h-4 mr-2" />
                              PDF
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="glass-card border-0 hover-glow text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedAgreement(agreement);
                                setIsDeleteAgreementOpen(true);
                              }}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                            {agreement.daysUntilExpiry <= 90 && agreement.daysUntilExpiry > 0 && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="glass-card border-0 hover-glow"
                                onClick={() => handleRenewAgreement(agreement)}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Renew
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      {/* Modals */}
      
      {/* New Tenant Modal */}
      <Dialog open={isNewTenantOpen} onOpenChange={(open) => {
        setIsNewTenantOpen(open);
        if (open) {
          setError(null);
          setSuccess(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Register New Tenant</span>
          </DialogTitle>
          <DialogDescription>
            Add a new tenant to the system with their basic information and contact details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateTenant} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={tenantForm.firstName}
                onChange={(e) => setTenantForm({...tenantForm, firstName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={tenantForm.lastName}
                onChange={(e) => setTenantForm({...tenantForm, lastName: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={tenantForm.email}
                onChange={(e) => setTenantForm({...tenantForm, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={tenantForm.phone}
                onChange={(e) => setTenantForm({...tenantForm, phone: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={tenantForm.nationality}
                onChange={(e) => setTenantForm({...tenantForm, nationality: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={tenantForm.occupation}
                onChange={(e) => setTenantForm({...tenantForm, occupation: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={tenantForm.company}
              onChange={(e) => setTenantForm({...tenantForm, company: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={tenantForm.notes}
              onChange={(e) => setTenantForm({...tenantForm, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsNewTenantOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-premium">
              Register Tenant
            </Button>
          </div>
        </form>
      </DialogContent>
      </Dialog>

      {/* New Agreement Modal */}
      <Dialog open={isNewAgreementOpen} onOpenChange={(open) => {
        setIsNewAgreementOpen(open);
        if (open) {
          setError(null);
          setSuccess(null);
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Create Lease Agreement</span>
            </DialogTitle>
            <DialogDescription>
              Create a new lease agreement between tenant and property unit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAgreement} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="terms">Terms</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tenantSelect">Tenant *</Label>
                    <Select value={agreementForm.tenantId} onValueChange={(value) => setAgreementForm({...agreementForm, tenantId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map(tenant => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.firstName} {tenant.lastName} ({tenant.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="propertySelect">Property *</Label>
                    <Select value={agreementForm.propertyId} onValueChange={(value) => setAgreementForm({...agreementForm, propertyId: value, rentalUnitId: ''})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map(property => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="unitSelect">Rental Unit *</Label>
                  <Select value={agreementForm.rentalUnitId} onValueChange={handleRentalUnitChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unitNumber} - {unit.unitType.name} ({formatCurrency(unit.rentAmount)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={agreementForm.startDate}
                      onChange={(e) => setAgreementForm({...agreementForm, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={agreementForm.endDate}
                      onChange={(e) => setAgreementForm({...agreementForm, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rentAmount">Monthly Rent (AED) *</Label>
                    <Input
                      id="rentAmount"
                      type="number"
                      value={agreementForm.rentAmount}
                      onChange={(e) => setAgreementForm({...agreementForm, rentAmount: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="securityDeposit">Security Deposit (AED)</Label>
                    <Input
                      id="securityDeposit"
                      type="number"
                      value={agreementForm.securityDeposit}
                      onChange={(e) => setAgreementForm({...agreementForm, securityDeposit: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commissionAmount">Commission (AED)</Label>
                    <Input
                      id="commissionAmount"
                      type="number"
                      value={agreementForm.commissionAmount}
                      onChange={(e) => setAgreementForm({...agreementForm, commissionAmount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentDueDate">Payment Due Day</Label>
                    <Input
                      id="paymentDueDate"
                      type="number"
                      min="1"
                      max="31"
                      value={agreementForm.paymentDueDate}
                      onChange={(e) => setAgreementForm({...agreementForm, paymentDueDate: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="terms" className="space-y-4">
                <div>
                  <Label htmlFor="utilities">Utilities Included</Label>
                  <Input
                    id="utilities"
                    placeholder="e.g., Water, Electricity, Internet"
                    value={agreementForm.utilities}
                    onChange={(e) => setAgreementForm({...agreementForm, utilities: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    value={agreementForm.terms}
                    onChange={(e) => setAgreementForm({...agreementForm, terms: e.target.value})}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="agreementNotes">Notes</Label>
                  <Textarea
                    id="agreementNotes"
                    value={agreementForm.notes}
                    onChange={(e) => setAgreementForm({...agreementForm, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewAgreementOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-premium">
                Create Agreement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Agreement Modal */}
      <Dialog open={isEditAgreementOpen} onOpenChange={(open) => {
        setIsEditAgreementOpen(open);
        if (!open) {
          setError(null);
          setSuccess(null);
          setSelectedAgreement(null);
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>Edit Lease Agreement</span>
            </DialogTitle>
            <DialogDescription>
              Modify the lease agreement details. Changes will take effect immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAgreement} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="terms">Terms</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editTenantSelect">Tenant *</Label>
                    <Select value={agreementForm.tenantId} onValueChange={(value) => setAgreementForm({...agreementForm, tenantId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map(tenant => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.firstName} {tenant.lastName} ({tenant.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="editPropertySelect">Property *</Label>
                    <Select value={agreementForm.propertyId} onValueChange={(value) => setAgreementForm({...agreementForm, propertyId: value, rentalUnitId: ''})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map(property => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="editUnitSelect">Rental Unit *</Label>
                  <Select value={agreementForm.rentalUnitId} onValueChange={handleRentalUnitChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unitNumber} - {unit.unitType.name} ({formatCurrency(unit.rentAmount)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editStartDate">Start Date *</Label>
                    <Input
                      id="editStartDate"
                      type="date"
                      value={agreementForm.startDate}
                      onChange={(e) => setAgreementForm({...agreementForm, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editEndDate">End Date *</Label>
                    <Input
                      id="editEndDate"
                      type="date"
                      value={agreementForm.endDate}
                      onChange={(e) => setAgreementForm({...agreementForm, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="editStatus">Agreement Status *</Label>
                  <Select value={agreementForm.status} onValueChange={(value) => setAgreementForm({...agreementForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="TERMINATED">Terminated</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editRentAmount">Monthly Rent (AED) *</Label>
                    <Input
                      id="editRentAmount"
                      type="number"
                      value={agreementForm.rentAmount}
                      onChange={(e) => setAgreementForm({...agreementForm, rentAmount: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editSecurityDeposit">Security Deposit (AED)</Label>
                    <Input
                      id="editSecurityDeposit"
                      type="number"
                      value={agreementForm.securityDeposit}
                      onChange={(e) => setAgreementForm({...agreementForm, securityDeposit: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editCommissionAmount">Commission (AED)</Label>
                    <Input
                      id="editCommissionAmount"
                      type="number"
                      value={agreementForm.commissionAmount}
                      onChange={(e) => setAgreementForm({...agreementForm, commissionAmount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPaymentDueDate">Payment Due Day</Label>
                    <Input
                      id="editPaymentDueDate"
                      type="number"
                      min="1"
                      max="31"
                      value={agreementForm.paymentDueDate}
                      onChange={(e) => setAgreementForm({...agreementForm, paymentDueDate: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="terms" className="space-y-4">
                <div>
                  <Label htmlFor="editUtilities">Utilities Included</Label>
                  <Input
                    id="editUtilities"
                    placeholder="e.g., Water, Electricity, Internet"
                    value={agreementForm.utilities}
                    onChange={(e) => setAgreementForm({...agreementForm, utilities: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="editTerms">Terms & Conditions</Label>
                  <Textarea
                    id="editTerms"
                    value={agreementForm.terms}
                    onChange={(e) => setAgreementForm({...agreementForm, terms: e.target.value})}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="editAgreementNotes">Notes</Label>
                  <Textarea
                    id="editAgreementNotes"
                    value={agreementForm.notes}
                    onChange={(e) => setAgreementForm({...agreementForm, notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditAgreementOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-premium">
                Update Agreement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Agreement Confirmation Modal */}
      <Dialog open={isDeleteAgreementOpen} onOpenChange={(open) => {
        setIsDeleteAgreementOpen(open);
        if (!open) {
          setSelectedAgreement(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete Agreement</span>
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the lease agreement and all associated data.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAgreement && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">Agreement to be deleted:</h4>
                <div className="text-sm text-red-700 space-y-1">
                  <p><strong>Agreement Number:</strong> {selectedAgreement.agreementNumber}</p>
                  <p><strong>Tenant:</strong> {selectedAgreement.tenant.firstName} {selectedAgreement.tenant.lastName}</p>
                  <p><strong>Property:</strong> {selectedAgreement.property.name} - Unit {selectedAgreement.rentalUnit.unitNumber}</p>
                  <p><strong>Rent Amount:</strong> {formatCurrency(selectedAgreement.rentAmount)}/month</p>
                  <p><strong>Status:</strong> {selectedAgreement.status}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• All related invoices will be deleted</li>
                  <li>• All payment records will be deleted</li>
                  <li>• The rental unit will become available</li>
                  <li>• This action is irreversible</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDeleteAgreementOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAgreement}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Delete Agreement
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
        setIsPaymentModalOpen(open);
        if (open) {
          setError(null);
          setSuccess(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Record Payment</span>
            </DialogTitle>
            <DialogDescription>
              Record a payment for the selected lease agreement.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePayment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentAmount">Amount (AED) *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={paymentForm.paymentMethodId} onValueChange={(value) => setPaymentForm({...paymentForm, paymentMethodId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, referenceNumber: e.target.value})}
                  placeholder="Bank ref, check number, etc."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paymentNotes">Notes</Label>
              <Textarea
                id="paymentNotes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-premium">
                Record Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={(open) => {
        setIsInvoiceModalOpen(open);
        if (open) {
          setError(null);
          setSuccess(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Receipt className="w-5 h-5" />
              <span>Generate Invoice</span>
            </DialogTitle>
            <DialogDescription>
              Create a new invoice for the selected lease agreement.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceAmount">Amount (AED) *</Label>
                <Input
                  id="invoiceAmount"
                  type="number"
                  step="0.01"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({...invoiceForm, amount: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                  placeholder="e.g., Monthly Rent"
                />
              </div>
              <div>
                <Label htmlFor="taxAmount">Tax Amount (AED)</Label>
                <Input
                  id="taxAmount"
                  type="number"
                  step="0.01"
                  value={invoiceForm.taxAmount}
                  onChange={(e) => setInvoiceForm({...invoiceForm, taxAmount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="invoiceNotes">Notes</Label>
              <Textarea
                id="invoiceNotes"
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-premium">
                Generate Invoice
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Agreement Modal */}
      <Dialog open={isViewAgreementOpen} onOpenChange={(open) => {
        setIsViewAgreementOpen(open);
        if (open) {
          setError(null);
          setSuccess(null);
          if (selectedAgreement) {
            fetchInvoicesForAgreement(selectedAgreement.id);
          }
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Agreement Details</span>
            </DialogTitle>
            <DialogDescription>
              View lease agreement information and history
            </DialogDescription>
          </DialogHeader>
          {selectedAgreement && (
            <div className="space-y-6">
              {/* Agreement Header */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Agreement Number</label>
                    <p className="text-lg font-semibold">{selectedAgreement.agreementNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tenant</label>
                    <p className="font-medium">{selectedAgreement.tenant.firstName} {selectedAgreement.tenant.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedAgreement.tenant.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property</label>
                    <p className="font-medium">{selectedAgreement.property.name}</p>
                    <p className="text-sm text-muted-foreground">Unit: {selectedAgreement.rentalUnit.unitNumber}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div>
                      <Badge className={`${getStatusBg(selectedAgreement.status.toLowerCase())}`}>
                        {selectedAgreement.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                    <p className="font-medium">
                      {new Date(selectedAgreement.startDate).toLocaleDateString()} - {new Date(selectedAgreement.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAgreement.daysUntilExpiry > 0 ? `${selectedAgreement.daysUntilExpiry} days until expiry` : 'Expired'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Financial</label>
                    <p className="font-medium">Monthly Rent: {formatCurrency(selectedAgreement.rentAmount)}</p>
                    <p className="text-sm text-muted-foreground">Security Deposit: {formatCurrency(selectedAgreement.securityDeposit)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Payment Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-card p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(selectedAgreement.totalPaid)}</p>
                  </div>
                  <div className="glass-card p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Pending Invoices</p>
                    <p className="text-lg font-bold text-yellow-600">{selectedAgreement.pendingInvoices}</p>
                  </div>
                  <div className="glass-card p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Overdue Invoices</p>
                    <p className="text-lg font-bold text-red-600">{selectedAgreement.overdueInvoices}</p>
                  </div>
                </div>
              </div>

              {/* Invoice History */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Invoice History</h4>
                  <Button 
                    size="sm"
                    className="btn-premium"
                    onClick={() => handleGenerateInvoicePDFClient(selectedAgreement)}
                    disabled={loading}
                  >
                    <FileBarChart className="w-4 h-4 mr-2" />
                    Generate PDF Invoice
                  </Button>
                </div>
                
                {invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No invoices found for this agreement</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setInvoiceForm({
                          ...invoiceForm,
                          agreementId: selectedAgreement.id,
                          amount: selectedAgreement.rentAmount
                        });
                        setIsInvoiceModalOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Invoice
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="glass-card p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                              <Receipt className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{invoice.invoiceNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {invoice.description || 'Monthly Rent'} • Due: {new Date(invoice.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="font-bold text-gradient">{formatCurrency(invoice.totalAmount)}</p>
                              <Badge 
                                className={`text-xs ${
                                  invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                  invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                                variant="outline"
                              >
                                {invoice.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="glass-card border-0 hover-glow p-2"
                                onClick={() => handlePreviewInvoicePDF(invoice.id)}
                                disabled={loading}
                                title="Preview PDF"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="glass-card border-0 hover-glow p-2"
                                onClick={() => handleDownloadInvoicePDF(invoice.id)}
                                disabled={loading}
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {invoice.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsViewAgreementOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {error && (
        <Dialog open={!!error} onOpenChange={() => setError(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span>Error</span>
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setError(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Success Display */}
      {success && (
        <Dialog open={!!success} onOpenChange={() => setSuccess(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Success</span>
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{success}</p>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setSuccess(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 