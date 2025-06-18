'use client'
import React, { useState, useEffect } from 'react'
import styles from './Uhr.module.scss'

const Uhr: React.FC = () => {
  const [time, setTime] = useState<string>('00:00:00')
  const [date, setDate] = useState<string>('')
  const [weekday, setWeekday] = useState<string>('')

  const updateTime = () => {
    const now = new Date()
    setTime(
      now.toLocaleTimeString('de-DE', {
        timeZone: 'Europe/Berlin',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    )
    setDate(
      now.toLocaleDateString('de-DE', {
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    )
    setWeekday(
      now.toLocaleDateString('de-DE', {
        timeZone: 'Europe/Berlin',
        weekday: 'long',
      }),
    )
  }
  useEffect(() => {
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className={`${styles.uhr} flex flex-col items-center`}>
      <div className="flex">
        <span className={styles['uhr-item']}>{time}</span>
      </div>
      <div>{date}</div>
      <div>{weekday}</div>
    </div>
  )
}

export default Uhr
