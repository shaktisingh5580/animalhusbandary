"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RequestMedicinePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    medicineName: "",
    medicineCategory: "",
    quantity: "",
    reason: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (!formData.medicineName || !formData.medicineCategory || !formData.quantity || !formData.reason) {
      setError("Please fill all the required fields")
      setIsSubmitting(false)
      return
    }

    try {
      // In a real application, this would add the request to Firestore
      // await addDoc(collection(db, 'medicineRequests'), {
      //   userId: user?.uid,
      //   medicineName: formData.medicineName,
      //   medicineCategory: formData.medicineCategory,
      //   quantity: parseInt(formData.quantity),
      //   reason: formData.reason,
      //   status: 'pending',
      //   requestedAt: serverTimestamp(),
      // });

      // Mock successful submission
      setTimeout(() => {
        setIsSuccess(true)
        setIsSubmitting(false)

        // Redirect after successful submission
        setTimeout(() => {
          router.push("/dashboard/medicines")
        }, 2000)
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to submit request")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Request Medicine</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Medicine Request Form</CardTitle>
            <CardDescription>Fill out this form to request medicines from the government stock</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isSuccess && (
              <Alert className="bg-primary/20 border-primary">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  Your medicine request has been submitted successfully. You will be redirected shortly.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="medicineName">Medicine Name</Label>
              <Input
                id="medicineName"
                name="medicineName"
                value={formData.medicineName}
                onChange={handleChange}
                placeholder="Enter medicine name"
                disabled={isSubmitting || isSuccess}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="medicineCategory">Medicine Category</Label>
              <Select
                disabled={isSubmitting || isSuccess}
                onValueChange={(value) => handleSelectChange("medicineCategory", value)}
                value={formData.medicineCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="antibiotics">Antibiotics</SelectItem>
                  <SelectItem value="vitamins">Vitamins</SelectItem>
                  <SelectItem value="parasiticides">Parasiticides</SelectItem>
                  <SelectItem value="vaccines">Vaccines</SelectItem>
                  <SelectItem value="anti-inflammatories">Anti-inflammatories</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity needed"
                disabled={isSubmitting || isSuccess}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Request</Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Explain why you need this medicine"
                rows={4}
                disabled={isSubmitting || isSuccess}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting || isSuccess}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isSuccess}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

