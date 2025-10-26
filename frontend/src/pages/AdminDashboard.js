import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { Trash2, Edit, Plus, LogOut, BarChart3, Users, FileText } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [questionSets, setQuestionSets] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [stats, setStats] = useState({ users: [], attempts: [] });
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    file_url: "",
    file_type: "pdf",
    subject: "general"
  });

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleLogin = async () => {
    try {
      await axios.post(`${API}/admin/login`, loginForm);
      localStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      toast.success("Admin logged in successfully!");
      fetchData();
    } catch (error) {
      toast.error("Invalid admin credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    navigate("/");
  };

  const fetchData = async () => {
    try {
      const [setsRes, usersRes, attemptsRes, materialsRes] = await Promise.all([
        axios.get(`${API}/admin/question-sets`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/test-attempts`),
        axios.get(`${API}/study-materials`)
      ]);
      setQuestionSets(setsRes.data.sets);
      setStats({ users: usersRes.data.users, attempts: attemptsRes.data.attempts });
      setStudyMaterials(materialsRes.data.materials);
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  const fetchQuestions = async (setNumber) => {
    try {
      const response = await axios.get(`${API}/admin/questions?set_number=${setNumber}`);
      setAllQuestions(response.data.questions);
      setSelectedSet(setNumber);
    } catch (error) {
      toast.error("Failed to fetch questions");
    }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    
    try {
      await axios.delete(`${API}/admin/questions/${questionId}`);
      toast.success("Question deleted successfully");
      fetchQuestions(selectedSet);
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const deleteSet = async (setNumber) => {
    if (!window.confirm(`Are you sure you want to delete entire Set ${setNumber}? This cannot be undone!`)) return;
    
    try {
      await axios.delete(`${API}/admin/question-sets/${setNumber}`);
      toast.success(`Set ${setNumber} deleted successfully`);
      fetchData();
      setSelectedSet(null);
      setAllQuestions([]);
    } catch (error) {
      toast.error("Failed to delete set");
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowEditDialog(true);
  };

  const saveEditedQuestion = async () => {
    try {
      await axios.put(`${API}/admin/questions/${editingQuestion.id}`, {
        question_text: editingQuestion.question_text,
        options: editingQuestion.options,
        correct_answer: editingQuestion.correct_answer,
        marks: editingQuestion.marks
      });
      toast.success("Question updated successfully");
      setShowEditDialog(false);
      fetchQuestions(selectedSet);
    } catch (error) {
      toast.error("Failed to update question");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-indigo-900 mb-6 text-center">Admin Login</h1>
          <div className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                data-testid="admin-username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="Enter admin username"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                data-testid="admin-password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Enter admin password"
              />
            </div>
            <Button
              data-testid="admin-login-button"
              onClick={handleLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Login as Admin
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-900">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-indigo-900">{stats.users.length}</p>
              </div>
              <Users className="w-12 h-12 text-indigo-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Question Sets</p>
                <p className="text-3xl font-bold text-purple-900">{questionSets.length}</p>
              </div>
              <FileText className="w-12 h-12 text-purple-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Test Attempts</p>
                <p className="text-3xl font-bold text-green-900">{stats.attempts.length}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-green-600" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="sets">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sets">Question Sets</TabsTrigger>
            <TabsTrigger value="questions">Manage Questions</TabsTrigger>
            <TabsTrigger value="materials">Study Materials</TabsTrigger>
            <TabsTrigger value="users">Users & Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="sets" className="mt-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-900">Question Sets</h2>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Set
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {questionSets.map((set) => (
                  <Card key={set.set_number} className="p-6 border-2 hover:border-indigo-300 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-indigo-900">Set {set.set_number}</h3>
                        <p className="text-sm text-gray-600 mt-2">
                          Tamil: {set.tamil_questions} questions<br />
                          Physics: {set.physics_questions} questions
                        </p>
                        <p className="text-lg font-bold text-green-600 mt-2">₹{set.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchQuestions(set.set_number)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSet(set.set_number)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">
                {selectedSet ? `Set ${selectedSet} Questions` : "Select a set to view questions"}
              </h2>
              {allQuestions.length > 0 ? (
                <div className="space-y-4">
                  {allQuestions.map((q, idx) => (
                    <Card key={q.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            Q{q.question_number}. {q.question_text}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            Subject: <span className="font-semibold">{q.subject}</span> | 
                            Marks: <span className="font-semibold">{q.marks}</span> | 
                            Correct: <span className="font-semibold text-green-600">{q.correct_answer}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditQuestion(q)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteQuestion(q.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No questions to display. Select a set from the Question Sets tab.
                </p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-indigo-900 mb-6">Registered Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Username</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Question Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-4">
              <div>
                <Label>Question Text</Label>
                <Textarea
                  value={editingQuestion.question_text}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question_text: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label>Correct Answer</Label>
                <Input
                  value={editingQuestion.correct_answer}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Marks</Label>
                <Input
                  type="number"
                  value={editingQuestion.marks}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, marks: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEditedQuestion}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
