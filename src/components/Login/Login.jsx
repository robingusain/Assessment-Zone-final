import React, { useState } from "react";
import styles from "./Login.module.css";
import { v4 } from "uuid";
import toast from 'react-hot-toast'
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = v4();
    setRoomId(id);
    toast.success("New room Id created");
  };

  const joinRoom=()=>{
    if(!roomId){
      toast.error("ROOM ID is required");
      return;
    }
    if(!username){
      toast.error("USERNAME is required");
      return;
    }

    navigate(`/editor/${roomId}`,{
      state: {
        username,
      }
    });
  };

  const handleInputEnter=(e)=>{
    if(e.code === "Enter") {
      joinRoom();
    }
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.loginWrapper}>
        <div className={styles.logo}>
          <img src="logo.png" alt="logo" />
        </div>

        <div className={styles.inputField}>

          <div className={styles.inputBox}>
            <span className={styles.icon}>👥</span>
            <input type="text" placeholder="Room ID" onChange={(e)=> setRoomId(e.target.value)} value={roomId} onKeyUp={handleInputEnter}/>
          </div>
          <div className={styles.inputBox}>
            <span className={styles.icon}>👤</span>
            <input type="text" placeholder="Username" onChange={(e)=> setUsername(e.target.value)} value={username} onKeyUp={handleInputEnter}/>
          </div>

        </div>

        <button className={styles.joinBtn} onClick={joinRoom}>Join Room</button>

        <div className={styles.createInfo}>
          <span>
            If you don’t have a room,{" "}
            <a onClick={createNewRoom} href="/create-room">
              Create Room
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
