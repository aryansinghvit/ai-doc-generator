import { useState, useEffect } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'
import './App.css'

function Dashboard() {
  const [topic, setTopic] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // NEW: State for the History List
  const [projects, setProjects] = useState([])
  const [menuOpenId, setMenuOpenId] = useState(null) // For the 3-dot menu
  
  const navigate = useNavigate();

  // 1. FETCH PROJECTS ON LOAD
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.get("http://127.0.0.1:8000/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to load history");
    }
  }

  // 2. LOAD A SAVED PROJECT
  const loadProject = (project) => {
    setTopic(project.title);
    setResult(project.content);
    setIsEditing(false); // Open in preview mode
  }

  // 3. DELETE PROJECT
  const handleDelete = async (e, projectId) => {
    e.stopPropagation(); // Stop the click from loading the project
    if(!confirm("Are you sure you want to delete this project?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://127.0.0.1:8000/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh the list
      fetchProjects();
      // If we deleted the one currently open, clear the screen
      if (projects.find(p => p.id === projectId)?.title === topic) {
        setTopic("");
        setResult("");
      }
    } catch (error) {
      alert("Failed to delete");
    }
  }

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
      fetchProjects(); // Refresh the right sidebar
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
      <nav className="navbar">
        <div className="nav-brand">AI DocGen <span className="beta-tag">PRO</span></div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      {/* MAIN CONTENT SPLIT: LEFT (WORK) vs RIGHT (HISTORY) */}
      <div className="main-layout">
        
        {/* --- LEFT SIDE: THE WORKSPACE --- */}
        <div className="workspace-area">
          <div className="dashboard-card hero-card">
            <h1>Create Professional Documents</h1>
            <p className="subtitle">Enter a topic below and let AI write your report, essay, or presentation.</p>
            
            <div className="input-group">
              <input 
                type="text" 
                placeholder="What do you want to write about?" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate Content"}
              </button>
            </div>
          </div>

          {result && (
            <div className="dashboard-card result-card">
              <div className="result-header">
                <h3>Generated Draft</h3>
                <button 
                  className="toggle-edit-btn"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "👁️ Preview" : "✏️ Edit"}
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
                <button className="action-btn save" onClick={handleSave}>💾 Save</button>
                <div className="divider"></div>
                <button className="action-btn pdf" onClick={handleDownloadPDF}>📄 PDF</button>
                <button className="action-btn doc" onClick={handleDownload}>📝 Word</button>
                <button className="action-btn ppt" onClick={handleDownloadPPT}>📊 PPT</button>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT SIDE: HISTORY SIDEBAR --- */}
        <div className="history-sidebar">
          <h3>📂 Saved Projects</h3>
          <div className="project-list">
            {projects.length === 0 ? (
              <p className="no-projects">No saved projects yet.</p>
            ) : (
              projects.map((proj) => (
                <div 
                  key={proj.id} 
                  className={`project-item ${topic === proj.title ? 'active' : ''}`}
                  onClick={() => loadProject(proj)}
                >
                  <span className="project-title">{proj.title}</span>
                  
                  {/* 3 DOT MENU */}
                  <div className="menu-container" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="dots-btn"
                      onClick={() => setMenuOpenId(menuOpenId === proj.id ? null : proj.id)}
                    >
                      ⋮
                    </button>
                    {menuOpenId === proj.id && (
                      <div className="dropdown-menu">
                        <button onClick={(e) => handleDelete(e, proj.id)} className="delete-option">
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard