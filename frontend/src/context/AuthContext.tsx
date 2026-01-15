import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import config from '../config/config';
import { authAPI, User } from '../services/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signup: (email: string, password: string, username: string) => Promise<User>;
    signin: (email: string, password: string) => Promise<User>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem(config.TOKEN_KEY);
            const savedUser = localStorage.getItem(config.USER_KEY);

            if (token && savedUser) {
                try {
                    // Verify token is still valid
                    const response = await authAPI.getMe();
                    setUser(response.data.user);
                } catch {
                    // Token invalid - clear storage
                    localStorage.removeItem(config.TOKEN_KEY);
                    localStorage.removeItem(config.REFRESH_TOKEN_KEY);
                    localStorage.removeItem(config.USER_KEY);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const signup = async (email: string, password: string, username: string): Promise<User> => {
        const response = await authAPI.signup({ email, password, username });
        const { user, access_token, refresh_token } = response.data;

        localStorage.setItem(config.TOKEN_KEY, access_token);
        localStorage.setItem(config.REFRESH_TOKEN_KEY, refresh_token);
        localStorage.setItem(config.USER_KEY, JSON.stringify(user));

        setUser(user);
        return user;
    };

    const signin = async (email: string, password: string): Promise<User> => {
        const response = await authAPI.signin({ email, password });
        const { user, access_token, refresh_token } = response.data;

        localStorage.setItem(config.TOKEN_KEY, access_token);
        localStorage.setItem(config.REFRESH_TOKEN_KEY, refresh_token);
        localStorage.setItem(config.USER_KEY, JSON.stringify(user));

        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem(config.TOKEN_KEY);
        localStorage.removeItem(config.REFRESH_TOKEN_KEY);
        localStorage.removeItem(config.USER_KEY);
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        signup,
        signin,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
