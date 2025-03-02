
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState("");
  
  const handleLogin = () => {
    if (selectedUser) {
      login(selectedUser);
      navigate("/"); // Redirect to home page after login
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md glass-panel animate-fade-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Choose a user to continue to SocietyVoice
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <Tabs defaultValue="residents" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="residents">Residents</TabsTrigger>
              <TabsTrigger value="admin">Society Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="residents" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant={selectedUser === "user1" ? "default" : "outline"}
                  className={`flex items-center justify-start h-14 px-4 ${
                    selectedUser === "user1" ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedUser("user1")}
                >
                  <UserCircle className="h-6 w-6 mr-3" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">John Resident</span>
                    <span className="text-xs text-muted-foreground">john@example.com</span>
                  </div>
                </Button>
                
                <Button
                  variant={selectedUser === "user2" ? "default" : "outline"}
                  className={`flex items-center justify-start h-14 px-4 ${
                    selectedUser === "user2" ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedUser("user2")}
                >
                  <UserCircle className="h-6 w-6 mr-3" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Jane Resident</span>
                    <span className="text-xs text-muted-foreground">jane@example.com</span>
                  </div>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="admin" className="space-y-4 pt-4">
              <Button
                variant={selectedUser === "admin1" ? "default" : "outline"}
                className={`flex items-center justify-start h-14 px-4 w-full ${
                  selectedUser === "admin1" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedUser("admin1")}
              >
                <Lock className="h-6 w-6 mr-3" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Society Secretary</span>
                  <span className="text-xs text-muted-foreground">admin@example.com</span>
                </div>
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            disabled={!selectedUser}
            onClick={handleLogin}
          >
            Continue as Selected User
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
