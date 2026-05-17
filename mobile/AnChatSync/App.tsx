import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';

// Importación de pantallas
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen'; // <--- Agregado
import ChatScreen from './src/screens/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login" 
          screenOptions={{ 
            headerShown: false // Mantenemos el look limpio sin barras superiores
          }}
        >
          {/* Registro de rutas de AnChat Sync */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} /> 
          <Stack.Screen name="Chat" component={ChatScreen} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}