import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';

const FeedbackPage = () => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('general');
  const [rating, setRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would submit to an API
    console.log({ feedback, category, rating });
    
    // Reset form
    setFeedback('');
    setCategory('general');
    setRating(5);
    
    // Show success message
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback! We appreciate your input.",
    });
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">SEND US FEEDBACK</h2>
        
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-600 mb-6">
            Your feedback helps us improve our humanitarian aid distribution system. 
            Please share your thoughts, suggestions, or report any issues you've encountered.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Report a Bug</option>
                <option value="feature">Feature Request</option>
                <option value="usability">Usability Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                How would you rate your experience? (1-10)
              </label>
              <input
                type="range"
                id="rating"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
              </div>
              <p className="text-center mt-2">Your rating: {rating}/10</p>
            </div>
            
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Your Feedback
              </label>
              <textarea
                id="feedback"
                rows="6"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Please share your thoughts, suggestions, or report any issues..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Submit Feedback
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center text-gray-600">
            <p>If you need immediate assistance, please contact us at:</p>
            <p className="font-medium">support@hads.org</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FeedbackPage;