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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Globe,
  RefreshCw,
  Settings,
  Copy,
  ExternalLink,
  Monitor,
  Smartphone,
  Tv,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EPGData {
  epgUrl: string;
  format: string;
  generatedAt: string;
  downloadUrl: string;
  expiresAt: string;
}

interface EPGFormat {
  id: string;
  name: string;
  description: string;
  platform: string;
  extension: string;
  mimeType: string;
  features: string[];
  requirements: {
    channels: boolean;
    programs: boolean;
    schedules: boolean;
    images: boolean;
    categories: boolean;
    descriptions: boolean;
  };
}

export default function EPGPage() {
  const { data: session } = useSession();
  const [epgData, setEpgData] = useState<EPGData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [formats, setFormats] = useState<EPGFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState('xmltv');
  const [includeImages, setIncludeImages] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchChannels();
    fetchEPGData();
    fetchFormats();
  }, []);

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

  const fetchEPGData = async () => {
    try {
      const response = await fetch('/api/epg');
      if (response.ok) {
        const data = await response.json();
        setEpgData(data);
      }
    } catch (error) {
      console.error('Failed to fetch EPG data:', error);
    }
  };

  const fetchFormats = async () => {
    try {
      const response = await fetch('/api/epg/formats');
      if (response.ok) {
        const data = await response.json();
        setFormats(data);
      }
    } catch (error) {
      console.error('Failed to fetch EPG formats:', error);
    }
  };

  const generateEPG = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/epg/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channels: selectedChannels.length > 0 ? selectedChannels : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          format: selectedFormat,
          includeImages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEpgData(data);
        toast({
          title: 'EPG Generated',
          description: 'Your EPG has been generated successfully!',
        });
      } else {
        throw new Error('Failed to generate EPG');
      }
    } catch (error) {
      console.error('EPG generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate EPG. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'URL copied to clipboard!',
    });
  };

  const downloadEPG = () => {
    if (epgData?.downloadUrl) {
      window.open(epgData.downloadUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">EPG Management</h1>
        <p className="text-muted-foreground">
          Generate and manage your Electronic Program Guide for distributors
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate EPG</TabsTrigger>
          <TabsTrigger value="hosted">Hosted EPG</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New EPG</CardTitle>
              <CardDescription>
                Create a new EPG file for your channels and programs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="format">Platform & Format</Label>
                    <Select
                      value={selectedFormat}
                      onValueChange={setSelectedFormat}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map(format => (
                          <SelectItem key={format.id} value={format.id}>
                            <div className="flex items-center space-x-2">
                              {format.platform === 'Roku' && (
                                <Tv className="h-4 w-4" />
                              )}
                              {format.platform === 'Kodi' && (
                                <Monitor className="h-4 w-4" />
                              )}
                              {format.platform === 'JioTV' && (
                                <Smartphone className="h-4 w-4" />
                              )}
                              {format.platform === 'Tata Play' && (
                                <Tv className="h-4 w-4" />
                              )}
                              {format.platform === 'Plex' && (
                                <Monitor className="h-4 w-4" />
                              )}
                              {format.platform === 'Universal' && (
                                <Globe className="h-4 w-4" />
                              )}
                              <span>
                                {format.name} ({format.platform})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedFormat && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {
                          formats.find(f => f.id === selectedFormat)
                            ?.description
                        }
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="channels">Channels (Optional)</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                      {channels.map(channel => (
                        <div
                          key={channel.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={channel.id}
                            checked={selectedChannels.includes(channel.id)}
                            onCheckedChange={checked => {
                              if (checked) {
                                setSelectedChannels([
                                  ...selectedChannels,
                                  channel.id,
                                ]);
                              } else {
                                setSelectedChannels(
                                  selectedChannels.filter(
                                    id => id !== channel.id
                                  )
                                );
                              }
                            }}
                          />
                          <Label htmlFor={channel.id} className="text-sm">
                            {channel.displayName || channel.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to include all channels
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeImages"
                      checked={includeImages}
                      onCheckedChange={checked => setIncludeImages(!!checked)}
                    />
                    <Label htmlFor="includeImages">Include Images</Label>
                  </div>
                </div>
              </div>

              <Button
                onClick={generateEPG}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating EPG...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Generate EPG
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hosted" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hosted EPG URL</CardTitle>
              <CardDescription>
                Your permanent EPG URL that distributors can use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {epgData?.epgUrl ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono break-all">
                        {epgData.epgUrl}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(epgData.epgUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Badge variant="secondary">
                        {epgData.format.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label>Generated</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(epgData.generatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Expires</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(epgData.expiresAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Actions</Label>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(epgData.epgUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={downloadEPG}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No EPG Generated
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Generate your first EPG to get your hosted URL
                  </p>
                  <Button onClick={() => generateEPG()}>Generate EPG</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Instructions</CardTitle>
              <CardDescription>
                How to use your EPG URL with different platforms and devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <Tv className="h-4 w-4" />
                    <span>Roku Devices</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use the Roku format for Roku Channel Store apps. The JSON
                    format includes Roku-specific metadata.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span>Kodi</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Go to Settings → TV → General → Electronic Program Guide →
                    XMLTV URL and enter your URL. Use the Kodi format for
                    enhanced metadata.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span>JioTV</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use the JioTV format for Indian content with language
                    support and regional features.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <Tv className="h-4 w-4" />
                    <span>Tata Play</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use the Tata Play format for Tata Play (formerly Tata Sky)
                    with regional content support.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span>Plex DVR</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use the Plex format in your DVR settings to import program
                    guide data with Plex-specific metadata.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Universal IPTV Players</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use the XMLTV format for most IPTV players. The M3U format
                    provides playlist with channel information.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    TiviMate & Perfect Player
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use the TiviMate or Perfect Player formats for enhanced
                    metadata and better compatibility.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>EPG Settings</CardTitle>
              <CardDescription>
                Configure your EPG generation preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoUpdate" defaultChecked />
                  <Label htmlFor="autoUpdate">
                    Auto-update EPG when schedules change
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="includeImages" defaultChecked />
                  <Label htmlFor="includeImages">
                    Include program images by default
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notifyDistributors" />
                  <Label htmlFor="notifyDistributors">
                    Notify distributors when EPG is updated
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
