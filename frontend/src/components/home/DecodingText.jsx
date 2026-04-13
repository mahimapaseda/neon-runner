import React, { useEffect, useState } from 'react';

const DecodingText = ({ text, active }) => {
    const [display, setDisplay] = useState(text);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%&';

    useEffect(() => {
        let iteration = 0;
        let interval = null;

        if (active) {
            interval = setInterval(() => {
                setDisplay(text.split('').map((char, index) => {
                    if (index < iteration) return text[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join(''));

                if (iteration >= text.length) clearInterval(interval);
                iteration += 1 / 3;
            }, 30);
        }

        return () => clearInterval(interval);
    }, [active, text, chars]);

    const displayText = active ? display : text;
    return <span className="decoding-text">{displayText}</span>;
};

export default DecodingText;
