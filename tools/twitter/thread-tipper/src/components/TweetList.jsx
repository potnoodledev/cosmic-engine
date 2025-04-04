import React, { useState } from 'react';

function TweetList({ tweets, onRefresh, lastUpdatedAt, lastRefreshed, onUpdateTweet }) {
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

      console.log(result);
      
      // Prepare data for parent update
      const updatePayload = {
        is_game_mechanic: result.isGameMechanic === 'true',
        concept_details: result.conceptDetails,
        image_description: result.imageDescription,
        is_noodle: result.isNoodle === 'true',
        is_tagged: result.tagged === 'true',
        // analysis_timestamp will be set in the parent update function
      };

      // Include tip info if it was returned from the API
      if (result.tip_status) {
        updatePayload.tip_status = result.tip_status;
        updatePayload.tip_amount = result.tip_amount;
        updatePayload.tip_timestamp = result.tip_timestamp;
      }

      // Update the tweet state in the parent component
      onUpdateTweet(tweet.id, updatePayload);
      
    } catch (error) {
      console.error('Error processing tip:', error);
      alert('Error analyzing tweet. Please try again.');
    } finally {
      setLoadingTweetId(null);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdatedAt ? (
            <span>
              {new Date(lastUpdatedAt).toLocaleString()} ({lastRefreshed?.humanReadable || 'unknown'})
            </span>
          ) : 'Never'}
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>
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
              {/* Analysis Section */}
              {tweet.analysis_timestamp && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-2">
                  <h4 className="font-medium text-gray-700">Analysis Results:</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Analyzed at:</span>
                    <span className="font-medium">
                      {new Date(tweet.analysis_timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Game Mechanic:</span>
                    <span className={`font-medium ${tweet.is_game_mechanic ? 'text-green-600' : 'text-red-600'}`}>
                      {tweet.is_game_mechanic ? 'Yes' : 'No'}
                    </span>
                    {tweet.concept_details && <span className="text-gray-500 italic">({tweet.concept_details})</span>}
                  </div>
                   <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Image Description:</span>
                    <span className="font-medium text-gray-600">
                        {tweet.image_description || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Contains Noodles:</span>
                    <span className={`font-medium ${tweet.is_noodle ? 'text-green-600' : 'text-red-600'}`}>
                      {tweet.is_noodle ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">Tagged ($NOODS):</span>
                    <span className={`font-medium ${tweet.is_tagged ? 'text-green-600' : 'text-red-600'}`}>
                      {tweet.is_tagged ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              )}
              {/* End Analysis Section */}
              <div className="mt-4 flex justify-end">
                {!tweet.analysis_timestamp && ( // Only show button if not analyzed
                  <button
                    onClick={() => handleTip(tweet)}
                    disabled={!tweet.image_url || loadingTweetId === tweet.id} // Removed tip_status check as analysis is separate
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      !tweet.image_url || loadingTweetId === tweet.id
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loadingTweetId === tweet.id ? 'Analyzing...' :
                     !tweet.image_url ? 'No Image' : 'Analyze'}
                  </button>
                )}
                {tweet.analysis_timestamp && ( // Show status if already analyzed
                   <span className="px-4 py-2 rounded-lg font-medium text-gray-500 bg-gray-100">
                     Analyzed
                   </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TweetList; 