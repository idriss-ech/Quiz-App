import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Quiz } from "../models/quiz";

export type GameStatus = "lobby" | "in_progress" | "finished";

export interface GameSession {
  id: string;
  code: string;
  quizId: string;
  adminId: string;
  adminName: string;
  status: GameStatus;
  currentQuestionIndex: number;
  completedQuestionIndexes: number[];
  createdAt: number;
}

export interface GamePlayer {
  id: string;
  name: string;
  score: number;
  joinedAt: number;
}

class GameService {
  private collectionName = "GameSession";

  private generateCode(length = 6): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let index = 0; index < length; index++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private async generateUniqueCode(): Promise<string> {
    let code = this.generateCode();
    let exists = true;

    while (exists) {
      const sessionsQuery = query(
        collection(db, this.collectionName),
        where("code", "==", code),
        limit(1),
      );
      const snapshot = await getDocs(sessionsQuery);
      exists = !snapshot.empty;
      if (exists) {
        code = this.generateCode();
      }
    }

    return code;
  }

  async createSession(
    quizId: string,
    adminId: string,
    adminName: string,
  ): Promise<GameSession> {
    const code = await this.generateUniqueCode();

    const sessionData = {
      code,
      quizId,
      adminId,
      adminName,
      status: "lobby" as GameStatus,
      currentQuestionIndex: 0,
      completedQuestionIndexes: [],
      createdAt: Date.now(),
    };

    const ref = await addDoc(collection(db, this.collectionName), sessionData);

    return {
      id: ref.id,
      ...sessionData,
    };
  }

  async findSessionByCode(codeInput: string): Promise<GameSession | undefined> {
    const normalizedCode = codeInput.trim().toUpperCase();
    if (!normalizedCode) return undefined;

    const sessionsQuery = query(
      collection(db, this.collectionName),
      where("code", "==", normalizedCode),
      limit(1),
    );

    const snapshot = await getDocs(sessionsQuery);
    if (snapshot.empty) return undefined;

    const sessionDoc = snapshot.docs[0];
    const data = sessionDoc.data() as Omit<GameSession, "id">;

    if (data.status === "finished") return undefined;

    return {
      id: sessionDoc.id,
      ...data,
    };
  }

  subscribeSession(
    sessionId: string,
    callback: (session: GameSession | undefined) => void,
  ): () => void {
    return onSnapshot(doc(db, this.collectionName, sessionId), (snapshot) => {
      if (!snapshot.exists()) {
        callback(undefined);
        return;
      }

      callback({
        id: snapshot.id,
        ...(snapshot.data() as Omit<GameSession, "id">),
      });
    });
  }

  subscribePlayers(
    sessionId: string,
    callback: (players: GamePlayer[]) => void,
  ): () => void {
    return onSnapshot(
      collection(db, this.collectionName, sessionId, "players"),
      (snapshot) => {
        const players = snapshot.docs
          .map(
            (playerDoc) =>
              ({
                id: playerDoc.id,
                ...(playerDoc.data() as Omit<GamePlayer, "id">),
              }) as GamePlayer,
          )
          .sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt);

        callback(players);
      },
    );
  }

  async addPlayer(sessionId: string, name: string): Promise<GamePlayer> {
    const playerRef = doc(
      collection(db, this.collectionName, sessionId, "players"),
    );

    const playerData = {
      name: name.trim(),
      score: 0,
      joinedAt: Date.now(),
    };

    await setDoc(playerRef, playerData);

    return {
      id: playerRef.id,
      ...playerData,
    };
  }

  async startSession(sessionId: string): Promise<void> {
    await updateDoc(doc(db, this.collectionName, sessionId), {
      status: "in_progress",
      currentQuestionIndex: 0,
    });
  }

  async submitAnswer(
    sessionId: string,
    playerId: string,
    questionIndex: number,
    choiceId: string,
  ): Promise<void> {
    const answerRef = doc(
      db,
      this.collectionName,
      sessionId,
      "answers",
      `${playerId}_${questionIndex}`,
    );

    await setDoc(answerRef, {
      playerId,
      questionIndex,
      choiceId,
      submittedAt: Date.now(),
    });
  }

  async getSubmittedAnswer(
    sessionId: string,
    playerId: string,
    questionIndex: number,
  ): Promise<string | undefined> {
    const answerRef = doc(
      db,
      this.collectionName,
      sessionId,
      "answers",
      `${playerId}_${questionIndex}`,
    );

    const answerDoc = await getDoc(answerRef);
    if (!answerDoc.exists()) return undefined;

    const data = answerDoc.data() as { choiceId?: string };
    return data.choiceId;
  }

  async advanceQuestion(sessionId: string, quiz: Quiz): Promise<void> {
    const sessionRef = doc(db, this.collectionName, sessionId);
    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) return;

    const sessionData = sessionDoc.data() as Omit<GameSession, "id">;
    if (sessionData.status !== "in_progress") return;

    const currentIndex = sessionData.currentQuestionIndex;
    const currentQuestion = quiz.questions[currentIndex];
    if (!currentQuestion) {
      await updateDoc(sessionRef, { status: "finished" });
      return;
    }

    if (!sessionData.completedQuestionIndexes?.includes(currentIndex)) {
      const answersQuery = query(
        collection(db, this.collectionName, sessionId, "answers"),
        where("questionIndex", "==", currentIndex),
      );

      const answersSnapshot = await getDocs(answersQuery);
      const batch = writeBatch(db);

      answersSnapshot.forEach((answerDoc) => {
        const answerData = answerDoc.data() as {
          playerId: string;
          choiceId: string;
        };

        if (answerData.choiceId === currentQuestion.correctChoiceId) {
          const playerRef = doc(
            db,
            this.collectionName,
            sessionId,
            "players",
            answerData.playerId,
          );

          batch.update(playerRef, {
            score: increment(1),
          });
        }
      });

      batch.update(sessionRef, {
        completedQuestionIndexes: arrayUnion(currentIndex),
      });

      await batch.commit();
    }

    const isLastQuestion = currentIndex >= quiz.questions.length - 1;

    if (isLastQuestion) {
      await updateDoc(sessionRef, {
        status: "finished",
      });
      return;
    }

    await updateDoc(sessionRef, {
      currentQuestionIndex: currentIndex + 1,
    });
  }
}

export const gameService = new GameService();
