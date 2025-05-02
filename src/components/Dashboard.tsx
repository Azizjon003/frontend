import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TaskColumn from "./TaskColumn"; // Import TaskColumn
import { Task } from "./TaskCard"; // Import Task interface
import NewTaskForm from "./NewTaskForm"; // Import the form component

const API_URL = "http://localhost:3000"; // Use the same base URL

// Define Board interface based on GET /boards response
interface Board {
  id: string;
  title: string;
  description: string;
  // Add other relevant fields from the API response if needed
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false); // Initially false
  const [error, setError] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false); // State for modal
  const accessToken = localStorage.getItem("accessToken");

  // Effect to fetch boards
  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    const fetchBoards = async () => {
      setLoadingBoards(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/boards`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (Array.isArray(response.data)) {
          setBoards(response.data);
          // Optionally select the first board by default
          // if (response.data.length > 0) {
          //   setSelectedBoardId(response.data[0].id);
          // }
        } else {
          console.error(
            "API did not return an array of boards:",
            response.data
          );
          setError("Failed to load boards: Invalid data format.");
          setBoards([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch boards:", err);
        setError("Failed to load boards.");
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/login");
        }
      } finally {
        setLoadingBoards(false);
      }
    };

    fetchBoards();
  }, [accessToken, navigate]);

  // Effect to fetch tasks when selectedBoardId changes
  useEffect(() => {
    if (!selectedBoardId || !accessToken) {
      setTasks([]); // Clear tasks if no board is selected
      return;
    }

    const fetchTasks = async () => {
      setLoadingTasks(true);
      setError(null); // Clear previous errors
      try {
        const response = await axios.get(
          `${API_URL}/boards/${selectedBoardId}/tasks`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (Array.isArray(response.data)) {
          setTasks(response.data);
        } else {
          console.error("API did not return an array of tasks:", response.data);
          setError("Failed to load tasks: Invalid data format.");
          setTasks([]);
        }
      } catch (err: any) {
        console.error(
          `Failed to fetch tasks for board ${selectedBoardId}:`,
          err
        );
        setError("Failed to load tasks for the selected board.");
        setTasks([]); // Clear tasks on error
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          // Handle auth error potentially caused by expired token during task fetch
          localStorage.removeItem("accessToken");
          navigate("/login");
        }
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [selectedBoardId, accessToken, navigate]); // Rerun when boardId or token changes

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  // Function to handle task status change
  const handleStatusChange = async (
    taskId: number,
    newStatus: Task["status"]
  ) => {
    if (!selectedBoardId || !accessToken) return;

    // Optimistic UI Update
    const originalTasks = [...tasks];
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      // API call to update status
      // Assuming PATCH /boards/:boardId/tasks/:taskId endpoint
      await axios.patch(
        `${API_URL}/boards/${selectedBoardId}/tasks/${taskId}`,
        { status: newStatus }, // Send the new status in the request body
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json", // Important for PATCH requests
          },
        }
      );
      // If API call is successful, the optimistic update is already done.
      // Optionally: show a success message or log success
      console.log(`Task ${taskId} status updated to ${newStatus}`);
    } catch (err: any) {
      console.error(`Failed to update status for task ${taskId}:`, err);
      // Revert UI if API call fails
      setTasks(originalTasks);
      setError(`Failed to update status for task ${taskId}. Please try again.`);
      // Optional: Handle specific errors like 401
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  };

  // Function to handle adding a new task
  const handleAddTask = async (taskData: {
    title: string;
    description: string;
    dueDate: string | null;
  }) => {
    if (!selectedBoardId || !accessToken) {
      throw new Error(
        "Cannot add task: No board selected or not authenticated."
      );
    }

    setError(null); // Clear previous errors

    // Prepare data for API
    const apiData: any = {
      title: taskData.title,
      description: taskData.description,
      status: "TODO", // Default status for new tasks
    };
    if (taskData.dueDate) {
      apiData.dueDate = taskData.dueDate;
    }

    try {
      const response = await axios.post(
        `${API_URL}/boards/${selectedBoardId}/tasks`,
        apiData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Add the new task to the state
      // Ensure the response data matches the Task interface
      const newTask = response.data as Task; // Type assertion, ensure API returns the created task correctly
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setIsNewTaskModalOpen(false); // Close modal on success
    } catch (err: any) {
      console.error("Failed to add task:", err);
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to create task. Please try again.";
      // Re-throw the error so the form can display it
      throw new Error(message);
    }
  };

  // Filter tasks by status for the selected board
  const todoTasks = tasks.filter((task) => task.status === "TODO");
  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-blue-900 p-4 flex flex-col">
      {" "}
      {/* Ensure vertical layout */}
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-4 flex-wrap">
        {" "}
        {/* Allow wrapping */}
        <h1 className="text-2xl font-bold text-white mr-4 mb-2 sm:mb-0">
          TaskFlow
        </h1>
        {/* Board Selector Dropdown */}
        <div className="flex items-center space-x-4">
          {loadingBoards ? (
            <span className="text-white text-sm">Loading boards...</span>
          ) : boards.length > 0 ? (
            <select
              value={selectedBoardId ?? ""} // Handle null case for select value
              onChange={(e) => setSelectedBoardId(e.target.value || null)} // Set to null if empty option selected
              className="bg-blue-700 text-white border border-blue-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a Board --</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.title}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-yellow-300 text-sm">No boards found.</span>
          )}

          {/* Add New Task Button */}
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            disabled={!selectedBoardId || loadingTasks} // Disable if no board selected or tasks are loading
            className="bg-green-500 text-white font-semibold py-1 px-3 rounded hover:bg-green-600 transition duration-200 text-sm h-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + New Task
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-semibold py-1 px-3 rounded hover:bg-red-600 transition duration-200 text-sm h-8"
          >
            Logout
          </button>
        </div>
      </div>
      {/* Error Display */}
      {error && (
        <div className="text-center text-red-300 bg-red-800 p-3 rounded mb-4 mx-4">
          Error: {error}
        </div>
      )}
      {/* Board Columns Area */}
      <div className="flex-grow overflow-x-auto pb-4">
        {" "}
        {/* Allow columns to take space and scroll */}
        {selectedBoardId ? (
          loadingTasks ? (
            <div className="text-center text-white mt-10">Loading tasks...</div>
          ) : (
            <div className="flex space-x-4 px-4">
              {" "}
              {/* Add padding for columns */}
              <TaskColumn
                title="TO DO"
                tasks={todoTasks}
                onStatusChange={handleStatusChange}
              />
              <TaskColumn
                title="IN PROGRESS"
                tasks={inProgressTasks}
                onStatusChange={handleStatusChange}
              />
              <TaskColumn
                title="COMPLETED"
                tasks={completedTasks}
                onStatusChange={handleStatusChange}
              />
            </div>
          )
        ) : (
          !loadingBoards &&
          boards.length > 0 && (
            <div className="text-center text-gray-400 mt-10">
              Please select a board to view tasks.
            </div>
          )
        )}
        {/* Show message if no boards exist and not loading */}
        {!loadingBoards && boards.length === 0 && !error && (
          <div className="text-center text-gray-400 mt-10">
            No boards available. Create a board to get started.
          </div>
        )}
      </div>
      {/* New Task Modal */}
      {isNewTaskModalOpen && selectedBoardId && (
        <NewTaskForm
          boardId={selectedBoardId}
          onClose={() => {
            setIsNewTaskModalOpen(false);
            setError(null); // Clear errors when closing modal
          }}
          onSubmit={handleAddTask}
        />
      )}
    </div>
  );
};

export default Dashboard;
