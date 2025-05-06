"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TaskPriority, TaskStatus } from "@/types/task";
import axios from "axios";

interface Props {
  initialValues?: {
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignedTo: string;
  };
  isEdit?: boolean;
  taskId?: string;
}

export default function TaskForm({
  initialValues,
  isEdit = false,
  taskId,
}: Props) {
  const router = useRouter();
  const [allusers, setAllusers] = useState([]);
  const [form, setForm] = useState({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    dueDate: initialValues?.dueDate || "",
    priority: initialValues?.priority || "Medium",
    status: initialValues?.status || "Pending",
    assignedTo: initialValues?.assignedTo || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchTask = async () => {
    axios.get(`http://localhost:5000/api/auth/all`)
      .then((response) => {
        setAllusers(response.data.users);
      }).catch((err)=>{
        console.error("Error fetching users", err);
      })
  }

  useEffect(() => {
    fetchTask();
  },[])

  console.log(allusers)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && taskId) {
        await axios.put(`http://localhost:5000/api/tasks/${taskId}`, form);
      } else {
        await axios.post("http://localhost:5000/api/tasks", form);
      }
      router.push("/tasks");
    } catch (err) {
      console.error("Task submission error", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 w-[100%] bg-white "
    >
      <div>
        <label className="block mb-1 font-medium text-black">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded text-black"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium text-black">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded text-black"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium text-black">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded text-black"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium text-black">Priority</label>
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium text-black">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full p-2 border rounded text-black"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium text-black">Assign To</label>
        <select
         name="assignedTo"
         value={form.assignedTo}
         onChange={handleChange}
         required
          className="w-full p-2 border rounded text-black"
        >
          <option value="Pending">Select user</option>
          {
            allusers?.map((user: any) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))
          }
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isEdit ? "Update Task" : "Create Task"}
      </button>
    </form>
  );
}
