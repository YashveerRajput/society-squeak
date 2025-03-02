
import { useState } from "react";
import { useComplaints } from "@/context/ComplaintContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Send, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ComplaintForm = () => {
  const { addComplaint } = useComplaints();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [media, setMedia] = useState<{ type: "image" | "video"; url: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to submit a complaint.",
      });
      return;
    }
    
    if (!title.trim() || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please provide both a title and description for your complaint.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      try {
        addComplaint({
          title,
          description,
          isPublic,
          media,
        });
        
        // Reset form after submission
        setTitle("");
        setDescription("");
        setIsPublic(false);
        setMedia([]);
        
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: "An error occurred while submitting your complaint. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 800);
  };

  const handleMediaAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    // Check if we already have 3 media items
    if (media.length >= 3) {
      toast({
        variant: "destructive",
        title: "Media Limit Reached",
        description: "You can only attach up to 3 media items per complaint.",
      });
      return;
    }
    
    // Process the file
    if (validImageTypes.includes(file.type)) {
      const url = URL.createObjectURL(file);
      setMedia([...media, { type: "image", url }]);
    } else if (validVideoTypes.includes(file.type)) {
      const url = URL.createObjectURL(file);
      setMedia([...media, { type: "video", url }]);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a valid image or video file.",
      });
    }
    
    // Reset input value so the same file can be selected again
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    const newMedia = [...media];
    
    // If the media item has a URL created with URL.createObjectURL, we should revoke it
    const item = newMedia[index];
    if (item && item.url.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }
    
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-panel animate-slide-up">
      <CardHeader>
        <CardTitle className="text-xl font-medium">Submit a Complaint</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title of your complaint"
              required
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about your complaint"
              required
              maxLength={500}
              className="min-h-[120px]"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="public" 
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public" className="cursor-pointer">Make complaint public</Label>
            </div>
          </div>
          
          {/* Media Attachment Section */}
          <div className="space-y-3">
            <Label>Attachments ({media.length}/3)</Label>
            
            <div className="grid grid-cols-3 gap-2">
              {media.map((item, index) => (
                <div key={index} className="relative rounded-md border overflow-hidden h-24">
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {media.length < 3 && (
                <div className="border border-dashed rounded-md flex items-center justify-center h-24">
                  <label
                    htmlFor="media-upload"
                    className="flex flex-col items-center justify-center cursor-pointer p-2 h-full w-full"
                  >
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add Media</span>
                    <input
                      id="media-upload"
                      type="file"
                      className="hidden"
                      accept="image/*, video/*"
                      onChange={handleMediaAdd}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isSubmitting || !title || !description}
            className="w-full"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center">
                <Send className="mr-2 h-4 w-4" />
                Submit Complaint
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ComplaintForm;
