from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware # <--- NEW IMPORT
from fastapi.responses import StreamingResponse  # <--- NEW
from pydantic import BaseModel
from database import engine, get_db
from sqlalchemy.orm import Session
import models
import ai_service
from docx import Document  # <--- NEW (Library to make Word files)
from io import BytesIO     # <--- NEW (Handles file streams in memory)
from pptx import Presentation  # <--- NEW


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- NEW SECTION: ALLOW FRONTEND CONNECTION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # This is where React lives
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------------------------------

class GenerateRequest(BaseModel):
    topic: str

@app.get("/")
def read_root():
    return {"message": "AI Document Platform is Running!"}

@app.post("/generate")
def generate_text(request: GenerateRequest):
    prompt = f"Write a short professional introduction for a document about: {request.topic}"
    generated_text = ai_service.generate_document_content(prompt)
    return {"content": generated_text}



# For Word document export


# Define the data structure for the export request
class ExportRequest(BaseModel):
    content: str

@app.post("/export/docx")
def export_docx(request: ExportRequest):
    # 1. Create a new Word Document in memory
    doc = Document()
    doc.add_heading('AI Generated Document', 0)
    doc.add_paragraph(request.content)

    # 2. Save it to a "buffer" (temporary memory) instead of hard disk
    buffer = BytesIO()
    doc.save(buffer)
    buffer.seek(0) # Go back to the start of the file

    # 3. Send the file back to the browser
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": "attachment; filename=generated_doc.docx"}
    )



# For PowerPoint export

@app.post("/export/pptx")
def export_pptx(request: ExportRequest):
    # 1. Create a PowerPoint Presentation
    prs = Presentation()
    
    # 2. Add a Slide (Layout 1 is usually "Title and Content")
    slide_layout = prs.slide_layouts[1] 
    slide = prs.slides.add_slide(slide_layout)
    
    # 3. Put text into the slide
    # We set a generic title for now (or you could send it from frontend)
    if slide.shapes.title:
        slide.shapes.title.text = "AI Generated Slide"
        
    # Put the AI content in the body box
    if len(slide.placeholders) > 1:
        slide.placeholders[1].text = request.content
    
    # 4. Save to memory buffer
    buffer = BytesIO()
    prs.save(buffer)
    buffer.seek(0)
    
    # 5. Send file back
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": "attachment; filename=generated_pres.pptx"}
    )