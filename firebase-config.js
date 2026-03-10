// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkZlVhqX7Z8N9r7v8Q7Jz3t6k2LmX9w",
  authDomain: "unisolve-assignment.firebaseapp.com",
  projectId: "unisolve-assignment",
  storageBucket: "unisolve-assignment.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";
import { ref as dbRef, push, set } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

function getDatabase() {
  return database;
}

function getStorage() {
  return storage;
}

// Save Order to Firebase
async function saveOrderToDatabase(formData) {
  try {
    const ordersRef = dbRef(database, 'orders');
    const newOrderRef = push(ordersRef);
    
    await set(newOrderRef, {
      ...formData,
      orderId: newOrderRef.key,
      createdAt: new Date().toISOString(),
      status: 'pending_verification'
    });
    
    console.log('Order saved successfully:', newOrderRef.key);
    return newOrderRef.key;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}