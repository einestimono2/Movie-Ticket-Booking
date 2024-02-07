import React, { useEffect, useState } from 'react';

export default function Timer(props) {
  const { initialMinute = 5, initialSeconds = 0 } = props;

  const [minutes, setMinutes] = useState(Number(initialMinute));
  const [seconds, setSeconds] = useState(Number(initialSeconds));

  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }

      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(myInterval);
          props.onTimedout();
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);

    return () => {
      clearInterval(myInterval);
    };
  });

  return (
    <div className="mb-3 w-100">
      <div className={props.className}>
        <div className="ms-1 fs-6">{props.title}</div>
        <div className="me-1 fw-bold fs-5">{`${minutes < 10 ? '0' : ''}${minutes}:${
          seconds < 10 ? '0' : ''
        }${seconds}`}</div>
      </div>
    </div>
  );
}
