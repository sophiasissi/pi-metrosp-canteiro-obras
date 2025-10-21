import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: '#001F7F' },
          headerTintColor: '#fff',
          drawerActiveTintColor: '#001F7F',
          drawerLabelStyle: { fontSize: 16 },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Login',
            headerShown: false,
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="home"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Configurações',
            drawerLabel: 'Configurações',
          }}
        />
        <Drawer.Screen
          name="addUser"
          options={{
            title: 'Adicionar Usuário',
            drawerLabel: 'Adicionar Usuário',
          }}
        />
        <Drawer.Screen
          name="signUp"
          options={{
            title: 'Cadastro',
            headerShown: false,
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="forgotPassword"
          options={{
            title: 'Esqueceu a Senha?',
            headerShown: false,
            drawerItemStyle: { display: 'none' },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

