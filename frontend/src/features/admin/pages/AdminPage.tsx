import React, { useState } from 'react';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { UsersTab } from '../components/UsersTab';
import { UnitsTab } from '../components/UnitsTab';
import { AuditTab } from '../components/AuditTab';

type TabType = 'usuarios' | 'unidades' | 'auditoria';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('usuarios');

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'usuarios', label: '👥 Usuarios' },
    { id: 'unidades', label: '🏢 Unidades' },
    { id: 'auditoria', label: '📋 Auditoría' },
  ];

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">⚙️ Administración</h1>

        <div className="flex gap-2 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'usuarios' && <UsersTab />}
        {activeTab === 'unidades' && <UnitsTab />}
        {activeTab === 'auditoria' && <AuditTab />}
      </div>
    </ProtectedLayout>
  );
};
