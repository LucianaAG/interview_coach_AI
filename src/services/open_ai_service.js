import axios from 'axios'; // libreria para hacer solicitudes a APIs externas

/** JSDoc
 * 
 * @param {string} role - Rol del puesto (ej: "Backend Developer")
 * @param {string} level - Nivel del puesto (ej: "Junior")
 * @returns {string} - La pregunta generada por GPT
 */

export async function generate_question(role, level) {
  try {
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
            content: `Genera una sola pregunta para una entrevista de ${role} nivel ${level}. No agregues explicaciones ni respuestas.`
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
            content: `Pregunta: ${question}"\nRespuesta del candidato: "${answer}"\nEvalúa brevemente la respuesta indicando si es adecuada, qué puntos fuertes tiene y cómo podría mejorar."`,
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