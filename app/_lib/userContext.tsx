"use client";
import { createContext, useEffect, useState, useContext, ReactNode } from "react";
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

const UserContext = createContext<User | null>(null);

export function UserProvider({ children }: { children:ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);
    return (
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    return useContext(UserContext)
}