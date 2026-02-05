"use client"
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldAlert, MapPin, MousePointer2, 
  MessageSquare, User, Map as MapIcon, LogOut, LogIn, Phone,
  Menu, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import Chat from '../components/chat';
import Profile from '../components/Profile';

const INCIDENT_CATEGORIES = {
  "Patrimônio": [
    'Roubo a Pessoa', 'Furto', 'Roubo a Residência', 'Furto Qualificado(Arrombamento)', 'Dano', 'Estelionato'
  ],
  "Pessoas e Conflitos": [
    'Ameaça', 'Injúria', 'Calúnia', 'Difamação', 'Desaparecimento de Pessoa', 'Violação de Domicílio'
  ],
  "Social e Especializado": [
    'Maus-Tratos aos Animais', 'Preconceito - Raça ou Cor', 'Preconceito - Conduta Homofóbica', 'Crime Contra o Idoso', 'Violência política de gênero'
  ],
  "Outros": [
    'Acidente de Trânsito', 'Extravio', 'Outros Fatos não Delituosos'
  ]
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Map = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => <div style={{ height: '100vh', width: '100%', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando Mapa...</div>
});

export default function Home() {
  const [activeTab, setActiveTab] = useState('map');
  const [incidents, setIncidents] = useState([]);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [tempCoords, setTempCoords] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    fetchIncidents();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  async function fetchIncidents() {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setIncidents(data as any);
  }

  const handleMapClick = (latlng: any) => {
    if (!user) { router.push('/login'); return; }
    setTempCoords(latlng);
    setShowModal(true);
  };

  async function saveIncident(type: string) {
    const weights: Record<string, number> = { 
      'Roubo a Pessoa': 5, 'Roubo a Residência': 5,
      'Furto Qualificado(Arrombamento)': 4, 'Maus-Tratos aos Animais': 4,
      'Furto': 3, 'Ameaça': 3, 'Preconceito - Raça ou Cor': 4,
      'Dano': 2, 'Estelionato': 2, 'Outros Fatos não Delituosos': 1
    };

    const { error } = await supabase.from('incidents').insert([{
      type,
      latitude: tempCoords.lat,
      longitude: tempCoords.lng,
      risk_score: weights[type] || 2, 
      user_id: user.id
    }]);
    
    if (!error) { 
      setShowModal(false); 
      fetchIncidents(); 
    }
  }

  async function deleteIncident(id: string) {
    if (!confirm("Excluir este relato permanentemente?")) return;
    const { error } = await supabase.from('incidents').delete().eq('id', id);
    if (!error) fetchIncidents();
  }

  const NavButton = ({ id, icon: Icon, label }: any) => (
    <button 
      onClick={() => {
        setActiveTab(id);
        if (isMobile) setIsMobileMenuOpen(false);
      }}
      style={{
        display: 'flex', 
        alignItems: 'center', 
        gap: isMobile ? '8px' : '12px', 
        width: '100%', 
        padding: isMobile ? '10px 12px' : '14px 18px',
        border: 'none', 
        borderRadius: isMobile ? '10px' : '14px', 
        cursor: 'pointer', 
        transition: '0.3s', 
        fontSize: isMobile ? '14px' : '15px', 
        fontWeight: '600',
        backgroundColor: activeTab === id ? '#fef2f2' : 'transparent',
        color: activeTab === id ? '#ef4444' : '#6b7280',
        justifyContent: isMobile ? 'center' : (isSidebarCollapsed ? 'center' : 'flex-start'),
        flexDirection: isMobile ? 'column' : 'row',
        textAlign: isMobile ? 'center' : 'left'
      }}
    >
      <Icon size={isMobile ? 20 : 20} /> 
      {(!isSidebarCollapsed || isMobile) && <span style={{ fontSize: isMobile ? '11px' : 'inherit' }}>{label}</span>}
    </button>
  );

  const MobileNavBar = () => (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    }}>
      <NavButton id="map" icon={MapIcon} label="Mapa" />
      <NavButton id="chat" icon={MessageSquare} label="Chat" />
      <NavButton id="profile" icon={User} label="Perfil" />
      
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          bottom: '70px',
          left: '10px',
          right: '10px',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          zIndex: 999,
          maxHeight: '70vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontWeight: '700', color: '#111827', fontSize: '16px' }}>Contatos de Emergência</span>
            <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={20} color="#6b7280" />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { n: '190', t: 'Polícia Militar', d: 'Riscos e crimes ativos' },
              { n: '191', t: 'PRF', d: 'Rodovias federais' },
              { n: '192', t: 'SAMU', d: 'Emergências médicas' },
              { n: '193', t: 'Bombeiros', d: 'Incêndios e resgates' },
              { n: '194', t: 'Polícia Civil', d: 'Investigações' },
              { n: '199', t: 'Defesa Civil', d: 'Desastres naturais' }
            ].map(num => (
              <div key={num.n} style={{ 
                border: '1px solid #fee2e2', 
                borderRadius: '12px', 
                padding: '14px',
                backgroundColor: '#fef2f2',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      backgroundColor: '#fee2e2', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#ef4444' }}>{num.n}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{num.t}</span>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0', lineHeight: '1.2' }}>{num.d}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ 
                width: '100%', 
                padding: '14px', 
                backgroundColor: '#111827', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </nav>
  );

  return (
    <main style={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#f9fafb', 
      fontFamily: 'Inter, sans-serif',
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      
      {/* Sidebar para desktop */}
      {!isMobile && (
        <aside style={{ 
          width: isSidebarCollapsed ? '80px' : '280px', 
          backgroundColor: 'white', 
          borderRight: '1px solid #e5e7eb', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: isSidebarCollapsed ? '32px 10px' : '32px 20px',
          transition: '0.3s',
          flexShrink: 0
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px', paddingLeft: '10px' }}>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0', display: 'flex', alignItems: 'center' }}
            >
              <Menu size={24} />
            </button>
            {!isSidebarCollapsed && (
              <>
                <ShieldAlert size={32} color="#ef4444" />
                <span style={{ fontWeight: '900', fontSize: '1.4rem', color: '#111827', letterSpacing: '-1px' }}>CEALERTA</span>
              </>
            )}
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
            <NavButton id="map" icon={MapIcon} label="Mapa de Risco" />
            <NavButton id="chat" icon={MessageSquare} label="Comunidade" />
            <NavButton id="profile" icon={User} label="Meu Perfil" />

            {!isSidebarCollapsed && (
              <div style={{ marginTop: '24px', padding: '15px', backgroundColor: '#fef2f2', borderRadius: '16px', border: '1px solid #fee2e2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '12px' }}>
                  <Phone size={16} />
                  <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contatos de Emergência</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { n: '190', t: 'Polícia Militar', d: 'Riscos e crimes ativos' },
                    { n: '191', t: 'PRF', d: 'Rodovias federais' },
                    { n: '192', t: 'SAMU', d: 'Emergências médicas' },
                    { n: '193', t: 'Bombeiros', d: 'Incêndios e resgates' },
                    { n: '194', t: 'Polícia Civil', d: 'Investigações' },
                    { n: '199', t: 'Defesa Civil', d: 'Desastres naturais' }
                  ].map(num => (
                    <div key={num.n} style={{ borderBottom: '1px solid #fee2e2', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#111827', fontWeight: '700' }}>{num.n}</span>
                        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '800' }}>{num.t}</span>
                      </div>
                      <p style={{ fontSize: '10px', color: '#6b7280', margin: '2px 0 0 0', lineHeight: '1.2' }}>{num.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
            {user ? (
              <button 
                onClick={() => supabase.auth.signOut()} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 18px', 
                  color: '#9ca3af', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600',
                  transition: '0.2s', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
                }}
              >
                <LogOut size={18} /> {!isSidebarCollapsed && "Sair da conta"}
              </button>
            ) : (
              <button 
                onClick={() => router.push('/login')} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px 18px', 
                  backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '12px', 
                  cursor: 'pointer', fontWeight: '600', transition: '0.2s', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
                }}
              >
                <LogIn size={18} /> {!isSidebarCollapsed && "Entrar"}
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Header para mobile */}
      {isMobile && (
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={24} color="#ef4444" />
            <span style={{ fontWeight: '900', fontSize: '1.2rem', color: '#111827' }}>CEALERTA</span>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: isMobileMenuOpen ? '#f3f4f6' : 'transparent'
            }}
          >
            <Phone size={18} />
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Contatos</span>
          </button>
        </header>
      )}

      <section style={{ 
        flex: 1, 
        position: 'relative', 
        overflow: 'hidden',
        paddingBottom: isMobile ? '70px' : '0'  // Espaço para a navbar mobile
      }}>
        {activeTab === 'map' && (
          <div style={{ height: '100%' }}>
            <Map incidents={incidents} onMapClick={handleMapClick} user={user} onDelete={deleteIncident} />
            <div style={{ 
              position: 'absolute', 
              bottom: isMobile ? '80px' : '24px', 
              left: isMobile ? '50%' : '24px', 
              transform: isMobile ? 'translateX(-50%)' : 'none',
              zIndex: 1000, 
              backgroundColor: 'white', 
              padding: isMobile ? '10px 16px' : '12px 20px', 
              borderRadius: '100px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              maxWidth: isMobile ? '90%' : 'none',
              whiteSpace: 'nowrap'
            }}>
              <MousePointer2 size={isMobile ? 14 : 16} color="#3b82f6" />
              <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: '600', color: '#4b5563' }}>
                Clique no mapa para registrar
              </span>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: '#fff',
            overflow: 'hidden' 
          }}>
            <div style={{ 
              padding: isMobile ? '20px' : '40px 60px', 
              borderBottom: '1px solid #f3f4f6',
              flexShrink: 0 
            }}>
              <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                Comunidade
              </h1>
              <p style={{ color: '#6b7280', marginTop: '8px', fontSize: isMobile ? '14px' : '16px' }}>
                Discussão em tempo real sobre a segurança local.
              </p>
            </div>
            
            <div style={{ 
              flex: 1, 
              maxWidth: '900px', 
              width: '100%', 
              margin: '0 auto', 
              padding: isMobile ? '12px' : '20px',
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: 0 
            }}>
              <Chat supabase={supabase} user={user} />
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ 
            height: '100%', 
            padding: isMobile ? '20px' : '60px', 
            overflowY: 'auto',
            paddingBottom: isMobile ? '20px' : '60px'
          }}>
            <Profile user={user} supabase={supabase} isMobile={isMobile} />
          </div>
        )}
      </section>

      {/* Navbar para mobile */}
      {isMobile && <MobileNavBar />}

      {showModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(8px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 10000 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: isMobile ? '20px' : '32px', 
            borderRadius: '20px', 
            width: '95%', 
            maxWidth: '500px', 
            maxHeight: '85vh', 
            overflowY: 'auto', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            margin: isMobile ? '20px' : '0'
          }}>
            <h2 style={{ 
              fontSize: isMobile ? '1.2rem' : '1.5rem', 
              fontWeight: '800', 
              marginBottom: '8px', 
              textAlign: 'center' 
            }}>
              O que aconteceu?
            </h2>
            <p style={{ 
              color: '#6b7280', 
              textAlign: 'center', 
              marginBottom: '24px', 
              fontSize: isMobile ? '13px' : '14px' 
            }}>
              Selecione a categoria oficial para o seu relato.
            </p>
            
            {Object.entries(INCIDENT_CATEGORIES).map(([category, types]) => (
              <div key={category} style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  color: '#ef4444', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  marginBottom: '8px', 
                  borderBottom: '1px solid #f3f4f6', 
                  paddingBottom: '4px' 
                }}>
                  {category}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                  {types.map(type => (
                    <button 
                      key={type} 
                      onClick={() => saveIncident(type)} 
                      style={{ 
                        padding: isMobile ? '10px 12px' : '12px 16px', 
                        borderRadius: '8px', 
                        border: '1px solid #e5e7eb', 
                        background: 'white', 
                        fontWeight: '600', 
                        cursor: 'pointer', 
                        textAlign: 'left',
                        fontSize: isMobile ? '13px' : '14px', 
                        transition: '0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => setShowModal(false)} 
              style={{ 
                width: '100%', 
                marginTop: '10px', 
                padding: '14px', 
                border: 'none', 
                background: '#f3f4f6', 
                borderRadius: '10px', 
                color: '#4b5563', 
                fontWeight: '700', 
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '16px'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}