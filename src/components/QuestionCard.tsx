import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup } from '@ionic/react';
import React from 'react';
import { Question } from '../models/question';

interface QuestionCardProps {
    question: Question;
    selectedChoiceId?: string;
    onChoiceSelect: (questionId: string, choiceId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedChoiceId, onChoiceSelect }) => {
    return (
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>{question.text}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <IonRadioGroup
                    value={selectedChoiceId}
                    onIonChange={e => onChoiceSelect(question.id, e.detail.value)}
                >
                    <IonList>
                        {question.choices.map(choice => (
                            <IonItem key={choice.id}>
                                <IonRadio value={choice.id} labelPlacement="end">{choice.text}</IonRadio>
                            </IonItem>
                        ))}
                    </IonList>
                </IonRadioGroup>
            </IonCardContent>
        </IonCard>
    );
};

export default QuestionCard;
