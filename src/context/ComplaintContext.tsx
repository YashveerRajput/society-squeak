
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";

export type Reply = {
  id: string;
  content: string;
  createdAt: Date;
  adminId: string;
  mediaType?: "text" | "audio" | "video";
  mediaUrl?: string;
};

export type Complaint = {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  status: "pending" | "resolved";
  createdAt: Date;
  userId: string;
  media: {
    type: "image" | "video";
    url: string;
  }[];
  replies: Reply[];
};

type ComplaintContextType = {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, "id" | "createdAt" | "userId" | "status" | "replies">) => void;
  updateComplaintStatus: (id: string, status: "pending" | "resolved") => void;
  getUserComplaints: (userId: string) => Complaint[];
  getPublicComplaints: () => Complaint[];
  getAllComplaints: () => Complaint[];
  addReplyToComplaint: (complaintId: string, reply: Omit<Reply, "id" | "createdAt" | "adminId">) => void;
};

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

const mockComplaints: Complaint[] = [
  {
    id: "complaint1",
    title: "Water Leakage in Block A",
    description: "There's a major water leakage in the hallway of Block A. It's causing damage to the walls.",
    isPublic: true,
    status: "pending",
    createdAt: new Date("2023-09-15T10:30:00"),
    userId: "user1",
    media: [{ type: "image", url: "https://images.unsplash.com/photo-1623181748498-f29309b883d6?auto=format&fit=crop&w=800&q=80" }],
    replies: [],
  },
  {
    id: "complaint2",
    title: "Elevator not working",
    description: "The elevator in Block B has been out of order for two days now.",
    isPublic: true,
    status: "resolved",
    createdAt: new Date("2023-09-10T08:15:00"),
    userId: "user2",
    media: [],
    replies: [
      {
        id: "reply1",
        content: "We've contacted the elevator maintenance company. They will be fixing it tomorrow.",
        createdAt: new Date("2023-09-11T09:00:00"),
        adminId: "admin1",
        mediaType: "text",
      }
    ],
  },
  {
    id: "complaint3",
    title: "Noisy neighbors",
    description: "The residents in flat 304 are making excessive noise late at night.",
    isPublic: false,
    status: "pending",
    createdAt: new Date("2023-09-12T23:45:00"),
    userId: "user1",
    media: [{ type: "video", url: "https://example.com/video.mp4" }],
    replies: [],
  },
];

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Initialize with mock data
  useEffect(() => {
    // Try to get from localStorage first
    const storedComplaints = localStorage.getItem("complaints");
    if (storedComplaints) {
      try {
        const parsedComplaints = JSON.parse(storedComplaints);
        // Convert string dates back to Date objects
        const complaintsWithDates = parsedComplaints.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          replies: c.replies ? c.replies.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          })) : [],
        }));
        setComplaints(complaintsWithDates);
      } catch (e) {
        console.error("Failed to parse stored complaints:", e);
        setComplaints(mockComplaints);
      }
    } else {
      setComplaints(mockComplaints);
    }
  }, []);

  // Save complaints to localStorage whenever they change
  useEffect(() => {
    if (complaints.length > 0) {
      localStorage.setItem("complaints", JSON.stringify(complaints));
    }
  }, [complaints]);

  const addComplaint = (complaintData: Omit<Complaint, "id" | "createdAt" | "userId" | "status" | "replies">) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to submit a complaint",
      });
      return;
    }

    const newComplaint: Complaint = {
      ...complaintData,
      id: `complaint${Date.now()}`,
      createdAt: new Date(),
      userId: user.id,
      status: "pending",
      replies: [],
    };

    setComplaints((prev) => [...prev, newComplaint]);
    
    toast({
      title: "Complaint submitted",
      description: "Your complaint has been registered successfully",
    });
  };

  const updateComplaintStatus = (id: string, status: "pending" | "resolved") => {
    setComplaints((prev) => 
      prev.map((complaint) => 
        complaint.id === id ? { ...complaint, status } : complaint
      )
    );
    
    toast({
      title: "Status updated",
      description: `Complaint has been marked as ${status}`,
    });
  };

  const addReplyToComplaint = (complaintId: string, replyData: Omit<Reply, "id" | "createdAt" | "adminId">) => {
    if (!user || !user.isAdmin) {
      toast({
        variant: "destructive",
        title: "Admin authorization required",
        description: "Only admins can reply to complaints",
      });
      return;
    }

    const newReply: Reply = {
      ...replyData,
      id: `reply${Date.now()}`,
      createdAt: new Date(),
      adminId: user.id,
    };

    setComplaints((prev) => 
      prev.map((complaint) => 
        complaint.id === complaintId
          ? { ...complaint, replies: [...complaint.replies, newReply] }
          : complaint
      )
    );
    
    toast({
      title: "Reply sent",
      description: "Your reply has been added to the complaint",
    });
  };

  const getUserComplaints = (userId: string) => {
    return complaints.filter(
      (complaint) => complaint.userId === userId || (complaint.isPublic && complaint.status === "resolved")
    );
  };

  const getPublicComplaints = () => {
    return complaints.filter((complaint) => complaint.isPublic);
  };

  const getAllComplaints = () => {
    return complaints;
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        addComplaint,
        updateComplaintStatus,
        getUserComplaints,
        getPublicComplaints,
        getAllComplaints,
        addReplyToComplaint,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error("useComplaints must be used within a ComplaintProvider");
  }
  return context;
};
