import TaskForm from '@/components/TaskForm';

export default function CreateTaskPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Create New Task</h1>
      <TaskForm />
    </div>
  );
}
