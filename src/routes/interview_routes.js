import express from'express';
import {generateQuestionsController, getFeedbackController} from '../controllers/interview_controller.js';
const router = express.Router();

router.post('/question', generateQuestionsController);
router.post('/feedback', getFeedbackController);

export default router;