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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

export default function BusinessNetworkContacts() {
  const { isOpen } = useSidebar();
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactData, setContactData] = useState({
    picture: null as File | null,
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
        picture: null,
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
      setContactData(prev => ({ ...prev, picture: file }));
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
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? 'ml-0' : 'ml-0'}`}>
        <motion.header 
          className="glass-header sticky top-0 z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <BurgerMenu />
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Contact className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-elegant text-gradient">Business Contacts</h1>
                    <p className="text-sm text-muted-foreground font-refined">Professional Contact Management</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 border-refined"
                  />
                </div>
                <Button variant="outline" className="border-refined">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-premium">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] glass-card border-refined max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-elegant text-gradient">Add New Contact</DialogTitle>
                      <DialogDescription className="text-refined">
                        Add a new professional contact to your business network.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      {/* Picture Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="contact-picture" className="text-sm font-medium">Contact Picture (Optional)</Label>
                        <div className="flex items-center space-x-4">
                          <Input
                            id="contact-picture"
                            type="file"
                            accept="image/*"
                            onChange={handlePictureUpload}
                            className="border-refined"
                          />
                          <Button type="button" variant="outline" className="border-refined">
                            <Camera className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                        {contactData.picture && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {contactData.picture.name}
                          </p>
                        )}
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                          <Input
                            id="firstName"
                            placeholder="First name..."
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
                            placeholder="Last name..."
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
                            placeholder="email@example.com"
                            value={contactData.email}
                            onChange={(e) => updateContactData("email", e.target.value)}
                            className="border-refined"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium">Phone *</Label>
                          <Input
                            id="phone"
                            placeholder="Phone number..."
                            value={contactData.phone}
                            onChange={(e) => updateContactData("phone", e.target.value)}
                            className="border-refined"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="employer" className="text-sm font-medium">Employer</Label>
                            <div className="flex space-x-1">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={fetchEmployers}
                                title="Refresh employers list"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Select value={contactData.employer || "NO_EMPLOYER"} onValueChange={(value) => updateContactData("employer", value === "NO_EMPLOYER" ? "" : value)}>
                              <SelectTrigger className="border-refined flex-1">
                                <SelectValue placeholder="Select employer or leave empty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NO_EMPLOYER">
                                  <span className="text-muted-foreground">No employer</span>
                                </SelectItem>
                                {employers.map((employer) => (
                                  <SelectItem key={employer.id} value={employer.nameEnglish}>
                                    <div className="flex flex-col">
                                      <span>{employer.nameEnglish}</span>
                                      {employer.nameArabic && (
                                        <span className="text-xs text-muted-foreground" dir="rtl">
                                          {employer.nameArabic}
                                        </span>
                                      )}
                                      {employer.category && (
                                        <span className="text-xs text-muted-foreground">
                                          {employer.category.toLowerCase().replace('_', ' ')}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="border-refined"
                              onClick={() => window.open('/elevate/business-network/employers', '_blank')}
                              title="Add new employer"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          {employers.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              No employers available. Click the + button to add employers first.
                            </p>
                          )}
                        </div>

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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="relation" className="text-sm font-medium">Relation Type</Label>
                          <Select value={contactData.relation} onValueChange={(value) => updateContactData("relation", value)}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select relation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FRIEND">Friend</SelectItem>
                              <SelectItem value="RELATIVE">Relative</SelectItem>
                              <SelectItem value="CONTACT">Contact</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                          <Input
                            id="category"
                            placeholder="e.g., Client, Partner, Vendor..."
                            value={contactData.category}
                            onChange={(e) => updateContactData("category", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rating" className="text-sm font-medium">Rating (1-3 stars)</Label>
                        <Select value={contactData.rating.toString()} onValueChange={(value) => updateContactData("rating", parseInt(value))}>
                          <SelectTrigger className="border-refined">
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">⭐ 1 Star</SelectItem>
                            <SelectItem value="2">⭐⭐ 2 Stars</SelectItem>
                            <SelectItem value="3">⭐⭐⭐ 3 Stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Location Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                          <Input
                            id="country"
                            placeholder="Country..."
                            value={contactData.country}
                            onChange={(e) => updateContactData("country", e.target.value)}
                            className="border-refined"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-sm font-medium">City</Label>
                          <Input
                            id="city"
                            placeholder="City..."
                            value={contactData.city}
                            onChange={(e) => updateContactData("city", e.target.value)}
                            className="border-refined"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="area" className="text-sm font-medium">Area</Label>
                          <Input
                            id="area"
                            placeholder="Area/District..."
                            value={contactData.area}
                            onChange={(e) => updateContactData("area", e.target.value)}
                            className="border-refined"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                          <Input
                            id="address"
                            placeholder="Full address..."
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
                  </DialogContent>
                </Dialog>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-6 py-6">
          <motion.div 
            className="mb-8"
            {...fadeInUp}
          >
            <h2 className="text-2xl font-prestigious text-gradient mb-2">
              Professional Contacts
            </h2>
            <p className="text-refined text-muted-foreground">
              Manage your business network and professional relationships.
            </p>
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