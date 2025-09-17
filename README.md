Sign in using the demo account:
Email: demo@example.com
Password: demo1234

# Core dependencies
npm install @radix-ui/react-* # for shadcn components
npm install lucide-react framer-motion
npm install recharts date-fns lodash
npm install react-hook-form

# Database (choose one)
npm install prisma @prisma/client # for PostgreSQL/MySQL
# OR
npm install mongodb mongoose # for MongoDB

# Authentication (choose one)
npm install next-auth # for NextAuth.js
# OR
npm install @clerk/nextjs # for Clerk

# AI Integration
npm install openai # for OpenAI API

# Initialize database
npx prisma generate
npx prisma db push

# Run development server
npm run dev

npx shadcn-ui@latest init
npx shadcn-ui@latest add card button input label textarea select tabs badge sidebar

npx shadcn-ui@latest add button card input label textarea select tabs badge avatar popover calendar progress skeleton dialog dropdown-menu hover-card separator toast