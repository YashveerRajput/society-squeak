
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useComplaints } from "@/context/ComplaintContext";
import { useAuth } from "@/context/AuthContext";
import ComplaintCard from "@/components/ComplaintCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SearchIcon, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ComplaintsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { complaints, getUserComplaints, getPublicComplaints } = useComplaints();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  
  const [visibleComplaints, setVisibleComplaints] = useState(complaints);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Get the complaints based on the active tab
    let filteredComplaints = [];
    
    if (activeTab === "all") {
      filteredComplaints = getPublicComplaints();
    } else if (activeTab === "mine" && user) {
      filteredComplaints = getUserComplaints(user.id);
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filteredComplaints = filteredComplaints.filter(
        complaint => complaint.status === statusFilter
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredComplaints = filteredComplaints.filter(
        complaint =>
          complaint.title.toLowerCase().includes(term) ||
          complaint.description.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    let sortedComplaints = [...filteredComplaints];
    if (sortOption === "newest") {
      sortedComplaints.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortOption === "oldest") {
      sortedComplaints.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    
    setVisibleComplaints(sortedComplaints);
  }, [
    activeTab, 
    statusFilter, 
    searchTerm, 
    sortOption, 
    getPublicComplaints, 
    getUserComplaints, 
    user
  ]);

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortOption("newest");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Complaints</h1>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full mb-6"
        >
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="all">All Public Complaints</TabsTrigger>
              {isAuthenticated && (
                <TabsTrigger value="mine">My Complaints</TabsTrigger>
              )}
            </TabsList>
          </div>
        </Tabs>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="resolved">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Resolved
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleReset}
              title="Reset filters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </Button>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="text-sm text-muted-foreground mb-6">
          Showing {visibleComplaints.length} {visibleComplaints.length === 1 ? "complaint" : "complaints"}
        </div>
        
        {/* Complaints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {visibleComplaints.length > 0 ? (
              visibleComplaints.map((complaint) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <ComplaintCard complaint={complaint} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full py-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-muted-foreground">
                  No complaints found. Try adjusting your filters or search term.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;
