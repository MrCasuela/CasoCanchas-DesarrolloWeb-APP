import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthNavigator, MainNavigator } from './src/navigation';
import { authService } from './src/services/auth.service';
import { Loading } from './src/components';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      console.log('Estado de autenticación:', authenticated);
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar estado de autenticación cuando cambie
  useEffect(() => {
    const interval = setInterval(async () => {
      const authenticated = await authService.isAuthenticated();
      if (authenticated !== isAuthenticated) {
        console.log('Cambio en autenticación detectado:', authenticated);
        setIsAuthenticated(authenticated);
      }
    }, 500); // Reducido a 500ms para respuesta más rápida

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (isLoading) {
    return <Loading />;
  }

  console.log('Renderizando App, isAuthenticated:', isAuthenticated);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
