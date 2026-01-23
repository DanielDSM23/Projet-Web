This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## API Documentation

This project primarily uses Next.js [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) for handling mutations and data updates, in addition to standard NextAuth API routes for authentication.

### Server Actions

Server Actions are defined in the `actions/` directory and handle various functionalities:

*   **`add-step.ts`**: Adds a new step to a specified goal.
*   **`manage-goals.ts`**:
    *   `createGoalAction`: Creates a new user goal.
    *   `updateGoalAction`: Updates an existing goal. This action also handles awarding or deducting XP based on goal completion status.
*   **`manage-habit.ts`**:
    *   `addHabit`: Adds a new habit for a user.
    *   `updateHabit`: Updates an existing habit.
*   **`manage-steps.ts`**:
    *   `updateStep`: Updates details of a specific step (title, deadline).
    *   `toggleStepStatus`: Toggles the completion status of a step, affecting user XP.
    *   `deleteStep`: Deletes a step.
*   **`register.ts`**: Handles new user registration, including password hashing.
*   **`toggle-habit.ts`**: Toggles the completion status of a habit for the current day and adjusts user XP.
*   **`update-profil.ts`**: Allows authenticated users to update their name, email, and password.

### NextAuth API Routes

Authentication is managed using NextAuth.js. The following routes are handled by `app/api/auth/[...nextauth]/route.ts`:

*   `/api/auth/signin`: For user login.
*   `/api/auth/signout`: For user logout.
*   `/api/auth/callback/:provider`: Callback URL after successful authentication with a provider (if any).
*   `/api/auth/session`: Get the current session details.
*   `/api/auth/csrf`: Get the CSRF token.
*   `/api/auth/providers`: Get a list of configured authentication providers.

## Database Schema

The database schema is defined using Prisma in `prisma/schema.prisma`. Below is an overview of the main models:

*   **`User`**: Represents a user with authentication details, experience points (`xp_points`), and level.
    *   Relations: `goals`, `habits`, `badges`.
*   **`Goal`**: Represents a user's goal with title, description, priority, status, and dates.
    *   Relations: `user`, `steps`.
*   **`Step`**: Represents an individual step within a `Goal`, with a title, deadline, and completion status.
    *   Relations: `goal`.
*   **`Habit`**: Represents a user's habit with name, description, category, and frequency.
    *   Relations: `user`, `logs`.
*   **`HabitLog`**: Records daily or weekly completion logs for a `Habit`. Ensures uniqueness per habit per day.
    *   Relations: `habit`.
*   **`Badge`**: Defines achievable badges with name, description, icon, and criteria.
    *   Relations: `users` (through `UserBadge`).
*   **`UserBadge`**: A join table linking `User` and `Badge` to record earned badges.

### Enums

*   **`Priority`**: `low`, `medium`, `high` (for `Goal` priority).
*   **`GoalStatus`**: `active`, `completed`, `abandoned` (for `Goal` status).
*   **`Frequency`**: `daily`, `weekly` (for `Habit` frequency).

## Calculation Algorithms

This project includes algorithms for gamification elements such as progression (XP and leveling) and habit streaks.

*   **`lib/gamification.ts`**:
    *   **XP Constants**: Defines `XP_PER_HABIT` (10), `XP_PER_STEP` (50), and `XP_PER_GOAL` (200) for various activities.
    *   **Leveling System**:
        *   `getXpRequiredForNextLevel(level)`: Calculates the XP needed to reach the next level (`level * 100`).
        *   `calculateNewStats(currentLevel, currentXp, xpDelta)`: A core function that takes current user level and XP, and an XP change (`xpDelta`). It calculates the new level and XP, handling both level-ups and level-downs (though levels won't drop below 1 and XP won't be negative).

*   **`lib/streak.ts`**:
    *   **`calculateStreak(habit)`**: Calculates the current completion streak for a given habit.
        *   **Daily Habits**: Computes consecutive days a daily habit was logged.
        *   **Weekly Habits**: Currently, this function returns 0 for weekly habits, indicating this feature is pending implementation.

## Environment Variables

This project requires the following environment variables. Create a `.env` file in the root directory based on the `.env.example` file.

*   **`DATABASE_URL`**: Connection string for your PostgreSQL database (e.g., `postgresql://user:password@host:port/database?schema=public`).
*   **`NEXTAUTH_SECRET`**: A secret used to encrypt the NextAuth.js session cookie. It should be a long, random string.
*   **`NEXT_PUBLIC_APP_URL`**: (Optional but recommended) The public URL of your application (e.g., `http://localhost:3000` or `https://your-app-domain.com`).