# University CRM Admin Panel

A production-quality admin panel for managing university student attendance, subjects, and administrators.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: shadcn/ui (Radix UI)
- **Data Fetching**: TanStack Query (React Query)
- **Tables**: TanStack Table (used via shadcn Table)
- **Validation**: Zod
- **Icons**: Lucide React
- **API Client**: Axios with interceptors

## Architecture

- `app/`: Next.js routes and pages
- `components/`: Shared UI components and layout
- `features/`: Feature-specific logic and components
- `services/`: API service definitions
- `lib/`: Utility functions and shared library configurations
- `types/`: TypeScript interfaces and enums
- `hooks/`: Reusable React hooks

## Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add the backend base URL:
    ```env
    NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
    ```
    See `.env.example` for reference.
4.  **Run the development server**:
    ```bash
    npm run dev
    ```
5.  **Open the app**:
    Navigate to `http://localhost:3000`

## Features

- **Authentication**: Secure login with JWT stored in localStorage and injected into requests via Axios interceptors.
- **Student Years**: Dashboard with cards representing different academic years.
- **Subjects**: Filterable and searchable list of subjects per student year.
- **Attendance Management**: Detailed view of students in a subject with aggregated attendance stats and color-coded alerts for high absences.
- **Notifications**: Centralized view for attendance alerts with filtering and "Mark as Seen" functionality.
- **Admin Management**: (Root Only) Interface to register and delete administrative accounts.
- **Matrix View**: Experimental view for academic matrices with Excel export functionality.

## UI/UX

- Professional "official university" style with a neutral palette.
- Responsive layout with a persistent sidebar and top header.
- Loading skeletons for improved perceived performance.
- Toast notifications for feedback on user actions.
- Modal dialogs for detailed information without losing context.
