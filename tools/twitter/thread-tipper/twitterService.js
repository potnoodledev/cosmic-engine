import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

export const getThreadTweets = async (threadId) => {
  try {
    // First get the conversation ID from the tweet ID
    const tweet = await client.v2.singleTweet(threadId, {
      'tweet.fields': ['conversation_id', 'author_id', 'created_at'],
    });

    if (!tweet.data) {
      throw new Error('Tweet not found');
    }

    // Then search for all tweets in the conversation
    const tweets = await client.v2.search(`conversation_id:${tweet.data.conversation_id}`, {
      'tweet.fields': ['created_at', 'author_id', 'conversation_id', 'in_reply_to_user_id'],
      max_results: 100,
    });

    return tweets.data;
  } catch (error) {
    console.error('Error fetching thread tweets:', error);
    throw error;
  }
}; 