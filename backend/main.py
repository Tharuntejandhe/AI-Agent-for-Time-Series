from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()
# Update the DATABASE_URL with your MySQL credentials and database name
DATABASE_URL = "mysql+pymysql://root:12345@localhost/walmart"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    productId = Column(String(255))
    image = Column(String(255))
    stock = Column(Integer)

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    key = Column(String(255))

class ProductIn(BaseModel):
    name: str
    productId: str
    image: str
    stock: int

class AdminIn(BaseModel):
    email: str
    password: str
    key: str

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/products")
def get_products():
    db = SessionLocal()
    products = db.query(Product).all()
    db.close()
    # Convert SQLAlchemy objects to dicts for frontend compatibility
    product_list = [
        {
            "id": p.id,
            "name": p.name,
            "productId": p.productId,
            "image": p.image,
            "stock": p.stock
        }
        for p in products
    ]
    return product_list

@app.post("/api/products")
def add_product(product: ProductIn):
    db = SessionLocal()
    db_product = Product(name=product.name, productId=product.productId, image=product.image, stock=product.stock)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    db.close()
    return db_product

@app.api_route("/api/admin/register", methods=["POST"])
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
    return {"message": "Admin registered successfully"}

@app.api_route("/api/admin/login", methods=["POST"])
def login_admin(admin: AdminIn):
    db = SessionLocal()
    print(f"Login attempt: email={admin.email}, password={admin.password}, key={admin.key}")
    db_admin = db.query(Admin).filter(Admin.email == admin.email, Admin.password == admin.password, Admin.key == admin.key).first()
    print(f"DB result: {db_admin}")
    db.close()
    if db_admin:
        return {"message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials or admin key")

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
    db.commit()
    db.refresh(db_product)
    db.close()
    return db_product

# Serve React static files
frontend_build_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build')
if os.path.exists(frontend_build_path):
    app.mount("/", StaticFiles(directory=frontend_build_path, html=True), name="static")

# Catch-all route for React Router (serves index.html for any non-API route)
@app.get("/{full_path:path}")
def serve_react_app(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not Found")
    index_path = os.path.join(frontend_build_path, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="React app not built")
