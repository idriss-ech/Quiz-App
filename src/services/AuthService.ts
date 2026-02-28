import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase";

class AuthService {
  async createUser(
    email: string,
    password: string,
    fullName: string,
  ): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const trimmedFullName = fullName.trim();
    if (trimmedFullName) {
      await updateProfile(userCredential.user, {
        displayName: trimmedFullName,
      });
    }

    return userCredential;
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
