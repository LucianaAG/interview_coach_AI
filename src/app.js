import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import interview_routes from './routes/interview_routes.js';
// import news_routes from './routes/news_routes.js';
// import tips_routes from './routes/tips_routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); // permite recibir datos en JSON en el body de la request
app.use('/api/interview', interview_routes);
// app.use('/api/news', news_routes);
// app.use('/tips_routes', tips_routes);

// rutas
app.get('/', (req, res) => {
    res.json({message: 'InterviewCoach AI API is running'});
});

// ------------------ Base de Datos ------------------
import {sequelize_connection, ensure_database} from './database/conexion_mysql_db.js';

const PORT = process.env.PORT || 5000; // Cambiado a puerto 5000 por defecto

(
    async() => {
        try {
            await ensure_database();
            await sequelize_connection.sync();
            console.log('Base de datos y tablas listas');

            // Solo una llamada a listen, después de la inicialización de la BD
            app.listen(PORT, () => {
                console.log('Servidor corriendo en el puerto: ' + PORT);
            });
        } catch (error) {
            console.error('Error al inicializar la BD: ', error);
        }
})();