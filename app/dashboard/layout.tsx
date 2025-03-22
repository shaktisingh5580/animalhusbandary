"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LayoutDashboard, Pill, Stethoscope, Map, Bell, Settings, LogOut, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userRole, loading, signOut } = useAuth()
  const router = useRouter()
  const isMobile = useMobile()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const menuItems = [
    { icon: <LayoutDashboard className="mr-2 h-5 w-5" />, label: "Dashboard", href: "/dashboard" },
    { icon: <Pill className="mr-2 h-5 w-5" />, label: "Medicine Inventory", href: "/dashboard/medicines" },
    { icon: <Stethoscope className="mr-2 h-5 w-5" />, label: "Health Monitoring", href: "/dashboard/health" },
    { icon: <Map className="mr-2 h-5 w-5" />, label: "Veterinary Services", href: "/dashboard/services" },
    { icon: <Bell className="mr-2 h-5 w-5" />, label: "Notifications", href: "/dashboard/notifications" },
    { icon: <Settings className="mr-2 h-5 w-5" />, label: "Settings", href: "/dashboard/settings" },
  ]

  const renderMenu = () => (
    <div className="space-y-1">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
      <Button
        variant="ghost"
        className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Log Out
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center">
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="py-4">
                    <h2 className="text-lg font-semibold mb-6">Menu</h2>
                    {renderMenu()}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <Link href="/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold">AHIS</h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              {userRole && userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </div>
            {!isMobile && (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {!isMobile && (
          <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block border-r pr-4">
            <nav className="flex flex-col space-y-1 py-6">{renderMenu()}</nav>
          </aside>
        )}
        <main className="flex w-full flex-col py-6">{children}</main>
      </div>
    </div>
  )
}

