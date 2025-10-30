import express from'express';
import {get_question, get_feedback} from '../controllers/interview_controller.js';
const router = express.Router();

router.post('/question', get_question);
router.post('/feedback', get_feedback);

export default router;