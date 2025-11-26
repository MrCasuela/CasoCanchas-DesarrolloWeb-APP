import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { authService } from '../services/auth.service';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_CONFIG } from '../constants/firebaseConfig';

// Configurar Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_CONFIG.WEB_CLIENT_ID,
});

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      console.log('Iniciando Google Sign-In...');

      // Verificar si Google Play Services está disponible
      await GoogleSignin.hasPlayServices();
      console.log('Google Play Services disponible');

      // Iniciar sesión con Google
      const userInfo = await GoogleSignin.signIn();

      console.log('Google sign-in exitoso:', userInfo);

      // Obtener el idToken
      const tokens = await GoogleSignin.getTokens();
      console.log('Tokens obtenidos:', { hasIdToken: !!tokens.idToken, hasAccessToken: !!tokens.accessToken });

      if (!tokens.idToken) {
        throw new Error('No se pudo obtener el token de Google');
      }

      // Enviar al servicio de autenticación
      await authService.loginWithGoogle(tokens.idToken, tokens.accessToken);

      console.log('Login con Google completado');
    } catch (error: any) {
      console.error('Error en Google login:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      let errorMessage = 'No se pudo iniciar sesión con Google';

      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Inicio de sesión cancelado';
      } else if (error.code === 'IN_PROGRESS') {
        errorMessage = 'Operación en progreso';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services no disponible';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      console.log('Iniciando login...');
      await authService.login({ email, password });
      console.log('Login exitoso');
      // La navegación se manejará automáticamente por el estado de autenticación en App.tsx
    } catch (error: any) {
      console.error('Error en login:', error);

      let errorMessage = 'Credenciales incorrectas';

      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string'
          ? error.response.data.detail
          : JSON.stringify(error.response.data.detail);
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error de inicio de sesión', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Reserva tu cancha favorita</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text style={styles.googleButtonText}>
            {loading ? 'Conectando...' : '🔍 Continuar con Google'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>
            ¿No tienes cuenta? <Text style={styles.linkTextBold}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
