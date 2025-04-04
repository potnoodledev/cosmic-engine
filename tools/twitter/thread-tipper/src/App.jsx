import React, { useState, useEffect } from 'react';
import TweetList from './components/TweetList';

function App() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchTweets = async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/thread`);
      if (refresh) {
        url.searchParams.append('refresh', 'true');
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch tweets');
      }
      const data = await response.json();
      console.log('API Response:', data);
      setTweets(data.tweets);
      console.log('Setting lastUpdatedAt to:', data.lastRefreshed?.timestamp);
      setLastUpdatedAt(data.lastRefreshed?.timestamp);
      setLastRefreshed(data.lastRefreshed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTweetData = (tweetId, newData) => {
    setTweets(prevTweets => 
      prevTweets.map(tweet => 
        tweet.id === tweetId ? { ...tweet, ...newData, analysis_timestamp: new Date().toISOString() } : tweet
      )
    );
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">Twitter Thread Viewer</h1>
                {loading && <div className="text-center">Loading...</div>}
                {error && <div className="text-red-500 text-center">{error}</div>}
                <TweetList 
                  tweets={tweets} 
                  onRefresh={() => fetchTweets(true)}
                  lastUpdatedAt={lastUpdatedAt}
                  lastRefreshed={lastRefreshed}
                  onUpdateTweet={updateTweetData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 