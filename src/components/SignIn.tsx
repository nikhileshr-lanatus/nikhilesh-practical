import { useState } from "react";
import supabase from "../utils/supabase";
import { toast } from "react-toastify";
import { useAuth } from "../context/authContext";

const SignIn = () => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const auth = useAuth();

    const signIn = async () => {
        if (email.trim().length === 0) {
            toast.error("Please Enter valid email")
        }
        if (password.trim().length === 0) {
            toast.error("please Enter valid password")
        }

        const res = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (res.error) {
            toast.error(res.error.message)
        }
        if (res.data.user?.id) {
            toast.success("User Logged In successfully")
            auth?.fetchUserSession && auth?.fetchUserSession()
        }
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            border: "1px solid white",
            padding: '10px',
            borderRadius: "5px"
        }}>
            <h2>Sign In</h2>
            <div style={{
                display: 'flex',
                width: "300px",
                justifyContent: "space-between"
            }}>
                <label>
                    Email:
                </label>
                <input style={{ width: '200px' }} value={email} type="email" onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{
                display: 'flex',
                width: "300px",
                justifyContent: "space-between"
            }}>
                <label>
                    Password:
                </label>
                <input value={password} style={{ width: '200px' }} type="password" onChange={e => setPassword(e.target.value)} />
            </div>
            <button onClick={signIn}>
                Sign In
            </button>
        </div>

    )
}

export default SignIn;