import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  line1: z.string().min(4, "Address line is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().min(7, "Phone is required"),
  countryCode: z.enum(["SA", "AE", "MA", "EG", "KW"]),
  shippingMethod: z.enum(["standard", "express"]),
});

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const productSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  priceUsd: z.coerce.number().positive(),
  inventory: z.coerce.number().int().nonnegative(),
  categoryId: z.string().min(1),
});

export type AddressInput = z.infer<typeof addressSchema>;
