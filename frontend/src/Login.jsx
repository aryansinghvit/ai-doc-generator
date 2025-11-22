import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Form Data usually requires a special format for tokens, 
    // but since we used JSON in backend, we send JSON here.
    try {
      const response = await axios.post("http://127.0.0.1:8000/login", {
        email: email,
        password: password,
      });
      
      // SAVE THE KEY (Token) to the browser
      localStorage.setItem("token", response.data.access_token);
      
      // Go to the Dashboard
      navigate("/dashboard");
      
    } catch (error) {
      alert("Login Failed! Check email/password.");
    }
  };

  return (
    <div className="app-container">
      <h2>Login</h2>
      <div className="input-box" style={{ flexDirection: "column" }}>
        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: "10px", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "10px", width: "100%" }}
        />
        <button onClick={handleLogin}>Login</button>
        
        <p style={{marginTop: "10px"}}>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;