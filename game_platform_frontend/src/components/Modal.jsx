import React from "react";
import { IoClose } from "react-icons/io5";

const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-lg flex justify-center items-center overflow-auto h-screen pt-6 pb-4">
            <div className="py-2 px-6 rounded-lg shadow-xl w-full max-w-sm mx-auto h-auto text-white" style={{ background: 'linear-gradient(to bottom, #014222, #006032, #00783e)' }}>
                <div className="flex justify-between items-center text-2xl">
                <h2 className="text-xl font-bold text-center ml-6">እየተጫወቱ ፣ እየተዝናኑ ይሸለሙ</h2>
                    
                    <IoClose onClick={onClose} className="text-white text-xl font-bold justify-end"/>
                
                </div>
                <p className="text-center text-yellow-400 m-1  text-lg">መጋቢት 30 ማታ 2 ሰዓት ይጀምራል</p>
<img src="/bonusw2.png" className="rounded-lg"/>
                <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                    <li>ሲያሸንፉ ሙሉ ነጥብ ሲሸነፉ ግማሽ ነጥብ ይሰብስቡ።</li>
                    <li>ደረጃ <span className="text-yellow-400">Leaderboard</span> ከዛ <span className="text-yellow-400">Bonus</span> ጋር በመሄድ ይከታተሉ።</li>
                    <li>
                        ለተጨማሪ ኢንፎርሜሽን የቴሌግራም ግሩፓችንን{" "}
                        <a href="https://t.me/FORTUNE_BETS_CHAT" className="text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                            ይህን ሊንክ በመጫን
                        </a>{" "}
                        ይቀላቀሉ።
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Modal;
