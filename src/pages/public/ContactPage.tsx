import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, services, store } = useStore();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !phone.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    if (!consent) {
      setErrorMessage('Veuillez valider le consentement pour l’envoi de votre message.');
      return;
    }

    setIsSubmitting(true);

    try {
      await store.addQuote({
        name: name.trim(),
        company: company.trim() || undefined,
        phone: phone.trim(),
        email: email.trim(),
        service_name: service || 'Contact Général',
        message: `[Contact Direct - Sujet : ${subject || 'Non précisé'}]\n${message.trim()}`,
      });

      const rawPhone = (settings.whatsapp || '+2250719549582').replace(/\D/g, '');
      const waMsg =
        `*NOUVEAU MESSAGE DE CONTACT — HINOV GROUP*\n\n` +
        `👤 *Nom :* ${name.trim()}\n` +
        (company.trim() ? `🏢 *Entreprise :* ${company.trim()}\n` : '') +
        `📞 *Téléphone :* ${phone.trim()}\n` +
        `✉️ *Email :* ${email.trim()}\n` +
        (service ? `🛠️ *Domaine :* ${service}\n` : '') +
        (subject ? `📌 *Objet :* ${subject}\n` : '') +
        `📝 *Message :*\n${message.trim()}\n\n` +
        `_Transmis via le formulaire de contact HINOV Group_`;

      const generatedUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(waMsg)}`;
      setWhatsappUrl(generatedUrl);

      window.open(generatedUrl, '_blank', 'noopener,noreferrer');

      setIsSubmitting(false);
      setIsSent(true);
    } catch (err) {
      console.error('Erreur envoi contact:', err);
      setIsSubmitting(false);
      setErrorMessage('Une erreur est survenue lors de l\'envoi.');
    }
  };

  return (
    <div className="w-full py-12 sm:py-16 bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF4FC] border border-[#4A94D1]/20">
            <span className="w-2 h-2 rounded-full bg-[#4A94D1]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#3573A8]">
              Contact & Écoute
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
            Contactez HINOV Group
          </h1>
          <p className="text-base text-[#5F6673] leading-relaxed">
            Notre équipe est à votre entière disposition pour répondre à toutes vos questions, vous orienter
            ou convenir d'un rendez-vous technique à Yopougon, Cité Verte.
          </p>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#EBF4FC] text-[#4A94D1] flex items-center justify-center mx-auto">
              <Phone size={22} />
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5F6673]">
              Téléphone
            </h3>
            <a
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              className="block text-sm font-bold text-[#111111] hover:text-[#4A94D1]"
            >
              {settings.phone}
            </a>
            <p className="text-[11px] text-[#5F6673]">Du lundi au samedi</p>
          </Card>

          <Card className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#E9FAF0] text-[#4AD07B] flex items-center justify-center mx-auto">
              <MessageCircle size={22} />
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5F6673]">
              WhatsApp Direct
            </h3>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="block text-sm font-bold text-[#32A85F] hover:underline"
            >
              Échanger sur WhatsApp
            </a>
            <p className="text-[11px] text-[#5F6673]">Réponse instantanée</p>
          </Card>

          <Card className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#FDF5EB] text-[#D38323] flex items-center justify-center mx-auto">
              <Mail size={22} />
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5F6673]">
              Courriel
            </h3>
            <a
              href={`mailto:${settings.email}`}
              className="block text-sm font-bold text-[#111111] hover:text-[#D38323] truncate"
            >
              {settings.email}
            </a>
            <p className="text-[11px] text-[#5F6673]">Pour toute correspondance</p>
          </Card>

          <Card className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#F9ECF6] text-[#A6378D] flex items-center justify-center mx-auto">
              <MapPin size={22} />
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5F6673]">
              Siège Social
            </h3>
            <p className="text-sm font-bold text-[#111111]">
              {settings.address}
            </p>
            <p className="text-[11px] text-[#5F6673]">{settings.city}, {settings.country}</p>
          </Card>
        </div>

        {/* Form and Location */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-10">
              {isSent ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#E9FAF0] text-[#32A85F] flex items-center justify-center mx-auto">
                    <CheckCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#111111]">Message envoyé avec succès !</h2>
                  <p className="text-sm text-[#5F6673] max-w-md mx-auto">
                    Merci {name}. Votre message a bien été enregistré dans notre système central.
                  </p>

                  {/* WhatsApp Direct Action Box */}
                  <div className="p-4 rounded-2xl bg-[#E9FAF0] border border-[#25D366]/30 text-center max-w-md mx-auto space-y-2">
                    <div className="flex items-center justify-center gap-2 text-[#128C7E] font-bold text-sm">
                      <MessageCircle size={18} className="text-[#25D366]" />
                      <span>Transmission Directe sur WhatsApp</span>
                    </div>
                    <p className="text-xs text-[#2A4736] leading-relaxed">
                      Vous pouvez également démarrer immédiatement l'échange avec notre équipe via WhatsApp :
                    </p>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm transition-all shadow-xs hover:shadow-md"
                      >
                        <MessageCircle size={18} />
                        Discuter maintenant sur WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setIsSent(false);
                        setMessage('');
                        setSubject('');
                        setWhatsappUrl('');
                      }}
                    >
                      Envoyer un autre message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-[#111111] mb-2">Formulaire de contact</h2>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-semibold border border-red-200">
                      ⚠️ {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nom complet"
                      placeholder="Votre nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Entreprise (Facultatif)"
                      placeholder="Nom de votre structure"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Téléphone"
                      type="tel"
                      placeholder="+225 07..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Domaine concerné"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                    >
                      <option value="">Sélectionnez un pôle (Optionnel)</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                      <option value="Autre demande">Autre demande</option>
                    </Select>

                    <Input
                      label="Objet de votre demande"
                      placeholder="Ex: Demande de renseignement"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <Textarea
                    label="Votre message"
                    placeholder="Écrivez votre message ici..."
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="contact-consent"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-[#D38323] focus:ring-[#D38323] border-gray-300"
                    />
                    <label htmlFor="contact-consent" className="text-xs text-[#5F6673] cursor-pointer">
                      J'accepte que ces informations soient exploitées dans le cadre de ma demande et de la relation commerciale qui peut en découler.
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                    rightIcon={<Send size={16} />}
                  >
                    Envoyer le message
                  </Button>
                </form>
              )}
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-[#111111]">Localisation géographique</h3>
              <div className="p-4 bg-[#F5F7FA] rounded-xl border border-black/5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                  <MapPin size={16} className="text-[#4AD07B]" />
                  <span>Yopougon, Cité Verte</span>
                </div>
                <p className="text-xs text-[#5F6673]">
                  Commune de Yopougon, Abidjan — République de Côte d'Ivoire.
                </p>
                <div className="pt-2 text-[11px] text-[#5F6673]">
                  Accès facile et parking disponible pour l'accueil de nos partenaires et clients.
                </div>
              </div>

              {/* Map representation */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-black/10 relative bg-[#EBF4FC] flex items-center justify-center text-center p-6">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#4A94D1] text-white flex items-center justify-center mx-auto shadow-md">
                    <MapPin size={24} />
                  </div>
                  <p className="text-xs font-extrabold text-[#111111]">HINOV Group</p>
                  <p className="text-[11px] text-[#5F6673]">Yopougon, Cité Verte</p>
                  <span className="inline-block px-3 py-1 rounded-full bg-white text-[#4A94D1] text-[10px] font-bold shadow-xs">
                    Abidjan, Côte d'Ivoire
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-bold text-[#111111]">
                <Clock size={16} className="text-[#D38323]" />
                <span>Horaires d'ouverture</span>
              </div>
              <div className="space-y-1.5 text-xs text-[#5F6673]">
                <div className="flex justify-between py-1 border-b border-black/5">
                  <span>Lundi – Vendredi :</span>
                  <strong className="text-[#111111]">08h00 – 18h00</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5">
                  <span>Samedi :</span>
                  <strong className="text-[#111111]">08h30 – 14h00</strong>
                </div>
                <div className="flex justify-between py-1 text-red-600">
                  <span>Dimanche :</span>
                  <strong>Fermé</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
