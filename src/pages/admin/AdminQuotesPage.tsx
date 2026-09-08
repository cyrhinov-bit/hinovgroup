import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import {
  Search,
  FileText,
  Mail,
  Phone,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { QuoteRequest } from '../../types';

export const AdminQuotesPage: React.FC = () => {
  const { quotes, store } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteRequest | null>(null);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchStatus = statusFilter === 'all' || q.status === statusFilter;
      const qLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        q.name.toLowerCase().includes(qLower) ||
        q.email.toLowerCase().includes(qLower) ||
        q.phone.includes(qLower) ||
        (q.service_name && q.service_name.toLowerCase().includes(qLower));
      return matchStatus && matchSearch;
    });
  }, [quotes, statusFilter, searchTerm]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Demandes de Devis & Messages</h1>
          <p className="text-xs text-[#5F6673]">
            Boîte de réception commerciale de HINOV Group.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'nouveau', 'en_cours', 'traite', 'archive'].map((st) => {
            const count =
              st === 'all' ? quotes.length : quotes.filter((q) => q.status === st).length;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#4A94D1] text-white shadow-xs'
                    : 'bg-[#F5F7FA] text-[#5F6673] hover:bg-black/5 hover:text-[#111111]'
                }`}
              >
                {st === 'all' ? 'Toutes' : statusLabelMap[st]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Quotes Table */}
      <Card className="overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#5F6673]">
            Aucune demande de devis ne correspond à ces critères.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FA] border-b border-black/5 text-[#5F6673] uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-5">Client / Entreprise</th>
                  <th className="py-3 px-5">Coordonnées</th>
                  <th className="py-3 px-5">Service ciblé</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Statut</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-black/2 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#111111]">{q.name}</div>
                      {q.company && (
                        <div className="text-[11px] text-[#5F6673]">{q.company}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 space-y-0.5">
                      <a
                        href={`tel:${q.phone}`}
                        className="block font-mono text-[#4A94D1] hover:underline"
                      >
                        {q.phone}
                      </a>
                      <a
                        href={`mailto:${q.email}`}
                        className="block text-[11px] text-[#5F6673] hover:underline truncate max-w-xs"
                      >
                        {q.email}
                      </a>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#111111]">
                      {q.service_name || 'Général'}
                    </td>
                    <td className="py-3.5 px-5 text-[#5F6673]">
                      {new Date(q.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant={statusVariantMap[q.status] || 'default'}>
                        {statusLabelMap[q.status] || q.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedQuote(q)}
                      >
                        Ouvrir
                      </Button>
                      <button
                        onClick={() => setQuoteToDelete(q)}
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
        )}
      </Card>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedQuote(null)}
          title={`Demande de devis de : ${selectedQuote.name}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#F5F7FA] rounded-xl text-xs">
              <div>
                <span className="text-[#5F6673] block">Nom complet :</span>
                <strong className="text-[#111111]">{selectedQuote.name}</strong>
              </div>
              <div>
                <span className="text-[#5F6673] block">Entreprise / Organisation :</span>
                <strong className="text-[#111111]">{selectedQuote.company || 'Particulier'}</strong>
              </div>
              <div>
                <span className="text-[#5F6673] block">Téléphone direct :</span>
                <a href={`tel:${selectedQuote.phone}`} className="font-bold text-[#4A94D1]">
                  {selectedQuote.phone}
                </a>
              </div>
              <div>
                <span className="text-[#5F6673] block">Adresse Email :</span>
                <a href={`mailto:${selectedQuote.email}`} className="font-bold text-[#4A94D1]">
                  {selectedQuote.email}
                </a>
              </div>
              <div>
                <span className="text-[#5F6673] block">Service ciblé :</span>
                <strong className="text-[#111111]">{selectedQuote.service_name}</strong>
              </div>
              <div>
                <span className="text-[#5F6673] block">Budget estimatif :</span>
                <strong className="text-[#D38323]">{selectedQuote.budget || 'Non spécifié'}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Cahier des charges / Message du client :
              </h4>
              <div className="p-4 bg-white border border-black/10 rounded-xl text-xs text-[#5F6673] whitespace-pre-line leading-relaxed">
                {selectedQuote.message}
              </div>
            </div>

            {selectedQuote.attachment_name && (
              <div className="text-xs flex items-center gap-2 text-[#4A94D1] font-semibold bg-[#EBF4FC] p-3 rounded-xl">
                <FileText size={16} />
                Document joint par le client : <strong>{selectedQuote.attachment_name}</strong>
              </div>
            )}

            <div className="pt-4 border-t border-black/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#5F6673]">Statut du dossier :</span>
                <select
                  value={selectedQuote.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as any;
                    store.updateQuoteStatus(selectedQuote.id, newStatus);
                    setSelectedQuote({ ...selectedQuote, status: newStatus });
                  }}
                  className="rounded-lg border border-black/15 bg-white px-3 py-1 text-xs font-bold"
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="en_cours">En cours de traitement</option>
                  <option value="traite">Traité / Devis envoyé</option>
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

      {/* Delete Confirmation */}
      {quoteToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setQuoteToDelete(null)}
          onConfirm={() => {
            store.deleteQuote(quoteToDelete.id);
            setQuoteToDelete(null);
          }}
          title="Supprimer la demande ?"
          message={`Êtes-vous sûr de vouloir supprimer la demande de ${quoteToDelete.name} ? Cette action est irréversible.`}
          confirmVariant="danger"
          confirmLabel="Supprimer"
        />
      )}
    </div>
  );
};
