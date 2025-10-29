import express from'express';
import get_question from '../controllers/interview_controller.js';
const router = express.Router();

router.post('/question', get_question);

export default router;