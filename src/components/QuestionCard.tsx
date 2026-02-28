import React from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonIcon,
} from "@ionic/react";
import { checkmarkCircle, closeCircle } from "ionicons/icons";
import { Question } from "../models/question";

interface QuestionCardProps {
  question: Question;
  selectedChoiceId?: string;
  onChoiceSelect: (questionId: string, choiceId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedChoiceId,
  onChoiceSelect,
}) => {
  const isAnswered = !!selectedChoiceId;

  return (
    <IonCard
      className="question-card"
      style={{ borderRadius: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
    >
      <IonCardHeader>
        <IonCardTitle
          className="ion-text-center"
          style={{ fontSize: "1.2rem", fontWeight: "600" }}
        >
          {question.text}
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonRadioGroup
          value={selectedChoiceId}
          onIonChange={(e) => {
            // Prevent changing answer if already answered (though disabled inputs should prevent this)
            if (!isAnswered) {
              onChoiceSelect(question.id, e.detail.value);
            }
          }}
        >
          <IonList lines="none">
            {question.choices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id;
              const isCorrect = choice.id === question.correctChoiceId;

              let color = isSelected ? "tertiary" : "light";
              let icon = null;

              if (isAnswered) {
                if (isCorrect) {
                  color = "success";
                  icon = checkmarkCircle;
                } else if (isSelected) {
                  color = "danger";
                  icon = closeCircle;
                }
              }

              return (
                <IonItem
                  key={choice.id}
                  className="ion-margin-bottom"
                  color={color}
                  style={{ borderRadius: "12px", "--border-radius": "12px" }}
                  mode="ios"
                >
                  <IonRadio
                    slot="start"
                    value={choice.id}
                    disabled={isAnswered}
                    labelPlacement="end"
                    style={{ width: "100%", opacity: 1 }}
                    mode="ios"
                  >
                    {choice.text}
                  </IonRadio>
                  {icon && <IonIcon slot="end" icon={icon} />}
                </IonItem>
              );
            })}
          </IonList>
        </IonRadioGroup>
      </IonCardContent>
    </IonCard>
  );
};

export default QuestionCard;
