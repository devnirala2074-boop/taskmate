import API from "./api";

const getAllUsers = async (token) => {
    const response = await API.get("/users", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const getUserById = async (id, token) => {
    const response = await API.get(`/users/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const createUser = async (userData, token) => {
    const response = await API.post("/users", userData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const updateUser = async (id, userData, token) => {
    const response = await API.patch(`/users/${id}`, userData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const deleteUser = async (id, token) => {
    const response = await API.delete(`/users/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const resetUserPassword = async (id, password, token) => {
    const response = await API.patch(
        `/users/${id}/reset-password`,
        { password },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

const userService = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword
};

export default userService;
