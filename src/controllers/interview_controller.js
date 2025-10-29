import generate_question from '../services/open_ai_service.js';

// ------------ Controlador para obtener una pregunta de entrevista ------------
export default async function get_question(request, response) {
    const { role, level } = request.body;

    if (!role || !level) {
        return response.status(400).json({ error: 'Debe proporcionar el rol y el nivel.' });
    }

    const question = await generate_question(role, level);

    response.json({ question });
}