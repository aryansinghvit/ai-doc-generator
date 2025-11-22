import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Used to move to another page

  const handleRegister = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/register", {
        email: email,
        password: password,
      });
      alert("Registration Successful! Please Login.");
      navigate("/"); // Go to Login Page
    } catch (error) {
      alert("Registration failed. Email might be taken.");
    }
  };

  return (
    <div className="app-container">
      <h2>Create an Account</h2>
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
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}

export default Register;