import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMYiGKt4_OyWpLMESeb8mIdJenBvySaMA",
  authDomain: "song-rank-817c7.firebaseapp.com",
  projectId: "song-rank-817c7",
  storageBucket: "song-rank-817c7.firebasestorage.app",
  messagingSenderId: "657220025493",
  appId: "1:657220025493:web:a3c44e65c379e2ce176f9c",
  measurementId: "G-JZSKVGMEDE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const BASE_URL = 'http://localhost:3001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        // Send role info to backend
        const response = await fetch(`${BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, userId: user.uid, idToken, role })
        });

        const result = await response.json();
        alert('Registration successful!');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        localStorage.setItem('token', idToken);

        // Get user role to redirect
        const verify = await fetch(`${BASE_URL}/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });

        const data = await verify.json();
        if (data.user.role === 'admin') {
          window.location.href = '/my-lists';
        } else {
          window.location.href = '/my-lists';
        }
      }
    } catch (err) {
      alert('Auth failed: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" required />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" required />
        {isRegistering && (
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        )}
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account?' : 'Need to register?'}
      </button>
    </div>
  );
};

export default Auth;