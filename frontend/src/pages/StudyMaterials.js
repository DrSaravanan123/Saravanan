import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import { BookOpen, FileText, Video, Download, ChevronLeft } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudyMaterials = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("all");

  useEffect(() => {
    fetchMaterials();
  }, [selectedSubject]);

  const fetchMaterials = async () => {
    try {
      const url = selectedSubject === "all" 
        ? `${API}/study-materials`
        : `${API}/study-materials?subject=${selectedSubject}`;
      
      const response = await axios.get(url);
      setMaterials(response.data.materials);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load study materials");
      setLoading(false);
    }
  };

  const getIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-6 h-6" />;
      case "video":
        return <Video className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-2"
          >
            <ChevronLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-indigo-900">Study Materials</h1>
          <p className="text-gray-600">Download notes, PDFs, and video resources</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={selectedSubject === "all" ? "default" : "outline"}
            onClick={() => setSelectedSubject("all")}
          >
            All Materials
          </Button>
          <Button
            variant={selectedSubject === "tamil" ? "default" : "outline"}
            onClick={() => setSelectedSubject("tamil")}
          >
            Tamil
          </Button>
          <Button
            variant={selectedSubject === "physics" ? "default" : "outline"}
            onClick={() => setSelectedSubject("physics")}
          >
            Physics
          </Button>
          <Button
            variant={selectedSubject === "general" ? "default" : "outline"}
            onClick={() => setSelectedSubject("general")}
          >
            General
          </Button>
        </div>

        {/* Materials Grid */}
        {materials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <Card key={material.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    {getIcon(material.file_type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-indigo-900 mb-2">
                      {material.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                        {material.subject.toUpperCase()}
                      </span>
                      {material.file_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(material.file_url, "_blank")}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No materials available yet
            </h3>
            <p className="text-gray-600">
              Study materials will be added soon. Check back later!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudyMaterials;
