'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import { getTaskById } from '@/lib/api';
import { Task } from '@/types/task';
import axios from 'axios';
axios.defaults.withCredentials = true;

export default function EditTaskPage() {
  const params = useParams();
  const taskId = params?.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await axios.get(`/api/tasks/${taskId}`);
        setTask(data.data);
      } catch (err) {
        console.error('Failed to load task:', err);
      } finally {
        setLoading(false);
      }
    };
    if (taskId) fetchTask();
  }, [taskId]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!task) return <p className="p-6">Task not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Task</h1>
      <TaskForm
        isEdit
        taskId={taskId}
        initialValues={{
          title: task.title,
          description: task.description,
          dueDate: task.dueDate.slice(0, 10), // YYYY-MM-DD
          priority: task.priority,
          status: task.status,
          assignedTo: task.assignedTo?._id || '',
        }}
      />
    </div>
  );
}
