import React from 'react';
import OpenAI from "openai";


function TweetList({ tweets }) {
  if (!tweets.length) {
    return null;
  }
  
  const handleTip = async (tweet) => {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true //TODO! VERY IMPORTANT! This is a temporary fix for the browser environment. CHANGE THIS TO SERVER SIDE
    });
    // const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    try {
      // First API call - Text Analysis
      const textResponse = await openai.responses.create({
          model: "gpt-4o-mini",
          input: `As a game design expert, analyze if the following text could be a game mechanic. Respond with 'Yes' or 'No':\n\n${tweet.text}`
      });
      
      const textResult = textResponse.output_text === 'Yes';
      console.log('Text Analysis:', textResult);

    //   // Second API call - Image Analysis (if image exists)
      if (tweet.image_url) {
        const imageResponse = await openai.responses.create({
          model: "gpt-4o",
          input: [
              {
                  role: "user",
                  content: [
                      { type: "input_text", text: "Does this image contain noodles? Respond with 'Yes' or 'No'" },
                      {
                          type: "input_image",
                          image_url: tweet.image_url
                      },
                  ],
              },
          ],
        });

        const imageResult = imageResponse.output_text === 'Yes';

        console.log('Image Analysis:', imageResult);
      }
    } catch (error) {
      console.error('Error processing tip:', error);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      {tweets.map((tweet, index) => (
        <div 
          key={tweet.tweet_id} 
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
                  disabled={tweet.tip_status === 'completed'}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    tweet.tip_status === 'completed'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {tweet.tip_status === 'completed' ? 'Tipped' : tweet.tip_status === 'pending' ? 'Processing' : 'Review'}
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