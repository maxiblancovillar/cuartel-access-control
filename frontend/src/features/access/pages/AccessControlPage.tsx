import React, { useState } from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card } from '@/components/ui/Card';
import { ScannerInput } from '../components/ScannerInput';
import { FormPresente } from '../components/FormPresente';
import { FormVisita } from '../components/FormVisita';
import { Alert } from '@/components/ui/Alert';

type TabType = 'presente' | 'visita';

export const AccessControlPage: React.FC = () => {
  const [tab, setTab] = useState<TabType>('presente');
  const [dni, setDni] = useState('');

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">📋 Registrar Acceso</h1>

        <Card title="Escanear o Ingresar DNI">
          <ScannerInput onDniScanned={setDni} />
        </Card>

        {dni && (
          <>
            <Alert variant="info">
              DNI: <span className="font-bold">{dni}</span>
            </Alert>

            <div className="flex gap-4">
              <button
                onClick={() => setTab('presente')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  tab === 'presente' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                Dar Presente
              </button>
              <button
                onClick={() => setTab('visita')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  tab === 'visita' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                Registrar Visita
              </button>
            </div>

            {tab === 'presente' && <FormPresente dni={dni} onSuccess={() => setDni('')} />}
            {tab === 'visita' && <FormVisita dni={dni} onSuccess={() => setDni('')} />}
          </>
        )}
      </div>
    </ProtectedLayout>
  );
};
