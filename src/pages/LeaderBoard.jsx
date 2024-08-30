import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { query, onSnapshot, collection, orderBy } from 'firebase/firestore';
import {  db} from "../firebase";

export const LeaderBoard = () => {

    const [users, setUsers] = useState([]);

    const navigate = useNavigate();

    if(parseInt(localStorage.getItem("laq")) !== 3){
        navigate("/");
    }

    useEffect(() => {
        // Create a query to get users ordered by score in descending order
        const q = query(collection(db, 'users'), orderBy('score', 'desc'));
    
        // Set up a real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const usersList = [];
          querySnapshot.forEach((doc) => {
            usersList.push({ id: doc.id, ...doc.data() });
          });
          setUsers(usersList);
        });
    
        // Clean up the listener when the component is unmounted
        return () => unsubscribe();
      }, []);

  return (
    <>
        <h1>LeaderBoard</h1>
        <table>
            <th>
                <td className="tname">Name</td>
                <td className="score">Score</td>
            </th>
            {users.map((user) => {
                return (
                    <tr key={user.id}>
                        <td className="tname">{user.name}</td>
                        <td className="score">{user.score}</td>
                    </tr>
                )
            })}
        </table>
    </>
  )
}
