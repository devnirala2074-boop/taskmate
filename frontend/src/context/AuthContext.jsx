import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const savedToken =
            localStorage.getItem("taskmate_token");

        const savedUser =
            localStorage.getItem("taskmate_user");

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }

        setLoading(false);

    }, []);


    const login = (loginToken, loginUser) => {

        localStorage.setItem(
            "taskmate_token",
            loginToken
        );

        localStorage.setItem(
            "taskmate_user",
            JSON.stringify(loginUser)
        );

        setToken(loginToken);
        setUser(loginUser);
    };


    const logout = () => {

        localStorage.removeItem("taskmate_token");
        localStorage.removeItem("taskmate_user");

        setToken(null);
        setUser(null);
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                loading,
                isAuthenticated: !!token
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};