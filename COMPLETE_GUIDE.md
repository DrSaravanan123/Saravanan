# Complete Setup & User Guide
## Physics Master - TRB Mock Exam Website

---

## 🎯 ADMIN PANEL ACCESS

### How to Access Admin Panel:

**Step 1:** Navigate to your website
**Step 2:** Add `/admin` to the end of your URL

**Example:**
- If your website is: `https://your-site.com`
- Admin panel is at: `https://your-site.com/admin`
- If testing locally: `http://localhost:3000/admin`

### Admin Login Credentials:

```
Username: admin
Password: admin123
```

⚠️ **IMPORTANT SECURITY:**
Change these credentials before going live! 
Location: `/app/backend/server.py` (around line 280)

```python
ADMIN_USERNAME = "your_new_username"
ADMIN_PASSWORD = "your_new_secure_password"
```

---

## 📚 ADMIN DASHBOARD FEATURES

### 1. **Question Sets Management**
- View all question sets with counts
- Delete entire sets
- Monitor set status
- Pricing per set (currently ₹100)

### 2. **Manage Questions**
- Edit individual questions
- Fix incorrect questions
- Update options and correct answers
- Delete wrong questions
- Filter by subject and set number

### 3. **Study Materials** (NEW!)
- Add PDF study materials
- Add video links
- Add notes
- Organize by subject (Tamil/Physics/General)
- Delete materials

### 4. **Users & Statistics**
- View all registered users
- Monitor test attempts
- Track user activity
- View dashboard analytics

---

## 📖 STUDY MATERIALS SECTION

### For Users:
- Access: Click "Study Materials" button in header
- URL: `/study-materials`
- Filter by: All, Tamil, Physics, General
- Download PDFs and access video links

### For Admin (Adding Materials):

**Step 1:** Go to Admin Panel (`/admin`)
**Step 2:** Click "Study Materials" tab
**Step 3:** Click "Add Material" button
**Step 4:** Fill in details:
- **Title:** Material name (e.g., "Physics Formula Sheet")
- **Description:** Brief description
- **File URL:** Link to PDF/Video (Google Drive, Dropbox, YouTube, etc.)
- **File Type:** PDF, Video, or Notes
- **Subject:** General, Tamil, or Physics

**Step 5:** Click "Add Material"

**Example URLs:**
- Google Drive: `https://drive.google.com/file/d/YOUR_FILE_ID/view`
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
- Dropbox: `https://www.dropbox.com/s/YOUR_FILE/file.pdf`

---

## 💳 PAYMENT INTEGRATION (RAZORPAY)

### Status: ✅ INTEGRATED (Test Mode)

### Credentials Added:
- **Key ID:** rzp_test_RY6r4AqN074hem
- **Secret Key:** G8RnMI3W0ILGrkD8E89jt9pC
- **Mode:** Test Mode

### Current Setup:
- ✅ Backend APIs ready
- ✅ Payment verification implemented
- ✅ Access control system ready
- ⏳ Frontend payment button (Next update)

### How Payment Works:

**For Set 1 (Currently Free):**
- Users can access without payment
- Set as open access for testing

**For Future Sets (2-10):**
1. User clicks "Buy Set X - ₹100"
2. Razorpay payment popup opens
3. User pays via UPI/Card/Net Banking
4. Payment verified automatically
5. **Instant access** granted to the set
6. User can take test unlimited times

### Test Payment:
When testing payments, use:
- **Test Card:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Test UPI:** success@razorpay

**No real money will be charged in Test Mode!**

### Switching to Live Mode:

**When Ready:**
1. Complete Razorpay KYC (PAN, Aadhaar, Bank details)
2. Get Live API keys from Razorpay Dashboard
3. Update `/app/backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_live_XXXXXXXXX
   RAZORPAY_KEY_SECRET=your_live_secret
   ```
4. Restart backend: `sudo supervisorctl restart backend`

---

## ⏱️ TIMER FIXED POSITION

### What Was Changed:
✅ Timer now stays **fixed at the top** of the screen
✅ **Doesn't scroll** up and down with questions
✅ Always visible during the test
✅ Applied to both:
   - Sample Test (10 questions)
   - Full Test (130 questions)

### Timer Features:
- Shows remaining time
- Turns **red** when < 1 minute (sample) or < 10 minutes (full)
- Shows answered vs total questions
- Auto-submits when time runs out

---

## 📝 ADDING NEW QUESTION SETS

### Method 1: Using Template Script

**Location:** `/app/backend/add_new_set_template.py`

**Steps:**
1. Copy template:
   ```bash
   cd /app/backend
   cp add_new_set_template.py add_set2.py
   ```

2. Edit `add_set2.py`:
   - Change `SET_NUMBER = 2`
   - Add 30 Tamil questions
   - Add 100 Physics questions

3. Run:
   ```bash
   python add_set2.py
   ```

4. Verify in Admin Panel

### Method 2: Via Admin Dashboard

**Coming Soon:** Upload Excel/CSV feature
Currently: Use template script method

---

## 💰 PRICING STRUCTURE

### Current (Sets 1-9):
- **Each Set:** ₹100
- **Sample Questions:** FREE (10 physics)

### When All 10 Sets Complete:
- **Individual Set:** ₹100
- **Combo Pack (All 10):** ₹800 (Save ₹200!)

### To Update Pricing:
Edit `/app/backend/server.py` - Payment routes section

---

## 🔧 QUESTION SET STRUCTURE

### Tamil (Part A):
- Questions 1-20: **2 marks each** = 40 marks
- Questions 21-30: **1 mark each** = 10 marks
- **Total: 50 marks**

### Physics (Part B):
- Questions 1-100: **1.5 marks each** = 150 marks
- **Total: 150 marks**

### Grand Total Per Set:
- **130 questions**
- **200 marks**
- **3 hours** time limit

---

## 🌐 WEBSITE NAVIGATION

### Public Pages:
- **Home:** `/` - Landing page
- **Sample Test:** `/sample-test` - 10 free questions
- **Full Test:** `/full-test` - Complete Set 1 (130 Q)
- **Study Materials:** `/study-materials` - Download resources
- **Results:** `/results/:id` - Test results with analysis

### Admin Pages:
- **Admin Login:** `/admin` - Dashboard access
- **Requires:** Username & Password

---

## 👥 USER FEATURES

### Registration & Login:
- Create account with username, email, password
- Login to access full tests
- Track test history

### Sample Test (FREE):
- 10 physics questions
- 15 minutes timer
- Instant results
- Question-wise analysis

### Full Test (Set 1):
- Currently open to all (no payment)
- 30 Tamil + 100 Physics questions
- 3 hours timer
- Detailed results
- Can retake unlimited times

### Study Materials:
- Download PDFs
- Watch video tutorials
- Access notes
- Filter by subject

---

## 🔒 SECURITY RECOMMENDATIONS

### Before Going Live:

1. **Change Admin Password:**
   ```python
   # In /app/backend/server.py
   ADMIN_USERNAME = "your_secure_username"
   ADMIN_PASSWORD = "use_strong_password_here"
   ```

2. **Use Environment Variables:**
   ```bash
   # In /app/backend/.env
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   RAZORPAY_KEY_ID=your_live_key
   RAZORPAY_KEY_SECRET=your_live_secret
   ```

3. **Complete Razorpay KYC**
4. **Switch to Live Mode**
5. **Test thoroughly before launch**

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Launch:
- [ ] Change admin credentials
- [ ] Add all 10 question sets (or desired number)
- [ ] Upload study materials
- [ ] Complete Razorpay KYC
- [ ] Switch to Live Mode
- [ ] Test payment flow
- [ ] Test all features
- [ ] Add contact information
- [ ] Set pricing (individual vs combo)

---

## 🛠️ TECHNICAL COMMANDS

### Check Backend Status:
```bash
sudo supervisorctl status backend
```

### Restart Backend:
```bash
sudo supervisorctl restart backend
```

### View Backend Logs:
```bash
tail -f /var/log/supervisor/backend.err.log
```

### Check Frontend Status:
```bash
sudo supervisorctl status frontend
```

### Restart Frontend:
```bash
sudo supervisorctl restart frontend
```

---

## 📊 DATABASE COLLECTIONS

### Collections Created:
1. **users** - Registered users
2. **questions** - All question sets
3. **test_attempts** - Test submissions
4. **feedback** - User feedback
5. **purchased_sets** - Payment records (NEW!)
6. **study_materials** - Study resources (NEW!)

---

## 🎓 ADMIN WORKFLOW EXAMPLES

### Example 1: Adding Study Material

1. Login to `/admin`
2. Go to "Study Materials" tab
3. Click "Add Material"
4. Fill in:
   - Title: "Physics Chapter 1 - Mechanics"
   - Description: "Complete notes on mechanics"
   - File URL: "https://drive.google.com/file/d/ABC123/view"
   - File Type: PDF
   - Subject: Physics
5. Click "Add Material"
6. Users can now download from `/study-materials`

### Example 2: Fixing Wrong Question

1. Login to `/admin`
2. Go to "Question Sets" tab
3. Click "View" on desired set
4. Go to "Manage Questions" tab
5. Find the wrong question
6. Click edit icon
7. Update question text or correct answer
8. Click "Save Changes"

### Example 3: Deleting Incorrect Set

1. Login to `/admin`
2. Go to "Question Sets" tab
3. Find the set to delete
4. Click trash icon
5. Confirm deletion
6. All questions in that set are removed

---

## 📞 SUPPORT & MAINTENANCE

### Contact Information:
- **Name:** Sivasankari S
- **Email:** srvnna3@gmail.com
- **Phone:** 8940309588

### For Technical Issues:
- Check backend logs
- Verify environment variables
- Restart services
- Check database connection

---

## 🎯 QUICK START GUIDE

### For You (Admin):
1. Access admin panel: `your-site.com/admin`
2. Login with: `admin` / `admin123`
3. Add study materials
4. Monitor users and tests
5. Manage questions

### For Users:
1. Visit website
2. Try 10 free sample questions
3. Register for full access
4. Download study materials
5. Take practice tests

---

## ✨ WHAT'S NEW IN THIS UPDATE

✅ **Razorpay Payment Gateway** - Integrated (Test Mode)
✅ **Study Materials Section** - With admin management
✅ **Fixed Timer Position** - No more scrolling!
✅ **Admin Dashboard Enhanced** - Added materials tab
✅ **Payment APIs** - Create order, verify payment, check access
✅ **Access Control System** - Track purchased sets per user

---

**Version:** 2.0
**Last Updated:** October 2025
**Status:** Ready for Testing

🎉 **Everything is ready! Test the admin panel and payment flow!** 🎉
