import { z } from "zod";

export const onboardingSchema = z.object({
  display_name: z.string().max(100).optional().default(""),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .transform((s) => s.toLowerCase().trim()),
  tagline: z.string().max(500).optional().default(""),
  bio: z.string().max(2000).optional().default(""),
  language: z.string().min(1, "Language is required"),
  time_zone: z.string().min(1, "Timezone is required"),
  country: z.string().min(1, "Country is required"),
  birth_date: z.string().min(1, "Birth date is required"),
  avatar_url: z.string().max(500).optional().default(""),
});

export type OnboardingSchema = typeof onboardingSchema;
