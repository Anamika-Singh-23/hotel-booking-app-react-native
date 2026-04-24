// src/navigation/RootNavigator.tsx

import React                           from 'react';
import { View, ActivityIndicator,
         StyleSheet }                  from 'react-native';
import { NavigationContainer }         from '@react-navigation/native';
import { createNativeStackNavigator }  from '@react-navigation/native-stack';
import { useAuth }                     from '../context/AuthContext'; // ← sahi jagah
import { AuthNavigator }               from './AuthNavigator';
import { AppNavigator }                from './AppNavigator';
import { RootStackParamList }          from './types';

const Root = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  // Sirf read karta hai — state manage nahi karta
  const { isAuthenticated, loading } = useAuth();

  // Session check chal rahi hai — spinner dikhao
  // Yeh prevent karta hai "LoginScreen ka flash" already logged-in users ke liye
  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#F09030" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Root.Navigator
        screenOptions={{
          headerShown: false,
          animation:   'fade',
        }}
      >
        {isAuthenticated
          ? <Root.Screen name="App"  component={AppNavigator}  />
          : <Root.Screen name="Auth" component={AuthNavigator} />
        }
      </Root.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: '#F8F9FA',
  },
});