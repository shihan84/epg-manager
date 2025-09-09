"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Download, 
  LogOut,
  ArrowLeft,
  FileText,
  Share2,
  Copy,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EpgData {
  xmlContent: string
  hostedUrl: string | null
  lastGenerated: string
  totalChannels: number
  totalPrograms: number
}

export default function EpgPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [epgData, setEpgData] = useState<EpgData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchEpgData()
    }
  }, [status, router])

  const fetchEpgData = async () => {
    try {
      const response = await fetch("/api/epg")
      if (response.ok) {
        const data = await response.json()
        setEpgData(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load EPG data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateEpg = async () => {
    setGenerating(true)
    try {
      const response = await fetch("/api/epg/generate", {
        method: "POST"
      })

      if (response.ok) {
        const data = await response.json()
        setEpgData(data)
        toast({
          title: "Success",
          description: "EPG generated successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to generate EPG",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while generating EPG",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const downloadEpg = () => {
    if (!epgData?.xmlContent) return

    const blob = new Blob([epgData.xmlContent], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `epg-${new Date().toISOString().split('T')[0]}.xml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "EPG file downloaded successfully",
    })
  }

  const copyHostedUrl = async () => {
    if (!epgData?.hostedUrl) return

    try {
      await navigator.clipboard.writeText(epgData.hostedUrl)
      toast({
        title: "Success",
        description: "Hosted URL copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
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
                <FileText className="h-8 w-8 text-indigo-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">EPG Export</h1>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">EPG Export</h2>
          <p className="text-gray-600">
            Generate and download your Electronic Program Guide in XMLTV format, or get a hosted URL for your distributors.
          </p>
        </div>

        {/* EPG Stats */}
        {epgData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{epgData.totalChannels}</div>
                <p className="text-xs text-muted-foreground">
                  Channels in EPG
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{epgData.totalPrograms}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled programs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Generated</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {new Date(epgData.lastGenerated).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(epgData.lastGenerated).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Generate EPG */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="h-5 w-5 mr-2" />
                Generate EPG
              </CardTitle>
              <CardDescription>
                Generate a new EPG file with your current channels and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={generateEpg} 
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate EPG
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Download EPG */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Download EPG
              </CardTitle>
              <CardDescription>
                Download your EPG as an XML file compatible with most TV systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={downloadEpg} 
                disabled={!epgData?.xmlContent}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download XML File
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hosted EPG */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Hosted EPG URL
            </CardTitle>
            <CardDescription>
              Share this URL with your distributors for automatic EPG updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {epgData?.hostedUrl ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <code className="text-sm font-mono flex-1 truncate">
                    {epgData.hostedUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyHostedUrl}
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="default">Active</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(epgData.hostedUrl!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open URL
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hosted EPG yet</h3>
                <p className="text-gray-600 mb-4">Generate your EPG first to get a hosted URL</p>
                <Button onClick={generateEpg} disabled={generating}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate EPG
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* EPG Preview */}
        {epgData?.xmlContent && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>EPG Preview</CardTitle>
              <CardDescription>
                Preview of your generated EPG XML content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                  {epgData.xmlContent.substring(0, 1000)}
                  {epgData.xmlContent.length > 1000 && '...'}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use Your EPG</CardTitle>
            <CardDescription>
              Learn how to integrate your EPG with different systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">For Direct Download:</h4>
                <p className="text-sm text-gray-600">
                  Download the XML file and upload it to your TV system or media server that supports XMLTV format.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">For Hosted URL:</h4>
                <p className="text-sm text-gray-600">
                  Share the hosted URL with your distributors or integrate it with systems that support remote EPG URLs.
                  The URL updates automatically when you generate new EPG data.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Supported Formats:</h4>
                <p className="text-sm text-gray-600">
                  Our EPG generator creates XMLTV format files compatible with most modern TV systems,
                  including Kodi, Plex, Emby, Jellyfin, and many commercial TV platforms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}