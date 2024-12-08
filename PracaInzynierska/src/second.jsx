import { useState } from 'react';
import axios from 'axios';

function SlotMachine() {
    const gameVersion = 2;
    const [spins, setSpins] = useState(0);
    const [balance, setBalance] = useState(100);
    const [averageSpinPrice, setAverageSpinPrice] = useState(0);
    const [slots, setSlots] = useState([
        ['images/cherry.jpg', 'images/lemon.jpg', 'images/watermelon.jpg'],
        ['images/cherry.jpg', 'images/lemon.jpg', 'images/watermelon.jpg'],
        ['images/cherry.jpg', 'images/lemon.jpg', 'images/watermelon.jpg']
    ]);
    const [spinPrice, setSpinPrice] = useState(10);
    const [resultMessage, setResultMessage] = useState('');
    const images = [
        'images/cherry.jpg',
        'images/lemon.jpg',
        'images/watermelon.jpg',
        'images/bell.jpg',
        'images/orange.jpg',
        'images/plum.jpg'
    ];

    const payouts = {
        'images/cherry.jpg': 2,
        'images/lemon.jpg': 8,
        'images/watermelon.jpg': 15,
        'images/bell.jpg': 50,
        'images/orange.jpg': 100,
        'images/plum.jpg': 200
    };

    const probabilities = {
        'images/cherry.jpg': 0.35,
        'images/lemon.jpg': 0.25,
        'images/watermelon.jpg': 0.2,
        'images/bell.jpg': 0.10,
        'images/orange.jpg': 0.07,
        'images/plum.jpg': 0.03
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
            setResultMessage('balance is too small');
            return;
        }

        let newBalance = balance - spinPrice;
        const newSpins = spins + 1;

        const newSlots = Array.from({ length: 3 }, () =>
            Array.from({ length: 3 }, () => getRandomSymbol())
        );

        setSlots(newSlots);

        const winAmount = checkWin(newSlots);
        newBalance += winAmount;
        setResultMessage(winAmount > 0 ? `YOU WON $${winAmount}` : `YOU LOST $${spinPrice}`);

        const totalSpent = (spins * averageSpinPrice) + spinPrice;
        const newAverageSpinPrice = totalSpent / newSpins;

        setSpins(newSpins);
        setBalance(newBalance);
        setAverageSpinPrice(newAverageSpinPrice);
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
                window.location.href = `https://docs.google.com/forms/d/e/1FAIpQLSeGlygjMbiWggnMls8AJN-mu5XlIGd9H60pL6btILVxp05apA/viewform?usp=pp_url&entry.139623598=${spins}&entry.88120807=${balance}&entry.2048267293=${averageSpinPrice}&entry.103747839=2`;
            } else {
                console.error('Error saving game data:', response.status, response.statusText);
                alert('Failed to save game data');
            }
        } catch (error) {
            console.error('Error saving game data:', error);
            alert('Error saving game data');
        }
    };

    return (
        <div className="slot-machine-page flex flex-col items-center">
            {/* Title */}
            <div className="p-20 absolute flex items-center text-white">
                {resultMessage && <p className="text-xl font-bold">{resultMessage}</p>}
            </div>
            <h1 className="text-3xl font-bold mb-4 p-40"></h1>
            <div className="flex flex-col items-center">
                {/* Slot design */}
                <div className="bg-black/35 flex flex-wrap justify-center items-center w-80">
                    {slots.flat().map((slot, index) => (
                        <img key={index} src={slot} alt={`slot-${index}`}
                             className="w-1/3 m-0 p-0 object-cover"/>
                    ))}
                </div>
                {/* Balance, Spin Price, and Spin Button */}
                <div className="flex justify-center items-center w-full mt-4 bg-black/35 rounded-full">
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
                    <div className="flex-1 text-center">
                        <button onClick={handleSpin}
                                className="bg-[#402313] border-2 border-[#59331D] text-white font-medium px-4 py-2 rounded-full">Spin
                        </button>
                    </div>
                </div>
                {/* Spins and Average Spin Price */}
                <div className="flex justify-center items-center w-full mt-4">
                    <div className="flex-1 text-center">
                        <p className="mb-2">Spins: {spins}</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className="mb-2">Average Spin Price: ${averageSpinPrice.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            {/* exit with winnings button */}
            <div className="relative w-full mt-4">
                <button onClick={handleExitWithWinnings}
                        className="absolute right-0 bg-green-500 text-white p-4 m-4 rounded">Exit with Winnings
                </button>
            </div>
            {/* payouts table */}
            <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">Payouts</h2>
                <ul>
                    {Object.entries(payouts).map(([fruit, payout]) => (
                        <li key={fruit}>{fruit.split('/').pop().split('.')[0]} x{payout}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SlotMachine;