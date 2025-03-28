import React, { useState } from 'react';
import { Box, Flex, Heading } from 'rebass';
import Pairs from './Components/Pairs';
import Price from './Components/Price';

const App: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<string | null>(null);
  
  return (
    <Box>
      <Box display="flex" justifyContent="center" alignItems="center" height="100px">
        <Heading color="white" mb={2}>Pair Price</Heading>
      </Box>
      <Flex >
        <Box p={4} width={1/2}>
        <Pairs onPairSelect={setSelectedPair} />
      </Box>
      <Box p={4} width={1/2}>
        {selectedPair && <Price pair={selectedPair} />}
      </Box>
    </Flex>
    </Box>
  )
};

export default App;
