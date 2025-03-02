
import React from "react";
import { format } from "date-fns";
import { Clock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
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
import { Complaint } from "@/context/ComplaintContext";
import { useAuth } from "@/context/AuthContext";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ComplaintCardProps {
  complaint: Complaint;
  onStatusChange?: (id: string, status: "pending" | "resolved") => void;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onStatusChange }) => {
  const { user, allUsers, isAdmin } = useAuth();
  const complainantName = allUsers[complaint.userId]?.name || "Unknown User";
  
  // Only show the media if there is any
  const hasMedia = complaint.media && complaint.media.length > 0;
  
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
      </CardContent>
      
      {isAdmin && onStatusChange && (
        <CardFooter className="pt-0 pb-3">
          {complaint.status === "pending" ? (
            <Button
              variant="default" 
              size="sm"
              className="w-full"
              onClick={() => onStatusChange(complaint.id, "resolved")}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark as Resolved
            </Button>
          ) : (
            <Button
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => onStatusChange(complaint.id, "pending")}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Mark as Pending
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default ComplaintCard;
