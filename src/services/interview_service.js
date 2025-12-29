// src/services/interview_service.js

import { getContextForSession } from "./rag_service.js";
import { generateQuestions, evaluateAnswer} from "./open_ai_service.js";
import interview from "../models/interview.js";

export async function generateInterviewQuestions({
      sessionId,
      role,
      level,
      section,
      amount_questions
    }) {
      if (!sessionId) {
        throw new Error(" el sessionId es obligatorio");
      }

      const ragQuery = `Experiencia del candidato relacionada con ${role} y sección ${section}`; // query para la busqueda por similitud en el vectorStore

      const context = await getContextForSession(sessionId, ragQuery); // contexto generado para la generación de preguntas

      const questions = await generateQuestions({ // el modelo genera una pregunta en base al contexto 
                                                  // generado del RAG y los parametros pasados por el usuario
        context,
        role,
        level,
        section,
        amount_questions
      });

      return questions; // retorno de la pregunta generada
}


export async function evaluateInterviewAnswer({
  interviewId,
  answer
}) {
      if (!interviewId) {
        throw new Error("interviewId es obligatorio");
      }

      if (!answer) {
        throw new Error("La respuesta del usuario es obligatoria");
      }

      const interviewRecord = await interview.findByPk(interviewId);

      if (!interviewRecord) {
        throw new Error("Entrevista no encontrada");
      }

      const {
        session_id: sessionId,
        questions
      } = interviewRecord;

      const context = await getContextForSession(
        sessionId,
        "Habilidades técnicas y experiencia del candidato"
      );

      const feedback = await evaluateAnswer({
        context,
        question: questions,
        answer
      });
      
      await interviewRecord.update({
        user_answer: answer,
        ai_feedback: feedback
      });

      return feedback;
}
