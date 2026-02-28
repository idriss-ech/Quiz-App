import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  IonButton,
  IonButtons,
  IonModal,
  IonFab,
  IonFabButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  useIonViewWillEnter,
} from "@ionic/react";
import { add, create, trash } from "ionicons/icons";
import { useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import "./Home.css";
import { Quiz } from "../models/quiz";
import { quizService } from "../services/QuizService";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import AddQuizForm from "../components/AddQuizForm";
import { useToast } from "../hooks/useToast";

const Home: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [newQuizData, setNewQuizData] = useState<Partial<Quiz>>({});

  const history = useHistory();
  const toast = useToast();
  const modal = useRef<HTMLIonModalElement>(null);

  async function fetchQuizzes() {
    const data = await quizService.getAll();
    setQuizzes(data);
  }

  useIonViewWillEnter(() => {
    fetchQuizzes();
  });

  function handleOpenAddModal() {
    setEditingQuizId(null);
    setNewQuizData({});
    setShowModal(true);
  }

  async function handleOpenEditModal(e: React.MouseEvent, quizId: string) {
    e.stopPropagation();
    try {
      const fullQuiz = await quizService.get(quizId);
      if (fullQuiz) {
        setEditingQuizId(quizId);
        setNewQuizData(fullQuiz);
        setShowModal(true);
      } else {
        toast.showError("Quiz not found");
      }
    } catch (error) {
      console.error("Error fetching quiz details:", error);
      toast.showError("Failed to load quiz details");
    }
  }

  async function handleDeleteQuiz(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    try {
      await quizService.delete(id);
      setQuizzes(quizzes.filter((q) => q.id !== id));
      toast.showSuccess("Quiz deleted successfully");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.showError("Failed to delete quiz");
    }
  }

  async function onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    setShowModal(false);
    if (event.detail.role === "confirm") {
      const quizData = newQuizData; // Use state directly as it's updated by form

      if (!quizData.title || !quizData.description) {
        toast.showError("Title and description are required");
        return;
      }

      try {
        if (editingQuizId) {
          // Update existing
          const updatedQuiz: Quiz = {
            ...(quizData as Quiz),
            id: editingQuizId,
          };
          await quizService.update(updatedQuiz);
          setQuizzes(
            quizzes.map((q) => (q.id === editingQuizId ? updatedQuiz : q)),
          );
          toast.showSuccess("Quiz updated successfully");
        } else {
          // Create new
          const newQuiz: Quiz = {
            id: Date.now().toString(),
            title: quizData.title,
            description: quizData.description,
            questionCount: quizData.questions?.length || 0,
            questions: quizData.questions || [],
          };
          await quizService.add(newQuiz);
          setQuizzes([...quizzes, newQuiz]);
          toast.showSuccess("Quiz created successfully");
        }
      } catch (error) {
        console.error("Error saving quiz:", error);
        toast.showError("Failed to save quiz");
      }
    }
    setEditingQuizId(null);
    setNewQuizData({});
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Quiz App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            {quizzes.map((quiz) => (
              <IonCol size="12" sizeMd="6" key={quiz.id}>
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
                      {quiz.questionCount} questions
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>{quiz.description}</IonCardContent>

                  <div className="ion-text-right ion-padding-end ion-padding-bottom">
                    <IonButton
                      fill="clear"
                      color="light"
                      onClick={(e) => handleOpenEditModal(e, quiz.id)}
                    >
                      <IonIcon slot="icon-only" icon={create} />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={(e) => handleDeleteQuiz(e, quiz.id)}
                    >
                      <IonIcon slot="icon-only" icon={trash} />
                    </IonButton>
                  </div>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
      <div className="auth-footer">
        <p>
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Sign Up
          </Link>
        </p>
      </div>
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleOpenAddModal}>
          <IonIcon icon={add}></IonIcon>
        </IonFabButton>
      </IonFab>

      <IonModal
        ref={modal}
        isOpen={showModal}
        onWillDismiss={(event) => onWillDismiss(event)}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => modal.current?.dismiss(null, "cancel")}>
                Cancel
              </IonButton>
            </IonButtons>
            <IonTitle>{editingQuizId ? "Edit Quiz" : "Add New Quiz"}</IonTitle>
            <IonButtons slot="end">
              <IonButton
                strong={true}
                onClick={() => modal.current?.dismiss(newQuizData, "confirm")}
              >
                Confirm
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <AddQuizForm
            onQuizChange={(data) => setNewQuizData(data)}
            initialData={editingQuizId ? newQuizData : undefined}
          />
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Home;
