import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonSpinner, IonText, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonModal, IonFooter, IonIcon } from '@ionic/react';
import { arrowBack, arrowForward, checkmarkDone } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Quiz } from '../models/quiz';
import { quizService } from '../services/QuizService';
import QuestionCard from '../components/QuestionCard';
import AddQuizForm from '../components/AddQuizForm';

const QuizDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [quiz, setQuiz] = useState<Quiz | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [pendingUpdate, setPendingUpdate] = useState<Partial<Quiz>>({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
        setAnswers(prev => ({
            ...prev,
            [questionId]: choiceId
        }));
    };

    if (loading) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/home" />
                        </IonButtons>
                        <IonTitle>Loading...</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-text-center ion-padding">
                    <IonSpinner />
                </IonContent>
            </IonPage>
        );
    }

    if (!quiz) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/home" />
                        </IonButtons>
                        <IonTitle>Error</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <IonText color="danger">
                        <h2>Quiz not found</h2>
                    </IonText>
                </IonContent>
            </IonPage>
        );
    }

    const handleUpdateQuiz = async (updatedData: Partial<Quiz>) => {
        if (!quiz) return;

        const updatedQuiz: Quiz = {
            ...quiz,
            ...updatedData,
            // Ensure we keep the ID
            id: quiz.id
        };

        try {
            await quizService.update(updatedQuiz);
            setQuiz(updatedQuiz);
            setShowEditModal(false);
        } catch (error) {
            console.error("Failed to update quiz:", error);
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>{quiz.title}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => setShowEditModal(true)}>
                            Edit
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div className="ion-padding">
                    {quiz.questions.length === 0 ? (
                        <IonText color="medium"><p>No questions in this quiz yet.</p></IonText>
                    ) : (
                        <>
                            <div className="ion-text-center ion-margin-bottom">
                                <IonText color="medium">
                                    <p>Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                                </IonText>
                            </div>

                            <QuestionCard
                                key={quiz.questions[currentQuestionIndex].id}
                                question={quiz.questions[currentQuestionIndex]}
                                selectedChoiceId={answers[quiz.questions[currentQuestionIndex].id]}
                                onChoiceSelect={handleChoiceSelect}
                            />
                        </>
                    )}
                </div>

                <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
                    <IonHeader>
                        <IonToolbar>
                            <IonButtons slot="start">
                                <IonButton onClick={() => setShowEditModal(false)}>Cancel</IonButton>
                            </IonButtons>
                            <IonTitle>Edit Quiz</IonTitle>
                            <IonButtons slot="end">
                                <IonButton strong={true} onClick={() => {
                                    handleUpdateQuiz(pendingUpdate || {});
                                }}>
                                    Save
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        {quiz && (
                            <AddQuizForm
                                initialData={quiz}
                                onQuizChange={(data) => setPendingUpdate(data)}
                            />
                        )}
                    </IonContent>
                </IonModal>
            </IonContent>

            {quiz.questions.length > 0 && (
                <IonFooter>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            >
                                <IonIcon slot="start" icon={arrowBack} />
                                Prev
                            </IonButton>
                        </IonButtons>
                        <IonTitle size="small" className="ion-text-center">
                            {currentQuestionIndex + 1} / {quiz.questions.length}
                        </IonTitle>
                        <IonButtons slot="end">
                            <IonButton
                                onClick={() => {
                                    if (currentQuestionIndex < quiz.questions.length - 1) {
                                        setCurrentQuestionIndex(prev => prev + 1);
                                    }
                                }}
                            >
                                {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish' : 'Next'}
                                <IonIcon slot="end" icon={currentQuestionIndex === quiz.questions.length - 1 ? checkmarkDone : arrowForward} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonFooter>
            )}
        </IonPage>
    );
};

export default QuizDetail;
