/* eslint-disable react/prop-types */

import { useNavigate } from 'react-router-dom';

const GameCard = ({ game }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (game.title.toLowerCase() === 'bingo') {
      navigate('/bingo');
    } else {
      navigate(`/${game.title.toLowerCase()}`);
    }
  };

  
  return (
    <div
      className="bg-primary/65  border-[#43a046] rounded-xl  overflow-hidden cursor-pointer transition-transform transform hover:scale-105"
      onClick={handleClick}
    >
      <img
        src={ '/gamecardasset.svg'}
        alt={game.title}
        className="w-full h-60 object-cover"
        onError={(e) => { e.target.src = '/gamecardasset.svg'; }} // Fallback in case the image fails to load
      />

    </div>
  );
};

export default GameCard;