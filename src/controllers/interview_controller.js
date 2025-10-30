import {generate_question, evaluate_answer} from '../services/open_ai_service.js';
let last_question = '';

// ------------ Controlador para obtener una pregunta de entrevista ------------
export async function get_question(request, response) {
    const { role, level } = request.body;

    if (!role || !level) {
        return response.status(400).json({ error: 'Debe proporcionar el rol y el nivel.' });
    }
     last_question = await  generate_question(role, level);
    response.json({ question: last_question });
};

export async function get_feedback(request, response){
    const {question, answer} = request.body;

    if (!question) {
        return response.status(400).json({error: 'No se ha generado una pregunta previa'});        
    }

    if (!answer) {
        return response.status(400).json({error: 'Debe proporcionar la respuesta'})
    }

    const feedback = await evaluate_answer(last_question, answer);

    response.json({feedback});
};