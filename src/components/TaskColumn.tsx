import React from "react";
import TaskCard, { Task } from "./TaskCard"; // Import TaskCard and Task interface
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onStatusChange: (taskId: number, newStatus: Task["status"]) => void; // Add prop
  onEdit: (task: Task) => void; // Add onEdit prop
  onDelete: (taskId: number) => void; // Add onDelete prop
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: title, // Use the status (title) as the droppable ID
    data: { type: "Column", status: title }, // Pass column status data
  });
  const taskIds = tasks.map((task) => task.id);
  const columnStyle = {
    backgroundColor: isOver ? "rgba(0, 0, 255, 0.05)" : undefined,
    transition: "background-color 0.2s ease",
  };

  return (
    <div
      ref={setNodeRef}
      style={columnStyle}
      className="bg-gray-100 rounded-lg p-4 flex-shrink-0 w-96"
    >
      <h2 className="text-gray-800 font-semibold mb-4 text-center">
        {title.replace("_", " ")}
      </h2>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center pt-4 min-h-[50px]">
              No tasks in this column.
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default TaskColumn;
