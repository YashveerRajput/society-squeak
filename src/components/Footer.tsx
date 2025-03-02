
import { MessageSquare } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full py-6 border-t mt-auto bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            <span className="text-sm font-medium">SocietyVoice</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SocietyVoice. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
