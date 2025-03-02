
import React, { useState } from "react";
import { format } from "date-fns";
import { Clock, Eye, EyeOff, Check, AlertCircle, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Complaint, useComplaints } from "@/context/ComplaintContext";
import { useAuth } from "@/context/AuthContext";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ComplaintReplyForm from "./ComplaintReplyForm";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ComplaintCardProps {
  complaint: Complaint;
  onStatusChange?: (id: string, status: "pending" | "resolved") => void;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onStatusChange }) => {
  const { user, allUsers, isAdmin } = useAuth();
  const { addReplyToComplaint } = useComplaints();
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const complainantName = allUsers[complaint.userId]?.name || "Unknown User";
  
  // Only show the media if there is any
  const hasMedia = complaint.media && complaint.media.length > 0;
  const hasReplies = complaint.replies && complaint.replies.length > 0;
  
  const toggleReplies = () => {
    setShowReplies(!showReplies);
    if (!showReplies) {
      setShowReplyForm(false);
    }
  };
  
  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
    if (!showReplyForm) {
      setShowReplies(true);
    }
  };
  
  const handleSubmitReply = (complaintId: string, replyData: { content: string; mediaType?: "text" | "audio" | "video"; mediaUrl?: string; }) => {
    addReplyToComplaint(complaintId, replyData);
    setShowReplyForm(false);
  };
  
  const canViewComplaint = complaint.isPublic || 
                          (user && (user.id === complaint.userId || isAdmin));
  
  if (!canViewComplaint) return null;
  
  return (
    <Card className="complaint-card w-full max-w-md overflow-hidden animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={complaint.status === "resolved" ? "outline" : "secondary"} className="h-6">
                {complaint.status === "resolved" ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {complaint.status === "resolved" ? "Resolved" : "Pending"}
              </Badge>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant={complaint.isPublic ? "outline" : "secondary"} className="h-6">
                      {complaint.isPublic ? (
                        <Eye className="h-3 w-3 mr-1" />
                      ) : (
                        <EyeOff className="h-3 w-3 mr-1" />
                      )}
                      {complaint.isPublic ? "Public" : "Private"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {complaint.isPublic
                        ? "Visible to all society members"
                        : "Only visible to you and admin"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardTitle className="text-lg font-medium">{complaint.title}</CardTitle>
          </div>
        </div>
        <CardDescription className="flex items-center text-xs text-muted-foreground mt-1">
          <Clock className="h-3 w-3 mr-1 opacity-70" />
          {format(complaint.createdAt, "MMM d, yyyy 'at' h:mm a")}
          <span className="mx-1">•</span>
          By {complainantName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-foreground/90 leading-relaxed">{complaint.description}</p>
        
        {hasMedia && (
          <div className="mt-4 space-y-2">
            {complaint.media.map((item, index) => (
              <div key={index} className="overflow-hidden rounded-md border">
                {item.type === "image" ? (
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={item.url}
                      alt={`Complaint media ${index}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </AspectRatio>
                ) : (
                  <AspectRatio ratio={16 / 9}>
                    <video
                      src={item.url}
                      controls
                      className="h-full w-full object-cover"
                    />
                  </AspectRatio>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Replies Section */}
        <Collapsible open={showReplies} onOpenChange={setShowReplies} className="mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm font-medium">
              <MessageCircle className="h-4 w-4" />
              <span>Replies ({complaint.replies.length})</span>
            </div>
            
            {hasReplies && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  {showReplies ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
          
          <CollapsibleContent className="mt-2">
            {hasReplies ? (
              <div className="space-y-3">
                {complaint.replies.map((reply) => {
                  const adminName = allUsers[reply.adminId]?.name || "Admin";
                  
                  return (
                    <div key={reply.id} className="bg-slate-50 p-3 rounded-md border text-sm">
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{adminName}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(reply.createdAt, "MMM d, yyyy")}
                        </div>
                      </div>
                      
                      <div className="mt-1 text-foreground/90">{reply.content}</div>
                      
                      {reply.mediaType && reply.mediaUrl && (
                        <div className="mt-2 overflow-hidden rounded-md border">
                          {reply.mediaType === "audio" ? (
                            <audio src={reply.mediaUrl} controls className="w-full" />
                          ) : reply.mediaType === "video" ? (
                            <video src={reply.mediaUrl} controls className="w-full" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-2">
                No replies yet.
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
        
        {/* Admin Reply Form (conditionally rendered) */}
        {isAdmin && showReplyForm && (
          <ComplaintReplyForm 
            complaintId={complaint.id} 
            onSubmitReply={handleSubmitReply} 
          />
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-3 flex flex-wrap gap-2">
        {isAdmin && (
          <>
            {onStatusChange && (
              <Button
                variant={complaint.status === "pending" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => onStatusChange(complaint.id, complaint.status === "pending" ? "resolved" : "pending")}
              >
                {complaint.status === "pending" ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Mark as Pending
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={toggleReplyForm}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {showReplyForm ? "Cancel Reply" : "Reply"}
            </Button>
          </>
        )}
        
        {!isAdmin && hasReplies && !showReplies && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={toggleReplies}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            View Replies ({complaint.replies.length})
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ComplaintCard;
