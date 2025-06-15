"use client";
import { createContext, useEffect, useState, useContext, ReactNode } from "react";
import { auth } from "./Firebase";
import { onAuthStateChanged, User } from "firebase/auth";

type UserContextType = { user: User | null, loading: boolean};
const UserContext = createContext<UserContextType>({ user:null, loading:true});

export function UserProvider({ children }: { children:ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    return (
        <UserContext.Provider value={{user, loading}}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    return useContext(UserContext)
}