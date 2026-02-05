"use client"
import { useState, useEffect } from 'react';
import { User, Camera, Save, ShieldCheck, Lock } from 'lucide-react';

export default function Profile({ user, supabase }: any) {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }: any) => { if (data) setFullName(data.full_name || ''); });
    }
  }, [user, supabase]);

  if (!user) {
    return (
      <div style={{ 
        height: '100%', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', color: '#6b7280' 
      }}>
        <Lock size={48} style={{ marginBottom: '16px', color: '#ef4444' }} />
        <h2 style={{ color: '#111827', marginBottom: '8px' }}>Acesso Restrito</h2>
        <p>Você precisa estar logado para visualizar esta página.</p>
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
    <div style={{ maxWidth: '600px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', letterSpacing: '-1px' }}>Meu Perfil</h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Gerencie suas informações e identidade na plataforma.</p>
      </header>

      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={32} color="#9ca3af" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontWeight: '700' }}>Foto de Perfil</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9ca3af' }}>PNG ou JPG de até 5MB.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Nome de Exibição</label>
            <input 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>E-mail</label>
            <input value={user?.email} disabled style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#9ca3af' }} />
          </div>
          <button onClick={updateProfile} disabled={loading} style={{ marginTop: '10px', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#111827', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}