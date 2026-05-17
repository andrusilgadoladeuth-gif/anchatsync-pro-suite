import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { User, Lock, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// Sincronizado con tu IP real y el prefijo /api/auth del index.ts
const BASE_URL = 'http://192.168.101.16:3000/api/auth'; 

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Atención", "Por favor, llena todos los campos");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: identifier, 
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login exitoso:", data);
        navigation.navigate('Chat', { 
            userName: data.user.real_name,
            userId: data.user.id 
        });
      } else {
        Alert.alert("Error", data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor. ¿Está encendido el backend?");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>AnChat<Text style={{color: '#6366f1'}}>Sync</Text></Text>
          </View>

          <Text style={styles.accessText}>Acceso seguro a la red</Text>

          <View style={styles.form}>
            {/* Input Usuario - Mantenemos el estilo claro del input */}
            <View style={styles.inputGroup}>
              <User color="#94a3b8" size={20} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="andru@test.com"
                placeholderTextColor="#94a3b8"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
              />
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.9}>
              <Text style={styles.buttonText}>Entrar a la red</Text>
              <ArrowRight color="white" size={20} />
            </TouchableOpacity>
          </View>

          {/* Enlaces inferiores - RECUPERADOS Y COMPLETOS */}
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => console.log('Recuperar clave')}>
              <Text style={styles.linkText}>¿Olvidaste tu contraseña? <Text style={styles.linkHighlight}>Recupérala aquí</Text></Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{marginTop: 15}} 
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.linkText}>¿Nuevo aquí? <Text style={styles.linkHighlight}>Crea una cuenta</Text></Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 28,
    padding: 30,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#6366f1',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  logoBox: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  logoText: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  accessText: { color: '#94a3b8', fontSize: 14, marginBottom: 30, letterSpacing: 0.5 },
  form: { width: '100%', gap: 15 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // Fondo claro para resaltar los iconos
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#0f172a', paddingVertical: 15, fontSize: 16 }, // Texto oscuro para el input claro
  button: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    padding: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 10
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footerLinks: { marginTop: 30, alignItems: 'center' },
  linkText: { color: '#94a3b8', fontSize: 13 },
  linkHighlight: { color: '#6366f1', fontWeight: 'bold' }
});