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

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log("Login attempt with:", { email, password });
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
                  >
                    Sign In
                  </IonButton>
                  <IonButton
                    expand="block"
                    fill="clear"
                    onClick={() => history.push("/register")}
                    color="primary"
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
