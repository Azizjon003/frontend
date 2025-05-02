import React from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { BoardMember } from "./Dashboard"; // Assuming BoardMember is exported from Dashboard or a types file

interface BoardMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: BoardMember[];
  loading: boolean;
  error: string | null;
  boardId: string | null; // Needed to enable invite button
  onInviteClick: () => void; // Function to trigger opening invite modal
}

const BoardMembersModal: React.FC<BoardMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  loading,
  error,
  boardId, // Destructure boardId
  onInviteClick, // Destructure onInviteClick
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Board Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Close members modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
              <p className="ml-3 text-gray-600">Loading members...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 px-4">
              <p className="text-red-600 bg-red-100 p-3 rounded">
                Error: {error}
              </p>
            </div>
          ) : members.length > 0 ? (
            <ul className="space-y-3">
              {members.map((member) => (
                <li
                  key={member.userId}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition duration-150"
                >
                  <div className="flex items-center space-x-3">
                    {/* Placeholder for avatar or initials */}
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm">
                      {member.name.substring(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  {/* Optional: Add role or remove button if needed */}
                  {/* <span className="text-xs text-gray-400">Joined: {new Date(member.assignedAt).toLocaleDateString()}</span> */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-10">
              No members have been added to this board yet.
            </p>
          )}
        </div>

        {/* Modal Footer - Invite Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onInviteClick}
            disabled={!boardId} // Disable if no board context
            className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded hover:bg-indigo-700 transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={16} className="mr-1.5" />
            Invite New Member
          </button>
        </div>
      </div>
    </div>
  );
};

// Ensure BoardMember type is properly imported or defined if not exported from Dashboard
// export type { BoardMember }; // If needed elsewhere

export default BoardMembersModal;
