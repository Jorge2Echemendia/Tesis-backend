import { env } from '../config/env/env.js';
import { Storage } from '@google-cloud/storage';
import { format } from 'util';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage({
    projectId: env.PROJECT_ID,
    keyFilename: './serviceAccountKey.json'
});

const bucketName = env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

async function deleteFile(filePath) {
    const fileToDelete = bucket.file(filePath);
    try {
        await fileToDelete.delete();
        console.log('Se borró la imagen con éxito');
    } catch (error) {
        console.error('Failed to remove photo:', error);
    }
}

async function uploadFile(filePath) {
    const fileUpload = bucket.file(filePath);
    const stream = fileUpload.createWriteStream();
    const blobStream = stream.pipe(fileUpload.createWriteStream({
        metadata: {
            contentType: 'image/png',
            firebaseStorageDownloadTokens: uuidv4(),
        },
        resumable: false
    }));

    blobStream.on('error', (error) => {
        console.error('Error al subir archivo:', error);
        throw new Error('No se pudo subir el archivo');
    });

    blobStream.on('finish', () => {
        const url = format(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media&token=${uuidv4()}`);
        console.log('URL DE CLOUD STORAGE:', url);
    });

    blobStream.end(file.buffer);
}

export { deleteFile, uploadFile };