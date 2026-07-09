import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID from config if present
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Initialize Firebase Auth
export const auth = getAuth(app);

/**
 * Ensures that the client has an active authenticated session (anonymous)
 * before making any Firestore database calls.
 */
export async function ensureAuthenticated(): Promise<void> {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
      console.log('Successfully established secure background auth session.');
    }
  } catch (error) {
    console.error('Failed to establish secure auth session:', error);
  }
}

// Dynamic collections names
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  SALES: 'sales',
  PAYOUTS: 'payouts',
  CONFIG: 'config',
  NOTIFICATIONS: 'notifications',
  USER_LOGS: 'user_logs'
};

/**
 * Fetch all documents in a collection and return them as an array.
 */
export async function getCollectionData<T>(collectionName: string): Promise<T[]> {
  await ensureAuthenticated();
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as T[];
}

/**
 * Set/Overwrite a document in a collection.
 */
export async function setDocumentData<T extends object>(collectionName: string, docId: string, data: T): Promise<void> {
  await ensureAuthenticated();
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, data, { merge: true });
}

/**
 * Update dynamic fields in a document.
 */
export async function updateDocumentData(collectionName: string, docId: string, data: Record<string, any>): Promise<void> {
  await ensureAuthenticated();
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
}

/**
 * Delete a document.
 */
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  await ensureAuthenticated();
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

/**
 * Seeds initial database data if collections are empty.
 */
export async function seedDatabase(initialData: {
  users: any[];
  projects: any[];
  sales: any[];
  payouts: any[];
  config: any;
  notifications: any[];
}): Promise<{
  users: any[];
  projects: any[];
  sales: any[];
  payouts: any[];
  config: any;
  notifications: any[];
}> {
  await ensureAuthenticated();
  // Check if users collection is empty. If yes, seed all collections.
  const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
  if (usersSnapshot.empty) {
    console.log('Database empty. Seeding initial data...');
    
    // Seed MLM Config
    await setDoc(doc(db, COLLECTIONS.CONFIG, 'main_config'), initialData.config);

    // Seed Users
    const usersBatch = writeBatch(db);
    initialData.users.forEach(user => {
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      usersBatch.set(userRef, user);
    });
    await usersBatch.commit();

    // Seed Projects
    const projectsBatch = writeBatch(db);
    initialData.projects.forEach(project => {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, project.id);
      projectsBatch.set(projectRef, project);
    });
    await projectsBatch.commit();

    // Seed Sales
    const salesBatch = writeBatch(db);
    initialData.sales.forEach(sale => {
      const saleRef = doc(db, COLLECTIONS.SALES, sale.id);
      salesBatch.set(saleRef, sale);
    });
    await salesBatch.commit();

    // Seed Payouts
    const payoutsBatch = writeBatch(db);
    initialData.payouts.forEach(payout => {
      const payoutRef = doc(db, COLLECTIONS.PAYOUTS, payout.id);
      payoutsBatch.set(payoutRef, payout);
    });
    await payoutsBatch.commit();

    // Seed Notifications
    const notifsBatch = writeBatch(db);
    initialData.notifications.forEach(notif => {
      const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, notif.id);
      notifsBatch.set(notifRef, notif);
    });
    await notifsBatch.commit();

    console.log('Seeding completed successfully!');
    return initialData;
  } else {
    // Database is already populated, fetch and return actual database state
    console.log('Database already initialized. Fetching documents...');
    const users = await getCollectionData<any>(COLLECTIONS.USERS);
    const projects = await getCollectionData<any>(COLLECTIONS.PROJECTS);
    const sales = await getCollectionData<any>(COLLECTIONS.SALES);
    const payouts = await getCollectionData<any>(COLLECTIONS.PAYOUTS);
    const notifs = await getCollectionData<any>(COLLECTIONS.NOTIFICATIONS);
    
    const configSnapshot = await getDocs(collection(db, COLLECTIONS.CONFIG));
    let config = initialData.config;
    if (!configSnapshot.empty) {
      config = configSnapshot.docs[0].data();
    }

    return {
      users,
      projects,
      sales,
      payouts,
      config,
      notifications: notifs
    };
  }
}

/**
 * Overwrites and resets the database collections to default seed data
 */
export async function resetDatabaseToDefaults(initialData: {
  users: any[];
  projects: any[];
  sales: any[];
  payouts: any[];
  config: any;
  notifications: any[];
}): Promise<void> {
  await ensureAuthenticated();
  console.log('Resetting database to default seed data...');

  // 0. Clear existing collections to ensure no stray documents remain from old schema
  const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
  if (!usersSnap.empty) {
    const batch = writeBatch(db);
    usersSnap.docs.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  }

  const projectsSnap = await getDocs(collection(db, COLLECTIONS.PROJECTS));
  if (!projectsSnap.empty) {
    const batch = writeBatch(db);
    projectsSnap.docs.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  }

  const salesSnap = await getDocs(collection(db, COLLECTIONS.SALES));
  if (!salesSnap.empty) {
    const batch = writeBatch(db);
    salesSnap.docs.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  }

  const payoutsSnap = await getDocs(collection(db, COLLECTIONS.PAYOUTS));
  if (!payoutsSnap.empty) {
    const batch = writeBatch(db);
    payoutsSnap.docs.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  }

  const notifsSnap = await getDocs(collection(db, COLLECTIONS.NOTIFICATIONS));
  if (!notifsSnap.empty) {
    const batch = writeBatch(db);
    notifsSnap.docs.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  }

  // 1. Reset MLM Config
  await setDoc(doc(db, COLLECTIONS.CONFIG, 'main_config'), initialData.config);

  // 2. Reset Users
  const usersBatch = writeBatch(db);
  initialData.users.forEach(user => {
    const userRef = doc(db, COLLECTIONS.USERS, user.id);
    usersBatch.set(userRef, user);
  });
  await usersBatch.commit();

  // 3. Reset Projects
  const projectsBatch = writeBatch(db);
  initialData.projects.forEach(project => {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, project.id);
    projectsBatch.set(projectRef, project);
  });
  await projectsBatch.commit();

  // 4. Reset Sales
  const salesBatch = writeBatch(db);
  initialData.sales.forEach(sale => {
    const saleRef = doc(db, COLLECTIONS.SALES, sale.id);
    salesBatch.set(saleRef, sale);
  });
  await salesBatch.commit();

  // 5. Reset Payouts
  const payoutsBatch = writeBatch(db);
  initialData.payouts.forEach(payout => {
    const payoutRef = doc(db, COLLECTIONS.PAYOUTS, payout.id);
    payoutsBatch.set(payoutRef, payout);
  });
  await payoutsBatch.commit();

  // 6. Reset Notifications
  const notifsBatch = writeBatch(db);
  initialData.notifications.forEach(notif => {
    const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, notif.id);
    notifsBatch.set(notifRef, notif);
  });
  await notifsBatch.commit();

  console.log('Database reset complete!');
}
