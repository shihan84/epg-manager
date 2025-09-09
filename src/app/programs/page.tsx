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
  PlayCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  LogOut,
  ArrowLeft,
  Save,
  X,
  Clock
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Program {
  id: string
  title: string
  description: string | null
  category: string | null
  duration: number | null
  imageUrl: string | null
  isRepeat: boolean
  createdAt: string
  updatedAt: string
}

export default function ProgramsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    imageUrl: "",
    isRepeat: false
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchPrograms()
    }
  }, [status, router])

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/programs")
      if (response.ok) {
        const data = await response.json()
        setPrograms(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load programs",
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
      const url = editingProgram ? `/api/programs/${editingProgram.id}` : "/api/programs"
      const method = editingProgram ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : null
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingProgram ? "Program updated successfully" : "Program created successfully",
        })
        setIsDialogOpen(false)
        setEditingProgram(null)
        resetForm()
        fetchPrograms()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save program",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the program",
        variant: "destructive",
      })
    }
  }

  const handleCopy = async (program: Program) => {
    try {
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `${program.title} (Copy)`,
          description: program.description,
          category: program.category,
          duration: program.duration,
          imageUrl: program.imageUrl,
          isRepeat: program.isRepeat
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Program copied successfully",
        })
        fetchPrograms()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to copy program",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while copying the program",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (program: Program) => {
    setEditingProgram(program)
    setFormData({
      title: program.title,
      description: program.description || "",
      category: program.category || "",
      duration: program.duration?.toString() || "",
      imageUrl: program.imageUrl || "",
      isRepeat: program.isRepeat
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (programId: string) => {
    if (!confirm("Are you sure you want to delete this program?")) {
      return
    }

    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Program deleted successfully",
        })
        fetchPrograms()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete program",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the program",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      duration: "",
      imageUrl: "",
      isRepeat: false
    })
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingProgram(null)
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
                <PlayCircle className="h-8 w-8 text-indigo-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Program Management</h1>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Programs</h2>
            <p className="text-gray-600">
              Manage your TV programs, including descriptions, categories, and durations.
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProgram(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingProgram ? "Edit Program" : "Add New Program"}
                </DialogTitle>
                <DialogDescription>
                  {editingProgram ? "Update program information" : "Create a new TV program"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Program Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Morning News"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Program description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., News, Sports, Entertainment"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="60"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    id="isRepeat"
                    name="isRepeat"
                    type="checkbox"
                    checked={formData.isRepeat}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <Label htmlFor="isRepeat">Repeat Program</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingProgram ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Programs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Programs</CardTitle>
            <CardDescription>
              List of all your TV programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {programs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Repeat</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.title}</TableCell>
                      <TableCell>{program.category || "-"}</TableCell>
                      <TableCell>
                        {program.duration ? (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {program.duration} min
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={program.isRepeat ? "default" : "secondary"}>
                          {program.isRepeat ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(program)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(program)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(program.id)}
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
                <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No programs yet</h3>
                <p className="text-gray-600 mb-4">Create your first program to get started</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingProgram(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Program
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