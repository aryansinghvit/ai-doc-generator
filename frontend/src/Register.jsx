import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Added Link

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/register", {
        email: email,
        password: password,
      });
      alert("Registration Successful! Please Login.");
      navigate("/"); // Go back to Login
    } catch (error) {
      alert("Registration failed. Email might already be taken.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create Account</h2>
        
        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Choose a password"
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button onClick={handleRegister}>Sign Up</button>
        
        <div className="auth-link">
          Already have an account? 
          <Link to="/">Log in here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;