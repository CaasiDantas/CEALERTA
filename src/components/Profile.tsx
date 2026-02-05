"use client"
import { useState, useEffect } from 'react';
import { User, Camera, Save, ShieldCheck, Lock, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Profile({ user, supabase, isMobile = false }: any) {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }: any) => { if (data) setFullName(data.full_name || ''); });
    }
  }, [user, supabase]);

  if (!user) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#6b7280',
        padding: isMobile ? '20px' : '40px',
        textAlign: 'center'
      }}>
        <Lock size={isMobile ? 40 : 48} style={{ marginBottom: '16px', color: '#ef4444' }} />
        <h2 style={{ 
          color: '#111827', 
          marginBottom: '12px',
          fontSize: isMobile ? '1.5rem' : '2rem',
          fontWeight: '800'
        }}>
          Acesso Restrito
        </h2>
        <p style={{ 
          marginBottom: '24px',
          fontSize: isMobile ? '14px' : '16px',
          maxWidth: '400px',
          lineHeight: '1.5'
        }}>
          Você precisa estar logado para visualizar e gerenciar seu perfil.
        </p>
        
        <button 
          onClick={() => router.push('/login')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: isMobile ? '12px 24px' : '14px 28px', 
            backgroundColor: '#111827', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            fontWeight: '600', 
            transition: '0.2s',
            fontSize: isMobile ? '14px' : '16px'
          }}
        >
          <LogIn size={18} /> Entrar na conta
        </button>
        
        <p style={{ 
          marginTop: '24px',
          fontSize: isMobile ? '12px' : '14px',
          color: '#9ca3af',
          maxWidth: '400px'
        }}>
          Ao fazer login, você poderá registrar incidentes, participar da comunidade e personalizar seu perfil.
        </p>
      </div>
    );
  }

  async function updateProfile() {
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({ 
      id: user.id, 
      full_name: fullName, 
      updated_at: new Date() 
    });
    setLoading(false);
    if (!error) alert("Perfil atualizado!");
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      width: '100%',
      margin: '0 auto'
    }}>
      <header style={{ marginBottom: isMobile ? '24px' : '40px' }}>
        <h1 style={{ 
          fontSize: isMobile ? '1.8rem' : '2.5rem', 
          fontWeight: '800', 
          color: '#111827', 
          letterSpacing: '-1px',
          marginBottom: '8px'
        }}>
          Meu Perfil
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: isMobile ? '14px' : '1.1rem' 
        }}>
          Gerencie suas informações e identidade na plataforma.
        </p>
      </header>

      <div style={{ 
        backgroundColor: 'white', 
        padding: isMobile ? '24px' : '40px', 
        borderRadius: '20px', 
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          marginBottom: '32px',
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <div style={{ 
            width: isMobile ? '70px' : '80px', 
            height: isMobile ? '70px' : '80px', 
            borderRadius: isMobile ? '20px' : '24px', 
            backgroundColor: '#f3f4f6', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <User size={isMobile ? 24 : 32} color="#9ca3af" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: 0, 
              fontWeight: '700',
              fontSize: isMobile ? '16px' : '18px',
              marginBottom: '4px'
            }}>
              Foto de Perfil
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: isMobile ? '12px' : '13px', 
              color: '#9ca3af' 
            }}>
              PNG ou JPG de até 5MB.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: isMobile ? '13px' : '14px', 
              fontWeight: '600', 
              marginBottom: '8px' 
            }}>
              Nome de Exibição
            </label>
            <input 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ 
                width: '100%', 
                padding: isMobile ? '10px' : '12px', 
                borderRadius: '10px', 
                border: '1px solid #e5e7eb',
                fontSize: isMobile ? '14px' : '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: isMobile ? '13px' : '14px', 
              fontWeight: '600', 
              marginBottom: '8px' 
            }}>
              E-mail
            </label>
            <input 
              value={user?.email} 
              disabled 
              style={{ 
                width: '100%', 
                padding: isMobile ? '10px' : '12px', 
                borderRadius: '10px', 
                border: '1px solid #e5e7eb', 
                background: '#f9fafb', 
                color: '#9ca3af',
                fontSize: isMobile ? '14px' : '16px',
                boxSizing: 'border-box'
              }} 
            />
          </div>
          <button 
            onClick={updateProfile} 
            disabled={loading} 
            style={{ 
              marginTop: isMobile ? '8px' : '10px', 
              padding: isMobile ? '12px' : '14px', 
              borderRadius: '10px', 
              border: 'none', 
              backgroundColor: '#111827', 
              color: 'white', 
              fontWeight: '700', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              fontSize: isMobile ? '14px' : '16px',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Save size={isMobile ? 16 : 18} /> 
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}