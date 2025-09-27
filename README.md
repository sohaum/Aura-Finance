# AuraFinance

A modern, full-stack expense tracking application built with Next.js 14, featuring smart categorization, analytics, and a beautiful glassmorphism UI design.

## ✨ Features

### Core Functionality
- **Multi-Authentication System**: Google OAuth + Email/Password authentication
- **Expense Management**: Add, categorize, and track expenses with detailed metadata
- **Smart Categories**: 12 predefined categories with enum-based validation
- **Payment Methods**: Support for Cash, Credit Card, Debit Card, Digital Wallet, Bank Transfer
- **Rich Metadata**: Location, notes, tags, and recurring expense support

### Dashboard & Analytics
- **Interactive Dashboard**: Real-time expense overview with time-based greetings
- **Visual Analytics**: Interactive pie charts, bar charts, and trend analysis
- **Gamification**: Progress tracking, achievement levels, and monthly goals
- **Responsive Charts**: Built with Recharts for smooth interactions
- **Date Range Analysis**: Weekly, monthly, and custom period insights

### User Experience
- **Glassmorphism Design**: Modern UI with backdrop blur and transparency effects
- **Sticky Sidebar**: Fixed navigation with smooth scrolling content area
- **Progressive Enhancement**: Contextual tips and onboarding for new users
- **Micro-animations**: Framer Motion powered transitions and hover effects
- **Mobile Responsive**: Optimized for all device sizes

### AI Insights (Planned)
- **Personalized Recommendations**: Spending pattern analysis
- **Budget Suggestions**: AI-powered financial advice
- **Smart Categorization**: Automatic expense categorization
- **Trend Predictions**: Future spending forecasts

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google Provider
- **Password Hashing**: bcryptjs

### Infrastructure
- **Deployment**: Vercel (recommended)
- **Database**: PostgreSQL (Vercel Postgres, Railway, or Supabase)
- **Environment**: Environment variables for configuration

## 🛠️ Installation

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
PostgreSQL database
```

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env.local` file in the root directory:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Integration (Optional - Currently using fallback)
GEMINI_API_KEY="your-gemini-api-key"  # Not implemented due to cost constraints
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Optional: Seed with demo data
npx prisma db seed
```

5. **Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📊 Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  emailVerified DateTime?
  image         String?
  expenses      Expense[]
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Expense {
  id            String         @id @default(cuid())
  title         String
  amount        Float
  category      Category       @default(OTHER)
  date          DateTime
  paymentMethod PaymentMethod?
  notes         String?
  location      String?
  isRecurring   Boolean        @default(false)
  tags          String[]
  userId        String
  user          User           @relation(fields: [userId], references: [id])
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

enum Category {
  FOOD, TRANSPORTATION, SHOPPING, ENTERTAINMENT,
  BILLS, HEALTHCARE, EDUCATION, TRAVEL,
  GROCERIES, FITNESS, SUBSCRIPTIONS, OTHER
}

enum PaymentMethod {
  CASH, CREDIT_CARD, DEBIT_CARD,
  DIGITAL_WALLET, BANK_TRANSFER
}
```

## 🎨 UI Components

### Key Components
- **Dashboard**: Enhanced with gamification and progress tracking
- **Expense Form**: Multi-step form with real-time preview
- **Analytics Page**: Interactive charts and AI insights placeholder
- **Authentication**: Modern glassmorphism login/signup forms
- **Sidebar**: Sticky navigation with user profile

### Design System
- **Color Palette**: Blue/Purple gradients with category-specific colors
- **Typography**: Inter font with gradient text effects
- **Spacing**: Consistent 4px grid system
- **Shadows**: Multi-layered shadow system for depth

## 🔌 API Endpoints

```bash
# Authentication
POST /api/auth/register          # User registration
GET  /api/auth/signin           # Sign in page
POST /api/auth/callback/google  # Google OAuth callback

# Expenses
GET    /api/expenses            # Get user expenses
POST   /api/expenses/create     # Create new expense
PUT    /api/expenses/[id]       # Update expense
DELETE /api/expenses/[id]       # Delete expense

# AI Insights (Placeholder)
POST   /api/ai-insights         # Generate AI recommendations
```

## ⚠️ Known Limitations

### Current Constraints
- **AI Features**: Due to monetary limitations, Gemini/GPT API integration uses fallback text responses instead of real AI analysis
- **Real-time Sync**: No real-time updates between multiple sessions
- **Export Features**: PDF/CSV export not yet implemented
- **Mobile App**: Web-only, no native mobile application
- **Offline Support**: No offline functionality or PWA features

### Cost-Related Limitations
- **AI Insights**: Planned Gemini API integration postponed due to usage costs
- **Advanced Analytics**: Some premium chart types not implemented
- **Email Notifications**: No email service integration (SendGrid, etc.)
- **File Uploads**: Receipt image upload not implemented

## 🚧 Roadmap

### Phase 1 (Current)
- [x] Basic expense tracking
- [x] User authentication
- [x] Dashboard analytics
- [x] Responsive design

### Phase 2 (Planned)
- [ ] Real AI integration (when budget allows)
- [ ] Advanced filtering and search
- [ ] Data export functionality
- [ ] Recurring expense automation
- [ ] Budget setting and alerts

### Phase 3 (Future)
- [ ] Mobile application (React Native)
- [ ] Receipt scanning with OCR
- [ ] Multi-currency support
- [ ] Collaborative expense tracking
- [ ] Advanced reporting

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👥 Author

**Your Name**
- GitHub: [@sohaum](https://github.com/sohaum)
- LinkedIn: [Sohaum Ghosh](https://www.linkedin.com/in/sohaum-ghosh-909966251/)
- Email: sohaumghosh@gmail.com

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Lucide](https://lucide.dev/) for the icon set
- [Vercel](https://vercel.com/) for hosting and deployment
- [Prisma](https://prisma.io/) for the excellent ORM
- [NextAuth.js](https://next-auth.js.org/) for authentication

## 📞 Support

If you encounter any issues or have questions:
- Create an [Issue](https://github.com/sohaum/Expense-Tracker/issues)
- Check the [Documentation](https://github.com/sohaum/Expense-Tracker/wiki)
- Join our [Discussions](https://github.com/sohaum/Expense-Tracker/discussions)

---

⭐ **Star this repository if you found it helpful!**
