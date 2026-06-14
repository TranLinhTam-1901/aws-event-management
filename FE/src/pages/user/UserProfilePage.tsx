import React from 'react';
import { UserLayout } from '../../components/layout/UserLayout';
import { UserProfileForm } from '../../components/user/UserProfileForm';

export const UserProfilePage: React.FC = () => {
  return (
    <UserLayout>
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="max-w-2xl">
        <UserProfileForm />
      </div>
    </UserLayout>
  );
};
