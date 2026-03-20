
import sqlite3
import os
import shutil
import uuid
from datetime import datetime, date

from fastapi import FastAPI, HTTPException, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse # Naya: PDF bhejane ke liye
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
from fpdf import FPDF # Naya: PDF banane ke liye

# ======================================================
# APP CONFIG
# ======================================================

app = FastAPI()

SECRET_KEY = "RENT_AGREEMENT_SECRET"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

UPLOAD_DIR = "uploads"
PDF_DIR = "generated_pdfs" # Naya: PDF store karne ke liye
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# STATUS FLOW
# ======================================================

STATUS_FLOW = {
    "NEW": ["PROCESSING"],
    "PROCESSING": ["KYC"],
    "KYC": ["COMPLETED"],
    "COMPLETED": []
}

# ======================================================
# PDF GENERATOR LOGIC (Advance)
# ======================================================

def create_agreement_pdf(data, file_path):
    pdf = FPDF()
    pdf.add_page()
    
    # Border
    pdf.rect(5, 5, 200, 287)
    
    # Title
    pdf.set_font("Arial", 'B', 20)
    pdf.cell(190, 15, "RENT AGREEMENT", ln=True, align='C')
    pdf.ln(10)
    
    # Section: Owner & Tenant
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(190, 10, "1. PARTIES DETAILS", ln=True)
    pdf.set_font("Arial", '', 11)
    owner_txt = f"OWNER: {data['owner_name']} | Mobile: {data['owner_mobile']} | Aadhaar: {data['owner_aadhaar']}"
    tenant_txt = f"TENANT: {data['tenant_name']} | Mobile: {data['tenant_mobile']} | Aadhaar: {data['tenant_aadhaar']}"
    pdf.multi_cell(0, 8, owner_txt)
    pdf.multi_cell(0, 8, tenant_txt)
    pdf.ln(5)
    
    # Section: Property
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(190, 10, "2. PROPERTY ADDRESS", ln=True)
    pdf.set_font("Arial", '', 11)
    pdf.multi_cell(0, 8, f"{data['address']}, {data['city']}")
    pdf.ln(5)
    
    # Section: Terms
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(190, 10, "3. RENT & PERIOD", ln=True)
    pdf.set_font("Arial", '', 11)
    pdf.cell(0, 8, f"Monthly Rent: Rs. {data['rent_amount']}", ln=True)
    pdf.cell(0, 8, f"Security Deposit: Rs. {data['deposit']}", ln=True)
    pdf.cell(0, 8, f"Duration: {data['start_date']} to {data['end_date']}", ln=True)
    pdf.ln(10)
    
    # Footer Note
    pdf.set_font("Arial", 'I', 8)
    pdf.cell(0, 10, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", align='R')
    
    pdf.output(file_path)

# ======================================================
# DATABASE INIT
# ======================================================

def init_db():
    conn = sqlite3.connect("database.db")
    cur = conn.cursor()

    cur.execute("CREATE TABLE IF NOT EXISTS employees(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, full_name TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS owners(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, mobile TEXT, aadhaar TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS tenants(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, mobile TEXT, aadhaar TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS properties(id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id INTEGER, address TEXT, city TEXT, type TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS agreements(id INTEGER PRIMARY KEY AUTOINCREMENT, property_id INTEGER, tenant_id INTEGER, start_date TEXT, end_date TEXT, rent_amount REAL, deposit REAL, status TEXT DEFAULT 'NEW')")
    cur.execute("CREATE TABLE IF NOT EXISTS documents(id INTEGER PRIMARY KEY AUTOINCREMENT, agreement_id INTEGER, doc_type TEXT, file_path TEXT)")

    if not cur.execute("SELECT 1 FROM employees WHERE username=?", ("admin@gmail.com",)).fetchone():
        cur.execute("INSERT INTO employees VALUES(NULL,?,?,?)", ("admin@gmail.com", pwd_context.hash("123456"), "Admin"))

    conn.commit()
    conn.close()

init_db()

# ======================================================
# MODELS
# ======================================================

class LoginRequest(BaseModel):
    username: str
    password: str

class StatusUpdate(BaseModel):
    new_status: str

class TelegramAgreement(BaseModel):
    owner_name: str
    owner_mobile: str
    owner_aadhaar: str
    tenant_name: str
    tenant_mobile: str
    tenant_aadhaar: str
    address: str
    city: str
    rent: float
    deposit: float
    start_date: str
    end_date: str

# ======================================================
# ENDPOINTS (Auth, Stats, Admin Panel)
# ======================================================

@app.post("/login")
async def login(data: LoginRequest):
    conn = sqlite3.connect("database.db"); conn.row_factory = sqlite3.Row
    user = conn.execute("SELECT * FROM employees WHERE username=?", (data.username,)).fetchone()
    conn.close()
    if not user or not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode({"sub": user["username"]}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token}

@app.get("/dashboard/stats")
async def dashboard_stats():
    conn = sqlite3.connect("database.db"); cur = conn.cursor()
    total = cur.execute("SELECT COUNT(*) FROM agreements").fetchone()[0]
    pending = cur.execute("SELECT COUNT(*) FROM agreements WHERE status!='COMPLETED'").fetchone()[0]
    completed = cur.execute("SELECT COUNT(*) FROM agreements WHERE status='COMPLETED'").fetchone()[0]
    renewals = cur.execute("SELECT COUNT(*) FROM agreements WHERE julianday(end_date) - julianday('now') <= 15").fetchone()[0]
    conn.close()
    return {"total_agreements": total, "pending_agreements": pending, "completed_agreements": completed, "renewals_due": renewals}

@app.get("/agreements/all")
async def agreements_all():
    conn = sqlite3.connect("database.db"); conn.row_factory = sqlite3.Row
    rows = conn.execute("""
    SELECT ag.id, ow.name owner_name, te.name tenant_name, pr.address, ag.rent_amount, ag.status
    FROM agreements ag JOIN properties pr ON ag.property_id = pr.id
    JOIN owners ow ON pr.owner_id = ow.id JOIN tenants te ON ag.tenant_id = te.id ORDER BY ag.id DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ======================================================
# NEW: TELEGRAM PDF GENERATION
# ======================================================

@app.get("/telegram/generate-pdf/{agreement_id}")
async def telegram_generate_pdf(agreement_id: int):
    conn = sqlite3.connect("database.db"); conn.row_factory = sqlite3.Row
    row = conn.execute("""
    SELECT ag.start_date, ag.end_date, ag.rent_amount, ag.deposit,
           ow.name owner_name, ow.mobile owner_mobile, ow.aadhaar owner_aadhaar,
           te.name tenant_name, te.mobile tenant_mobile, te.aadhaar tenant_aadhaar,
           pr.address, pr.city
    FROM agreements ag
    JOIN properties pr ON ag.property_id = pr.id
    JOIN owners ow ON pr.owner_id = ow.id
    JOIN tenants te ON ag.tenant_id = te.id
    WHERE ag.id = ?
    """, (agreement_id,)).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Agreement not found")

    file_name = f"Agreement_{agreement_id}.pdf"
    file_path = os.path.join(PDF_DIR, file_name)
    
    # Create the PDF
    create_agreement_pdf(dict(row), file_path)
    
    return FileResponse(file_path, filename=file_name, media_type='application/pdf')

# ======================================================
# TELEGRAM CREATE & UPLOAD
# ======================================================

@app.post("/telegram/create-draft")
async def telegram_create(data: TelegramAgreement):
    conn = sqlite3.connect("database.db"); cur = conn.cursor()
    cur.execute("INSERT INTO owners VALUES(NULL,?,?,?)", (data.owner_name,data.owner_mobile,data.owner_aadhaar))
    owner_id = cur.lastrowid
    cur.execute("INSERT INTO tenants VALUES(NULL,?,?,?)", (data.tenant_name,data.tenant_mobile,data.tenant_aadhaar))
    tenant_id = cur.lastrowid
    cur.execute("INSERT INTO properties VALUES(NULL,?,?,?,?)", (owner_id,data.address,data.city,"TELEGRAM"))
    property_id = cur.lastrowid
    cur.execute("INSERT INTO agreements VALUES(NULL,?,?,?,?,?,?,?)", (property_id, tenant_id, data.start_date, data.end_date, data.rent, data.deposit, "NEW"))
    agreement_id = cur.lastrowid
    conn.commit(); conn.close()
    return {"agreement_id":agreement_id,"status":"NEW"}

@app.post("/telegram/upload-document")
async def telegram_upload(agreement_id: int = Form(...), doc_type: str = Form(...), file: UploadFile = File(...)):
    conn = sqlite3.connect("database.db"); cur = conn.cursor()
    ext = file.filename.split(".")[-1]
    name = f"{doc_type}_{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, name)
    with open(path,"wb") as f:
        shutil.copyfileobj(file.file, f)
    cur.execute("INSERT INTO documents VALUES(NULL,?,?,?)", (agreement_id, doc_type, f"/uploads/{name}"))
    conn.commit(); conn.close()
    return {"message":"Document uploaded","agreement_id":agreement_id}

# ======================================================
# REMAINING ENDPOINTS
# ======================================================

@app.get("/agreements/{agreement_id}")
async def agreement_details(agreement_id: int):
    conn = sqlite3.connect("database.db"); conn.row_factory = sqlite3.Row; cur = conn.cursor()
    ag = cur.execute("SELECT ag.start_date, ag.end_date, ag.rent_amount, ag.deposit, ag.status, ow.name owner_name, te.name tenant_name FROM agreements ag JOIN properties pr ON ag.property_id = pr.id JOIN owners ow ON pr.owner_id = ow.id JOIN tenants te ON ag.tenant_id = te.id WHERE ag.id=?",(agreement_id,)).fetchone()
    if not ag: raise HTTPException(status_code=404, detail="Agreement not found")
    docs = cur.execute("SELECT doc_type,file_path FROM documents WHERE agreement_id=?", (agreement_id,)).fetchall()
    conn.close()
    return {"details": dict(ag), "documents": [dict(d) for d in docs]}

@app.put("/agreements/{agreement_id}/status")
async def update_status(agreement_id: int, data: StatusUpdate):
    conn = sqlite3.connect("database.db"); cur = conn.cursor()
    current = cur.execute("SELECT status FROM agreements WHERE id=?", (agreement_id,)).fetchone()
    if not current: raise HTTPException(status_code=404, detail="Agreement not found")
    if data.new_status not in STATUS_FLOW[current[0]]: raise HTTPException(status_code=400, detail="Invalid status")
    cur.execute("UPDATE agreements SET status=? WHERE id=?", (data.new_status, agreement_id))
    conn.commit(); conn.close()
    return {"message":"Status updated"}

@app.get("/agreements/renewals")
async def renewals():
    conn = sqlite3.connect("database.db"); conn.row_factory = sqlite3.Row; cur = conn.cursor()
    rows = cur.execute("SELECT ag.id, te.name tenant_name, ag.end_date FROM agreements ag JOIN tenants te ON ag.tenant_id = te.id WHERE julianday(ag.end_date)-julianday('now')<=15").fetchall()
    result = []
    for r in rows:
        days_left = (datetime.strptime(r["end_date"], "%Y-%m-%d").date() - date.today()).days
        result.append({"id": r["id"], "tenant_name": r["tenant_name"], "end_date": r["end_date"], "days_left": days_left})
    conn.close()
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)




