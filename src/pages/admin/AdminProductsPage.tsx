import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Badge } from '../../components/ui/Badge';
import { MediaPickerModal } from '../../components/admin/MediaPickerModal';
import { MediaDisplay } from '../../components/ui/MediaDisplay';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Star,
  ExternalLink,
  Check,
  Film,
} from 'lucide-react';
import { Product } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const { products, categories, store } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Specifications in edit modal
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === 'all' || p.category_id === categoryFilter;
      const matchQuery =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.reference.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, categoryFilter, searchTerm]);

  const handleOpenAdd = () => {
    const defaultCat = categories[0];
    setEditingProduct({
      name: '',
      slug: '',
      reference: `REF-${Date.now().toString().slice(-4)}`,
      category_id: defaultCat?.id || '',
      category_name: defaultCat?.name || '',
      short_description: '',
      description: '',
      price: 5000,
      currency: 'FCFA',
      price_display_mode: 'show',
      primary_image_url:
        'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80',
      availability: 'in_stock',
      is_featured: false,
      status: 'published',
      specifications: [],
    });
  };

  const handleSave = () => {
    if (!editingProduct || !editingProduct.name) return;

    const slug =
      editingProduct.slug ||
      editingProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const cat = categories.find((c) => c.id === editingProduct.category_id);

    if (editingProduct.id) {
      store.updateProduct(editingProduct.id, {
        ...editingProduct,
        slug,
        category_name: cat ? cat.name : editingProduct.category_name,
      });
    } else {
      store.addProduct({
        ...editingProduct,
        slug,
        category_name: cat ? cat.name : 'Fournitures',
      } as any);
    }

    setEditingProduct(null);
  };

  const handleAddSpec = () => {
    if (!specKey.trim() || !specVal.trim() || !editingProduct) return;
    const specs = editingProduct.specifications || [];
    setEditingProduct({
      ...editingProduct,
      specifications: [...specs, { key: specKey.trim(), value: specVal.trim() }],
    });
    setSpecKey('');
    setSpecVal('');
  };

  const handleRemoveSpec = (idx: number) => {
    if (!editingProduct) return;
    const specs = [...(editingProduct.specifications || [])];
    specs.splice(idx, 1);
    setEditingProduct({ ...editingProduct, specifications: specs });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Catalogue des Produits & Fournitures</h1>
          <p className="text-xs text-[#5F6673]">
            Gestion des articles, tarifs, disponibilités et visuels du catalogue vitrine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href="/catalogue" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink size={14} />}>
              Voir le catalogue public
            </Button>
          </a>
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={handleOpenAdd}>
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Rechercher nom ou référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#5F6673] font-bold">Catégorie :</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-black/15 bg-[#F5F7FA] px-3 py-1.5 text-xs font-semibold"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] border-b border-black/5 text-[#5F6673] uppercase font-bold text-[10px]">
              <tr>
                <th className="py-3 px-5">Produit</th>
                <th className="py-3 px-5">Référence</th>
                <th className="py-3 px-5">Catégorie</th>
                <th className="py-3 px-5">Tarif affiché</th>
                <th className="py-3 px-5">Disponibilité</th>
                <th className="py-3 px-5">Statut</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-black/2 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-black/10 shrink-0 bg-black/5">
                        <MediaDisplay
                          imageUrl={p.primary_image_url}
                          imageAlt={p.name}
                          className="w-full h-full object-cover"
                          aspectRatioClassName="aspect-square"
                          autoPlay={false}
                          loop={false}
                          muted={true}
                          showControls={false}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#111111] truncate max-w-xs">{p.name}</div>
                        {p.is_featured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D38323]">
                            <Star size={10} className="fill-current" /> En vedette
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-[#5F6673]">
                    {p.reference}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-[#111111]">
                    {p.category_name}
                  </td>
                  <td className="py-3.5 px-5 font-bold">
                    {p.price_display_mode === 'show' && p.price ? (
                      <span className="text-[#D38323]">
                        {p.price.toLocaleString('fr-FR')} {p.currency}
                      </span>
                    ) : p.price_display_mode === 'on_demand' ? (
                      <span className="text-[#4A94D1]">Sur demande</span>
                    ) : (
                      <span className="text-[#5F6673]">Masqué</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge variant={p.availability === 'in_stock' ? 'success' : 'warning'}>
                      {p.availability === 'in_stock' ? 'En stock' : 'Sur commande'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge variant={p.status === 'published' ? 'info' : 'default'}>
                      {p.status === 'published' ? 'Publié' : 'Brouillon'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProduct({ ...p })}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <button
                      onClick={() => setProductToDelete(p)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 inline-flex items-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit/Add Modal */}
      {editingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          title={editingProduct.id ? `Modifier : ${editingProduct.name}` : 'Ajouter un nouveau produit'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom de l'article"
                value={editingProduct.name || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                required
              />
              <Input
                label="Référence interne / SKU"
                value={editingProduct.reference || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, reference: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Catégorie"
                value={editingProduct.category_id || ''}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, category_id: e.target.value })
                }
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Affichage du prix"
                value={editingProduct.price_display_mode || 'show'}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price_display_mode: e.target.value as any,
                  })
                }
              >
                <option value="show">Afficher le prix</option>
                <option value="on_demand">Prix sur demande</option>
                <option value="hide">Masquer le prix</option>
              </Select>

              <Input
                label="Prix unitaire (FCFA)"
                type="number"
                value={editingProduct.price || 0}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Disponibilité"
                value={editingProduct.availability || 'in_stock'}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, availability: e.target.value as any })
                }
              >
                <option value="in_stock">En stock</option>
                <option value="on_order">Sur commande</option>
                <option value="out_of_stock">Épuisé</option>
              </Select>

              <Select
                label="Statut publication"
                value={editingProduct.status || 'published'}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, status: e.target.value as any })
                }
              >
                <option value="published">Publié</option>
                <option value="draft">Brouillon</option>
              </Select>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-xs font-bold text-[#111111] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured || false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_featured: e.target.checked })
                    }
                    className="rounded text-[#D38323] focus:ring-[#D38323]"
                  />
                  Mettre en vedette (Accueil)
                </label>
              </div>
            </div>

            <Textarea
              label="Description courte"
              value={editingProduct.short_description || ''}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, short_description: e.target.value })
              }
              rows={2}
            />

            {/* Image or Video via MediaPicker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                Photo ou Vidéo principale du produit
              </label>
              <div className="flex items-center gap-4 p-3 rounded-xl border border-black/10 bg-[#F5F7FA]">
                {editingProduct.primary_image_url ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-black/10 shrink-0 bg-black">
                    <MediaDisplay
                      imageUrl={editingProduct.primary_image_url}
                      imageAlt={editingProduct.name || ''}
                      className="w-full h-full object-cover"
                      aspectRatioClassName="aspect-square"
                      autoPlay={false}
                      loop={false}
                      muted={true}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                    <ImageIcon size={18} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-[#5F6673] truncate">
                    {typeof editingProduct.primary_image_url === 'string'
                      ? editingProduct.primary_image_url
                      : (editingProduct.primary_image_url as any)?.url || 'Aucun média'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => setIsMediaPickerOpen(true)}
                  >
                    Changer la photo / vidéo
                  </Button>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-3 pt-2 border-t border-black/10">
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                Caractéristiques techniques ({editingProduct.specifications?.length || 0})
              </label>
              <div className="space-y-1.5">
                {(editingProduct.specifications || []).map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#F5F7FA] text-xs"
                  >
                    <span className="font-semibold text-[#5F6673]">{spec.key} :</span>
                    <strong className="text-[#111111]">{spec.value}</strong>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  placeholder="Propriété (ex: Format)"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                />
                <Input
                  placeholder="Valeur (ex: A4 80g)"
                  value={specVal}
                  onChange={(e) => setSpecVal(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={handleAddSpec}>
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-3">
              <Button variant="outline" size="md" onClick={() => setEditingProduct(null)}>
                Annuler
              </Button>
              <Button variant="primary" size="md" onClick={handleSave} leftIcon={<Check size={16} />}>
                Enregistrer l'article
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Media Picker */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(selected) => {
            if (editingProduct) {
              const url = typeof selected === 'string' ? selected : selected.url;
              setEditingProduct({ ...editingProduct, primary_image_url: url });
            }
            setIsMediaPickerOpen(false);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {productToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setProductToDelete(null)}
          onConfirm={() => {
            store.deleteProduct(productToDelete.id);
            setProductToDelete(null);
          }}
          title="Supprimer ce produit ?"
          message={`Êtes-vous sûr de vouloir retirer définitivement "${productToDelete.name}" du catalogue ?`}
          confirmVariant="danger"
          confirmLabel="Supprimer définitivement"
        />
      )}
    </div>
  );
};
