// Success messages
export const successMessage = {
  RECORD_FOUND: "Record found",
  USER_REGISTERED: "User registered successfully",
  USER_LOGIN: "User login successful",
  USER_LOGOUT: "User logout successful",
  RESET_PASSWORD_SUCCESS: "Password Reset  successfully",
  DELETE_ACCOUNT: "Account Deleted Successfully",
  CREATE: (entity: string) => `${entity} created successfully`,
  UPDATE: (entity: string) => `${entity} updated successfully`,
  DELETE: (entity: string) => `${entity} deleted successfully`,
  FETCH: (entity: string) => `${entity} retrieved successfully`,
  ROOM: (entity: string) => `Room ${entity} successfully `,
};

// Error messages
export const errorMessage = {
  INTERNAL_SERVER_ERROR: "Internal server error",
  USER_EXISTS: "User already exists",
  INVALID_CREDENTIALS: "Invalid credentials",
  SOMETHING_WENT_WRONG: "something went wrong ",
  USER_REGISTER_ERROR: "Error registering user",
  USER_LOGIN_ERROR: "Error during login",
  LOGOUT_ERROR: "Error during logout",
  MISSING_TOKEN: "Unauthorized: Missing token",
  INVALID_TOKEN: "Unauthorized: Invalid token",
  TOKEN_EXPIRED: "Token has been expired",
  UNAUTHORIZED_ACCESS: "unauthorized to access",
  USER_NOT_FOUND: "User does not found",
  WRONG_PASSWORD: "Wrong Password",
  NOT_FOUND: (entity: string) => `${entity} not found`,
};
