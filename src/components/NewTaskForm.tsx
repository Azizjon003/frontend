import React, { useState, useEffect } from "react";

import { Task } from "./TaskCard"; // Import Task interface

// Priority options consistent with Task interface
const priorityOptions: Task["priority"][] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "HIGHEST",
];

interface NewTaskFormProps {
  boardId: string;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    dueDate: string | null;
    priority?: Task["priority"]; // Add priority field
  }) => Promise<void>;
  initialData?: Task; // Optional initial data for editing
  isEditing?: boolean; // Flag to indicate edit mode
}

// Helper function to format ISO date string to YYYY-MM-DDTHH:mm for datetime-local input
const formatISOToLocalDateTime = (
  isoString: string | null | undefined
): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    // Adjust for timezone offset to get local time in YYYY-MM-DDTHH:mm format
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localISOTime = new Date(date.getTime() - timezoneOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  } catch {
    return ""; // Return empty string if date is invalid
  }
};

const NewTaskForm: React.FC<NewTaskFormProps> = ({
  boardId,
  onClose,
  onSubmit,
  initialData,
  isEditing = false, // Default to false
}) => {
  console.log(boardId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDateTime, setDueDateTime] = useState("");
  const [priority, setPriority] = useState<Task["priority"] | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form if in edit mode
  useEffect(() => {
    if (isEditing && initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setDueDateTime(formatISOToLocalDateTime(initialData.dueDate));
      setPriority(initialData.priority);
    } else {
      setPriority(undefined);
    }
  }, [isEditing, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError("Task title is required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    let isoDueDate: string | null = null;
    if (dueDateTime) {
      try {
        const dateObj = new Date(dueDateTime);
        if (isNaN(dateObj.getTime())) {
          throw new Error("Invalid date/time value");
        }
        isoDueDate = dateObj.toISOString();
      } catch (err) {
        console.error("Error parsing date/time:", err);
        setError("Invalid date/time format.");
        setIsSubmitting(false);
        return;
      }
    }
    try {
      await onSubmit({ title, description, dueDate: isoDueDate, priority });
      onClose();
    } catch (apiError: any) {
      setError(
        apiError.message ||
          `Failed to ${isEditing ? "update" : "create"} task. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        {/* Change title based on mode */}
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {isEditing ? "Edit Task" : "New Task"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Task title
            </label>
            <input
              type="text"
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          {/* Description Input */}
          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Task Description
            </label>
            <textarea
              id="task-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {/* Priority Select */}
          <div>
            <label
              htmlFor="task-priority"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Priority
            </label>
            <select
              id="task-priority"
              value={priority ?? ""}
              onChange={(e) =>
                setPriority((e.target.value as Task["priority"]) || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
            >
              <option value="">-- Select Priority --</option>
              {priorityOptions.map((prio) => (
                <option key={prio} value={prio}>
                  {prio ? prio.charAt(0) + prio.slice(1).toLowerCase() : ""}
                </option>
              ))}
            </select>
          </div>
          {/* Due Date Input */}
          <div>
            <label
              htmlFor="due-date-time"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Due to
            </label>
            <input
              type="datetime-local"
              id="due-date-time"
              value={dueDateTime}
              onChange={(e) => setDueDateTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">Error: {error}</div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              // Change button text based on mode
              className={`${
                isEditing
                  ? "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
                  : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
              } text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
            >
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskForm;
