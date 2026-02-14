import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  IonButton,
  IonButtons,
  IonInput,
  IonItem,
  IonModal,
  IonFab,
  IonFabButton,
  IonIcon,
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import "./Home.css";
import { Quiz } from "../models/quiz";
import { quizService } from "../services/QuizService";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import AddQuizForm from "../components/AddQuizForm";

import { useToast } from "../hooks/useToast";

const Home: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const toast = useToast();
  const history = useHistory();

  useEffect(() => {
    const fetchQuizzes = async () => {
      const data = await quizService.getAll();
      setQuizzes(data);
    };
    fetchQuizzes();
  }, [quizzes]);

  const modal = useRef<HTMLIonModalElement>(null);
  const input = useRef<HTMLIonInputElement>(null);

  const [newQuizData, setNewQuizData] = useState<Partial<Quiz>>({});

  function confirm() {
    modal.current?.dismiss(newQuizData, "confirm");
  }

  async function onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === "confirm") {
      const quizData = event.detail.data as Partial<Quiz>;
      if (quizData.title && quizData.description) {
        // Create a proper Quiz object
        const newQuiz: Quiz = {
          id: Date.now().toString(), // Or let Firebase generate ID if using add()
          title: quizData.title,
          description: quizData.description,
          questions: quizData.questions || [],
        };

        // Add to service
        try {
          await quizService.add(newQuiz);
          // Update local state (optional, or re-fetch)
          setQuizzes([...quizzes, newQuiz]);
          toast.showSuccess(`Quiz "${newQuiz.title}" created successfully!`);
        } catch (error) {
          console.error("Error adding quiz:", error);
          toast.showError("Failed to create quiz. Please try again.");
        }
      }
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Quiz App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            {quizzes.map((quiz) => (
              <IonCol size="12" key={quiz.id}>
                <IonCard
                  color="primary"
                  button={true}
                  onClick={() => {
                    // Fix for "Blocked aria-hidden" warning by removing focus before navigation
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                    history.push(`/quiz/${quiz.id}`);
                  }}
                >
                  <IonCardHeader>
                    <IonCardTitle>{quiz.title}</IonCardTitle>
                    <IonCardSubtitle>
                      {quiz.questions.length} questions
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>{quiz.description}</IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
      <IonFab slot="fixed" vertical="bottom" horizontal="center">
        <IonFabButton id="open-modal">
          <IonIcon icon={add}></IonIcon>
        </IonFabButton>
      </IonFab>
      <IonModal
        ref={modal}
        trigger="open-modal"
        onWillDismiss={(event) => onWillDismiss(event)}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => modal.current?.dismiss()}>
                Cancel
              </IonButton>
            </IonButtons>
            <IonTitle>Add New Quiz</IonTitle>
            <IonButtons slot="end">
              <IonButton strong={true} onClick={() => confirm()}>
                Save
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <AddQuizForm onQuizChange={(data) => setNewQuizData(data)} />
      </IonModal>
    </IonPage>
  );
};

export default Home;
