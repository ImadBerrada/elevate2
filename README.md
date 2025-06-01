# 🚀 ELEVATE Investment Group Dashboard

A premium, high-tech company dashboard built with Next.js 14, TypeScript, and modern web technologies. Features a sophisticated Business Network management system with glassmorphism design and premium animations.

![ELEVATE Dashboard](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)

## ✨ Features

### 🏢 Business Network Management
- **Dashboard**: Real-time network analytics and statistics
- **Activity**: Activity feed with points system and engagement tracking
- **Contacts**: Professional contact directory with employer relationships
- **Business**: Partnership management and deal pipeline
- **Employers**: Employer relationship management with bilingual support

### 🎨 Design & UI
- **Glassmorphism Design**: Modern glass-like effects with OKLCH color space
- **Premium Animations**: Smooth Framer Motion animations throughout
- **Responsive Layout**: Mobile-first design with collapsible sidebar
- **Light Blue Theme**: Professional light blue and white color scheme

### 🔧 Technical Features
- **Full-Stack**: Complete frontend and backend implementation
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth system with bcrypt
- **Real-time Updates**: Live data fetching and updates
- **Form Validation**: Zod schema validation
- **Search & Filtering**: Advanced search capabilities
- **File Upload**: Image upload functionality

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Recharts** - Chart and data visualization

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database (Neon)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Schema validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ImadBerrada/Elevate.git
   cd Elevate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your_neon_database_url"
   
   # JWT Secret
   JWT_SECRET="your_jwt_secret_key"
   
   # Next.js
   NEXTAUTH_SECRET="your_nextauth_secret"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── activities/    # Activity management
│   │   ├── contacts/      # Contact management
│   │   ├── businesses/    # Business management
│   │   ├── employers/     # Employer management
│   │   └── stats/         # Statistics endpoint
│   ├── elevate/           # Main dashboard pages
│   │   └── business-network/  # Business Network section
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility libraries
│   ├── api-client.ts     # API client
│   ├── auth.ts           # Authentication utilities
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # General utilities
└── prisma/               # Database schema
    └── schema.prisma     # Prisma schema
```

## 🔐 Authentication

The application includes a complete authentication system:

- **Registration**: Create new user accounts
- **Login**: JWT-based authentication
- **Protected Routes**: Middleware protection for API routes
- **Password Security**: bcrypt hashing

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Business Network
- `GET/POST /api/activities` - Activity management
- `GET/POST /api/contacts` - Contact management
- `GET/POST /api/businesses` - Business management
- `GET/POST /api/employers` - Employer management
- `GET /api/stats` - Dashboard statistics

## 🎯 Business Network Features

### Dashboard
- Network overview with real-time statistics
- Recent connections and meetings
- Network analytics and growth metrics

### Activity Management
- Create activities with point values
- Activity feed with timestamps
- Points system for different activity types
- Search and filtering capabilities

### Contact Management
- Professional contact directory
- Employer relationship linking
- Star rating system (1-3 stars)
- Comprehensive contact information

### Business Management
- Partnership tracking
- Deal pipeline management
- Company profiles and ratings
- Status indicators

### Employer Management
- Bilingual support (Arabic/English)
- Industry categorization
- Partnership status tracking
- Creation date tracking

## 🎨 Design System

### Colors (OKLCH)
- **Primary**: Light blue variations
- **Background**: White with glass effects
- **Accents**: Refined borders and shadows

### Typography
- **Font**: Inter (system font fallback)
- **Weights**: 400, 500, 600, 700

### Components
- **Glassmorphism**: Backdrop blur effects
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first approach

## 📊 Database Schema

The application uses Prisma with the following main models:

- **User**: Authentication and user management
- **Activity**: Business activities with points
- **Contact**: Professional contacts with employer links
- **Business**: Business partnerships and deals
- **Employer**: Employer information with bilingual support

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Imad Berrada**
- Email: berimad02@gmail.com
- GitHub: [@ImadBerrada](https://github.com/ImadBerrada)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Prisma](https://www.prisma.io/) - Database toolkit

---

**ELEVATE Investment Group Dashboard** - Elevating business networks to new heights 🚀