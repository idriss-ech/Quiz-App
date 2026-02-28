import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonItem,
  IonList,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from "@ionic/react";
import { FirebaseError } from "firebase/app";
import { useHistory } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { authService } from "../services/AuthService";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const history = useHistory();
  const toast = useToast();

  function mapAuthError(error: unknown) {
    if (!(error instanceof FirebaseError)) {
      return "Unable to sign in. Please try again.";
    }

    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      default:
        return "Unable to sign in. Please try again.";
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await authService.signIn(email.trim(), password);
      toast.showSuccess("Signed in successfully");
      history.replace("/home");
    } catch (error) {
      toast.showError(mapAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Quiz App</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        color="light"
        className="login-content ion-padding"
      >
        <div className="login-wrapper">
          <IonCard className="login-card">
            <IonCardHeader>
              <IonCardSubtitle>Welcome back</IonCardSubtitle>
              <IonCardTitle>Sign in</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <form onSubmit={handleLogin}>
                <IonList className="login-form-list">
                  <IonItem lines="full" className="login-form-item">
                    <IonInput
                      label="Email"
                      labelPlacement="floating"
                      placeholder="Enter your email"
                      type="email"
                      value={email}
                      onIonInput={(e) => setEmail(e.detail.value!)}
                      required
                    />
                  </IonItem>

                  <IonItem lines="full" className="login-form-item">
                    <IonInput
                      label="Password"
                      labelPlacement="floating"
                      placeholder="Enter your password"
                      type="password"
                      value={password}
                      onIonInput={(e) => setPassword(e.detail.value!)}
                      required
                    />
                  </IonItem>
                </IonList>

                <div className="login-actions ion-margin-top">
                  <IonButton
                    expand="block"
                    type="submit"
                    size="large"
                    className="login-primary-btn ion-margin-bottom"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </IonButton>
                  <IonButton
                    expand="block"
                    fill="clear"
                    onClick={() => history.push("/register")}
                    color="primary"
                    disabled={isSubmitting}
                  >
                    Create New Account
                  </IonButton>
                </div>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
