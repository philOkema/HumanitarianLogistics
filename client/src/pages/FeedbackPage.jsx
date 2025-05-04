import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const FeedbackPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please provide a message in your feedback.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create feedback document in Firestore
      const feedbackData = {
        name: formData.name || null,
        email: formData.email || null,
        subject: formData.subject || "General",
        message: formData.message,
        rating: formData.rating,
        userId: user?.uid || null,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'feedback'), feedbackData);
      
      // Reset form
      setFormData({
        name: user?.displayName || '',
        email: user?.email || '',
        subject: 'general',
        message: '',
        rating: 5
      });
      
      // Show success message
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We appreciate your input.",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-xl font-semibold mb-6">SEND US FEEDBACK</h2>
      
      <div className="max-w-2xl mx-auto">
        <p className="text-gray-600 mb-6">
          Your feedback helps us improve our humanitarian aid distribution system. 
          Please share your thoughts, suggestions, or report any issues you've encountered.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Your name (optional)"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Your email (optional)"
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Category
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="general">General Feedback</option>
              <option value="bug">Report a Bug</option>
              <option value="feature">Feature Request</option>
              <option value="usability">Usability Issue</option>
              <option value="complaint">Complaint</option>
              <option value="praise">Praise</option>
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
              name="rating"
              min="1"
              max="10"
              value={formData.rating}
              onChange={handleChange}
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
            <p className="text-center mt-2">Your rating: {formData.rating}/10</p>
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Your Feedback
            </label>
            <textarea
              id="message"
              name="message"
              rows="6"
              value={formData.message}
              onChange={handleChange}
              placeholder="Please share your thoughts, suggestions, or report any issues..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
        
        <div className="mt-8 text-center text-gray-600">
          <p>If you need immediate assistance, please contact us at:</p>
          <p className="font-medium">support@hads.org</p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;