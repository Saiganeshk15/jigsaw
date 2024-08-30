import { db} from "../firebase";
import { collection, doc, setDoc, getDoc, updateDoc} from "firebase/firestore";

export const initUser = async (userId, name) => {
    try {
        const userDocRef = doc(collection(db, 'users'), userId);
        await setDoc(userDocRef, {
            name: name,
            userId: userId,
            isBlocked: false,
            score: 0
        });
        return true;
    } catch (error) {
        console.log(error);
        alert(error);
        return false;
    }
}

export const isGameStarted = async () => {
    try {
        const adminDocRef = doc(collection(db, "admin"), "admin");
        const docSnap = await getDoc(adminDocRef);
        return docSnap.data().isGameStarted;
    } catch (error) {
        console.error('Error creating document: ', error);
    }
}

export const updateScore = async (score, id) => {
    try {
        const userDocRef = doc(collection(db, 'users'), id);
        await updateDoc(userDocRef, {
            score: score
        })
        return true;
    } catch (error) {
        console.log(error);
        alert(error);
        return false;
    }
}