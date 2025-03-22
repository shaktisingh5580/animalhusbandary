"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import Link from "next/link"

interface HealthReport {
  id: string
  animalType: string
  symptoms: string
  reportDate: string
  status: "pending" | "in-review" | "resolved"
  priority: "low" | "medium" | "high"
}

export default function HealthMonitoringPage() {
  const { userRole } = useAuth()
  const [reports, setReports] = useState<HealthReport[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demonstration
    setTimeout(() => {
      setReports([
        {
          id: "1",
          animalType: "Cattle",
          symptoms: "Difficulty breathing, reduced appetite",
          reportDate: "2023-08-18",
          status: "pending",
          priority: "high",
        },
        {
          id: "2",
          animalType: "Goat",
          symptoms: "Limping, swollen joint",
          reportDate: "2023-08-15",
          status: "in-review",
          priority: "medium",
        },
        {
          id: "3",
          animalType: "Poultry",
          symptoms: "Reduced egg production, lethargy",
          reportDate: "2023-08-10",
          status: "resolved",
          priority: "low",
        },
        {
          id: "4",
          animalType: "Cattle",
          symptoms: "Diarrhea, dehydration",
          reportDate: "2023-08-05",
          status: "resolved",
          priority: "high",
        },
        {
          id: "5",
          animalType: "Sheep",
          symptoms: "Skin rash, scratching",
          reportDate: "2023-08-01",
          status: "in-review",
          priority: "medium",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredReports = reports.filter(
    (report) =>
      report.animalType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.symptoms.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500"
      case "in-review":
        return "bg-blue-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Health Monitoring</h1>

        {userRole === "farmer" && (
          <Link href="/dashboard/health/report">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report Health Issue
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Reports</CardTitle>
          <CardDescription>View and manage livestock health reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
                    <TableHead>Animal Type</TableHead>
                    <TableHead>Symptoms</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Report Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.animalType}</TableCell>
                      <TableCell>{report.symptoms}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getPriorityColor(report.priority)} text-white`}>
                          {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(report.status)} text-white`}>
                          {report.status
                            .split("-")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.reportDate}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/health/${report.id}`}>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredReports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No health reports found
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

