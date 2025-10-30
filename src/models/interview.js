import { DataTypes } from "sequelize";
import { sequelize_connection } from '../database/conexion_mysql_db.js';

const interview = sequelize_connection.define('interview',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        role: {
            type: DataTypes.STRING,
            allowNul: false
        },
        level : {
            type: DataTypes.STRING,
            allowNul: false
        },
        question: {
            type: DataTypes.STRING,
            allowNul: false
        },
        user_answer: {
            type: DataTypes.STRING,
            allowNul: false
        },
        ai_feedback: {
            type: DataTypes.JSON,
            allowNul: true,
        }
    }
);

export default interview;