# How to Get Live Razorpay API Keys (BEFORE Website URL)

## 🎯 You CAN get Live API Keys BEFORE deploying your website!

---

## 📋 Step-by-Step Process:

### **Step 1: Complete Basic KYC (Required)**

1. **Login to Razorpay Dashboard:**
   - Go to: https://dashboard.razorpay.com/
   - Login with your credentials

2. **Navigate to Account & Settings:**
   - Click on **Settings** (⚙️ gear icon) on the left sidebar
   - Go to **Account & Settings**

3. **Business Type:**
   - Select your business type:
     - **Individual/Proprietorship** (Easiest for solo business)
     - **Private Limited Company**
     - **Partnership**
     - **LLP**

4. **Submit Basic Documents:**
   
   **For Individual/Proprietorship (Simplest):**
   - ✅ **PAN Card** (Business/Personal)
   - ✅ **Aadhaar Card** (for verification)
   - ✅ **Bank Account Details**
     - Account number
     - IFSC code
     - Bank statement/Cancelled cheque
   - ✅ **GST Number** (Optional - if you have)
   
   **Upload these documents in Dashboard → Settings → Verification**

---

### **Step 2: Get Live API Keys (BEFORE Website URL)**

**Good News:** Razorpay gives you Live API Keys IMMEDIATELY after registration!

1. **Go to API Keys Section:**
   - Dashboard → **Settings** → **API Keys**
   
2. **Switch to Live Mode:**
   - You'll see two tabs: **Test Mode** | **Live Mode**
   - Click **Live Mode** tab
   
3. **Generate Live Keys:**
   - Click **Generate Live API Keys** button
   - Your keys will be generated INSTANTLY! ✅
   
4. **Copy Your Keys:**
   ```
   Key ID: rzp_live_XXXXXXXXX
   Key Secret: YYYYYYYYYYYYYYY
   ```
   - **Save these securely!**
   - Key Secret is shown ONLY ONCE!

---

### **Step 3: Website URL (Can Add Later)**

**Important:** You can add website URL AFTER getting keys!

**Option A: Use Temporary URL**
1. Go to **Settings** → **Website Details**
2. Enter temporary URL: 
   - `https://coming-soon.com` 
   - Or `https://under-construction.com`
3. You can update this later with real URL

**Option B: Skip for Now**
- Some fields are not mandatory initially
- You can activate live payments without website URL
- Just add it before going fully live

**Option C: Use Test URL**
- Use: `https://localhost:3000`
- Or: `https://test.example.com`
- Update later when you deploy

---

### **Step 4: Activate Live Payments**

1. **Complete Verification:**
   - Dashboard → **Activation Status**
   - Check if all documents are approved
   - Usually takes 1-3 business days

2. **Activation Requirements:**
   - ✅ PAN verified
   - ✅ Bank account verified
   - ✅ Aadhaar verified (if individual)
   - ✅ Business details submitted

3. **Once Approved:**
   - You'll get email notification
   - Live payments automatically enabled
   - Can start accepting real money! 💰

---

## 🔑 Complete Document Checklist:

### **For Individual/Proprietorship:**
- [ ] **PAN Card** (Personal or Business)
- [ ] **Aadhaar Card** (for KYC)
- [ ] **Bank Account Proof**
  - [ ] Cancelled cheque OR
  - [ ] Bank statement (last 3 months)
- [ ] **Business Proof** (Optional but recommended):
  - [ ] GST Certificate OR
  - [ ] Shop & Establishment Certificate OR
  - [ ] Udyog Aadhaar OR
  - [ ] Trade License

### **For Company/LLP:**
- [ ] **Certificate of Incorporation**
- [ ] **PAN Card** (Company PAN)
- [ ] **GST Certificate**
- [ ] **Board Resolution** (for authorized signatory)
- [ ] **MOA & AOA**
- [ ] **Bank Account Proof**

---

## ⚡ Quick Process (Individual/Solo Business):

**Day 1:**
1. Sign up on Razorpay
2. Upload PAN card
3. Upload Aadhaar
4. Add bank details
5. Upload cancelled cheque
6. **Get Live API Keys immediately!** ✅

**Day 2-3:**
- Razorpay verifies documents
- You receive approval email

**Day 4:**
- Activate live payments
- Start accepting real money!

---

## 💡 Important Notes:

### **About Website URL:**

**Razorpay DOES NOT strictly require website URL for:**
- ✅ Getting API keys
- ✅ Testing integration
- ✅ Initial activation

**Website URL is needed for:**
- ⚠️ Better trust/credibility
- ⚠️ Dispute resolution
- ⚠️ Customer support
- ⚠️ Full compliance

### **What to Do:**

**Option 1 (Recommended):**
1. Get Live API Keys first
2. Test integration locally
3. Deploy website
4. Update Razorpay with live URL

**Option 2:**
1. Use temporary URL initially
2. Get keys and test
3. Update URL when ready

**Option 3:**
1. Deploy to Emergent first (get URL)
2. Add URL to Razorpay
3. Get Live Keys
4. Update in your code

---

## 🎯 What You Should Do NOW:

### **Step 1: Get Your Live Keys Today**

1. Login: https://dashboard.razorpay.com/
2. Go to: **Settings** → **API Keys** → **Live Mode**
3. Click: **Generate Live API Keys**
4. Copy both:
   - Key ID: `rzp_live_XXXXX`
   - Key Secret: `YYYYYYY`
5. Save securely!

### **Step 2: Update Your Website**

```bash
# Edit /app/backend/.env
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=your_key_secret_here
```

### **Step 3: Test Locally**
- Restart backend
- Test with small real payment (₹1 or ₹10)
- Verify it works

### **Step 4: Deploy**
- Deploy to Emergent
- Get your live URL
- Update in Razorpay dashboard

---

## 📞 Need Help?

### **Razorpay Support Contacts:**

**For Account Activation:**
- Email: activation@razorpay.com
- Dashboard: Chat support (bottom right)

**For Technical Integration:**
- Email: support@razorpay.com
- Phone: 1800-121-7777 (10 AM - 7 PM)

**For KYC/Documents:**
- Email: kyc@razorpay.com

### **Common Questions:**

**Q: Can I get Live keys without website?**
A: Yes! Just use a temporary URL or leave blank initially.

**Q: How long does activation take?**
A: 1-3 business days for document verification.

**Q: Can I test Live keys locally?**
A: Yes! You can test on localhost before deploying.

**Q: What if I don't have GST?**
A: GST is optional for small businesses. PAN + Bank account is enough.

**Q: Can I start with Individual and upgrade later?**
A: Yes! You can upgrade to company account later.

---

## ✅ Summary:

1. **Live API Keys:** Available immediately after signup! ✅
2. **Website URL:** Not mandatory for getting keys! ✅
3. **KYC Documents:** Submit PAN, Aadhaar, Bank details
4. **Activation:** Takes 1-3 days
5. **Testing:** Can test locally before deploying
6. **Update URL:** Add real URL after deployment

---

## 🚀 Your Action Plan:

**TODAY:**
- [ ] Login to Razorpay Dashboard
- [ ] Generate Live API Keys
- [ ] Copy and save keys securely
- [ ] Submit KYC documents

**THIS WEEK:**
- [ ] Wait for KYC approval (1-3 days)
- [ ] Update keys in your backend
- [ ] Test with small real payment
- [ ] Deploy website
- [ ] Update URL in Razorpay

**NEXT WEEK:**
- [ ] Launch officially!
- [ ] Start accepting payments
- [ ] Monitor transactions
- [ ] Grow your business! 🎉

---

**You can get your Live API Keys RIGHT NOW without website URL!** 

Just login to Razorpay and generate them! 🔑
