import React, { useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { gameService } from "../services/GameService";
import "./Login.css";

const JoinGame: React.FC = () => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const history = useHistory();
  const toast = useToast();

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();

    if (isSubmitting) return;
    if (!name.trim()) {
      toast.showError("Player name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await gameService.findSessionByCode(code);
      if (!session) {
        toast.showError("Game not found. Check the code.");
        return;
      }

      const player = await gameService.addPlayer(session.id, name);
      toast.showSuccess("Joined game successfully");
      history.replace(`/play/${session.id}?playerId=${player.id}`);
    } catch (error) {
      console.error("Error joining game:", error);
      toast.showError("Unable to join game.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Join Live Game</IonTitle>
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
              <IonCardSubtitle>Player Mode</IonCardSubtitle>
              <IonCardTitle>Enter game code</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleJoin}>
                <IonList className="login-form-list">
                  <IonItem lines="full" className="login-form-item">
                    <IonInput
                      label="Your Name"
                      labelPlacement="floating"
                      placeholder="Enter your name"
                      value={name}
                      onIonInput={(e) => setName(e.detail.value || "")}
                      required
                    />
                  </IonItem>
                  <IonItem lines="full" className="login-form-item">
                    <IonInput
                      label="Game Code"
                      labelPlacement="floating"
                      placeholder="e.g. A8F4K2"
                      value={code}
                      onIonInput={(e) =>
                        setCode((e.detail.value || "").toUpperCase())
                      }
                      maxlength={6}
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Joining..." : "Join Game"}
                  </IonButton>
                  <IonButton
                    expand="block"
                    fill="clear"
                    onClick={() => history.push("/login")}
                    disabled={isSubmitting}
                  >
                    Back to Login
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

export default JoinGame;
