import React, { useEffect, useMemo, useState } from "react";
import {
  IonButton,
  IonBackButton,
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
  IonProgressBar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { Quiz } from "../models/quiz";
import { quizService } from "../services/QuizService";
import { GamePlayer, GameSession, gameService } from "../services/GameService";
import QuestionCard from "../components/QuestionCard";
import "./QuizDetail.css";

const PlayGame: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const history = useHistory();
  const toast = useToast();

  const [session, setSession] = useState<GameSession | undefined>(undefined);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [quiz, setQuiz] = useState<Quiz | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | undefined>(
    undefined,
  );
  const [submittedChoiceId, setSubmittedChoiceId] = useState<
    string | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const playerId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("playerId") || "";
  }, [location.search]);

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

  useEffect(() => {
    async function loadCurrentAnswer() {
      if (!session || !playerId) return;
      if (session.status !== "in_progress") {
        setSelectedChoiceId(undefined);
        setSubmittedChoiceId(undefined);
        return;
      }

      const answer = await gameService.getSubmittedAnswer(
        session.id,
        playerId,
        session.currentQuestionIndex,
      );

      setSelectedChoiceId(answer);
      setSubmittedChoiceId(answer);
    }

    loadCurrentAnswer();
  }, [session, playerId]);

  if (!playerId) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText color="danger">
            Missing player session. Please join again.
          </IonText>
          <IonButton
            expand="block"
            className="ion-margin-top"
            onClick={() => history.replace("/join")}
          >
            Join a Game
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  const currentPlayer = players.find((player) => player.id === playerId);

  async function handleSubmitAnswer() {
    if (!session || !selectedChoiceId || submittedChoiceId) return;

    try {
      setIsSubmitting(true);
      await gameService.submitAnswer(
        session.id,
        playerId,
        session.currentQuestionIndex,
        selectedChoiceId,
      );
      setSubmittedChoiceId(selectedChoiceId);
      toast.showSuccess("Answer submitted");
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.showError("Unable to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding" color="light">
          <div className="loading-state">
            <IonSpinner name="crescent" color="primary" />
            <p>Joining game...</p>
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
            onClick={() => history.replace("/join")}
          >
            Join another game
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  const currentQuestion =
    session.status === "in_progress"
      ? quiz?.questions[session.currentQuestionIndex]
      : undefined;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Exit" />
          </IonButtons>
          <IonTitle>Live Quiz</IonTitle>
        </IonToolbar>
        {session.status === "in_progress" && quiz?.questions.length ? (
          <IonProgressBar
            value={(session.currentQuestionIndex + 1) / quiz.questions.length}
            color="primary"
            className="quiz-progress"
          />
        ) : null}
      </IonHeader>

      <IonContent className="ion-padding" color="light">
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Code: {session.code}</IonCardSubtitle>
            <IonCardTitle>{currentPlayer?.name || "Player"}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Status: <strong>{session.status.replace("_", " ")}</strong>
            </p>
            <p>
              Your score: <strong>{currentPlayer?.score ?? 0}</strong>
            </p>
          </IonCardContent>
        </IonCard>

        {session.status === "lobby" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Waiting for host</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText color="medium">
                The admin will start the quiz when at least one player has
                joined.
              </IonText>
            </IonCardContent>
          </IonCard>
        )}

        {session.status === "in_progress" && currentQuestion && (
          <IonCard>
            <IonCardHeader>
              <IonCardSubtitle>
                Question {session.currentQuestionIndex + 1} /{" "}
                {quiz?.questions.length || 0}
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <QuestionCard
                key={`${currentQuestion.id}-${session.currentQuestionIndex}`}
                question={currentQuestion}
                selectedChoiceId={selectedChoiceId}
                onChoiceSelect={(_, choiceId) => setSelectedChoiceId(choiceId)}
                readOnly={!!submittedChoiceId}
                showResultOnSelect={false}
                lockOnSelect={false}
                keepInteractiveStyle
                selectedStyle="border"
              />

              <IonButton
                expand="block"
                className="next-button ion-margin-top"
                fill="solid"
                color="primary"
                onClick={handleSubmitAnswer}
                disabled={
                  !selectedChoiceId || isSubmitting || !!submittedChoiceId
                }
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {session.status === "finished" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Quiz Finished</IonCardTitle>
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
              <IonButton
                expand="block"
                className="ion-margin-top"
                onClick={() => history.replace("/join")}
              >
                Join another game
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PlayGame;
