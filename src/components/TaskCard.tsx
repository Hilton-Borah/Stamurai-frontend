import { Task } from '@/types/task';

export default function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-white shadow-md p-4 rounded border">
      <h3 className="text-xl font-semibold">{task.title}</h3>
      <p className="text-sm text-gray-600">{task.description}</p>
      <p className="mt-2 text-sm">
        <strong>Status:</strong> {task.status}
      </p>
      <p className="text-sm">
        <strong>Priority:</strong> {task.priority}
      </p>
      <p className="text-sm">
        <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
      </p>
      <p className="text-sm">
        <strong>Assigned To:</strong> {task.assignedTo?.name}
      </p>
    </div>
  );
}
