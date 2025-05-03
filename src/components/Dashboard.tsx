import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TaskColumn from "./TaskColumn"; // Import TaskColumn
import { Task } from "./TaskCard"; // Import Task interface
import NewTaskForm from "./NewTaskForm"; // Import the form component
import InviteMemberForm from "./InviteMemberForm"; // Import the invite form
import CreateBoardForm from "./CreateBoardForm"; // Import the create board form
import BoardMembersModal from "./BoardMembersModal"; // Import the new modal
import { Users } from "lucide-react"; // Only Users needed in header now

const API_URL = "https://task-paz7d.ondigitalocean.app"; // Use the same base URL

// Define Board interface based on GET /boards response
interface Board {
  id: string;
  title: string;
  description: string;
  // Add other relevant fields from the API response if needed
}

// Define BoardMember interface based on GET /boards/:boardId/members response
export interface BoardMember {
  userId: string;
  email: string;
  name: string;
  assignedAt: string; // Assuming it's a string (ISO date)
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false); // State for invite modal
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false); // State for create board modal

  // State for board members
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  // State to control the new members modal
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

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
      setTasks([]);
      return;
    }

    const fetchTasks = async () => {
      setLoadingTasks(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_URL}/boards/${selectedBoardId}/tasks`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (Array.isArray(response.data)) {
          // Map 'DONE' status from backend to 'COMPLETED' for frontend state
          const tasksFromApi = response.data.map((task: any) => {
            if (task.status === "DONE") {
              return { ...task, status: "COMPLETED" };
            }
            return task;
          });
          setTasks(tasksFromApi as Task[]); // Set the mapped tasks
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
        setTasks([]);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/login");
        }
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [selectedBoardId, accessToken, navigate]);

  // Effect to fetch members when selectedBoardId changes
  useEffect(() => {
    if (!selectedBoardId || !accessToken) {
      setBoardMembers([]);
      setMembersError(null);
      return;
    }

    const fetchMembers = async () => {
      setBoardMembers([]);
      setLoadingMembers(true);
      setMembersError(null);
      try {
        const response = await axios.get(
          `${API_URL}/boards/${selectedBoardId}/members`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (Array.isArray(response.data)) {
          setBoardMembers(response.data as BoardMember[]);
        } else {
          console.error(
            "API did not return an array of members:",
            response.data
          );
          setMembersError("Failed to load members: Invalid data format.");
          setBoardMembers([]);
        }
      } catch (err: any) {
        console.error(
          `Failed to fetch members for board ${selectedBoardId}:`,
          err
        );
        setMembersError("Failed to load members for the selected board.");
        setBoardMembers([]);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setMembersError("Authentication error loading members.");
        }
      } finally {
        setLoadingMembers(false);
      }
    };

    // Fetch members when the board changes.
    // The modal will handle showing loading/data state.
    fetchMembers();
  }, [selectedBoardId, accessToken]);

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
    const originalTasks = [...tasks];
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    const statusForApi = newStatus === "COMPLETED" ? "DONE" : newStatus;
    try {
      await axios.patch(
        `${API_URL}/boards/${selectedBoardId}/tasks/${taskId}`,
        { status: statusForApi },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        `Task ${taskId} status updated to ${newStatus} (sent as ${statusForApi})`
      );
    } catch (err: any) {
      console.error(`Failed to update status for task ${taskId}:`, err);
      setTasks(originalTasks);
      setError(`Failed to update status for task ${taskId}. Please try again.`);
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
    priority?: Task["priority"]; // Accept priority from form
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
      priority: taskData.priority, // Include priority
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
      if ((newTask.status as any) === "DONE") {
        newTask.status = "COMPLETED";
      }
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

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingTask(null);
    setIsEditModalOpen(false);
    setError(null); // Clear errors when closing edit modal too
  };

  const handleUpdateTask = async (taskData: {
    title: string;
    description: string;
    dueDate: string | null;
    priority?: Task["priority"]; // Accept priority from form
  }) => {
    if (!editingTask || !selectedBoardId || !accessToken) {
      throw new Error(
        "Cannot update task: No task selected or not authenticated."
      );
    }

    setError(null);

    // Optimistic Update - include priority
    const originalTasks = [...tasks];
    const updatedTaskDataForOptimistic = {
      ...editingTask,
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      priority: taskData.priority, // Include priority in optimistic update
    };
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === editingTask.id ? updatedTaskDataForOptimistic : task
      )
    );

    // Prepare data for API - include priority
    const apiData: any = {
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      priority: taskData.priority, // Send priority to API
      // Note: If API expects priority only if changed, add logic here
      // status: statusForApi // Status is not editable in this form
    };

    try {
      const response = await axios.patch(
        `${API_URL}/boards/${selectedBoardId}/tasks/${editingTask.id}`,
        apiData, // Send updated data including priority
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state with response data (including potential priority update)
      const savedTask = response.data as Task;
      if ((savedTask.status as any) === "DONE") {
        savedTask.status = "COMPLETED";
      }
      // Ensure priority from API is also correctly set in state
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === savedTask.id ? savedTask : task))
      );

      handleCloseEditModal();
    } catch (err: any) {
      console.error(`Failed to update task ${editingTask.id}:`, err);
      setTasks(originalTasks); // Revert optimistic update
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to update task. Please try again.";
      throw new Error(message);
    }
  };

  const handleInviteSuccess = (message: string) => {
    alert(message); // Simple alert for success notification
    // Could replace with a more sophisticated notification system
    // Optionally, re-fetch members after invite
    if (selectedBoardId && accessToken) {
      // Re-trigger the members fetch effect indirectly (or call fetchMembers directly)
      // To re-trigger effect, you might need a dummy state update, or refactor fetchMembers
      const fetchUpdatedMembers = async () => {
        // Simplified refetch
        setLoadingMembers(true);
        try {
          const response = await axios.get(
            `${API_URL}/boards/${selectedBoardId}/members`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          setBoardMembers(response.data as BoardMember[]);
        } catch (err) {
          console.error("Failed to refetch members after invite:", err);
          // Keep existing members, maybe show a small error?
        } finally {
          setLoadingMembers(false);
        }
      };
      fetchUpdatedMembers();
    }
  };

  //  Function to handle creating a new board
  const handleCreateBoard = async (boardData: {
    title: string;
    description: string;
  }) => {
    if (!accessToken) {
      throw new Error("Authentication token not found.");
    }
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/boards`, boardData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const newBoard = response.data as Board; // Assuming API returns the created board
      setBoards((prevBoards) => [...prevBoards, newBoard]); // Add new board to list
      setSelectedBoardId(newBoard.id); // Select the newly created board
      setIsCreateBoardModalOpen(false); // Close modal
    } catch (err: any) {
      console.error("Failed to create board:", err);
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to create board. Please try again.";
      // Re-throw error for the form
      throw new Error(message);
    }
  };

  // Function to handle deleting a task
  const handleDeleteTask = async (taskId: number) => {
    if (!selectedBoardId || !accessToken) {
      setError("Cannot delete task: No board selected or not authenticated.");
      return;
    }

    const originalTasks = [...tasks];
    // Optimistically remove the task from the UI
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    setError(null); // Clear previous errors

    try {
      await axios.delete(
        `${API_URL}/boards/${selectedBoardId}/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // API returns 204 No Content on success, so no data to process
      console.log(`Task ${taskId} deleted successfully.`);
      // No need to update state again as it was done optimistically
    } catch (err: any) {
      console.error(`Failed to delete task ${taskId}:`, err);
      // Revert the optimistic update if the API call fails
      setTasks(originalTasks);
      setError(`Failed to delete task ${taskId}. Please try again.`);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  };

  // Find the selected board object
  const selectedBoard = boards.find((board) => board.id === selectedBoardId);

  return (
    <div className="min-h-screen bg-blue-900 p-4 flex flex-col">
      {/* Header - Apply flex-wrap and adjust gaps/margins for responsiveness */}
      <div className="flex justify-between items-center mb-6 px-2 sm:px-4 flex-wrap gap-y-3 gap-x-4">
        {" "}
        {/* Reduced horizontal padding on smallest screens, added gap-y */}
        <h1 className="text-xl sm:text-2xl font-bold text-white mr-auto">
          {selectedBoard ? selectedBoard.title : "TaskFlow"}
        </h1>
        {/* Buttons and Selector Group */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-2">
          {" "}
          {/* Allow button group to wrap, add gap */}
          {/* Create Board Button */}
          <button
            onClick={() => setIsCreateBoardModalOpen(true)}
            className="bg-purple-600 text-white font-semibold py-1 px-3 rounded hover:bg-purple-700 transition duration-200 text-sm h-8"
          >
            + Create Board
          </button>
          {/* Board Selector */}
          {loadingBoards ? (
            <span className="text-white text-sm h-8 flex items-center px-3">
              Loading...
            </span> // Added padding for alignment
          ) : boards.length > 0 ? (
            <select
              value={selectedBoardId ?? ""}
              onChange={(e) => {
                setSelectedBoardId(e.target.value || null);
                setError(null);
                setMembersError(null); // Clear members error on board change
              }}
              className="bg-blue-700 text-white border border-blue-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-8 order-first sm:order-none" // Move selector first on small screens
            >
              <option value="">-- Select Board --</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.title}
                </option>
              ))}
            </select>
          ) : (
            !loadingBoards && (
              <span className="text-yellow-300 text-sm h-8 flex items-center px-3">
                No boards yet.
              </span>
            ) // Added padding
          )}
          {/* Add New Task Button */}
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            disabled={!selectedBoardId || loadingTasks}
            className="bg-green-500 text-white font-semibold py-1 px-3 rounded hover:bg-green-600 transition duration-200 text-sm h-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + New Task
          </button>
          {/* View Members Button */}
          <button
            onClick={() => setIsMembersModalOpen(true)} // Open the modal
            disabled={!selectedBoardId} // Only disable if no board selected
            className="bg-cyan-600 text-white font-semibold py-1 px-3 rounded hover:bg-cyan-700 transition duration-200 text-sm h-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Users size={14} className="mr-1" />
            View Members
          </button>
          {/* Logout Button */}
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
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteTask}
              />
              <TaskColumn
                title="IN PROGRESS"
                tasks={inProgressTasks}
                onStatusChange={handleStatusChange}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteTask}
              />
              <TaskColumn
                title="COMPLETED"
                tasks={completedTasks}
                onStatusChange={handleStatusChange}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteTask}
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
      {/* Edit Task Modal */}
      {isEditModalOpen && editingTask && selectedBoardId && (
        <NewTaskForm
          boardId={selectedBoardId}
          isEditing
          initialData={editingTask}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateTask}
        />
      )}
      {/* Invite Member Modal */}
      {isInviteModalOpen && selectedBoardId && (
        <InviteMemberForm
          boardId={selectedBoardId}
          onClose={() => setIsInviteModalOpen(false)}
          onInviteSuccess={handleInviteSuccess}
        />
      )}
      {/* Create Board Modal */}
      {isCreateBoardModalOpen && (
        <CreateBoardForm
          onClose={() => setIsCreateBoardModalOpen(false)}
          onSubmit={handleCreateBoard}
        />
      )}

      {/* ADDED Board Members Modal */}
      <BoardMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={boardMembers}
        loading={loadingMembers}
        error={membersError}
        boardId={selectedBoardId}
        onInviteClick={() => {
          setIsMembersModalOpen(false); // Close this modal
          setIsInviteModalOpen(true); // Open the invite modal
        }}
      />
    </div>
  );
};

export default Dashboard;
