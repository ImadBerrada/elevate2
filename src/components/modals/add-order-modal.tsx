"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Minus, Calendar, Clock, MapPin, User, Phone, Mail, Package, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  addresses: Array<{
    id: string;
    street: string;
    city: string;
    zone?: string;
  }>;
}

interface Game {
  id: string;
  nameEn: string;
  nameAr: string;
  pricePerDay: number;
  category: string;
  isAvailable: boolean;
  images: string[];
}

interface OrderItem {
  gameId: string;
  quantity: number;
  days: number;
  pricePerDay: number;
}

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
  companyId: string;
}

export function AddOrderModal({ isOpen, onClose, onOrderCreated, companyId }: AddOrderModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [eventEndDate, setEventEndDate] = useState<string>("");
  const [setupTime, setSetupTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [source, setSource] = useState<string>("PHONE");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Customer form for new customer
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    zone: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchGames();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers for companyId:', companyId);
      const response = await fetch(`/api/marah/customers?companyId=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      console.log('Customers API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Customers data:', data);
        setCustomers(data.customers || []);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch(`/api/marah/games?companyId=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setGames(data.games?.filter((game: Game) => game.isAvailable) || []);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      gameId: "",
      quantity: 1,
      days: 1,
      pricePerDay: 0,
    }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...orderItems];
    if (field === 'gameId') {
      const selectedGame = games.find(g => g.id === value);
      if (selectedGame) {
        updatedItems[index] = {
          ...updatedItems[index],
          gameId: value as string,
          pricePerDay: selectedGame.pricePerDay,
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
    }
    setOrderItems(updatedItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.quantity * item.days * item.pricePerDay);
    }, 0);
  };

  const createCustomer = async () => {
    try {
      const response = await fetch('/api/marah/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          ...newCustomer,
          companyId,
        }),
      });

      if (response.ok) {
        const customer = await response.json();
        setCustomers([...customers, customer]);
        setSelectedCustomer(customer.id);
        setSelectedAddress(customer.addresses[0]?.id || "");
        setShowNewCustomerForm(false);
        setNewCustomer({
          name: "",
          phone: "",
          email: "",
          street: "",
          city: "",
          zone: "",
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create customer');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer || !selectedAddress || !eventDate || !eventEndDate || orderItems.length === 0) {
      alert('Please fill in all required fields and add at least one game');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/marah/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          addressId: selectedAddress,
          eventDate: new Date(eventDate).toISOString(),
          eventEndDate: new Date(eventEndDate).toISOString(),
          setupTime,
          notes,
          source,
          companyId,
          items: orderItems,
          discountAmount: 0,
        }),
      });

      if (response.ok) {
        onOrderCreated();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer("");
    setSelectedAddress("");
    setEventDate("");
    setEventEndDate("");
    setSetupTime("");
    setNotes("");
    setSource("PHONE");
    setOrderItems([]);
    setShowNewCustomerForm(false);
    setNewCustomer({
      name: "",
      phone: "",
      email: "",
      street: "",
      city: "",
      zone: "",
    });
  };

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-primary" />
            <span>Create New Order</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showNewCustomerForm ? (
                <>
                  <div>
                    <Label htmlFor="customer">Select Customer *</Label>
                    <div className="flex space-x-2">
                      <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Choose a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewCustomerForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New
                      </Button>
                    </div>
                  </div>

                  {selectedCustomerData && (
                    <div>
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose delivery address" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCustomerData.addresses.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              {address.street}, {address.city} {address.zone && `- ${address.zone}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">New Customer</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewCustomerForm(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newCustomerName">Name *</Label>
                      <Input
                        id="newCustomerName"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newCustomerPhone">Phone *</Label>
                      <Input
                        id="newCustomerPhone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newCustomerEmail">Email</Label>
                      <Input
                        id="newCustomerEmail"
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newCustomerCity">City *</Label>
                      <Input
                        id="newCustomerCity"
                        value={newCustomer.city}
                        onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                        placeholder="City"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="newCustomerStreet">Street Address *</Label>
                      <Input
                        id="newCustomerStreet"
                        value={newCustomer.street}
                        onChange={(e) => setNewCustomer({...newCustomer, street: e.target.value})}
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newCustomerZone">Zone</Label>
                      <Input
                        id="newCustomerZone"
                        value={newCustomer.zone}
                        onChange={(e) => setNewCustomer({...newCustomer, zone: e.target.value})}
                        placeholder="Zone/Area"
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={createCustomer}
                    className="w-full"
                  >
                    Create Customer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Event Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventDate">Event Start Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="eventEndDate">Event End Date *</Label>
                  <Input
                    id="eventEndDate"
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="setupTime">Preferred Setup Time</Label>
                  <Input
                    id="setupTime"
                    type="time"
                    value={setupTime}
                    onChange={(e) => setSetupTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="source">Order Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHONE">Phone Call</SelectItem>
                      <SelectItem value="WEBSITE">Website</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="WALK_IN">Walk-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Special Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Games Selection</span>
                </div>
                <Button type="button" onClick={addOrderItem} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Game
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No games selected yet</p>
                  <p className="text-sm">Click "Add Game" to start building the order</p>
                </div>
              ) : (
                orderItems.map((item, index) => {
                  const selectedGame = games.find(g => g.id === item.gameId);
                  return (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Game #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOrderItem(index)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                          <Label>Game</Label>
                          <Select
                            value={item.gameId}
                            onValueChange={(value) => updateOrderItem(index, 'gameId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a game" />
                            </SelectTrigger>
                            <SelectContent>
                              {games.map((game) => (
                                <SelectItem key={game.id} value={game.id}>
                                  {game.nameEn} - AED {game.pricePerDay}/day
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label>Days</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.days}
                            onChange={(e) => updateOrderItem(index, 'days', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                      
                      {selectedGame && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity} × {item.days} days × AED {item.pricePerDay}
                          </span>
                          <span className="font-semibold">
                            AED {(item.quantity * item.days * item.pricePerDay).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              
              {orderItems.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-primary">AED {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t bg-background sticky bottom-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 