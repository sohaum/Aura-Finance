"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Plus, X, MapPin, Calendar, CreditCard, DollarSign, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

// Fixed category mapping to match database enum
const CATEGORIES = [
  { value: "FOOD", label: "Food & Dining", color: "bg-red-50 text-red-700 border-red-200", icon: "🍽️" },
  { value: "TRANSPORTATION", label: "Transportation", color: "bg-blue-50 text-blue-700 border-blue-200", icon: "🚗" },
  { value: "SHOPPING", label: "Shopping", color: "bg-purple-50 text-purple-700 border-purple-200", icon: "🛍️" },
  { value: "ENTERTAINMENT", label: "Entertainment", color: "bg-green-50 text-green-700 border-green-200", icon: "🎬" },
  { value: "BILLS", label: "Bills & Utilities", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: "📄" },
  { value: "HEALTHCARE", label: "Healthcare", color: "bg-pink-50 text-pink-700 border-pink-200", icon: "🏥" },
  { value: "EDUCATION", label: "Education", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: "📚" },
  { value: "TRAVEL", label: "Travel", color: "bg-orange-50 text-orange-700 border-orange-200", icon: "✈️" },
  { value: "GROCERIES", label: "Groceries", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "🛒" },
  { value: "FITNESS", label: "Fitness & Sports", color: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: "💪" },
  { value: "SUBSCRIPTIONS", label: "Subscriptions", color: "bg-amber-50 text-amber-700 border-amber-200", icon: "📱" },
  { value: "OTHER", label: "Other", color: "bg-gray-50 text-gray-700 border-gray-200", icon: "📦" }
];

// Fixed payment method mapping
const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash", icon: "💵" },
  { value: "CREDIT_CARD", label: "Credit Card", icon: "💳" },
  { value: "DEBIT_CARD", label: "Debit Card", icon: "💳" },
  { value: "DIGITAL_WALLET", label: "Digital Wallet", icon: "📱" },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: "🏦" }
];

export default function AddExpense() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: "",
    notes: "",
    location: "",
    is_recurring: false,
    tags: []
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.title || !formData.amount || !formData.category || !formData.date) {
        throw new Error("Please fill in all required fields");
      }

      if (parseFloat(formData.amount) <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      const expenseData = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
      };

      // Only add optional fields if they have values
      if (formData.notes) expenseData.notes = formData.notes;
      if (formData.location) expenseData.location = formData.location;
      if (formData.payment_method) expenseData.paymentMethod = formData.payment_method;
      if (formData.tags.length > 0) expenseData.tags = formData.tags;
      if (formData.is_recurring) expenseData.isRecurring = formData.is_recurring;

      const response = await fetch('/api/expenses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create expense");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error("Error creating expense:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category);
  const selectedPaymentMethod = PAYMENT_METHODS.find(method => method.value === formData.payment_method);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!session) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Enhanced Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="glass-card hover:bg-white/60 border-slate-200 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              Add New Expense
              <Sparkles className="w-6 h-6 text-purple-500" />
            </h1>
            <p className="text-slate-600 mt-1">Track your spending with smart categorization and insights</p>
          </div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6"
            >
              <Alert className="border-green-200 bg-green-50/80 backdrop-blur-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Expense created successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6"
            >
              <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card border-white/20 shadow-xl backdrop-blur-sm">
                <CardHeader className="border-b border-white/10 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Expense Details
                  </CardTitle>
                  <p className="text-slate-600 text-sm">Fill in the information about your expense</p>
                </CardHeader>
                <CardContent className="space-y-8 p-6">
                  {/* Title and Amount Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                        What did you spend on? 
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., Coffee at Starbucks, Grocery shopping..."
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                        className="bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 h-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                        Amount 
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 font-semibold text-lg">
                          ₹
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={(e) => handleInputChange("amount", e.target.value)}
                          className="pl-12 bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 h-12 text-lg font-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category and Date Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative z-50">
                      <Label htmlFor="category" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                        Category 
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className="bg-white/80 border-slate-200 focus:border-blue-400 h-12 hover:bg-white/90 transition-colors">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-md border-slate-200 shadow-xl z-50 max-h-64">
                          {CATEGORIES.map((category) => (
                            <SelectItem 
                              key={category.value} 
                              value={category.value}
                              className="hover:bg-slate-50 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                        Date 
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleInputChange("date", e.target.value)}
                          className="pl-12 bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 h-12"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method and Location Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative z-40">
                      <Label htmlFor="payment_method" className="text-sm font-semibold text-slate-700">
                        Payment Method
                      </Label>
                      <Select value={formData.payment_method} onValueChange={(value) => handleInputChange("payment_method", value)}>
                        <SelectTrigger className="bg-white/80 border-slate-200 focus:border-blue-400 h-12 hover:bg-white/90 transition-colors">
                          <SelectValue placeholder="How did you pay?" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-md border-slate-200 shadow-xl z-40">
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem 
                              key={method.value} 
                              value={method.value}
                              className="hover:bg-slate-50 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span>{method.icon}</span>
                                <span>{method.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-semibold text-slate-700">
                        Location
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="location"
                          placeholder="Where was this expense?"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          className="pl-12 bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 h-12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional details about this expense..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      className="bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 min-h-[80px] resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">
                      Tags (Optional)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag (e.g., work, personal, urgent)"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 h-10"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTag}
                        className="shrink-0 h-10 px-4 border-slate-200 hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Tags Display */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-slate-50/80 rounded-lg border border-slate-200">
                        <AnimatePresence>
                          {formData.tags.map((tag, index) => (
                            <motion.div
                              key={tag}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-150">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="hover:bg-red-100 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Preview & Actions Sidebar */}
            <div className="space-y-6">
              {/* Expense Preview */}
              <Card className="glass-card border-white/20 shadow-xl backdrop-blur-sm sticky top-6">
                <CardHeader className="border-b border-white/10 bg-gradient-to-r from-emerald-50/50 to-blue-50/50">
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-gradient-to-br from-slate-50/50 to-white/50">
                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      {formatCurrency(formData.amount || 0)}
                    </div>
                    <div className="text-lg text-slate-700 font-medium mb-3">
                      {formData.title || 'Enter expense title'}
                    </div>
                    {selectedCategory && (
                      <Badge className={`${selectedCategory.color} border px-3 py-1 font-medium mb-2`}>
                        <span className="mr-1">{selectedCategory.icon}</span>
                        {selectedCategory.label}
                      </Badge>
                    )}
                    {selectedPaymentMethod && (
                      <div className="mt-2">
                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                          <span className="mr-1">{selectedPaymentMethod.icon}</span>
                          {selectedPaymentMethod.label}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {formData.date && (
                    <div className="text-center mt-4 p-3 bg-slate-50/80 rounded-lg">
                      <div className="text-sm text-slate-600 font-medium">
                        {format(new Date(formData.date), 'EEEE, MMMM d, yyyy')}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {(formData.location || formData.notes || formData.tags.length > 0) && (
                    <div className="mt-4 space-y-2 text-sm">
                      {formData.location && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>{formData.location}</span>
                        </div>
                      )}
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {formData.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading || !formData.title || !formData.amount || !formData.category || success}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving Expense...
                    </div>
                  ) : success ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Saved Successfully!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Expense
                    </div>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={loading}
                  className="w-full h-12 glass-card hover:bg-white/80 border-slate-200 font-medium transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>

              {/* Form Validation Status */}
              <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-2 text-sm">Required Fields</h4>
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center gap-2 ${formData.title ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${formData.title ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    Expense title
                  </div>
                  <div className={`flex items-center gap-2 ${formData.amount && parseFloat(formData.amount) > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${formData.amount && parseFloat(formData.amount) > 0 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    Amount
                  </div>
                  <div className={`flex items-center gap-2 ${formData.category ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${formData.category ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    Category
                  </div>
                  <div className={`flex items-center gap-2 ${formData.date ? 'text-green-600' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${formData.date ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    Date
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}