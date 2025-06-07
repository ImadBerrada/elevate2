"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { 
  Search, 
  Bell, 
  Settings, 
  MoreHorizontal,
  User,
  LogOut,
  HelpCircle,
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/ui/profile-avatar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
};

export function Header({ className }: HeaderProps) {
  const { isOpen } = useSidebar();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  return (
    <motion.header 
      className={cn(
        "glass-header sticky top-0 z-50 transition-all duration-300",
        isOpen ? "opacity-0 -translate-y-full pointer-events-none" : "opacity-100 translate-y-0",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: isOpen ? 0 : 1, 
        y: isOpen ? -20 : 0 
      }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Burger Menu */}
          <motion.div 
            className="flex items-center"
            {...scaleIn}
            transition={{ delay: 0.1 }}
          >
            <BurgerMenu />
          </motion.div>
          
          {/* Center - Logo */}
          <motion.div 
            className="absolute left-1/2 transform -translate-x-1/2"
            {...scaleIn}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/logo ele.png"
                alt="ELEVATE Investment Group"
                width={120}
                height={40}
                className="h-8 sm:h-10"
                style={{ width: "auto" }}
                priority
              />
            </motion.div>
          </motion.div>
          
          {/* Right side - Three Dots Menu */}
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 sm:w-10 sm:h-10 hover:bg-primary/10"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Expanded Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-64 sm:w-80 glass-card border-refined rounded-xl shadow-xl z-50"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input 
                        placeholder="Search..." 
                        className="pl-10 border-refined focus-premium text-refined h-10"
                      />
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="border-refined justify-start h-12">
                        <Bell className="w-4 h-4 mr-2" />
                        <span className="text-sm">Notifications</span>
                      </Button>
                      <Button variant="outline" className="border-refined justify-start h-12">
                        <Settings className="w-4 h-4 mr-2" />
                        <span className="text-sm">Settings</span>
                      </Button>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <UserAvatar 
                        user={user || { firstName: '', lastName: '', avatar: null, role: 'user' }}
                        size="md"
                        className="shadow-md"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        <p className="text-xs text-primary font-medium">{user?.role}</p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start h-10">
                        <User className="w-4 h-4 mr-3" />
                        <span className="text-sm">Profile</span>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start h-10">
                        <HelpCircle className="w-4 h-4 mr-3" />
                        <span className="text-sm">Help & Support</span>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start h-10">
                        <Moon className="w-4 h-4 mr-3" />
                        <span className="text-sm">Dark Mode</span>
                      </Button>
                      <div className="border-t border-border/30 pt-2 mt-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          <span className="text-sm">Sign Out</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Backdrop */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  className="fixed inset-0 bg-black/20 z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMenuOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
} 