'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ShieldAlert,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');

  const router = useRouter();

  // Verificar se está em mobile
  useState(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        if (error) {
          let msg = error.message;

          if (msg.includes('Password should be at least 6 characters')) {
            msg = 'A senha deve ter pelo menos 6 caracteres.';
          }

          if (msg.includes('Invalid login credentials')) {
            msg = 'Email ou senha incorretos.';
          }

          if (msg.includes('User already registered')) {
            msg = 'Este email já está cadastrado.';
          }

          setMessage(msg);
          setMessageType('error');
        }
      } else {
        setMessage('Conta criada! Verifique seu e-mail.');
        setMessageType('success');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage('Email ou senha incorretos');
        setMessageType('error');
      } else {
        router.push('/');
      }
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#fff',
        fontFamily: 'Inter, sans-serif',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {!isMobile && (
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert size={32} color="#ef4444" />
            <span
              style={{
                fontWeight: '800',
                fontSize: '1.5rem',
                letterSpacing: '-1px',
              }}
            >
              CEALERTA
            </span>
          </div>

          <div>
            <h1
              style={{
                fontSize: '3.2rem',
                fontWeight: '800',
                lineHeight: 1.1,
                marginBottom: '24px',
              }}
            >
              A sua vizinhança, <br /> mais segura.
            </h1>
            <p
              style={{
                color: '#9ca3af',
                fontSize: '1.2rem',
                maxWidth: '480px',
                lineHeight: '1.6',
              }}
            >
              Uma plataforma colaborativa para monitorizar e proteger a sua
              comunidade em tempo real.
            </p>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>
            © 2024 Cealerta Tecnologias. Todos os direitos reservados.
          </div>
        </div>
      )}

      {isMobile && (
        <div
          style={{
            padding: '24px',
            backgroundColor: '#111827',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={24} color="#ef4444" />
            <span
              style={{
                fontWeight: '800',
                fontSize: '1.2rem',
                letterSpacing: '-1px',
              }}
            >
              CEALERTA
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </span>
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '24px' : '40px',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: isMobile ? '0' : '0 20px',
          }}
        >
          {!isMobile && (
            <>
              <h2
                style={{
                  fontSize: '2.2rem',
                  fontWeight: '800',
                  marginBottom: '8px',
                  color: '#111827',
                }}
              >
                {isRegistering ? 'Crie a sua conta' : 'Bem-vindo de volta'}
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '40px' }}>
                {isRegistering
                  ? 'Registe-se para começar a colaborar.'
                  : 'Insira os seus dados para aceder ao painel.'}
              </p>
            </>
          )}

          {isMobile && (
            <div style={{ marginBottom: '32px' }}>
              <h2
                style={{
                  fontSize: '1.8rem',
                  fontWeight: '800',
                  marginBottom: '8px',
                  color: '#111827',
                }}
              >
                {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                {isRegistering
                  ? 'Registre-se para começar a colaborar.'
                  : 'Insira seus dados para acessar o painel.'}
              </p>
            </div>
          )}
          {message && (
            <div
              style={{
                backgroundColor:
                  messageType === 'error' ? '#fee2e2' : '#dcfce7',
                color: messageType === 'error' ? '#991b1b' : '#166534',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '16px',
                border:
                  messageType === 'error'
                    ? '1px solid #fecaca'
                    : '1px solid #bbf7d0',
              }}
            >
              {message}
            </div>
          )}

          <form
            onSubmit={handleAuth}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {isRegistering && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#374151',
                  }}
                >
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Como quer ser chamado?"
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '14px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    outline: 'none',
                    fontSize: isMobile ? '15px' : '16px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#374151',
                }}
              >
                E-mail
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  style={{
                    position: 'absolute',
                    left: isMobile ? '12px' : '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                  }}
                  size={isMobile ? 16 : 18}
                />
                <input
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile
                      ? '12px 12px 12px 40px'
                      : '14px 14px 14px 45px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    outline: 'none',
                    fontSize: isMobile ? '15px' : '16px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#374151',
                }}
              >
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  style={{
                    position: 'absolute',
                    left: isMobile ? '12px' : '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                  }}
                  size={isMobile ? 16 : 18}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile
                      ? '12px 40px 12px 40px'
                      : '14px 45px 14px 45px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    outline: 'none',
                    fontSize: isMobile ? '15px' : '16px',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: isMobile ? '12px' : '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: '0',
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={isMobile ? 16 : 18} />
                  ) : (
                    <Eye size={isMobile ? 16 : 18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: isMobile ? '14px' : '16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: 'white',
                fontWeight: '700',
                fontSize: isMobile ? '15px' : '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: '0.2s',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                marginTop: isMobile ? '8px' : '0',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? 'Processando...'
                : isRegistering
                  ? 'Criar Conta'
                  : 'Entrar no Painel'}
              {!loading &&
                (isRegistering ? (
                  <UserPlus size={isMobile ? 16 : 18} />
                ) : (
                  <ArrowRight size={isMobile ? 16 : 18} />
                ))}
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              textAlign: 'center',
              borderTop: '1px solid #f3f4f6',
              paddingTop: '20px',
            }}
          >
            <p
              style={{
                color: '#6b7280',
                fontSize: isMobile ? '13px' : '14px',
                marginBottom: '8px',
              }}
            >
              {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            </p>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              style={{
                background: 'none',
                border: '2px solid #fee2e2',
                color: '#ef4444',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '15px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              {isRegistering ? 'Faça login aqui' : 'Criar uma conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
