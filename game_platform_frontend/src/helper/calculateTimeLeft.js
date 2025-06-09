export const calculateTimeLeft = (endTime) => {
    const difference = endTime - new Date().getTime();
    let timeLeft = 0;
  
    if (difference > 0) {
      timeLeft = Math.floor(difference / 1000);
    }
  
    return timeLeft;
  };

    export const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
      const s = (seconds % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };