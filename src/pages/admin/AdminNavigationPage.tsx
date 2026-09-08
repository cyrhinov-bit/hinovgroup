import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ArrowUp, ArrowDown, Eye, EyeOff, Plus, Trash2, Check } from 'lucide-react';
import { NavItem } from '../../types';

export const AdminNavigationPage: React.FC = () => {
  const { navigation, store } = useStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newPath, setNewPath] = useState('');

  const sortedNav = [...navigation].sort((a, b) => a.sort_order - b.sort_order);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedNav.length) return;

    const currentItem = sortedNav[index];
    const targetItem = sortedNav[targetIndex];

    const currentOrder = currentItem.sort_order;
    store.updateNavigation(currentItem.id, { sort_order: targetItem.sort_order });
    store.updateNavigation(targetItem.id, { sort_order: currentOrder });
  };

  const handleToggle = (id: string, current: boolean) => {
    store.updateNavigation(id, { is_visible: !current });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newPath.trim()) return;

    store.addNavigationItem({
      label: newLabel.trim(),
      path: newPath.trim(),
      sort_order: navigation.length + 1,
      is_visible: true,
    });

    setIsAddOpen(false);
    setNewLabel('');
    setNewPath('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Menu & Navigation du Site</h1>
          <p className="text-xs text-[#5F6673]">
            Gérez les éléments visibles dans l'en-tête principal et leur ordre d'affichage.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setIsAddOpen(true)}
        >
          Ajouter un lien de menu
        </Button>
      </div>

      <div className="space-y-3">
        {sortedNav.map((item, idx) => (
          <Card
            key={item.id}
            className={`p-4 flex items-center justify-between transition-all ${
              !item.is_visible ? 'opacity-50 bg-gray-50' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="w-6 h-6 rounded-lg bg-[#F5F7FA] text-[#5F6673] flex items-center justify-center font-mono text-xs font-bold">
                {idx + 1}
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#111111]">{item.label}</h3>
                <span className="font-mono text-xs text-[#5F6673]">{item.path}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={idx === 0}
                onClick={() => handleMove(idx, 'up')}
                className="p-1.5 rounded-lg hover:bg-black/5 text-[#5F6673] disabled:opacity-20"
                title="Monter"
              >
                <ArrowUp size={16} />
              </button>
              <button
                disabled={idx === sortedNav.length - 1}
                onClick={() => handleMove(idx, 'down')}
                className="p-1.5 rounded-lg hover:bg-black/5 text-[#5F6673] disabled:opacity-20"
                title="Descendre"
              >
                <ArrowDown size={16} />
              </button>
              <button
                onClick={() => handleToggle(item.id, item.is_visible)}
                className="p-1.5 rounded-lg hover:bg-black/5 text-[#5F6673]"
                title={item.is_visible ? 'Masquer' : 'Afficher'}
              >
                {item.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button
                onClick={() => store.deleteNavigationItem(item.id)}
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {isAddOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddOpen(false)}
          title="Ajouter un lien de menu"
        >
          <form onSubmit={handleAdd} className="space-y-4">
            <Input
              label="Libellé du lien"
              placeholder="Ex: Foire aux questions"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              required
            />
            <Input
              label="Chemin relatif ou URL"
              placeholder="Ex: /faq"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              required
            />
            <div className="pt-4 border-t border-black/10 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" type="submit" leftIcon={<Check size={14} />}>
                Ajouter
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
