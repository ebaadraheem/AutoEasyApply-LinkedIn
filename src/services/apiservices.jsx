const API_BASE_URL = import.meta.env.VITE_SERVER_URL; 

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
    error.data = errorData; 
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) {
    return { success: true };
  }
  return response.json();
}

const apiService = {
  getUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error; 
    }
  },

  getUserById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`);
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error in getUserById for ID ${id}:`, error);
      throw error;
    }
  },

  addUser: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error in addUser:', error);
      throw error;
    }
  },

  updateUser: async (id, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Error in updateUser for ID ${id}:`, error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
      });
      const result = await handleResponse(response);
      return result.success || result; 
    } catch (error) {
      console.error(`Error in deleteUser for ID ${id}:`, error);
      throw error;
    }
  },
};

export default apiService;