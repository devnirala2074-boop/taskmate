import API from "./api";

const loginUser = async (email, password) => {
    const response = await API.post("/auth/login", {
        email,
        password
    });

    return response.data;
};

const registerUser = async (name, email, password, role = "user") => {
    const response = await API.post("/auth/register", {
        name,
        email,
        password,
        role
    });

    return response.data;
};

const googleLogin = async (googleData) => {
    const response = await API.post("/auth/google", googleData);
    return response.data;
};

const authService = {
    loginUser,
    registerUser,
    googleLogin
};

export default authService;