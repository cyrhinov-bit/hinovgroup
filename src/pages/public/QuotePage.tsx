import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import {
  CheckCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Upload,
  MessageCircle,
} from 'lucide-react';

export const QuotePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { services, settings, store } = useStore();

  const preselectedService = searchParams.get('service') || '';
  const preselectedProduct = searchParams.get('product') || '';
  const preselectedRef = searchParams.get('ref') || '';

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('');
  const [consent, setConsent] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const publishedServices = services.filter((s) => s.status === 'published');

  useEffect(() => {
    if (preselectedService) {
      const match = publishedServices.find((s) => s.slug === preselectedService);
      if (match) setServiceId(match.id);
    }
    if (preselectedProduct) {
      setMessage(
        `Demande de devis pour l'article : ${preselectedProduct}${
          preselectedRef ? ` (Référence : ${preselectedRef})` : ''
        }.\nQuantité estimée : \nDélai souhaité : `
      );
    }
  }, [preselectedService, preselectedProduct, preselectedRef, publishedServices]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 10 Mo.');
        return;
      }
      setAttachmentName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !phone.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!consent) {
      setErrorMessage('Veuillez accepter le traitement de vos informations pour établir le devis.');
      return;
    }

    setIsSubmitting(true);

    try {
      const chosenService = publishedServices.find((s) => s.id === serviceId);
      const chosenServiceName = chosenService ? chosenService.name : (serviceId || 'Prestation Générale');

      await store.addQuote({
        name: name.trim(),
        company: company.trim() || undefined,
        phone: phone.trim(),
        email: email.trim(),
        service_id: serviceId || undefined,
        service_name: chosenServiceName,
        message: message.trim(),
        budget: budget.trim() || undefined,
        attachment_name: attachmentName || undefined,
      });

      // Prepare WhatsApp message
      const rawPhone = (settings.whatsapp || '+2250719549582').replace(/\D/g, '');
      const waMsg =
        `*NOUVELLE DEMANDE DE DEVIS — HINOV GROUP*\n\n` +
        `👤 *Nom :* ${name.trim()}\n` +
        (company.trim() ? `🏢 *Entreprise :* ${company.trim()}\n` : '') +
        `📞 *Téléphone :* ${phone.trim()}\n` +
        `✉️ *Email :* ${email.trim()}\n` +
        `🛠️ *Service / Produit :* ${chosenServiceName}\n` +
        (budget.trim() ? `💰 *Budget :* ${budget.trim()}\n` : '') +
        `📝 *Détail du besoin :*\n${message.trim()}\n\n` +
        `_Envoyé depuis le site officiel HINOV Group_`;

      const generatedUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(waMsg)}`;
      setWhatsappUrl(generatedUrl);

      // Open WhatsApp in new tab/app
      window.open(generatedUrl, '_blank', 'noopener,noreferrer');

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('Erreur soumission devis:', err);
      setIsSubmitting(false);
      setErrorMessage('Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.');
    }
  };

  const handleReset = () => {
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setServiceId('');
    setMessage('');
    setBudget('');
    setConsent(false);
    setAttachmentName('');
    setWhatsappUrl('');
    setIsSuccess(false);
  };

  return (
    <div className="w-full py-12 sm:py-16 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDF5EB] border border-[#D38323]/20">
            <span className="w-2 h-2 rounded-full bg-[#D38323]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#B26A15]">
              Étude gratuite & sans engagement
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
            Demande de Devis Professionnel
          </h1>
          <p className="text-base text-[#5F6673] leading-relaxed">
            Détaillez vos besoins techniques, d'impression, d'infrastructures ou de fournitures.
            Nos spécialistes analysent votre cahier des charges et vous répondent dans les plus brefs délais.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Column */}
          <div className="lg:col-span-8">
            <Card className="p-6 sm:p-10">
              {isSuccess ? (
                <div className="text-center py-10 space-y-6 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-2xl bg-[#E9FAF0] text-[#32A85F] flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle size={36} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-[#111111]">
                      Votre demande a été enregistrée avec succès !
                    </h2>
                    <p className="text-sm text-[#5F6673] max-w-md mx-auto leading-relaxed">
                      Merci <strong>{name}</strong>. Votre demande est enregistrée dans notre système central.
                    </p>
                  </div>

                  {/* WhatsApp Direct Action Box */}
                  <div className="p-5 rounded-2xl bg-[#E9FAF0] border border-[#25D366]/30 text-center max-w-md mx-auto space-y-3">
                    <div className="flex items-center justify-center gap-2 text-[#128C7E] font-bold text-sm">
                      <MessageCircle size={20} className="text-[#25D366]" />
                      <span>Transmission Directe sur WhatsApp</span>
                    </div>
                    <p className="text-xs text-[#2A4736] leading-relaxed">
                      Votre demande a été préparée pour notre conseiller commercial. Cliquez ci-dessous pour l'envoyer directement :
                    </p>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm transition-all shadow-xs hover:shadow-md"
                      >
                        <MessageCircle size={18} />
                        Envoyer maintenant sur WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="pt-4 flex flex-wrap justify-center gap-4">
                    <Button variant="outline" size="md" onClick={handleReset}>
                      Faire une autre demande
                    </Button>
                    <Link to="/">
                      <Button variant="primary" size="md">
                        Retour à l'accueil
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                      ⚠️ {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Nom et Prénom"
                      placeholder="Ex: Kouamé Jean"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Entreprise ou Organisation"
                      placeholder="Ex: Société HINOV CI (Facultatif)"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Téléphone joignable"
                      placeholder="Ex: +225 07 00 00 00 00"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <Input
                      label="Adresse Email professionnelle"
                      placeholder="Ex: contact@entreprise.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select
                      label="Pôle de service concerné"
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                    >
                      <option value="">-- Sélectionnez un domaine (Optionnel) --</option>
                      {publishedServices.map((serv) => (
                        <option key={serv.id} value={serv.id}>
                          {serv.name}
                        </option>
                      ))}
                      <option value="multi">Projet transverse (plusieurs services)</option>
                    </Select>

                    <Input
                      label="Budget estimatif (Optionnel)"
                      placeholder="Ex: 500 000 FCFA"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>

                  <Textarea
                    label="Description de votre besoin / Cahier des charges"
                    placeholder="Précisez votre projet, les volumes, les délais souhaités et toute spécification technique utile..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />

                  {/* Attachment */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                      Cahier des charges ou document joint (Facultatif)
                    </label>
                    <label className="flex items-center gap-3 p-3.5 border border-dashed border-black/20 rounded-xl bg-[#F5F7FA] hover:bg-black/5 transition-colors cursor-pointer">
                      <Upload size={18} className="text-[#4A94D1]" />
                      <div className="text-xs text-[#5F6673]">
                        {attachmentName ? (
                          <span className="font-bold text-[#111111]">Fichier sélectionné : {attachmentName}</span>
                        ) : (
                          <span>Joindre un fichier PDF, DOCX, ZIP ou image (max 10 Mo)</span>
                        )}
                      </div>
                      <input type="file" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Consent */}
                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="consent-check"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-[#D38323] focus:ring-[#D38323] border-gray-300"
                    />
                    <label htmlFor="consent-check" className="text-xs text-[#5F6673] leading-snug cursor-pointer">
                      J'accepte que les informations saisies soient utilisées par HINOV Group pour me contacter et établir le devis sollicité.
                    </label>
                  </div>

                  <div className="pt-4 border-t border-black/5">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isSubmitting}
                      rightIcon={<FileText size={18} />}
                    >
                      Transmettre ma demande de devis
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 space-y-4 bg-gradient-to-br from-white to-[#F5F7FA]">
              <h3 className="text-base font-bold text-[#111111]">Nos engagements</h3>
              <ul className="space-y-3 text-xs text-[#5F6673]">
                <li className="flex items-start gap-2.5">
                  <Clock size={16} className="text-[#4A94D1] shrink-0 mt-0.5" />
                  <span>Prise en compte sous 24 heures ouvrées</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-[#32A85F] shrink-0 mt-0.5" />
                  <span>Tarification claire et transparente sans frais cachés</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FileText size={16} className="text-[#D38323] shrink-0 mt-0.5" />
                  <span>Proposition détaillée adaptée aux spécificités de votre projet</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-[#111111]">Besoin d'un échange préalable ?</h3>
              <div className="space-y-3 text-xs text-[#5F6673]">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#4A94D1]" />
                  <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="font-bold text-[#111111]">
                    {settings.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#D38323]" />
                  <a href={`mailto:${settings.email}`} className="font-bold text-[#111111]">
                    {settings.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-[#4AD07B]" />
                  <span>{settings.address}, {settings.city}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
