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
import { Textarea } from '@/components/ui/textarea';
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
import {
  Plus,
  Edit,
  Trash2,
  Tv,
  Globe,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { COMMON_LANGUAGES, getLanguageByCode } from '@/lib/languages';

interface Channel {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  number?: number;
  logoUrl?: string;
  streamUrl?: string;
  language?: string;
  region?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ChannelManager() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    number: '',
    logoUrl: '',
    streamUrl: '',
    language: 'en',
    region: 'IN',
  });

  useEffect(() => {
    fetchChannels().catch(error => {
      console.error('Failed to fetch channels:', error);
    });
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch channels',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch channels',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingChannel
        ? `/api/channels/${editingChannel.id}`
        : '/api/channels';
      const method = editingChannel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        if (editingChannel) {
          setChannels(
            channels.map(c => (c.id === editingChannel.id ? data : c))
          );
          toast({
            title: 'Success',
            description: 'Channel updated successfully',
          });
        } else {
          setChannels([data, ...channels]);
          toast({
            title: 'Success',
            description: 'Channel created successfully',
          });
        }

        setIsDialogOpen(false);
        setEditingChannel(null);
        setFormData({
          name: '',
          displayName: '',
          description: '',
          number: '',
          logoUrl: '',
          streamUrl: '',
          language: 'en',
          region: 'IN',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to save channel',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to save channel',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      displayName: channel.displayName,
      description: channel.description || '',
      number: channel.number?.toString() || '',
      logoUrl: channel.logoUrl || '',
      streamUrl: channel.streamUrl || '',
      language: channel.language || 'en',
      region: channel.region || 'IN',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (channelId: string) => {
    if (!confirm('Are you sure you want to delete this channel?')) return;

    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChannels(channels.filter(c => c.id !== channelId));
        toast({
          title: 'Success',
          description: 'Channel deleted successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete channel',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to delete channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete channel',
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = () => {
    setEditingChannel(null);
    setFormData({
      name: '',
      displayName: '',
      description: '',
      number: '',
      logoUrl: '',
      streamUrl: '',
      language: 'en',
      region: 'IN',
    });
    setIsDialogOpen(true);
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
          <h2 className="text-2xl font-bold">Channels</h2>
          <p className="text-gray-600">Manage your TV channels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingChannel ? 'Edit Channel' : 'Create Channel'}
              </DialogTitle>
              <DialogDescription>
                {editingChannel
                  ? 'Update channel information'
                  : 'Add a new channel to your lineup'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="news-channel"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={e =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    placeholder="News Channel"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Channel description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="number">Channel Number</Label>
                  <Input
                    id="number"
                    type="number"
                    value={formData.number}
                    onChange={e =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={value =>
                      setFormData({ ...formData, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_LANGUAGES.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{lang.nativeName}</span>
                            <span className="text-xs text-gray-500">
                              ({lang.name})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={formData.region}
                    onValueChange={value =>
                      setFormData({ ...formData, region: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="SG">Singapore</SelectItem>
                      <SelectItem value="AE">UAE</SelectItem>
                      <SelectItem value="SA">Saudi Arabia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="streamUrl">Stream URL</Label>
                  <Input
                    id="streamUrl"
                    value={formData.streamUrl}
                    onChange={e =>
                      setFormData({ ...formData, streamUrl: e.target.value })
                    }
                    placeholder="https://example.com/stream.m3u8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logoUrl">Channel Logo</Label>
                <div className="flex space-x-2">
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={e =>
                      setFormData({ ...formData, logoUrl: e.target.value })
                    }
                    placeholder="https://example.com/logo.png"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Future: Implement image upload
                      toast({
                        title: 'Image Upload',
                        description:
                          'Image upload feature coming soon! Please use URL for now.',
                      });
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                </div>
                {formData.logoUrl && (
                  <div className="mt-2 flex items-center space-x-2">
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    <img
                      src={formData.logoUrl}
                      alt="Channel logo preview"
                      className="h-8 w-8 object-contain border rounded"
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-gray-500">Logo Preview</span>
                  </div>
                )}
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
                  {editingChannel ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {channels.map(channel => (
          <Card key={channel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {channel.logoUrl ? (
                    <img
                      src={channel.logoUrl}
                      alt={`${channel.displayName} logo`}
                      className="h-6 w-6 object-contain"
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove(
                          'hidden'
                        );
                      }}
                    />
                  ) : null}
                  <Tv
                    className={`h-5 w-5 text-blue-600 ${channel.logoUrl ? 'hidden' : ''}`}
                  />
                  <CardTitle className="text-lg">
                    {channel.displayName}
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {channel.language && (
                    <Badge variant="outline" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      {getLanguageByCode(channel.language)?.nativeName ||
                        channel.language}
                    </Badge>
                  )}
                  <Badge variant={channel.isActive ? 'default' : 'secondary'}>
                    {channel.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <CardDescription>{channel.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {channel.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {channel.description}
                </p>
              )}
              <div className="space-y-2 text-sm">
                {channel.number && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Number:</span>
                    <span>{channel.number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span>
                    {new Date(channel.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(channel)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(channel.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {channels.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Tv className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No channels yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first channel
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Channel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
