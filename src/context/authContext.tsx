import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import supabase from "../utils/supabase";

type AuthContextType = {
    user?: { id?: string }
    fetchUserSession?: () => void
};

const AuthContext = createContext<AuthContextType>({
});


export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useState<{ id?: string }>();

    const fetchUserSession = async () => {
        const { data } = await supabase.auth.getSession()
        if (data?.session?.user?.email) {
            setUser({ id: data?.session?.user?.email })
        } else {
            setUser({})
        }
    }


    useEffect(() => {
        fetchUserSession()
    }, [])

    return <AuthContext.Provider value={{ user, fetchUserSession }}>
        {children}
    </AuthContext.Provider>
}

export const useAuth = () => {
    const auth = useContext(AuthContext)
    return auth
}