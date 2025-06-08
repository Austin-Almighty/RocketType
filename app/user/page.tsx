import Header from "../_components/Header"
import LoginRegister from "./_components/LoginRegister"
// import { useUser } from "../_lib/userContext"


export default function user() {
    // const user = useUser();
    return (
        <div className="bg-amber-100 h-screen flex flex-col items-center w-screen">
            <Header />
            <LoginRegister />
        </div>
            
    )
}