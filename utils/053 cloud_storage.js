import { Storage } from '@google-cloud/storage';
import { format } from 'util';
import env from '../config/env.js';;
import { v4 as uuidv4 } from 'uuid';
const uuid = uuidv4();


const storage = new Storage({
    projectId: env.PROJECT_ID,
    keyFilename: './serviceAccountKey.json'
});

const bucketName = env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);


/**
 * Subir el archivo a Firebase Storage
 * @param {File} file objeto que sera almacenado en Firebase Storage
 */

    export default async (file, pathImage) => {
        return new Promise((resolve, reject) => {
        
            // console.log('delete path', deletePathImage)
            // if (deletePathImage) {
    
            //     if (deletePathImage != null || deletePathImage != undefined) {
            //         const parseDeletePathImage = url.parse(deletePathImage)
            //         var ulrDelete = parseDeletePathImage.pathname.slice(23);
            //         const fileDelete = bucket.file(`${ulrDelete}`)
    
            //         fileDelete.delete().then((imageDelete) => {
    
            //             console.log('se borro la imagen con exito')
            //         }).catch(err => {
            //             console.log('Failed to remove photo, error:', err)
            //         });
    
            //     }
            // }
    
    
            if (pathImage) {
                console.log(`PA:${pathImage}`);
                if (pathImage != null || pathImage != undefined) {
    
                    let fileUpload = bucket.file(`${pathImage}`);
                    let stream = fileUpload.createWriteStream({metadata: {
                        contentType: 'image/png',
                        metadata: {
                            firebaseStorageDownloadTokens: uuid,
                        }
                    },
                    resumable: false});
    
        stream.on('error', (error) => {
            console.log('Error al subir archivo a firebase', error);
            reject('Something is wrong! Unable to upload at the moment.');
        });

        stream.on('finish', () => {
            // The public URL can be used to directly access the file via HTTP.
            const url = format(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media&token=${uuid}`);
            console.log('URL DE CLOUD STORAGE ', url);
            resolve(url);
        });

        stream.end(file.buffer);;
                }
            }
        });
}

