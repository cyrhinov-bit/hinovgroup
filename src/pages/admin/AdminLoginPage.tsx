import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { HinovLogo } from '../../components/common/HinovLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  Layers,
  Sparkles,
  LogOut,
} from 'lucide-react';

interface PresetAccount {
  label: string;
  roleDescription: string;
  email: string;
  password: string;
  badgeColor: string;
}

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, store, settings } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Where to redirect after login (default to /admin)
  const fromPath = (location.state as any)?.from?.pathname || '/admin';

  const PRESET_ACCOUNTS: PresetAccount[] = [
    {
      label: 'Super Administrateur',
      roleDescription: 'Accès intégral à toutes les fonctionnalités & paramètres',
      email: 'admin@hinovgroup.com',
      password: 'hinov2025',
      badgeColor: 'bg-[#4A94D1] text-white',
    },
    {
      label: 'Responsable Éditorial',
      roleDescription: 'Gestion des pages, des 5 pôles de services & des réalisations',
      email: 'editeur@hinovgroup.com',
      password: 'editeur2025',
      badgeColor: 'bg-[#4AD07B] text-white',
    },
    {
      label: 'Responsable Commercial',
      roleDescription: 'Catalogue de fournitures, articles scolaires & devis',
      email: 'commercial@hinovgroup.com',
      password: 'commercial2025',
      badgeColor: 'bg-[#F28D1A] text-white',
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Veuillez renseigner votre adresse email et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      const result = await store.login(email, password);
      setLoading(false);

      if (result.success) {
        navigate(fromPath, { replace: true });
      } else {
        setError(
          result.error ||
            'Identifiants incorrects. Veuillez vérifier vos identifiants ou utiliser un profil administrateur.'
        );
      }
    } catch (err) {
      setLoading(false);
      setError('Une erreur de connexion est survenue.');
    }
  };

  const handleQuickLogin = async (preset: PresetAccount) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setError('');
    setLoading(true);

    try {
      const result = await store.login(preset.email, preset.password);
      setLoading(false);
      if (result.success) {
        navigate(fromPath, { replace: true });
      } else {
        setError(result.error || 'Connexion échouée.');
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleFillCredentials = (preset: PresetAccount) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F5F7FA] relative overflow-hidden py-10 px-4 sm:px-6">
      {/* Subtle geometric background accents using brand colors */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4A94D1]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#F28D1A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-[#4AD07B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar with back to public site */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#5F6673] hover:text-[#111111] transition-colors bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-black/10 shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Retourner au site public</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-[#5F6673]">
          <span className="w-2 h-2 rounded-full bg-[#4AD07B] animate-pulse" />
          <span className="font-semibold hidden sm:inline">Portail CMS Sécurisé v2.5</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto my-auto pt-6 pb-8 z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Link to="/" title="HINOV Group">
              <HinovLogo size="lg" logoSrc={settings.logo_url} />
            </Link>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] text-white text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
              <KeyRound size={11} className="text-[#F28D1A]" />
              <span>Console d'Administration</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              Connexion au Tableau de Bord
            </h1>
            <p className="text-xs text-[#5F6673] max-w-sm mx-auto">
              Gestion centralisée des pages, du catalogue, des 5 pôles d'expertise et des demandes de devis.
            </p>
          </div>
        </div>

        {/* Already logged-in banner */}
        {currentUser && (
          <Card className="p-5 bg-white border-2 border-[#4AD07B] shadow-md space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#4AD07B]/15 text-[#1b7a42] flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#111111]">Session active identifiée</p>
                <p className="text-xs text-[#5F6673] truncate">
                  Connecté en tant que{' '}
                  <span className="font-bold text-[#111111]">{currentUser.full_name}</span> (
                  {currentUser.email})
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-black/5 text-[10px] font-mono font-bold text-[#4A94D1]">
                  Rôle : {currentUser.role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-black/10">
              <Button
                variant="primary"
                size="sm"
                className="flex-1 justify-center"
                onClick={() => navigate(fromPath, { replace: true })}
                rightIcon={<ArrowRight size={14} />}
              >
                Accéder au Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => store.logout()}
                leftIcon={<LogOut size={14} />}
                title="Se déconnecter"
              >
                Déconnexion
              </Button>
            </div>
          </Card>
        )}

        {/* Login Card */}
        <Card className="p-7 sm:p-8 bg-white shadow-xl border-black/10 rounded-2xl space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl font-semibold border border-red-200 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Adresse Email administrateur"
              type="email"
              placeholder="admin@hinovgroup.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              leftIcon={<Mail size={16} className="text-[#5F6673]" />}
              autoComplete="email"
              required
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-[#4A94D1] hover:text-[#3573A8] transition-colors cursor-pointer"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  leftIcon={<Lock size={16} className="text-[#5F6673]" />}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5F6673] hover:text-[#111111] transition-colors p-1 cursor-pointer"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#111111]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-[#4A94D1] focus:ring-[#4A94D1] w-4 h-4"
                />
                <span>Garder ma session active</span>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-md hover:shadow-lg transition-all"
                isLoading={loading}
                rightIcon={<ArrowRight size={16} />}
              >
                Se connecter à la console
              </Button>
            </div>
          </form>

          {/* Quick Access Profiles / Demo accounts */}
          <div className="pt-5 border-t border-black/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#F28D1A]" />
                Comptes autorisés & Accès rapide
              </span>
              <span className="text-[10px] text-[#5F6673]">1-clic</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {PRESET_ACCOUNTS.map((preset) => (
                <div
                  key={preset.email}
                  className="p-3 rounded-xl border border-black/10 bg-[#F5F7FA] hover:bg-white hover:border-[#4A94D1]/50 hover:shadow-sm transition-all group flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#111111]">{preset.label}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${preset.badgeColor}`}
                      >
                        {preset.email.split('@')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5F6673] truncate">{preset.roleDescription}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleFillCredentials(preset)}
                      className="px-2 py-1 text-[11px] font-bold text-[#5F6673] hover:text-[#111111] hover:bg-black/5 rounded-md transition-colors cursor-pointer"
                      title="Remplir les champs"
                    >
                      Remplir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(preset)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-[#111111] text-white hover:bg-[#4A94D1] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Connexion directe"
                    >
                      <span>Entrer</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Security badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#5F6673]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#4AD07B]" />
            <span>Chiffrement SSL 256-bit</span>
          </div>
          <span className="text-black/20">•</span>
          <div className="flex items-center gap-1.5">
            <Lock size={13} className="text-[#4A94D1]" />
            <span>Audit & journalisation active</span>
          </div>
          <span className="text-black/20">•</span>
          <div className="flex items-center gap-1.5">
            <Briefcase size={13} className="text-[#F28D1A]" />
            <span>HINOV Group Côte d'Ivoire</span>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-[#5F6673]/80 z-10">
        &copy; {new Date().getFullYear()} HINOV Group. Tous droits réservés. Espace d'administration réservé au personnel autorisé.
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsForgotModalOpen(false)}
          title="Récupération du mot de passe Administrateur"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-[#F5F7FA] rounded-xl border border-black/10 space-y-2">
              <p className="text-xs font-bold text-[#111111]">
                Procédure de réinitialisation sécurisée :
              </p>
              <p className="text-xs text-[#5F6673] leading-relaxed">
                Pour des raisons de sécurité de la plateforme HINOV Group, les accès d'administration
                sont attribués et gérés en interne par la direction technique.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Identifiants de démonstration préconfigurés :
              </p>
              <ul className="text-xs space-y-1.5 font-mono bg-black/5 p-3 rounded-xl">
                <li>
                  <span className="font-bold text-[#4A94D1]">admin@hinovgroup.com</span> /{' '}
                  <span className="text-[#111111] font-bold">hinov2025</span>
                </li>
                <li>
                  <span className="font-bold text-[#4AD07B]">editeur@hinovgroup.com</span> /{' '}
                  <span className="text-[#111111] font-bold">editeur2025</span>
                </li>
                <li>
                  <span className="font-bold text-[#F28D1A]">commercial@hinovgroup.com</span> /{' '}
                  <span className="text-[#111111] font-bold">commercial2025</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <p className="font-bold">Contact support IT :</p>
              <p>
                En cas de perte de vos accès personnalisés, contactez le pôle informatique HINOV à{' '}
                <a href="mailto:contact@hinovgroup.com" className="underline font-bold">
                  contact@hinovgroup.com
                </a>{' '}
                ou au +225 07 48 57 51 09.
              </p>
            </div>

            <div className="pt-3 border-t border-black/10 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setIsForgotModalOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
