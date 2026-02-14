import { Quiz } from "../models/quiz";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { Question } from "../models/question";

class QuizService {
  private collectionName = "Quiz";

  // ==============================
  // GET ALL (NO QUESTIONS)
  // ==============================
  async getAll(): Promise<Quiz[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));

    return querySnapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data["title"],
        description: data["description"],
        questions: [],
      } as Quiz;
    });
  }

  // ==============================
  // GET ONE (WITH QUESTIONS)
  // ==============================
  async get(id: string): Promise<Quiz | undefined> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return undefined;

    const data = docSnap.data();

    const questionsRef = collection(db, this.collectionName, id, "Question");

    const questionsSnap = await getDocs(questionsRef);

    const questions: Question[] = questionsSnap.docs.map(
      (qDoc) =>
        ({
          id: qDoc.id,
          ...qDoc.data(),
        }) as Question,
    );

    return {
      id: docSnap.id,
      title: data["title"],
      description: data["description"],
      questions,
    };
  }

  // ==============================
  // ADD QUIZ + QUESTIONS
  // ==============================
  async add(quiz: Quiz): Promise<void> {
    const batch = writeBatch(db);

    const newQuizRef = doc(collection(db, this.collectionName));
    const quizId = newQuizRef.id;

    batch.set(newQuizRef, {
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.questions?.length ?? 0,
    });

    if (quiz.questions?.length) {
      quiz.questions.forEach((question) => {
        const questionRef = doc(
          db,
          this.collectionName,
          quizId,
          "Question",
          question.id,
        );

        batch.set(questionRef, {
          text: question.text,
          choices: question.choices,
          correctChoiceId: question.correctChoiceId,
        });
      });
    }

    await batch.commit();
  }

  // ==============================
  // UPDATE QUIZ + QUESTIONS
  // ==============================
  async update(updatedQuiz: Quiz): Promise<void> {
    const batch = writeBatch(db);

    const quizRef = doc(db, this.collectionName, updatedQuiz.id);

    batch.update(quizRef, {
      title: updatedQuiz.title,
      description: updatedQuiz.description,
      questionCount: updatedQuiz.questions.length,
    });

    const questionsRef = collection(
      db,
      this.collectionName,
      updatedQuiz.id,
      "Question",
    );

    const existingQuestionsSnap = await getDocs(questionsRef);
    const existingIds = existingQuestionsSnap.docs.map((d) => d.id);

    const updatedIds = updatedQuiz.questions.map((q) => q.id);

    // DELETE removed questions
    existingIds
      .filter((id) => !updatedIds.includes(id))
      .forEach((id) => {
        const qRef = doc(
          db,
          this.collectionName,
          updatedQuiz.id,
          "Question",
          id,
        );
        batch.delete(qRef);
      });

    // ADD or UPDATE questions
    updatedQuiz.questions.forEach((q) => {
      const qRef = doc(
        db,
        this.collectionName,
        updatedQuiz.id,
        "Question",
        q.id,
      );

      batch.set(qRef, {
        text: q.text,
        choices: q.choices,
        correctChoiceId: q.correctChoiceId,
      });
    });

    await batch.commit();
  }

  // ==============================
  // DELETE QUIZ + QUESTIONS
  // ==============================
  async delete(id: string): Promise<void> {
    const batch = writeBatch(db);

    const quizRef = doc(db, this.collectionName, id);

    const questionsRef = collection(db, this.collectionName, id, "Question");

    const questionsSnap = await getDocs(questionsRef);

    questionsSnap.forEach((qDoc) => {
      batch.delete(qDoc.ref);
    });

    batch.delete(quizRef);

    await batch.commit();
  }
}

export const quizService = new QuizService();
