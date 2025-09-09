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
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  ArrowLeft,
  Save,
  X,
  Clock,
  PlayCircle,
  Monitor
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Schedule {
  id: string
  channelId: string
  programId: string
  startTime: string
  endTime: string
  isLive: boolean
  isNew: boolean
  createdAt: string
  updatedAt: string
  channel: {
    id: string
    name: string
    displayName: string | null
  }
  program: {
    id: string
    title: string
    category: string | null
    duration: number | null
  }
}

interface Channel {
  id: string
  name: string
  displayName: string | null
}

interface Program {
  id: string
  title: string
  category: string | null
  duration: number | null
}

export default function SchedulesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [formData, setFormData] = useState({
    channelId: "",
    programId: "",
    startTime: "",
    endTime: "",
    isLive: false,
    isNew: false
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchSchedules()
      fetchChannels()
      fetchPrograms()
    }
  }, [status, router])

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/schedules")
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive",
      })
    }
  }

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
    }
  }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))

    // Auto-calculate end time if program is selected
    if (name === "programId" && value) {
      const selectedProgram = programs.find(p => p.id === value)
      if (selectedProgram?.duration && formData.startTime) {
        const startTime = new Date(formData.startTime)
        const endTime = new Date(startTime.getTime() + selectedProgram.duration * 60000)
        setFormData(prev => ({
          ...prev,
          programId: value,
          endTime: endTime.toISOString().slice(0, 16)
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSchedule ? `/api/schedules/${editingSchedule.id}` : "/api/schedules"
      const method = editingSchedule ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingSchedule ? "Schedule updated successfully" : "Schedule created successfully",
        })
        setIsDialogOpen(false)
        setEditingSchedule(null)
        resetForm()
        fetchSchedules()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save schedule",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the schedule",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      channelId: schedule.channelId,
      programId: schedule.programId,
      startTime: new Date(schedule.startTime).toISOString().slice(0, 16),
      endTime: new Date(schedule.endTime).toISOString().slice(0, 16),
      isLive: schedule.isLive,
      isNew: schedule.isNew
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return
    }

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Schedule deleted successfully",
        })
        fetchSchedules()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete schedule",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the schedule",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      channelId: "",
      programId: "",
      startTime: "",
      endTime: "",
      isLive: false,
      isNew: false
    })
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingSchedule(null)
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
                <Calendar className="h-8 w-8 text-indigo-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Schedules</h2>
            <p className="text-gray-600">
              Schedule your programs on specific channels with start and end times.
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingSchedule(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
                </DialogTitle>
                <DialogDescription>
                  {editingSchedule ? "Update schedule information" : "Create a new program schedule"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="channelId">Channel *</Label>
                  <select
                    id="channelId"
                    name="channelId"
                    value={formData.channelId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a channel</option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.displayName || channel.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="programId">Program *</Label>
                  <select
                    id="programId"
                    name="programId"
                    value={formData.programId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.title} {program.category ? `(${program.category})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="isLive"
                      name="isLive"
                      type="checkbox"
                      checked={formData.isLive}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <Label htmlFor="isLive">Live Broadcast</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      id="isNew"
                      name="isNew"
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <Label htmlFor="isNew">New Episode</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingSchedule ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Schedules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Schedules</CardTitle>
            <CardDescription>
              List of all your scheduled programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schedules.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Monitor className="h-4 w-4 mr-2" />
                          {schedule.channel.displayName || schedule.channel.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {schedule.program.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(schedule.startTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(schedule.endTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {schedule.isLive && (
                            <Badge variant="destructive" className="text-xs">
                              LIVE
                            </Badge>
                          )}
                          {schedule.isNew && (
                            <Badge variant="default" className="text-xs">
                              NEW
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
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
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules yet</h3>
                <p className="text-gray-600 mb-4">Create your first schedule to get started</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingSchedule(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Schedule
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