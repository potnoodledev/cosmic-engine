import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, initDb } from './db.js';
import { getThreadTweets } from './twitterService.js';
import OpenAI from "openai";
import { TwitterApi } from 'twitter-api-v2';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const URL = process.env.URL || 'http://localhost:3003';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});


// Get thread tweets
app.get('/api/thread/:threadId', async (req, res) => {
  const { threadId } = req.params;
  const { refresh } = req.query;

  try {
    // If refresh is requested, fetch new tweets
    if (refresh === 'true') {
      const newTweets = await getThreadTweets(threadId);

      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Update or insert thread
        await client.query(
          'INSERT INTO twitter_threads (thread_id) VALUES ($1) ON CONFLICT (thread_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP',
          [threadId]
        );

        // Delete existing tweets for this thread
        await client.query('DELETE FROM tweets WHERE thread_id = $1', [threadId]);

        // Insert new tweets
        for (const tweet of newTweets) {
          await client.query(
            `INSERT INTO tweets (
              tweet_id, thread_id, text, author_id, created_at, image_url
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              tweet.id,
              threadId,
              tweet.text,
              tweet.author_id,
              tweet.created_at,
              tweet.image_url || null // Assuming first media is the image
            ]
          );
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      return res.json({
        tweets: newTweets,
        lastRefreshed: {
          timestamp: new Date().toISOString(),
          minutesAgo: 0,
          humanReadable: 'just now'
        },
        refreshed: true
      });
    }

    // Check if thread exists in database
    const dbResult = await pool.query(
      `SELECT t.*, th.updated_at as thread_updated_at 
       FROM tweets t 
       JOIN twitter_threads th ON t.thread_id = th.thread_id 
       WHERE t.thread_id = $1 
       ORDER BY t.created_at ASC`,
      [threadId]
    );

    if (dbResult.rows.length > 0) {
      const threadUpdatedAt = dbResult.rows[0].thread_updated_at;
      const lastRefreshed = new Date(threadUpdatedAt);
      const now = new Date();
      const timeDiff = now - lastRefreshed;
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      const tweets = dbResult.rows.map(row => ({
        id: row.tweet_id,
        text: row.text,
        author_id: row.author_id,
        created_at: row.created_at,
        image_url: row.image_url,
        tip_status: row.tip_status,
        tip_amount: row.tip_amount,
        tip_timestamp: row.tip_timestamp
      }));

      return res.json({
        tweets,
        lastRefreshed: {
          timestamp: threadUpdatedAt,
          minutesAgo,
          humanReadable: minutesAgo < 1 
            ? 'just now' 
            : minutesAgo < 60 
              ? `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`
              : `${Math.floor(minutesAgo / 60)} hour${Math.floor(minutesAgo / 60) === 1 ? '' : 's'} ago`
        },
        refreshed: false
      });
    }

    // If not in database, fetch from Twitter API
    const tweets = await getThreadTweets(threadId);

    // Store in database using transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert thread
      await client.query(
        'INSERT INTO twitter_threads (thread_id) VALUES ($1)',
        [threadId]
      );

      // Insert tweets
      for (const tweet of tweets) {
        await client.query(
          `INSERT INTO tweets (
            tweet_id, thread_id, text, author_id, created_at, image_url
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            tweet.id,
            threadId,
            tweet.text,
            tweet.author_id,
            tweet.created_at,
            tweet.attachments?.media_keys?.[0] || null
          ]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    res.json({
      tweets,
      lastRefreshed: {
        timestamp: new Date().toISOString(),
        minutesAgo: 0,
        humanReadable: 'just now'
      },
      refreshed: true
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to fetch thread tweets' });
  }
});

// Checks whether text is a game mechanic
app.post('/tweet/is-game-mechanic', async (req, res) => {
  try {
    const { tweetText } = req.body;
    const textResponse = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `As a game design expert, analyze if the following text could be a game mechanic. Respond with 'Yes' or 'No':\n\n${tweetText}`
    });

    const result = textResponse.output_text === 'Yes';
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Analysis failed" });
  }
})

// Checks whether image is a noodle
app.post('/tweet/is-noodle', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const imageResponse = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
          {
              role: "user",
              content: [
                  { type: "input_text", text: "Does this image contain noodles? Respond with 'Yes' or 'No'" },
                  {
                      type: "input_image",
                      image_url: imageUrl
                  },
              ],
          },
      ],
    });
    
    const result = imageResponse.output_text === 'Yes';
    
    res.json(result );
  } catch (error) {
    res.status(500).json({ error: "Image analysis failed"})
  }
})

app.post('/tweet/:tweetId/tweet-bankrbot', async (req, res) => {
  // TODO: Please continue here to tag. Just need updated API key that allows writing
  try {
    const tweetText = "Hello Twitter! 👋 @LemonCat63";
    const response = await twitterClient.v2.tweet(tweetText);
    res.json(response);
  } catch (error) {
    console.error("Error posting tweet:", error);
    res.status(500).json({ error: "Tweet Failed"})
  }
})

// Update tip status for a tweet
app.post('/tweet/:tweetId/tip', async (req, res) => {
  const { tweetId } = req.params;
  const { amount, status } = req.body;

  try {
    await pool.query(
      `UPDATE tweets 
       SET tip_status = $1, 
           tip_amount = $2, 
           tip_timestamp = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE tweet_id = $3`,
      [status, amount, tweetId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating tip status:', error);
    res.status(500).json({ error: 'Failed to update tip status' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve index.html for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 