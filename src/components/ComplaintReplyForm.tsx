
import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, X } from "lucide-react";

interface ComplaintReplyFormProps {
  complaintId: string;
  onSubmitReply: (
    complaintId: string,
    reply: {
      content: string;
      mediaType?: "text" | "audio" | "video";
      mediaUrl?: string;
    }
  ) => void;
}

const ComplaintReplyForm: React.FC<ComplaintReplyFormProps> = ({
  complaintId,
  onSubmitReply,
}) => {
  const { isAdmin } = useAuth();
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<"text" | "audio" | "video" | undefined>(undefined);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }
    
    onSubmitReply(complaintId, {
      content,
      mediaType,
      mediaUrl: mediaUrl || undefined,
    });
    
    // Reset form
    setContent("");
    setMediaType(undefined);
    setMediaUrl("");
    setShowMediaInput(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      // and get back a URL. For now, we'll create a fake URL
      const fakeUrl = URL.createObjectURL(file);
      setMediaUrl(fakeUrl);
    }
  };

  const toggleMediaInput = () => {
    setShowMediaInput(!showMediaInput);
    if (!showMediaInput) {
      setMediaType(undefined);
      setMediaUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 border rounded-md bg-white">
      <div>
        <Label htmlFor="reply-content">Reply to complaint</Label>
        <Textarea
          id="reply-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your reply here..."
          className="min-h-20"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={toggleMediaInput}
          className="flex items-center gap-1"
        >
          <Paperclip className="h-4 w-4" />
          {showMediaInput ? "Remove Media" : "Add Media"}
        </Button>
      </div>

      {showMediaInput && (
        <div className="space-y-3 border p-3 rounded-md">
          <div>
            <Label htmlFor="media-type">Media Type</Label>
            <Select value={mediaType} onValueChange={(value: "text" | "audio" | "video") => setMediaType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select media type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mediaType && (
            <div>
              <Label htmlFor="media-url">Media URL</Label>
              <div className="flex gap-2">
                <Input
                  id="media-url"
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Enter URL or upload file"
                  className="flex-1"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={mediaType === "audio" ? "audio/*" : "video/*"}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload
                </Button>
              </div>
              
              {mediaUrl && (
                <div className="mt-2 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-black/50 text-white rounded-full"
                    onClick={() => setMediaUrl("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  {mediaType === "audio" && (
                    <audio src={mediaUrl} controls className="w-full" />
                  )}
                  
                  {mediaType === "video" && (
                    <video src={mediaUrl} controls className="w-full rounded-md" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" className="flex items-center gap-1">
          <Send className="h-4 w-4" />
          Send Reply
        </Button>
      </div>
    </form>
  );
};

export default ComplaintReplyForm;
