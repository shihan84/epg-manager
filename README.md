# EPG Manager

**Professional Electronic Program Guide Management System**

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Company](https://img.shields.io/badge/Company-Ultimate%20News%20Web%20Media%20Production%20Pvt%20Ltd-blue.svg)](https://itassist.co.in)
[![Website](https://img.shields.io/badge/Website-itassist.co.in-green.svg)](https://itassist.co.in)

## Overview

EPG Manager is a comprehensive Electronic Program Guide (EPG) management system designed for TV channel streamers, distributors, and content creators. It provides an intuitive web-based interface for creating, managing, and distributing EPG data in multiple formats.

## Features

### 🎯 Core Functionality

- **Channel Management** - Create and manage TV channels with logos, descriptions, and streaming URLs
- **Program Management** - Add programs with categories, thumbnails, and metadata
- **Schedule Management** - Create program schedules with flexible timing and repeat options
- **EPG Generation** - Generate EPG files in XMLTV, JSON, and M3U formats
- **Multi-language Support** - Support for 10+ Indian languages and international languages

### 🚀 Advanced Features

- **Bulk Scheduling** - Create daily, weekly, and monthly recurring schedules
- **Schedule Templates** - Pre-built templates for common programming patterns
- **API Access** - RESTful API for integration with external systems
- **Hosted EPG URLs** - Public URLs for EPG distribution
- **User Management** - Role-based access control (Admin/Client)
- **Real-time Statistics** - Dashboard with usage metrics and content health

### 🌍 Internationalization

- **Indian Languages** - Hindi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Marathi, Punjabi, Urdu
- **Category Translation** - Automatic translation of program categories
- **Region Support** - Country-specific content organization

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **State Management**: React Hooks

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd epg-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your configuration:

   ```env
   DATABASE_URL="file:./db/custom.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

4. **Initialize the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Getting Started

1. **Sign Up** - Create a new account or sign in
2. **Create Channels** - Add your TV channels with logos and descriptions
3. **Add Programs** - Create program entries with categories and metadata
4. **Schedule Programs** - Set up program schedules using templates or manual entry
5. **Generate EPG** - Create EPG files in your preferred format
6. **Distribute** - Share hosted EPG URLs with your distributors

### API Usage

The system provides a RESTful API for integration:

```bash
# Get channels
GET /api/channels

# Create a channel
POST /api/channels
{
  "name": "Channel Name",
  "displayName": "Display Name",
  "description": "Channel Description",
  "logoUrl": "https://example.com/logo.png",
  "language": "en",
  "region": "IN"
}

# Generate EPG
POST /api/epg/generate
{
  "channels": ["channel-id-1", "channel-id-2"],
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "format": "xmltv"
}
```

## Project Structure

```
epg-manager/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── management/     # Content management
│   │   └── epg/           # EPG generation
│   ├── components/         # React components
│   ├── lib/               # Utility libraries
│   └── types/             # TypeScript types
├── prisma/                # Database schema
├── public/                # Static assets
└── web/                   # Web icons and assets
```

## Contributing

This is proprietary software owned by Ultimate News Web Media Production Pvt Ltd. For contribution guidelines or licensing inquiries, please contact:

- **Email**: licensing@itassist.co.in
- **Website**: https://itassist.co.in

## Support

For technical support or feature requests:

- **Email**: info@itassist.co.in
- **Website**: https://itassist.co.in

## License

This software is proprietary and confidential. All rights reserved.

**Copyright © 2024 Ultimate News Web Media Production Pvt Ltd**

**EPG Manager™** is a trademark of Ultimate News Web Media Production Pvt Ltd.

## Disclaimer

This software is provided "as is" without warranty of any kind. Ultimate News Web Media Production Pvt Ltd shall not be liable for any damages arising from the use of this software.

---

**Ultimate News Web Media Production Pvt Ltd**  
Website: [itassist.co.in](https://itassist.co.in)  
Email: info@itassist.co.in
