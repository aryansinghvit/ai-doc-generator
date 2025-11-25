import { useState } from 'react'
import axios from 'axios'
import './App.css'

function Dashboard() {
  // --- 1. SETUP VARIABLES ---
  const [topic, setTopic] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  // --- 2. GENERATE TEXT FUNCTION ---
  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setResult(""); 
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/generate", {
        topic: topic
      });
      setResult(response.data.content);
    } catch (error) {
      console.error("Generation Error:", error);
      setResult("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  }

  // --- 3. SAVE PROJECT FUNCTION (NEW) ---
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to save!");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/projects", {
        title: topic,      // We use the topic as the project title
        content: result,   // The text to save
        doc_type: "docx"   // Defaulting to docx for now
      }, {
        headers: {
          Authorization: `Bearer ${token}` // Sends your ID card
        }
      });
      alert("Project Saved to Database!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save project.");
    }
  }

  // --- 4. DOWNLOAD WORD FUNCTION ---
  const handleDownload = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/export/docx", {
        content: result
      }, {
        responseType: 'blob' 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${topic || 'document'}.docx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Word Download failed:", error);
    }
  }

  // --- 5. DOWNLOAD PPT FUNCTION ---
  const handleDownloadPPT = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/export/pptx", {
        content: result
      }, {
        responseType: 'blob' 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${topic || 'presentation'}.pptx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("PPT Download failed:", error);
    }
  }

  // --- 6. THE WEBSITE DISPLAY ---
  return (
    <div className="app-container">
      <h1>AI Document Generator</h1>
      
      <div className="input-box">
        <input 
          type="text" 
          placeholder="Enter a topic (e.g. Artificial Intelligence)" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Thinking..." : "Generate Content"}
        </button>
      </div>

      {result && (
        <div className="result-section">
          <div className="result-box">
            <h3>AI Output (You can edit this):</h3>
            {/* The Interactive Editor */}
            <textarea 
              className="editor-textarea"
              value={result}
              onChange={(e) => setResult(e.target.value)} 
            />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            {/* SAVE BUTTON */}
            <button 
              className="download-btn" 
              onClick={handleSave} 
              style={{ marginRight: '10px', backgroundColor: '#6c757d' }}
            >
              Save Project
            </button>

            {/* WORD BUTTON */}
            <button className="download-btn" onClick={handleDownload} style={{ marginRight: '10px' }}>
              Download Word (.docx)
            </button>

            {/* PPT BUTTON */}
            <button className="download-btn ppt-btn" onClick={handleDownloadPPT}>
              Download PowerPoint (.pptx)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard