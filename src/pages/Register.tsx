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
import { useHistory } from "react-router-dom";
import "./Login.css";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const history = useHistory();

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    console.log("Register attempt with:", {
      name,
      email,
      password,
      confirmPassword,
    });
    history.push("/home");
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
                  >
                    Sign Up
                  </IonButton>
                  <IonButton
                    expand="block"
                    fill="clear"
                    onClick={() => history.push("/login")}
                    color="primary"
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
