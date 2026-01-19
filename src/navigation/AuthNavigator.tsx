import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen, LoginScreen } from '../screens';
import { SCREENS } from '../utils/constants';

export type AuthStackParamList = {
  [SCREENS.WELCOME]: undefined;
  [SCREENS.LOGIN]: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={SCREENS.WELCOME}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={SCREENS.WELCOME} component={WelcomeScreen} />
      <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
