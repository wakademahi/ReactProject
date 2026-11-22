import api from './axios';
import type { Product, ProductInput, ProductsResponse } from '../types';

export interface Category {
  slug: string;
  name: string;
}

export const getCategories = async () =>
  (await api.get<Category[]>('/products/categories')).data;

export interface ProductQuery {
  limit: number;
  skip: number;
  search: string;
  category: string;
  sortBy: string;
  order: 'asc' | 'desc';
}

export const getProducts = async ({ limit, skip, search, category, sortBy, order }: ProductQuery) => {
  const q = search.trim();
  const sort = sortBy ? { sortBy, order } : {};

  // DummyJSON can't combine search and category, so search takes priority
  const url = q ? '/products/search' : category ? `/products/category/${category}` : '/products';
  const params = q ? { q, limit, skip, ...sort } : { limit, skip, ...sort };

  return (await api.get<ProductsResponse>(url, { params })).data;
};

export const getProduct = async (id: number) =>
  (await api.get<Product>(`/products/${id}`)).data;

export const createProduct = async (body: ProductInput) =>
  (await api.post<Product>('/products/add', body)).data;

export const updateProduct = async (id: number, body: Partial<ProductInput>) =>
  (await api.put<Product>(`/products/${id}`, body)).data;

export const deleteProduct = async (id: number) =>
  (await api.delete<Product>(`/products/${id}`)).data;