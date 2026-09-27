import React from 'react';
import { useParams } from 'react-router-dom';

export const CareerCatalogPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="career-catalog p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Career Catalog</h1>
      {slug ? (
        <p>Viewing details for career path: {slug}</p>
      ) : (
        <p>Browse available career paths to find your next step.</p>
      )}
    </div>
  );
};
