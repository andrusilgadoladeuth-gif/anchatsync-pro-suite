import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Send, Search, UserCircle, Trash2, Pencil, X, ArrowLeft, LogOut } from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { io, Socket } from 'socket.io-client';

const BASE_URL = 'http://192.168.101.16:3000';

export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userName, userId } = route.params || { userName: 'Usuario', userId: null };

  const [socket, setSocket] = useState<Socket | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMessage, setEditingMessage] = useState<any | null>(null);

  // 1. CONEXIÓN Y EVENTOS DE SOCKET
  useEffect(() => {
    if (!userId) return;
    const newSocket = io(BASE_URL, { transports: ['websocket'] });

    newSocket.on('connect', () => {
      console.log('✅ Conectado');
      newSocket.emit('join', userId.toString());
    });

    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      fetchContacts(); 
    });

    newSocket.on('message_sent', (msg) => {
      setMessages((prev) => [...prev, msg]);
      fetchContacts();
    });

    newSocket.on('message_updated', (updatedMsg) => {
      setMessages((prev) => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
    });

    newSocket.on('message_deleted', (deletedId) => {
      setMessages((prev) => prev.filter(m => m.id !== deletedId));
    });

    setSocket(newSocket);
    fetchContacts();
    
    return () => { newSocket.disconnect(); };
  }, [userId]);

  // 2. CARGAR LISTA DE CHATS RECIENTES (COMO EL ASIDE DE LA WEB)
  const fetchContacts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/contacts/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (error) {
      console.log("Error fetchContacts:", error);
    }
  };

  // 3. CARGAR HISTORIAL AL SELECCIONAR UN CONTACTO
  useEffect(() => {
    if (!selectedUser) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/messages/${userId}/${selectedUser.id}`);
        if (res.ok) {
          const history = await res.json();
          setMessages(history);
        }
      } catch (error) {
        console.log("Error historial:", error);
      }
    };
    fetchHistory();
  }, [selectedUser]);

  // 4. BÚSQUEDA DE USUARIOS NUEVOS
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/users/search?query=${searchQuery}`);
      const user = await res.json();
      if (res.ok && user) {
        setSelectedUser(user);
        setSearchQuery('');
      } else { 
        Alert.alert("AnChat Sync", "Usuario no encontrado"); 
      }
    } catch (error) {
      console.log("Error búsqueda:", error);
    }
  };

  // 5. ENVIAR MENSAJE O GUARDAR EDICIÓN
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser || !socket) return;

    if (editingMessage) {
      try {
        const res = await fetch(`${BASE_URL}/api/messages/${editingMessage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: messageInput })
        });
        if (res.ok) {
          const updated = await res.json();
          socket.emit('edit_message', { ...updated, receiver_id: selectedUser.id });
          setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
          setEditingMessage(null);
          setMessageInput('');
        }
      } catch (e) {
        console.log("Error editando:", e);
      }
    } else {
      socket.emit('send_message', {
        sender_id: userId,
        receiver_id: selectedUser.id,
        content: messageInput
      });
      setMessageInput('');
    }
  };

  // 6. ELIMINAR MENSAJE (CRUD WEB)
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        socket?.emit('delete_message', { id, receiver_id: selectedUser.id });
      }
    } catch (e) {
      console.log("Error eliminando:", e);
    }
  };

  // 7. CIERRE DE SESIÓN (CORREGIDO)
  const handleLogout = () => {
    if (socket) socket.disconnect();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  // 8. VOLVER A VER TODOS LOS CONTACTOS (RETROCESO)
  const handleBack = () => {
    setSelectedUser(null);
    setMessages([]);
    fetchContacts();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DINÁMICO */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {selectedUser && (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <ArrowLeft color="#6366f1" size={26} />
            </TouchableOpacity>
          )}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {selectedUser ? selectedUser.username.charAt(0).toUpperCase() : userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>
              {selectedUser ? (selectedUser.real_name || selectedUser.username) : "Chats Recientes"}
            </Text>
            <Text style={styles.status}>{socket?.connected ? '● En línea' : '○ Desconectado'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut color="#f87171" size={22} />
        </TouchableOpacity>
      </View>

      {!selectedUser ? (
        /* VISTA DE CONTACTOS / HISTORIAL */
        <View style={{ flex: 1, padding: 20 }}>
          <View style={styles.searchBox}>
            <TextInput 
              style={styles.searchInput} 
              placeholder="Buscar por correo o celular..." 
              placeholderTextColor="#64748b" 
              value={searchQuery} 
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch}>
              <Search color="#6366f1" size={20} />
            </TouchableOpacity>
          </View>
          <FlatList 
            data={contacts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.contactItem} onPress={() => setSelectedUser(item)}>
                <UserCircle color="#6366f1" size={40} />
                <View style={{flex:1}}>
                  <Text style={styles.contactText}>{item.real_name || item.username}</Text>
                  <Text style={{color: '#64748b', fontSize: 12}}>Toca para chatear</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        /* VISTA DE CHAT ACTIVO */
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1 }}
          keyboardVerticalOffset={90}
        >
          <FlatList
            data={messages}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => {
              const isMe = item.sender_id === userId;
              return (
                <View style={[styles.msgContainer, isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                  <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                    <Text style={styles.msgText}>{item.content}</Text>
                    {item.is_edited && <Text style={styles.editedTag}>editado</Text>}
                  </View>
                  {isMe && (
                    <View style={styles.msgActions}>
                      <TouchableOpacity onPress={() => { setEditingMessage(item); setMessageInput(item.content); }}>
                        <Pencil color="#94a3b8" size={14} style={{marginRight: 12}} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <Trash2 color="#f87171" size={14} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
          />

          <View style={styles.inputArea}>
            {editingMessage && (
              <View style={styles.editRow}>
                <Text style={{color: '#6366f1', fontSize: 12}}>Editando...</Text>
                <TouchableOpacity onPress={() => { setEditingMessage(null); setMessageInput(''); }}>
                  <X color="#6366f1" size={16} />
                </TouchableOpacity>
              </View>
            )}
            <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
              <TextInput 
                style={styles.textInput} 
                placeholder="Escribe..." 
                placeholderTextColor="#94a3b8" 
                value={messageInput} 
                onChangeText={setMessageInput} 
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Send color="white" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1e293b', backgroundColor: '#0f172a' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 10, padding: 5 },
  logoutBtn: { padding: 5 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#6366f1', marginRight: 10 },
  avatarText: { color: '#6366f1', fontWeight: 'bold' },
  userName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  status: { color: '#22c55e', fontSize: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#1e293b' },
  searchInput: { flex: 1, color: 'white', paddingVertical: 10 },
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#0f172a', borderRadius: 15, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: '#1e293b' },
  contactText: { color: 'white', fontWeight: 'bold' },
  msgContainer: { marginBottom: 15, width: '100%' },
  bubble: { padding: 12, borderRadius: 18, maxWidth: '80%' },
  myBubble: { backgroundColor: '#4f46e5', borderTopRightRadius: 2 },
  otherBubble: { backgroundColor: '#1e293b', borderTopLeftRadius: 2, borderWidth: 1, borderColor: '#334155' },
  msgText: { color: 'white', fontSize: 15 },
  editedTag: { fontSize: 8, color: '#94a3b8', fontStyle: 'italic', textAlign: 'right', marginTop: 4 },
  msgActions: { flexDirection: 'row', marginTop: 4, marginRight: 5 },
  inputArea: { padding: 15, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b' },
  editRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  textInput: { flex: 1, backgroundColor: '#020617', borderRadius: 20, paddingHorizontal: 15, color: 'white', minHeight: 40, borderWidth: 1, borderColor: '#1e293b' },
  sendButton: { backgroundColor: '#4f46e5', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' }
});