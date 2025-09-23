'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tv,
  PlayCircle,
  Calendar,
  BarChart3,
  FileText,
  Globe,
} from 'lucide-react';

interface ContentStats {
  totalChannels: number;
  totalPrograms: number;
  totalSchedules: number;
  activeChannels: number;
  upcomingSchedules: number;
  languagesUsed: string[];
  categoriesUsed: string[];
}

export default function ManagementPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ContentStats>({
    totalChannels: 0,
    totalPrograms: 0,
    totalSchedules: 0,
    activeChannels: 0,
    upcomingSchedules: 0,
    languagesUsed: [],
    categoriesUsed: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchContentStats();
    }
  }, [session]);

  const fetchContentStats = async () => {
    try {
      const [channelsRes, programsRes, schedulesRes] = await Promise.all([
        fetch('/api/channels'),
        fetch('/api/programs'),
        fetch('/api/schedules'),
      ]);

      const [channels, programs, schedules] = await Promise.all([
        channelsRes.json(),
        programsRes.json(),
        schedulesRes.json(),
      ]);

      const now = new Date();
      const upcomingSchedules = schedules.filter(
        (schedule: any) => new Date(schedule.startTime) > now
      ).length;

      const languages = [
        ...new Set([
          ...channels.map((c: any) => c.language).filter(Boolean),
          ...programs.map((p: any) => p.language).filter(Boolean),
        ]),
      ] as string[];

      const categories = [
        ...new Set(programs.map((p: any) => p.category).filter(Boolean)),
      ] as string[];

      setStats({
        totalChannels: channels.length,
        totalPrograms: programs.length,
        totalSchedules: schedules.length,
        activeChannels: channels.filter((c: any) => c.isActive).length,
        upcomingSchedules,
        languagesUsed: languages,
        categoriesUsed: categories,
      });
    } catch (error) {
      console.error('Failed to fetch content stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please sign in to access the management dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Content Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your channels, programs, and schedules in one place
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Globe className="h-3 w-3" />
                <span>{stats.languagesUsed.length} Languages</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>{stats.categoriesUsed.length} Categories</span>
              </Badge>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Channels
                  </CardTitle>
                  <Tv className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalChannels}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant={
                        stats.activeChannels > 0 ? 'default' : 'secondary'
                      }
                    >
                      {stats.activeChannels} Active
                    </Badge>
                    {stats.totalChannels > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {Math.round(
                          (stats.activeChannels / stats.totalChannels) * 100
                        )}
                        % active
                      </div>
                    )}
                  </div>
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
                  <div className="text-2xl font-bold">
                    {stats.totalPrograms}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.categoriesUsed.length} categories
                  </div>
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
                  <div className="text-2xl font-bold">
                    {stats.totalSchedules}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.upcomingSchedules} upcoming
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Languages
                  </CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.languagesUsed.length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.languagesUsed.slice(0, 2).join(', ')}
                    {stats.languagesUsed.length > 2 &&
                      ` +${stats.languagesUsed.length - 2} more`}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to get you started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() =>
                      (window.location.href = '/management/channels')
                    }
                  >
                    <Tv className="h-6 w-6" />
                    <span>Manage Channels</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() =>
                      (window.location.href = '/management/programs')
                    }
                  >
                    <PlayCircle className="h-6 w-6" />
                    <span>Manage Programs</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() =>
                      (window.location.href = '/management/schedules')
                    }
                  >
                    <Calendar className="h-6 w-6" />
                    <span>Manage Schedules</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Content Health */}
            <Card>
              <CardHeader>
                <CardTitle>Content Health</CardTitle>
                <CardDescription>
                  Overview of your content organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Channel Coverage</span>
                    <span>
                      {stats.totalChannels > 0 ? 'Good' : 'Needs Setup'}
                    </span>
                  </div>
                  <Progress
                    value={stats.totalChannels > 0 ? 100 : 0}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Program Diversity</span>
                    <span>
                      {stats.categoriesUsed.length >= 3 ? 'Good' : 'Needs More'}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      (stats.categoriesUsed.length / 3) * 100,
                      100
                    )}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Language Support</span>
                    <span>
                      {stats.languagesUsed.length >= 2 ? 'Good' : 'Needs More'}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      (stats.languagesUsed.length / 2) * 100,
                      100
                    )}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
