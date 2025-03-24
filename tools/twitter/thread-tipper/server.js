import express from 'express';
import cors from 'cors';
import { pool, initDb } from './db.js';
import { getThreadTweets } from './twitterService.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Get thread tweets
app.get('/thread/:threadId', async (req, res) => {
  const { threadId } = req.params;

  try {
    // Check if thread exists in database
    const dbResult = await pool.query(
      'SELECT tweets FROM twitter_threads WHERE thread_id = $1',
      [threadId]
    );

    if (dbResult.rows.length > 0) {
      return res.json(dbResult.rows[0].tweets);
    }

    // If not in database, fetch from Twitter API
    const tweets = await getThreadTweets(threadId);

    // Store in database
    await pool.query(
      'INSERT INTO twitter_threads (thread_id, tweets) VALUES ($1, $2) ON CONFLICT (thread_id) DO UPDATE SET tweets = $2, updated_at = CURRENT_TIMESTAMP',
      [threadId, JSON.stringify(tweets)]
    );

    res.json(tweets);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to fetch thread tweets' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 