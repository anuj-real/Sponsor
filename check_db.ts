import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

async function check() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    console.log(`Total users in Firestore: ${snap.size}`);
    snap.docs.forEach(doc => {
      console.log(`- ID: ${doc.id}, Name: ${doc.data().name}, Sponsor: ${doc.data().sponsorId}`);
    });
  } catch (err) {
    console.error("Error querying Firestore:", err);
  }
}

check();
