import '../index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Expanded = () => {
    return (
        <div className="w-full h-screen overflow-auto">

        </div>
    );
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Expanded />
    </StrictMode>
);
