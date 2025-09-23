import { Channel, Program, Schedule } from '@prisma/client';

export interface EPGFormat {
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

export const EPG_FORMATS: EPGFormat[] = [
  {
    id: 'xmltv',
    name: 'XMLTV',
    description: 'Standard XMLTV format for IPTV players and Kodi',
    platform: 'Universal',
    extension: 'xml',
    mimeType: 'application/xml',
    features: ['Channels', 'Programs', 'Schedules', 'Images', 'Categories'],
    requirements: {
      channels: true,
      programs: true,
      schedules: true,
      images: true,
      categories: true,
      descriptions: true,
    },
  },
  {
    id: 'roku',
    name: 'Roku Channel Store',
    description: 'Roku-specific EPG format for Roku devices',
    platform: 'Roku',
    extension: 'json',
    mimeType: 'application/json',
    features: [
      'Channels',
      'Programs',
      'Schedules',
      'Images',
      'Categories',
      'Roku Metadata',
    ],
    requirements: {
      channels: true,
      programs: true,
      schedules: true,
      images: true,
      categories: true,
      descriptions: true,
    },
  },
  {
    id: 'kodi',
    name: 'Kodi PVR',
    description: 'Kodi PVR addon format with enhanced metadata',
    platform: 'Kodi',
    extension: 'xml',
    mimeType: 'application/xml',
    features: [
      'Channels',
      'Programs',
      'Schedules',
      'Images',
      'Categories',
      'Kodi Metadata',
    ],
    requirements: {
      channels: true,
      programs: true,
      schedules: true,
      images: true,
      categories: true,
      descriptions: true,
    },
  },
  {
    id: 'jiotv',
    name: 'JioTV',
    description: 'JioTV app format for Indian content',
    platform: 'JioTV',
    extension: 'json',
    mimeType: 'application/json',
    features: [
      'Channels',
      'Programs',
      'Schedules',
      'Images',
      'Categories',
      'Language Support',
    ],
    requirements: {
      channels: true,
      programs: true,
      schedules: true,
      images: true,
      categories: true,
      descriptions: true,
    },
  },
  {
    id: 'tataplay',
    name: 'Tata Play',
    description: 'Tata Play (formerly Tata Sky) format',
    platform: 'Tata Play',
    extension: 'json',
    mimeType: 'application/json',
    features: [
      'Channels',
      'Programs',
      'Schedules',
      'Images',
      'Categories',
      'Regional Content',
    ],
    requirements: {
      channels: true,
      programs: true,
      schedules: true,
      images: true,
      categories: true,
      descriptions: true,
    },
  },
  {
    id: 'plex',
    name: 'Plex DVR',
    description: 'Plex Media Server DVR format',
    platform: 'Plex',
    extension: 'xml',
    mimeType: 'application/xml',
    features: [
      'Channels',
      'Programs',
      'Schedules',
      'Images',
      'Categories',
      'Plex Metadata',
    ],
    requirements: {
      channels: true,
      programs: true,
      schedules: true,
      images: true,
      categories: true,
      descriptions: true,
    },
  },
  {
    id: 'emby',
    name: 'Emby',
    description: 'Emby Media Server format',
    platform: 'Emby',
    extension: 'xml',
    mimeType: 'application/xml',
    features: [
      'Channels',
      'Programs',
      'Schedules',
      'Images',
      'Categories',
      'Emby Metadata',
    ],
    requirements: {
      channels: true,
      programs: true,
      schedules: true,
      images: true,
      categories: true,
      descriptions: true,
    },
  },
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    description: 'Jellyfin Media Server format',
    platform: 'Jellyfin',
    extension: 'xml',
    mimeType: 'application/xml',
    features: [
      'Channels',
      'Programs',
      'Schedules',
      'Images',
      'Categories',
      'Jellyfin Metadata',
    ],
    requirements: {
      channels: true,
      programs: true,
      schedules: true,
      images: true,
      categories: true,
      descriptions: true,
    },
  },
  {
    id: 'm3u',
    name: 'M3U Playlist',
    description: 'M3U playlist format with EPG data',
    platform: 'Universal',
    extension: 'm3u',
    mimeType: 'application/vnd.apple.mpegurl',
    features: ['Channels', 'Programs', 'Schedules', 'Stream URLs'],
    requirements: {
      channels: true,
      programs: false,
      schedules: false,
      images: false,
      categories: false,
      descriptions: false,
    },
  },
  {
    id: 'iptv',
    name: 'IPTV Simple Client',
    description: 'IPTV Simple Client format for Kodi',
    platform: 'Kodi IPTV',
    extension: 'xml',
    mimeType: 'application/xml',
    features: ['Channels', 'Programs', 'Schedules', 'Images', 'Categories'],
    requirements: {
      channels: true,
      programs: true,
      schedules: true,
      images: true,
      categories: true,
      descriptions: true,
    },
  },
  {
    id: 'tivimate',
    name: 'TiviMate',
    description: 'TiviMate IPTV player format',
    platform: 'TiviMate',
    extension: 'xml',
    mimeType: 'application/xml',
    features: [
      'Channels',
      'Programs',
      'Schedules',
      'Images',
      'Categories',
      'TiviMate Metadata',
    ],
    requirements: {
      channels: true,
      programs: true,
      schedules: true,
      images: true,
      categories: true,
      descriptions: true,
    },
  },
  {
    id: 'perfectplayer',
    name: 'Perfect Player',
    description: 'Perfect Player IPTV format',
    platform: 'Perfect Player',
    extension: 'xml',
    mimeType: 'application/xml',
    features: ['Channels', 'Programs', 'Schedules', 'Images', 'Categories'],
    requirements: {
      channels: true,
      programs: true,
      schedules: true,
      images: true,
      categories: true,
      descriptions: true,
    },
  },
];

export class EPGFormatGenerator {
  static generateXMLTV(channels: Channel[], schedules: any[]): string {
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
      if (channel.logoUrl) {
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

      if (schedule.program.imageUrl) {
        xml += `    <icon src="${this.escapeXML(schedule.program.imageUrl)}" />\n`;
      }

      xml += `  </programme>\n`;
    }

    xml += '</tv>';
    return xml;
  }

  static generateRoku(channels: Channel[], schedules: any[]): string {
    const rokuData = {
      provider: 'EPG Manager Enterprise',
      version: '1.0',
      generated: new Date().toISOString(),
      channels: channels.map(channel => ({
        id: channel.id,
        name: channel.displayName || channel.name,
        description: channel.description,
        logo: channel.logoUrl,
        streamUrl: channel.streamUrl,
        number: channel.number,
        category: 'Live TV',
        programs: schedules
          .filter(s => s.channelId === channel.id)
          .map(schedule => ({
            id: schedule.id,
            title: schedule.program.title,
            description: schedule.program.description,
            category: schedule.program.category,
            startTime: schedule.startTime.toISOString(),
            endTime: schedule.endTime.toISOString(),
            duration: Math.round(
              (schedule.endTime - schedule.startTime) / 1000 / 60
            ), // minutes
            isLive: schedule.isLive,
            isNew: schedule.isNew,
            image: schedule.program.imageUrl,
            rating: 'TV-PG',
            year: new Date(schedule.startTime).getFullYear(),
          })),
      })),
    };

    return JSON.stringify(rokuData, null, 2);
  }

  static generateKodi(channels: Channel[], schedules: any[]): string {
    const now = new Date();
    const generator = 'EPG Manager Enterprise - Kodi PVR';

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<!DOCTYPE tv SYSTEM "xmltv.dtd">\n';
    xml += `<tv generator-info-name="${generator}" generator-info-url="https://epgmanager.com">\n`;

    // Add channels with Kodi-specific metadata
    for (const channel of channels) {
      xml += `  <channel id="${channel.id}">\n`;
      xml += `    <display-name>${this.escapeXML(channel.displayName || channel.name)}</display-name>\n`;
      if (channel.description) {
        xml += `    <desc>${this.escapeXML(channel.description)}</desc>\n`;
      }
      if (channel.logoUrl) {
        xml += `    <icon src="${this.escapeXML(channel.logoUrl)}" />\n`;
      }
      // Kodi-specific metadata
      xml += `    <url>${channel.streamUrl || ''}</url>\n`;
      xml += `    <number>${channel.number || 0}</number>\n`;
      xml += `  </channel>\n`;
    }

    // Add programs with Kodi-specific metadata
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

      if (schedule.program.imageUrl) {
        xml += `    <icon src="${this.escapeXML(schedule.program.imageUrl)}" />\n`;
      }

      // Kodi-specific metadata
      xml += `    <episode-num system="xmltv_ns">0.0.0.0</episode-num>\n`;
      xml += `    <rating system="MPAA">TV-PG</rating>\n`;

      xml += `  </programme>\n`;
    }

    xml += '</tv>';
    return xml;
  }

  static generateJioTV(channels: Channel[], schedules: any[]): string {
    const jioData = {
      provider: 'EPG Manager Enterprise',
      version: '1.0',
      generated: new Date().toISOString(),
      language: 'en',
      region: 'IN',
      channels: channels.map(channel => ({
        channelId: channel.id,
        channelName: channel.displayName || channel.name,
        channelDescription: channel.description,
        channelLogo: channel.logoUrl,
        streamUrl: channel.streamUrl,
        channelNumber: channel.number,
        language: 'English',
        category: 'Entertainment',
        isHD: channel.name.toLowerCase().includes('hd'),
        isLive: true,
        programs: schedules
          .filter(s => s.channelId === channel.id)
          .map(schedule => ({
            programId: schedule.id,
            programName: schedule.program.title,
            programDescription: schedule.program.description,
            programCategory: schedule.program.category,
            startTime: schedule.startTime.toISOString(),
            endTime: schedule.endTime.toISOString(),
            duration: Math.round(
              (schedule.endTime - schedule.startTime) / 1000 / 60
            ),
            isLive: schedule.isLive,
            isNew: schedule.isNew,
            programImage: schedule.program.imageUrl,
            rating: 'U',
            language: 'English',
            genre: schedule.program.category || 'General',
          })),
      })),
    };

    return JSON.stringify(jioData, null, 2);
  }

  static generateTataPlay(channels: Channel[], schedules: any[]): string {
    const tataData = {
      provider: 'EPG Manager Enterprise',
      version: '1.0',
      generated: new Date().toISOString(),
      platform: 'Tata Play',
      region: 'IN',
      channels: channels.map(channel => ({
        channelId: channel.id,
        channelName: channel.displayName || channel.name,
        channelDescription: channel.description,
        channelLogo: channel.logoUrl,
        streamUrl: channel.streamUrl,
        channelNumber: channel.number,
        language: 'English',
        category: 'Entertainment',
        isHD: channel.name.toLowerCase().includes('hd'),
        isRegional: channel.name.toLowerCase().includes('regional'),
        programs: schedules
          .filter(s => s.channelId === channel.id)
          .map(schedule => ({
            programId: schedule.id,
            programName: schedule.program.title,
            programDescription: schedule.program.description,
            programCategory: schedule.program.category,
            startTime: schedule.startTime.toISOString(),
            endTime: schedule.endTime.toISOString(),
            duration: Math.round(
              (schedule.endTime - schedule.startTime) / 1000 / 60
            ),
            isLive: schedule.isLive,
            isNew: schedule.isNew,
            programImage: schedule.program.imageUrl,
            rating: 'U',
            language: 'English',
            genre: schedule.program.category || 'General',
            isRegional: schedule.program.title
              .toLowerCase()
              .includes('regional'),
          })),
      })),
    };

    return JSON.stringify(tataData, null, 2);
  }

  static generatePlex(channels: Channel[], schedules: any[]): string {
    const now = new Date();
    const generator = 'EPG Manager Enterprise - Plex DVR';

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<!DOCTYPE tv SYSTEM "xmltv.dtd">\n';
    xml += `<tv generator-info-name="${generator}" generator-info-url="https://epgmanager.com">\n`;

    // Add channels with Plex-specific metadata
    for (const channel of channels) {
      xml += `  <channel id="${channel.id}">\n`;
      xml += `    <display-name>${this.escapeXML(channel.displayName || channel.name)}</display-name>\n`;
      if (channel.description) {
        xml += `    <desc>${this.escapeXML(channel.description)}</desc>\n`;
      }
      if (channel.logoUrl) {
        xml += `    <icon src="${this.escapeXML(channel.logoUrl)}" />\n`;
      }
      // Plex-specific metadata
      xml += `    <url>${channel.streamUrl || ''}</url>\n`;
      xml += `  </channel>\n`;
    }

    // Add programs with Plex-specific metadata
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

      if (schedule.program.imageUrl) {
        xml += `    <icon src="${this.escapeXML(schedule.program.imageUrl)}" />\n`;
      }

      // Plex-specific metadata
      xml += `    <episode-num system="xmltv_ns">0.0.0.0</episode-num>\n`;
      xml += `    <rating system="MPAA">TV-PG</rating>\n`;

      xml += `  </programme>\n`;
    }

    xml += '</tv>';
    return xml;
  }

  static generateM3U(channels: Channel[]): string {
    let m3u = '#EXTM3U\n';
    m3u +=
      '#EXTINF:-1 tvg-id="" tvg-name="EPG Manager" tvg-logo="" group-title="EPG Manager",EPG Manager Enterprise\n';

    for (const channel of channels) {
      m3u += `#EXTINF:-1 tvg-id="${channel.id}" tvg-name="${channel.displayName || channel.name}" tvg-logo="${channel.logoUrl || ''}" group-title="Live TV",${channel.displayName || channel.name}\n`;
      m3u += `${channel.streamUrl || 'http://example.com/stream'}\n`;
    }

    return m3u;
  }

  static generateTiviMate(channels: Channel[], schedules: any[]): string {
    const now = new Date();
    const generator = 'EPG Manager Enterprise - TiviMate';

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<!DOCTYPE tv SYSTEM "xmltv.dtd">\n';
    xml += `<tv generator-info-name="${generator}" generator-info-url="https://epgmanager.com">\n`;

    // Add channels with TiviMate-specific metadata
    for (const channel of channels) {
      xml += `  <channel id="${channel.id}">\n`;
      xml += `    <display-name>${this.escapeXML(channel.displayName || channel.name)}</display-name>\n`;
      if (channel.description) {
        xml += `    <desc>${this.escapeXML(channel.description)}</desc>\n`;
      }
      if (channel.logoUrl) {
        xml += `    <icon src="${this.escapeXML(channel.logoUrl)}" />\n`;
      }
      // TiviMate-specific metadata
      xml += `    <url>${channel.streamUrl || ''}</url>\n`;
      xml += `    <number>${channel.number || 0}</number>\n`;
      xml += `  </channel>\n`;
    }

    // Add programs with TiviMate-specific metadata
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

      if (schedule.program.imageUrl) {
        xml += `    <icon src="${this.escapeXML(schedule.program.imageUrl)}" />\n`;
      }

      // TiviMate-specific metadata
      xml += `    <episode-num system="xmltv_ns">0.0.0.0</episode-num>\n`;
      xml += `    <rating system="MPAA">TV-PG</rating>\n`;

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
}
