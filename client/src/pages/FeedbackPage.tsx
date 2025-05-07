import React, { useState } from 'react';

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle feedback submission logic here
    console.log('Feedback submitted:', feedback);
  };

  return (
    <div className="min-h-screen bg-[#181f2a] flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">SEND US FEEDBACK</h1>
        <p className="mb-6 text-gray-600">
          Your feedback helps us improve our humanitarian aid distribution system. Please share your thoughts, suggestions, or report any issues you've encountered.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">Your Feedback</label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage; 