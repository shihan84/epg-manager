"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users, 
  Settings, 
  LogOut,
  ArrowLeft,
  UserPlus,
  Edit,
  Trash2,
  Monitor,
  PlayCircle,
  Calendar,
  FileText,
  Shield,
  Activity
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  companyName: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    channels: number
    programs: number
    schedules: number
  }
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  totalChannels: number
  totalPrograms: number
  totalSchedules: number
  recentUsers: User[]
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalChannels: 0,
    totalPrograms: 0,
    totalSchedules: 0,
    recentUsers: []
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      if (session.user?.role !== "ADMIN") {
        router.push("/dashboard")
        return
      }
      fetchAdminData()
    }
  }, [status, session, router])

  const fetchAdminData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users")
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        })
        fetchAdminData()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update user status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating user status",
        variant: "destructive",
      })
    }
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
                <Shield className="h-8 w-8 text-indigo-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <Badge variant="default">Admin</Badge>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">
            Manage users and monitor system-wide EPG data.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Active accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChannels}</div>
              <p className="text-xs text-muted-foreground">
                Across all users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPrograms}</div>
              <p className="text-xs text-muted-foreground">
                Total programs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchedules}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled programs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Users who recently joined the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length > 0 ? (
              <div className="space-y-4">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{user.name || user.email}</h4>
                      <p className="text-sm text-gray-600">{user.companyName || 'No company'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent users</h3>
                <p className="text-gray-600">New users will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Users */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage all registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead>Programs</TableHead>
                    <TableHead>Schedules</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.companyName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "ADMIN" ? "destructive" : "default"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user._count.channels}</TableCell>
                      <TableCell>{user._count.programs}</TableCell>
                      <TableCell>{user._count.schedules}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, !user.isActive)}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">No users have registered yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}