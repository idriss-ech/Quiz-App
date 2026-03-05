import {
  IonBadge,
  IonContent,
  IonFooter,
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
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  useIonViewWillEnter,
} from "@ionic/react";
import { add, create, logOutOutline, play, trash } from "ionicons/icons";
import { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { Quiz } from "../models/quiz";
import { quizService } from "../services/QuizService";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import AddQuizForm from "../components/AddQuizForm";
import { useToast } from "../hooks/useToast";
import { authService } from "../services/AuthService";
import { gameService } from "../services/GameService";
import "./Home.css";

const Home: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editingQuizOwnerId, setEditingQuizOwnerId] = useState<string | null>(
    null,
  );
  const [newQuizData, setNewQuizData] = useState<Partial<Quiz>>({});

  const history = useHistory();
  const toast = useToast();
  const modal = useRef<HTMLIonModalElement>(null);
  const connectedUser = authService.isConnected();

  const isQuizOwner = (quiz: Quiz) =>
    !!connectedUser && quiz.ownerId === connectedUser.uid;

  const getQuestionCount = (quiz: Quiz) =>
    Array.isArray(quiz.questions) && quiz.questions.length > 0
      ? quiz.questions.length
      : (quiz.questionCount ?? 0);

  async function fetchQuizzes() {
    if (!connectedUser) {
      setQuizzes([]);
      return;
    }

    const data = await quizService.getAll(connectedUser.uid);
    setQuizzes(data);
  }

  useIonViewWillEnter(() => {
    fetchQuizzes();
  });

  function handleOpenAddModal() {
    if (!connectedUser) {
      toast.showError("Please sign in first.");
      return;
    }

    setEditingQuizId(null);
    setEditingQuizOwnerId(null);
    setNewQuizData({});
    setShowModal(true);
  }

  async function handleOpenEditModal(e: React.MouseEvent, quizId: string) {
    e.stopPropagation();

    if (!connectedUser) {
      toast.showError("Please sign in first.");
      return;
    }

    try {
      const fullQuiz = await quizService.get(quizId);
      if (fullQuiz) {
        if (!isQuizOwner(fullQuiz)) {
          toast.showError("You can only edit your own quizzes.");
          return;
        }

        setEditingQuizId(quizId);
        setEditingQuizOwnerId(fullQuiz.ownerId || connectedUser.uid);
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

  async function handleDeleteQuiz(e: React.MouseEvent, quiz: Quiz) {
    e.stopPropagation();

    if (!connectedUser) {
      toast.showError("Please sign in first.");
      return;
    }

    if (!isQuizOwner(quiz)) {
      toast.showError("You can only delete your own quizzes.");
      return;
    }

    try {
      await quizService.delete(quiz.id, connectedUser.uid);
      setQuizzes(quizzes.filter((q) => q.id !== quiz.id));
      toast.showSuccess("Quiz deleted successfully");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.showError("Failed to delete quiz");
    }
  }

  async function handleStartLive(e: React.MouseEvent, quiz: Quiz) {
    e.stopPropagation();

    if (!connectedUser) {
      toast.showError("Please sign in first.");
      return;
    }

    if (!isQuizOwner(quiz)) {
      toast.showError("You can only host your own quizzes.");
      return;
    }

    if (getQuestionCount(quiz) < 1) {
      toast.showError("This quiz needs at least one question.");
      return;
    }

    try {
      const session = await gameService.createSession(
        quiz.id,
        connectedUser.uid,
        connectedUser.displayName || connectedUser.email || "Admin",
      );

      history.push(`/host/${session.id}`);
      toast.showSuccess(`Live game created. Code: ${session.code}`);
    } catch (error) {
      console.error("Error creating live game:", error);
      toast.showError("Failed to start live game");
    }
  }

  async function onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    setShowModal(false);
    if (event.detail.role === "confirm") {
      if (!connectedUser) {
        toast.showError("Please sign in first.");
        return;
      }

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
            ownerId: editingQuizOwnerId || connectedUser.uid,
            questionCount: quizData.questions?.length ?? 0,
            questions: quizData.questions || [],
          };
          await quizService.update(updatedQuiz, connectedUser.uid);
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
            ownerId: connectedUser.uid,
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
    setEditingQuizOwnerId(null);
    setNewQuizData({});
  }

  async function handleLogout() {
    try {
      await authService.signOut();
      toast.showSuccess("Logged out successfully");
      history.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.showError("Failed to log out");
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Quiz App</IonTitle>
          {connectedUser && (
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon slot="icon-only" icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="home-content">
        <IonCard style={{ margin: "8px" }}>
          <IonCardHeader>
            <IonCardSubtitle>Welcome back</IonCardSubtitle>
            <IonCardTitle>Your quizzes</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              {quizzes.length > 0
                ? `You currently have ${quizzes.length} quiz${quizzes.length > 1 ? "zes" : ""}.`
                : "Create your first quiz to get started."}
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonGrid className="ion-no-padding">
          <IonRow>
            {quizzes.length === 0 && (
              <IonCol size="12">
                <IonCard style={{ margin: "8px" }}>
                  <IonCardHeader>
                    <IonCardTitle>No quizzes yet</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    Tap <strong>New Quiz</strong> or the + button to create one.
                  </IonCardContent>
                </IonCard>
              </IonCol>
            )}
            {quizzes.map((quiz) => (
              <IonCol size="12" sizeMd="6" key={quiz.id}>
                <IonCard
                  button={true}
                  style={{ borderRadius: "14px", margin: "8px" }}
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
                      <IonBadge color="primary">
                        {getQuestionCount(quiz)} questions
                      </IonBadge>
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>{quiz.description}</IonCardContent>

                  <div className="ion-text-right ion-padding-end ion-padding-bottom">
                    <IonButton
                      fill="clear"
                      color="tertiary"
                      onClick={(e) => handleStartLive(e, quiz)}
                      disabled={!isQuizOwner(quiz)}
                    >
                      <IonIcon slot="icon-only" icon={play} />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      color="primary"
                      onClick={(e) => handleOpenEditModal(e, quiz.id)}
                      disabled={!isQuizOwner(quiz)}
                    >
                      <IonIcon slot="icon-only" icon={create} />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={(e) => handleDeleteQuiz(e, quiz)}
                      disabled={!isQuizOwner(quiz)}
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
      <IonFooter className="home-action-footer">
        <IonToolbar>
          <div className="home-action-grid">
            <IonButton
              expand="block"
              fill="outline"
              className="home-action-btn"
              onClick={() => history.push("/join")}
            >
              Join Game
            </IonButton>
            <IonButton
              expand="block"
              className="home-action-btn"
              onClick={handleOpenAddModal}
            >
              <IonIcon slot="start" icon={add} />
              New Quiz
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>

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
