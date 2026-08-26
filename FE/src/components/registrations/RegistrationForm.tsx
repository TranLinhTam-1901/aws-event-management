import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../common/AppButton';
import { useAuth } from '../../context/AuthContext';
import registrationService from '../../services/registrationService';

interface Props {
  eventId: string;
  onSuccess?: () => void;
  onBlocked?: () => void;
}

export const RegistrationForm: React.FC<Props> = ({
  eventId,
  onSuccess,
  onBlocked,
}) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registrationService.registerEvent(eventId, formData);
      onSuccess?.();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = axiosError.response?.status;
      const message =
        axiosError.response?.data?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(message);

      if (status === 409) {
        onBlocked?.();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <p className="text-yellow-800 mb-3">Please log in to register for this event.</p>
        <AppButton variant="primary" onClick={() => navigate('/login')}>
          Log In
        </AppButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your phone number"
        />
      </div>

      <AppButton variant="primary" type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register Now'}
      </AppButton>
    </form>
  );
};
