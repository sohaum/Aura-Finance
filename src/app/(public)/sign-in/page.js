"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Mail, Lock, User, Wallet, Chrome, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("sign-in");
  const [validationErrors, setValidationErrors] = useState({});
  const router = useRouter();

  // Form validation
  const validateForm = (isSignUp = false) => {
    const errors = {};
    
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email";
    }
    
    if (!password) {
      errors.password = "Password is required";
    } else if (isSignUp && password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (isSignUp && !name.trim()) {
      errors.name = "Name is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to register");
      }

      // After successful registration, sign in automatically
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to sign in after registration");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-emerald-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Wallet className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AuraFinance
            </h1>
            <p className="text-slate-600 text-sm mt-2">
              Smart insights for your financial journey
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full bg-slate-100/80 p-1">
              <TabsTrigger 
                value="sign-in" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="sign-up"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="sign-in" key="signin">
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSignIn}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-slate-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (validationErrors.email) {
                            setValidationErrors(prev => ({ ...prev, email: undefined }));
                          }
                        }}
                        placeholder="Enter your email"
                        className={`pl-10 bg-white/80 border-slate-200 focus:border-blue-500 transition-colors ${
                          validationErrors.email ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                      {validationErrors.email && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </motion.div>
                      )}
                    </div>
                    {validationErrors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-xs mt-1"
                      >
                        {validationErrors.email}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-slate-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (validationErrors.password) {
                            setValidationErrors(prev => ({ ...prev, password: undefined }));
                          }
                        }}
                        placeholder="Enter your password"
                        className={`pl-10 pr-10 bg-white/80 border-slate-200 focus:border-blue-500 transition-colors ${
                          validationErrors.password ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-xs mt-1"
                      >
                        {validationErrors.password}
                      </motion.p>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-red-700 text-sm">{error}</span>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5 transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.form>
              </TabsContent>

              <TabsContent value="sign-up" key="signup">
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSignUp}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-slate-700">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (validationErrors.name) {
                            setValidationErrors(prev => ({ ...prev, name: undefined }));
                          }
                        }}
                        placeholder="Enter your full name"
                        className={`pl-10 bg-white/80 border-slate-200 focus:border-blue-500 transition-colors ${
                          validationErrors.name ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.name && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-xs mt-1"
                      >
                        {validationErrors.name}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-slate-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (validationErrors.email) {
                            setValidationErrors(prev => ({ ...prev, email: undefined }));
                          }
                        }}
                        placeholder="Enter your email"
                        className={`pl-10 bg-white/80 border-slate-200 focus:border-blue-500 transition-colors ${
                          validationErrors.email ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {validationErrors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-xs mt-1"
                      >
                        {validationErrors.email}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-slate-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (validationErrors.password) {
                            setValidationErrors(prev => ({ ...prev, password: undefined }));
                          }
                        }}
                        placeholder="Create a secure password"
                        className={`pl-10 pr-10 bg-white/80 border-slate-200 focus:border-blue-500 transition-colors ${
                          validationErrors.password ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-red-500 text-xs mt-1"
                      >
                        {validationErrors.password}
                      </motion.p>
                    )}
                    {password && password.length > 0 && (
                      <div className="text-xs text-slate-500 mt-1">
                        Password strength: {password.length < 6 ? 'Weak' : password.length < 10 ? 'Good' : 'Strong'}
                      </div>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-red-700 text-sm">{error}</span>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-medium py-2.5 transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.form>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full border-slate-200 bg-white/80 hover:bg-white transition-all duration-200 disabled:opacity-50"
          >
            <Chrome className="w-4 h-4 mr-2" />
            Continue with Google
          </Button>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </motion.div>
    </div>
  );
}