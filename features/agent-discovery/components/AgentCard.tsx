import React from 'react';

interface AgentCardProps {
  name: string;
  description: string;
  rating: number;
  price: number;
  onClick: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ name, description, rating, price, onClick }) => {
  return (
    <div
      className="p-4 border border-gray-300 rounded-lg hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-yellow-500">⭐ {rating}</span>
        <span className="text-blue-500">{price} XLM</span>
      </div>
    </div>
  );
};

export default AgentCard;