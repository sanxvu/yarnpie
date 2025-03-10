import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

export default function Login() {
    const [user, setUser] = useState(null);

    function handleLogout() {
        googleLogout();
        setUser(null); // Clear user data on logout
    }

    return (
        <>
            {user ? (
                <div>
                    <p>Welcome, {user.name}</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <GoogleLogin
                    onSuccess={(credentialResponse) => {
                        const decoded = jwtDecode(credentialResponse.credential);
                        console.log(decoded); // Log the decoded user data
                        setUser(decoded); // Store the user data in state
                    }}
                    onError={() => console.log("Login failed")}
                    auto_select={true}
                />
            )}
        </>
    );
}
