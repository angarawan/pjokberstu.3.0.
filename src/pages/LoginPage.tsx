import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DatabaseService } from '../services/db';
import { AppConfig } from '../types';
import { INITIAL_APP_CONFIG } from '../services/seedData';
import { AppLogo } from '../components/AppLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { isFirebaseConfigured } from '../lib/firebase';
import {
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState<'murid' | 'guru'>('murid');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const stored = localStorage.getItem('pjok_data_app_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          if (!parsed.appName || parsed.appName === 'PENILAIAN ANTAR TEMAN PJOK') {
            parsed.appName = 'e-PJOK';
          }
          return { ...INITIAL_APP_CONFIG, ...parsed };
        }
      }
    } catch {}
    return INITIAL_APP_CONFIG;
  });

  useEffect(() => {
    DatabaseService.getAppConfig().then((cfg) => {
      if (cfg) {
        if (!cfg.appName || cfg.appName === 'PENILAIAN ANTAR TEMAN PJOK') {
          cfg.appName = 'e-PJOK';
        }
        setConfig(cfg);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError(activeTab === 'murid' ? 'Silakan masukkan NIS atau nama siswa.' : 'Silakan masukkan username atau email guru.');
      return;
    }
    if (!password) {
      setError('Silakan masukkan kata sandi.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = await login(username.trim(), password);
    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Gagal masuk. Periksa kembali username dan kata sandi Anda.');
    } else {
      setSuccessMsg('Login berhasil! Mengalihkan ke aplikasi...');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setError(res.message || 'Gagal masuk dengan akun Google.');
      } else {
        setSuccessMsg('Login Google berhasil! Mengalihkan...');
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat masuk dengan Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-emerald-50/20 to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle className="bg-white/80 dark:bg-slate-800/80 shadow-xs backdrop-blur-xs" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Dynamic App Logo */}
        <div className="flex justify-center mb-3">
          <AppLogo size="xl" showText={false} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
          {config.appName && config.appName !== 'PENILAIAN ANTAR TEMAN PJOK' ? config.appName : 'e-PJOK'}
        </h1>
        <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          &ldquo;{config.motto || 'Sportif, Jujur, dan Menghargai Gerak Teman'}&rdquo;
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {config.schoolName || 'SMA NEGERI 1 TEJAKULA'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-6 px-5 sm:px-8 rounded-3xl shadow-xl shadow-slate-200/70 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
          
          {/* Segmented Tab: Murid vs Guru */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('murid');
                setError(null);
                setUsername('');
                setPassword('');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'murid'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Siswa (Murid)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('guru');
                setError(null);
                setUsername('');
                setPassword('');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'guru'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Guru PJOK</span>
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong className="block font-semibold">Gagal Masuk</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tombol Masuk dengan Google untuk Guru (atau semua pengguna yang memiliki akun Google) */}
          {isFirebaseConfigured() && (
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Masuk dengan Akun Google (Belajar.id)</span>
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700/80"></div>
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500">
                    atau masuk dengan {activeTab === 'murid' ? 'NIS / Nama' : 'Username'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Login Mandiri */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {activeTab === 'murid' ? 'NIS atau Nama Siswa' : 'Username / Email Guru'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    activeTab === 'murid'
                      ? 'Contoh: 1006 atau Nama Siswa'
                      : 'Contoh: guru atau email'
                  }
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 dark:focus:border-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {activeTab === 'murid' ? 'Standar: 123456 / NIS' : 'Standar: guru123'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'murid' ? 'Masukkan kata sandi (standar: 123456)' : 'Masukkan kata sandi guru'}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 dark:focus:border-emerald-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus:ring-4 focus:ring-emerald-500/30 shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>MASUK SEBAGAI {activeTab === 'murid' ? 'SISWA' : 'GURU'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Bantuan & Kredensial Cepat */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHelp ? 'Tutup Bantuan Masuk' : 'Bantuan & Panduan Masuk Akun'}</span>
            </button>

            {showHelp && (
              <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-left text-xs space-y-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 animate-in fade-in">
                <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Panduan Masuk Sistem e-PJOK</span>
                </div>
                <div className="space-y-1.5 text-[11px] leading-relaxed">
                  <p>
                    <strong className="text-emerald-700 dark:text-emerald-400">Guru PJOK:</strong> Gunakan tombol <em>&ldquo;Masuk dengan Akun Google&rdquo;</em> (mendukung email @guru.smk.belajar.id / Gmail) atau masukkan username <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">guru</code> dengan sandi <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">guru123</code>.
                  </p>
                  <p>
                    <strong className="text-emerald-700 dark:text-emerald-400">Siswa (Murid):</strong> Cukup ketik NIS Anda (contoh: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">1006</code>, <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">1007</code>, dst.) atau Nama Lengkap Anda di kelas XI 1 - XI 9. Kata sandi standar adalah <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">123456</code>.
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
                    Sistem terhubung secara realtime dengan Cloud Firestore sehingga seluruh penilaian antar teman, tugas, dan materi otomatis tersinkronisasi.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};



