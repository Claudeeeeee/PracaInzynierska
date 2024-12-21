import React from 'react';

function Modal({ isVisible, onClose }) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg relative">
                <button onClick={onClose} className="absolute top-2 right-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="p-5">
                    <h1>GAME EXPLANATION</h1>
                    <p>tu bedzie info essa</p>
                </div>
            </div>
        </div>
    );
}

export default Modal;