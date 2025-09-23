import { db } from './db';
import { Channel, Program, Schedule } from '@prisma/client';
import { EPGFormatGenerator, EPG_FORMATS } from './epg-formats';

export interface EPGGenerationOptions {
  userId: string;
  channels?: string[];
  startDate?: Date;
  endDate?: Date;
  format?: string;
  includeImages?: boolean;
  platform?: string;
}

export class EPGGenerator {
  static async generateEPG(options: EPGGenerationOptions): Promise<string> {
    const {
      userId,
      channels,
      startDate,
      endDate,
      format = 'xmltv',
      includeImages = true,
      platform,
    } = options;

    // Get user's channels
    const userChannels = await db.channel.findMany({
      where: {
        userId,
        isActive: true,
        ...(channels && channels.length > 0 ? { id: { in: channels } } : {}),
      },
    });

    // Get schedules for the specified date range
    const schedules = await db.schedule.findMany({
      where: {
        channel: { userId },
        ...(channels && channels.length > 0
          ? { channelId: { in: channels } }
          : {}),
        ...(startDate && endDate
          ? {
              startTime: { gte: startDate },
              endTime: { lte: endDate },
            }
          : {}),
      },
      include: {
        channel: true,
        program: true,
      },
      orderBy: [{ channelId: 'asc' }, { startTime: 'asc' }],
    });

    // Generate content based on format
    let content: string;
    let filename: string;
    const timestamp = Date.now();

    switch (format) {
      case 'xmltv':
        content = EPGFormatGenerator.generateXMLTV(userChannels, schedules);
        filename = `epg_${userId}_${timestamp}.xml`;
        break;
      case 'roku':
        content = EPGFormatGenerator.generateRoku(userChannels, schedules);
        filename = `epg_${userId}_roku_${timestamp}.json`;
        break;
      case 'kodi':
        content = EPGFormatGenerator.generateKodi(userChannels, schedules);
        filename = `epg_${userId}_kodi_${timestamp}.xml`;
        break;
      case 'jiotv':
        content = EPGFormatGenerator.generateJioTV(userChannels, schedules);
        filename = `epg_${userId}_jiotv_${timestamp}.json`;
        break;
      case 'tataplay':
        content = EPGFormatGenerator.generateTataPlay(userChannels, schedules);
        filename = `epg_${userId}_tataplay_${timestamp}.json`;
        break;
      case 'plex':
        content = EPGFormatGenerator.generatePlex(userChannels, schedules);
        filename = `epg_${userId}_plex_${timestamp}.xml`;
        break;
      case 'm3u':
        content = EPGFormatGenerator.generateM3U(userChannels);
        filename = `epg_${userId}_playlist_${timestamp}.m3u`;
        break;
      case 'tivimate':
        content = EPGFormatGenerator.generateTiviMate(userChannels, schedules);
        filename = `epg_${userId}_tivimate_${timestamp}.xml`;
        break;
      default:
        content = EPGFormatGenerator.generateXMLTV(userChannels, schedules);
        filename = `epg_${userId}_${timestamp}.xml`;
    }

    // Save to database
    const epgFile = await db.epgFile.create({
      data: {
        filename,
        content,
        userId,
      },
    });

    return content;
  }

  static async generateXMLTV(options: EPGGenerationOptions): Promise<string> {
    return this.generateEPG({ ...options, format: 'xmltv' });
  }

  static async generateJSON(options: EPGGenerationOptions): Promise<any> {
    const { userId, channels, startDate, endDate } = options;

    // Get user's channels
    const userChannels = await db.channel.findMany({
      where: {
        userId,
        isActive: true,
        ...(channels && channels.length > 0 ? { id: { in: channels } } : {}),
      },
    });

    // Get schedules for the specified date range
    const schedules = await db.schedule.findMany({
      where: {
        channel: { userId },
        ...(channels && channels.length > 0
          ? { channelId: { in: channels } }
          : {}),
        ...(startDate && endDate
          ? {
              startTime: { gte: startDate },
              endTime: { lte: endDate },
            }
          : {}),
      },
      include: {
        channel: true,
        program: true,
      },
      orderBy: [{ channelId: 'asc' }, { startTime: 'asc' }],
    });

    // Generate JSON structure
    const jsonData = {
      generator: 'EPG Manager Enterprise',
      generated: new Date().toISOString(),
      channels: userChannels.map(channel => ({
        id: channel.id,
        name: channel.name,
        displayName: channel.displayName,
        description: channel.description,
        logoUrl: channel.logoUrl,
        streamUrl: channel.streamUrl,
        number: channel.number,
      })),
      programs: schedules.map(schedule => ({
        id: schedule.id,
        channelId: schedule.channelId,
        title: schedule.program.title,
        description: schedule.program.description,
        category: schedule.program.category,
        startTime: schedule.startTime.toISOString(),
        endTime: schedule.endTime.toISOString(),
        isLive: schedule.isLive,
        isNew: schedule.isNew,
        imageUrl: schedule.program.imageUrl,
      })),
    };

    // Save to database
    const epgFile = await db.epgFile.create({
      data: {
        filename: `epg_${userId}_${Date.now()}.json`,
        content: JSON.stringify(jsonData, null, 2),
        userId,
      },
    });

    return jsonData;
  }

  private static buildXMLTV(
    channels: Channel[],
    schedules: any[],
    includeImages: boolean
  ): string {
    const now = new Date();
    const generator = 'EPG Manager Enterprise';

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<!DOCTYPE tv SYSTEM "xmltv.dtd">\n';
    xml += `<tv generator-info-name="${generator}" generator-info-url="https://epgmanager.com">\n`;

    // Add channels
    for (const channel of channels) {
      xml += `  <channel id="${channel.id}">\n`;
      xml += `    <display-name>${this.escapeXML(channel.displayName || channel.name)}</display-name>\n`;
      if (channel.description) {
        xml += `    <desc>${this.escapeXML(channel.description)}</desc>\n`;
      }
      if (channel.logoUrl && includeImages) {
        xml += `    <icon src="${this.escapeXML(channel.logoUrl)}" />\n`;
      }
      xml += `  </channel>\n`;
    }

    // Add programs
    for (const schedule of schedules) {
      const start = this.formatXMLTVDate(schedule.startTime);
      const stop = this.formatXMLTVDate(schedule.endTime);

      xml += `  <programme start="${start}" stop="${stop}" channel="${schedule.channelId}">\n`;
      xml += `    <title>${this.escapeXML(schedule.program.title)}</title>\n`;

      if (schedule.program.description) {
        xml += `    <desc>${this.escapeXML(schedule.program.description)}</desc>\n`;
      }

      if (schedule.program.category) {
        xml += `    <category>${this.escapeXML(schedule.program.category)}</category>\n`;
      }

      if (schedule.isNew) {
        xml += `    <new />\n`;
      }

      if (schedule.isLive) {
        xml += `    <live />\n`;
      }

      if (schedule.program.imageUrl && includeImages) {
        xml += `    <icon src="${this.escapeXML(schedule.program.imageUrl)}" />\n`;
      }

      xml += `  </programme>\n`;
    }

    xml += '</tv>';
    return xml;
  }

  private static escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private static formatXMLTVDate(date: Date): string {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, ' +0000');
  }

  static async getHostedEPGUrl(userId: string): Promise<string> {
    // Generate a permanent URL for the user's EPG
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return `${baseUrl}/api/epg/hosted/${userId}`;
  }

  static async getLatestEPG(userId: string): Promise<string | null> {
    const latestEpg = await db.epgFile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return latestEpg?.content || null;
  }

  static async updateUserEPGUrl(userId: string): Promise<void> {
    const epgUrl = await this.getHostedEPGUrl(userId);

    await db.user.update({
      where: { id: userId },
      data: { epgUrl },
    });
  }
}
