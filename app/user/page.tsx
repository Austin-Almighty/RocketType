"use client"
import LoginRegister from "./_components/LoginRegister"
import { useUser } from "../_lib/userContext"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function user() {
    const router = useRouter();
    const user = useUser();

    useEffect(() => {
        if (user.user) {
            router.push("/stat");
        }
    }, [user, router]);
    return (
        <div className="bg-base-100 flex flex-col items-center w-screen">

            {/* {user && (
                <>
                    
                    <Profile />
                    <Summary />
                    <Table />
                    <button className="btn">
                        <span className="loading loading-spinner"></span>
                        loading
                    </button>
                </>
            )} */}


            <div className="mt-6">
            {!user.user && <LoginRegister />}
            </div>
        </div>
            
    )
}