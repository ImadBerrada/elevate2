# 🏢 CompanyHub - Premium Company Management Dashboard

A modern, high-tech dashboard for managing companies built with Next.js 14, TypeScript, and a beautiful light blue and white theme.

![Dashboard Preview](https://img.shields.io/badge/Status-Ready%20for%20Production-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8)

## ✨ Features

- **🎨 Modern UI/UX Design** - Premium light blue and white theme with smooth animations
- **📱 Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices
- **⚡ High Performance** - Built with Next.js 14 App Router for optimal performance
- **🎭 Smooth Animations** - Powered by Framer Motion for delightful user interactions
- **🧩 Component Library** - Built with shadcn/ui for consistent, accessible components
- **🔍 Advanced Search** - Real-time company search functionality
- **📊 Analytics Dashboard** - Beautiful charts and statistics overview
- **🔔 Real-time Notifications** - Stay updated with latest activities
- **👥 User Management** - Comprehensive user and company management
- **🌙 Dark Mode Ready** - Built-in dark mode support

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14 | React framework with App Router |
| **TypeScript** | 5 | Type-safe development |
| **Tailwind CSS** | 4 | Utility-first CSS framework |
| **shadcn/ui** | Latest | Modern component library |
| **Framer Motion** | 11 | Animation library |
| **Lucide React** | Latest | Beautiful icons |
| **React Hook Form** | Latest | Form management |
| **Resend** | Latest | Email service integration |
| **Geist Font** | Latest | Modern typography |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd company-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

## 🎨 Design System

### Color Palette

The dashboard uses a sophisticated light blue and white theme:

- **Primary**: Light blue (`oklch(0.55 0.15 220)`)
- **Background**: Pure white with blue tint (`oklch(0.99 0.005 220)`)
- **Cards**: Pure white (`oklch(1 0 0)`)
- **Accents**: Soft light blue (`oklch(0.92 0.03 220)`)
- **Text**: Dark blue-gray (`oklch(0.15 0.02 220)`)

### Typography

- **Primary Font**: Geist Sans - Modern, clean, and highly readable
- **Monospace Font**: Geist Mono - Perfect for code and data display

### Components

All components are built with shadcn/ui and customized for the light blue theme:

- Cards with subtle gradients and hover effects
- Smooth animations and transitions
- Consistent spacing and typography
- Accessible design patterns

## 📁 Project Structure

```
company-dashboard/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles and theme
│   │   ├── layout.tsx           # Root layout with fonts
│   │   └── page.tsx             # Main dashboard page
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   └── hooks/                   # Custom React hooks
├── public/                      # Static assets
├── components.json              # shadcn/ui configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for environment-specific variables:

```env
# Add your environment variables here
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key
```

### Tailwind CSS

The project uses Tailwind CSS v4 with custom theme configuration. The light blue and white theme is defined in `src/app/globals.css`.

### TypeScript

Strict TypeScript configuration is enabled for better code quality and developer experience.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click

### Other Platforms

The project can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful and accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide](https://lucide.dev/) - Beautiful icon library

---

**Built with ❤️ for modern company management**