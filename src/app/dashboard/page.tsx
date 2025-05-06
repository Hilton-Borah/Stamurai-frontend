"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MdDelete, MdEdit, MdLogout, MdAdd } from "react-icons/md";
import TaskForm from "@/components/TaskForm";
import { FiClock, FiUser, FiUserCheck, FiAlertTriangle } from "react-icons/fi";
axios.defaults.withCredentials = true;
type Task = {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
};

type TabType = "assigned" | "created" | "overdue";

type PaginatedResponse = {
  tasks: Task[];
  total: number;
  page: number;
  pages: number;
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("assigned");
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  if (!user){
    router.push("/login");
    return;
  }
  const fetchTasks = async (page = 1, limit = 10) => {
    if (!user) return;


    setIsLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/tasks/?page=${page}&limit=${limit}&type=${activeTab}`
      );
      console.log(res);

      const data: PaginatedResponse = res.data;
      setPagination({
        page: data.page,
        limit,
        total: data.total,
        pages: data.pages,
      });

      return data.tasks;
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks().then((fetchedTasks) => {
      if (fetchedTasks) setTasks(fetchedTasks);
    });
  }, [user, router, activeTab]);

  const handlePageChange = (newPage: number) => {
    fetchTasks(newPage, pagination.limit).then((fetchedTasks) => {
      if (fetchedTasks) setTasks(fetchedTasks);
    });
  };

  const handleLimitChange = (newLimit: number) => {
    fetchTasks(1, newLimit).then((fetchedTasks) => {
      if (fetchedTasks) setTasks(fetchedTasks);
    });
  };

  const handleCreate = () => {
    setEditTask(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditTask(null);
    setIsEditMode(false);
    // Refresh tasks after modal closes (create/edit)
    fetchTasks(pagination.page, pagination.limit).then((fetchedTasks) => {
      if (fetchedTasks) setTasks(fetchedTasks);
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "in progress":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderTaskCard = (task: Task) => (
    <div
      key={task._id}
      className="p-5 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {task.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status}
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {task.description}
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
            <div className="flex items-center">
              <FiClock className="mr-1 flex-shrink-0" />
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <FiUserCheck className="mr-1 flex-shrink-0" />
              <span className="truncate">
                Assigned: {task.assignedTo?.name || "Unassigned"}
              </span>
            </div>
            <div className="flex items-center">
              <FiUser className="mr-1 flex-shrink-0" />
              <span className="truncate">
                Created by: {task.createdBy?.name}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 sm:ml-4 w-full sm:w-auto justify-end">
          <button
            onClick={() => handleEdit(task)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            aria-label="Edit task"
          >
            <MdEdit size={18} />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Delete task"
          >
            <MdDelete size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => {
    const emptyStates = {
      assigned: {
        icon: <FiUserCheck size={48} className="text-gray-400" />,
        title: "No tasks assigned",
        description: "You don't have any tasks assigned to you at the moment.",
      },
      created: {
        icon: <FiUser size={48} className="text-gray-400" />,
        title: "No tasks created",
        description: "You haven't created any tasks yet.",
      },
      overdue: {
        icon: <FiAlertTriangle size={48} className="text-red-400" />,
        title: "No overdue tasks",
        description: "Great job! All your tasks are up to date.",
      },
    };

    return (
      <div className="text-center py-12">
        <div className="flex justify-center">{emptyStates[activeTab].icon}</div>
        <h3 className="mt-4 text-lg font-medium text-gray-700">
          {emptyStates[activeTab].title}
        </h3>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          {emptyStates[activeTab].description}
        </p>
        {activeTab === "created" && (
          <button
            onClick={handleCreate}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <MdAdd className="mr-2" size={18} />
            Create Your First Task
          </button>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    // if (pagination.pages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium">{pagination.total}</span> results
          </span>
          <select
            value={pagination.limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            let pageNum;
            if (pagination.pages <= 5) {
              pageNum = i + 1;
            } else if (pagination.page <= 3) {
              pageNum = i + 1;
            } else if (pagination.page >= pagination.pages - 2) {
              pageNum = pagination.pages - 4 + i;
            } else {
              pageNum = pagination.page - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  pagination.page === pageNum
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
            <span className="px-3 py-1 text-sm">...</span>
          )}
          {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
            <button
              onClick={() => handlePageChange(pagination.pages)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {pagination.pages}
            </button>
          )}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (tasks.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="grid gap-4">
        {tasks.map((task) => renderTaskCard(task))}
        {renderPagination()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MdAdd className="mr-2" size={18} />
              New Task
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MdLogout className="mr-2" size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 overflow-x-auto">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("assigned")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "assigned"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiUserCheck className="mr-2" />
                Assigned to Me
                {pagination.total > 0 && activeTab === "assigned" && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {pagination.total}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("created")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "created"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiUser className="mr-2" />
                Created by Me
                {pagination.total > 0 && activeTab === "created" && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {pagination.total}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("overdue")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "overdue"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiAlertTriangle className="mr-2" />
                Overdue
                {pagination.total > 0 && activeTab === "overdue" && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {pagination.total}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {renderTabContent()}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isEditMode ? "Edit Task" : "Create New Task"}
              </h2>
              <TaskForm
                isEdit={isEditMode}
                taskId={editTask?._id}
                initialValues={
                  isEditMode && editTask
                    ? {
                        title: editTask.title,
                        description: editTask.description,
                        dueDate: editTask.dueDate.slice(0, 10),
                        priority: editTask.priority,
                        status: editTask.status,
                        assignedTo: editTask.assignedTo?._id || "",
                      }
                    : undefined
                }
                onSuccess={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
