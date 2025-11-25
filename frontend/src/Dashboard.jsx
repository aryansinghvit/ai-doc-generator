import { useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'
import './App.css'

function Dashboard() {
  const [topic, setTopic] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const navigate = useNavigate();

  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setResult(""); 
    setIsEditing(false);
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/generate", {
        topic: topic
      });
      setResult(response.data.content);
    } catch (error) {
      console.error("Error:", error);
      setResult("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to save!");
      return;
    }
    try {
      await axios.post("http://127.0.0.1:8000/projects", {
        title: topic,
        content: result,
        doc_type: "docx"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Project Saved Successfully!");
    } catch (error) {
      alert("Failed to save.");
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/export/pdf", { content: result }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${topic || 'document'}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) { console.error(error); }
  }

  const handleDownload = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/export/docx", { content: result }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${topic || 'document'}.docx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) { console.error(error); }
  }

  const handleDownloadPPT = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/export/pptx", { content: result }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${topic || 'presentation'}.pptx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) { console.error(error); }
  }

  return (
    <div className="app-wrapper">
      {/* 1. PROFESSIONAL NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">AI DocGen <span className="beta-tag">PRO</span></div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <div className="app-container">
        
        {/* 2. HERO SECTION / INPUT CARD */}
        <div className="dashboard-card hero-card">
          <h1>Create Professional Documents</h1>
          <p className="subtitle">Enter a topic below and let AI write your report, essay, or presentation.</p>
          
          <div className="input-group">
            <input 
              type="text" 
              placeholder="What do you want to write about? (e.g. Electric Vehicles)" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating Magic..." : "Generate Content"}
            </button>
          </div>
        </div>

        {/* 3. RESULTS SECTION */}
        {result && (
          <div className="dashboard-card result-card">
            <div className="result-header">
              <h3>Generated Draft</h3>
              <button 
                className="toggle-edit-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "👁️ Preview Mode" : "✏️ Edit Text"}
              </button>
            </div>

            <div className="result-content-area">
              {isEditing ? (
                <textarea 
                  className="editor-textarea"
                  value={result}
                  onChange={(e) => setResult(e.target.value)} 
                />
              ) : (
                <div className="markdown-preview">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              )}
            </div>
            
            <div className="action-bar">
              <button className="action-btn save" onClick={handleSave}>💾 Save Project</button>
              <div className="divider"></div>
              <button className="action-btn pdf" onClick={handleDownloadPDF}>📄 PDF</button>
              <button className="action-btn doc" onClick={handleDownload}>📝 Word</button>
              <button className="action-btn ppt" onClick={handleDownloadPPT}>📊 PPT</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard