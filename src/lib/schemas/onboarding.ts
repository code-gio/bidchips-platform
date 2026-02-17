import { z } from "zod";

export const onboardingSchema = z.object({
  display_name: z.string().max(100).optional().default(""),
  username: z
    .string()
    .transform((s) => (s ?? "").toLowerCase().trim())
    .pipe(
      z.string().min(4, "Username is required and must be at least 4 characters").max(30, "Username must be less than 30 characters"),
    ),
  country: z.string().min(1, "Country is required").default("us"),
  address_street: z.string().min(1, "Street address is required").max(255),
  address_city: z.string().min(1, "City is required").max(100),
  address_state: z.string().min(1, "State / Province is required").max(50),
  address_zip: z.string().min(1, "ZIP / Postal code is required").max(20),
  avatar_url: z.string().max(500).optional().default(""),
  avatar_crop_x: z.preprocess((v) => (v === "" || v === undefined ? null : Number(v)), z.number().nullable()).optional(),
  avatar_crop_y: z.preprocess((v) => (v === "" || v === undefined ? null : Number(v)), z.number().nullable()).optional(),
  avatar_crop_scale: z.preprocess((v) => (v === "" || v === undefined ? null : Number(v)), z.number().nullable()).optional(),
  avatar_crop_size: z.preprocess((v) => (v === "" || v === undefined ? null : Number(v)), z.number().nullable()).optional(),
  avatar_image_width: z.preprocess((v) => (v === "" || v === undefined ? null : Number(v)), z.number().nullable()).optional(),
  avatar_image_height: z.preprocess((v) => (v === "" || v === undefined ? null : Number(v)), z.number().nullable()).optional(),
});

export type OnboardingSchema = typeof onboardingSchema;
