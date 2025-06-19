import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await login(email); // Removed password, login expects only email
    
    // For dummy login, we'll assume success and not check 'success' variable directly
    // as login returns Promise<void>.
    // If actual login fails, error handling would be different.
    // setError("Invalid credentials. Please try again."); // This line would be conditional on actual login failure

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4"> {/* Reverted background */}
      <Card className="w-full max-w-md bg-card text-card-foreground"> {/* Reverted card styles */}
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-foreground">2PC Investor Data</CardTitle> {/* Reverted text color */}
          <CardDescription className="text-center text-muted-foreground"> {/* Reverted text color */}
            Sign in to access your investor dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 p-3 bg-muted rounded-md"> {/* Reverted background */}
            <p className="text-sm text-muted-foreground font-medium">Demo Credentials:</p> {/* Reverted text color */}
            <p className="text-xs text-muted-foreground">Email: vini12345@gmail.com</p> {/* Reverted text color */}
            <p className="text-xs text-muted-foreground">Password: Pooja@1992</p> {/* Reverted text color */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
