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
  Copy,
  PlayCircle,
  Search,
  Globe,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  COMMON_LANGUAGES,
  getLanguageByCode,
  translateCategory,
} from '@/lib/languages';

interface Program {
  id: string;
  title: string;
  description?: string;
  category?: string;
  duration?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  language?: string;
  region?: string;
  isSeries: boolean;
  seriesId?: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  'News',
  'Sports',
  'Movies',
  'Entertainment',
  'Documentary',
  'Kids',
  'Music',
  'Educational',
  'Reality',
  'Drama',
  'Comedy',
  'Action',
  'Thriller',
  'Romance',
  'Sci-Fi',
  'Horror',
  'Animation',
  'Other',
];

export default function ProgramManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    imageUrl: '',
    thumbnailUrl: '',
    language: 'en',
    region: 'IN',
    isSeries: false,
    seriesId: '',
  });

  useEffect(() => {
    fetchPrograms().catch(error => {
      console.error('Failed to fetch programs:', error);
    });
  }, []);

  const fetchPrograms = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'all')
        params.append('category', selectedCategory);

      const response = await fetch(`/api/programs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch programs',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch programs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms().catch(error => {
      console.error('Failed to fetch programs:', error);
    });
  }, [searchTerm, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingProgram
        ? `/api/programs/${editingProgram.id}`
        : '/api/programs';
      const method = editingProgram ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : null,
          isSeries: formData.isSeries,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (editingProgram) {
          setPrograms(
            programs.map(p => (p.id === editingProgram.id ? data : p))
          );
          toast({
            title: 'Success',
            description: 'Program updated successfully',
          });
        } else {
          setPrograms([data, ...programs]);
          toast({
            title: 'Success',
            description: 'Program created successfully',
          });
        }

        setIsDialogOpen(false);
        setEditingProgram(null);
        setFormData({
          title: '',
          description: '',
          category: '',
          duration: '',
          imageUrl: '',
          thumbnailUrl: '',
          language: 'en',
          region: 'IN',
          isSeries: false,
          seriesId: '',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to save program',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save program:', error);
      toast({
        title: 'Error',
        description: 'Failed to save program',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description || '',
      category: program.category || '',
      duration: program.duration?.toString() || '',
      imageUrl: program.imageUrl || '',
      thumbnailUrl: program.thumbnailUrl || '',
      language: program.language || 'en',
      region: program.region || 'IN',
      isSeries: program.isSeries,
      seriesId: program.seriesId || '',
    });
    setIsDialogOpen(true);
  };

  const handleCopy = async (program: Program) => {
    const newTitle = prompt(
      'Enter new title for the copy:',
      `${program.title} (Copy)`
    );
    if (!newTitle) return;

    try {
      const response = await fetch(`/api/programs/${program.id}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrograms([data, ...programs]);
        toast({
          title: 'Success',
          description: 'Program copied successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to copy program',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to copy program:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy program',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPrograms(programs.filter(p => p.id !== programId));
        toast({
          title: 'Success',
          description: 'Program deleted successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete program',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to delete program:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete program',
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = () => {
    setEditingProgram(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      duration: '',
      imageUrl: '',
      thumbnailUrl: '',
      language: 'en',
      region: 'IN',
      isSeries: false,
      seriesId: '',
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
          <h2 className="text-2xl font-bold">Programs</h2>
          <p className="text-gray-600">Manage your TV programs and content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingProgram ? 'Edit Program' : 'Create Program'}
              </DialogTitle>
              <DialogDescription>
                {editingProgram
                  ? 'Update program information'
                  : 'Add a new program to your library'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Program title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Program description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center justify-between w-full">
                            <span>{category}</span>
                            {formData.language &&
                              formData.language !== 'en' && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (
                                  {translateCategory(
                                    category,
                                    formData.language
                                  )}
                                  )
                                </span>
                              )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={e =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <Label htmlFor="imageUrl">Program Image</Label>
                <div className="flex space-x-2">
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={e =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
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
                {formData.imageUrl && (
                  <div className="mt-2 flex items-center space-x-2">
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    <img
                      src={formData.imageUrl}
                      alt="Program image preview"
                      className="h-12 w-16 object-cover border rounded"
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-gray-500">Image Preview</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={e =>
                    setFormData({ ...formData, thumbnailUrl: e.target.value })
                  }
                  placeholder="https://example.com/thumbnail.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Smaller image for EPG display (recommended: 200x300px)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isSeries"
                  checked={formData.isSeries}
                  onChange={e =>
                    setFormData({ ...formData, isSeries: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="isSeries">This is a series</Label>
              </div>

              {formData.isSeries && (
                <div>
                  <Label htmlFor="seriesId">Series ID</Label>
                  <Input
                    id="seriesId"
                    value={formData.seriesId}
                    onChange={e =>
                      setFormData({ ...formData, seriesId: e.target.value })
                    }
                    placeholder="series-001"
                  />
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProgram ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search programs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programs.map(program => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {program.thumbnailUrl || program.imageUrl ? (
                    <img
                      src={program.thumbnailUrl || program.imageUrl}
                      alt={`${program.title} thumbnail`}
                      className="h-8 w-8 object-cover rounded"
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove(
                          'hidden'
                        );
                      }}
                    />
                  ) : null}
                  <PlayCircle
                    className={`h-5 w-5 text-green-600 ${program.thumbnailUrl || program.imageUrl ? 'hidden' : ''}`}
                  />
                  <CardTitle className="text-lg">{program.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {program.language && (
                    <Badge variant="outline" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      {getLanguageByCode(program.language)?.nativeName ||
                        program.language}
                    </Badge>
                  )}
                  {program.isSeries && (
                    <Badge variant="secondary">Series</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                {program.category && (
                  <Badge variant="outline">
                    {program.language && program.language !== 'en'
                      ? `${program.category} (${translateCategory(program.category, program.language)})`
                      : program.category}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {program.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {program.description}
                </p>
              )}
              <div className="space-y-2 text-sm">
                {program.duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span>{program.duration} min</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span>
                    {new Date(program.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(program)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(program)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(program.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No programs yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first program
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
