import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false // Required for some hosted PostgreSQL services
  }
});

// Initialize database tables
const initDb = async () => {
  const client = await pool.connect();
  try {
    // Create threads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS twitter_threads (
        thread_id TEXT PRIMARY KEY,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create tweets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tweets (
        tweet_id TEXT PRIMARY KEY,
        thread_id TEXT REFERENCES twitter_threads(thread_id),
        text TEXT NOT NULL,
        author_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        image_url TEXT,
        tip_status TEXT DEFAULT 'pending',
        tip_amount DECIMAL(10,2),
        tip_timestamp TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for faster thread lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tweets_thread_id ON tweets(thread_id);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
};

export { pool, initDb }; 