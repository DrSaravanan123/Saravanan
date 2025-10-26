import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { BookOpen, Clock, Award, TrendingUp, Users, Share2, Mail, Phone } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "" });
  const [feedbackForm, setFeedbackForm] = useState({ name: "", email: "", message: "", rating: 5 });
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleAuth = async (type) => {
    try {
      const endpoint = type === "login" ? "/auth/login" : "/auth/register";
      const payload = type === "login" 
        ? { username: authForm.username, password: authForm.password }
        : authForm;
      
      const response = await axios.post(`${API}${endpoint}`, payload);
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      toast.success(type === "login" ? "வரவேற்கிறோம்!" : "பதிவு வெற்றிகரமாக முடிந்தது!");
      setShowAuth(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "பிழை ஏற்பட்டது");
    }
  };

  const handleFeedback = async () => {
    try {
      await axios.post(`${API}/feedback`, feedbackForm);
      toast.success("உங்கள் கருத்து பெறப்பட்டது. நன்றி!");
      setShowFeedback(false);
      setFeedbackForm({ name: "", email: "", message: "", rating: 5 });
    } catch (error) {
      toast.error("கருத்து அனுப்புவதில் பிழை");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "Physics Master Mock Exam", url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  React.useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleFullTestAccess = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please login first to access the full test");
      setShowAuth(true);
      return;
    }

    // Check if user has already purchased Set 1
    try {
      const response = await axios.get(`${API}/payment/check-access/${user.id}/1`);
      if (response.data.has_access) {
        // User has access, go to test
        navigate("/full-test");
      } else {
        // Show payment dialog
        setShowPayment(true);
      }
    } catch (error) {
      toast.error("Failed to check access");
    }
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    
    try {
      // Create Razorpay order
      const orderResponse = await axios.post(`${API}/payment/create-order`, null, {
        params: {
          set_number: 1,
          user_id: user.id
        }
      });

      const { order_id, amount, currency, key_id } = orderResponse.data;

      // Razorpay options
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "Physics Master",
        description: "TRB Mock Test - Complete Set 1",
        order_id: order_id,
        handler: async function (response) {
          // Payment successful, verify it
          try {
            await axios.post(`${API}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id,
              set_number: 1
            });

            toast.success("Payment successful! You now have access to Set 1");
            setShowPayment(false);
            setProcessingPayment(false);
            navigate("/full-test");
          } catch (error) {
            toast.error("Payment verification failed");
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
        },
        theme: {
          color: "#4F46E5"
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to initiate payment");
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-900">Physics Master</h1>
            <p className="text-sm text-indigo-600">Mock & Crack TRB Exam</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/study-materials")}
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Study Materials
            </Button>
            <Button
              data-testid="share-button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            {!user ? (
              <Button
                data-testid="login-button"
                onClick={() => setShowAuth(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Login / Register
              </Button>
            ) : (
              <Button variant="outline" data-testid="user-profile">
                👤 {user.username}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold text-indigo-900 leading-tight">
            Tamil Nadu TRB
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Assistant Professor Mock Exam
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto tamil-text" data-testid="motivation-text">
            போட்டி தேர்வுகளில் வெற்றி பெற வேண்டும் என்றால் இடையறாத பயிற்சி மிகவும் அவசியம். மாக் தேர்வுகளை எழுதுவது
            உங்கள் திறனை மதிப்பிட்டு, தவறுகளை திருத்திக் கொள்ளும் சிறந்த வாய்ப்பாகும். இது நம்பிக்கையை அதிகரித்து,
            நேர மேலாண்மை மற்றும் தேர்வு நெருக்கடியை சமாளிக்கும் மனவலிமையை உருவாக்குகிறது.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              data-testid="sample-test-button"
              size="lg"
              onClick={() => navigate("/sample-test")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-6"
            >
              <BookOpen className="mr-2 w-5 h-5" />
              10 Sample Questions (Free)
            </Button>
            <Button
              data-testid="full-test-button"
              size="lg"
              variant="outline"
              onClick={() => navigate("/full-test")}
              className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-lg px-8 py-6"
            >
              <Award className="mr-2 w-5 h-5" />
              Complete Set 1 (130 Questions)
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="feature-expert" className="p-6 hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Expert Designed</h3>
            <p className="text-sm text-gray-600 tamil-text">
              நிபுணர்களால் கவனமாக தயாரிக்கப்பட்ட வினாக்கள்
            </p>
          </Card>

          <Card data-testid="feature-timer" className="p-6 hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Timed Tests</h3>
            <p className="text-sm text-gray-600 tamil-text">
              நேர நிர்வாகத்தை மேம்படுத்த டைமர் வசதி
            </p>
          </Card>

          <Card data-testid="feature-analysis" className="p-6 hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Detailed Analysis</h3>
            <p className="text-sm text-gray-600 tamil-text">
              வினா வாரியாக விரிவான பகுப்பாய்வு
            </p>
          </Card>

          <Card data-testid="feature-paper" className="p-6 hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Paper-I Focus</h3>
            <p className="text-sm text-gray-600 tamil-text">
              Paper-I க்கான மாதிரி தேர்வு (Paper-II விரிவான வினாக்கள் இல்லை)
            </p>
          </Card>
        </div>
      </section>

      {/* Test Info */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <h3 className="text-2xl font-bold text-indigo-900 mb-6">Complete Set 1 Details</h3>
          <div className="grid md:grid-cols-2 gap-6 tamil-text">
            <div>
              <h4 className="font-semibold text-lg mb-3 text-indigo-800">Part A - Tamil (பகுதி அ - தமிழ்)</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• First 20 questions: <strong>2 marks each</strong> = 40 marks</li>
                <li>• Next 10 questions: <strong>1 mark each</strong> = 10 marks</li>
                <li>• <strong>Total: 50 marks</strong></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3 text-purple-800">Part B - Physics (பகுதி ப - இயற்பியல்)</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• 100 questions: <strong>1.5 marks each</strong> = 150 marks</li>
                <li>• Topics: Classical Mechanics, Quantum Mechanics, E&M, Thermodynamics, etc.</li>
                <li>• <strong>Total: 150 marks</strong></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-indigo-600">
            <p className="text-gray-700"><strong>Grand Total:</strong> 200 marks | <strong>Time Limit:</strong> 3 hours</p>
            <p className="text-sm text-gray-600 mt-2 tamil-text">* பதிவு செய்த பயனர்கள் தேர்வை எத்தனை முறை வேண்டுமானாலும் எழுதலாம்</p>
            <p className="text-sm text-indigo-600 mt-1">* More question sets coming soon!</p>
          </div>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Card className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Your Preparation?</h3>
          <p className="text-lg mb-6 opacity-90">Begin with 10 free sample questions or take the full mock test!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              data-testid="feedback-button"
              size="lg"
              variant="secondary"
              onClick={() => setShowFeedback(true)}
              className="text-lg px-8"
            >
              Give Feedback
            </Button>
          </div>
        </Card>
      </section>

      {/* Contact Info */}
      <footer className="bg-indigo-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact Information</h4>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:srvnna3@gmail.com" className="hover:text-indigo-300">srvnna3@gmail.com</a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:8940309588" className="hover:text-indigo-300">8940309588</a>
                </p>
                <p className="text-sm mt-2">Sivasankari S</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">About</h4>
              <p className="text-sm opacity-90">
                Physics Master is a dedicated platform for TRB Assistant Professor aspirants.
                Prepare with expert-designed mock tests and detailed analysis.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-indigo-800 text-center text-sm opacity-75">
            <p>© 2025 Physics Master. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent data-testid="auth-dialog">
          <DialogHeader>
            <DialogTitle>Login / Register</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input
                  data-testid="login-username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  data-testid="login-password"
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>
              <Button data-testid="login-submit" onClick={() => handleAuth("login")} className="w-full">
                Login
              </Button>
            </TabsContent>
            <TabsContent value="register" className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input
                  data-testid="register-username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  data-testid="register-email"
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  data-testid="register-password"
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>
              <Button data-testid="register-submit" onClick={() => handleAuth("register")} className="w-full">
                Register
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent data-testid="feedback-dialog">
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                data-testid="feedback-name"
                value={feedbackForm.name}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                data-testid="feedback-email"
                type="email"
                value={feedbackForm.email}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Rating (1-5)</Label>
              <Input
                data-testid="feedback-rating"
                type="number"
                min="1"
                max="5"
                value={feedbackForm.rating}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                data-testid="feedback-message"
                rows={4}
                value={feedbackForm.message}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
              />
            </div>
            <Button data-testid="feedback-submit" onClick={handleFeedback} className="w-full">
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
