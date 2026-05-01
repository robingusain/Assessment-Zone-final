import React from 'react'
import styles from './Client.module.css'
import Avatar from 'react-avatar'

const formatName = (name) => {
  const parts = name.trim().split(" ");

  return parts
    .map((word) => {
      if (word.length > 8) {
        return word.slice(0, 8) + "...";
      }
      return word;
    })
    .join(" ");
};

const Client = ({username}) => {
  return (
    <div className={styles.client}>
        <Avatar name={username} size={50} round="14px"/>
        <span className={styles.username} title={username}>
            {formatName(username)}
        </span>
    </div>
  )
}

export default Client