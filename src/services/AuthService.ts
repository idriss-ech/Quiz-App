import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../config/firebase";

class AuthService {
  async createUser(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  isConnected(): User {
    return auth.currentUser as User;
  }
}

export const authService = new AuthService();
