import { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';

function SlotMachine() {
    const [spins, setSpins] = useState(0);
    const [balance, setBalance] = useState(100);
    const [averageSpinPrice, setAverageSpinPrice] = useState(0);
    const [slots, setSlots] = useState([
        ['images/v1sword.png', 'images/v1chest.png', 'images/v1bomb.png'],
        ['images/v1sword.png', 'images/v1chest.png', 'images/v1bomb.png'],
        ['images/v1sword.png', 'images/v1chest.png', 'images/v1bomb.png']
    ]);
    const [spinPrice, setSpinPrice] = useState(10);
    const [resultMessage, setResultMessage] = useState('RESULT 0$');
    const [isAnimating, setIsAnimating] = useState(false);
    const images = [
        'images/v1anchor.png',
        'images/v1barrel.png',
        'images/v1skull.png',
        'images/v1sword.png',
        'images/v1bomb.png',
        'images/v1chest.png'
    ];

    const payouts = {
        'images/v1anchor.png': 2,
        'images/v1barrel.png': 8,
        'images/v1skull.png': 15,
        'images/v1sword.png': 50,
        'images/v1bomb.png': 100,
        'images/v1chest.png': 200
    };

    const probabilities = {
        'images/v1anchor.png': 0.35,
        'images/v1barrel.png': 0.25,
        'images/v1skull.png': 0.2,
        'images/v1sword.png': 0.10,
        'images/v1bomb.png': 0.07,
        'images/v1chest.png': 0.03
    };

    const getRandomSymbol = () => {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const rand = array[0] / (0xFFFFFFFF + 1);
        let cumulativeProbability = 0;
        for (const [symbol, probability] of Object.entries(probabilities)) {
            cumulativeProbability += probability;
            if (rand < cumulativeProbability) {
                return symbol;
            }
        }
    };

    const checkWin = (slots) => {
        let winAmount = 0;
        for (let i = 0; i < 3; i++) {
            if (slots[i][0] === slots[i][1] && slots[i][1] === slots[i][2]) {
                winAmount += payouts[slots[i][0]] * spinPrice;
            }
        }
        return winAmount;
    };

    const handleSpin = async () => {
        if (balance <= 0 || spinPrice > balance) {
            setResultMessage('BALANCE TOO LOW');
            return;
        }

        setIsAnimating(true);

        let newBalance = balance - spinPrice;
        const newSpins = spins + 1;

        const newSlots = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () => getRandomSymbol())
        );

        const animateSlot = (colIndex) => {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    setSlots((prevSlots) => {
                        const updatedSlots = prevSlots.map((row, rowIndex) => {
                            const newRow = [...row];
                            newRow[colIndex] = images[Math.floor(Math.random() * images.length)];
                            return newRow;
                        });
                        return updatedSlots;
                    });
                }, 50);

                setTimeout(() => {
                    clearInterval(interval);
                    setSlots((prevSlots) => {
                        const updatedSlots = prevSlots.map((row, rowIndex) => {
                            const newRow = [...row];
                            newRow[colIndex] = newSlots[rowIndex][colIndex];
                            return newRow;
                        });
                        return updatedSlots;
                    });
                    resolve();
                }, 300);
            });
        };

        await animateSlot(0);
        await animateSlot(1);
        await animateSlot(2);

        const winAmount = checkWin(newSlots);
        newBalance += winAmount;
        setResultMessage(winAmount > 0 ? `YOU WON $${winAmount}` : `YOU LOST $${spinPrice}`);

        const totalSpent = (spins * averageSpinPrice) + spinPrice;
        const newAverageSpinPrice = totalSpent / newSpins;

        setSpins(newSpins);
        setBalance(newBalance);
        setAverageSpinPrice(newAverageSpinPrice);

        setIsAnimating(false);
    };

    const handleExitWithWinnings = async () => {
        try {
            const response = await axios.post('http://localhost:8080/spin', {
                spins,
                balance,
                averageSpinPrice,
            });
            if (response.status === 200) {
                alert('Game data saved to database');
                window.location.href = `https://docs.google.com/forms/d/e/1FAIpQLSeGlygjMbiWggnMls8AJN-mu5XlIGd9H60pL6btILVxp05apA/viewform?usp=pp_url&entry.139623598=${spins}&entry.88120807=${balance}&entry.2048267293=${averageSpinPrice}&entry.103747839=1`;
            } else {
                console.error('Error saving game data:', response.status, response.statusText);
                alert('Failed to save game data');
            }
        } catch (error) {
            console.error('Error saving game data:', error);
            alert('Error saving game data');
        }
    };
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleInfoClick = () => {
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    return (
        <div className="slot-machine-page flex flex-col items-center bg-cover bg-center h-screen"
             style={{ backgroundImage: "url('/public/images/background.jpg')" }}>
            <h1 className="text-3xl font-bold"></h1>
            <div className="flex flex-col items-center">
                {/* Info button */}
                <div className="absolute top-4 right-4">
                    <button
                        className="w-14 h-14 bg-cover"
                        style={{backgroundImage: "url('/images/info.png')"}}
                        onClick={handleInfoClick}
                    >
                    </button>
                </div>
                {/* Slot design */}
                <div className="flex justify-center items-center w-2/5 relative v1frame">
                    <div
                        className="flex flex-wrap justify-center items-center bg-black/70 m-12 p-5 backdrop-blur-sm z-10">
                        {slots.flat().map((slot, index) => (
                            <img
                                key={index}
                                src={slot}
                                alt={`slot-${index}`}
                                className="w-1/3"
                            />
                        ))}
                    </div>
                    <img src="/images/v1frame.png" alt="frame"
                         className="absolute inset-0 w-full h-full object-cover z-20"/>
                </div>
                {/* Balance, Spin Price, and Spin Button */}
                <div className="flex justify-center items-center mt-4 bg-black/35 rounded-full w-1/2 relative">
                    {resultMessage && (
                        <div
                            className="flex-1 flex items-center justify-center text-center border-black h-full border-2 rounded-full">
                            <p className="font-bold">{resultMessage}</p>
                        </div>
                    )}
                    <div className="flex-1 text-center">
                        <p className="mb-2 font-bold">Balance</p>
                        <p>${balance}</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className="font-bold">Spin Price</p>
                        <div className="flex items-center justify-center">
                            <button
                                onClick={() => setSpinPrice(prev => Math.max(0, prev - 0.25))}
                                className="bg-red-500 text-white px-2 py-1 rounded-l-full"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                id="spinPrice"
                                value={spinPrice}
                                onChange={(e) => setSpinPrice(Number(e.target.value))}
                                className="border rounded-none px-2 py-1 w-20 text-center"
                            />
                            <button
                                onClick={() => setSpinPrice(prev => prev + 0.25)}
                                className="bg-green-500 text-white px-2 py-1 rounded-r-full"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 text-center relative">
                        <button
                            onClick={handleSpin}
                            className={`bg-[#402313] border-2 border-[#59331D] text-white font-medium rounded-full bg-cover bg-center absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 w-24 h-24 ${isAnimating ? 'bg-opacity-50 cursor-not-allowed' : ''}`}
                            style={{backgroundImage: "url('/images/spinbutton.png')"}}
                            disabled={isAnimating}>
                        </button>
                    </div>
                </div>
                {/* Spins and Average Spin Price */}
                {/*
                <div className="flex justify-center items-center w-full mt-4">
                    <div className="flex-1 text-center">
                        <p className="mb-2">Spins: {spins}</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className="mb-2">Average Spin Price: ${averageSpinPrice.toFixed(2)}</p>
                    </div>
                </div>
                */}
            </div>

            {/* exit with winnings button */}
            <div className="relative w-full">
                <button onClick={handleExitWithWinnings}
                        className="absolute right-10 bottom-1 bg-green-500 text-white p-4 rounded">Exit with Winnings
                </button>
            </div>
            {/* payouts table */}
            <div className="absolute left-20 top-40 p-10 bg-cover"
                 style={{backgroundImage: "url('/images/parchment.png')", backgroundSize: "100% 100%"}}>
                <h2 className="text-2xl font-bold">Payouts</h2>
                <div className="text-2xl">
                    <p>Anchor x2</p>
                    <p>Barrel x8</p>
                    <p>Skull x15</p>
                    <p>Sword x50</p>
                    <p>Bomb x100</p>
                    <p>Chest x200</p>
                </div>
            </div>
            {/* Modal */}
            <Modal isVisible={isModalVisible} onClose={handleCloseModal} />
        </div>
    );
}

export default SlotMachine;