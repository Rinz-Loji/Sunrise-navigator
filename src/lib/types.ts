export type WeatherData = {
  temperature: number;
  condition: string;
  location: string;
};

export type TrafficData = {
  commuteTime: number;
  delay: number;
  destination: string;
  suggestion?: string;
};

export type CalendarEvent = {
  title: string;
  time: string;
};

export type NewsHeadline = {
  id: string;
  title: string;
  source: string;
};

export type MotivationalQuote = {
  quote: string;
  author: string;
};

export type BriefingData = {
  weather: WeatherData;
  traffic: TrafficData;
  calendar: CalendarEvent;
  news: NewsHeadline[];
};

export type AlarmSettings = {
  time: string;
  home: string;
  destination: string;
  alarmSound: string;
  weatherLocation: string;
  weatherApiKey: string;
};
