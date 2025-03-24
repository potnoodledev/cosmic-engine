import React, { useState } from 'react';

function TweetSearch({ onSearch }) {
  const [threadId, setThreadId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (threadId.trim()) {
      onSearch(threadId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          value={threadId}
          onChange={(e) => setThreadId(e.target.value)}
          placeholder="Enter Twitter Thread ID"
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search Thread
        </button>
      </div>
    </form>
  );
}

export default TweetSearch; 