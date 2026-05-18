/* Card Component */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`p-6 rounded-lg border border-cosmic-purple/30 hover:border-cosmic-purple/60 hover:shadow-lg hover:shadow-cosmic-purple/20 transition-smooth nebula-bg ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
