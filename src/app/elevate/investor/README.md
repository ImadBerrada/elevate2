# Investor Management System - Backend Integration

## Overview

The investor management system in `src/app/elevate/investor/` is a comprehensive platform for managing investment partners, tracking communications, and monitoring portfolio performance. This system is now fully integrated with a PostgreSQL database using Prisma ORM.

## Architecture

### Database Schema

The system uses the following Prisma models:

#### Investor Model
```prisma
model Investor {
  id              String   @id @default(cuid())
  name            String
  type            InvestorType
  investment      Float
  stake           Float
  joinDate        DateTime @default(now())
  status          InvestorStatus @default(PENDING)
  headquarters    String
  website         String?
  fundSize        Float?
  performanceRating Float?  @default(0)
  riskProfile     RiskProfile @default(MEDIUM)
  notes           String?
  email           String   @unique
  phone           String?
  primaryContact  String
  investmentFocus String[]
  lastCommunication DateTime?
  nextMeeting      DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  communications   InvestorCommunication[]
}
```

#### InvestorCommunication Model
```prisma
model InvestorCommunication {
  id          String   @id @default(cuid())
  investorId  String
  type        CommunicationType
  subject     String
  content     String?
  date        DateTime @default(now())
  status      CommunicationStatus @default(SENT)
  priority    Priority @default(MEDIUM)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  investor    Investor @relation(fields: [investorId], references: [id], onDelete: Cascade)
}
```

### API Endpoints

#### `/api/elevate/investors` (Main Investor CRUD)
- **GET**: Fetch all investors with filtering and pagination
  - Query params: `search`, `type`, `status`, `page`, `limit`
  - Returns: `{ success, investors, total, pagination, stats }`
- **POST**: Create new investor
  - Body: `CreateInvestorData`
  - Returns: `{ success, investor, message }`
- **PUT**: Update investor
  - Body: `UpdateInvestorData` (includes `id`)
  - Returns: `{ success, investor, message }`
- **DELETE**: Delete investor
  - Query param: `id`
  - Returns: `{ success, message }`

#### `/api/elevate/investors/communications` (Communications)
- **GET**: Fetch communications with filtering
  - Query params: `investorId`, `type`, `status`, `limit`, `page`
  - Returns: `{ success, communications, total, pagination }`
- **POST**: Create new communication
  - Body: `CreateCommunicationData`
  - Returns: `{ success, communication, message }`

### Components

#### 1. InvestorDetailModal (`components/InvestorDetailModal.tsx`)
- **Purpose**: Display and edit detailed investor information
- **Features**:
  - Tabbed interface (Overview, Financial, Communications, Notes)
  - Inline editing capabilities
  - Performance metrics display
  - Communication history
- **Props**:
  - `investor`: Investor object or null
  - `isOpen`: boolean
  - `onClose`: function
  - `onUpdate`: function to handle investor updates

#### 2. NewInvestorModal (`components/NewInvestorModal.tsx`)
- **Purpose**: Create new investors with comprehensive form validation
- **Features**:
  - Multi-step form with tabs (Basic, Contact, Financial, Additional)
  - Real-time validation
  - Investment focus area selection
  - Risk profile assessment
- **Props**:
  - `isOpen`: boolean
  - `onClose`: function
  - `onSubmit`: function to handle investor creation

#### 3. Main Page (`page.tsx`)
- **Purpose**: Main dashboard for investor management
- **Features**:
  - Investor list with filtering and search
  - Statistics dashboard
  - Communication tracking
  - Quick actions (contact, schedule meetings)

### API Service Layer

#### InvestorService (`src/lib/api/investors.ts`)
The service layer provides a clean abstraction over the raw API calls:

```typescript
class InvestorService {
  // Get all investors with filtering
  async getInvestors(filters: InvestorFilters): Promise<InvestorResponse>
  
  // Get single investor
  async getInvestor(id: string): Promise<{ success: boolean; investor: Investor }>
  
  // Create new investor
  async createInvestor(data: CreateInvestorData): Promise<{ success: boolean; investor: Investor; message: string }>
  
  // Update investor
  async updateInvestor(data: UpdateInvestorData): Promise<{ success: boolean; investor: Investor; message: string }>
  
  // Delete investor
  async deleteInvestor(id: string): Promise<{ success: boolean; message: string }>
  
  // Get communications
  async getCommunications(filters): Promise<CommunicationResponse>
  
  // Create communication
  async createCommunication(data: CreateCommunicationData): Promise<{ success: boolean; communication: InvestorCommunication; message: string }>
  
  // Data transformation helpers
  transformToApiFormat(data: any): CreateInvestorData | UpdateInvestorData
  transformFromApiFormat(investor: Investor): any
}
```

## Usage Examples

### Creating a New Investor
```typescript
import { investorService } from '@/lib/api/investors';

const newInvestor = await investorService.createInvestor({
  name: "Tech Ventures LLC",
  type: "VENTURE_CAPITAL",
  investment: 5000000,
  stake: 15.5,
  email: "contact@techventures.com",
  primaryContact: "John Smith",
  headquarters: "San Francisco, CA",
  investmentFocus: ["Technology", "AI", "Fintech"],
  riskProfile: "MEDIUM"
});
```

### Fetching Filtered Investors
```typescript
const investors = await investorService.getInvestors({
  search: "venture",
  type: "VENTURE_CAPITAL",
  status: "ACTIVE",
  page: 1,
  limit: 10
});
```

### Creating a Communication
```typescript
const communication = await investorService.createCommunication({
  investorId: "investor-id",
  investorName: "Tech Ventures LLC",
  type: "EMAIL",
  subject: "Q3 Performance Update",
  content: "Quarterly performance metrics...",
  priority: "HIGH"
});
```

## Database Migration

To set up the database schema:

1. Ensure your `.env` file has the correct `DATABASE_URL`
2. Run: `npx prisma generate`
3. Run: `npx prisma db push` (for development)
4. Or create a migration: `npx prisma migrate dev --name add-investor-system`

## Error Handling

The API implements comprehensive error handling:
- **Validation errors**: Uses Zod for request validation
- **Duplicate detection**: Prevents duplicate email addresses
- **Database errors**: Proper error logging and user-friendly messages
- **Network errors**: Graceful degradation in the frontend

## Security Considerations

1. **Data validation**: All inputs are validated using Zod schemas
2. **Email uniqueness**: Prevents duplicate investor emails
3. **Cascade deletes**: Communications are deleted when investors are removed
4. **Input sanitization**: Automatic through Prisma ORM

## Performance Optimizations

1. **Pagination**: All list endpoints support pagination
2. **Selective loading**: Only necessary fields are fetched
3. **Efficient queries**: Uses Prisma's optimized query engine
4. **Index optimization**: Database indexes on frequently queried fields

## Future Enhancements

1. **Document management**: Add file upload capabilities for investor documents
2. **Notification system**: Real-time notifications for important events
3. **Advanced analytics**: More sophisticated performance tracking
4. **Integration**: Connect with external financial data providers
5. **Audit trail**: Track all changes to investor data

## Environment Variables

Required environment variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

## Testing

The system includes comprehensive error handling and validation. For testing:

1. **Unit tests**: Test individual functions in the API service
2. **Integration tests**: Test API endpoints with a test database
3. **Component tests**: Test React components with mock data
4. **E2E tests**: Full user workflow testing

## Troubleshooting

Common issues and solutions:

1. **Prisma client not generated**: Run `npx prisma generate`
2. **Database connection errors**: Check `DATABASE_URL` in `.env`
3. **Type errors**: Ensure TypeScript compilation is successful
4. **Validation errors**: Check API request payloads match expected schemas 