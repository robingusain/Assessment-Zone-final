import React from 'react'
import styles from './Chats.module.css'

import { useParams } from 'react-router-dom'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
const Chats = ({username}) => {
  const { roomId} = useParams();
  const myMeeting = async(element) =>{
    const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, Date.now().toString(), username);
    const zc=ZegoUIKitPrebuilt.create(kitToken);
    zc.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
        // mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton:false,
    });
  }
  return (
    <div className={styles.chatsWrap}>
      <div ref={myMeeting} className={styles.videoContainer}/>
    </div>
  )
}

export default Chats