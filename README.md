# University CRM Admin Panel

A production-quality Admin Panel for University Management, built with Next.js 14, TypeScript, TailwindCSS, and shadcn/ui.

## Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query)
- **State Management**: React Query & React Context
- **Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Client**: [Axios](https://axios-http.com/) with interceptors

## Features

- **Authentication**: JWT-based login with persistent sessions and automatic token injection.
- **RBAC**: Role-based access control. Only root users can access the Admin Management section.
- **Student Years**: Overview of academic years with navigation to subjects.
- **Subjects Management**: Filterable list of subjects for each student year.
- **Attendance Monitoring**: Detailed view of students in a subject with color-coded absence warnings (3-4 yellow, 5-6 orange, 7+ red).
- **Attendance Notifications**: Real-time tracking of new absences with filtering and optimistic "Done" status updates.
- **Admin Management**: (Root Only) Create and delete administrative accounts.
- **Experimental Matrix**: Dynamic grid view for academic programs and years with Excel export capability.

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup

Copy `.env.example` to `.env.local` and fill in the backend API URL:

```bash
cp .env.example .env.local
```

Example `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://api.university.example.com
```

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (shadcn/ui and custom).
- `features/`: Feature-specific components, hooks, and logic.
- `lib/`: Shared utilities (API client, utils).
- `services/`: API service layers with Zod validation.
- `types/`: TypeScript definitions and Zod schemas.
- `hooks/`: Global custom hooks (e.g., `useAuth`).

## Security

- Tokens are stored in `localStorage`.
- All requests to protected endpoints include the `Authorization: Bearer <token>` header via Axios interceptors.
- Route guards prevent unauthorized access to protected pages.
