import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { User, Mail, Smartphone, Lock, CheckCircle, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// CONFIGURACIÓN DE RED DINÁMICA
// Tu IP actual: 192.168.101.16. 
// Agregamos /api/auth porque es el prefijo que definiste en index.ts
const BASE_URL = 'http://192.168.101.16:3000/api/auth'; 

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState({
    nombre: '',
    apodo: '',
    correo: '',
    celular: '',
    password: ''
  });

  const handleRegister = async () => {
    if (!formData.nombre || !formData.apodo || !formData.password) {
      Alert.alert("Atención", "Nombre, Apodo y Contraseña son obligatorios");
      return;
    }

    try {
      // Sincronizamos los nombres de campos con el Backend (authRoutes.ts)
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            realName: formData.nombre, // Antes: nombre_real
            username: formData.apodo,
            email: formData.correo,
            phone: formData.celular,   // Antes: telefono
            password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("¡Éxito!", "Cuenta creada correctamente.", [
          { text: "OK", onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        // Mostramos el mensaje exacto que viene del servidor
        Alert.alert("Error", data.message || "No se pudo crear la cuenta");
      }
    } catch (error) {
      Alert.alert("Error de Conexión", `No se pudo conectar al servidor en ${BASE_URL}. Verifica que el server esté corriendo.`);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Crear <Text style={{color: '#6366f1'}}>Cuenta</Text></Text>
          
          <View style={styles.form}>
            {/* Input Nombre Real */}
            <View style={styles.inputGroup}>
              <CheckCircle color="#6366f1" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Nombre Real" placeholderTextColor="#64748b"
                onChangeText={(val) => setFormData({...formData, nombre: val})} />
            </View>

            {/* Input Apodo (Username) */}
            <View style={styles.inputGroup}>
              <User color="#6366f1" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Apodo" placeholderTextColor="#64748b"
                onChangeText={(val) => setFormData({...formData, apodo: val})} />
            </View>

            {/* Input Correo */}
            <View style={styles.inputGroup}>
              <Mail color="#6366f1" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Correo" placeholderTextColor="#64748b"
                keyboardType="email-address" onChangeText={(val) => setFormData({...formData, correo: val})} />
            </View>

            {/* Input Celular */}
            <View style={styles.inputGroup}>
              <Smartphone color="#6366f1" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Celular" placeholderTextColor="#64748b"
                keyboardType="phone-pad" onChangeText={(val) => setFormData({...formData, celular: val})} />
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <Lock color="#6366f1" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#64748b"
                secureTextEntry onChangeText={(val) => setFormData({...formData, password: val})} />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrarse</Text>
              <ArrowRight color="white" size={20} />
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
  card: { backgroundColor: '#0f172a', borderRadius: 28, padding: 25, borderWidth: 1, borderColor: '#1e293b' },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 25 },
  form: { gap: 12 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#020617', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#1e293b' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: 'white', paddingVertical: 14 },
  button: { flexDirection: 'row', backgroundColor: '#4f46e5', padding: 18, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});