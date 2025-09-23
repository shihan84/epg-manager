export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | 'news'
    | 'entertainment'
    | 'sports'
    | 'movies'
    | 'kids'
    | 'music'
    | 'educational'
    | 'religious';
  pattern: 'daily' | 'weekly' | 'monthly';
  timeSlots: TimeSlot[];
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  dayOfMonth?: number; // 1-31 for monthly
  excludeWeekends?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  programTitle: string;
  programDescription?: string;
  programCategory?: string;
  isLive?: boolean;
  isNew?: boolean;
}

export const COMMON_SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  // News Templates
  {
    id: 'news-morning',
    name: 'Morning News Block',
    description: 'Standard morning news programming with hourly updates',
    category: 'news',
    pattern: 'daily',
    timeSlots: [
      {
        id: '1',
        startTime: '06:00',
        endTime: '07:00',
        programTitle: 'Morning Headlines',
        programCategory: 'News',
        isLive: true,
      },
      {
        id: '2',
        startTime: '07:00',
        endTime: '08:00',
        programTitle: 'Breakfast News',
        programCategory: 'News',
        isLive: true,
      },
      {
        id: '3',
        startTime: '08:00',
        endTime: '09:00',
        programTitle: 'Morning Update',
        programCategory: 'News',
        isLive: true,
      },
    ],
    excludeWeekends: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'news-evening',
    name: 'Evening News Block',
    description: 'Prime time evening news programming',
    category: 'news',
    pattern: 'daily',
    timeSlots: [
      {
        id: '1',
        startTime: '18:00',
        endTime: '19:00',
        programTitle: 'Evening News',
        programCategory: 'News',
        isLive: true,
      },
      {
        id: '2',
        startTime: '19:00',
        endTime: '20:00',
        programTitle: 'Prime Time News',
        programCategory: 'News',
        isLive: true,
      },
      {
        id: '3',
        startTime: '20:00',
        endTime: '21:00',
        programTitle: 'Nightly Report',
        programCategory: 'News',
        isLive: true,
      },
    ],
    excludeWeekends: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Entertainment Templates
  {
    id: 'entertainment-weekend',
    name: 'Weekend Entertainment',
    description: 'Weekend entertainment programming with movies and shows',
    category: 'entertainment',
    pattern: 'weekly',
    timeSlots: [
      {
        id: '1',
        startTime: '10:00',
        endTime: '12:00',
        programTitle: 'Weekend Movies',
        programCategory: 'Movies',
      },
      {
        id: '2',
        startTime: '14:00',
        endTime: '16:00',
        programTitle: 'Family Shows',
        programCategory: 'Entertainment',
      },
      {
        id: '3',
        startTime: '19:00',
        endTime: '21:00',
        programTitle: 'Prime Time Entertainment',
        programCategory: 'Entertainment',
      },
    ],
    daysOfWeek: [0, 6], // Saturday and Sunday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'entertainment-weekday',
    name: 'Weekday Entertainment',
    description: 'Weekday evening entertainment programming',
    category: 'entertainment',
    pattern: 'weekly',
    timeSlots: [
      {
        id: '1',
        startTime: '19:00',
        endTime: '20:00',
        programTitle: 'Evening Soap Opera',
        programCategory: 'Drama',
      },
      {
        id: '2',
        startTime: '20:00',
        endTime: '21:00',
        programTitle: 'Reality Show',
        programCategory: 'Reality',
      },
      {
        id: '3',
        startTime: '21:00',
        endTime: '22:00',
        programTitle: 'Comedy Show',
        programCategory: 'Comedy',
      },
    ],
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Sports Templates
  {
    id: 'sports-weekend',
    name: 'Weekend Sports',
    description: 'Weekend sports programming with live matches and highlights',
    category: 'sports',
    pattern: 'weekly',
    timeSlots: [
      {
        id: '1',
        startTime: '09:00',
        endTime: '11:00',
        programTitle: 'Sports Highlights',
        programCategory: 'Sports',
      },
      {
        id: '2',
        startTime: '14:00',
        endTime: '17:00',
        programTitle: 'Live Sports Match',
        programCategory: 'Sports',
        isLive: true,
      },
      {
        id: '3',
        startTime: '19:00',
        endTime: '21:00',
        programTitle: 'Sports Analysis',
        programCategory: 'Sports',
      },
    ],
    daysOfWeek: [0, 6], // Saturday and Sunday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Kids Templates
  {
    id: 'kids-afternoon',
    name: 'Kids Afternoon Block',
    description: 'Afternoon programming for children',
    category: 'kids',
    pattern: 'daily',
    timeSlots: [
      {
        id: '1',
        startTime: '15:00',
        endTime: '16:00',
        programTitle: 'Cartoon Time',
        programCategory: 'Animation',
      },
      {
        id: '2',
        startTime: '16:00',
        endTime: '17:00',
        programTitle: 'Educational Show',
        programCategory: 'Educational',
      },
      {
        id: '3',
        startTime: '17:00',
        endTime: '18:00',
        programTitle: 'Kids Games',
        programCategory: 'Kids',
      },
    ],
    excludeWeekends: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Music Templates
  {
    id: 'music-night',
    name: 'Night Music Block',
    description: 'Late night music programming',
    category: 'music',
    pattern: 'daily',
    timeSlots: [
      {
        id: '1',
        startTime: '22:00',
        endTime: '23:00',
        programTitle: 'Classical Music',
        programCategory: 'Music',
      },
      {
        id: '2',
        startTime: '23:00',
        endTime: '00:00',
        programTitle: 'Jazz Night',
        programCategory: 'Music',
      },
      {
        id: '3',
        startTime: '00:00',
        endTime: '01:00',
        programTitle: 'Rock Music',
        programCategory: 'Music',
      },
    ],
    excludeWeekends: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Religious Templates
  {
    id: 'religious-sunday',
    name: 'Sunday Religious Programming',
    description: 'Sunday religious and spiritual programming',
    category: 'religious',
    pattern: 'weekly',
    timeSlots: [
      {
        id: '1',
        startTime: '08:00',
        endTime: '09:00',
        programTitle: 'Morning Prayer',
        programCategory: 'Religious',
      },
      {
        id: '2',
        startTime: '10:00',
        endTime: '11:00',
        programTitle: 'Religious Service',
        programCategory: 'Religious',
        isLive: true,
      },
      {
        id: '3',
        startTime: '18:00',
        endTime: '19:00',
        programTitle: 'Evening Devotion',
        programCategory: 'Religious',
      },
    ],
    daysOfWeek: [0], // Sunday only
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Educational Templates
  {
    id: 'educational-weekday',
    name: 'Weekday Educational Block',
    description: 'Educational programming during weekdays',
    category: 'educational',
    pattern: 'weekly',
    timeSlots: [
      {
        id: '1',
        startTime: '10:00',
        endTime: '11:00',
        programTitle: 'Science Documentary',
        programCategory: 'Documentary',
      },
      {
        id: '2',
        startTime: '11:00',
        endTime: '12:00',
        programTitle: 'History Program',
        programCategory: 'Educational',
      },
      {
        id: '3',
        startTime: '12:00',
        endTime: '13:00',
        programTitle: 'Language Learning',
        programCategory: 'Educational',
      },
    ],
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Movies Templates
  {
    id: 'movies-weekend',
    name: 'Weekend Movie Marathon',
    description: 'Weekend movie programming with different genres',
    category: 'movies',
    pattern: 'weekly',
    timeSlots: [
      {
        id: '1',
        startTime: '14:00',
        endTime: '16:30',
        programTitle: 'Action Movie',
        programCategory: 'Action',
      },
      {
        id: '2',
        startTime: '16:30',
        endTime: '19:00',
        programTitle: 'Romance Movie',
        programCategory: 'Romance',
      },
      {
        id: '3',
        startTime: '19:00',
        endTime: '21:30',
        programTitle: 'Thriller Movie',
        programCategory: 'Thriller',
      },
    ],
    daysOfWeek: [0, 6], // Saturday and Sunday
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function getTemplateById(id: string): ScheduleTemplate | undefined {
  return COMMON_SCHEDULE_TEMPLATES.find(template => template.id === id);
}

export function getTemplatesByCategory(category: string): ScheduleTemplate[] {
  return COMMON_SCHEDULE_TEMPLATES.filter(
    template => template.category === category
  );
}

export function getTemplatesByPattern(pattern: string): ScheduleTemplate[] {
  return COMMON_SCHEDULE_TEMPLATES.filter(
    template => template.pattern === pattern
  );
}

export function createScheduleFromTemplate(
  template: ScheduleTemplate,
  channelId: string,
  startDate: Date,
  endDate: Date
): Array<{
  channelId: string;
  programTitle: string;
  programDescription?: string;
  programCategory?: string;
  startTime: Date;
  endTime: Date;
  isLive?: boolean;
  isNew?: boolean;
}> {
  const schedules: Array<{
    channelId: string;
    programTitle: string;
    programDescription?: string;
    programCategory?: string;
    startTime: Date;
    endTime: Date;
    isLive?: boolean;
    isNew?: boolean;
  }> = [];

  const dates = generateDatesFromTemplate(template, startDate, endDate);

  for (const date of dates) {
    for (const timeSlot of template.timeSlots) {
      const startTime = new Date(date);
      const [startHour, startMinute] = timeSlot.startTime
        .split(':')
        .map(Number);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(date);
      const [endHour, endMinute] = timeSlot.endTime.split(':').map(Number);
      endTime.setHours(endHour, endMinute, 0, 0);

      schedules.push({
        channelId,
        programTitle: timeSlot.programTitle,
        programDescription: timeSlot.programDescription,
        programCategory: timeSlot.programCategory,
        startTime,
        endTime,
        isLive: timeSlot.isLive,
        isNew: timeSlot.isNew,
      });
    }
  }

  return schedules;
}

function generateDatesFromTemplate(
  template: ScheduleTemplate,
  startDate: Date,
  endDate: Date
): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    let shouldInclude = false;

    if (template.pattern === 'daily') {
      shouldInclude = true;
      if (template.excludeWeekends) {
        const dayOfWeek = current.getDay();
        shouldInclude = dayOfWeek !== 0 && dayOfWeek !== 6; // Not Sunday or Saturday
      }
    } else if (template.pattern === 'weekly' && template.daysOfWeek) {
      const dayOfWeek = current.getDay();
      shouldInclude = template.daysOfWeek.includes(dayOfWeek);
    } else if (template.pattern === 'monthly' && template.dayOfMonth) {
      shouldInclude = current.getDate() === template.dayOfMonth;
    }

    if (shouldInclude) {
      dates.push(new Date(current));
    }

    current.setDate(current.getDate() + 1);
  }

  return dates;
}
