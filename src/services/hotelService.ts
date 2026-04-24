// src/services/hotelService.ts

import { Hotel, HotelListResponse } from '../types/hotel.types';

// ── Fake data ──────────────────────────────────────────────────────────────────
// Real API pe jaane pe sirf yahi replace hoga

const FAKE_HOTELS: Hotel[] = [
  {
    id:          'h_001',
    name:        'The Taj Palace',
    location:    'New Delhi, India',
    description: 'A luxurious hotel in the heart of New Delhi, offering world-class amenities and stunning views.',
    price:       8500,
    rating:      4.8,
    image:       'https://example.com/images/taj-palace.jpg',
  },
  {
    id:          'h_002',
    name:        'Leela Ambience',
    location:    'Gurugram, Haryana',
    description: 'Modern luxury hotel with contemporary design and exceptional service in Gurugram.',
    price:       6200,
    rating:      4.6,
    image:       'https://example.com/images/leela.jpg',
  },
  {
    id:          'h_003',
    name:        'ITC Mughal',
    location:    'Agra, Uttar Pradesh',
    description: 'Heritage hotel near the Taj Mahal, blending Mughal architecture with modern comforts.',
    price:       5800,
    rating:      4.7,
    image:       'https://example.com/images/itc-mughal.jpg',
  },
  {
    id:          'h_004',
    name:        'Rambagh Palace',
    location:    'Jaipur, Rajasthan',
    description: 'Former royal residence turned luxury hotel, offering regal experiences in Jaipur.',
    price:       12000,
    rating:      4.9,
    image:       'https://example.com/images/rambagh.jpg',
  },
  {
    id:          'h_005',
    name:        'Wildflower Hall',
    location:    'Shimla, Himachal Pradesh',
    description: 'Colonial-era hotel in Shimla, known for its British architecture and mountain views.',
    price:       9500,
    rating:      4.8,
    image:       'https://example.com/images/wildflower.jpg',
  },
  {
    id:          'h_006',
    name:        'Umaid Bhawan',
    location:    'Jodhpur, Rajasthan',
    description: 'Palatial hotel in Jodhpur, one of the largest private residences in the world.',
    price:       15000,
    rating:      5.0,
    image:       'https://example.com/images/umaid.jpg',
  },
];

// ── Fake network delay ────────────────────────────────────────────────────────

const FAKE_DELAY_MS = 1500;

// ── Custom error class ────────────────────────────────────────────────────────
// Gives hook richer info than a plain Error string

export class HotelServiceError extends Error {
  constructor(
    public message:    string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'HotelServiceError';
  }
}

// ── Service object ────────────────────────────────────────────────────────────
// Export as object so adding more functions later is clean:
// hotelService.getHotels(), hotelService.getHotelById(), etc.

export const hotelService = {

  getHotels: (): Promise<HotelListResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {

        // Simulate a random server error (10% of the time)
        // so you can test the error state in your UI
        const shouldFail = Math.random() < 0.1;

        if (shouldFail) {
          reject(
            new HotelServiceError(
              'Failed to fetch hotels. Please try again.',
              500,
            ),
          );
          return;
        }

        resolve({
          success: true,
          data:    FAKE_HOTELS,
        });

      }, FAKE_DELAY_MS);
    });
  },

};