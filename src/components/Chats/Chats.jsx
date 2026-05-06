import React, { useEffect, useRef } from 'react';
import styles from './Chats.module.css';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const Chats = ({ username }) => {
  const { roomId } = useParams();
  const containerRef = useRef(null);

  useEffect(() => {
    const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      Date.now().toString(),
      username
    );

    const zc = ZegoUIKitPrebuilt.create(kitToken);
    zc.joinRoom({
      container: containerRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      showScreenSharingButton: false,
    });

    // cleanup on unmount
    return () => {
      zc.destroy();
    };
  }, [roomId, username]);

  return (
    <div className={styles.chatsWrap}>
      <div ref={containerRef} className={styles.videoContainer} />
    </div>
  );
};

export default Chats;
