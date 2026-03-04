import React, { useEffect, useMemo, useState } from "react";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { Quiz } from "../models/quiz";
import { quizService } from "../services/QuizService";
import { GamePlayer, GameSession, gameService } from "../services/GameService";
import { authService } from "../services/AuthService";

const HostGame: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<GameSession | undefined>(undefined);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [quiz, setQuiz] = useState<Quiz | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isActionRunning, setIsActionRunning] = useState(false);
  const history = useHistory();
  const toast = useToast();

  const connectedUser = authService.isConnected();

  const isAdmin = useMemo(() => {
    if (!connectedUser || !session) return false;
    return session.adminId === connectedUser.uid;
  }, [connectedUser, session]);

  useEffect(() => {
    const unsubscribeSession = gameService.subscribeSession(
      sessionId,
      (nextSession) => {
        setSession(nextSession);
        setLoading(false);
      },
    );

    const unsubscribePlayers = gameService.subscribePlayers(
      sessionId,
      (nextPlayers) => {
        setPlayers(nextPlayers);
      },
    );

    return () => {
      unsubscribeSession();
      unsubscribePlayers();
    };
  }, [sessionId]);

  useEffect(() => {
    async function loadQuiz() {
      if (!session) return;
      const fullQuiz = await quizService.get(session.quizId);
      setQuiz(fullQuiz);
    }

    loadQuiz();
  }, [session]);

  async function handleStart() {
    if (!session || !quiz) return;
    if (players.length < 1) {
      toast.showError("At least one player must join before starting.");
      return;
    }

    try {
      setIsActionRunning(true);
      await gameService.startSession(session.id);
      toast.showSuccess("Live quiz started");
    } catch (error) {
      console.error("Error starting session:", error);
      toast.showError("Unable to start quiz");
    } finally {
      setIsActionRunning(false);
    }
  }

  async function handleNext() {
    if (!session || !quiz) return;

    try {
      setIsActionRunning(true);
      await gameService.advanceQuestion(session.id, quiz);
    } catch (error) {
      console.error("Error advancing question:", error);
      toast.showError("Unable to go to next question");
    } finally {
      setIsActionRunning(false);
    }
  }

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding" color="light">
          <div className="loading-state">
            <IonSpinner name="crescent" color="primary" />
            <p>Loading live game...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!session) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText color="danger">Game session not found.</IonText>
          <IonButton
            expand="block"
            className="ion-margin-top"
            onClick={() => history.replace("/home")}
          >
            Back Home
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  const currentQuestion = quiz?.questions[session.currentQuestionIndex];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Host Live Quiz</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" color="light">
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Game Code</IonCardSubtitle>
            <IonCardTitle>{session.code}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              Share this code with players so they can join.
            </IonText>
            <p>
              Status: <strong>{session.status.replace("_", " ")}</strong>
            </p>
            <p>
              Players joined: <strong>{players.length}</strong>
            </p>
          </IonCardContent>
        </IonCard>

        {session.status === "lobby" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Lobby</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton
                expand="block"
                onClick={handleStart}
                disabled={
                  !isAdmin ||
                  isActionRunning ||
                  players.length < 1 ||
                  !quiz ||
                  quiz.questions.length < 1
                }
              >
                {isActionRunning ? "Starting..." : "Start Quiz"}
              </IonButton>
              {players.length < 1 && (
                <IonText color="warning">
                  <p>At least one player is required to start.</p>
                </IonText>
              )}
            </IonCardContent>
          </IonCard>
        )}

        {session.status === "in_progress" && (
          <IonCard>
            <IonCardHeader>
              <IonCardSubtitle>
                Question {session.currentQuestionIndex + 1} /{" "}
                {quiz?.questions.length || 0}
              </IonCardSubtitle>
              <IonCardTitle>{currentQuestion?.text || "Question"}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton
                expand="block"
                onClick={handleNext}
                disabled={!isAdmin || isActionRunning}
              >
                {isActionRunning
                  ? "Updating..."
                  : session.currentQuestionIndex >=
                      (quiz?.questions.length || 1) - 1
                    ? "Finish Quiz"
                    : "Next Question"}
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {session.status === "finished" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Final Leaderboard</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {players.map((player, index) => (
                  <IonItem key={player.id}>
                    <IonLabel>
                      #{index + 1} {player.name}
                    </IonLabel>
                    <IonText slot="end">{player.score}</IonText>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default HostGame;
