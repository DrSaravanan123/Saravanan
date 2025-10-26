# Payment Integration - Testing Guide

## ✅ Payment Flow Implemented

### How It Works:

**1. Sample Test (FREE)** ✅
- Access: Direct, no login required
- URL: `/sample-test`
- 10 physics questions
- No payment needed

**2. Complete Set 1 (PAID - ₹100)** 💳
- Requires login + payment
- Access controlled
- Unlimited attempts after purchase

---

## 🧪 Testing Payment Flow

### Step 1: Test Sample Questions (Free)
1. Go to homepage
2. Click "10 Sample Questions (Free)"
3. Answer questions
4. ✅ Should work without login/payment

### Step 2: Try Full Test Without Payment
1. Go to homepage  
2. Click "Complete Set 1 (130 Questions)"
3. If not logged in → Shows login dialog
4. If logged in but not paid → Shows payment dialog ✅

### Step 3: Complete Registration
1. Click "Login / Register"
2. Go to "Register" tab
3. Create account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123`
4. Click "Register"

### Step 4: Initiate Payment
1. Click "Complete Set 1" button again
2. Payment dialog appears showing:
   - Test details (30 Tamil + 100 Physics)
   - Price: ₹100
   - Features (unlimited attempts, etc.)
3. Click "Proceed to Payment ₹100"
4. Razorpay popup opens

### Step 5: Test Payment (Test Mode)
**Use these test credentials:**

**Test Card:**
- Card Number: `4111 1111 1111 1111`
- CVV: `123` (any 3 digits)
- Expiry: `12/25` (any future date)
- Name: Any name

**Test UPI:**
- UPI ID: `success@razorpay`

**Test Net Banking:**
- Select any bank
- It will auto-succeed in test mode

### Step 6: After Successful Payment
1. You'll see success message
2. Automatically redirected to `/full-test`
3. You can now take the full test
4. Can retake unlimited times (no payment again)

---

## 💳 Razorpay Payment Details

### Current Status:
- **Mode:** Test Mode ✅
- **Key ID:** rzp_test_RY6r4AqN074hem
- **Integration:** Complete ✅

### Payment Amount:
- **Set 1:** ₹100 (10,000 paise)
- **Currency:** INR
- **Payment Methods:** UPI, Cards, Net Banking

### Test Cards (Will NOT charge real money):
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
Name: Any name

Status: Will succeed ✅
```

```
Card Number: 4000 0000 0000 0002
Status: Will fail (for testing failure scenarios)
```

---

## 🔐 Access Control

### Database Tracking:
When user pays, record is created in `purchased_sets` collection:
```javascript
{
  "user_id": "user123",
  "set_number": 1,
  "payment_id": "pay_xxxxx",
  "order_id": "order_xxxxx",
  "amount": 100,
  "purchased_at": "2025-10-26T...",
  "is_active": true
}
```

### How Access is Checked:
1. User clicks "Complete Set 1"
2. Backend checks: `/api/payment/check-access/{user_id}/1`
3. If payment found → Allow access
4. If not found → Show payment dialog

### After Payment:
- ✅ User gets immediate access
- ✅ Can take test unlimited times
- ✅ No need to pay again
- ✅ Access is permanent

---

## 📊 Payment Flow Diagram

```
User Clicks "Complete Set 1"
         ↓
    Is Logged In?
    ↙         ↘
  NO          YES
   ↓           ↓
Show Login   Has Paid?
              ↙    ↘
            YES    NO
             ↓      ↓
        Go to    Show
         Test   Payment
                Dialog
                  ↓
            User Pays
                  ↓
         Verify Payment
                  ↓
         Grant Access
                  ↓
         Redirect to Test
```

---

## 🎯 What Users See

### Free Sample Test:
- ✅ Accessible to everyone
- No registration needed
- No payment needed

### Full Test (Set 1):
- ⚠️ Requires registration
- 💳 Requires payment (₹100)
- ✅ After payment: Unlimited access

### Visual Indicators:
- Landing page shows: "Price: ₹100 only (One-time payment)"
- Payment dialog shows full details
- Button text: "Proceed to Payment ₹100"

---

## 🧪 Testing Checklist

**Test as Guest:**
- [ ] Can access sample test without login
- [ ] Cannot access full test without login
- [ ] Shows login dialog when clicking "Complete Set 1"

**Test as Registered User (Not Paid):**
- [ ] Can login successfully
- [ ] Can access sample test
- [ ] Shows payment dialog for full test
- [ ] Cannot access full test directly

**Test Payment Flow:**
- [ ] Payment dialog shows correctly
- [ ] Razorpay popup opens
- [ ] Test card payment succeeds
- [ ] Success message shown
- [ ] Redirected to test page

**Test After Payment:**
- [ ] Can access full test immediately
- [ ] Timer works correctly
- [ ] Questions load properly
- [ ] Can submit test
- [ ] Can retake test (no payment again)

---

## 🚀 Going Live Checklist

### Before Switching to Live Mode:

1. **Complete Razorpay KYC**
   - Submit PAN card
   - Submit Aadhaar
   - Provide bank details
   - Wait for approval (1-3 days)

2. **Get Live API Keys**
   - Login to Razorpay Dashboard
   - Go to Settings → API Keys
   - Switch to "Live Mode"
   - Copy Live Key ID and Secret

3. **Update Backend**
   ```bash
   # Edit /app/backend/.env
   RAZORPAY_KEY_ID=rzp_live_XXXXXXXXX
   RAZORPAY_KEY_SECRET=your_live_secret_key
   ```

4. **Restart Backend**
   ```bash
   sudo supervisorctl restart backend
   ```

5. **Test Live Payment**
   - Use real card (will charge ₹100)
   - Verify payment in Razorpay Dashboard
   - Check access granted correctly
   - Test refund process if needed

---

## 💰 Revenue Tracking

### View Payment Records:

**Via Admin Dashboard:**
1. Go to `/admin`
2. Login with admin credentials
3. Go to "Users & Stats" tab
4. View test attempts and user details

**Via Database:**
Collection: `purchased_sets`
- Shows all payments
- User ID, payment ID, amount
- Purchase date and time

**Via Razorpay Dashboard:**
- Login to dashboard.razorpay.com
- View all transactions
- Download payment reports
- Issue refunds if needed

---

## 🔧 Troubleshooting

### Payment Dialog Not Showing:
- Check if user is logged in
- Check console for errors
- Verify backend API is running

### Payment Fails:
- Check Razorpay script loaded
- Check internet connection
- Try different payment method
- Check Razorpay Dashboard for errors

### Access Not Granted:
- Check `purchased_sets` collection
- Verify payment verification API
- Check user ID matches

### Razorpay Popup Not Opening:
- Ensure Razorpay script loaded
- Check browser console for errors
- Try clearing browser cache
- Test in incognito mode

---

## 📞 Support

### For Payment Issues:
- Razorpay Support: support@razorpay.com
- Razorpay Dashboard: dashboard.razorpay.com

### For Technical Issues:
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
- Check browser console for frontend errors
- Verify database connections

---

**Test Mode Status:** ✅ Active
**Live Mode Status:** ⏳ Pending KYC
**Integration Status:** ✅ Complete

🎉 **Payment system is ready for testing!** 🎉
