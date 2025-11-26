import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD8CQMSIZvtCCHCmZwQRBe_wks6ZTAWEBM",
    authDomain: "casocanchas-auth.firebaseapp.com",
    projectId: "casocanchas-auth",
    storageBucket: "casocanchas-auth.firebasestorage.app",
    messagingSenderId: "85216972234",
    appId: "1:85216972234:web:1360a88de5c34a9d50d333",
    measurementId: "G-EHJDRKS4B1"
};

// Google OAuth Client IDs
export const GOOGLE_CONFIG = {
    WEB_CLIENT_ID: "85216972234-mb052e5ld1e899d47vrl14kjqmf081gt.apps.googleusercontent.com",
    IOS_CLIENT_ID: "85216972234-mb052e5ld1e899d47vrl14kjqmf081gt.apps.googleusercontent.com",
    ANDROID_CLIENT_ID: "85216972234-emomrdqei3f17ue7fs7r6nj09qkhr59c.apps.googleusercontent.com", // APK producción (com.mrcasuela.CasoCanchas)
    EXPO_CLIENT_ID: "85216972234-j5vki3d3qm629j58jplnm3lon0ls9pmc.apps.googleusercontent.com", // Expo Go (host.exp.exponent)
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
