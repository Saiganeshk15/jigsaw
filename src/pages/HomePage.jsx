/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, memo, useCallback } from 'react';
import { initUser, updateScore } from '../queries/Users';
import { v4 as uuidv4 } from "uuid";
import { JigsawPuzzle } from 'react-jigsaw-puzzle';
import "react-jigsaw-puzzle/lib/jigsaw-puzzle.css";
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import cs from "../assets/cs_logo_jig.jpeg";
import vbit from "../assets/vbit_logo.jpg";
import pra from "../assets/prathiba_logo.jpg";
import "./Timer.css";
import { useNavigate } from 'react-router-dom'; ;

// Memoized JigsawPuzzle component
const MemoizedJigsawPuzzle = memo(JigsawPuzzle);

const Timer = memo(({ isActive, initialTime, onTimeUp }) => {
    const [seconds, setSeconds] = useState(initialTime);

    useEffect(() => {
        let interval = null;

        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(prevSeconds => {
                    if (prevSeconds <= 1) {
                        onTimeUp();
                        return 0;
                    }
                    return prevSeconds - 1;
                });
            }, 1000);
        } else if (!isActive) {
            clearInterval(interval);
        }
        if(isActive) {
            localStorage.setItem("timeleft", seconds);
        }
        if(!isActive) {
            setSeconds(60);
        }

        return () => clearInterval(interval);
    }, [isActive, seconds, onTimeUp]);

    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeWidth = 10;
    const progress = ((initialTime - seconds) / initialTime) * circumference;

    return (
        <div className="timer-container">
            <svg
                className="circular-progress"
                width="120"
                height="120"
                viewBox="0 0 120 120"
            >
                <circle
                    className="background"
                    cx="60"
                    cy="60"
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <circle
                    className="progress"
                    cx="60"
                    cy="60"
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                />
                <text
                    x="50%"
                    y="50%"
                    className="timer-text"
                    alignmentBaseline="middle"
                    textAnchor="middle"
                    transform="rotate(90, 60, 60)"
                >
                    {seconds}
                </text>
            </svg>
        </div>
    );
});

export const HomePage = () => {
    const [name, setName] = useState(localStorage.getItem("name"));
    const [open, setOpen] = useState(false);
    const [id, setId] = useState(localStorage.getItem("id") || "");
    const [text, setText] = useState("Solve this before timer ends!!");
    const [isStarted, setIsStarted] = useState(false);
    const [isLogedin, setIsLogedin] = useState(false);
    const [qno, setQno] = useState(parseInt(localStorage.getItem("qno")) || 1);
    const initialTime = 60; // Initial timer duration
    const [isActive, setIsActive] = useState(false);
    const [lastAnsweredQuestion, setLastAnsweredQuestion] = useState(parseInt(localStorage.getItem("laq")) || 0);
    const images = {
        1: vbit,
        2: cs,
        3: pra
    };
    const [score, setScore] = useState(parseInt(localStorage.getItem("score")) || 0);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setName(name);
        setId(id);
        const name1 = document.getElementById("name").value;
        setName(name1);
        localStorage.setItem("name", name1);
        const uuid = uuidv4();
        localStorage.setItem("id", uuid);
        setId(uuid);
        setIsLogedin(initUser(uuid, name1));
        localStorage.setItem("score", "0");
        setOpen(false);
        setIsActive(true);
    };

    const handleTimeUp = useCallback(() => {
        setIsActive(false);
        localStorage.setItem("laq", qno);
        setLastAnsweredQuestion(qno);
        setText("Congratulations!!");
        localStorage.setItem("score", score + parseInt(localStorage.getItem("timeleft")*100/60));
        setScore(parseInt(localStorage.getItem("score")));
        updateScore(parseInt(localStorage.getItem("score")),localStorage.getItem("id"));
        if(qno === 3){
            navigate("/leaderboard");
        }
    }, [lastAnsweredQuestion, qno, score, navigate]);

    useEffect(() => {
        if (!localStorage.getItem("name")) {
            setOpen(true);
        } else {
            setName(localStorage.getItem("name"));
            setId(localStorage.getItem("id"));
            setIsLogedin(true);
        }
        if(lastAnsweredQuestion === 3){
            navigate("/leaderboard");
        }
    }, [open]);

    useEffect   (() => {
        setQno(qno);
        if( lastAnsweredQuestion !== qno ) {
            setIsActive(true);
        }
        if(lastAnsweredQuestion === 3){
            navigate("/leaderboard");
        }
    },[qno])

    useEffect(() => {
        const admindocRef = onSnapshot(doc(db, "admin", "admin"), (doc) => {
            setIsStarted(doc.data().isGameStarted);
            setQno(doc.data().qno);
            localStorage.setItem("qno", doc.data().qno)
            setText("Solve this before timer ends!!");
        });
        return () => admindocRef(); // Clean up listener
    }, []);

    const Popup = () => (
        <div className="popup">
            <form onSubmit={handleSubmit}>
                <h3>Enter name to continue</h3>
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder='Enter your name'
                />
                <p>Refrain from using rude or offensive names.</p>
                <input id='submit' type="submit" value="Start" />
            </form>
        </div>
    );

    const GameBoard = memo(() => (
        <div className="gameBoard">
            <h2 className="tag">{text}</h2>
            <div className="solution"><img src={images[qno]} alt="" width="100px" /></div>
            <MemoizedJigsawPuzzle
                imageSrc={images[qno]}
                rows={3}
                columns={3}
                onSolved={handleTimeUp}
                className="jigsaw-puzzle"
            />
        </div>
    ));

    return (
        <>
            {open && <Popup />}
            {lastAnsweredQuestion === qno ? <div className='waiting-text'>Wait for the admin to change the question</div> : isLogedin ? isStarted ? <GameBoard /> : <div className='waiting-text'>Waiting for the admin to start the game</div> : null}
            {isLogedin && isStarted && <Timer isActive={isActive} initialTime={initialTime} onTimeUp={handleTimeUp} />}
        </>
    );
};
