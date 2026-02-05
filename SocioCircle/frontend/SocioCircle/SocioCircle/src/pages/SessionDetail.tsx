import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoArrowBack, IoPeopleOutline, IoChatbubbleOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Loading';
import { Avatar } from '../components/common/Avatar';
import { ROUTES } from '../config/constants';
import { format } from 'date-fns';

export const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // This would need session detail endpoint
  // For now, showing placeholder
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <IoArrowBack className="w-6 h-6" />
        Back
      </button>

      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Session Detail
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Session detail page - to be implemented with full session data
        </p>
      </div>
    </div>
  );
};
