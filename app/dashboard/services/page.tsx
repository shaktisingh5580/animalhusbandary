"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Phone, Mail, Clock, Search } from "lucide-react"

interface VetService {
  id: string
  name: string
  address: string
  contact: string
  email: string
  hours: string
  services: string[]
  distance: number // in kilometers
  lat: number
  lng: number
}

export default function ServicesPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [services, setServices] = useState<VetService[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demonstration
    setTimeout(() => {
      setServices([
        {
          id: "1",
          name: "Central Veterinary Clinic",
          address: "123 Main St, Rural County",
          contact: "+1234567890",
          email: "central@vetclinic.com",
          hours: "Mon-Fri: 8AM-5PM, Sat: 9AM-1PM",
          services: ["General checkup", "Vaccinations", "Surgery", "Emergency care"],
          distance: 3.2,
          lat: 40.7128,
          lng: -74.006,
        },
        {
          id: "2",
          name: "Rural Animal Hospital",
          address: "456 Farm Road, Countryside",
          contact: "+1987654321",
          email: "info@ruralanimalhospital.com",
          hours: "Mon-Sat: 9AM-6PM",
          services: ["Specialized treatment", "Laboratory services", "Dental care"],
          distance: 5.7,
          lat: 40.71,
          lng: -74.01,
        },
        {
          id: "3",
          name: "Mobile Veterinary Services",
          address: "Serves all rural areas",
          contact: "+1122334455",
          email: "mobile@vetservices.com",
          hours: "Mon-Sun: 8AM-8PM (On call 24/7 for emergencies)",
          services: ["On-site visits", "Emergency response", "Herd health management"],
          distance: 0,
          lat: 40.715,
          lng: -74.005,
        },
      ])
      setLoading(false)
      setMapLoaded(true)
    }, 1000)
  }, [])

  useEffect(() => {
    // Initialize OpenStreetMap when data is loaded
    if (mapLoaded && mapRef.current) {
      // In a real application, this would initialize OpenStreetMap
      // For now, we'll display a placeholder message
      mapRef.current.innerHTML = `
        <div class="flex items-center justify-center h-full bg-muted rounded-md">
          <p class="text-muted-foreground">OpenStreetMap would be displayed here</p>
        </div>
      `
    }
  }, [mapLoaded])

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Veterinary Services</h1>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>
                      {service.distance === 0 ? "Mobile service" : `${service.distance} km away`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <MapPin className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span>{service.address}</span>
                      </div>
                      <div className="flex items-start">
                        <Phone className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span>{service.contact}</span>
                      </div>
                      <div className="flex items-start">
                        <Mail className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span>{service.email}</span>
                      </div>
                      <div className="flex items-start">
                        <Clock className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span>{service.hours}</span>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Services Offered:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {service.services.map((item, index) => (
                            <li key={index} className="text-sm">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button className="w-full">Contact</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredServices.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">No veterinary services found</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Find Nearby Veterinary Services</CardTitle>
              <CardDescription>View veterinary services on the map</CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={mapRef} className="h-[400px] w-full rounded-md bg-muted">
                {!mapLoaded && (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

