const API_URL = "http://localhost:5001/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const generateFinancialPlan = async (customerData) => {
  try {
    const response = await fetch(`${API_URL}/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to generate plan");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Registration failed");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const login = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Login failed");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
