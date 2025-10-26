# Admin Login Guide - IMPORTANT!

## ⚠️ IMPORTANT: Two Different Login Systems!

Your website has **TWO separate login systems**:

---

## 1. 🙋 REGULAR USER LOGIN (Students/Users)

**Where:** Main homepage → Click "Login / Register" button

**URL:** Shows dialog on homepage

**Credentials:** 
- Username/Email registered by users
- Password created during registration

**What it does:**
- Registers regular users
- Allows taking tests
- Makes payments
- Views results

**Example:**
```
Username: testuser
Password: test123
```

---

## 2. 👨‍💼 ADMIN LOGIN (You - Website Owner)

**Where:** Go to `/admin` page directly

**URL:** `http://localhost:3000/admin` (or your-domain.com/admin)

**Credentials:**
```
Username: admin
Password: admin123
```

**What it does:**
- Manage question sets
- Add/delete questions
- Add study materials
- View users and stats
- Full admin control

---

## 🎯 HOW TO LOGIN AS ADMIN:

### **Method 1: Type URL Directly**
```
1. In browser address bar, type: localhost:3000/admin
2. Press Enter
3. You'll see Admin Login page
4. Enter:
   Username: admin
   Password: admin123
5. Click "Login as Admin"
6. ✅ You're in!
```

### **Method 2: Click Footer Link**
```
1. Scroll to bottom of homepage
2. In footer, find "Quick Links" section
3. Click "Admin Panel"
4. Enter credentials
5. ✅ Login successful!
```

### **Method 3: Direct Navigation**
```
1. On homepage, manually change URL
2. Add /admin to end: your-site.com/admin
3. Enter credentials
4. ✅ Access granted!
```

---

## ❌ Common Mistake:

**WRONG:** Clicking "Login / Register" on main page
- This is for regular users only
- Admin credentials won't work here
- It checks database for registered users

**RIGHT:** Go to `/admin` page separately
- This has separate admin authentication
- Uses hardcoded admin credentials
- Grants admin panel access

---

## 📋 Quick Comparison:

| Feature | Regular User Login | Admin Login |
|---------|-------------------|-------------|
| **URL** | Homepage dialog | /admin page |
| **Button** | "Login / Register" | Separate page |
| **Credentials** | User's own | admin/admin123 |
| **Database** | Checks users collection | Hardcoded in code |
| **Access** | Take tests, pay | Manage entire site |

---

## 🔐 Change Admin Password (IMPORTANT!)

**Before going live, change the admin password:**

### **Step 1: Edit Backend Code**
```bash
# Open file
nano /app/backend/server.py

# Find lines around 280 (in admin login route)
# Change these:
ADMIN_USERNAME = "admin"           # Change this
ADMIN_PASSWORD = "admin123"        # Change this

# To something like:
ADMIN_USERNAME = "sivasankari_admin"
ADMIN_PASSWORD = "YourSecurePassword@123"
```

### **Step 2: Restart Backend**
```bash
sudo supervisorctl restart backend
```

### **Step 3: Test New Login**
```
Go to /admin
Login with new credentials
```

---

## 🎯 Admin Panel Features:

Once you login at `/admin`, you can:

### **Dashboard Tab:**
- View total users
- View question sets count
- View test attempts
- Quick statistics

### **Question Sets Tab:**
- View all sets (Set 1, 2, 3...)
- See question counts
- Delete entire sets
- Monitor pricing

### **Manage Questions Tab:**
- View questions by set
- Edit individual questions
- Fix wrong questions
- Delete incorrect questions
- Update options & answers

### **Study Materials Tab:**
- Add PDF materials
- Add video links
- Add notes
- Delete materials
- Organize by subject

### **Users & Stats Tab:**
- View all registered users
- See registration dates
- Monitor test attempts
- Track activity

---

## 🚪 Logout:

**To logout from Admin:**
- Click "Logout" button in top-right corner
- You'll be redirected to homepage
- Need to login again at `/admin`

---

## 🆘 Troubleshooting:

### **Problem: "Invalid credentials" at homepage login**
**Solution:** You're using wrong login!
- Don't use homepage login for admin
- Go to `/admin` page instead

### **Problem: "Invalid admin credentials" at /admin**
**Solution:** Check your credentials
- Default: `admin` / `admin123`
- Case-sensitive!
- No extra spaces

### **Problem: Can't find /admin page**
**Solution:** Type full URL
- `http://localhost:3000/admin`
- Or click "Admin Panel" in footer

### **Problem: Page not loading**
**Solution:** Check backend
```bash
sudo supervisorctl status backend
# Should show "RUNNING"
```

---

## ✅ Quick Test:

### **Test Regular User Login:**
1. Homepage → "Login / Register"
2. Register new user: testuser / test@test.com / test123
3. Login successful → See "Logout" button
4. ✅ Regular user works!

### **Test Admin Login:**
1. Go to `/admin` directly
2. Enter: admin / admin123
3. See admin dashboard
4. ✅ Admin access works!

---

## 📞 Need Help?

**If admin login not working:**
1. Check URL is exactly `/admin`
2. Verify credentials (case-sensitive)
3. Check backend is running
4. View backend logs for errors
5. Try clearing browser cache

**Check Backend Logs:**
```bash
tail -f /var/log/supervisor/backend.err.log
```

---

## 🎉 Summary:

**For Regular Users (Students):**
- Use: Homepage "Login / Register" button
- Create account → Login → Take tests

**For Admin (You):**
- Use: `/admin` page directly
- Credentials: admin / admin123
- Manage entire website

**Remember:** Two completely separate login systems!

---

**To login as admin RIGHT NOW:**
1. Open new tab
2. Type: `localhost:3000/admin`
3. Enter: admin / admin123
4. Click "Login as Admin"
5. ✅ Done!
