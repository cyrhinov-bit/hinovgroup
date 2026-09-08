import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Briefcase,
  Package,
  Layers,
  Inbox,
  ArrowRight,
  Clock,
  CheckCircle,
  FileText,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { QuoteRequest } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { services, products, projects, quotes, store } = useStore();
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  const newQuotes = quotes.filter((q) => q.status === 'nouveau');
  const recentQuotes = [...quotes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  const statusVariantMap: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
    nouveau: 'warning',
    en_cours: 'info',
    traite: 'success',
    archive: 'default',
  };

  const statusLabelMap: Record<string, string> = {
    nouveau: 'Nouveau',
    en_cours: 'En cours',
    traite: 'Traité',
    archive: 'Archivé',
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Tableau de Bord HINOV Group</h1>
          <p className="text-xs text-[#5F6673]">
            Supervision de l'activité, gestion des demandes de devis et pilotage du contenu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/products">
            <Button variant="outline" size="sm" leftIcon={<Plus size={14} />}>
              Nouveau produit
            </Button>
          </Link>
          <Link to="/admin/quotes">
            <Button variant="primary" size="sm" leftIcon={<Inbox size={14} />}>
              Voir les devis ({quotes.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF4FC] text-[#4A94D1] flex items-center justify-center shrink-0">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5F6673]">Pôles d'expertise</p>
            <p className="text-2xl font-extrabold text-[#111111]">{services.length}</p>
            <span className="text-[11px] text-[#4A94D1] font-bold">5 officiels</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF5EB] text-[#D38323] flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5F6673]">Articles au catalogue</p>
            <p className="text-2xl font-extrabold text-[#111111]">{products.length}</p>
            <span className="text-[11px] text-[#D38323] font-bold">
              {products.filter((p) => p.status === 'published').length} en ligne
            </span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E9FAF0] text-[#4AD07B] flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5F6673]">Réalisations</p>
            <p className="text-2xl font-extrabold text-[#111111]">{projects.length}</p>
            <span className="text-[11px] text-[#4AD07B] font-bold">Portfolio certifié</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F9ECF6] text-[#A6378D] flex items-center justify-center shrink-0">
            <Inbox size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#5F6673]">Demandes reçues</p>
            <p className="text-2xl font-extrabold text-[#111111]">{quotes.length}</p>
            <span className="text-[11px] text-[#A6378D] font-bold">
              {newQuotes.length} en attente
            </span>
          </div>
        </Card>
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link to="/admin/pages" className="block">
          <Card hoverEffect className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#111111]">Gestionnaire de pages</h3>
              <p className="text-xs text-[#5F6673]">Éditer textes, bannières et sections de l'accueil</p>
            </div>
            <ArrowRight size={18} className="text-[#4A94D1]" />
          </Card>
        </Link>

        <Link to="/admin/media" className="block">
          <Card hoverEffect className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#111111]">Médiathèque HINOV</h3>
              <p className="text-xs text-[#5F6673]">Ajouter des images, photos de réalisations et visuels</p>
            </div>
            <ArrowRight size={18} className="text-[#D38323]" />
          </Card>
        </Link>

        <Link to="/admin/settings" className="block">
          <Card hoverEffect className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#111111]">Coordonnées & Réseaux</h3>
              <p className="text-xs text-[#5F6673]">Mettre à jour téléphone, WhatsApp, adresse</p>
            </div>
            <ArrowRight size={18} className="text-[#4AD07B]" />
          </Card>
        </Link>
      </div>

      {/* Recent Quotes Table */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-black/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#111111]">Dernières demandes de devis</h2>
            <p className="text-xs text-[#5F6673]">Demandes enregistrées via le site public</p>
          </div>
          <Link to="/admin/quotes">
            <Button variant="ghost" size="sm" rightIcon={<ExternalLink size={14} />}>
              Gérer toutes les demandes
            </Button>
          </Link>
        </div>

        {recentQuotes.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#5F6673]">
            Aucune demande de devis pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FA] border-b border-black/5 text-[#5F6673] uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-5">Contact</th>
                  <th className="py-3 px-5">Service demandé</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Statut</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-black/2 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#111111]">{q.name}</div>
                      <div className="text-[#5F6673] text-[11px]">{q.phone} &bull; {q.email}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#111111]">
                      {q.service_name}
                    </td>
                    <td className="py-3.5 px-5 text-[#5F6673]">
                      {new Date(q.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant={statusVariantMap[q.status] || 'default'}>
                        {statusLabelMap[q.status] || q.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedQuote(q)}
                      >
                        Consulter
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedQuote(null)}
          title={`Détail de la demande : ${selectedQuote.name}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#F5F7FA] rounded-xl text-xs">
              <div>
                <span className="text-[#5F6673] block">Nom :</span>
                <strong className="text-[#111111]">{selectedQuote.name}</strong>
              </div>
              <div>
                <span className="text-[#5F6673] block">Entreprise :</span>
                <strong className="text-[#111111]">{selectedQuote.company || 'Particulier'}</strong>
              </div>
              <div>
                <span className="text-[#5F6673] block">Téléphone :</span>
                <a href={`tel:${selectedQuote.phone}`} className="font-bold text-[#4A94D1]">
                  {selectedQuote.phone}
                </a>
              </div>
              <div>
                <span className="text-[#5F6673] block">Email :</span>
                <a href={`mailto:${selectedQuote.email}`} className="font-bold text-[#4A94D1]">
                  {selectedQuote.email}
                </a>
              </div>
              <div>
                <span className="text-[#5F6673] block">Pôle sollicité :</span>
                <strong className="text-[#111111]">{selectedQuote.service_name}</strong>
              </div>
              <div>
                <span className="text-[#5F6673] block">Budget estimé :</span>
                <strong className="text-[#D38323]">{selectedQuote.budget || 'Non spécifié'}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Message / Cahier des charges :
              </h4>
              <p className="p-4 bg-white border border-black/10 rounded-xl text-xs text-[#5F6673] whitespace-pre-line leading-relaxed">
                {selectedQuote.message}
              </p>
            </div>

            {selectedQuote.attachment_name && (
              <div className="text-xs flex items-center gap-2 text-[#4A94D1] font-semibold">
                <FileText size={16} />
                Document joint : {selectedQuote.attachment_name}
              </div>
            )}

            <div className="pt-4 border-t border-black/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5F6673]">Changer statut :</span>
                <select
                  value={selectedQuote.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    store.updateQuoteStatus(selectedQuote.id, newStatus);
                    setSelectedQuote({ ...selectedQuote, status: newStatus });
                  }}
                  className="rounded-lg border border-black/15 bg-white px-2.5 py-1 text-xs font-bold"
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="en_cours">En cours</option>
                  <option value="traite">Traité</option>
                  <option value="archive">Archivé</option>
                </select>
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedQuote(null)}>
                Fermer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
