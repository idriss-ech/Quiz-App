import React, { useEffect } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { authService } from "../services/AuthService";

const SplashScreen: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    const timeout = setTimeout(() => {
      history.replace(authService.isConnected() ? "/home" : "/login");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [history]);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div
          style={{
            backgroundColor: "#0054e9", // Vibrant blue similar to the image
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <h1
            style={{
              color: "white",
              fontWeight: "bold",
              margin: 0,
              letterSpacing: "1px",
            }}
          >
            App Quiz
          </h1>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SplashScreen;
