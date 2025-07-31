import { useState, useEffect } from "react";
import { X, Trophy } from "lucide-react";

const motivationalMessages = [
  "Bora pra cima, hoje é dia de meta!",
  "Você está mais perto do que imagina!",
  "Motorista campeão não foge da pista!",
  "Sua determinação é sua maior força!",
  "Cada corrida te leva mais próximo do objetivo!",
  "Foco na meta, sucesso garantido!",
  "Hoje é um novo dia para conquistar!",
  "Sua perseverança vale ouro!",
];

export function MotivationalPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Show popup 2 seconds after app loads
    const timer = setTimeout(() => {
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setMessage(randomMessage);
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-4 top-20 bg-gradient-to-r from-app-primary to-app-success p-4 rounded-2xl card-shadow z-40 motivational-popup">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{message}</p>
            <p className="text-white/80 text-xs mt-1">Continue assim, você está no caminho certo!</p>
          </div>
        </div>
        <button 
          onClick={handleClose}
          className="text-white/80 hover:text-white text-lg ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
