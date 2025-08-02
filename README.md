# AI Visibility Platform 🤖

> Track your brand visibility in AI search results and get actionable insights to improve your presence across ChatGPT, Perplexity, and other AI platforms.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Features

### ✅ Core Functionality
- **User Authentication** - Secure registration and login system
- **Prompt Management** - Create, edit, and organize monitoring prompts
- **AI Monitoring** - Real-time brand mention detection in AI responses
- **Results Dashboard** - Comprehensive analytics and insights
- **Brand Analysis** - Track when and how your brand appears in AI outputs
- **Competitor Tracking** - Monitor competitor mentions alongside your brand

### 🛠️ Technical Features
- **Modern Stack** - Built with Next.js 14, TypeScript, and Tailwind CSS
- **Database** - SQLite with Prisma ORM for development
- **Authentication** - NextAuth.js with secure session management
- **AI Integration** - OpenAI API for prompt testing and analysis
- **Responsive Design** - Mobile-first UI with shadcn/ui components
- **Type Safety** - Full TypeScript implementation
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/omarionnn/betterSEO.git
cd betterSEO
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Create and seed database
npm run db:push
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application!

## 📖 Usage Guide

### Getting Started
1. **Sign Up** - Create an account with your company information
2. **Add Prompts** - Create prompts that might mention your brand
3. **Run Checks** - Click "Check Now" to test prompts with AI
4. **View Results** - Analyze your brand visibility in the results dashboard

### Prompt Categories
- **Product** - Questions about products in your industry
- **Service** - Service-related queries
- **Comparison** - Competitive comparison prompts
- **How-to** - Instructional queries where your brand might appear

### Priority Levels
- **High** - Critical prompts for your core business
- **Medium** - Important but not critical prompts
- **Low** - Nice-to-have monitoring prompts

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main application pages
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/                # shadcn/ui components
│   └── dashboard/         # Dashboard-specific components
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   └── ai-monitoring.ts  # AI integration logic
└── types/                # TypeScript type definitions
```

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler
- `npm test` - Run Jest tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema
- `npm run db:migrate` - Run database migrations

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible components
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Server-side API
- **Prisma** - Type-safe ORM
- **SQLite** - Development database
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing

### AI & External APIs
- **OpenAI API** - GPT integration for monitoring
- **Custom AI Analysis** - Brand and competitor detection

### Development
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **ESLint** - Code linting

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
OPENAI_API_KEY="your-openai-api-key"
```

## 🤝 Contributing

I welcome contributions! Here's how to get started:

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 API Documentation

### Authentication
All API routes require authentication via NextAuth session.

### Endpoints
- `GET /api/prompts` - Get user's prompts
- `POST /api/prompts` - Create new prompt
- `PUT /api/prompts/[id]` - Update prompt
- `DELETE /api/prompts/[id]` - Delete prompt
- `POST /api/prompts/[id]/check` - Run AI check on prompt
- `GET /api/results` - Get monitoring results
- `POST /api/auth/register` - User registration

## 🔒 Security

- Passwords are hashed using bcryptjs
- All API routes are protected with authentication
- SQL injection protection via Prisma ORM
- XSS protection via React's built-in sanitization
- CSRF protection via NextAuth

## 📊 Roadmap

### Phase 1 - MVP (Current)
- ✅ User authentication and company setup
- ✅ Prompt management system
- ✅ OpenAI integration and monitoring
- ✅ Results dashboard
- ✅ Basic competitor tracking

### Phase 2 - Enhanced Analytics
- [ ] Advanced analytics and reporting
- [ ] Trend analysis and insights
- [ ] Export functionality (PDF, CSV)
- [ ] Email notifications and alerts

### Phase 3 - Multi-Platform
- [ ] Multiple AI platform support (Perplexity, Claude, etc.)
- [ ] Automated monitoring schedules
- [ ] Team collaboration features
- [ ] API for third-party integrations

### Phase 4 - AI-Powered Insights
- [ ] Content recommendations
- [ ] SEO optimization suggestions
- [ ] Competitive intelligence
- [ ] Automated reporting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Prisma](https://prisma.io/) - Next-generation ORM
- [OpenAI](https://openai.com/) - AI API for monitoring

---

Built with ❤️ for better AI visibility
