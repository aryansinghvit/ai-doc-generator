import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Added Link for navigation

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/login", {
        email: email,
        password: password,
      });
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (error) {
      alert("Login Failed! Please check your email and password.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        
        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button onClick={handleLogin}>Log In</button>
        
        <div className="auth-link">
          Don't have an account? 
          <Link to="/register">Create one here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;