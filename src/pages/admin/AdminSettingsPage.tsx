import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Check, ShieldAlert, Phone, Mail, MapPin, MessageCircle, Globe, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { SiteSettings } from '../../types';
import { HinovLogo } from '../../components/common/HinovLogo';

export const AdminSettingsPage: React.FC = () => {
  const { settings, store } = useStore();
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">Paramètres Généraux du Site</h1>
        <p className="text-xs text-[#5F6673]">
          Mise à jour des coordonnées officielles, réseaux sociaux et configuration de contact.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-[#E9FAF0] border border-[#4AD07B]/30 text-[#32A85F] text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
          <Check size={18} />
          Les paramètres du site ont été enregistrés avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
            <Globe size={18} className="text-[#4A94D1]" />
            Identité de l'Entreprise
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nom de l'entreprise"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              required
            />
            <Input
              label="Slogan / Tagline"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* Logo & Visual Identity */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
              <ImageIcon size={18} className="text-[#4AD07B]" />
              Logo Officiel & Icône du Site (icon-512.png)
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#4AD07B]/15 text-[#1b7a42] border border-[#4AD07B]/30 flex items-center gap-1">
              <Sparkles size={11} /> Actif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-4 bg-[#F5F7FA] rounded-xl border border-black/10">
            {/* Logo Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider block">
                Aperçu du Logo & Titre
              </span>
              <div className="p-4 bg-white rounded-xl border border-black/10 shadow-2xs flex items-center justify-center">
                <HinovLogo size="lg" logoSrc={formData.logo_url || '/assets/icon-512.png'} />
              </div>
              <p className="text-[11px] text-[#5F6673]">
                Affiché dans l'en-tête, le pied de page et la console d'administration.
              </p>
            </div>

            {/* Icon Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider block">
                Aperçu de l'Icône 512x512 & Favicon
              </span>
              <div className="p-4 bg-white rounded-xl border border-black/10 shadow-2xs flex items-center justify-center gap-4">
                <div className="text-center">
                  <img
                    src={formData.favicon_url || '/assets/icon-512.png'}
                    alt="Favicon HINOV"
                    className="w-16 h-16 rounded-xl object-contain shadow-xs mx-auto border border-black/10"
                  />
                  <span className="text-[10px] font-mono text-[#5F6673] mt-1 block">512×512 HD</span>
                </div>
                <div className="text-center">
                  <img
                    src={formData.favicon_url || '/assets/icon-512.png'}
                    alt="Favicon HINOV 32px"
                    className="w-8 h-8 rounded-md object-contain shadow-2xs mx-auto border border-black/10"
                  />
                  <span className="text-[10px] font-mono text-[#5F6673] mt-1 block">32×32 Onglet</span>
                </div>
              </div>
              <p className="text-[11px] text-[#5F6673]">
                Utilisé comme favicon du navigateur, raccourci mobile et icône de partage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Chemin / URL du logo"
              value={formData.logo_url || '/assets/icon-512.png'}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="/assets/icon-512.png"
            />
            <Input
              label="Chemin / URL de l'icône (Favicon)"
              value={formData.favicon_url || '/assets/icon-512.png'}
              onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
              placeholder="/assets/icon-512.png"
            />
          </div>

          {(formData.logo_url !== '/assets/icon-512.png' || formData.favicon_url !== '/assets/icon-512.png') && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    logo_url: '/assets/icon-512.png',
                    favicon_url: '/assets/icon-512.png',
                  })
                }
                className="text-xs font-bold text-[#4A94D1] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} />
                Réinitialiser avec l'icône par défaut (icon-512.png)
              </button>
            </div>
          )}
        </Card>

        {/* Contact Coordinates */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
            <Phone size={18} className="text-[#D38323]" />
            Coordonnées Officielles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Téléphone principal joignable"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Email de contact"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Numéro WhatsApp (avec indicatif +225)"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              required
            />
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-[#111111] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.whatsapp_enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp_enabled: e.target.checked })
                  }
                  className="rounded text-[#4AD07B] focus:ring-[#4AD07B]"
                />
                Activer le bouton flottant WhatsApp sur le site public
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Input
              label="Adresse géographique"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <Input
              label="Ville / Commune"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
            <Input
              label="Pays"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* Social Networks */}
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
              <MessageCircle size={18} className="text-[#A6378D]" />
              Réseaux Sociaux
            </h2>
            <p className="text-xs text-[#5F6673] mt-1">
              Règle : Une icône ne sera affichée sur le site public que si son URL est renseignée.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Page Facebook (URL)"
              placeholder="https://facebook.com/hinovgroup"
              value={formData.facebook_url || ''}
              onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
            />
            <Input
              label="Compte Instagram (URL)"
              placeholder="https://instagram.com/hinovgroup"
              value={formData.instagram_url || ''}
              onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
            />
            <Input
              label="Page LinkedIn (URL)"
              placeholder="https://linkedin.com/company/hinovgroup"
              value={formData.linkedin_url || ''}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            />
            <Input
              label="Compte TikTok (URL)"
              placeholder="https://tiktok.com/@hinovgroup"
              value={formData.tiktok_url || ''}
              onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
            />
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary" size="lg" leftIcon={<Check size={18} />}>
            Enregistrer tous les paramètres
          </Button>
        </div>
      </form>
    </div>
  );
};
