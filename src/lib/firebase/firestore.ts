import { db, isFirebaseConfigured } from "./config";
import { doc, getDoc, setDoc } from "firebase/firestore";

const COLLECTION_NAME = "competeflow_data";
const DOC_ID = "main_state";

export async function loadStateFromFirestore() {
  if (!isFirebaseConfigured() || !db) {
    return null;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.warn("Could not load from Firebase Firestore:", error);
    return null;
  }
}

export async function saveStateToFirestore(data: any) {
  if (!isFirebaseConfigured() || !db) {
    return false;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    await setDoc(
      docRef,
      {
        ...data,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn("Could not save to Firebase Firestore:", error);
    return false;
  }
}
