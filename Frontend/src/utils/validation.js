export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  return errors;
};

export const validateUsername = (username) => {
  const errors = [];
  if (username.length < 3) {
    errors.push("Username must be at least 3 characters long");
  }
  if (username.length > 20) {
    errors.push("Username must not exceed 20 characters");
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, and underscores");
  }
  return errors;
};
