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

# ==================== STATS ====================

@api_router.get("/stats")
async def get_stats():
    total_users = await db.users.count_documents({})
    total_attempts = await db.test_attempts.count_documents({})
    return {
        "total_users": total_users,
        "total_attempts": total_attempts
    }

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