// src/services/open_ai_service.js

import axios from "axios";

export async function generateQuestions({
    context,
    role,
    level,
    section,
    amount_questions,
}) {
    if (!context) {
      throw new Error("El contexto es obligatorio para generar preguntas");
    }

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions", // Ruta a la API de OpenAI que recibe la solicitud
        { // cuerpo de la solicitud
          model: "gpt-4o-mini",
          messages: [ 
            {
              role: "system", // configura el comportamiento que cumple el modelo (entrevistador en este caso)
              content:
                "Sos un entrevistador profesional que formula preguntas de entrevistas laborales.",
            },
            {
              role: "user", // configura la instrucción que queremos que ejecute en base a parametros pasados por usuario (generar preguntas)
              content: `
                El candidato tiene la siguiente experiencia según su CV:

                "${context}"

                Generá ${amount_questions} preguntas sobre la sección "${section}"
                para una entrevista de ${role} nivel ${level}.
                No agregues explicaciones ni respuestas.
              `,
            },
          ],
          max_tokens: 200, // define el limite de tokens para a respuesta
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json", // indica que el contenido de la request es JSON
          },
        }
      );

      return response.data.choices[0].message.content; // devuelve la pregunta generada
    } catch (error) {
      console.error(
        "Error al generar preguntas:",
        error.response?.data || error.message
      );
      throw error;
    }
}

export async function evaluateAnswer({ context, question, answer }) {
    if (!context) {
      throw new Error("El contexto es obligatorio para evaluar la respuesta");
    }

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Sos un entrevistador técnico senior. Das feedback claro, breve y directo.",
            },
            {
              role: "user",
              content: `
                Contexto del CV:
                "${context}"

                Pregunta:
                "${question}"

                Respuesta del candidato:
                "${answer}"

                Evaluá de forma clara y concisa la respuesta indicando si es adecuada,
                qué puntos fuertes tiene y cómo podría mejorar.
              `,
            },
          ],
          max_tokens: 250,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(
        "Error al evaluar la respuesta:",
        error.response?.data || error.message
      );
      throw error;
    }
}