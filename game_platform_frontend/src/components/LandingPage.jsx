// import React from "react";
// import { useState } from "react";
// import { FaBriefcase, FaMusic, FaUtensils, FaFutbol, FaMicrophone, FaStar } from "react-icons/fa";
import {
  FaDice,
  FaTrophy,
  // FaTableTennis,
  // FaChessKing,
  FaGamepad, 
  FaSearch , FaMoneyCheckAlt, FaWallet
} from "react-icons/fa";
import { IoGameController } from "react-icons/io5";
import { Link } from "react-router-dom";
import Logo from "../assets/Asset1.svg";
// import { FaBars } from "react-icons/fa";

import Footerx from "./Footerx";
const LandingPage = () => {
  // const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="bg-[#1c6758]/75 text-gray-900">
      {/* Navbar */}
      <div className="bg-gradient-to-r from-white/75 to-white/75 p-2 shadow-lg flex justify-between items-center space-x-2">
        
      <div className="flex w-64 h-fit">
      <img src={Logo} alt="Logo" /></div>
        <div className="flex sm:space-x-4 space-x-2 font-bold sm:font-semibold">
          <Link
            to="/login"
            className="px-3 sm:px-4 py-2 rounded-lg shadow-md bg-[#1c6758] text-sm sm:text-base text-white hover:bg-white hover:text-[#1c6758] transition duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-3 sm:px-4 py-2 rounded-lg shadow-md bg-white text-sm sm:text-base text-[#1c6758] hover:bg-[#1c6758] hover:text-white transition duration-300"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center text-center text-white"
        style={{
          backgroundImage:
            "url('https://www.xtremebarbingo.com/wp-content/uploads/2018/02/Background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          <div className="relative z-10 max-w-3xl px-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-fade-in">
              Discover and Play Exciting Games
            </h1>
            
            <p className="mt-4 text-lg md:text-xl text-gray-200">
              Dive into the world of thrilling games, win big, and enjoy instant withdrawals.
            </p>

            {/* CTA Button */}
            <Link
            to="/Login">
          <button className="mt-6 px-6 py-3 bg-gradient-to-r from-[#1c6758] to-green-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform">
            Check Your Ticket 
          </button>
          </Link>
        </div>
      </section>

      {/* Event Categories */}
      <section className="py-12 text-center">
        <h2 className="text-4xl font-bold text-white/90">Game Categories</h2>
        <p className="text-white/75 mt-2">
          Explore different game categories and find your favorite.
        </p>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
          {[
            {
              name: "Multiplayer",
              icon: <IoGameController size={30} />,
              color: "from-gray-700 to-gray-800",
            },

            {
              name: "Jackpot",
              icon: <FaDice size={30} />,
              color: "from-gray-700 to-gray-800",
            },
            // {
            //   name: "eSports",
            //   icon: <FaTableTennis size={30} />,
            //   color: "from-red-400 to-purple-500",
            // },
            // {
            //   name: "Virtual Sports",
            //   icon: <FaDice size={30} />,
            //   color: "from-blue-400 to-indigo-500",
            // },
            {
              name: "Tournaments",
              icon: <FaTrophy size={30} />,
              color: "from-gray-700 to-gray-800",
            },
          ].map((category) => (
            <div
              key={category.name}
              className={`p-6 rounded-lg shadow-lg bg-gradient-to-r ${category.color} text-white flex flex-col items-center transition-transform transform hover:scale-105`}
            >
              <div className="text-4xl">{category.icon}</div>
              <p className="font-semibold text-lg mt-3">{category.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 bg-gray-50 text-center">
        <h2 className="text-4xl font-bold text-gray-800">Games</h2>
        <p className="text-gray-800/75 mt-2">
          Get your tickets online and try our latest and upcoming games.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          {[
            {
              name: "Bingo",
              img: "https://t3.ftcdn.net/jpg/03/21/98/48/360_F_321984844_iLKPMWdOIIVBAACtnjB2fG3GqVrEn4yM.jpg",
              status: "Play",
              btnColor: "bg-[#1c6758]",
            },
            {
              name: "Coin Flip",
              img: "https://thumbs.dreamstime.com/b/gold-coin-d-different-rotation-angles-modern-set-realistic-sprites-rotating-animation-simple-currency-sign-316980722.jpg",
              status: "Coming Soon",
              btnColor: "bg-gray-400",
            },
            {
              name: "Rocket",
              img: "https://previews.123rf.com/images/yupiramos/yupiramos1806/yupiramos180616899/115183922-man-sitting-in-sofa-with-virtual-reality-headset-rocket-planet-game-illustration-vector.jpg",
              status: "Coming Soon",
              btnColor: "bg-gray-400",
            },
          ].map((game) => (
            <div
              key={game.name}
              className="bg-white rounded-xl shadow-lg p-6 transform transition duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              <div
                className="h-48 rounded-lg bg-gray-300 bg-cover bg-center shadow-md"
                style={{ backgroundImage: `url('${game.img}')` }}
              ></div>
              <h3 className="mt-4 text-xl font-bold text-gray-800">
                {game.name}
              </h3>
              <p className="text-sm text-gray-500">Presented by Fortune Bingo</p>
                        <Link
            to="/login">
              <button
                className={`mt-4 ${game.btnColor} text-white px-6 py-2 rounded-lg font-semibold shadow-md transition hover:opacity-80`}
              >
                {game.status}
              </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 text-center">
        <h2 className="text-4xl font-bold text-white/90">How It Works</h2>
        <p className="text-white/75 mt-2">
          Get started in three easy steps and enjoy the thrill of betting.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          {[
            {
              title: "Explore Games",
              icon: <FaSearch  size={40} />,
              description:
                "Browse different game options and choose your favorite one.",
            },
            {
              title: "Buy Ticket Online",
              icon: <FaMoneyCheckAlt size={40} />,
              description:
                "Enter the game, set your wager, and confirm your ticket.",
            },
            {
              title: "Play In Location",
              icon: <FaGamepad size={40} />,
              description:
                "Enter the game, set your wager, and confirm your ticket.",
            },
            {
              title: "Win & Cash out",
              icon: <FaWallet size={40} />,
              description:
                "Cash out your winnings instantly with secure payment options.",
            },
          ].map((step, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-lg shadow-lg flex flex-col items-center transform transition-transform hover:scale-105"
            >
              <div className="text-5xl text-[#1c6758]">{step.icon}</div>
              <h3 className="text-xl font-semibold mt-4">{step.title}</h3>
              <p className="text-gray-600 mt-2">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Most Visited Places */}
      {/* <section className="py-12 bg-gray-50 text-center">
        <h2 className="text-3xl font-semibold">Most Visited Places</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {['California', 'Washington', 'Nevada', 'Utah', 'New Mexico'].map(place => (
            <div key={place} className="h-40 bg-gray-300 rounded-md flex items-center justify-center font-bold text-white">{place}</div>
          ))}
        </div>
      </section> */}

      {/* Latest News */}
      {/* <section className="py-12 text-center">
        <h2 className="text-3xl font-semibold">Our Latest News</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3].map(news => (
            <div key={news} className="bg-white rounded-lg shadow-md p-4">
              <div className="h-40 bg-gray-300 rounded-md"></div>
              <h3 className="mt-4 text-lg font-semibold">News Title</h3>
              <p className="text-sm text-gray-500">Short description</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Footer */}
      <Footerx />
    </nav>
  );
};

export default LandingPage;
