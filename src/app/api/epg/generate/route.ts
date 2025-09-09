import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's channels with their schedules
    const channels = await db.channel.findMany({
      where: { 
        userId, 
        isActive: true 
      },
      include: {
        schedules: {
          include: {
            program: true
          },
          orderBy: {
            startTime: 'asc'
          }
        },
        orderBy: {
          number: 'asc'
        }
      }
    })

    if (channels.length === 0) {
      return NextResponse.json({ error: "No channels found" }, { status: 400 })
    }

    // Generate XMLTV format
    const xmlContent = generateXmltv(channels)

    // Save to database
    const epgFile = await db.epgFile.create({
      data: {
        filename: `epg-${Date.now()}.xml`,
        content: xmlContent,
        userId
      }
    })

    // Get counts
    const totalPrograms = await db.schedule.count({
      where: {
        channel: {
          userId
        }
      }
    })

    return NextResponse.json({
      xmlContent,
      hostedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/epg/hosted/${userId}`,
      lastGenerated: epgFile.createdAt.toISOString(),
      totalChannels: channels.length,
      totalPrograms
    })

  } catch (error) {
    console.error("EPG Generate error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function generateXmltv(channels: any[]): string {
  const now = new Date()
  const xmlDate = now.toISOString().replace(/[:.]/g, '')

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE tv SYSTEM "xmltv.dtd">
<tv generator-info-name="EPG Manager" generator-info-url="https://epg-manager.vercel.app">
`

  // Add channels
  channels.forEach(channel => {
    xml += `  <channel id="${channel.name}">
    <display-name>${channel.displayName || channel.name}</display-name>
    ${channel.logoUrl ? `<icon src="${channel.logoUrl}" />` : ''}
    ${channel.number ? `<lcn>${channel.number}</lcn>` : ''}
  </channel>
`
  })

  // Add programs
  channels.forEach(channel => {
    channel.schedules.forEach((schedule: any) => {
      const start = new Date(schedule.startTime)
      const end = new Date(schedule.endTime)
      
      xml += `  <programme start="${formatXmltvDate(start)}" stop="${formatXmltvDate(end)}" channel="${channel.name}">
    <title lang="en">${escapeXml(schedule.program.title)}</title>
    ${schedule.program.description ? `<desc lang="en">${escapeXml(schedule.program.description)}</desc>` : ''}
    ${schedule.program.category ? `<category lang="en">${escapeXml(schedule.program.category)}</category>` : ''}
    ${schedule.isLive ? '<live />' : ''}
    ${schedule.isNew ? '<new />' : ''}
    ${schedule.program.imageUrl ? `<icon src="${schedule.program.imageUrl}" />` : ''}
  </programme>
`
    })
  })

  xml += `</tv>`

  return xml
}

function formatXmltvDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}${month}${day}${hours}${minutes}00 +0000`
}

function escapeXml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}