import { response } from 'express';
import { app, db, storage } from './firebaseconfig.js'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, collection, getDoc, updateDoc, getDocs } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL, list } from "firebase/storage";
import axios from 'axios';
import {VertexAI} from '@google-cloud/vertexai';

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

const registerHandler = async (request, h) => {
    const {email, password, namalengkap, tanggallahir, jeniskelamin, alamat, nomortelp} = request.payload;
    let success = false;
    const user = await createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    success = true;
    return user;
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    return errorMessage;
  });

  const response = h.response({
    user
  })
  const uid = user.uid;
  if(success){
    try{
        const docref = doc(db, 'users', uid); // 'users' is the collection, 'userId123' is the document ID
        await setDoc(docref, { 
            email: email,
            namalengkap: namalengkap,
            tanggallahir: tanggallahir,
            jeniskelamin: jeniskelamin,
            alamat: alamat,
            nomortelp: nomortelp
         });}
    catch (e){
        console.log(e);
    }
  }
  response.code(200);
  return response;
}

const loginHandler = async (request, h) => {
    const {email, password} = request.payload;
    const user = await signInWithEmailAndPassword(auth, email, password) 
  .then((userCredential) => {
    console.log(userCredential.user.uid)
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    const response = h.response({
      status: "error"
    })
    response.code(500);
    return response;
  });
  const response = h.response({
    status: "success"
  })
  response.code(200)
  return response
}

const userUploadPhoto = async (request, h) => {
  const data = request.payload;
  const { uid } = request.payload;
  let success = false
  if (!data.userPhoto) {
    return h.response({ message: 'No file uploaded' }).code(400);
  }

  const userPhoto = data.userPhoto;

  // Membuat referensi ke Firebase Storage
  const fotoRef = ref(storage, `userPhoto/${userPhoto.hapi.filename}`);

  // Unggah file ke Firebase Storage
  try {
    await uploadBytes(fotoRef, userPhoto._data); // Gunakan _data untuk file buffer
    console.log('Uploaded a blob or file!');
    success = true;
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return h.response({ message: 'Failed to upload photo' }).code(500);
  }
  if(success){
    try{
      const userDocRef = doc(db, `users/${uid}`);

      // Update the document with the new field
      await updateDoc(userDocRef, {
        photo: userPhoto.hapi.filename,
      });
    }
    catch (e){
        console.log(e);
    }
  }
  const response = h.response({
    message: 'File uploaded successfully',
    fileName: userPhoto.hapi.filename
  });
  response.code(200);
  return response;
};

const registerBayiHandler = async (request, h) => {
  const {uid, namalengkapbayi, tanggallahirbayi, jeniskelaminbayi, tinggibadanbayi, beratbadanbayi, lingkarlenganbayi} = request.payload;
  const date = Date.now() - new Date(tanggallahirbayi).getTime()
  function calculateAge(diffMilliseconds) {
    const millisecondsInYear = 365.25 * 24 * 60 * 60 * 1000; // Milliseconds in a year
    const age = (diffMilliseconds / millisecondsInYear); // Convert to years and round down
  
    return age;
  }
  var babyAge = calculateAge(date);
  var babyMonth = Math.floor((babyAge%1)*12);
  var babyYear = Math.floor(babyAge);
  const usiabayistring = `${babyYear} Tahun, ${babyMonth} Bulan`
  const usiabayi= babyYear;

  try{
      const docref = doc(db, `users/${uid}/bayi/${namalengkapbayi}`); // 'users' is the collection, 'userId123' is the document ID
      const bayi = await setDoc (docref, { 
          namalengkapbayi: namalengkapbayi,
          tanggallahirbayi: tanggallahirbayi,
          usiabayi: usiabayi,
          usiabayistring: usiabayistring,
          jeniskelaminbayi: jeniskelaminbayi,
          tinggibadanbayi: tinggibadanbayi,
          beratbadanbayi: beratbadanbayi,
          lingkarlenganbayi: lingkarlenganbayi
       });
  const response = h.response({
    status: "success"
  })
  response.code(200);
  return response;
  }
       
  catch (e){
    console.log(e);
    const response = h.response({
      e
    })
    response.code(200);
    return response;
  }

}

const getUsersHandler = async (request, h) => {
  const { uid } = request.params; // Mengambil email dari parameter URL

  try {
      // Referensi ke dokumen spesifik berdasarkan email
      const userDocRef = doc(db, 'users', uid);

      // Mengambil data dokumen
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
          const userData = userDoc.data();

          // Default URL foto profil (jika tidak ada foto)
          let photoURL = null;

          if (userData.photo) {
              // Ambil URL file dari Firebase Storage
              const photoRef = ref(storage, `userPhoto/${userData.photo}`);
              try {
                  photoURL = await getDownloadURL(photoRef);
              } catch (error) {
                  console.error('Error fetching photo URL:', error);
              }
          }

          return h.response({
              status: 'success',
              data: {
                  ...userData,
                  photoURL, // Menambahkan URL foto profil ke response
              },
          }).code(200);
      } else {
          // Jika dokumen tidak ditemukan
          return h.response({
              status: 'fail',
              message: 'User not found',
          }).code(404);
      }
  } catch (error) {
      console.error('Error fetching user:', error);

      // Response error
      return h.response({
          status: 'error',
          message: 'Failed to fetch user data',
          error: error.message,
      }).code(500);
  }
};

const homeHandler = async (request, h) => {
  const { uid } = request.payload;
  try {
    const userColRef = collection(db, 'users', uid, 'bayi');

    const listnamabayi = await getDocs(userColRef);

    // Referensi ke dokumen spesifik berdasarkan email
    // const userDocRef = doc(db, 'users', uid, 'bayi', namalengkapbayi);

    // Mengambil data dokumen
    // const userDoc = await getDoc(userDocRef);
    let parseNamaBayi = listnamabayi.docs.map(doc => ({
      id: doc.id, // ID dokumen
      ...doc.data(), // Isi data dokumen
    }));

    const articleDocRef = collection(db, 'articles');

    // Mengambil data dokumen
    const dataArticle = await getDocs(articleDocRef);

    let listArticle = dataArticle.docs.map(doc => ({
      ...doc.data(), // Isi data dokumen
    }));

    if (parseNamaBayi) {      
        const predict_url = "https://capstoneimage1-1012812118697.asia-southeast2.run.app/predict";

        parseNamaBayi = await Promise.all(
          parseNamaBayi.map(async (bayi) => {
            try {
              const predict = await axios.post(predict_url, {
                usia: bayi.usiabayi,
                berat: bayi.beratbadanbayi,
                tinggi: bayi.tinggibadanbayi,
                lila: bayi.lingkarlenganbayi,
                jk: bayi.jeniskelaminbayi,
              });
        
              // Add the prediction data to the bayi object
              return {
                ...bayi,
                prediction: predict.data,
              };
            } catch (error) {
              console.error(`Error predicting for ${bayi.namalengkapbayi}:`, error.message);
        
              // Add an error message to the bayi object
              return {
                ...bayi,
                prediction: { error: error.message },
                listArticle
              };
            }
          })
        );
        
        // Return the updated response with predictions
        return h.response({
          status: "success",
          bayi: parseNamaBayi,
          listArticle: listArticle,
        }).code(200);
    } else {
        // Jika dokumen tidak ditemukan
        return h.response({
            status: 'fail',
            message: 'User not found',
        }).code(404);
    }
} catch (error) {
    console.error('Error fetching user:', error);

    // Response error
    return h.response({
        status: 'error',
        message: 'Failed to fetch user data',
        error: error.message,
    }).code(500);
}

};

const updateStatusBayi = async (request, h) => {
  const { 
    uid, 
    namalengkapbayibaru, 
    tanggallahirbayibaru, 
    beratbadanbayibaru, 
    tinggibadanbayibaru, 
    lingkarlenganbayibaru,
  } = request.payload;

  // Hitung usia bayi berdasarkan tanggal lahir yang baru
  const dateDifference = Date.now() - new Date(tanggallahirbayibaru).getTime();
  
  function calculateAge(diffMilliseconds) {
    const millisecondsInYear = 365.25 * 24 * 60 * 60 * 1000; // Milliseconds in a year
    const age = diffMilliseconds / millisecondsInYear; // Convert to years
    return age;
  }
   
  const babyAge = calculateAge(dateDifference);
  const babyMonth = Math.floor((babyAge % 1) * 12);
  const babyYear = Math.floor(babyAge);
  const usiabayistringbaru = `${babyYear} Tahun, ${babyMonth} Bulan`;
  const usiabayibaru = babyYear;
  
  try {
    // Referensi ke dokumen bayi
    const docRef = doc(db, `users/${uid}/bayi/${namalengkapbayibaru}`);

    const data = await getDoc(docRef);

    const dataBayi = data.data();

    const namalengkapbayi = namalengkapbayibaru ? namalengkapbayibaru:dataBayi.namalengkapbayi;
    const tanggallahirbayi = tanggallahirbayibaru ? tanggallahirbayibaru:dataBayi.tanggallahirbayi;
    const usiabayi = usiabayibaru ? usiabayibaru:dataBayi.usiabayi;
    const usiabayistring = usiabayistringbaru ? usiabayistringbaru:dataBayi.usiabayistring;
    const tinggibadanbayi = tinggibadanbayibaru ? tinggibadanbayibaru:dataBayi.tinggibadanbayi;
    const beratbadanbayi = beratbadanbayibaru ? beratbadanbayibaru:dataBayi.beratbadanbayi; 
    const lingkarlenganbayi = lingkarlenganbayibaru ? lingkarlenganbayibaru:dataBayi.lingkarlenganbayibaru;
    const jeniskelaminbayi = dataBayi.jeniskelaminbayi;

    // console.log(namalengkapbayi, tanggallahirbayi, usiabayi, usiabayistring, tinggibadanbayi, beratbadanbayi, lingkarlenganbayi, jeniskelaminbayi)
    // Update data di Firestore
    await updateDoc(docRef, {
      namalengkapbayi: namalengkapbayi,
      tanggallahirbayi: tanggallahirbayi,
      usiabayi: usiabayi,
      usiabayistring: usiabayistring,
      tinggibadanbayi: tinggibadanbayi,
      beratbadanbayi: beratbadanbayi,
      lingkarlenganbayi: lingkarlenganbayi
    });

    const predict_url = "https://capstoneimage1-1012812118697.asia-southeast2.run.app/predict";
      try {
        const predict = await axios.post(predict_url, {
          usia: usiabayi,
          berat: beratbadanbayi,
          tinggi: tinggibadanbayi,
          lila: lingkarlenganbayi,
          jk: jeniskelaminbayi,
        });
        // Respons sukses
        const response = h.response({
          status: "success",
          ...dataBayi,
          prediction: predict.data,
          message: `Data bayi ${namalengkapbayi} berhasil diperbarui.`,
        });
        response.code(200);
        return response;
      } catch (error) {
        console.error(`Error predicting for ${dataBayi.namalengkapbayi}:`, error.message);
        // Add an error message to the bayi object
        const response = h.response({
          ...dataBayi,
          prediction: { error: error.message },
        });
        response.code(500);
        return response;
      };
  } catch (error) {
    // Tangani error jika ada
    console.error("Error saat memperbarui data bayi:", error);

    const response = h.response({
      status: "error",
      message: "Gagal memperbarui data bayi.",
      error: error.message,
    });
    response.code(500);
    return response;
  }
};

const getArticles = async (request, h) => {
  try {
    const articleDocRef = collection(db, 'articles');

    // Mengambil data dokumen
    const dataArticle = await getDocs(articleDocRef);

    let listArticle = dataArticle.docs.map(doc => ({
      ...doc.data(), // Isi data dokumen
    }));

    return h.response({
      status: 'success',
      data: {
          listArticle
      },
  }).code(200);
    
} catch (error) {
    console.error('Error fetching user:', error);

    // Response error
    return h.response({
        status: 'error',
        message: 'Failed to fetch user data',
        error: error.message,
    }).code(500);
}
};

const getOneArticle = async (request, h) => {
  const { judulSlug } = request.params;
  try {
    const oneArticleDocRef = doc(db, 'articles', judulSlug);

    // Mengambil data dokumen
    const oneArticle = await getDoc(oneArticleDocRef);

    const dataArticle = oneArticle.data();

    return h.response({
      status: 'success',
      data: {
          ...dataArticle,
      },
  }).code(200);
    
} catch (error) {
    console.error('Error fetching user:', error);

    // Response error
    return h.response({
        status: 'error',
        message: 'Failed to fetch user data',
        error: error.message,
    }).code(500);
}

};

const chatBotBloomie = async (request, h) => {
  const {message} = request.payload;
  // Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({project: '1012812118697', location: 'us-central1'});
const model = 'projects/1012812118697/locations/us-central1/endpoints/669779602687655936';

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 1000,
    'temperature': 1,
    'topP': 0.95,
  },
  safetySettings: [
    {
      'category': 'HARM_CATEGORY_HATE_SPEECH',
      'threshold': 'OFF',
    },
    {
      'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
      'threshold': 'OFF',
    },
    {
      'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      'threshold': 'OFF',
    },
    {
      'category': 'HARM_CATEGORY_HARASSMENT',
      'threshold': 'OFF',
    }
  ],
});


const chat = generativeModel.startChat({});

async function sendMessage(message) {
  const streamResult = await chat.sendMessageStream(message);
  return (await streamResult.response).candidates[0].content
}
try{
  const responChat = await sendMessage(message)
  return h.response({
    status: 'success',
    message: responChat
  }).code(200);
}
catch (error){
  console.error('Error generates response:', error);

    // Response error
  return h.response({
      status: 'error',
      message: 'Failed to generate response',
      error: error.message,
  }).code(500);
}

async function generateContent() {
}

// generateContent();
}




export {registerHandler, loginHandler, userUploadPhoto, 
  registerBayiHandler, getUsersHandler, homeHandler, 
  getArticles, getOneArticle, chatBotBloomie, updateStatusBayi};