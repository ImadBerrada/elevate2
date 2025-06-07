"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Package,
  Truck,
  DollarSign,
  CreditCard,
  FileText,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onOrderUpdated?: () => void;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  companyId: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  address: {
    street: string;
    city: string;
    zone?: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    pricePerDay: number;
    totalPrice: number;
    days: number;
    game: {
      nameEn: string;
      nameAr: string;
    };
  }>;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
  }>;
  orderDate: string;
  eventDate: string;
  eventEndDate: string;
  eventTime?: string;
  setupTime?: string;
  notes?: string;
  source: string;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  deliveredAt?: string;
  collectedAt?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  status: string;
}

interface EditData {
  status: string;
  driverId: string;
  notes: string;
  eventDate: string;
  eventTime: string;
}

const orderStatuses = [
  { value: 'PENDING', label: 'Pending', color: 'bg-orange-100 text-orange-800' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ASSIGNED', label: 'Assigned', color: 'bg-purple-100 text-purple-800' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-blue-100 text-blue-800' },
  { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'COLLECTING', label: 'Collecting', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const paymentMethods = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE', label: 'Online Payment' },
];

export function OrderDetailModal({ isOpen, onClose, orderId, onOrderUpdated }: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    status: '',
    driverId: '',
    notes: '',
    eventDate: '',
    eventTime: '',
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'CASH',
    notes: '',
  });

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
      fetchDrivers();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/marah/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        setEditData({
          status: data.status,
          driverId: data.driver?.id || '',
          notes: data.notes || '',
          eventDate: data.eventDate.split('T')[0],
          eventTime: data.eventTime || '',
        });
        setPaymentData(prev => ({
          ...prev,
          amount: data.totalAmount - (data.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0),
        }));
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/marah/drivers?status=ACTIVE', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleUpdateOrder = async () => {
    if (!orderId) return;
    
    setUpdating(true);
    try {
      // Prepare the data, converting empty driverId to null
      const updateData = {
        ...editData,
        driverId: editData.driverId === "" ? null : editData.driverId,
      };

      const response = await fetch(`/api/marah/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder);
        setIsEditing(false);
        onOrderUpdated?.();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error updating order:', errorData);
        alert(`Failed to update order: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddPayment = async () => {
    if (!orderId || !order) return;
    
    try {
      const response = await fetch('/api/marah/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          orderId,
          amount: paymentData.amount,
          method: paymentData.method,
          notes: paymentData.notes,
          companyId: order.companyId,
        }),
      });
      
      if (response.ok) {
        fetchOrderDetails(); // Refresh order details
        setShowPaymentForm(false);
        setPaymentData({ amount: 0, method: 'CASH', notes: '' });
      }
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-AE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    return orderStatuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const totalPaid = order?.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const remainingBalance = (order?.totalAmount || 0) - totalPaid;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details - #{order?.orderNumber}</span>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleUpdateOrder} disabled={updating}>
                    <Save className="w-4 h-4 mr-2" />
                    {updating ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Manage order details, status, and payments
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : order ? (
            <div className="space-y-6 pb-6">
            {/* Order Status and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditing ? (
                    <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={cn("text-sm", getStatusColor(order.status))}>
                      {orderStatuses.find(s => s.value === order.status)?.label}
                    </Badge>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    <div>Order Date: {formatDate(order.orderDate)}</div>
                    <div>Source: {order.source.replace('_', ' ')}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div>
                        <Label>Event Date</Label>
                        <Input
                          type="date"
                          value={editData.eventDate}
                          onChange={(e) => setEditData(prev => ({ ...prev, eventDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Event Time</Label>
                        <Input
                          type="time"
                          value={editData.eventTime}
                          onChange={(e) => setEditData(prev => ({ ...prev, eventTime: e.target.value }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(order.eventDate)}</span>
                      </div>
                      {order.eventTime && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(order.eventTime)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Customer and Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Customer & Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Customer</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{order.customer.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{order.customer.phone}</span>
                      </div>
                      {order.customer.email && (
                        <div className="text-muted-foreground">{order.customer.email}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Delivery Address</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{order.address.street}</span>
                      </div>
                      <div className="text-muted-foreground">{order.address.city}</div>
                      {order.address.zone && (
                        <div className="text-muted-foreground">Zone: {order.address.zone}</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Driver Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Select value={editData.driverId || "none"} onValueChange={(value) => setEditData(prev => ({ ...prev, driverId: value === "none" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No driver assigned</SelectItem>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - {driver.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : order.driver ? (
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4" />
                    <span>{order.driver.name} - {order.driver.phone}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No driver assigned</div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Package className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{item.game.nameEn}</div>
                          <div className="text-sm text-muted-foreground">{item.game.nameAr}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {item.quantity}x × {item.days} day{item.days > 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(item.pricePerDay)}/day = {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Charge:</span>
                    <span>{formatCurrency(order.deliveryCharge)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Total Paid:</span>
                    <span>{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Remaining Balance:</span>
                    <span className={remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Payments</span>
                  {remainingBalance > 0 && (
                    <Button size="sm" onClick={() => setShowPaymentForm(true)}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Add Payment
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.payments.length > 0 ? (
                  <div className="space-y-2">
                    {order.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <div className="font-medium">{formatCurrency(payment.amount)}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.method} • {formatDate(payment.createdAt)}
                          </div>
                        </div>
                        <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No payments recorded</div>
                )}

                {showPaymentForm && (
                  <div className="mt-4 p-4 border rounded-lg space-y-3">
                    <h4 className="font-medium">Add Payment</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                          max={remainingBalance}
                        />
                      </div>
                      <div>
                        <Label>Method</Label>
                        <Select value={paymentData.method} onValueChange={(value) => setPaymentData(prev => ({ ...prev, method: value }))}>
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
                    </div>
                    <div>
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        value={paymentData.notes}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Payment notes..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleAddPayment}>Add Payment</Button>
                      <Button variant="outline" onClick={() => setShowPaymentForm(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editData.notes}
                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Order notes..."
                  />
                ) : (
                  <div className="text-sm">
                    {order.notes || 'No notes added'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground">The requested order could not be loaded.</p>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 