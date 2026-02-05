import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoAdd, IoPeopleOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import { Button } from '../components/common/Button';
import { Spinner, Skeleton } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { Input, Textarea } from '../components/common/Input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ROUTES } from '../config/constants';

const groupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type GroupFormData = z.infer<typeof groupSchema>;

export const Groups = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: groups,
    isLoading,
  } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiService.getGroups(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: GroupFormData) => apiService.createGroup(data.name, data.description),
    onSuccess: () => {
      toast.success('Group created successfully!');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsCreateModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create group');
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: (groupId: number) => apiService.joinGroup(groupId),
    onSuccess: () => {
      toast.success('Joined group successfully!');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: () => {
      toast.error('Failed to join group');
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) => apiService.leaveGroup(groupId),
    onSuccess: () => {
      toast.success('Left group successfully!');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: () => {
      toast.error('Failed to leave group');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Interest Groups
        </h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <IoAdd className="w-5 h-5 mr-2" />
          Create Group
        </Button>
      </div>

      {groups && groups.length === 0 ? (
        <div className="text-center py-12">
          <IoPeopleOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No groups yet</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>Create First Group</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups?.map((group) => (
            <div
              key={group.id}
              className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`${ROUTES.GROUP_DETAIL.replace(':groupId', group.id.toString())}`)}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {group.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {group.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <IoPeopleOutline className="w-5 h-5" />
                  <span>{group.memberCount || 0} members</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle join/leave logic here
                  }}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          reset();
        }}
        title="Create New Group"
      >
        <form
          onSubmit={handleSubmit((data) => createGroupMutation.mutate(data))}
          className="space-y-4"
        >
          <Input
            label="Group Name"
            placeholder="Enter group name"
            {...register('name')}
            error={errors.name?.message}
          />
          <Textarea
            label="Description"
            placeholder="Describe your group..."
            {...register('description')}
            error={errors.description?.message}
          />
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                reset();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createGroupMutation.isPending}
              className="flex-1"
            >
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
