import { DataTypes } from "sequelize";
import { sequelize_connection } from "../database/conexion_mysql_db.js";

const interview = sequelize_connection.define("interview", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    session_id: {
        type: DataTypes.STRING,
        allowNull: false
    },

    role: {
        type: DataTypes.STRING,
        allowNull: false
    },

    level: {
        type: DataTypes.STRING,
        allowNull: false
    },

    section: {
        type: DataTypes.STRING,
        allowNull: false
    },

    amount_questions: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    questions: {
        type: DataTypes.TEXT, // puede ser largo
        allowNull: false
    },

    user_answer: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    ai_feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

export default interview;
