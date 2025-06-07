"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Contact, 
  Search, 
  Filter, 
  Plus,
  Mail,
  Phone,
  Building,
  MapPin,
  Star,
  MessageSquare,
  Calendar,
  MoreHorizontal,
  Upload,
  Camera,
  User,
  Heart,
  Users,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { ImageUpload } from "@/components/ui/image-upload";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export default function BusinessNetworkContacts() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactData, setContactData] = useState({
    picture: "",
    employer: "",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    maritalStatus: "",
    relation: "",
    category: "",
    rating: 1,
    email: "",
    phone: "",
    country: "",
    city: "",
    area: "",
    address: ""
  });
  const [contacts, setContacts] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchContacts();
    fetchEmployers();
    fetchStats();

    // Refresh employers when window regains focus (user returns from adding employer)
    const handleFocus = () => {
      fetchEmployers();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchContacts();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchContacts = async () => {
    try {
      const data = await apiClient.getContacts({ 
        limit: 50,
        search: searchTerm || undefined
      });
      setContacts(data.contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployers = async () => {
    try {
      const data = await apiClient.getEmployers({ limit: 100 });
      setEmployers(data.employers);
    } catch (err) {
      console.error('Failed to fetch employers:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiClient.createContact({
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        employer: contactData.employer || undefined,
        gender: contactData.gender as any || undefined,
        dateOfBirth: contactData.dateOfBirth || undefined,
        maritalStatus: contactData.maritalStatus as any || undefined,
        relation: contactData.relation as any || undefined,
        category: contactData.category || undefined,
        rating: contactData.rating || 1,
        country: contactData.country || undefined,
        city: contactData.city || undefined,
        area: contactData.area || undefined,
        address: contactData.address || undefined,
        picture: undefined // File upload will be implemented later
      });

      setIsAddContactOpen(false);
      // Reset form
      setContactData({
        picture: "",
        employer: "",
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        maritalStatus: "",
        relation: "",
        category: "",
        rating: 1,
        email: "",
        phone: "",
        country: "",
        city: "",
        area: "",
        address: ""
      });
      
      // Refresh contacts and stats
      await fetchContacts();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContactData(prev => ({ ...prev, picture: URL.createObjectURL(file) }));
    }
  };

  const updateContactData = (field: string, value: string | number) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 3 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading contacts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0" // Prevent content overflow
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Action Bar */}
              <motion.div 
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 border-refined text-xs sm:text-sm h-9 sm:h-10"
                  />
                </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="outline" className="border-refined text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">Filter</span>
                </Button>
                <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                  <DialogTrigger asChild>
                  <Button className="btn-premium text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add Contact</span>
                    <span className="sm:hidden">Add</span>
                    </Button>
                  </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] glass-card border-refined max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-elegant text-gradient">Add New Contact</DialogTitle>
                      <DialogDescription className="text-refined">
                        Create a new contact profile with detailed information.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[calc(90vh-8rem)] overflow-y-auto pr-2">
                      <form onSubmit={handleContactSubmit} className="space-y-6">
                        <ImageUpload
                          id="contact-picture"
                          label="Profile Picture"
                          value={contactData.picture}
                          onChange={(value) => updateContactData("picture", value || "")}
                          placeholder="Upload profile picture"
                          size="lg"
                          shape="circle"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                            <Input
                              id="firstName"
                            placeholder="Enter first name..."
                              value={contactData.firstName}
                              onChange={(e) => updateContactData("firstName", e.target.value)}
                              className="border-refined"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                            <Input
                              id="lastName"
                            placeholder="Enter last name..."
                              value={contactData.lastName}
                              onChange={(e) => updateContactData("lastName", e.target.value)}
                              className="border-refined"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                            placeholder="Enter email address..."
                              value={contactData.email}
                              onChange={(e) => updateContactData("email", e.target.value)}
                              className="border-refined"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                            <Input
                              id="phone"
                            placeholder="Enter phone number..."
                              value={contactData.phone}
                              onChange={(e) => updateContactData("phone", e.target.value)}
                              className="border-refined"
                            />
                          </div>
                        </div>

                          <div className="space-y-2">
                              <Label htmlFor="employer" className="text-sm font-medium">Employer</Label>
                            <Select value={contactData.employer} onValueChange={(value) => updateContactData("employer", value)}>
                              <SelectTrigger className="border-refined">
                                <SelectValue placeholder="Select employer (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {employers.map((employer) => (
                                        <SelectItem key={employer.id} value={employer.nameEnglish}>
                                  {employer.nameEnglish}
                                      </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">
                              Don't see the employer? <a href="/elevate/business-network/employers" target="_blank" className="text-primary hover:underline">Add a new employer</a>
                                  </p>
                              </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                                <Select value={contactData.gender} onValueChange={(value) => updateContactData("gender", value)}>
                                  <SelectTrigger className="border-refined">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                            </div>

                              <div className="space-y-2">
                                <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                                <Input
                                  id="dateOfBirth"
                                  type="date"
                                  value={contactData.dateOfBirth}
                                  onChange={(e) => updateContactData("dateOfBirth", e.target.value)}
                                  className="border-refined"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="maritalStatus" className="text-sm font-medium">Marital Status</Label>
                                <Select value={contactData.maritalStatus} onValueChange={(value) => updateContactData("maritalStatus", value)}>
                                  <SelectTrigger className="border-refined">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="SINGLE">Single</SelectItem>
                                    <SelectItem value="MARRIED">Married</SelectItem>
                                  <SelectItem value="DIVORCED">Divorced</SelectItem>
                                  <SelectItem value="WIDOWED">Widowed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                              <Label htmlFor="relation" className="text-sm font-medium">Relationship</Label>
                                <Select value={contactData.relation} onValueChange={(value) => updateContactData("relation", value)}>
                                  <SelectTrigger className="border-refined">
                                  <SelectValue placeholder="Select relationship" />
                                  </SelectTrigger>
                                  <SelectContent>
                                  <SelectItem value="COLLEAGUE">Colleague</SelectItem>
                                  <SelectItem value="CLIENT">Client</SelectItem>
                                  <SelectItem value="PARTNER">Business Partner</SelectItem>
                                    <SelectItem value="FRIEND">Friend</SelectItem>
                                  <SelectItem value="FAMILY">Family</SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                                <Input
                                  id="category"
                                placeholder="e.g., VIP, Investor, Supplier..."
                                  value={contactData.category}
                                  onChange={(e) => updateContactData("category", e.target.value)}
                                  className="border-refined"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                            <Label className="text-sm font-medium">Rating</Label>
                            <div className="flex items-center space-x-2">
                              {[1, 2, 3].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => updateContactData("rating", star)}
                                  className="focus:outline-none"
                                >
                                  <Star 
                                    className={`w-6 h-6 ${
                                      star <= contactData.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                </button>
                              ))}
                              <span className="text-sm text-muted-foreground ml-2">
                                {contactData.rating === 1 && "Standard"}
                                {contactData.rating === 2 && "Important"}
                                {contactData.rating === 3 && "VIP"}
                              </span>
                            </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                                <Input
                                  id="country"
                                placeholder="Enter country..."
                                  value={contactData.country}
                                  onChange={(e) => updateContactData("country", e.target.value)}
                                  className="border-refined"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="city" className="text-sm font-medium">City</Label>
                                <Input
                                  id="city"
                                placeholder="Enter city..."
                                  value={contactData.city}
                                  onChange={(e) => updateContactData("city", e.target.value)}
                                  className="border-refined"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                              <Label htmlFor="area" className="text-sm font-medium">Area/District</Label>
                                <Input
                                  id="area"
                                placeholder="Enter area or district..."
                                  value={contactData.area}
                                  onChange={(e) => updateContactData("area", e.target.value)}
                                  className="border-refined"
                                />
                              </div>

                              <div className="space-y-2">
                              <Label htmlFor="address" className="text-sm font-medium">Full Address</Label>
                                <Input
                                  id="address"
                                placeholder="Enter full address..."
                                  value={contactData.address}
                                  onChange={(e) => updateContactData("address", e.target.value)}
                                  className="border-refined"
                                />
                              </div>
                            </div>

                            {error && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{error}</p>
                              </div>
                            )}

                            <div className="flex justify-end space-x-3">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsAddContactOpen(false)}
                                disabled={submitting}
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                className="btn-premium"
                                disabled={submitting}
                              >
                                {submitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Contact
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </div>
                      </DialogContent>
                    </Dialog>
                </div>
              </motion.div>

              {/* Contact Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                  <Card className="card-premium border-refined">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gradient">
                        {stats?.contacts.total || 0}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                  <Card className="card-premium border-refined">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">VIP Contacts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gradient">
                        {stats?.contacts.vip || 0}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                  <Card className="card-premium border-refined">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Companies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gradient">
                        {new Set(contacts.filter(c => c.employer).map(c => c.employer)).size}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                  <Card className="card-premium border-refined">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Recent Interactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gradient">
                        {contacts.length}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Contacts Grid */}
              <motion.div 
                {...fadeInUp}
                transition={{ delay: 0.5 }}
              >
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <CardTitle className="text-xl font-elegant">Contact Directory</CardTitle>
                    <CardDescription className="text-refined">
                      Your professional contact network
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contacts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contacts.map((contact, index) => (
                          <motion.div
                            key={contact.id}
                            className="p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <div className="flex items-start space-x-4">
                              <Avatar className="w-12 h-12">
                                {contact.picture ? (
                                  <AvatarImage src={contact.picture} alt={`${contact.firstName} ${contact.lastName}`} />
                                ) : null}
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {contact.firstName[0]}{contact.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-medium text-lg">
                                  {contact.firstName} {contact.lastName}
                                </h4>
                                {contact.employer && (
                                  <p className="text-sm text-muted-foreground flex items-center">
                                    <Building className="w-3 h-3 mr-1" />
                                    {contact.employer}
                                  </p>
                                )}
                                <div className="flex items-center space-x-1 mt-2">
                                  {renderStars(contact.rating || 1)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Mail className="w-4 h-4 mr-2" />
                                {contact.email}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="w-4 h-4 mr-2" />
                                {contact.phone}
                              </div>
                              {(contact.city || contact.country) && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  {[contact.city, contact.country].filter(Boolean).join(', ')}
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex space-x-1">
                                {contact.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {contact.category}
                                  </Badge>
                                )}
                                {contact.relation && (
                                  <Badge variant="outline" className="text-xs">
                                    {contact.relation.toLowerCase()}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" className="border-refined">
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="border-refined">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Users className="w-16 h-16 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">
                          {searchTerm ? 'No contacts found' : 'No contacts yet'}
                        </h3>
                        <p className="text-sm text-muted-foreground text-center mb-4">
                          {searchTerm 
                            ? `No contacts match "${searchTerm}". Try a different search term.`
                            : 'Start building your professional network by adding contacts.'
                          }
                        </p>
                        {!searchTerm && (
                          <Button 
                            className="btn-premium"
                            onClick={() => setIsAddContactOpen(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Contact
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </main>
          </div>
        </div>
      );
    } 