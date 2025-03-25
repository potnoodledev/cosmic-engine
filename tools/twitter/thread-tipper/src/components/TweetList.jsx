import React, { useState } from 'react';

function TweetList({ tweets }) {
  const [loadingTweetId, setLoadingTweetId] = useState(null);

  if (!tweets.length) {
    return null;
  }
  
  const handleTip = async (tweet) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoadingTweetId(tweet.id);

    try {
      // Call the new combined analyze endpoint
      const analyzeResponse = await fetch(`${apiUrl}/tweet/${tweet.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!analyzeResponse.ok) {
        throw new Error('Analysis failed');
      }

      const result = await analyzeResponse.json();
      
      // Show alert with the analysis results
      alert(result);

      if (result.isGameMechanic && result.isNoodle) {
        // Proceed with tipping
        console.log("trying to tweet");
        try {
          const bankrBotResponse = await fetch(`${apiUrl}/tweet/${tweet.id}/tweet-bankrbot`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log("success", bankrBotResponse);
        } catch (error) {
          console.error('Error posting tweet:', error);
        }
      }
    } catch (error) {
      console.error('Error processing tip:', error);
      alert('Error analyzing tweet. Please try again.');
    } finally {
      setLoadingTweetId(null);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      {tweets.map((tweet, index) => (
        <div 
          key={tweet.id} 
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-blue-600">@{tweet.author_id}</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(tweet.created_at).toLocaleString()}
                  </span>
                </div>
                <span className="text-sm text-gray-400">Tweet {index + 1}</span>
              </div>
              <p className="text-gray-800 text-lg leading-relaxed">{tweet.text}</p>
              {tweet.image_url && (
                <div className="mt-4">
                  <img
                    src={tweet.image_url}
                    alt="Tweet attachment"
                    className="rounded-lg max-w-full h-auto shadow-sm"
                  />
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${
                    tweet.tip_status === 'completed' ? 'text-green-600' :
                    tweet.tip_status === 'pending' ? 'text-yellow-600' :
                    tweet.tip_status === 'failed' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {tweet.tip_status || 'Not tipped'}
                  </span>
                </div>
                {tweet.tip_amount && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium text-green-600">${tweet.tip_amount}</span>
                  </div>
                )}
                {tweet.tip_timestamp && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Tipped at:</span>
                    <span className="font-medium text-gray-600">
                      {new Date(tweet.tip_timestamp).toLocaleString()}
                    </span>
                  </div>
                )}
                {tweet.updated_at && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Last updated:</span>
                    <span className="font-medium text-gray-600">
                      {new Date(tweet.updated_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleTip(tweet)}
                  disabled={tweet.tip_status === 'completed' || !tweet.image_url || loadingTweetId === tweet.id}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    tweet.tip_status === 'completed' || !tweet.image_url || loadingTweetId === tweet.id
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loadingTweetId === tweet.id ? 'Analyzing...' :
                   tweet.tip_status === 'completed' ? 'Tipped' :
                   tweet.tip_status === 'pending' ? 'Processing' :
                   !tweet.image_url ? 'No Image' : 'Analyze'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TweetList; 