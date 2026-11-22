import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  price: z.number({ error: 'Enter a valid price' }).positive('Price must be greater than 0'),
  stock: z.number({ error: 'Enter a valid stock' }).int('Must be a whole number').min(0, 'Cannot be negative'),
  thumbnail: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;