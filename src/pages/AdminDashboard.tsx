
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useComplaints, Complaint } from "@/context/ComplaintContext";
import { useAuth } from "@/context/AuthContext";
import ComplaintCard from "@/components/ComplaintCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SearchIcon, Loader2, CheckCircle, AlertCircle, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { complaints, updateComplaintStatus, getAllComplaints } = useComplaints();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const [visibleComplaints, setVisibleComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "pending").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
    public: complaints.filter(c => c.isPublic).length,
    private: complaints.filter(c => !c.isPublic).length,
  };

  useEffect(() => {
    // Check if user is admin, if not, redirect to home
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate loading
    const timer = setTimeout(() => {
      // Get all complaints
      let filteredComplaints = getAllComplaints();
      
      // Filter by status
      if (statusFilter !== "all") {
        filteredComplaints = filteredComplaints.filter(
          complaint => complaint.status === statusFilter
        );
      }
      
      // Filter by visibility
      if (visibilityFilter !== "all") {
        const isPublic = visibilityFilter === "public";
        filteredComplaints = filteredComplaints.filter(
          complaint => complaint.isPublic === isPublic
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
      
      // Apply tab filter (status-based)
      if (activeTab !== "all") {
        filteredComplaints = filteredComplaints.filter(
          complaint => complaint.status === activeTab
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
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [
    isAdmin, 
    isAuthenticated, 
    navigate, 
    statusFilter,
    visibilityFilter,
    searchTerm,
    sortOption,
    activeTab,
    getAllComplaints
  ]);

  const handleStatusChange = (id: string, status: "pending" | "resolved") => {
    updateComplaintStatus(id, status);
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setVisibilityFilter("all");
    setSortOption("newest");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-4 text-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Pending</h3>
            <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Resolved</h3>
            <p className="text-2xl font-bold text-green-500">{stats.resolved}</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Public</h3>
            <p className="text-2xl font-bold text-blue-500">{stats.public}</p>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Private</h3>
            <p className="text-2xl font-bold text-gray-500">{stats.private}</p>
          </div>
        </div>
        
        {/* Status Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full mb-6"
        >
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="all">All Complaints</TabsTrigger>
              <TabsTrigger value="pending">
                <AlertCircle className="h-4 w-4 mr-2" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="resolved">
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolved
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex gap-2 items-center mb-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filters
                  {(statusFilter !== "all" || visibilityFilter !== "all" || sortOption !== "newest") && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1">
                      {(statusFilter !== "all" ? 1 : 0) + 
                       (visibilityFilter !== "all" ? 1 : 0) + 
                       (sortOption !== "newest" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="p-4 border rounded-lg bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Visibility</label>
                    <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="public">Public Only</SelectItem>
                        <SelectItem value="private">Private Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Sort By</label>
                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleReset}
                      className="w-full"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="text-sm text-muted-foreground mb-6">
          Showing {visibleComplaints.length} {visibleComplaints.length === 1 ? "complaint" : "complaints"}
        </div>
        
        {/* Complaints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleComplaints.length > 0 ? (
            visibleComplaints.map((complaint) => (
              <ComplaintCard 
                key={complaint.id} 
                complaint={complaint} 
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="col-span-full py-8 text-center">
              <div className="text-muted-foreground">
                No complaints found. Try adjusting your filters or search term.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
