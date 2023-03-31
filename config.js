import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyA8Txu_suoZbcJeVdDxqHemyx9VBTI55HQ',
  authDomain: 'e-libraryapp-6d9bf.firebaseapp.com',
  projectId: 'e-libraryapp-6d9bf',
  storageBucket: 'e-libraryapp-6d9bf.appspot.com',
  messagingSenderId: '274030764835',
  appId: '1:274030764835:web:c7af9ccf74201432cf6296',
};

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
