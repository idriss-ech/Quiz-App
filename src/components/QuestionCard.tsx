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
} from "@ionic/react";
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
          <IonList lines="none" style={{ padding: 0, margin: 0 }}>
            {question.choices.map((choice, index) => {
              const isSelected = selectedChoiceId === choice.id;
              const isCorrect = choice.id === question.correctChoiceId;

              let color = isSelected ? "tertiary" : "light";

              if (isAnswered) {
                if (isCorrect) {
                  color = "success";
                } else if (isSelected) {
                  color = "danger";
                }
              }

              return (
                <IonItem
                  key={choice.id}
                  color={color}
                  button={!isAnswered}
                  detail={false}
                  onClick={() => {
                    if (!isAnswered) {
                      onChoiceSelect(question.id, choice.id);
                    }
                  }}
                  style={{
                    borderRadius: "12px",
                    "--border-radius": "12px",
                    "--padding-start": "6px",
                    "--inner-padding-end": "14px",
                    "--inner-padding-start": "14px",
                    "--inner-padding-top": "12px",
                    "--inner-padding-bottom": "12px",
                    "--min-height": "56px",
                    marginBottom:
                      index === question.choices.length - 1 ? "0px" : "10px",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                  mode="ios"
                >
                  <IonRadio
                    slot="start"
                    value={choice.id}
                    disabled={isAnswered}
                    style={{
                      opacity: 1,
                      marginInlineEnd: "10px",
                    }}
                    mode="ios"
                  />
                  <span
                    style={{
                      display: "block",
                      flex: 1,
                      textAlign: "center",
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      lineHeight: "1.35",
                    }}
                  >
                    {choice.text}
                  </span>
                  <span
                    style={{
                      display: "block",
                      width: "22px",
                      flexShrink: 0,
                    }}
                  />
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
