import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import { ProductCategory } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, products, store } = useStore();
  const [editingCategory, setEditingCategory] = useState<Partial<ProductCategory> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);

  const handleSave = () => {
    if (!editingCategory || !editingCategory.name) return;

    const slug =
      editingCategory.slug ||
      editingCategory.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    if (editingCategory.id) {
      store.updateCategory(editingCategory.id, {
        ...editingCategory,
        slug,
      });
    } else {
      store.addCategory({
        name: editingCategory.name,
        slug,
        description: editingCategory.description || '',
        sort_order: categories.length + 1,
        is_active: true,
      });
    }

    setEditingCategory(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Catégories du Catalogue</h1>
          <p className="text-xs text-[#5F6673]">
            Organisez vos fournitures, matériels informatiques et consommables par rayon.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() =>
            setEditingCategory({
              name: '',
              slug: '',
              description: '',
              is_active: true,
            })
          }
        >
          Nouvelle catégorie
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.category_id === cat.id).length;

          return (
            <Card key={cat.id} className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#4A94D1] uppercase tracking-wider">
                    {productCount} article{productCount > 1 ? 's' : ''}
                  </span>
                  <span className="font-mono text-[10px] text-[#5F6673]">/{cat.slug}</span>
                </div>
                <h3 className="text-base font-bold text-[#111111]">{cat.name}</h3>
                <p className="text-xs text-[#5F6673] line-clamp-2">
                  {cat.description || 'Aucune description spécifique.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit2 size={12} />}
                  onClick={() => setEditingCategory({ ...cat })}
                >
                  Modifier
                </Button>
                <button
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 inline-flex items-center"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <Modal
          isOpen={true}
          onClose={() => setEditingCategory(null)}
          title={editingCategory.id ? `Modifier : ${editingCategory.name}` : 'Nouvelle catégorie'}
        >
          <div className="space-y-4">
            <Input
              label="Nom de la catégorie"
              placeholder="Ex: Papeterie scolaire"
              value={editingCategory.name || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              required
            />
            <Input
              label="Identifiant URL (Slug)"
              placeholder="Ex: papeterie-scolaire"
              value={editingCategory.slug || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
            />
            <Textarea
              label="Description facultative"
              placeholder="Description courte de la catégorie..."
              value={editingCategory.description || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
              rows={3}
            />

            <div className="pt-4 border-t border-black/10 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setEditingCategory(null)}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} leftIcon={<Check size={14} />}>
                Enregistrer
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {categoryToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={() => {
            store.deleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
          }}
          title="Supprimer la catégorie ?"
          message={`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryToDelete.name}" ? Les produits associés ne seront pas supprimés mais n'auront plus de catégorie.`}
          confirmVariant="danger"
          confirmLabel="Supprimer"
        />
      )}
    </div>
  );
};
