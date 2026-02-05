"use client"
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShieldAlert, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName } 
        }
      });
      if (error) alert(error.message);
      else alert("Conta criada! Verifique o seu e-mail para confirmar.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push('/');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', 
        padding: '60px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        color: 'white' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={32} color="#ef4444" />
          <span style={{ fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-1px' }}>CEALERTA</span>
        </div>
        
        <div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px' }}>
            A sua vizinhança, <br/> mais segura.
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.2rem', maxWidth: '480px', lineHeight: '1.6' }}>
            Uma plataforma colaborativa para monitorizar e proteger a sua comunidade em tempo real.
          </p>
        </div>

        <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>
          © 2024 Cealerta Tecnologias. Todos os direitos reservados.
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: '#111827' }}>
            {isRegistering ? 'Crie a sua conta' : 'Bem-vindo de volta'}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '40px' }}>
            {isRegistering ? 'Registe-se para começar a colaborar.' : 'Insira os seus dados para aceder ao painel.'}
          </p>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {isRegistering && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Nome Completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Como quer ser chamado?"
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '16px' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="exemplo@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '16px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Palavra-passe</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '16px' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ 
              width: '100%', padding: '16px', borderRadius: '14px', border: 'none', 
              backgroundColor: '#ef4444', color: 'white', fontWeight: '700', fontSize: '16px', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: '0.2s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
            }}>
              {loading ? 'A processar...' : isRegistering ? 'Criar Conta' : 'Entrar no Painel'} 
              {isRegistering ? <UserPlus size={18} /> : <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '24px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', marginLeft: '8px' }}
              >
                {isRegistering ? 'Inicie sessão' : 'Registe-se agora'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}