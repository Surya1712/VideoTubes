import { useAuth as useAuthContext } from "../context/AuthContext.jsx";

export const useAuth = () => {
  return useAuthContext();
};
