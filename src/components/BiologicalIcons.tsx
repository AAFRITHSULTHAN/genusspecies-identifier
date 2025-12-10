import React from 'react';
import { 
  Dna, 
  Leaf, 
  Bird, 
  Fish, 
  Bug, 
  TreePine, 
  Flower, 
  Microscope,
  Atom,
  Zap
} from 'lucide-react';

export const BiologicalIcons: React.FC = () => {
  const icons = [
    { Icon: Dna, color: 'text-blue-500', delay: '0s' },
    { Icon: Leaf, color: 'text-green-500', delay: '0.2s' },
    { Icon: Bird, color: 'text-yellow-500', delay: '0.4s' },
    { Icon: Fish, color: 'text-cyan-500', delay: '0.6s' },
    { Icon: Bug, color: 'text-orange-500', delay: '0.8s' },
    { Icon: TreePine, color: 'text-emerald-600', delay: '1s' },
    { Icon: Flower, color: 'text-pink-500', delay: '1.2s' },
    { Icon: Microscope, color: 'text-purple-500', delay: '1.4s' },
    { Icon: Atom, color: 'text-indigo-500', delay: '1.6s' },
    { Icon: Zap, color: 'text-amber-500', delay: '1.8s' }
  ];

  return (
    <div className="flex justify-center items-center space-x-6 py-8">
      {icons.map(({ Icon, color, delay }, index) => (
        <div
          key={index}
          className="animate-bounce"
          style={{ animationDelay: delay, animationDuration: '2s' }}
        >
          <Icon className={`w-8 h-8 ${color} transition-transform hover:scale-125 cursor-pointer`} />
        </div>
      ))}
    </div>
  );
};