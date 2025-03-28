import React from 'react';
import { Box, Button, Flex, Heading, Text } from 'rebass';


const PAIRS = {
  'TON/USDT': 'ton-usdt',
};

const Pairs: React.FC<{ onPairSelect: (pair: string) => void }> = ({ onPairSelect }) => {
  return (
    <Box p={4} maxWidth="800px" mx="auto">
      <Heading color="white" mb={2}>Available pairs</Heading>
      {Object.keys(PAIRS).map((pair) => (
        <Flex key={pair} mb={2} justifyContent="space-between" alignItems="center">
          <Text key={pair}>{pair}</Text>
          <Button key={pair} bg="magenta" color="black" onClick={() => onPairSelect(PAIRS[pair as keyof typeof PAIRS])}>Get price</Button>
        </Flex>
      ))}
    </Box>
  );
};

export default Pairs;