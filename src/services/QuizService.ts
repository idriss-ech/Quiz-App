import { Quiz } from '../models/quiz';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, writeBatch } from 'firebase/firestore';
class QuizService {

    private collectionName = 'Quiz';

    async getAll(): Promise<Quiz[]> {
        const querySnapshot = await getDocs(collection(db, this.collectionName));
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data['title'],
                description: data['description'],
                questions: data['questions'] || []
            } as Quiz;
        });
    }

    async get(id: string): Promise<Quiz | undefined> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                title: data['title'],
                description: data['description'],
                questions: data['questions'] || []
            } as Quiz;
        } else {
            return undefined;
        }
    }

    async add(quiz: Quiz): Promise<void> {
        const batch = writeBatch(db);

        // 1. Create reference for the new Quiz
        const newQuizRef = doc(collection(db, this.collectionName));
        const quizId = newQuizRef.id;

        // 2. Prepare Quiz data (excluding questions if we store them in subcollection, 
        //    but let's keep basic info)
        batch.set(newQuizRef, {
            title: quiz.title,
            description: quiz.description,
            // We can store question count or empty array if we mirror data
            questions: []
        });

        // 3. Add Questions as a subcollection 'Question' (SINGULAR based on user hint)
        // Note: The user mentioned "Choice Question Quiz", so likely hierarchy is:
        // Quiz (doc) -> Question (subcollection)
        if (quiz.questions && quiz.questions.length > 0) {
            quiz.questions.forEach(question => {
                const newQuestionRef = doc(collection(db, this.collectionName, quizId, 'Question'));
                batch.set(newQuestionRef, {
                    text: question.text,
                    choices: question.choices, // Storing choices directly in Question doc
                    correctChoiceId: question.correctChoiceId
                });
            });
        }

        // 4. Commit the batch
        await batch.commit();
    }

    async delete(id: string): Promise<void> {
        // TODO: Implémenter delete avec Firestore
    }

    async update(updatedQuiz: Quiz): Promise<void> {
        // TODO: Implémenter update avec Firestore
    }
}

export const quizService = new QuizService();
