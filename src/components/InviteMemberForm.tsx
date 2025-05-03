import React, { useState } from "react";
import axios from "axios"; // Import axios if not already done globally

const API_URL = "https://task-paz7d.ondigitalocean.app"; // Ensure API_URL is defined

interface InviteMemberFormProps {
  boardId: string;
  onClose: () => void;
  // onSubmit could potentially return the success response or just handle API internally
  onInviteSuccess?: (message: string) => void; // Optional callback for success message
}

const InviteMemberForm: React.FC<InviteMemberFormProps> = ({
  boardId,
  onClose,
  onInviteSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem("accessToken"); // Get token

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !accessToken) {
      // Basic validation and check token
      setError("Please enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/boards/${boardId}/members`,
        { email: email.trim() }, // Send email in request body
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Invite successful:", response.data);
      setEmail(""); // Clear email field
      onClose(); // Close the modal
      if (onInviteSuccess) {
        onInviteSuccess(`Successfully invited ${email.trim()} to the board.`);
      }
    } catch (err: any) {
      console.error("Failed to invite member:", err);
      let errorMessage = "Failed to invite member. Please try again.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(", ");
        } else {
          errorMessage = err.response.data.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Invite Member
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="member-email"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Member Email
            </label>
            <input
              type="email"
              id="member-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm">Error: {error}</div>}

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
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Inviting..." : "Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberForm;
