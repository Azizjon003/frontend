import React, { useState, useRef, useEffect } from "react";

// Define the Task interface based on GET /boards/:boardId/tasks
export interface Task {
  id: number; // Changed to number
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  priority?: "low" | "medium" | "high" | "highest"; // Added optional priority
  dueDate: string | null; // Assumed to be ISO string or null
  boardId: string;
  assigneeId: string | null; // Can be null
  createdAt: string;
  updatedAt: string;
  // Removed priority
}

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: number, newStatus: Task["status"]) => void; // Callback for status change
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleStatusClick = (newStatus: Task["status"]) => {
    if (newStatus !== task.status) {
      onStatusChange(task.id, newStatus);
    }
    setIsStatusOpen(false);
  };

  // Function to get priority tag style
  const getPriorityStyles = (priority?: Task["priority"]) => {
    switch (priority) {
      case "low":
        return { tag: "bg-green-100 text-green-800", dateBg: "bg-green-50" };
      case "medium":
        return { tag: "bg-yellow-100 text-yellow-800", dateBg: "bg-yellow-50" };
      case "high":
        return { tag: "bg-orange-100 text-orange-800", dateBg: "bg-orange-50" }; // Adjusted colors
      case "highest":
        return { tag: "bg-red-100 text-red-800", dateBg: "bg-red-50" }; // Adjusted colors
      default:
        return { tag: "hidden", dateBg: "bg-gray-100" }; // Hide tag if no priority
    }
  };

  // Function to format date and time
  const formatDateTime = (
    dateString: string | null
  ): { date: string | null; time: string | null } => {
    if (!dateString) return { date: null, time: null };
    try {
      const dateObj = new Date(dateString);
      const date = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      // Check if time is significant (not midnight UTC)
      const time =
        dateObj.getUTCHours() !== 0 ||
        dateObj.getUTCMinutes() !== 0 ||
        dateObj.getUTCSeconds() !== 0 ||
        dateObj.getUTCMilliseconds() !== 0
          ? dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }) // Use 24-hour format as in image
          : null;
      return { date, time };
    } catch (e) {
      console.error("Error formatting date:", e);
      return { date: "Invalid date", time: null };
    }
  };

  const { tag: priorityTagStyle, dateBg: priorityDateBg } = getPriorityStyles(
    task.priority
  );
  const { date: formattedDate, time: formattedTime } = formatDateTime(
    task.dueDate
  );

  const statusOptions: Task["status"][] = ["TODO", "IN_PROGRESS", "COMPLETED"];

  return (
    <div className="bg-white p-3 rounded-md shadow border border-gray-200 mb-3">
      {" "}
      {/* Adjusted padding/margin/border */}
      {/* Priority Tag */}
      {task.priority && (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2 ${priorityTagStyle}`}
        >
          {task.priority} priority
        </span>
      )}
      {/* Title */}
      <h4 className="font-medium text-gray-800 text-sm mb-1">{task.title}</h4>
      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      {/* Date/Time and Status */}
      <div className="flex justify-between items-center text-xs">
        {/* Date and Time Span with background based on priority */}
        <span
          className={`flex items-center space-x-2 px-2 py-0.5 rounded ${priorityDateBg}`}
        >
          {formattedDate ? (
            <span className="text-gray-600 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 mr-1 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formattedDate}
            </span>
          ) : (
            <span className="text-gray-400 italic">No date</span>
          )}
          {formattedTime && (
            <span className="text-gray-500 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 mr-1 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formattedTime}
            </span>
          )}
        </span>

        {/* Status Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-200 focus:outline-none flex items-center"
          >
            {task.status.replace("_", " ")}
            {/* Replace underscore for display */}
            <svg
              className={`w-3 h-3 ml-1 transition-transform duration-200 ${
                isStatusOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          {isStatusOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <ul className="py-1">
                {statusOptions.map((statusOption) => (
                  <li key={statusOption}>
                    <button
                      onClick={() => handleStatusClick(statusOption)}
                      className={`w-full text-left px-3 py-1 text-xs ${
                        task.status === statusOption
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {statusOption.replace("_", " ")}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
