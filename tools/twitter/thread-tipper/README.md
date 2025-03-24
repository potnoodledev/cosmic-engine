# Thread Tipper

A web application that displays Twitter threads with caching in PostgreSQL.

## Features

- Fetches Twitter threads using the Twitter API
- Caches thread data in PostgreSQL
- Serves cached data for subsequent requests
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Twitter API credentials

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a PostgreSQL database named `thread_tipper`
4. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
5. Update the `.env` file with your:
   - Database credentials
   - Twitter API credentials
   - Server port (optional)

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Get Thread Tweets
```
GET /thread/:threadId
```

Returns the tweets in a thread. If the thread is not cached, it will fetch from Twitter API and cache the results.

### Health Check
```
GET /health
```

Returns the server status.

## Database Schema

The application uses a single table `twitter_threads` with the following structure:
- `thread_id` (TEXT, PRIMARY KEY)
- `tweets` (JSONB)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE) 