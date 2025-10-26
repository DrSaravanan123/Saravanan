from fastapi import FastAPI, APIRouter, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import bcrypt
import random
import hmac
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    password: str  # Will be hashed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str

class QuestionOption(BaseModel):
    label: str
    text: str

class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_number: int
    question_text: str
    options: List[QuestionOption]
    correct_answer: str
    marks: float
    subject: str  # "tamil" or "physics"
    part: str  # "A" or "B"

class Answer(BaseModel):
    question_id: str
    selected_answer: str

class TestAttempt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    test_type: str  # "sample" or "full"
    answers: List[Answer]
    score: float
    total_marks: float
    time_taken: int  # in seconds
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TestSubmission(BaseModel):
    user_id: Optional[str] = None
    test_type: str
    answers: List[Answer]
    time_taken: int

class Feedback(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    message: str
    rating: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FeedbackCreate(BaseModel):
    name: str
    email: EmailStr
    message: str
    rating: Optional[int] = None

class PaymentOrder(BaseModel):
    amount: int
    currency: str = "INR"
    receipt: str
    
class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    user_id: str
    set_number: int

class StudyMaterial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    file_url: Optional[str] = None
    file_type: str  # "pdf", "video", "notes"
    subject: str  # "tamil", "physics", "general"
    set_number: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class StudyMaterialCreate(BaseModel):
    title: str
    description: str
    file_url: Optional[str] = None
    file_type: str
    subject: str
    set_number: Optional[int] = None

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    existing_email = await db.users.find_one({"email": user_data.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    
    user = User(
        username=user_data.username,
        email=user_data.email,
        password=hashed_password.decode('utf-8')
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    return UserResponse(id=user.id, username=user.username, email=user.email)

@api_router.post("/auth/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return UserResponse(id=user['id'], username=user['username'], email=user['email'])

# ==================== QUESTIONS ROUTES ====================

@api_router.get("/questions/sample")
async def get_sample_questions():
    # Get 10 random physics questions
    all_physics = await db.questions.find({"subject": "physics"}, {"_id": 0}).to_list(None)
    
    if len(all_physics) >= 10:
        sample = random.sample(all_physics, 10)
    else:
        sample = all_physics
    
    # Remove correct answers from sample
    for q in sample:
        q.pop('correct_answer', None)
    
    return {"questions": sample, "total_marks": 15, "time_limit": 900}  # 15 minutes

@api_router.get("/questions/full")
async def get_full_questions():
    # Get all questions (Tamil + Physics)
    tamil_questions = await db.questions.find({"subject": "tamil"}, {"_id": 0}).to_list(None)
    physics_questions = await db.questions.find({"subject": "physics"}, {"_id": 0}).to_list(None)
    
    # Remove correct answers
    for q in tamil_questions + physics_questions:
        q.pop('correct_answer', None)
    
    return {
        "tamil_questions": tamil_questions,
        "physics_questions": physics_questions,
        "total_marks": 200,
        "time_limit": 10800  # 3 hours
    }

# ==================== TEST SUBMISSION ====================

@api_router.post("/test/submit")
async def submit_test(submission: TestSubmission):
    # Get all questions with answers
    question_ids = [ans.question_id for ans in submission.answers]
    questions = await db.questions.find({"id": {"$in": question_ids}}, {"_id": 0}).to_list(None)
    
    # Create question lookup
    q_lookup = {q['id']: q for q in questions}
    
    # Calculate score and detailed results
    score = 0
    total_marks = 0
    detailed_results = []
    
    for ans in submission.answers:
        question = q_lookup.get(ans.question_id)
        if question:
            total_marks += question['marks']
            is_correct = ans.selected_answer == question['correct_answer']
            if is_correct:
                score += question['marks']
            
            detailed_results.append({
                "question_id": ans.question_id,
                "question_number": question['question_number'],
                "question_text": question['question_text'],
                "selected_answer": ans.selected_answer,
                "correct_answer": question['correct_answer'],
                "is_correct": is_correct,
                "marks": question['marks'],
                "options": question['options']
            })
    
    # Save test attempt
    attempt = TestAttempt(
        user_id=submission.user_id,
        test_type=submission.test_type,
        answers=submission.answers,
        score=score,
        total_marks=total_marks,
        time_taken=submission.time_taken
    )
    
    doc = attempt.model_dump()
    doc['submitted_at'] = doc['submitted_at'].isoformat()
    await db.test_attempts.insert_one(doc)
    
    return {
        "attempt_id": attempt.id,
        "score": score,
        "total_marks": total_marks,
        "percentage": round((score / total_marks * 100), 2) if total_marks > 0 else 0,
        "detailed_results": detailed_results
    }

# ==================== FEEDBACK ====================

@api_router.post("/feedback")
async def submit_feedback(feedback_data: FeedbackCreate):
    feedback = Feedback(**feedback_data.model_dump())
    doc = feedback.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.feedback.insert_one(doc)
    return {"message": "Feedback submitted successfully", "id": feedback.id}

# ==================== PAYMENT ROUTES ====================

@api_router.post("/payment/create-order")
async def create_payment_order(set_number: int, user_id: str):
    import razorpay
    
    razorpay_key = os.environ.get('RAZORPAY_KEY_ID')
    razorpay_secret = os.environ.get('RAZORPAY_KEY_SECRET')
    
    client = razorpay.Client(auth=(razorpay_key, razorpay_secret))
    
    # Amount in paise (100 rupees = 10000 paise)
    amount = 10000  # ₹100
    
    # Create shorter receipt ID (max 40 characters)
    receipt_id = f"set{set_number}_{uuid.uuid4().hex[:20]}"
    
    order_data = {
        'amount': amount,
        'currency': 'INR',
        'receipt': receipt_id,
        'notes': {
            'set_number': set_number,
            'user_id': user_id
        }
    }
    
    order = client.order.create(data=order_data)
    
    return {
        "order_id": order['id'],
        "amount": order['amount'],
        "currency": order['currency'],
        "key_id": razorpay_key
    }

@api_router.post("/payment/verify")
async def verify_payment(verification: PaymentVerification):
    razorpay_secret = os.environ.get('RAZORPAY_KEY_SECRET')
    
    # Verify signature
    generated_signature = hmac.new(
        razorpay_secret.encode(),
        f"{verification.razorpay_order_id}|{verification.razorpay_payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()
    
    if generated_signature != verification.razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    # Payment verified - grant access
    access_doc = {
        "id": str(uuid.uuid4()),
        "user_id": verification.user_id,
        "set_number": verification.set_number,
        "payment_id": verification.razorpay_payment_id,
        "order_id": verification.razorpay_order_id,
        "amount": 100,
        "purchased_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    await db.purchased_sets.insert_one(access_doc)
    
    return {
        "success": True,
        "message": "Payment verified successfully",
        "set_number": verification.set_number
    }

@api_router.get("/payment/check-access/{user_id}/{set_number}")
async def check_set_access(user_id: str, set_number: int):
    # Check if user has purchased this set
    access = await db.purchased_sets.find_one({
        "user_id": user_id,
        "set_number": set_number,
        "is_active": True
    })
    
    return {"has_access": access is not None}

# ==================== STUDY MATERIALS ====================

@api_router.get("/study-materials")
async def get_study_materials(subject: Optional[str] = None):
    query = {"is_active": True}
    if subject:
        query["subject"] = subject
    
    materials = await db.study_materials.find(query, {"_id": 0}).to_list(None)
    return {"materials": materials}

@api_router.post("/admin/study-materials")
async def add_study_material(material_data: StudyMaterialCreate):
    material = StudyMaterial(**material_data.model_dump())
    doc = material.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.study_materials.insert_one(doc)
    return {"message": "Study material added successfully", "id": material.id}

@api_router.delete("/admin/study-materials/{material_id}")
async def delete_study_material(material_id: str):
    result = await db.study_materials.delete_one({"id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Study material deleted successfully"}

# ==================== STATS ====================

@api_router.get("/stats")
async def get_stats():
    total_users = await db.users.count_documents({})
    total_attempts = await db.test_attempts.count_documents({})
    return {
        "total_users": total_users,
        "total_attempts": total_attempts
    }

# ==================== ADMIN ROUTES ====================

class AdminLogin(BaseModel):
    username: str
    password: str

class QuestionSetCreate(BaseModel):
    set_number: int
    set_name: str
    tamil_questions: List[Dict[str, Any]]
    physics_questions: List[Dict[str, Any]]
    price: int = 100
    is_active: bool = True

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    options: Optional[List[QuestionOption]] = None
    correct_answer: Optional[str] = None
    marks: Optional[float] = None

@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    # Simple admin authentication - you can change these credentials
    ADMIN_USERNAME = "admin"
    ADMIN_PASSWORD = "admin123"  # Change this to a secure password
    
    if credentials.username == ADMIN_USERNAME and credentials.password == ADMIN_PASSWORD:
        return {"success": True, "message": "Admin logged in successfully"}
    else:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

@api_router.get("/admin/question-sets")
async def get_all_question_sets():
    # Get unique set numbers from questions
    tamil_sets = await db.questions.distinct("set_number", {"subject": "tamil"})
    physics_sets = await db.questions.distinct("set_number", {"subject": "physics"})
    
    all_sets = set(tamil_sets + physics_sets)
    
    sets_data = []
    for set_num in sorted(all_sets):
        tamil_count = await db.questions.count_documents({"subject": "tamil", "set_number": set_num})
        physics_count = await db.questions.count_documents({"subject": "physics", "set_number": set_num})
        
        sets_data.append({
            "set_number": set_num,
            "set_name": f"Set {set_num}",
            "tamil_questions": tamil_count,
            "physics_questions": physics_count,
            "total_questions": tamil_count + physics_count,
            "price": 100,
            "is_active": True
        })
    
    return {"sets": sets_data}

@api_router.get("/admin/questions")
async def get_all_questions(subject: Optional[str] = None, set_number: Optional[int] = None):
    query = {}
    if subject:
        query["subject"] = subject
    if set_number:
        query["set_number"] = set_number
    
    questions = await db.questions.find(query, {"_id": 0}).to_list(None)
    return {"questions": questions}

@api_router.post("/admin/questions/bulk")
async def add_questions_bulk(questions_data: List[Dict[str, Any]]):
    # Add set_number to each question if not present
    for q in questions_data:
        if "set_number" not in q:
            q["set_number"] = 1
        if "id" not in q:
            q["id"] = str(uuid.uuid4())
    
    await db.questions.insert_many(questions_data)
    return {"message": f"Added {len(questions_data)} questions successfully"}

@api_router.put("/admin/questions/{question_id}")
async def update_question(question_id: str, update_data: QuestionUpdate):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.questions.update_one({"id": question_id}, {"$set": update_dict})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return {"message": "Question updated successfully"}

@api_router.delete("/admin/questions/{question_id}")
async def delete_question(question_id: str):
    result = await db.questions.delete_one({"id": question_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return {"message": "Question deleted successfully"}

@api_router.delete("/admin/question-sets/{set_number}")
async def delete_question_set(set_number: int):
    result = await db.questions.delete_many({"set_number": set_number})
    
    return {
        "message": f"Deleted set {set_number} successfully",
        "deleted_count": result.deleted_count
    }

@api_router.get("/admin/users")
async def get_all_users():
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(None)
    return {"users": users}

@api_router.get("/admin/test-attempts")
async def get_all_attempts():
    attempts = await db.test_attempts.find({}, {"_id": 0}).to_list(None)
    return {"attempts": attempts}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()