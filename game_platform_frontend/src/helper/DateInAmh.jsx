/* eslint-disable react/prop-types */
export const DisplayDateInAmharic = ({ dateString }) => {
    // Convert the ISO date string to a Date object
    const date = new Date(dateString);
  
    // Format the date in Amharic
    const formattedDate = new Intl.DateTimeFormat('am-ET', {
      year: 'numeric',
      month: 'long', // 'numeric' for month number, 'long' for full month name
      day: 'numeric',
    }).format(date);
  
    return <div>{formattedDate}</div>;
  };