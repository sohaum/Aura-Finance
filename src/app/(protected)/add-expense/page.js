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
import { ArrowLeft, Save, Plus, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  { value: "food", label: "Food & Dining", color: "bg-red-100 text-red-800" },
  { value: "transportation", label: "Transportation", color: "bg-blue-100 text-blue-800" },
  { value: "shopping", label: "Shopping", color: "bg-purple-100 text-purple-800" },
  { value: "entertainment", label: "Entertainment", color: "bg-green-100 text-green-800" },
  { value: "bills", label: "Bills & Utilities", color: "bg-yellow-100 text-yellow-800" },
  { value: "healthcare", label: "Healthcare", color: "bg-pink-100 text-pink-800" },
  { value: "education", label: "Education", color: "bg-indigo-100 text-indigo-800" },
  { value: "travel", label: "Travel", color: "bg-orange-100 text-orange-800" },
  { value: "groceries", label: "Groceries", color: "bg-emerald-100 text-emerald-800" },
  { value: "fitness", label: "Fitness & Sports", color: "bg-cyan-100 text-cyan-800" },
  { value: "subscriptions", label: "Subscriptions", color: "bg-amber-100 text-amber-800" },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" }
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "digital_wallet", label: "Digital Wallet" },
  { value: "bank_transfer", label: "Bank Transfer" }
];

export default function AddExpense() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState("");
  
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

    try {
      // Validate required fields
      if (!formData.title || !formData.amount || !formData.category || !formData.date) {
        throw new Error("Please fill in all required fields");
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
        const error = await response.json();
        throw new Error(error.error || "Failed to create expense");
      }

      router.push('/dashboard');
    } catch (error) {
      console.error("Error creating expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard')}
            className="glass-card hover:bg-white/60"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Add New Expense</h1>
            <p className="text-slate-600">Track your spending with smart categorization</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-slate-900">Expense Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title and Amount */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">What did you spend on? *</Label>
                      <Input
                        id="title"
                        placeholder="Coffee, Lunch, Gas..."
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                        className="bg-white/60"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold">
                          ₹
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={(e) => handleInputChange("amount", e.target.value)}
                          className="pl-8 bg-white/60"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category and Date */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className="bg-white/60">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        className="bg-white/60"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Method and Location */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select value={formData.payment_method} onValueChange={(value) => handleInputChange("payment_method", value)}>
                        <SelectTrigger className="bg-white/60">
                          <SelectValue placeholder="How did you pay?" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="location"
                          placeholder="Where was this expense?"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          className="pl-10 bg-white/60"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional details..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      className="bg-white/60 h-20"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="bg-white/60"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTag}
                        className="shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <AnimatePresence>
                        {formData.tags.map((tag, index) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview & Actions */}
            <div className="space-y-6">
              {/* Expense Preview */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-slate-900">Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-lg">
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {formatCurrency(formData.amount || 0)}
                    </div>
                    <div className="text-slate-600">
                      {formData.title || 'Expense title'}
                    </div>
                    {selectedCategory && (
                      <Badge className={`mt-2 ${selectedCategory.color}`}>
                        {selectedCategory.label}
                      </Badge>
                    )}
                  </div>
                  
                  {formData.date && (
                    <div className="text-sm text-slate-600 text-center">
                      {format(new Date(formData.date), 'EEEE, MMMM d, yyyy')}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading || !formData.title || !formData.amount || !formData.category}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
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
                  className="w-full glass-card hover:bg-white/60"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}