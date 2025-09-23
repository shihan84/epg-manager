'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Clock,
  Tv,
  PlayCircle,
  CalendarDays,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Channel {
  id: string;
  name: string;
  displayName: string;
  number?: number;
}

interface Program {
  id: string;
  title: string;
  duration?: number;
  category?: string;
}

interface Schedule {
  id: string;
  channelId: string;
  programId: string;
  startTime: string;
  endTime: string;
  isLive: boolean;
  isNew: boolean;
  isRepeat: boolean;
  channel: Channel;
  program: Program;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  pattern: string;
  timeSlots: Array<{
    id: string;
    startTime: string;
    endTime: string;
    programTitle: string;
    programDescription?: string;
    programCategory?: string;
    isLive?: boolean;
    isNew?: boolean;
  }>;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  excludeWeekends?: boolean;
  isActive: boolean;
}

export default function ScheduleManager() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScheduleTemplate | null>(null);
  const [formData, setFormData] = useState({
    channelId: '',
    programId: '',
    startTime: '',
    endTime: '',
    isLive: false,
    isNew: false,
    isRepeat: false,
  });
  const [bulkFormData, setBulkFormData] = useState({
    channelId: '',
    programId: '',
    startTime: '',
    endTime: '',
    isLive: false,
    isNew: false,
    isRepeat: false,
    pattern: 'daily', // daily, weekly, monthly
    startDate: '',
    endDate: '',
    daysOfWeek: [] as number[], // 0-6 for Sunday-Saturday
    dayOfMonth: 1, // 1-31 for monthly
    excludeWeekends: false,
  });

  useEffect(() => {
    Promise.all([
      fetchSchedules(),
      fetchChannels(),
      fetchPrograms(),
      fetchTemplates(),
    ]).catch(error => {
      console.error('Failed to fetch initial data:', error);
    });
  }, []);

  useEffect(() => {
    if (selectedChannel && selectedChannel !== 'all') {
      fetchSchedules(selectedChannel).catch(error => {
        console.error('Failed to fetch schedules:', error);
      });
    } else {
      fetchSchedules().catch(error => {
        console.error('Failed to fetch schedules:', error);
      });
    }
  }, [selectedChannel]);

  const fetchSchedules = async (channelId?: string) => {
    try {
      const params = new URLSearchParams();
      if (channelId) params.append('channelId', channelId);

      const response = await fetch(`/api/schedules?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch schedules',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch schedules',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/schedule-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const applyTemplate = async (
    template: ScheduleTemplate,
    channelId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      const response = await fetch('/api/schedule-templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          channelId,
          startDate,
          endDate,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: result.message,
        });
        fetchSchedules();
        setIsTemplateDialogOpen(false);
        setSelectedTemplate(null);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to apply template',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Apply template error:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply template',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingSchedule
        ? `/api/schedules/${editingSchedule.id}`
        : '/api/schedules';
      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        if (editingSchedule) {
          setSchedules(
            schedules.map(s => (s.id === editingSchedule.id ? data : s))
          );
          toast({
            title: 'Success',
            description: 'Schedule updated successfully',
          });
        } else {
          setSchedules([data, ...schedules]);
          toast({
            title: 'Success',
            description: 'Schedule created successfully',
          });
        }

        setIsDialogOpen(false);
        setEditingSchedule(null);
        setFormData({
          channelId: '',
          programId: '',
          startTime: '',
          endTime: '',
          isLive: false,
          isNew: false,
          isRepeat: false,
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to save schedule',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save schedule',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      channelId: schedule.channelId,
      programId: schedule.programId,
      startTime: new Date(schedule.startTime).toISOString().slice(0, 16),
      endTime: new Date(schedule.endTime).toISOString().slice(0, 16),
      isLive: schedule.isLive,
      isNew: schedule.isNew,
      isRepeat: schedule.isRepeat,
    });
    setIsDialogOpen(true);
  };

  const handleCopy = async (schedule: Schedule) => {
    const newStartTime = prompt(
      'Enter new start time (YYYY-MM-DDTHH:MM):',
      new Date(new Date(schedule.startTime).getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16)
    );

    if (!newStartTime) return;

    try {
      const response = await fetch(`/api/schedules/${schedule.id}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStartTime,
          newEndTime: new Date(
            new Date(newStartTime).getTime() +
              (new Date(schedule.endTime).getTime() -
                new Date(schedule.startTime).getTime())
          )
            .toISOString()
            .slice(0, 16),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules([data, ...schedules]);
        toast({
          title: 'Success',
          description: 'Schedule copied successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to copy schedule',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to copy schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy schedule',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSchedules(schedules.filter(s => s.id !== scheduleId));
        toast({
          title: 'Success',
          description: 'Schedule deleted successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete schedule',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = () => {
    setEditingSchedule(null);
    setFormData({
      channelId: '',
      programId: '',
      startTime: '',
      endTime: '',
      isLive: false,
      isNew: false,
      isRepeat: false,
    });
    setIsDialogOpen(true);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60)
    );
    return `${duration} min`;
  };

  const generateScheduleDates = () => {
    const {
      pattern,
      startDate,
      endDate,
      daysOfWeek,
      dayOfMonth,
      excludeWeekends,
    } = bulkFormData;
    const dates: Date[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (pattern === 'daily') {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (!excludeWeekends || (d.getDay() !== 0 && d.getDay() !== 6)) {
          dates.push(new Date(d));
        }
      }
    } else if (pattern === 'weekly') {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (daysOfWeek.includes(d.getDay())) {
          dates.push(new Date(d));
        }
      }
    } else if (pattern === 'monthly') {
      for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        const dayInMonth = new Date(d.getFullYear(), d.getMonth(), dayOfMonth);
        if (dayInMonth >= start && dayInMonth <= end) {
          dates.push(dayInMonth);
        }
      }
    }

    return dates;
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !bulkFormData.channelId ||
      !bulkFormData.programId ||
      !bulkFormData.startTime ||
      !bulkFormData.endTime
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!bulkFormData.startDate || !bulkFormData.endDate) {
      toast({
        title: 'Error',
        description: 'Please select start and end dates',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dates = generateScheduleDates();
      const baseStartTime = new Date(bulkFormData.startTime);
      const baseEndTime = new Date(bulkFormData.endTime);

      let successCount = 0;
      let errorCount = 0;

      for (const date of dates) {
        const startTime = new Date(date);
        startTime.setHours(
          baseStartTime.getHours(),
          baseStartTime.getMinutes()
        );

        const endTime = new Date(date);
        endTime.setHours(baseEndTime.getHours(), baseEndTime.getMinutes());

        const response = await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelId: bulkFormData.channelId,
            programId: bulkFormData.programId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            isLive: bulkFormData.isLive,
            isNew: bulkFormData.isNew,
            isRepeat: bulkFormData.isRepeat,
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Success',
          description: `Created ${successCount} schedules successfully${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
        });
        fetchSchedules();
        setIsBulkDialogOpen(false);
        setBulkFormData({
          channelId: '',
          programId: '',
          startTime: '',
          endTime: '',
          isLive: false,
          isNew: false,
          isRepeat: false,
          pattern: 'daily',
          startDate: '',
          endDate: '',
          daysOfWeek: [],
          dayOfMonth: 1,
          excludeWeekends: false,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create any schedules',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Bulk schedule creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create schedules',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Schedules</h2>
          <p className="text-gray-600">Manage your program schedules</p>
        </div>
        <div className="flex space-x-2">
          <Dialog
            open={isTemplateDialogOpen}
            onOpenChange={setIsTemplateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Schedule Templates</DialogTitle>
                <DialogDescription>
                  Choose a template to quickly create schedules for your channel
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {templates.map(template => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {template.pattern}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {template.timeSlots.slice(0, 3).map(slot => (
                            <div
                              key={slot.id}
                              className="text-xs text-gray-600"
                            >
                              {slot.startTime} - {slot.endTime}:{' '}
                              {slot.programTitle}
                            </div>
                          ))}
                          {template.timeSlots.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{template.timeSlots.length - 3} more programs
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          Apply Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarDays className="h-4 w-4 mr-2" />
                Bulk Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Bulk Schedules</DialogTitle>
                <DialogDescription>
                  Create multiple schedules with daily, weekly, or monthly
                  patterns
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bulkChannelId">Channel *</Label>
                    <Select
                      value={bulkFormData.channelId}
                      onValueChange={value =>
                        setBulkFormData({ ...bulkFormData, channelId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map(channel => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bulkProgramId">Program *</Label>
                    <Select
                      value={bulkFormData.programId}
                      onValueChange={value =>
                        setBulkFormData({ ...bulkFormData, programId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map(program => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bulkStartTime">Start Time *</Label>
                    <Input
                      id="bulkStartTime"
                      type="datetime-local"
                      value={bulkFormData.startTime}
                      onChange={e =>
                        setBulkFormData({
                          ...bulkFormData,
                          startTime: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bulkEndTime">End Time *</Label>
                    <Input
                      id="bulkEndTime"
                      type="datetime-local"
                      value={bulkFormData.endTime}
                      onChange={e =>
                        setBulkFormData({
                          ...bulkFormData,
                          endTime: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pattern">Pattern *</Label>
                    <Select
                      value={bulkFormData.pattern}
                      onValueChange={value =>
                        setBulkFormData({
                          ...bulkFormData,
                          pattern: value as 'daily' | 'weekly' | 'monthly',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bulkStartDate">Start Date *</Label>
                    <Input
                      id="bulkStartDate"
                      type="date"
                      value={bulkFormData.startDate}
                      onChange={e =>
                        setBulkFormData({
                          ...bulkFormData,
                          startDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bulkEndDate">End Date *</Label>
                    <Input
                      id="bulkEndDate"
                      type="date"
                      value={bulkFormData.endDate}
                      onChange={e =>
                        setBulkFormData({
                          ...bulkFormData,
                          endDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  {bulkFormData.pattern === 'monthly' && (
                    <div>
                      <Label htmlFor="dayOfMonth">Day of Month</Label>
                      <Input
                        id="dayOfMonth"
                        type="number"
                        min="1"
                        max="31"
                        value={bulkFormData.dayOfMonth}
                        onChange={e =>
                          setBulkFormData({
                            ...bulkFormData,
                            dayOfMonth: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                {bulkFormData.pattern === 'weekly' && (
                  <div>
                    <Label>Days of Week</Label>
                    <div className="grid grid-cols-7 gap-2 mt-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                        (day, index) => (
                          <div
                            key={day}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`day-${index}`}
                              checked={bulkFormData.daysOfWeek.includes(index)}
                              onCheckedChange={checked => {
                                if (checked) {
                                  setBulkFormData({
                                    ...bulkFormData,
                                    daysOfWeek: [
                                      ...bulkFormData.daysOfWeek,
                                      index,
                                    ],
                                  });
                                } else {
                                  setBulkFormData({
                                    ...bulkFormData,
                                    daysOfWeek: bulkFormData.daysOfWeek.filter(
                                      d => d !== index
                                    ),
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`day-${index}`} className="text-sm">
                              {day}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excludeWeekends"
                    checked={bulkFormData.excludeWeekends}
                    onCheckedChange={checked =>
                      setBulkFormData({
                        ...bulkFormData,
                        excludeWeekends: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="excludeWeekends">
                    Exclude Weekends (for daily pattern)
                  </Label>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bulkIsLive"
                      checked={bulkFormData.isLive}
                      onCheckedChange={checked =>
                        setBulkFormData({
                          ...bulkFormData,
                          isLive: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="bulkIsLive">Live Program</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bulkIsNew"
                      checked={bulkFormData.isNew}
                      onCheckedChange={checked =>
                        setBulkFormData({
                          ...bulkFormData,
                          isNew: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="bulkIsNew">New Program</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bulkIsRepeat"
                      checked={bulkFormData.isRepeat}
                      onCheckedChange={checked =>
                        setBulkFormData({
                          ...bulkFormData,
                          isRepeat: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="bulkIsRepeat">Repeat Program</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBulkDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Create Schedules
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
                </DialogTitle>
                <DialogDescription>
                  {editingSchedule
                    ? 'Update schedule information'
                    : 'Add a new program schedule'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="channelId">Channel *</Label>
                    <Select
                      value={formData.channelId}
                      onValueChange={value =>
                        setFormData({ ...formData, channelId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map(channel => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="programId">Program *</Label>
                    <Select
                      value={formData.programId}
                      onValueChange={value =>
                        setFormData({ ...formData, programId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map(program => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={e =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={e =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isLive"
                      checked={formData.isLive}
                      onCheckedChange={checked =>
                        setFormData({ ...formData, isLive: checked as boolean })
                      }
                    />
                    <Label htmlFor="isLive">Live Program</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNew"
                      checked={formData.isNew}
                      onCheckedChange={checked =>
                        setFormData({ ...formData, isNew: checked as boolean })
                      }
                    />
                    <Label htmlFor="isNew">New Program</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isRepeat"
                      checked={formData.isRepeat}
                      onCheckedChange={checked =>
                        setFormData({
                          ...formData,
                          isRepeat: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="isRepeat">Repeat Program</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSchedule ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {selectedTemplate && (
            <Dialog
              open={!!selectedTemplate}
              onOpenChange={() => setSelectedTemplate(null)}
            >
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    Apply Template: {selectedTemplate.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTemplate.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="templateChannel">Channel</Label>
                    <Select
                      onValueChange={value =>
                        setFormData({ ...formData, channelId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map(channel => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateStartDate">Start Date</Label>
                      <Input
                        id="templateStartDate"
                        type="date"
                        onChange={e =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value + 'T00:00',
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateEndDate">End Date</Label>
                      <Input
                        id="templateEndDate"
                        type="date"
                        onChange={e =>
                          setFormData({
                            ...formData,
                            endTime: e.target.value + 'T23:59',
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-sm mb-2">
                      Template Preview:
                    </h4>
                    <div className="space-y-1">
                      {selectedTemplate.timeSlots.map(slot => (
                        <div key={slot.id} className="text-xs text-gray-600">
                          {slot.startTime} - {slot.endTime}: {slot.programTitle}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (
                        formData.channelId &&
                        formData.startTime &&
                        formData.endTime
                      ) {
                        applyTemplate(
                          selectedTemplate,
                          formData.channelId,
                          formData.startTime.split('T')[0],
                          formData.endTime.split('T')[0]
                        );
                      } else {
                        toast({
                          title: 'Error',
                          description: 'Please fill in all required fields',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    Apply Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {channels.map(channel => (
              <SelectItem key={channel.id} value={channel.id}>
                {channel.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {schedules.map(schedule => (
          <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Tv className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">
                      {schedule.channel.displayName}
                    </span>
                    {schedule.channel.number && (
                      <Badge variant="outline">
                        #{schedule.channel.number}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <PlayCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">
                      {schedule.program.title}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(schedule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(schedule)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Start Time</p>
                    <p className="font-medium">
                      {formatDateTime(schedule.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">End Time</p>
                    <p className="font-medium">
                      {formatDateTime(schedule.endTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {getDuration(schedule.startTime, schedule.endTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                {schedule.isLive && <Badge variant="destructive">Live</Badge>}
                {schedule.isNew && <Badge variant="default">New</Badge>}
                {schedule.isRepeat && <Badge variant="secondary">Repeat</Badge>}
                {schedule.program.category && (
                  <Badge variant="outline">{schedule.program.category}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {schedules.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No schedules yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first schedule
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
