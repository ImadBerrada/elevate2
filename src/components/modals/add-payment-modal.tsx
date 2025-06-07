"use client";

import { useState, useEffect } from "react";
import { X, CreditCard, DollarSign, User, Receipt, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentCreated: () => void;
  companyId: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  totalAmount: number;
}

export function AddPaymentModal({ isOpen, onClose, onPaymentCreated, companyId }: AddPaymentModalProps) {
  const [creating, setCreating] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    amount: "",
    method: "CASH",
    status: "COMPLETED",
    transactionId: "",
    notes: "",
    paymentDate: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM format
    orderId: "",
    customerId: "",
    receiptUrl: "",
  });

  const paymentMethods = [
    { value: "CASH", label: "Cash" },
    { value: "CARD", label: "Credit/Debit Card" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "ONLINE", label: "Online Payment" },
  ];

  const paymentStatuses = [
    { value: "PENDING", label: "Pending" },
    { value: "PAID", label: "Paid" },
    { value: "PARTIAL", label: "Partial" },
    { value: "REFUNDED", label: "Refunded" },
  ];

  useEffect(() => {
    if (isOpen && companyId) {
      fetchCustomers();
      fetchOrders();
    }
  }, [isOpen, companyId]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`/api/marah/customers?companyId=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/marah/orders?companyId=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Convert "none" values to empty strings for proper form handling
    const actualValue = value === "none" ? "" : value;
    
    setFormData(prev => ({
      ...prev,
      [field]: actualValue,
    }));

    // Auto-fill amount when order is selected
    if (field === 'orderId' && actualValue) {
      const selectedOrder = orders.find(order => order.id === actualValue);
      if (selectedOrder) {
        setFormData(prev => ({
          ...prev,
          amount: selectedOrder.totalAmount.toString(),
          customerId: "", // Clear customer selection when order is selected
        }));
      }
    }

    // Clear order when customer is selected
    if (field === 'customerId' && actualValue) {
      setFormData(prev => ({
        ...prev,
        orderId: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.method || !formData.orderId || formData.orderId === "none") {
      alert('Please fill in all required fields including selecting an order');
      return;
    }

    setCreating(true);

    try {
      // Handle receipt upload if there's a receipt file
      let receiptUrl = formData.receiptUrl;
      if (receiptFile) {
        // In a real application, you would upload the file to a cloud storage service
        receiptUrl = URL.createObjectURL(receiptFile);
      }

      const paymentData = {
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        transactionId: formData.transactionId || undefined,
        notes: formData.notes || undefined,
        orderId: formData.orderId && formData.orderId !== "none" ? formData.orderId : undefined,
        companyId,
      };

      const response = await fetch('/api/marah/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        onPaymentCreated();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      method: "CASH",
      status: "PAID",
      transactionId: "",
      notes: "",
      paymentDate: new Date().toISOString().slice(0, 16),
      orderId: "",
      customerId: "",
      receiptUrl: "",
    });
    setReceiptFile(null);
  };

  const selectedOrder = orders.find(order => order.id === formData.orderId);
  const selectedCustomer = customers.find(customer => customer.id === formData.customerId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <span>Record New Payment</span>
          </DialogTitle>
          <DialogDescription>
            Record a new payment for an order. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Payment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (AED) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="method">Payment Method *</Label>
                  <Select value={formData.method} onValueChange={(value) => handleInputChange('method', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentDate">Payment Date & Time</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="paymentDate"
                      type="datetime-local"
                      value={formData.paymentDate}
                      onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="transactionId">Transaction ID</Label>
                <div className="relative">
                  <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="transactionId"
                    value={formData.transactionId}
                    onChange={(e) => handleInputChange('transactionId', e.target.value)}
                    placeholder="Transaction reference number"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional payment notes..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="receiptUpload">Payment Receipt</Label>
                <FileUpload
                  onFileSelect={(file, url) => {
                    setReceiptFile(file);
                    if (url) {
                      handleInputChange('receiptUrl', url);
                    }
                  }}
                  currentFile={formData.receiptUrl}
                  placeholder="Upload payment receipt (PDF, DOC, or Image)"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  maxSize={10}
                />
              </div>
            </CardContent>
          </Card>

          {/* Link to Order or Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Link Payment (Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderId">Link to Order *</Label>
                  <Select value={formData.orderId} onValueChange={(value) => handleInputChange('orderId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No order selected</SelectItem>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          #{order.orderNumber} - {order.customer.name} (AED {order.totalAmount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedOrder && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Customer: {selectedOrder.customer.name} | Amount: AED {selectedOrder.totalAmount}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="customerId">Or Link to Customer</Label>
                  <Select 
                    value={formData.customerId} 
                    onValueChange={(value) => handleInputChange('customerId', value)}
                    disabled={!!formData.orderId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No customer selected</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCustomer && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Phone: {selectedCustomer.phone}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
                <strong>Note:</strong> You can either link this payment to a specific order or to a customer directly. 
                Linking to an order will automatically set the amount and customer.
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t bg-background sticky bottom-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 