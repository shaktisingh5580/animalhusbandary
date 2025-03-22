"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import Link from "next/link"

interface Medicine {
  id: string
  name: string
  category: string
  quantity: number
  status: "in-stock" | "low-stock" | "out-of-stock"
  lastUpdated: string
}

export default function MedicinesPage() {
  const { userRole } = useAuth()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const medicinesQuery = query(collection(db, "medicines"), orderBy("name"))

        const snapshot = await getDocs(medicinesQuery)
        const medicinesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Medicine[]

        setMedicines(medicinesList)
      } catch (error) {
        console.error("Error fetching medicines:", error)
      } finally {
        setLoading(false)
      }
    }

    // Mock data for demonstration
    setTimeout(() => {
      setMedicines([
        {
          id: "1",
          name: "Antibiotic X",
          category: "Antibiotics",
          quantity: 45,
          status: "in-stock",
          lastUpdated: "2023-08-15",
        },
        {
          id: "2",
          name: "Vitamin B Complex",
          category: "Vitamins",
          quantity: 120,
          status: "in-stock",
          lastUpdated: "2023-08-10",
        },
        {
          id: "3",
          name: "Anthelmintic Y",
          category: "Parasiticides",
          quantity: 8,
          status: "low-stock",
          lastUpdated: "2023-08-12",
        },
        {
          id: "4",
          name: "Vaccine Z",
          category: "Vaccines",
          quantity: 0,
          status: "out-of-stock",
          lastUpdated: "2023-07-28",
        },
        {
          id: "5",
          name: "Anti-inflammatory P",
          category: "Anti-inflammatories",
          quantity: 32,
          status: "in-stock",
          lastUpdated: "2023-08-05",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-500"
      case "low-stock":
        return "bg-yellow-500"
      case "out-of-stock":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Medicine Inventory</h1>

        {(userRole === "government" || userRole === "veterinary") && (
          <Link href="/dashboard/medicines/add">
            <Button>Add Medicine</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medicines</CardTitle>
          <CardDescription>Browse and manage available medicines in the inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {userRole === "farmer" && (
              <Link href="/dashboard/medicines/request" className="ml-4">
                <Button>Request Medicine</Button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.category}</TableCell>
                      <TableCell>{medicine.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(medicine.status)} text-white`}>
                          {medicine.status
                            .split("-")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{medicine.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/medicines/${medicine.id}`}>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredMedicines.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No medicines found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

