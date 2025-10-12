import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { LaunchScreen } from '../screens/LaunchScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { PasswordChangedScreen } from '../screens/PasswordChangedScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
  },
};

const AuthStack = () => (
  <Stack.Navigator initialRouteName="Launch" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Launch" component={LaunchScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <Stack.Screen name="PasswordChanged" component={PasswordChangedScreen} />
  </Stack.Navigator>
);

const PrivateStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
  </Stack.Navigator>
);

const LoadingView = () => (
  <View style={styles.loader}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

export const AppNavigator = () => {
  const { user, initializing } = useAuth();

  return (
    <NavigationContainer theme={navigationTheme}>
      {initializing ? <LoadingView /> : user ? <PrivateStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
