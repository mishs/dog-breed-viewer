import type { Favourite } from '../types';

const API_BASE = '/api';

export class FavouritesApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'FavouritesApiError';
    this.status = status;
  }
}

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    throw new FavouritesApiError('Network error');
  }
}

export async function fetchFavourites(): Promise<Favourite[]> {
  const response = await apiRequest('/favourites');

  if (!response.ok) {
    throw new FavouritesApiError(
      'Failed to fetch favourites',
      response.status
    );
  }

  return response.json();
}

export async function addFavourite(
  imageUrl: string,
  breed: string
): Promise<void> {
  const response = await apiRequest('/favourites', {
    method: 'POST',
    body: JSON.stringify({ imageUrl, breed }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new FavouritesApiError(
      error.error || 'Failed to add favourite',
      response.status
    );
  }
}

export async function removeFavourite(imageUrl: string): Promise<void> {
  const response = await apiRequest('/favourites', {
    method: 'DELETE',
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new FavouritesApiError(
      error.error || 'Failed to remove favourite',
      response.status
    );
  }
}