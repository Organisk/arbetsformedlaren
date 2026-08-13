import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4443;
export const API_BASE_URL = process.env.API_BASE_URL || 'https://jobsearch.api.jobtechdev.se';
export const DB_PATH = process.env.DB_PATH || './database/arbetsformedlaren.db';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export const SUPPORTED_CITIES = [
  'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås', 
  'Eskilstuna', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping'
];

export const DEFAULT_RADIUS_KM = 40;
