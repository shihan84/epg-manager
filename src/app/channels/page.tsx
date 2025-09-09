"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Monitor, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  LogOut,
  ArrowLeft,
  Save,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Channel {
  id: string
  name: string
  displayName: string | null
  description: string | null
  logoUrl: string | null
  streamUrl: string | null
  number: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ChannelsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    logoUrl: "",
    streamUrl: "",
    number: "",
    isActive: true
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchChannels()
    }
  }, [status, router])

  const fetchChannels = async () => {
    try {
      const response = await fetch("/api/channels")
      if (response.ok) {
        const data = await response.json()
        setChannels(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingChannel ? `/api/channels/${editingChannel.id}` : "/api/channels"
      const method = editingChannel ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          number: formData.number ? parseInt(formData.number) : null
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingChannel ? "Channel updated successfully" : "Channel created successfully",
        })
        setIsDialogOpen(false)
        setEditingChannel(null)
        resetForm()
        fetchChannels()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save channel",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the channel",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel)
    setFormData({
      name: channel.name,
      displayName: channel.displayName || "",
      description: channel.description || "",
      logoUrl: channel.logoUrl || "",
      streamUrl: channel.streamUrl || "",
      number: channel.number?.toString() || "",
      isActive: channel.isActive
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (channelId: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) {
      return
    }

    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Channel deleted successfully",
        })
        fetchChannels()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete channel",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the channel",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      logoUrl: "",
      streamUrl: "",
      number: "",
      isActive: true
    })
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingChannel(null)
    resetForm()
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center">
                <Monitor className="h-8 w-8 text-indigo-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Channel Management</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.companyName}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Channels</h2>
            <p className="text-gray-600">
              Manage your TV channels, including logos, descriptions, and streaming URLs.
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingChannel(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingChannel ? "Edit Channel" : "Add New Channel"}
                </DialogTitle>
                <DialogDescription>
                  {editingChannel ? "Update channel information" : "Create a new TV channel"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Channel Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., news-channel"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="e.g., News Channel"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Channel description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="streamUrl">Stream URL</Label>
                  <Input
                    id="streamUrl"
                    name="streamUrl"
                    value={formData.streamUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/stream.m3u8"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="number">Channel Number</Label>
                  <Input
                    id="number"
                    name="number"
                    type="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="1"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active Channel</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingChannel ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Channels Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Channels</CardTitle>
            <CardDescription>
              List of all your TV channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {channels.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.map((channel) => (
                    <TableRow key={channel.id}>
                      <TableCell className="font-medium">{channel.name}</TableCell>
                      <TableCell>{channel.displayName || "-"}</TableCell>
                      <TableCell>{channel.number || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={channel.isActive ? "default" : "secondary"}>
                          {channel.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(channel)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(channel.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No channels yet</h3>
                <p className="text-gray-600 mb-4">Create your first channel to get started</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingChannel(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Channel
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}