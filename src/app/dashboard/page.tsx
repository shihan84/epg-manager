'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Monitor,
  Calendar,
  Download,
  LogOut,
  Plus,
  CreditCard,
  Edit,
  PlayCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalChannels: number;
  totalPrograms: number;
  totalSchedules: number;
  recentSchedules: Array<{
    id: string;
    programTitle: string;
    channelName: string;
    startTime: string;
    endTime: string;
  }>;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalChannels: 0,
    totalPrograms: 0,
    totalSchedules: 0,
    recentSchedules: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchDashboardData().catch(error => {
        console.error('Dashboard data fetch error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      });
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">EPG Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user?.companyName}
                </p>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name}!
          </h2>
          <p className="text-gray-600">
            Manage your live TV channels, programs, and schedules from your
            dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Channels
              </CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChannels}</div>
              <p className="text-xs text-muted-foreground">
                Active live TV channels
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Programs
              </CardTitle>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPrograms}</div>
              <p className="text-xs text-muted-foreground">
                Available programs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Schedules
              </CardTitle>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/management">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Edit className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">Content Management</CardTitle>
                <CardDescription>
                  Manage channels, programs & schedules
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/epg">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Download className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-lg">EPG Export</CardTitle>
                <CardDescription>Download XML files</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/subscription">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CreditCard className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle className="text-lg">Subscription</CardTitle>
                <CardDescription>Manage your subscription</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Schedules */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Schedules</CardTitle>
            <CardDescription>Your latest scheduled programs</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentSchedules.length > 0 ? (
              <div className="space-y-4">
                {stats.recentSchedules.map(schedule => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{schedule.programTitle}</h4>
                      <p className="text-sm text-gray-600">
                        {schedule.channelName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(schedule.startTime).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        to {new Date(schedule.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No schedules yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first schedule to get started
                </p>
                <Link href="/management">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Go to Content Management
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
