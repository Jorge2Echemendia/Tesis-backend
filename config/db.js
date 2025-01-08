import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const db = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        
        const url = `${connection.connection.host}:${connection.connection.port}`;
        console.log(`MongoDB Conectado en: ${url}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default db;