import React from "react";
import TaskCard, { Task } from "./TaskCard"; // Import TaskCard and Task interface

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onStatusChange: (taskId: number, newStatus: Task["status"]) => void; // Add prop
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  tasks,
  onStatusChange,
}) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 flex-shrink-0 w-80">
      {" "}
      {/* Added fixed width and shrink */}
      <h2 className="text-gray-800 font-semibold mb-4 text-center">{title}</h2>
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange} // Pass down the handler
            />
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center">
            No tasks in this column.
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
