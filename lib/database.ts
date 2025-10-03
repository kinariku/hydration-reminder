import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { IntakeLog, Settings, UserProfile } from '../types';

// Web版ではSQLiteを使用しない
const isWeb = Platform.OS === 'web';
const db = isWeb ? null : SQLite.openDatabaseSync('hydration.db');

export const initDatabase = () => {
  if (isWeb) {
    console.log('Web platform detected - skipping SQLite initialization');
    return;
  }

  // UserProfile table
  db?.execSync(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      weight_kg REAL NOT NULL,
      sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'other')),
      height_cm REAL,
      activity_level TEXT NOT NULL CHECK (activity_level IN ('low', 'medium', 'high')),
      wake_time TEXT NOT NULL,
      sleep_time TEXT NOT NULL,
      timezone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // DailyGoals table
  db?.execSync(`
    CREATE TABLE IF NOT EXISTS daily_goals (
      date TEXT PRIMARY KEY,
      target_ml INTEGER NOT NULL,
      algorithm TEXT NOT NULL CHECK (algorithm IN ('v1', 'manual')),
      manual_override BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // IntakeLogs table
  db?.execSync(`
    CREATE TABLE IF NOT EXISTS intake_logs (
      id TEXT PRIMARY KEY,
      date_time TEXT NOT NULL,
      amount_ml INTEGER NOT NULL,
      source TEXT NOT NULL CHECK (source IN ('quick', 'custom')),
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Settings table
  db?.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      settings_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ReminderPlans table
  db?.execSync(`
    CREATE TABLE IF NOT EXISTS reminder_plans (
      date TEXT PRIMARY KEY,
      times TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const saveUserProfile = (profile: UserProfile) => {
  if (isWeb) {
    console.log('Web platform - saving profile to AsyncStorage via Zustand');
    return;
  }
  
  db?.runSync(`
    INSERT OR REPLACE INTO user_profiles 
    (id, weight_kg, sex, height_cm, activity_level, wake_time, sleep_time, timezone, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    profile.id,
    profile.weightKg,
    profile.sex,
    profile.heightCm || null,
    profile.activityLevel,
    profile.wakeTime,
    profile.sleepTime,
    profile.timezone,
  ]);
};

export const getUserProfile = (): UserProfile | null => {
  if (isWeb) {
    console.log('Web platform - getting profile from AsyncStorage via Zustand');
    return null;
  }
  
  const result = db?.getFirstSync(`
    SELECT * FROM user_profiles 
    ORDER BY updated_at DESC 
    LIMIT 1
  `);
  
  if (!result) return null;
  
  return {
    id: result.id,
    weightKg: result.weight_kg,
    sex: result.sex,
    heightCm: result.height_cm,
    activityLevel: result.activity_level,
    wakeTime: result.wake_time,
    sleepTime: result.sleep_time,
    timezone: result.timezone,
  };
};

export const saveIntakeLog = (log: IntakeLog) => {
  if (isWeb) {
    console.log('Web platform - saving intake log to AsyncStorage via Zustand');
    return;
  }
  
  db?.runSync(`
    INSERT INTO intake_logs (id, date_time, amount_ml, source, note)
    VALUES (?, ?, ?, ?, ?)
  `, [log.id, log.dateTime, log.amountMl, log.source, log.note || null]);
};

export const getIntakeLogs = (date: string): IntakeLog[] => {
  if (isWeb) {
    console.log('Web platform - getting intake logs from AsyncStorage via Zustand');
    return [];
  }
  
  const results = db?.getAllSync(`
    SELECT * FROM intake_logs 
    WHERE date(date_time) = date(?)
    ORDER BY date_time ASC
  `, [date]) || [];
  
  return results.map((row: any) => ({
    id: row.id,
    dateTime: row.date_time,
    amountMl: row.amount_ml,
    source: row.source,
    note: row.note,
  }));
};

export const deleteIntakeLog = (id: string) => {
  if (isWeb) {
    console.log('Web platform - deleting intake log from AsyncStorage via Zustand');
    return;
  }
  
  db?.runSync(`DELETE FROM intake_logs WHERE id = ?`, [id]);
};

export const getAllIntakeLogs = (): IntakeLog[] => {
  if (isWeb) {
    console.log('Web platform - getting all intake logs from AsyncStorage via Zustand');
    return [];
  }
  
  const results = db?.getAllSync(`
    SELECT * FROM intake_logs 
    ORDER BY date_time DESC
  `) || [];
  
  return results.map((row: any) => ({
    id: row.id,
    dateTime: row.date_time,
    amountMl: row.amount_ml,
    source: row.source,
    note: row.note,
  }));
};

export const saveSettings = (settings: Settings) => {
  if (isWeb) {
    console.log('Web platform detected - skipping saveSettings');
    return;
  }

  try {
    const settingsJson = JSON.stringify(settings);
    
    db?.runSync(`
      INSERT OR REPLACE INTO settings (id, settings_data, updated_at)
      VALUES ('default', ?, CURRENT_TIMESTAMP)
    `, [settingsJson]);
    
    console.log('Settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const getSettings = (): Settings | null => {
  if (isWeb) {
    console.log('Web platform detected - returning null for getSettings');
    return null;
  }

  try {
    const result = db?.getFirstSync(`
      SELECT settings_data FROM settings WHERE id = 'default'
    `) as { settings_data: string } | undefined;
    
    if (result) {
      return JSON.parse(result.settings_data) as Settings;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};
