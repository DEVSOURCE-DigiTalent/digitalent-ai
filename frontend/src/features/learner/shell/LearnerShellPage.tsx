import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

export const LearnerShellPage: React.FC = () => {
  return (
    <div className="learner-shell p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Learner Dashboard</h1>
      <p className="mb-4">Welcome to your learning environment.</p>
      
      <div className="flex gap-4 border-b pb-4 mb-4">
        <Link to="/learn" className="text-blue-600">Home</Link>
        <Link to="/learn/courses" className="text-blue-600">Courses</Link>
        <Link to="/learn/paths" className="text-blue-600">Learning Paths</Link>
      </div>

      <div className="learner-content mt-4">
        <Routes>
          <Route path="/" element={<p>Select a course or path to begin.</p>} />
          <Route path="courses" element={<p>Course list would appear here.</p>} />
          <Route path="paths" element={<p>Learning paths would appear here.</p>} />
        </Routes>
      </div>
    </div>
  );
};
