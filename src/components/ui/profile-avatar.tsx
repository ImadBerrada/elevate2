"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  src?: string | null;
  alt: string;
  fallbackText: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
  fallbackClassName?: string;
  imageClassName?: string;
  shape?: 'circle' | 'rounded' | 'square';
  ring?: boolean;
  ringColor?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  shadow?: boolean;
  hover?: boolean;
  border?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8', 
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
  '3xl': 'w-24 h-24',
  '4xl': 'w-32 h-32'
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm', 
  lg: 'text-base',
  xl: 'text-lg',
  '2xl': 'text-xl',
  '3xl': 'text-2xl',
  '4xl': 'text-3xl'
};

const shadowClasses = {
  xs: 'shadow-sm',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  '3xl': 'shadow-2xl',
  '4xl': 'shadow-2xl'
};

export function ProfileAvatar({
  src,
  alt,
  fallbackText,
  size = 'md',
  className,
  fallbackClassName,
  imageClassName,
  shape = 'circle',
  ring = false,
  ringColor = 'ring-primary/20',
  quality = 'ultra',
  shadow = true,
  hover = true,
  border = false
}: ProfileAvatarProps) {
  
  const getInitials = (text: string) => {
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getImageUrl = (url: string) => {
    // If it's already a full URL, return as is
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    
    // If it's a relative path, you might want to add your base URL here
    // For now, return as is
    return url;
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'square':
        return 'rounded-none';
      case 'rounded':
        return 'rounded-lg';
      default:
        return 'rounded-full';
    }
  };

  return (
    <Avatar 
      className={cn(
        sizeClasses[size],
        getShapeClasses(),
        ring && `ring-2 ${ringColor}`,
        shadow && shadowClasses[size],
        border && 'border-2 border-white/20',
        hover && 'transition-all duration-300 hover:scale-105 hover:shadow-xl',
        'overflow-hidden',
        className
      )}
    >
      {src && (
        <AvatarImage 
          src={getImageUrl(src)} 
          alt={alt}
          className={cn(
            "object-cover w-full h-full",
            getShapeClasses(),
            quality === 'ultra' && "image-rendering-crisp-edges filter brightness-105 contrast-105",
            quality === 'high' && "image-rendering-crisp-edges",
            "transition-all duration-300",
            imageClassName
          )}
          loading="lazy"
          onError={(e) => {
            // Hide the image if it fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      )}
      <AvatarFallback 
        className={cn(
          "bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold",
          "flex items-center justify-center",
          textSizeClasses[size],
          getShapeClasses(),
          "transition-all duration-300",
          fallbackClassName
        )}
      >
        {getInitials(fallbackText)}
      </AvatarFallback>
    </Avatar>
  );
}

// Enhanced Company Avatar for company logos
export function CompanyAvatar({ company, size = 'md', className, ...props }: {
  company: { name: string; logo?: string | null; industry?: string };
  size?: ProfileAvatarProps['size'];
  className?: string;
} & Omit<ProfileAvatarProps, 'src' | 'alt' | 'fallbackText' | 'size' | 'className'>) {
  
  const getFallbackColor = (industry?: string) => {
    switch (industry?.toLowerCase()) {
      case 'technology':
        return 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white';
      case 'finance':
        return 'bg-gradient-to-br from-green-600 to-emerald-500 text-white';
      case 'healthcare':
        return 'bg-gradient-to-br from-red-500 to-pink-500 text-white';
      case 'education':
        return 'bg-gradient-to-br from-purple-600 to-indigo-500 text-white';
      case 'retail':
        return 'bg-gradient-to-br from-orange-500 to-yellow-500 text-white';
      case 'entertainment':
        return 'bg-gradient-to-br from-pink-500 to-rose-500 text-white';
      default:
        return 'bg-gradient-to-br from-slate-600 to-gray-500 text-white';
    }
  };

  return (
    <ProfileAvatar
      src={company.logo}
      alt={`${company.name} logo`}
      fallbackText={company.name}
      size={size}
      className={className}
      fallbackClassName={getFallbackColor(company.industry)}
      shape="rounded"
      quality="ultra"
      shadow={true}
      hover={true}
      border={true}
      {...props}
    />
  );
}

// Specialized variants for different entity types
export function CustomerAvatar({ customer, size = 'md', className, ...props }: {
  customer: { name: string; profilePicture?: string | null; customerType?: string };
  size?: ProfileAvatarProps['size'];
  className?: string;
} & Omit<ProfileAvatarProps, 'src' | 'alt' | 'fallbackText' | 'size' | 'className'>) {
  
  const getFallbackColor = (type?: string) => {
    switch (type) {
      case 'VIP':
        return 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white shadow-lg shadow-yellow-500/25';
      case 'PREMIUM':
        return 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-purple-500/25';
      case 'CORPORATE':
        return 'bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25';
      default:
        return 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 text-white shadow-lg shadow-blue-500/25';
    }
  };

  return (
    <ProfileAvatar
      src={customer.profilePicture}
      alt={customer.name}
      fallbackText={customer.name}
      size={size}
      className={className}
      fallbackClassName={getFallbackColor(customer.customerType)}
      quality="ultra"
      shadow={true}
      hover={true}
      ring={customer.customerType === 'VIP' || customer.customerType === 'PREMIUM'}
      ringColor={customer.customerType === 'VIP' ? 'ring-yellow-400/50' : customer.customerType === 'PREMIUM' ? 'ring-purple-400/50' : 'ring-blue-400/50'}
      {...props}
    />
  );
}

export function DriverAvatar({ driver, size = 'md', className, ...props }: {
  driver: { name: string; profilePicture?: string | null; status?: string };
  size?: ProfileAvatarProps['size'];
  className?: string;
} & Omit<ProfileAvatarProps, 'src' | 'alt' | 'fallbackText' | 'size' | 'className'>) {
  
  const getFallbackColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white shadow-lg shadow-green-500/25';
      case 'INACTIVE':
        return 'bg-gradient-to-br from-gray-500 via-slate-500 to-zinc-500 text-white shadow-lg shadow-gray-500/25';
      case 'SUSPENDED':
        return 'bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 text-white shadow-lg shadow-red-500/25';
      default:
        return 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white shadow-lg shadow-green-500/25';
    }
  };

  return (
    <ProfileAvatar
      src={driver.profilePicture}
      alt={driver.name}
      fallbackText={driver.name}
      size={size}
      className={className}
      fallbackClassName={getFallbackColor(driver.status)}
      quality="ultra"
      shadow={true}
      hover={true}
      ring={driver.status === 'ACTIVE'}
      ringColor="ring-green-400/50"
      {...props}
    />
  );
}

export function GameAvatar({ game, size = 'md', className, ...props }: {
  game: { nameEn: string; imageUrl?: string | null; category?: string };
  size?: ProfileAvatarProps['size'];
  className?: string;
} & Omit<ProfileAvatarProps, 'src' | 'alt' | 'fallbackText' | 'size' | 'className'>) {
  
  const getFallbackColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'bounce house':
        return 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-red-500/25';
      case 'slide':
        return 'bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500 text-white shadow-lg shadow-blue-500/25';
      case 'obstacle course':
        return 'bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-500 text-white shadow-lg shadow-orange-500/25';
      case 'combo':
        return 'bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 text-white shadow-lg shadow-purple-500/25';
      case 'water slide':
        return 'bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25';
      default:
        return 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25';
    }
  };

  return (
    <ProfileAvatar
      src={game.imageUrl}
      alt={game.nameEn}
      fallbackText={game.nameEn}
      size={size}
      className={className}
      fallbackClassName={getFallbackColor(game.category)}
      shape="rounded"
      quality="ultra"
      shadow={true}
      hover={true}
      border={true}
      {...props}
    />
  );
}

export function UserAvatar({ user, size = 'md', className, ...props }: {
  user: { firstName: string; lastName: string; avatar?: string | null; role?: string };
  size?: ProfileAvatarProps['size'];
  className?: string;
} & Omit<ProfileAvatarProps, 'src' | 'alt' | 'fallbackText' | 'size' | 'className'>) {
  
  const getFallbackColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-gradient-to-br from-red-600 via-rose-500 to-pink-500 text-white shadow-lg shadow-red-500/25';
      case 'manager':
        return 'bg-gradient-to-br from-purple-600 via-violet-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25';
      case 'supervisor':
        return 'bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-500 text-white shadow-lg shadow-orange-500/25';
      default:
        return 'bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 text-white shadow-lg shadow-blue-500/25';
    }
  };

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <ProfileAvatar
      src={user.avatar}
      alt={fullName}
      fallbackText={fullName}
      size={size}
      className={className}
      fallbackClassName={getFallbackColor(user.role)}
      quality="ultra"
      shadow={true}
      hover={true}
      ring={user.role === 'admin' || user.role === 'manager'}
      ringColor={user.role === 'admin' ? 'ring-red-400/50' : user.role === 'manager' ? 'ring-purple-400/50' : 'ring-blue-400/50'}
      {...props}
    />
  );
}