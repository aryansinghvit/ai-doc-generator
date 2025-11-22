import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route 1: The Login Page (Default) */}
        <Route path="/" element={<Login />} />
        
        {/* Route 2: The Register Page */}
        <Route path="/register" element={<Register />} />
        
        {/* Route 3: The AI Generator (Protected) */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;