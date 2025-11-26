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
  
  // FEEDBACK STATE
  const [currentProjectId, setCurrentProjectId] = useState(null)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [comment, setComment] = useState("")
  const [refineInstruction, setRefineInstruction] = useState("")

  const [projects, setProjects] = useState([])
  const [menuOpenId, setMenuOpenId] = useState(null)
  
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.get("http://127.0.0.1:8000/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) { console.error("Failed to load history"); }
  }

  const loadProject = (project) => {
    setTopic(project.title);
    setResult(project.content);
    setCurrentProjectId(project.id);
    setLiked(false);
    setDisliked(false);
    setComment("");
    setIsEditing(false);
  }

  const handleDelete = async (e, projectId) => {
    e.stopPropagation();
    if(!confirm("Delete this project?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://127.0.0.1:8000/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
      if (projects.find(p => p.id === projectId)?.title === topic) {
        setTopic(""); setResult(""); setCurrentProjectId(null);
      }
    } catch (error) { alert("Failed to delete"); }
  }

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); }

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setResult(""); 
    setIsEditing(false);
    setCurrentProjectId(null);
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/generate", { topic: topic });
      setResult(response.data.content);
    } catch (error) { setResult("Error connecting to server."); } 
    finally { setLoading(false); }
  }

  const handleRefine = async () => {
    if (!refineInstruction) return;
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/refine", {
        content: result,
        instruction: refineInstruction
      });
      setResult(response.data.content);
      setRefineInstruction(""); 
    } catch (error) { alert("Refinement failed"); }
    finally { setLoading(false); }
  }

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) { alert("Login required!"); return; }
    try {
      const response = await axios.post("http://127.0.0.1:8000/projects", {
        title: topic, content: result, doc_type: "docx"
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setCurrentProjectId(response.data.project_id);
      
      if (liked || disliked || comment) {
        await axios.put(`http://127.0.0.1:8000/projects/${response.data.project_id}/feedback`, {
          is_liked: liked, is_disliked: disliked, user_notes: comment
        }, { headers: { Authorization: `Bearer ${token}` } });
      }

      alert("Project & Feedback Saved!");
      fetchProjects();
    } catch (error) { alert("Failed to save."); }
  }

  const handleDownload = async (type) => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/export/${type}`, { content: result }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${topic}.${type}`);
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

      <div className="main-layout">
        <div className="workspace-area">
          <div className="dashboard-card hero-card">
            <h1>Create Professional Documents</h1>
            <div className="input-group">
              {/* FIXED PLACEHOLDER */}
              <input 
                type="text" 
                placeholder="What do you want to write about? (e.g. Electric Vehicles)" 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
              />
              {/* FIXED BUTTON TEXT */}
              <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating Magic..." : "Generate Content"}
              </button>
            </div>
          </div>

          {result && (
            <div className="dashboard-card result-card">
              <div className="result-header">
                <h3>Draft</h3>
                <button className="toggle-edit-btn" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "👁️ Preview" : "✏️ Edit"}
                </button>
              </div>

              <div className="refine-bar">
                <input 
                  type="text" 
                  placeholder="Ask AI to refine (e.g. 'Make it shorter', 'Add bullets')..." 
                  value={refineInstruction}
                  onChange={(e) => setRefineInstruction(e.target.value)}
                />
                <button onClick={handleRefine} disabled={loading}>✨ Refine</button>
              </div>

              <div className="result-content-area">
                {isEditing ? (
                  <textarea className="editor-textarea" value={result} onChange={(e) => setResult(e.target.value)} />
                ) : (
                  <div className="markdown-preview"><ReactMarkdown>{result}</ReactMarkdown></div>
                )}
              </div>
              
              <div className="feedback-section">
                <h4>Was this helpful?</h4>
                <div className="feedback-buttons">
                  <button className={`thumb-btn ${liked ? 'active' : ''}`} onClick={() => { setLiked(!liked); setDisliked(false); }}>👍 Like</button>
                  <button className={`thumb-btn ${disliked ? 'active' : ''}`} onClick={() => { setDisliked(!disliked); setLiked(false); }}>👎 Dislike</button>
                </div>
                <textarea className="comment-box" placeholder="Add private notes or comments here..." value={comment} onChange={(e) => setComment(e.target.value)} />
              </div>

              <div className="action-bar">
                <button className="action-btn save" onClick={handleSave}>💾 Save All</button>
                <div className="divider"></div>
                <button className="action-btn pdf" onClick={() => handleDownload('pdf')}>📄 PDF</button>
                <button className="action-btn doc" onClick={() => handleDownload('docx')}>📝 Word</button>
                <button className="action-btn ppt" onClick={() => handleDownload('pptx')}>📊 PPT</button>
              </div>
            </div>
          )}
        </div>

        <div className="history-sidebar">
          <h3>Saved Projects</h3>
          <div className="project-list">
            {projects.map((p) => (
              <div key={p.id} className={`project-item ${topic === p.title ? 'active' : ''}`} onClick={() => loadProject(p)}>
                <span className="project-title">{p.title}</span>
                <div className="menu-container" onClick={(e) => e.stopPropagation()}>
                  <button className="dots-btn" onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}>⋮</button>
                  {menuOpenId === p.id && (
                    <div className="dropdown-menu">
                      <button onClick={(e) => handleDelete(e, p.id)} className="delete-option">🗑️ Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard