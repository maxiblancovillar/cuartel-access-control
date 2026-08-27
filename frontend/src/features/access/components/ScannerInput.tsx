import React, { useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ScannerInputProps {
  onDniScanned: (dni: string) => void;
}

export const ScannerInput: React.FC<ScannerInputProps> = ({ onDniScanned }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const dni = inputRef.current?.value || '';
      if (dni.length >= 7) {
        onDniScanned(dni);
        inputRef.current!.value = '';
      }
    }
  };

  const handleScan = () => {
    const dni = inputRef.current?.value || '';
    if (dni.length >= 7) {
      onDniScanned(dni);
      inputRef.current!.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        📱 Escanea el DNI con lector PDF417 o ingresa manualmente
      </p>
      <div className="flex gap-2">
        <Input ref={inputRef} placeholder="DNI (ej: 38123456)" onKeyDown={handleKeyDown} maxLength={8} />
        <Button onClick={handleScan}>Buscar</Button>
      </div>
    </div>
  );
};
