import React, { useCallback, useEffect, useState } from 'react';
import { Box, Flex, Heading, Text } from 'rebass';
import axios from 'axios';

interface PriceData {
  pair: string;
  price: number;
  reversePrice: number;
}

const FETCH_PRICE_INTERVAL = 60000; // 1 minute

const Price: React.FC<{ pair: string }> = ({ pair }) => {
  const [price, setPrice] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<PriceData>(`http://localhost:5005/price/${pair}`);
      setPrice(response.data);
    } catch (err) {
      setError('Error fetching price');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pair]);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, FETCH_PRICE_INTERVAL); 
    return () => clearInterval(interval);
  }, [fetchPrice]);

  return (
    <Box p={4} maxWidth="800px" mx="auto">
      <Heading color="white" mb={2}>TON/USDT pair price</Heading>
      <Text color="gray" mb={4}>Last update: {new Date().toLocaleTimeString()}</Text>
      {loading ? (
        <Flex justifyContent="center" my={4}>
          <div className="spinner">loading...</div>
        </Flex>
      ) : error ? (
        <Text color="red" mb={4}>{error}</Text>
      ) : price ? (
        <Box>
          <Flex mb={2} alignItems="center">
            <Box width={1/2}>
              <Text>TON/USDT</Text>
            </Box>
            <Box width={1/2}>
              <Text>{price.price.toFixed(8)}</Text>
            </Box>
          </Flex>
          <Flex mb={2} alignItems="center">
            <Box width={1/2}>
              <Text>USDT/TON</Text>
            </Box>
            <Box width={1/2}>
              <Text>{price.reversePrice.toFixed(8)}</Text>
            </Box>
          </Flex>
        </Box>
      ) : null}
    </Box>
  );
};

export default Price;