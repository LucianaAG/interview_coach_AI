import axios from 'axios';

/**
 * 
 * @param {string} role - Rol del puesto (ej: "Backend Developer")
 * @param {string} level - Nivel del puesto (ej: "Junior")
 * @returns {string} - La pregunta generada por GPT
 */

export default async function generate_question(role, level) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions', // ✅ URL CORRECTA
      {
        model: 'gpt-4o-mini', // corregido: era 'gpt-40-mini'
        messages: [
          {
            role: 'system',
            content: 'Sos un entrevistador profesional que formula preguntas de entrevistas laborales.'
          },
          {
            role: 'user',
            content: `Genera una sola pregunta para una entrevista de ${role} nivel ${level}. No agregues explicaciones ni respuestas.`
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

    return response.data.choices[0].message.content; // corregido: era "conten"
  } catch (error) {
    console.error('Error al generar pregunta: ', error.response?.data || error.message);
    return 'Error al generar la pregunta.';
  }
}