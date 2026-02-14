import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonSpinner, IonText, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton, IonFooter, IonIcon, IonGrid, IonRow, IonCol } from '@ionic/react';
import { arrowForward, checkmarkDone, home, trophy } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Quiz } from '../models/quiz';
import { quizService } from '../services/QuizService';
import QuestionCard from '../components/QuestionCard';

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
        setAnswers(prev => ({
            ...prev,
            [questionId]: choiceId
        }));
    };

    const handleFinish = () => {
        if (!quiz) return;
        let correctCount = 0;
        quiz.questions.forEach(q => {
            if (answers[q.id] === q.correctChoiceId) {
                correctCount++;
            }
        });
        setScore(correctCount);
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

    if (score !== null) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/home" />
                        </IonButtons>
                        <IonTitle>Result</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding ion-text-center">
                    <div style={{ marginTop: '50px' }}>
                        <IonIcon icon={trophy} color="warning" style={{ fontSize: '80px' }} />
                        <h1>Quiz Completed!</h1>
                        <h2 className="ion-margin-top">Your Score</h2>
                        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
                            {score} / {quiz.questions.length}
                        </h1>
                        <p className="ion-margin-bottom">
                            {score === quiz.questions.length ? 'Perfect Score! 🎉' : 'Good job! Keep learning.'}
                        </p>

                        <IonButton routerLink="/home" expand="block" className="ion-margin-top">
                            <IonIcon slot="start" icon={home} />
                            Back to Home
                        </IonButton>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" />
                    </IonButtons>
                    <IonTitle>{quiz.title}</IonTitle>
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
            </IonContent>

            {quiz.questions.length > 0 && (
                <IonFooter>
                    <IonToolbar>
                        <IonButtons slot="end">
                            <IonButton
                                onClick={() => {
                                    if (currentQuestionIndex < quiz.questions.length - 1) {
                                        setCurrentQuestionIndex(prev => prev + 1);
                                    } else {
                                        handleFinish();
                                    }
                                }}
                                fill="solid"
                                color="primary"
                                style={{ margin: '0 16px', minWidth: '120px' }}
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
