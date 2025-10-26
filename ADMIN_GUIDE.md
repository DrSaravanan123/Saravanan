# Physics Master - Admin Guide

## Admin Dashboard Access

**URL:** `http://your-domain.com/admin`

### Default Login Credentials:
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change these credentials in `/app/backend/server.py` (line ~270) before going live!

---

## Admin Dashboard Features

### 1. **Dashboard Overview**
- View total registered users
- View total question sets
- View total test attempts

### 2. **Question Sets Management**
- **View All Sets:** See all available question sets with counts
- **Delete Set:** Remove entire set (Tamil + Physics questions)
- **Set Pricing:** Currently ₹100 per set (can be modified)

### 3. **Manage Questions**
- **View Questions:** Click on any set to view all questions
- **Edit Question:** Fix incorrect questions, update text, options, or correct answer
- **Delete Question:** Remove individual incorrect questions
- **Filters:** View by subject (Tamil/Physics) and set number

### 4. **Users & Stats**
- View all registered users
- See registration dates
- Monitor test attempts

---

## How to Add New Question Sets

### Current Structure:
- **Set 1:** 30 Tamil + 100 Physics (Already added ✅)
- **Set 2-10:** To be added

### Method 1: Using Python Script (Recommended)

1. **Prepare your questions in the format:**
```python
# For Set 2
tamil_questions_set2 = [
    {
        "id": "tamil_s2_1",
        "question_number": 1,
        "question_text": "Your question here",
        "options": [
            {"label": "A", "text": "Option A"},
            {"label": "B", "text": "Option B"},
            {"label": "C", "text": "Option C"},
            {"label": "D", "text": "Option D"}
        ],
        "correct_answer": "A",
        "marks": 2,
        "subject": "tamil",
        "part": "A",
        "set_number": 2
    },
    # ... more questions
]
```

2. **Run the seed script:**
```bash
cd /app/backend
python add_set2_questions.py
```

### Method 2: Via Admin Dashboard (Coming Soon)
- Upload Excel/CSV with questions
- Automatic formatting and validation
- Bulk import feature

---

## Pricing Structure

### Current Pricing (Sets 1-9):
- Each Set: **₹100**

### When All 10 Sets Complete:
- Individual Set: **₹100**
- **Combo Pack (All 10 Sets): ₹800** (Save ₹200!)

### To Update Pricing:
Edit `/app/backend/server.py` - Admin routes section

---

## Question Set Requirements

### Tamil Section (Part A):
- First 20 questions: **2 marks each** = 40 marks
- Next 10 questions: **1 mark each** = 10 marks
- **Total: 30 questions = 50 marks**

### Physics Section (Part B):
- 100 questions: **1.5 marks each**
- **Total: 100 questions = 150 marks**

### Grand Total Per Set:
- **130 questions = 200 marks**
- **Time Limit:** 3 hours

---

## Database Structure

### Collections:
1. **users** - Registered users
2. **questions** - All questions with set_number
3. **test_attempts** - Test submissions and scores
4. **feedback** - User feedback

### Question Document Structure:
```javascript
{
    "id": "unique_id",
    "question_number": 1,
    "question_text": "Question text",
    "options": [{"label": "A", "text": "Option A"}, ...],
    "correct_answer": "A",
    "marks": 1.5,
    "subject": "tamil" or "physics",
    "part": "A" or "B",
    "set_number": 1  // Important for multiple sets
}
```

---

## API Endpoints (Admin Only)

### Authentication:
- `POST /api/admin/login` - Admin login

### Question Sets:
- `GET /api/admin/question-sets` - Get all sets
- `DELETE /api/admin/question-sets/{set_number}` - Delete entire set

### Questions:
- `GET /api/admin/questions?subject=tamil&set_number=1` - Get filtered questions
- `POST /api/admin/questions/bulk` - Add multiple questions
- `PUT /api/admin/questions/{question_id}` - Update question
- `DELETE /api/admin/questions/{question_id}` - Delete question

### Users & Stats:
- `GET /api/admin/users` - Get all users
- `GET /api/admin/test-attempts` - Get all test attempts

---

## Security Notes

### Before Going Live:

1. **Change Admin Credentials:**
```python
# In /app/backend/server.py
ADMIN_USERNAME = "your_secure_username"
ADMIN_PASSWORD = "your_secure_password_here"
```

2. **Use Environment Variables:**
```bash
# In /app/backend/.env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

3. **Add IP Restrictions** (Optional):
Only allow admin access from specific IPs

---

## Roadmap: 10 Sets Plan

### Phase 1: Sets 1-3 (Current)
- ✅ Set 1: Complete (30 Tamil + 100 Physics)
- ⏳ Set 2: Pending your questions
- ⏳ Set 3: Pending your questions

### Phase 2: Sets 4-6
- Individual pricing: ₹100 each
- Start promoting combo deals

### Phase 3: Sets 7-10
- Complete all 10 sets
- Launch **Combo Pack: ₹800**
- Limited time offer: ₹700

---

## Support & Maintenance

### Adding New Features:
- Video explanations per question
- Practice mode (untimed)
- Topic-wise tests
- Performance analytics
- Leaderboard

### Contact for Technical Support:
- Email: [Your Email]
- Phone: [Your Phone]

---

## Quick Commands

### View Admin Dashboard:
Navigate to: `/admin`

### Check Backend Status:
```bash
sudo supervisorctl status backend
```

### View Backend Logs:
```bash
tail -f /var/log/supervisor/backend.err.log
```

### Restart Backend:
```bash
sudo supervisorctl restart backend
```

---

**Last Updated:** October 2025
**Version:** 1.0
