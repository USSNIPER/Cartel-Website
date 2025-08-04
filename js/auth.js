import { firebaseConfig } from './config.js';

let auth = null;
let provider = null;
let app = null;

export { auth };

export async function initializeFirebase() {
    console.log('[initializeFirebase] Function called');
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js");
        const { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } = 
            await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js");

        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        provider = new GoogleAuthProvider();
        await setPersistence(auth, browserLocalPersistence);
        await setPersistence(auth, browserLocalPersistence);
        console.log('[initializeFirebase] Firebase app and auth initialized.');

        return { auth, provider };
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return null;
    }
}

export async function loginWithGoogle() {
    console.log('[loginWithGoogle] Function called');
    try {
        if (!auth) {
            console.log('[loginWithGoogle] Firebase not initialized, initializing now...');
            await initializeFirebase();
        }
        console.log('[loginWithGoogle] Attempting to sign in with popup...');
        const { signInWithPopup } = await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js");
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error('[loginWithGoogle] Google login error:', error);
        alert('Login failed: ' + error.message);
        return null;
    }
}

export function loginWithKey(key) {
    if (key === 'ussniper-is-the-goat') {
        const mockUser = {
            uid: 'key_user_' + Date.now(),
            displayName: 'Key User',
            email: 'key@cartelcheats.com',
            isKeyUser: true
        };
        localStorage.setItem('key_user', JSON.stringify(mockUser));
        return mockUser;
    }
    return null;
}

export async function logout() {
    localStorage.removeItem('key_user');
    if (auth && auth.currentUser) {
        try {
            const { signOut } = await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js");
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }
}