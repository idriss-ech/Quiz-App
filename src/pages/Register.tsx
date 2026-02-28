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

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const history = useHistory();
  const toast = useToast();

  function mapAuthError(error: unknown) {
    if (!(error instanceof FirebaseError)) {
      return "Unable to create account. Please try again.";
    }

    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already in use.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "Unable to create account. Please try again.";
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (isSubmitting) return;

    if (!name.trim()) {
      toast.showError("Full name is required.");
      return;
    }

    if (password !== confirmPassword) {
      toast.showError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.createUser(email.trim(), password, name);
      toast.showSuccess("Account created successfully");
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
              <IonCardSubtitle>Join Quiz App</IonCardSubtitle>
              <IonCardTitle>Create account</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <form onSubmit={handleRegister}>
                <IonList className="login-form-list">
                  <IonItem lines="full" className="login-form-item">
                    <IonInput
                      label="Full Name"
                      labelPlacement="floating"
                      placeholder="Enter your full name"
                      type="text"
                      value={name}
                      onIonInput={(e) => setName(e.detail.value!)}
                      required
                    />
                  </IonItem>
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
                  <IonItem lines="full" className="login-form-item">
                    <IonInput
                      label="Confirm Password"
                      labelPlacement="floating"
                      placeholder="Confirm your password"
                      type="password"
                      value={confirmPassword}
                      onIonInput={(e) => setConfirmPassword(e.detail.value!)}
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
                    {isSubmitting ? "Signing up..." : "Sign Up"}
                  </IonButton>
                  <IonButton
                    expand="block"
                    fill="clear"
                    onClick={() => history.push("/login")}
                    color="primary"
                    disabled={isSubmitting}
                  >
                    Already have an account? Sign In
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

export default Register;
