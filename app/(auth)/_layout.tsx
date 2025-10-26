import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import HeaderWithLogo from '../../components/header-with-logo';

export default function AuthLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#001489" />
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="forgotPassword"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}