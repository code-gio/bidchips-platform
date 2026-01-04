// ============================================
// Database Types
// ============================================

import type { User } from './user';
import type { Category } from './category';
import type { Lot } from './lot';
import type { Bid } from './bid';
import type { Offer } from './offer';
import type { WatchlistItem } from './watchlist';
import type { Notification } from './notification';
import type { SalesRecord } from './sales-record';
import type { SiteSettings } from './settings';
import type { ActivityLog } from './activity-log';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'auth_id'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
      lots: {
        Row: Lot;
        Insert: Omit<Lot, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Lot, 'id'>>;
      };
      bids: {
        Row: Bid;
        Insert: Omit<Bid, 'id' | 'created_at'>;
        Update: Partial<Omit<Bid, 'id' | 'lot_id' | 'user_id'>>;
      };
      offers: {
        Row: Offer;
        Insert: Omit<Offer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Offer, 'id'>>;
      };
      watchlist: {
        Row: WatchlistItem;
        Insert: Omit<WatchlistItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WatchlistItem, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id'>>;
      };
      sales_records: {
        Row: SalesRecord;
        Insert: Omit<SalesRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SalesRecord, 'id'>>;
      };
      settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: Partial<Omit<SiteSettings, 'id'>>;
      };
      activity_log: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}

