// src/controllers/interview_controller.js

import {
  generateInterviewQuestions,
  evaluateInterviewAnswer
} from "../services/interview_service.js";

import interview from "../models/interview.js";

// ------------ controlador de generación de preguntas ------------

export async function generateQuestionsController(req, res) {
  try {
    const { // recupera del cuerpo de la solicitud los parametros ingresados por el usuario
      sessionId,
      role,
      level,
      section,
      amount_questions
    } = req.body;

    if (!sessionId) { // evalua que la session esté activa y haya cargado anteriormente el documento
      return res.status(400).json({
        error: "Debe existir una sesión activa con un documento cargado"
      });
    }

    if (!role || !level || !section || !amount_questions) { // evalua que no falte ningun parametro necesario
      return res.status(400).json({
        error: "Faltan parámetros obligatorios"
      });
    }

    const questions = await generateInterviewQuestions({ // genera una pregunta en base a los parametros del usuario
      sessionId,
      role,
      level,
      section,
      amount_questions
    });

    const newInterview = await interview.create({ // se crea una nueva interview
      session_id: sessionId,
      role,
      level,
      section,
      amount_questions,
      questions
    });

    return res.status(200).json({ // devuelve el ID de la entrevista actual y la pregunta generada
      interviewId: newInterview.id,
      questions
    });

  } catch (error) {
    console.error("Error al generar preguntas:", error.message);

    return res.status(500).json({
      error: error.message
    });
  }
}

// ------------ controlador de feedback ------------

export async function getFeedbackController(req, res) {
  try {
    const { interviewId, answer } = req.body; // recupera el ID de la interview actual y la respuesta del usuario

    if (!interviewId) { 
      return res.status(400).json({
        error: "Debe proporcionar interviewId"
      });
    }

    if (!answer) {
      return res.status(400).json({
        error: "Debe proporcionar la respuesta del usuario"
      });
    }

    const feedback = await evaluateInterviewAnswer({ // genera feedback en base al ID de la entrevista actual y la respuesta del usuario
      interviewId,
      answer
    });

    return res.status(200).json({ // devuelve el feedback al usuario
      feedback
    });

  } catch (error) {
    console.error("Error al generar feedback:", error.message);

    return res.status(500).json({
      error: error.message
    });
  }
}
