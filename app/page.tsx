import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Animal Husbandry Inventory System</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-md p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Welcome to the Animal Husbandry Inventory System</h2>
            <p className="text-lg mb-8">
              A comprehensive platform for tracking medicine distribution, monitoring livestock health, and providing
              essential veterinary services to rural farmers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-2">For Farmers</h3>
                <p className="mb-4">Register, request medicines, and log livestock health issues</p>
              </div>

              <div className="bg-muted p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-2">For Veterinary Officers</h3>
                <p className="mb-4">Approve medicine requests and provide treatment recommendations</p>
              </div>

              <div className="bg-muted p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-2">For Government Officials</h3>
                <p className="mb-4">Track medicine distribution and monitor system usage</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login">
                <Button size="lg">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Animal Husbandry Inventory System</p>
        </div>
      </footer>
    </div>
  )
}

