"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, AlertCircle, CheckCircle2, Clock, Pill, Stethoscope } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { userRole } = useAuth()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Medicines</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">58</div>
                <p className="text-xs text-muted-foreground">+19% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Alerts</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {userRole === "farmer" && (
                  <>
                    <Link href="/dashboard/medicines/request">
                      <Button className="w-full flex items-center justify-start">
                        <Pill className="mr-2 h-4 w-4" />
                        Request Medicine
                      </Button>
                    </Link>
                    <Link href="/dashboard/health/report">
                      <Button className="w-full flex items-center justify-start" variant="outline">
                        <Stethoscope className="mr-2 h-4 w-4" />
                        Report Health Issue
                      </Button>
                    </Link>
                  </>
                )}

                {userRole === "veterinary" && (
                  <>
                    <Link href="/dashboard/medicines/approve">
                      <Button className="w-full flex items-center justify-start">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Review Medicine Requests
                      </Button>
                    </Link>
                    <Link href="/dashboard/health/monitor">
                      <Button className="w-full flex items-center justify-start" variant="outline">
                        <Activity className="mr-2 h-4 w-4" />
                        Monitor Health Reports
                      </Button>
                    </Link>
                  </>
                )}

                {userRole === "government" && (
                  <>
                    <Link href="/dashboard/medicines/inventory">
                      <Button className="w-full flex items-center justify-start">
                        <Pill className="mr-2 h-4 w-4" />
                        Medicine Inventory
                      </Button>
                    </Link>
                    <Link href="/dashboard/analytics">
                      <Button className="w-full flex items-center justify-start" variant="outline">
                        <Activity className="mr-2 h-4 w-4" />
                        View Analytics
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>You have 3 unread notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-md border p-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Medicine request approved</p>
                      <p className="text-sm text-muted-foreground">Your request for Antibiotic X has been approved</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-md border p-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Health alert</p>
                      <p className="text-sm text-muted-foreground">Potential outbreak reported in your area</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {
                          [
                            "Medicine request submitted",
                            "Health report filed",
                            "Medicine approved",
                            "Location updated",
                            "Profile updated",
                          ][i]
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {
                          [
                            "You requested 5 units of Antibiotic X",
                            "You reported a respiratory issue in your cattle",
                            "Veterinary officer approved your medicine request",
                            "Your farm location was updated on the map",
                            "You updated your contact information",
                          ][i]
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {["2 hours ago", "1 day ago", "2 days ago", "1 week ago", "2 weeks ago"][i]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

