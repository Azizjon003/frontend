import React, { useState } from "react";

interface NewTaskFormProps {
  boardId: string; // Needed to know which board to add the task to
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    dueDate: string | null;
  }) => Promise<void>; // Make onSubmit async
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({
  boardId,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDateTime, setDueDateTime] = useState(""); // Changed state to handle datetime-local value (YYYY-MM-DDTHH:mm)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError("Task title is required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    // Convert dueDateTime (YYYY-MM-DDTHH:mm) to full ISO string or null
    let isoDueDate: string | null = null;
    if (dueDateTime) {
      try {
        // Create Date object directly from the local datetime string
        // Note: This assumes the user's local timezone. If UTC is strictly needed,
        // further adjustments might be necessary depending on API requirements.
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
      await onSubmit({ title, description, dueDate: isoDueDate });
      onClose(); // Close modal after successful submission trigger in parent
    } catch (apiError: any) {
      // Error is now re-thrown from onSubmit in Dashboard, handle it here
      setError(apiError.message || "Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Basic modal styling (overlay and content)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label
              htmlFor="due-date-time"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Due to
            </label>
            <input
              type="datetime-local" // Changed input type
              id="due-date-time"
              value={dueDateTime} // Bind to new state
              onChange={(e) => setDueDateTime(e.target.value)} // Update new state
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
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskForm;
