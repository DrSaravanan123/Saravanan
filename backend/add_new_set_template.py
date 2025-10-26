"""
Template Script to Add New Question Set

Instructions:
1. Copy this file and rename it (e.g., add_set2_questions.py)
2. Replace the sample questions with your actual questions
3. Run: python add_set2_questions.py

Make sure to update:
- set_number (e.g., 2, 3, 4, etc.)
- question IDs (e.g., tamil_s2_1, physics_s2_1)
- All question content
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ============= SET NUMBER - CHANGE THIS =============
SET_NUMBER = 2  # Change to 2, 3, 4, etc.
# ====================================================

# Tamil Questions Template - 30 questions
tamil_questions = [
    {
        "id": f"tamil_s{SET_NUMBER}_1",
        "question_number": 1,
        "question_text": "உங்கள் தமிழ் கேள்வி இங்கே",
        "options": [
            {"label": "A", "text": "விருப்பம் A"},
            {"label": "B", "text": "விருப்பம் B"},
            {"label": "C", "text": "விருப்பம் C"},
            {"label": "D", "text": "விருப்பம் D"}
        ],
        "correct_answer": "A",
        "marks": 2,  # First 20 questions: 2 marks
        "subject": "tamil",
        "part": "A",
        "set_number": SET_NUMBER
    },
    # Add remaining 29 Tamil questions here
    # Questions 1-20: marks = 2
    # Questions 21-30: marks = 1
]

# Physics Questions Template - 100 questions
physics_questions = [
    {
        "id": f"physics_s{SET_NUMBER}_1",
        "question_number": 1,
        "question_text": "Your physics question here",
        "options": [
            {"label": "A", "text": "Option A"},
            {"label": "B", "text": "Option B"},
            {"label": "C", "text": "Option C"},
            {"label": "D", "text": "Option D"}
        ],
        "correct_answer": "A",
        "marks": 1.5,  # All physics questions: 1.5 marks
        "subject": "physics",
        "part": "B",
        "set_number": SET_NUMBER
    },
    # Add remaining 99 Physics questions here
    # All questions: marks = 1.5
]

async def seed_new_set():
    # Check if set already exists
    existing = await db.questions.count_documents({"set_number": SET_NUMBER})
    if existing > 0:
        print(f"⚠️  Warning: Set {SET_NUMBER} already has {existing} questions!")
        response = input("Do you want to continue and add more? (yes/no): ")
        if response.lower() != 'yes':
            print("Operation cancelled.")
            return
    
    # Insert questions
    all_questions = tamil_questions + physics_questions
    
    if len(all_questions) < 130:
        print(f"⚠️  Warning: You have only {len(all_questions)} questions.")
        print(f"Expected: 130 questions (30 Tamil + 100 Physics)")
        response = input("Do you want to continue anyway? (yes/no): ")
        if response.lower() != 'yes':
            print("Operation cancelled.")
            return
    
    await db.questions.insert_many(all_questions)
    
    # Verify
    tamil_count = await db.questions.count_documents({
        "subject": "tamil",
        "set_number": SET_NUMBER
    })
    physics_count = await db.questions.count_documents({
        "subject": "physics",
        "set_number": SET_NUMBER
    })
    
    print(f"✅ Set {SET_NUMBER} added successfully!")
    print(f"📝 Tamil questions: {tamil_count}")
    print(f"📝 Physics questions: {physics_count}")
    print(f"📝 Total questions: {tamil_count + physics_count}")
    
    if tamil_count == 30 and physics_count == 100:
        print("✨ Perfect! All questions added correctly.")
    else:
        print(f"⚠️  Expected: 30 Tamil + 100 Physics = 130 total")

if __name__ == "__main__":
    asyncio.run(seed_new_set())
    client.close()
