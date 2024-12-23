import mongoose from 'mongoose';

const ConnectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL||"");
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

export default ConnectDb;