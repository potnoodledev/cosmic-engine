import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Helper function to extract image URL from tweet text (fallback method)
const extractImageUrlFromText = (text) => {
  if (!text) return null;
  
  console.log('Extracting URL from text:', text);
  
  // First try to find any URL in the text
  const urlRegex = /https?:\/\/[^\s]+/i;
  const urlMatch = text.match(urlRegex);
  
  if (!urlMatch) {
    console.log('No URL found in text');
    return null;
  }

  const url = urlMatch[0];
  console.log('Found URL:', url);

  // Check if it's a Twitter media URL
  if (url.includes('t.co') || url.includes('twitter.com')) {
    console.log('Found Twitter URL, returning as image URL');
    return url;
  }

  // Check if it's a direct image URL
  const imageUrlRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?/i;
  const imageMatch = url.match(imageUrlRegex);
  
  if (imageMatch) {
    console.log('Found direct image URL');
    return imageMatch[0];
  }

  console.log('No valid image URL found');
  return null;
};

// Helper function to get image URL from media includes
const getImageUrlFromMedia = (tweet, includes) => {
  if (!tweet.attachments?.media_keys?.length || !includes?.media) {
    return null;
  }

  // Find the first media item that matches the tweet's media key
  const mediaItem = includes.media.find(m => 
    tweet.attachments.media_keys.includes(m.media_key)
  );

  if (!mediaItem) {
    return null;
  }

  // For photos, use the url field
  // For animated_gif, use the preview_image_url
  if (mediaItem.type === 'photo') {
    return mediaItem.url;
  } else if (mediaItem.type === 'animated_gif') {
    return mediaItem.preview_image_url;
  }

  return null;
};

export const getThreadTweets = async (threadId) => {
  try {
    console.log('Fetching initial tweet:', threadId);
    
    // First get the conversation ID from the tweet ID
    const initialTweet = await client.v2.singleTweet(threadId, {
      'tweet.fields': ['conversation_id', 'author_id', 'created_at', 'attachments'],
      expansions: ['attachments.media_keys'],
      'media.fields': ['url', 'preview_image_url', 'type', 'media_key'],
    });

    if (!initialTweet.data) {
      throw new Error('Tweet not found');
    }

    console.log('Found conversation ID:', initialTweet.data.conversation_id);

    // Then search for all tweets in the conversation
    const searchQuery = `conversation_id:${initialTweet.data.conversation_id}`;
    console.log('Searching with query:', searchQuery);

    const tweets = await client.v2.search(searchQuery, {
      'tweet.fields': ['created_at', 'author_id', 'conversation_id', 'in_reply_to_user_id', 'attachments'],
      expansions: ['attachments.media_keys'],
      'media.fields': ['url', 'preview_image_url', 'type', 'media_key'],
      max_results: 100,
    });

    console.log('Search response:', JSON.stringify(tweets, null, 2));

    // Access the data through the paginator's _realData property
    const tweetsData = tweets._realData?.data;
    const includes = tweets._realData?.includes;

    // Handle empty results
    if (!tweetsData) {
      console.log('No tweets found in conversation');
      // Process the initial tweet with its own includes
      const initialTweetWithImage = {
        ...initialTweet.data,
        image_url: getImageUrlFromMedia(initialTweet.data, initialTweet.includes) || 
                  extractImageUrlFromText(initialTweet.data.text)
      };
      return [initialTweetWithImage];
    }

    // Ensure we have an array of tweets
    if (!Array.isArray(tweetsData)) {
      console.error('Invalid tweets response structure:', tweets);
      throw new Error('Invalid tweets response structure from Twitter API');
    }

    // Add the original tweet if it's not in the results
    const allTweets = [...tweetsData];
    if (!allTweets.some(t => t.id === initialTweet.data.id)) {
      allTweets.push(initialTweet.data);
    }

    // Process tweets to extract image URLs
    const tweetsWithImages = allTweets.map(tweet => {
      // First try to get image from media includes
      let imageUrl = getImageUrlFromMedia(tweet, includes);
      
      // If no image found in media, try text extraction
      if (!imageUrl) {
        console.log(`No media found for tweet ${tweet.id}, trying text extraction`);
        imageUrl = extractImageUrlFromText(tweet.text);
      }

      console.log(`Tweet ${tweet.id} image URL:`, imageUrl);
      return {
        ...tweet,
        image_url: imageUrl
      };
    });

    // Sort tweets by creation time to maintain thread order
    const sortedTweets = tweetsWithImages.sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    console.log(`Found ${sortedTweets.length} tweets in thread`);
    return sortedTweets;
  } catch (error) {
    console.error('Error fetching thread tweets:', error);
    if (error.data) {
      console.error('Twitter API error details:', error.data);
    }
    throw error;
  }
}; 