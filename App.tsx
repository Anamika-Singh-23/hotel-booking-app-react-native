// App.tsx
import { enableScreens } from 'react-native-screens';
enableScreens();

import React             from 'react';
import { AuthProvider }  from './src/context/AuthProvider';
import { BookingProvider } from './src/context/BookingProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

const App: React.FC = () => (
  <AuthProvider>
    <BookingProvider>
      <RootNavigator />
    </BookingProvider>
  </AuthProvider>
);

export default App;