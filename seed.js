import { Sequelize, DataTypes } from 'sequelize';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
});

// Models
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

// Relations
Intervention.belongsTo(Technicien, { foreignKey: 'id_technicien' });
Intervention.belongsTo(Incident, { foreignKey: 'id_incident' });

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connected');

        await sequelize.sync({ force: true });
        console.log('Tables recreated');

        // =====================
        // TECHNICIENS (100 records)
        // =====================
        const techniciens = [];
        for (let i = 0; i < 100; i++) {
            techniciens.push({
                name: faker.person.lastName(),
                firstname: faker.person.firstName(),
                email: faker.internet.email(),
                phone: faker.phone.number()
            });
        }
        const createdTechniciens = await Technicien.bulkCreate(techniciens);

        // =====================
        // INCIDENTS (30 records)
        // =====================
        const incidents = [];
        for (let i = 0; i < 30; i++) {
            incidents.push({
                name: faker.company.name(),
                latitude: faker.location.latitude(),
                longitude: faker.location.longitude()
            });
        }
        const createdIncidents = await Incident.bulkCreate(incidents);

        // =====================
        // INTERVENTIONS (200 records)
        // =====================
        const interventions = [];
        for (let i = 0; i < 200; i++) {
            const randomTechnicien = createdTechniciens[Math.floor(Math.random() * createdTechniciens.length)];
            const randomIncident = createdIncidents[Math.floor(Math.random() * createdIncidents.length)];

            interventions.push({
                id_technicien: randomTechnicien.id,
                id_incident: randomIncident.id
            });
        }

        await Intervention.bulkCreate(interventions);

        console.log('🌱 Seeding completed successfully!');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
}

seed();