import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

async function queryLogs() {
  console.log('--- Scanning User Logs in Firestore ---');
  try {
    const snap = await getDocs(collection(db, 'user_logs'));
    console.log(`Total logs found: ${snap.size}`);
    
    const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Search for SBR0069, SBR0070, or onboarding actions
    const sbr6970Logs = logs.filter((log: any) => {
      const details = (log.details || '').toUpperCase();
      const userId = (log.userId || '').toUpperCase();
      return details.includes('SBR0069') || details.includes('SBR0070') || userId.includes('SBR0069') || userId.includes('SBR0070');
    });

    console.log('\nLogs related to SBR0069 or SBR0070:');
    console.log(JSON.stringify(sbr6970Logs, null, 2));

    // Also look at any deletion logs
    const deletionLogs = logs.filter((log: any) => log.action === 'DELETION');
    console.log('\nDeletion Logs:');
    console.log(JSON.stringify(deletionLogs, null, 2));

    // Also let\'s print the last 5 addition logs to see the most recent additions
    const additionLogs = logs.filter((log: any) => log.action === 'ADDITION');
    additionLogs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    console.log('\nMost Recent 5 Addition Logs:');
    console.log(JSON.stringify(additionLogs.slice(0, 5), null, 2));

  } catch (e) {
    console.error('Error fetching logs:', e);
  }
}

queryLogs();
