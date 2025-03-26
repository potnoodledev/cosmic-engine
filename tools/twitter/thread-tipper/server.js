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

const twitterSenderClient = new TwitterApi({
  appKey: process.env.SENDER_TWITTER_API_KEY,
  appSecret: process.env.SENDER_TWITTER_API_SECRET,
  accessToken: process.env.SENDER_TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.SENDER_TWITTER_ACCESS_SECRET,
});


// Get thread tweets with optional threadId
app.get('/api/thread/:threadId?', async (req, res) => {
  const threadId = req.params.threadId || process.env.THREAD_ID;
  const { refresh } = req.query;

  if (!threadId) {
    return res.status(400).json({ error: 'No thread ID provided and no default thread ID configured' });
  }

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

// Checks whether text is a game mechanic and image contains noodles
app.post('/tweet/:tweetId/analyze', async (req, res) => {
  try {
    const { tweetId } = req.params;
    
    // Get tweet data from database
    const dbResult = await pool.query(
      'SELECT text, image_url FROM tweets WHERE tweet_id = $1',
      [tweetId]
    );

    if (dbResult.rows.length === 0) {
      return res.status(404).json({ error: "Tweet not found in database" });
    }

    const { text, image_url } = dbResult.rows[0];
    
    // remove any urls from the text
    const textWithoutUrls = text.replace(/https?:\/\/[^\s]+/g, '');
    
    // Check if text is a game mechanic
    const mechanicResponse = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `As a game design expert, analyze if the following text could be a game mechanic. Respond with 'Yes' or 'No':\n\n${textWithoutUrls}`
    });

    // Check if image contains noodles
    const analysisResponse = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", 
                text: `As a game design expert, analyze if the following text could be a game concept.\n\n${textWithoutUrls}\n\nAfterwards, analyze if the image contains noodles. Respond with the following JSON, do not include any other text:

                r:
                {
                  "isGameMechanic": "false" if not a concept or "true" if it is,
                  "conceptDetails": why mechanic doesn't qualify as a concept or summarized game concept. Should be 10 words or less,
                  "imageDescription": 3 words or less describing the image,
                  "isNoodle": "true" if it contains noodles or "false" if it doesn't
                  "tagged": "true" if the text contains $NOODS
                }
                `
            },
            {
              type: "input_image",
              image_url: image_url
            },
          ],
        },
      ],
    });

    const result = analysisResponse.output_text
    
    // returned value contains ```json and ```, so we need to remove them
    const resultWithoutJson = result.replace("```json", "").replace("```", "");

    // Parse the JSON result
    const analysisData = JSON.parse(resultWithoutJson);

    // Update the database with analysis results
    await pool.query(
      `UPDATE tweets 
       SET is_game_mechanic = $1,
           concept_details = $2,
           image_description = $3,
           is_noodle = $4,
           is_tagged = $5,
           analysis_timestamp = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE tweet_id = $6`,
      [
        analysisData.isGameMechanic === "true",
        analysisData.conceptDetails,
        analysisData.imageDescription,
        analysisData.isNoodle === "true",
        analysisData.tagged === "true",
        tweetId
      ]
    );

    try {
        // First send "analyzing..." as a reply
        await twitterSenderClient.v2.tweet({
            text: "analyzing...",
            reply: {
            in_reply_to_tweet_id: tweetId
            }
        });
        
        // Send tweet if all conditions are met
        if (analysisData.isGameMechanic === "true" && 
            analysisData.isNoodle === "true" && 
            analysisData.tagged === "true") {

            // Then send the "analyzed" tweet
            await twitterSenderClient.v2.tweet("analyzed");
        }
    } catch (tweetError) {
    console.error('Error sending tweet:', tweetError);
    }
    
    
    res.json(analysisData);

  } catch (error) {
    console.error('Error in analysis:', error);
    res.status(500).json({ error: "Analysis failed" });
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