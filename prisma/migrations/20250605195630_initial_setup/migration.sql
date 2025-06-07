-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('MEETING', 'CALL', 'EMAIL', 'NETWORKING', 'PRESENTATION', 'NEGOTIATION', 'PARTNERSHIP', 'DEAL');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('FRIEND', 'RELATIVE', 'CONTACT');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('PROSPECT', 'PARTNER', 'NEGOTIATING', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('STRATEGIC_ALLIANCE', 'INVESTMENT_OPPORTUNITY', 'CO_INVESTMENT', 'JOINT_VENTURE', 'STRATEGIC_INVESTMENT', 'SERVICE_PARTNERSHIP');

-- CreateEnum
CREATE TYPE "EmployerStatus" AS ENUM ('NEW', 'ACTIVE', 'PREMIUM', 'INACTIVE', 'PARTNERSHIP');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "MarahOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ASSIGNED', 'DELIVERED', 'ACTIVE', 'COLLECTING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MarahDriverStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BUSY');

-- CreateEnum
CREATE TYPE "MarahPaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE');

-- CreateEnum
CREATE TYPE "MarahPaymentStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MarahExpenseCategory" AS ENUM ('FUEL', 'MAINTENANCE', 'MARKETING', 'SUPPLIES', 'UTILITIES', 'SALARIES', 'RENT', 'INSURANCE', 'EQUIPMENT', 'REPAIRS', 'OFFICE_SUPPLIES', 'PROFESSIONAL_SERVICES', 'TRAVEL', 'TRAINING', 'SOFTWARE', 'OTHER');

-- CreateEnum
CREATE TYPE "MarahCustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MarahCustomerType" AS ENUM ('REGULAR', 'VIP', 'PREMIUM', 'CORPORATE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "website" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "foundedYear" INTEGER,
    "revenue" TEXT,
    "logo" TEXT,
    "employeeCount" INTEGER NOT NULL DEFAULT 0,
    "tradeLicenseNumber" TEXT,
    "tradeLicenseExpiry" TIMESTAMP(3),
    "tradeLicenseDocument" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "salary" TEXT,
    "actualSalary" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "location" TEXT,
    "manager" TEXT,
    "skills" TEXT[],
    "avatar" TEXT,
    "companyId" TEXT NOT NULL,
    "actualCompanyId" TEXT,
    "employerId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_visas" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "visaNumber" TEXT,
    "visaType" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "sponsor" TEXT,
    "nationality" TEXT,
    "passportNumber" TEXT,
    "passportExpiry" TIMESTAMP(3),
    "emiratesId" TEXT,
    "emiratesIdExpiry" TIMESTAMP(3),
    "laborCardNumber" TEXT,
    "laborCardExpiry" TIMESTAMP(3),
    "visaDocument" TEXT,
    "passportDocument" TEXT,
    "emiratesIdDocument" TEXT,
    "laborCardDocument" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_visas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "picture" TEXT,
    "points" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "picture" TEXT,
    "employer" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "maritalStatus" "MaritalStatus",
    "relation" "RelationType",
    "category" TEXT,
    "rating" INTEGER DEFAULT 1,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "area" TEXT,
    "address" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "picture" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "location" TEXT,
    "revenue" TEXT,
    "founded" TEXT,
    "status" "BusinessStatus" NOT NULL DEFAULT 'PROSPECT',
    "partnership" "PartnershipType",
    "dealValue" TEXT,
    "lastInteraction" TIMESTAMP(3),
    "rating" INTEGER DEFAULT 1,
    "tags" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employers" (
    "id" TEXT NOT NULL,
    "picture" TEXT,
    "category" TEXT NOT NULL,
    "nameArabic" TEXT,
    "nameEnglish" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "location" TEXT,
    "founded" TEXT,
    "status" "EmployerStatus" NOT NULL DEFAULT 'NEW',
    "partnership" TEXT,
    "openPositions" INTEGER DEFAULT 0,
    "placementRate" DOUBLE PRECISION DEFAULT 0,
    "avgSalary" TEXT,
    "lastPlacement" TIMESTAMP(3),
    "rating" INTEGER DEFAULT 1,
    "benefits" TEXT[],
    "tags" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "depreciationRate" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assetTypeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "purchaseValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "location" TEXT,
    "serialNumber" TEXT,
    "description" TEXT,
    "customFields" JSONB NOT NULL,
    "documents" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marah_customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "status" "MarahCustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "customerType" "MarahCustomerType" NOT NULL DEFAULT 'REGULAR',
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "averageOrderValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastOrderDate" TIMESTAMP(3),
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profilePicture" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "marketingConsent" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marah_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marah_customer_addresses" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "zone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marah_customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marah_games" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "pricePerDay" DECIMAL(10,2) NOT NULL,
    "pricePerWeek" DECIMAL(10,2),
    "pricePerMonth" DECIMAL(10,2),
    "isDiscountable" BOOLEAN NOT NULL DEFAULT true,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "discountPercentage" INTEGER DEFAULT 0,
    "imageUrl" TEXT,
    "dimensions" TEXT,
    "capacity" INTEGER,
    "ageGroup" TEXT,
    "setupTime" INTEGER,
    "images" TEXT[],
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marah_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marah_drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "licenseNumber" TEXT,
    "vehicleInfo" TEXT,
    "vehicleRegistration" TEXT,
    "status" "MarahDriverStatus" NOT NULL DEFAULT 'ACTIVE',
    "profilePicture" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "experience" TEXT,
    "salary" DECIMAL(10,2),
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "activeOrders" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "completionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "licenseDocument" TEXT,
    "vehicleDocument" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marah_drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marah_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "driverId" TEXT,
    "status" "MarahOrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "MarahPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventEndDate" TIMESTAMP(3) NOT NULL,
    "eventTime" TEXT,
    "setupTime" TEXT,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'PHONE',
    "companyId" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deliveryCharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "collectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marah_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marah_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "pricePerDay" DECIMAL(10,2) NOT NULL,
    "days" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marah_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marah_payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "MarahPaymentMethod" NOT NULL,
    "status" "MarahPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marah_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marah_expenses" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category" "MarahExpenseCategory" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receipt" TEXT,
    "notes" TEXT,
    "vendor" TEXT,
    "location" TEXT,
    "receiptUrl" TEXT,
    "driverId" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marah_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marah_delivery_charges" (
    "id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "area" TEXT,
    "charge" DECIMAL(10,2),
    "baseCharge" DECIMAL(10,2),
    "perKmCharge" DECIMAL(10,2),
    "minimumCharge" DECIMAL(10,2),
    "maximumCharge" DECIMAL(10,2),
    "estimatedTime" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marah_delivery_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marah_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marah_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employee_visas_employeeId_key" ON "employee_visas"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "asset_types_name_key" ON "asset_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "marah_customers_phone_key" ON "marah_customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "marah_drivers_phone_key" ON "marah_drivers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "marah_orders_orderNumber_key" ON "marah_orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "marah_delivery_charges_zone_companyId_key" ON "marah_delivery_charges"("zone", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "marah_settings_key_companyId_key" ON "marah_settings"("key", "companyId");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_actualCompanyId_fkey" FOREIGN KEY ("actualCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "employers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_visas" ADD CONSTRAINT "employee_visas_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employers" ADD CONSTRAINT "employers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_types" ADD CONSTRAINT "asset_types_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_assets" ADD CONSTRAINT "company_assets_assetTypeId_fkey" FOREIGN KEY ("assetTypeId") REFERENCES "asset_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_assets" ADD CONSTRAINT "company_assets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_customers" ADD CONSTRAINT "marah_customers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_customer_addresses" ADD CONSTRAINT "marah_customer_addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "marah_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_games" ADD CONSTRAINT "marah_games_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_drivers" ADD CONSTRAINT "marah_drivers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_orders" ADD CONSTRAINT "marah_orders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_orders" ADD CONSTRAINT "marah_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "marah_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_orders" ADD CONSTRAINT "marah_orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "marah_customer_addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_orders" ADD CONSTRAINT "marah_orders_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "marah_drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_order_items" ADD CONSTRAINT "marah_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "marah_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_order_items" ADD CONSTRAINT "marah_order_items_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "marah_games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_payments" ADD CONSTRAINT "marah_payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "marah_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_payments" ADD CONSTRAINT "marah_payments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_expenses" ADD CONSTRAINT "marah_expenses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_expenses" ADD CONSTRAINT "marah_expenses_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "marah_drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_delivery_charges" ADD CONSTRAINT "marah_delivery_charges_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marah_settings" ADD CONSTRAINT "marah_settings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
