import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoCalendarOutline } from 'react-icons/io5';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Loading';
import { ROUTES } from '../config/constants';
import { format } from 'date-fns';

export const Sessions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');

  // This would need to be implemented in the API service
  // For now, showing a placeholder
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Jamming Sessions
        </h1>
        {groupId && (
          <Button onClick={() => navigate(`${ROUTES.SESSIONS}/create?groupId=${groupId}`)}>
            Create Session
          </Button>
        )}
      </div>

      <div className="text-center py-12 card">
        <IoCalendarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Sessions feature coming soon
        </p>
      </div>
    </div>
  );
};
