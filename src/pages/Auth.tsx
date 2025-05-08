
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface ErrorResponse {
  detail?: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", loginData.username);
      formData.append("password", loginData.password);

      const response = await fetch("https://backorder.xclusivetradinginc.cloud/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const tokenData = data as TokenResponse;
        dispatch(
          setCredentials({
            token: tokenData.access_token,
            tokenType: "Bearer",
            username: loginData.username,
          })
        );

        toast({
          title: "Success",
          description: "Logged in successfully",
        });

        navigate("/");
      } else {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.detail || "Login failed");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6 sm:p-4">
      <Card className="w-full max-w-md">
        {/* Logo on top */}
        <div className="flex justify-center mt-4">
          <img
            src="https://alphacomm.com/wp-content/uploads/2021/05/alphacomm-logo.png"
            alt="Superior Logo"
            className="h-12 sm:h-16"
          />
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">Welcome back! Please log in to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-username">Username</Label>
              <Input
                id="login-username"
                type="text"
                placeholder="Enter your username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
