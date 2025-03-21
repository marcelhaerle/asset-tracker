# Company Asset Tracker

A Next.js application for tracking company assets like computers, network equipment, and other hardware. Built with Next.js, Prisma, and SQLite.

## Features

- Track various types of company assets
- Categorize assets by type
- Track asset locations
- Assign assets to employees
- Record maintenance history
- Keep checkout records of equipment
- Secure user authentication

## Database Schema

The application uses Prisma with SQLite to store the following entities:

- **Assets**: Main equipment records with details like serial number, purchase date, status
- **Categories**: Types of assets (laptops, desktops, networking, etc.)
- **Locations**: Where assets are stored or used
- **Employees**: Staff members who can be assigned assets
- **Maintenance Records**: History of repairs and maintenance
- **Checkout Records**: History of asset assignments
- **Users**: Authentication records for system users
- **Sessions**: Encrypted session data for authenticated users

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/asset-tracker.git
cd asset-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Create a .env file with the required variables
cp .env.example .env

# Edit the .env file and set a strong SESSION_SECRET
# You can generate one using:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Set up the database:

```bash
# Create the database and run migrations
npx prisma migrate dev

# Seed the database with initial data
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to view the application

## API Endpoints

- `GET /api/assets` - Get all assets
- `GET /api/categories` - Get all categories

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Type Safety**: TypeScript

## License

MIT
