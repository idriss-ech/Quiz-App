import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonSpinner, IonText, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';
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
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonCard color="primary">
                        <IonCardHeader>
                            <IonCardSubtitle>{quiz.description}</IonCardSubtitle>
                            <IonCardTitle>{quiz.title}</IonCardTitle>
                        </IonCardHeader>
                    </IonCard>
                </IonHeader>

                <div className="ion-padding">
                    {quiz.questions.length === 0 ? (
                        <IonText color="medium"><p>No questions in this quiz yet.</p></IonText>
                    ) : (
                        quiz.questions.map(question => (
                            <QuestionCard
                                key={question.id}
                                question={question}
                                selectedChoiceId={answers[question.id]}
                                onChoiceSelect={handleChoiceSelect}
                            />
                        ))
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default QuizDetail;
