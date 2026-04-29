import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;

async function init() {
    // 1. Connect to MySQL server (no DB selected)
    const sequelizeRoot = new Sequelize('', DB_USER, DB_PASS, {
        host: DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
    });

    // 2. Create database if it doesn't exist
    await sequelizeRoot.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    console.log('Database ready');

    // 3. Connect to the created database
    const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
        host: DB_HOST,
        dialect: 'mysql',
        logging: false
    });

    // 4. Models
    const Technicien = sequelize.define('technicien', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        firstname: DataTypes.STRING,
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
    });

    const Incident = sequelize.define('incident', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        latitude: DataTypes.FLOAT,
        longitude: DataTypes.FLOAT
    });

    const Intervention = sequelize.define('intervention', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
    });

    // 5. Relations (recommended)
    Intervention.belongsTo(Technicien, { foreignKey: 'id_technicien' });
    Intervention.belongsTo(Incident, { foreignKey: 'id_incident' });

    // 6. Connect & sync
    await sequelize.authenticate();
    console.log('Connected to MySQL');

    await sequelize.sync({ alter: true }); // updates tables if needed
    console.log('Tables created/updated');
}

init().catch(console.error);