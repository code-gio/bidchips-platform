/**
 * API Error Codes
 */
export const API_ERRORS = {
  // Authentication
  AUTH_REQUIRED: "Authentication required",
  USER_NOT_FOUND: "User not found",
  ACCOUNT_INACTIVE: "Account is inactive",
  ACCOUNT_BANNED: "Account is banned",
  ADMIN_REQUIRED: "Admin access required",

  // Lots
  LOT_NOT_FOUND: "Lot not found",
  LOT_NOT_ACTIVE: "Lot is not active",
  AUCTION_ENDED: "Auction has ended",
  ALREADY_WINNING: "You are already the winning bidder",
  BID_TOO_LOW: "Bid amount is too low",
  BELOW_RESERVE: "Bid is below reserve price",
  LOT_ALREADY_SOLD: "Lot has already been sold",

  // Bids
  BID_INVALID: "Invalid bid",
  BID_AMOUNT_REQUIRED: "Bid amount is required",

  // Offers
  OFFER_NOT_FOUND: "Offer not found",
  OFFER_NOT_PENDING: "Offer is not pending",
  OFFER_ALREADY_EXISTS: "You already have a pending offer on this lot",
  OFFER_TOO_LOW: "Offer amount is below minimum",
  OFFERS_NOT_ALLOWED: "Offers are not allowed for this lot",

  // Watchlist
  WATCHLIST_ITEM_NOT_FOUND: "Watchlist item not found",
  ALREADY_IN_WATCHLIST: "Lot is already in your watchlist",

  // Notifications
  NOTIFICATION_NOT_FOUND: "Notification not found",

  // Sales Records
  SALE_NOT_FOUND: "Sale record not found",
  SALE_ALREADY_PAID: "Sale has already been paid",

  // Categories
  CATEGORY_NOT_FOUND: "Category not found",
  CATEGORY_IN_USE: "Category is in use and cannot be deleted",

  // Users
  USER_ALREADY_BANNED: "User is already banned",
  USER_NOT_BANNED: "User is not banned",

  // General
  INVALID_JSON: "Invalid JSON body",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_ERROR: "Internal server error",
  NOT_FOUND: "Resource not found",
} as const;

export type APIErrorCode = keyof typeof API_ERRORS;

