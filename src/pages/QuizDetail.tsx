import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonText,
  IonButton,
  IonFooter,
  IonIcon,
  IonProgressBar,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import {
  arrowBackOutline,
  homeOutline,
  trophyOutline,
  starOutline,
  bookOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Quiz } from "../models/quiz";
import { quizService } from "../services/QuizService";
import QuestionCard from "../components/QuestionCard";
import "./QuizDetail.css";

const QuizDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (id) {
        const data = await quizService.get(id);
        setQuiz(data);
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [id]);

  const handleChoiceSelect = (questionId: string, choiceId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    if (!quiz) return;
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctChoiceId) {
        correctCount++;
      }
    });
    setScore(correctCount);
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent
          className="ion-padding"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="loading-state">
            <IonSpinner name="crescent" color="primary" />
            <p>Preparing your quiz...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!quiz) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="empty-state">
            <IonIcon icon={bookOutline} className="empty-state-icon" />
            <h3>Quiz not found</h3>
            <p>The quiz you are looking for might have been deleted.</p>
            <IonButton routerLink="/home" fill="clear">
              Return Home
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Results View
  if (score !== null) {
    const totalQuestions = quiz.questions.length;
    const scorePercentage = score / totalQuestions;

    let resultConfig = {
      icon: trophyOutline,
      color: "success",
      message: "Perfect Score! 🎉",
    };
    if (scorePercentage < 0.5) {
      resultConfig = {
        icon: bookOutline,
        color: "warning",
        message: "Keep practicing! 💪",
      };
    } else if (scorePercentage < 1) {
      resultConfig = {
        icon: starOutline,
        color: "primary",
        message: "Great effort! ⭐",
      };
    }

    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" text="Home" />
            </IonButtons>
            <IonTitle>Results</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="result-content" color="light">
          <div className="result-wrapper ion-padding">
            <IonCard className="result-card">
              <IonCardContent className="ion-text-center">
                <div className={`icon-wrapper bg-${resultConfig.color}`}>
                  <IonIcon icon={resultConfig.icon} />
                </div>
                <h2 className="result-title">Quiz Completed!</h2>
                <p className="result-subtitle">{resultConfig.message}</p>

                <div className="score-display">
                  <span className={`score-text color-${resultConfig.color}`}>
                    {score}
                  </span>
                  <span className="score-divider">/</span>
                  <span className="score-total">{totalQuestions}</span>
                </div>
              </IonCardContent>
            </IonCard>

            <IonButton
              routerLink="/home"
              expand="block"
              className="ion-margin-top action-button"
              color="primary"
            >
              <IonIcon slot="start" icon={homeOutline} />
              Back to Home
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Active Quiz View
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const hasAnsweredCurrent = !!answers[currentQuestion.id];
  const progressValue = (currentQuestionIndex + 1) / quiz.questions.length;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Exit" />
          </IonButtons>
          <IonTitle>{quiz.title}</IonTitle>
        </IonToolbar>
        {quiz.questions.length > 0 && (
          <IonProgressBar
            value={progressValue}
            color="primary"
            className="quiz-progress"
          />
        )}
      </IonHeader>

      <IonContent color="light">
        <div className="ion-padding content-wrapper">
          {quiz.questions.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={bookOutline} className="empty-state-icon" />
              <h3>No Questions</h3>
              <p>This quiz doesn't have any questions yet.</p>
            </div>
          ) : (
            <div className="question-container">
              <div className="question-meta ion-margin-bottom">
                <IonText color="medium" className="question-counter">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </IonText>
              </div>

              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                selectedChoiceId={answers[currentQuestion.id]}
                onChoiceSelect={handleChoiceSelect}
              />
            </div>
          )}
        </div>
      </IonContent>

      {quiz.questions.length > 0 && (
        <IonFooter className="ion-no-border quiz-footer">
          <IonToolbar color="light">
            <IonButtons slot="start">
              <IonButton
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                color="medium"
              >
                <IonIcon slot="start" icon={arrowBackOutline} />
                Previous
              </IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton
                onClick={handleNext}
                fill="solid"
                color="primary"
                disabled={!hasAnsweredCurrent}
                className="next-button"
              >
                {currentQuestionIndex === quiz.questions.length - 1
                  ? "Finish"
                  : "Next"}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default QuizDetail;
