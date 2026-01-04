// src/lib/config/nav.ts

import type { NavItem, SocialLink } from "$lib/types/nav";
import {
  IconLifebuoy,
  IconSend,
  IconDashboard,
  IconUser,
  IconUsers,
  IconFileText,
  IconAdjustments,
  IconChartBar,
  IconGavel,
  IconHammer,
  IconHeart,
  IconReceipt,
  IconBell,
  IconSettings,
  IconActivity,
  IconCategory,
  IconClockHour4,
  IconMoneybag,
  IconInfoCircle,
  IconPhone,
  IconTrophy,
  IconList,
  IconClock,
} from "@tabler/icons-svelte";

export const siteConfig = {
  title: "BidChips Auction",
  description: "Electronic Components Auction Platform",
  logo: "/logo.svg",
  logoDark: "/logo-white.svg",
  favicon: "/favicon.png",
};

export const socialLinks: SocialLink[] = [
  {
    title: "Twitter",
    url: "https://twitter.com/bidchips",
    icon: "twitter",
  },
  {
    title: "LinkedIn",
    url: "https://linkedin.com/company/bidchips",
    icon: "linkedin",
  },
];

// Public Navigation (Non-authenticated users)
export const navPublic: NavItem[] = [
  {
    title: "Browse Auctions",
    url: "/browse",
    icon: IconGavel,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: IconCategory,
  },
  {
    title: "Ending Soon",
    url: "/ending-soon",
    icon: IconClockHour4,
  },
  {
    title: "How It Works",
    url: "/how-it-works",
    icon: IconInfoCircle,
  },
  {
    title: "Contact",
    url: "/contact",
    icon: IconPhone,
  },
];

// Main Navigation - User features
export const navMain: NavItem[] = [
  {
    title: "Dashboard",
    url: "/account",
    icon: IconDashboard,
  },
  {
    title: "My Bids",
    url: "/account/bids",
    icon: IconGavel,
    items: [
      {
        title: "Active Bids",
        url: "/account/bids/active",
      },
      {
        title: "Won Auctions",
        url: "/account/bids/won",
      },
      {
        title: "Lost Auctions",
        url: "/account/bids/lost",
      },
      {
        title: "Bid History",
        url: "/account/bids/history",
      },
    ],
  },
  {
    title: "Watchlist",
    url: "/account/watchlist",
    icon: IconHeart,
  },
  {
    title: "My Offers",
    url: "/account/offers",
    icon: IconMoneybag,
    items: [
      {
        title: "Pending Offers",
        url: "/account/offers/pending",
      },
      {
        title: "Accepted Offers",
        url: "/account/offers/accepted",
      },
      {
        title: "Rejected Offers",
        url: "/account/offers/rejected",
      },
    ],
  },
  {
    title: "Won Lots",
    url: "/account/won",
    icon: IconTrophy,
  },
  {
    title: "Notifications",
    url: "/account/notifications",
    icon: IconBell,
  },
  {
    title: "Settings",
    url: "/account/settings",
    icon: IconSettings,
  },
];

// Admin Navigation
export const navAdmin: NavItem[] = [
  {
    title: "Admin Dashboard",
    url: "/admin",
    icon: IconDashboard,
  },
  {
    title: "Lots Management",
    url: "/admin/lots",
    icon: IconHammer,
    items: [
      {
        title: "All Lots",
        url: "/admin/lots",
      },
      {
        title: "Create New Lot",
        url: "/admin/lots/new",
      },
      {
        title: "Drafts",
        url: "/admin/lots/drafts",
      },
      {
        title: "Scheduled",
        url: "/admin/lots/scheduled",
      },
      {
        title: "Active Auctions",
        url: "/admin/lots/active",
      },
      {
        title: "Sold",
        url: "/admin/lots/sold",
      },
      {
        title: "Unsold",
        url: "/admin/lots/unsold",
      },
      {
        title: "Cancelled",
        url: "/admin/lots/cancelled",
      },
    ],
  },
  {
    title: "Bids & Offers",
    url: "/admin/bids",
    icon: IconGavel,
    items: [
      {
        title: "All Bids",
        url: "/admin/bids",
      },
      {
        title: "Pending Offers",
        url: "/admin/offers/pending",
      },
      {
        title: "Accepted Offers",
        url: "/admin/offers/accepted",
      },
      {
        title: "Rejected Offers",
        url: "/admin/offers/rejected",
      },
    ],
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: IconCategory,
    items: [
      {
        title: "All Categories",
        url: "/admin/categories",
      },
      {
        title: "Create Category",
        url: "/admin/categories/new",
      },
    ],
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: IconUsers,
    items: [
      {
        title: "All Users",
        url: "/admin/users",
      },
      {
        title: "Active Bidders",
        url: "/admin/users/bidders",
      },
      {
        title: "Banned Users",
        url: "/admin/users/banned",
      },
    ],
  },
  {
    title: "Sales Records",
    url: "/admin/sales",
    icon: IconReceipt,
    items: [
      {
        title: "All Sales",
        url: "/admin/sales",
      },
      {
        title: "Pending Collection",
        url: "/admin/sales/pending",
      },
      {
        title: "Paid & Collected",
        url: "/admin/sales/completed",
      },
      {
        title: "Pending Shipment",
        url: "/admin/sales/shipping",
      },
    ],
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: IconChartBar,
    items: [
      {
        title: "Dashboard Overview",
        url: "/admin/analytics/overview",
      },
      {
        title: "Sales Analytics",
        url: "/admin/analytics/sales",
      },
      {
        title: "User Analytics",
        url: "/admin/analytics/users",
      },
      {
        title: "Lot Performance",
        url: "/admin/analytics/lots",
      },
      {
        title: "Revenue Reports",
        url: "/admin/analytics/revenue",
      },
    ],
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: IconAdjustments,
    items: [
      {
        title: "General Settings",
        url: "/admin/settings/general",
      },
      {
        title: "Auction Settings",
        url: "/admin/settings/auction",
      },
      {
        title: "Email Notifications",
        url: "/admin/settings/email",
      },
      {
        title: "Branding & Logo",
        url: "/admin/settings/branding",
      },
      {
        title: "Terms & Policies",
        url: "/admin/settings/legal",
      },
    ],
  },
  {
    title: "Activity Log",
    url: "/admin/activity-log",
    icon: IconActivity,
  },
];

// Secondary Navigation (help/support links)
export const navSecondary: NavItem[] = [
  {
    title: "Help Center",
    url: "/help",
    icon: IconLifebuoy,
  },
  {
    title: "Documentation",
    url: "/docs",
    icon: IconFileText,
  },
  {
    title: "Contact Support",
    url: "/support",
    icon: IconSend,
  },
];

// User Account Menu (top-right dropdown)
export const userNav: NavItem[] = [
  {
    title: "My Account",
    icon: IconUser,
    url: "/account",
  },
  {
    title: "My Bids",
    icon: IconGavel,
    url: "/account/bids",
  },
  {
    title: "Watchlist",
    icon: IconHeart,
    url: "/account/watchlist",
  },
  {
    title: "Won Lots",
    icon: IconTrophy,
    url: "/account/won",
  },
  {
    title: "Settings",
    icon: IconSettings,
    url: "/account/settings",
  },
  {
    title: "Notifications",
    icon: IconBell,
    url: "/account/notifications",
  },
];