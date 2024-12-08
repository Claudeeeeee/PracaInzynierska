import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SlotMachine from './SlotMachine';
import Second from './second';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={
                    <div>
                        <SlotMachine />
                    </div>
                } />
                <Route path="/2" element={<Second />} />
            </Routes>
        </Router>
    );
}

export default App;