import axios from 'axios';
import { search_relevant_context } from './rag_service.js';

const CV_PATH = './src/data/Luciana_Altamirano_CV.pdf';

export async function generate_question(role, level) {
  try {
    const cv_experience = await search_relevant_context(
      `¿Qué experiencia tiene en ${role}?`,
      CV_PATH
    );

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions', // ruta a la API de OpenAI que recibira la solicitud
      { // comienzo del cuerpo de la solicitud
        model: 'gpt-4o-mini',
        messages: [ // definición de la conversación
          {
            role: 'system', // configura el comportamiento que cumplirá el modelo (entrevistador en este caso)
            content: 'Sos un entrevistador profesional que formula preguntas de entrevistas laborales.'
          },
          {
            role: 'user', // configura la instrucción que queremos que ejecute (generar una pregunta)
            content: `El candidato tiene esta experiencia: "${cv_experience}". Genera una sola pregunta para una entrevista de ${role} nivel ${level}. No agregues explicaciones ni respuestas.`
          },
        ],
      },
      {
        headers: { // config
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json', // indica que el contenido del cuerpo de la solicitud es de tipo JSON.
        },
      }
    );

    return response.data.choices[0].message.content; // respuesta generada
  } catch (error) {
    console.error('Error al generar pregunta: ', error.response?.data || error.message);
    return 'Error al generar la pregunta.';
  }
}

export async function evaluate_answer(question, answer){
  try {
    const cv_skills = await search_relevant_context(
      '¿Qué habilidades técnicas tiene el candidato?',
      CV_PATH
    );

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sos un entrevistador experto en tecnologia que evalua respuestas de candidatos de forma objetiva y constructiva.',
          },
          {
            role: 'user',
            content: `El candidato tiene estas habilidades según su CV: "${cv_skills}". Pregunta: "${question}"\nRespuesta del candidato: "${answer}"\nEvalúa brevemente la respuesta indicando si es adecuada, qué puntos fuertes tiene y cómo podría mejorar."`,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error al evaluar la respuesta: ', error.response?.data || error.message);
    return "Error al evaluar la respuestas";
  }
}