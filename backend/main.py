from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Date
from sqlalchemy.orm import sessionmaker, declarative_base, scoped_session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
import os
import subprocess
import pandas as pd
from datetime import datetime
from threading import Thread
import io

app = FastAPI()

# Database setup
DATABASE_URL = "mysql+pymysql://root:1826@localhost/walmart"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# LLaMA3 suggestion tracking
analysis_status = "idle"
analysis_result = ""

# ------------------ DATABASE MODELS ------------------
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    productId = Column(String(255))
    image = Column(String(255))
    stock = Column(Integer)
    manufactureDate = Column(Date)
    expiryDate = Column(Date)
    normalDate = Column(Date)

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    key = Column(String(255))

Base.metadata.create_all(bind=engine)

# ------------------ SCHEMAS ------------------
class ProductIn(BaseModel):
    name: str
    productId: str
    image: str
    stock: int
    manufactureDate: str
    expiryDate: str
    normalDate: str

class AdminIn(BaseModel):
    email: str
    password: str
    key: str

# ------------------ CORS ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ UTIL ------------------
def run_llama3_with_subprocess(prompt_text: str) -> str:
    try:
        result = subprocess.run(
            ["ollama", "run", "llama3"],
            input=prompt_text,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=700,
            text=True,
            encoding="utf-8"  # Ensure UTF-8 decoding to avoid UnicodeDecodeError
        )

        if result.returncode == 0:
            return result.stdout.strip()
        else:
            return f"Ollama error:\n{result.stderr.strip()}"
    except subprocess.TimeoutExpired:
        return "Llama3 analysis timed out (subprocess)."
    except Exception as e:
        return f"Unexpected error: {str(e)}"


# ------------------ PRODUCT ROUTES ------------------
@app.get("/api/products")
def get_products():
    db = SessionLocal()
    products = db.query(Product).all()
    db.close()
    return [
        {
            "id": p.id,
            "name": p.name,
            "productId": p.productId,
            "image": p.image,
            "stock": p.stock,
            "manufactureDate": p.manufactureDate.isoformat() if p.manufactureDate else None,
            "expiryDate": p.expiryDate.isoformat() if p.expiryDate else None,
            "normalDate": p.normalDate.isoformat() if p.normalDate else None,
        }
        for p in products
    ]

@app.post("/api/products")
def add_product(product: ProductIn):
    db = SessionLocal()
    db_product = Product(
        name=product.name,
        productId=product.productId,
        image=product.image,
        stock=product.stock,
        manufactureDate=datetime.strptime(product.manufactureDate, "%Y-%m-%d").date(),
        expiryDate=datetime.strptime(product.expiryDate, "%Y-%m-%d").date(),
        normalDate=datetime.strptime(product.normalDate, "%Y-%m-%d").date()
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    db.close()
    return db_product

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int):
    db = SessionLocal()
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    db.close()
    return {"message": "Product deleted"}

@app.put("/api/products/{product_id}")
def update_product(product_id: int, product: ProductIn):
    db = SessionLocal()
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")
    db_product.name = product.name
    db_product.productId = product.productId
    db_product.image = product.image
    db_product.stock = product.stock
    db_product.manufactureDate = datetime.strptime(product.manufactureDate, "%Y-%m-%d").date()
    db_product.expiryDate = datetime.strptime(product.expiryDate, "%Y-%m-%d").date()
    db_product.normalDate = datetime.strptime(product.normalDate, "%Y-%m-%d").date()
    db.commit()
    db.refresh(db_product)
    db.close()
    return db_product

# ------------------ ADMIN ROUTES ------------------
@app.post("/api/admin/register")
def register_admin(admin: AdminIn):
    db = SessionLocal()
    existing = db.query(Admin).filter(Admin.email == admin.email).first()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Admin already exists")
    db_admin = Admin(email=admin.email, password=admin.password, key=admin.key)
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    db.close()
    return db_admin

@app.post("/api/admin/login")
def login_admin(admin: AdminIn):
    db = SessionLocal()
    db_admin = db.query(Admin).filter(
        Admin.email == admin.email,
        Admin.password == admin.password,
        Admin.key == admin.key
    ).first()
    db.close()
    if not db_admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful"}
 
# ------------------ FILE FORECAST ------------------
@app.get("/api/files")
def list_csv_files():
    files_dir = os.path.join(os.path.dirname(__file__), "files")
    return [f for f in os.listdir(files_dir) if f.endswith('.csv')]

@app.post("/api/files/generate-forecast/{filename}")
def generate_forecast(filename: str, background_tasks: BackgroundTasks):
    csv_path = os.path.join("files", filename)
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="CSV file not found")

    def run_forecast():
        subprocess.run(["python", "models.py", filename])

    background_tasks.add_task(run_forecast)
    return {"message": "Forecast generation started"}

@app.get("/api/files/download-pdf/{filename}")
def download_pdf(filename: str):
    pdf_path = os.path.join("pdfs", filename)
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(pdf_path, media_type="application/pdf", filename=filename)

@app.get("/api/files/generate-pdf/{filename}")
def generate_pdf_from_csv(filename: str):
    csv_path = os.path.join("files", filename)
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="CSV file not found")

    # Read CSV and generate a summary prompt
    try:
        df = pd.read_csv(csv_path)
        summary = f"# Forecast Summary for {filename}\n\n"
        summary += f"Dataset contains {len(df)} records with columns: {', '.join(df.columns)}\n\n"
        if 'Month' in df.columns:
            df['Month'] = pd.to_datetime(df['Month'])
            summary += f"Date range: {df['Month'].min().strftime('%Y-%m')} to {df['Month'].max().strftime('%Y-%m')}\n\n"
        if 'Passengers' in df.columns:
            summary += f"Average Passengers: {df['Passengers'].mean():.2f}\n"
            summary += f"Min Passengers: {df['Passengers'].min()} | Max Passengers: {df['Passengers'].max()}\n"
        summary += "\n12-Month Forecast generated using:\n- LSTM Neural Network\n- Facebook Prophet\n\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading CSV: {str(e)}")

    # Call Llama3/Ollama with a direct prompt (no forecast_prompt.txt)
    # Enhanced prompt: Add data summary, more insights, and request tabular format if possible
    if len(df) > 0:
        product_name = filename.replace('.csv', '')
        stock = df.iloc[-1]['Passengers'] if 'Passengers' in df.columns else 'N/A'
        expiry = df['Month'].max().strftime('%Y-%m-%d') if 'Month' in df.columns else 'N/A'
        summary = f"Product: {product_name}, Stock: {stock}, Expiry: {expiry}\n"
        data_overview = df.describe(include='all').to_string()
    else:
        summary = "No product data available."
        data_overview = "No data overview available."
    prompt = (
        "Provide a business summary and actionable insights for the following product. "
        "Include a summary of the selected data, highlight trends, risks, and opportunities, and provide a reorder recommendation based on recent stock movement. "
        "If possible, present the insights in a clear tabular format. Do not include technical explanations or mention AI. Only provide business insights in plain text.\n\nProduct Data:\n" 
        + summary + "\nData Overview:\n" + data_overview
    )
    result = run_llama3_with_subprocess(prompt)

    # Save the result as a PDF (simulate for now)
    pdf_filename = filename.replace('.csv', '.pdf')
    pdf_path = os.path.join("pdfs", pdf_filename)
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        c = canvas.Canvas(pdf_path, pagesize=letter)

        # Add title and summary text on the first page
        c.setFont("Helvetica-Bold", 16)
        c.drawString(40, 800, "Business-Style PDF Report")
        c.setFont("Helvetica", 12)
        textobject = c.beginText(40, 780)
        max_width = 500  # width in points for text wrapping
        for line in result.splitlines():
            # Wrap long lines to fit within max_width
            while c.stringWidth(line, "Helvetica", 12) > max_width:
                # Find the last space within max_width
                cut = max_width
                for i in range(len(line)):
                    if c.stringWidth(line[:i], "Helvetica", 12) > max_width:
                        cut = i
                        break
                # Backtrack to last space
                if cut < len(line):
                    space = line.rfind(' ', 0, cut)
                    if space > 0:
                        textobject.textLine(line[:space])
                        line = line[space+1:]
                    else:
                        textobject.textLine(line[:cut])
                        line = line[cut:]
                else:
                    break
            textobject.textLine(line)
        c.drawText(textobject)
        c.showPage()  # Move to the next page

        # Add graphs on subsequent pages
        future_plot_path = os.path.join("outputs", "future_plot.png")
        decompose_plot_path = os.path.join("outputs", "decompose_plot.png")
        if os.path.exists(future_plot_path):
            c.drawImage(future_plot_path, 40, 500, width=500, height=300)
            c.showPage()  # Move to the next page
        if os.path.exists(decompose_plot_path):
            c.drawImage(decompose_plot_path, 40, 500, width=500, height=300)

        c.save()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")
    return {"message": "PDF generated", "pdf_file": pdf_filename}

# ------------------ SUGGESTIONS (LLAMA3) ------------------
@app.get("/api/products/suggestions")
def get_suggestions():
    global analysis_status, analysis_result

    if analysis_status == "idle":
        analysis_status = "analyzing"
        analysis_result = ""

        def run_llama3_analysis():
            global analysis_status, analysis_result
            try:
                session = scoped_session(SessionLocal)
                products = session.query(Product).all()
                session.remove()

                if not products:
                    analysis_result = "No products found to analyze."
                    analysis_status = "done"
                    return

                # Prompt for dashboard suggestions (restore to business-style for all products)
                discount_logic = """
Generate a business report with intelligent discounting recommendations based on product shelf life and forecasted demand.
Apply the following principles:
- Highly perishable products (e.g., milk) should receive high-priority discounts shortly before expiry (typically within the last 3 days).
- For other products, discount urgency should be proportional to their shelf life. A product nearing the end of its shelf life should receive increasing discounts as it approaches expiry.
- The discount timing should scale dynamically: shorter shelf life demands earlier discounts relative to the expiry window.
- Align the discount strategy with demand forecasts to optimize inventory turnover, reduce waste, and maintain profitability.
Use this logic to evaluate forecasted trends and suggest practical discount windows and amounts per product.

- Conclude with actionable insights: Based on current and historical trends, estimate how many units of each product should be reordered to meet future demand without overstocking.
- Do not include technical explanations of how predictions were generated. Avoid mentioning AI, forecasting models, or algorithms. Focus purely on the business insights.
- The same analysis content written in the PDF must also be returned as plain text so it can be displayed on the frontend below the graphs.
- Ensure that all images (graphs and visualizations) in the PDF are clearly readable and properly sized, avoiding compression or distortion.
- Remove any markdown formatting such as stars (`**word**`) used for emphasis. Only include plain, professional text.
"""
                summary = ""
                for p in products:
                    summary += f"Product: {p.name}, Stock: {p.stock}, Expiry: {p.expiryDate}\n"
                prompt = discount_logic + "\n\nProduct Data:\n" + summary
                result = run_llama3_with_subprocess(prompt)
                analysis_result = result
                analysis_status = "done"
            except Exception as e:
                analysis_result = f"Llama3 analysis failed: {str(e)}"
                analysis_status = "done"

        Thread(target=run_llama3_analysis).start()

    return {"status": analysis_status, "result": analysis_result}

# ------------------ AI CHAT ------------------
@app.post("/api/ai/chat")
def chat_with_ai(request: dict):
    user_message = request.get("message", "")
    if not user_message:
        return {"response": "No message provided."}
    prompt = f"You are an AI business assistant. Answer the following user query in a clear, concise, and business-focused way.\n\nUser: {user_message}\nAI:"
    result = run_llama3_with_subprocess(prompt)
    return {"response": result}

@app.get("/api/products/suggestions/pdf")
def download_suggestions_pdf():
    global analysis_result
    if not analysis_result:
        raise HTTPException(status_code=404, detail="No suggestion available to export.")
    buffer = io.BytesIO()
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, 800, "AI Suggestions Report")
    c.setFont("Helvetica", 12)
    textobject = c.beginText(40, 780)
    max_width = 500
    for line in analysis_result.splitlines():
        while c.stringWidth(line, "Helvetica", 12) > max_width:
            cut = max_width
            for i in range(len(line)):
                if c.stringWidth(line[:i], "Helvetica", 12) > max_width:
                    cut = i
                    break
            if cut < len(line):
                space = line.rfind(' ', 0, cut)
                if space > 0:
                    textobject.textLine(line[:space])
                    line = line[space+1:]
                else:
                    textobject.textLine(line[:cut])
                    line = line[cut:]
            else:
                break
        textobject.textLine(line)
    c.drawText(textobject)
    c.save()
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=suggestions.pdf"})

# ------------------ FRONTEND ROUTING ------------------
outputs_path = os.path.join(os.path.dirname(__file__), "outputs")
if os.path.exists(outputs_path):
    app.mount("/static/outputs", StaticFiles(directory=outputs_path), name="outputs")

frontend_build_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build')
if os.path.exists(frontend_build_path):
    app.mount("/", StaticFiles(directory=frontend_build_path, html=True), name="static")

@app.get("/{full_path:path}")
def serve_react_app(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not Found")
    index_path = os.path.join(frontend_build_path, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="React app not built")
