import {
    IonItem,
    IonInput,
    IonTextarea,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonListHeader,
    IonLabel,
    IonRadioGroup,
    IonRadio,
} from "@ionic/react";
import { addCircleOutline, trashOutline, addOutline } from "ionicons/icons";
import React, { useState, useEffect } from "react";
import { Question } from "../models/question";
import { Choice } from "../models/choice";
import { Quiz } from "../models/quiz";

interface AddQuizFormProps {
    onQuizChange: (quizData: Partial<Quiz>) => void;
    initialData?: Partial<Quiz>;
}

const AddQuizForm: React.FC<AddQuizFormProps> = ({ onQuizChange, initialData }) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);

    useEffect(() => {
        setTitle(initialData?.title || "");
        setDescription(initialData?.description || "");
        setQuestions(initialData?.questions || []);
    }, [initialData]);

    // Helper to bubble up changes
    const notifyParent = (t: string, d: string, q: Question[]) => {
        onQuizChange({
            title: t,
            description: d,
            questions: q,
        });
    };

    const handleTitleChange = (val: string) => {
        setTitle(val);
        notifyParent(val, description, questions);
    };

    const handleDescriptionChange = (val: string) => {
        setDescription(val);
        notifyParent(title, val, questions);
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            text: "",
            choices: [],
            correctChoiceId: "",
        };
        const updatedQuestions = [...questions, newQuestion];
        setQuestions(updatedQuestions);
        notifyParent(title, description, updatedQuestions);
    };

    const updateQuestionText = (id: string, text: string) => {
        const updatedQuestions = questions.map((q) =>
            q.id === id ? { ...q, text } : q,
        );
        setQuestions(updatedQuestions);
        notifyParent(title, description, updatedQuestions);
    };

    const removeQuestion = (id: string) => {
        const updatedQuestions = questions.filter((q) => q.id !== id);
        setQuestions(updatedQuestions);
        notifyParent(title, description, updatedQuestions);
    };

    const addChoice = (questionId: string) => {
        const updatedQuestions = questions.map((q) => {
            if (q.id === questionId) {
                const newChoice: Choice = {
                    id: Date.now().toString(),
                    text: "",
                };
                return { ...q, choices: [...q.choices, newChoice] };
            }
            return q;
        });
        setQuestions(updatedQuestions);
        notifyParent(title, description, updatedQuestions);
    };

    const updateChoiceText = (
        questionId: string,
        choiceId: string,
        text: string,
    ) => {
        const updatedQuestions = questions.map((q) => {
            if (q.id === questionId) {
                const updatedChoices = q.choices.map((c) =>
                    c.id === choiceId ? { ...c, text } : c,
                );
                return { ...q, choices: updatedChoices };
            }
            return q;
        });
        setQuestions(updatedQuestions);
        notifyParent(title, description, updatedQuestions);
    };

    const removeChoice = (questionId: string, choiceId: string) => {
        const updatedQuestions = questions.map((q) => {
            if (q.id === questionId) {
                return { ...q, choices: q.choices.filter((c) => c.id !== choiceId) };
            }
            return q;
        });
        setQuestions(updatedQuestions);
        notifyParent(title, description, updatedQuestions);
    };

    const setCorrectChoice = (questionId: string, choiceId: string) => {
        const updatedQuestions = questions.map((q) =>
            q.id === questionId ? { ...q, correctChoiceId: choiceId } : q,
        );
        setQuestions(updatedQuestions);
        notifyParent(title, description, updatedQuestions);
    };

    return (
        <IonContent className="ion-padding">
            <IonList>
                <IonListHeader>
                    <IonLabel>Basic Info</IonLabel>
                </IonListHeader>
                <IonItem>
                    <IonInput
                        label="Quiz Title"
                        labelPlacement="stacked"
                        placeholder="Enter quiz title"
                        value={title}
                        onIonInput={(e) => handleTitleChange(e.detail.value!)}
                    />
                </IonItem>
                <IonItem>
                    <IonTextarea
                        label="Description"
                        labelPlacement="stacked"
                        placeholder="Enter quiz description"
                        value={description}
                        onIonInput={(e) => handleDescriptionChange(e.detail.value!)}
                    />
                </IonItem>

                <IonListHeader>
                    <IonLabel>Questions</IonLabel>
                    <IonButton fill="clear" onClick={addQuestion}>
                        <IonIcon slot="icon-only" icon={addCircleOutline} />
                    </IonButton>
                </IonListHeader>

                {questions.map((q, qIndex) => (
                    <div
                        key={q.id}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            marginBottom: "16px",
                            padding: "8px",
                        }}
                    >
                        <IonItem lines="none">
                            <IonInput
                                label={`Question ${qIndex + 1}`}
                                labelPlacement="stacked"
                                placeholder="Enter question text"
                                value={q.text}
                                onIonInput={(e) => updateQuestionText(q.id, e.detail.value!)}
                            />
                            <IonButton
                                fill="clear"
                                color="danger"
                                slot="end"
                                onClick={() => removeQuestion(q.id)}
                            >
                                <IonIcon slot="icon-only" icon={trashOutline} />
                            </IonButton>
                        </IonItem>

                        <IonRadioGroup
                            value={q.correctChoiceId}
                            onIonChange={(e) => setCorrectChoice(q.id, e.detail.value)}
                        >
                            <IonListHeader>
                                <IonLabel>Choices</IonLabel>
                                <IonButton
                                    fill="clear"
                                    size="small"
                                    onClick={() => addChoice(q.id)}
                                >
                                    <IonIcon slot="start" icon={addOutline} />
                                    Add Choice
                                </IonButton>
                            </IonListHeader>

                            {q.choices.map((choice) => (
                                <IonItem key={choice.id}>
                                    <IonRadio slot="start" value={choice.id} />
                                    <IonInput
                                        placeholder="Choice text"
                                        value={choice.text}
                                        onIonInput={(e) =>
                                            updateChoiceText(q.id, choice.id, e.detail.value!)
                                        }
                                    />
                                    <IonButton
                                        fill="clear"
                                        color="danger"
                                        slot="end"
                                        onClick={() => removeChoice(q.id, choice.id)}
                                    >
                                        <IonIcon slot="icon-only" icon={trashOutline} />
                                    </IonButton>
                                </IonItem>
                            ))}
                        </IonRadioGroup>
                    </div>
                ))}
            </IonList>
        </IonContent>
    );
};

export default AddQuizForm;
