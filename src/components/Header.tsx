
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageSquare, Home, ClipboardList, LogIn, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => {
    setIsOpen(false);
  };

  const navItems = [
    { 
      name: "Home", 
      path: "/", 
      icon: <Home className="h-4 w-4 mr-2" /> 
    },
    { 
      name: "New Complaint", 
      path: "/new-complaint", 
      icon: <MessageSquare className="h-4 w-4 mr-2" /> 
    },
    { 
      name: "All Complaints", 
      path: "/complaints", 
      icon: <ClipboardList className="h-4 w-4 mr-2" /> 
    },
  ];
  
  if (isAdmin) {
    navItems.push({ 
      name: "Admin Dashboard", 
      path: "/admin", 
      icon: <ClipboardList className="h-4 w-4 mr-2" /> 
    });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-primary" />
            <span className="font-medium text-lg">SocietyVoice</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center py-2 px-1 text-sm font-medium transition-colors hover:text-primary relative ${
                isActive(item.path) 
                  ? "text-primary" 
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
              {isActive(item.path) && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <UserCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{user?.name}</span>
                  {isAdmin && (
                    <Badge variant="outline" className="ml-2 h-5 border-primary text-primary text-xs">
                      Admin
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  SocietyVoice
                </SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeSheet}
                      className={`flex items-center py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.path)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted hover:text-primary"
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
