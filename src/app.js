import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import interview_routes from './routes/interview_routes.js';
// import news_routes from './routes/news_routes.js';
// import tips_routes from './routes/tips_routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json()); // permite recibir dato en JSON en el cuerpo de la request
app.use('/api/interview', interview_routes);
// app.use('/api/news', news_routes);
// app.use('/tips_routes', tips_routes);

// rutas
app.get('/', (req, res) => {
    res.json({message: 'InterviewCoach AI API is running'});
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});