import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';

export const HomePage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="hero bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Event Management</h1>
          <p className="text-xl mb-8">Discover, register, and manage events with ease</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Explore Events
          </button>
        </div>
      </div>
    </PublicLayout>
  );
};
