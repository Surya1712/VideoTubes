import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CreateButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (user) {
      navigate(`/dashboard/${user.username}`);
    } else {
      navigate("/login");
    }
  };
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-full shadow-md transition-all duration-200 active:scale-95"
    >
      <Plus className="w-5 h-5" />
      <span>Create</span>
    </button>
  );
};

export default CreateButton;
