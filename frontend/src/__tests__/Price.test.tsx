import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Price from '../Components/Price';

const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

jest.mock('axios', () => ({
  get: jest.fn()
}));

const axios = require('axios');

describe('Price Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display price after successful request', async () => {
    const mockPriceData = {
      pair: 'TON/USDT',
      price: 2.5,
      reversePrice: 0.4
    };
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockPriceData });

    render(<Price pair="TON/USDT" />);

    expect(screen.getByText('TON/USDT pair price')).toBeInTheDocument();

    expect(screen.getByText('loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('2.50000000')).toBeInTheDocument();
      expect(screen.getByText('0.40000000')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith('http://localhost:5005/price/TON/USDT');
  });

  it('should display error when request fails', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<Price pair="TON/USDT" />);

    await waitFor(() => {
      expect(screen.getByText('Error fetching price')).toBeInTheDocument();
    });
  });
}); 