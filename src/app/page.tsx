"use client"
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ShieldAlert, MapPin, MousePointer2, 
  MessageSquare, User, Map as MapIcon, LogOut, LogIn, Phone,
  Menu, X, Sun, Moon
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
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Adicionado
  const [idToDelete, setIdToDelete] = useState<string | null>(null); // Adicionado
  const [tempCoords, setTempCoords] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  // Cores Dinâmicas
  const theme = {
    bg: isDarkMode ? '#111827' : '#f9fafb',
    sidebar: isDarkMode ? '#1f2937' : 'white',
    text: isDarkMode ? '#f9fafb' : '#111827',
    subtext: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    card: isDarkMode ? '#1f2937' : 'white',
    hover: isDarkMode ? '#374151' : '#f3f4f6'
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Lógica de Horário para Tema Automático (17:00 às 05:00)
    const checkTimeForTheme = () => {
      const hour = new Date().getHours();
      if (hour >= 17 || hour < 5) {
        setIsDarkMode(true);
      } else {
        setIsDarkMode(false);
      }
    };
    
    checkTimeForTheme();
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

  // Função alterada para abrir o modal em vez do confirm nativo
  async function deleteIncident(id: string) {
    setIdToDelete(id);
    setShowDeleteModal(true);
  }

  // Função para confirmar a exclusão
  async function confirmDelete() {
    if (!idToDelete) return;
    const { error } = await supabase.from('incidents').delete().eq('id', idToDelete);
    if (!error) {
      fetchIncidents();
      setShowDeleteModal(false);
      setIdToDelete(null);
    }
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
        padding: isMobile ? '10px 12px' : (isSidebarCollapsed ? '14px 0' : '14px 18px'),
        border: 'none', 
        borderRadius: isMobile ? '10px' : '14px', 
        cursor: 'pointer', 
        transition: '0.3s', 
        fontSize: isMobile ? '14px' : '15px', 
        fontWeight: '600',
        backgroundColor: activeTab === id ? (isDarkMode ? '#ef444420' : '#fef2f2') : 'transparent',
        color: activeTab === id ? '#ef4444' : theme.subtext,
        justifyContent: isMobile ? 'center' : (isSidebarCollapsed ? 'center' : 'flex-start'),
        flexDirection: isMobile ? 'column' : 'row',
        textAlign: isMobile ? 'center' : 'left'
      }}
    >
      <Icon size={20} /> 
      {(!isSidebarCollapsed || isMobile) && <span style={{ fontSize: isMobile ? '11px' : 'inherit' }}>{label}</span>}
    </button>
  );

  const MobileNavBar = () => (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.sidebar,
      borderTop: `1px solid ${theme.border}`,
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
          backgroundColor: theme.sidebar,
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.border}`,
          zIndex: 999,
          maxHeight: '70vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontWeight: '700', color: theme.text, fontSize: '16px' }}>Contatos de Emergência</span>
            <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={20} color={theme.subtext} />
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
                border: isDarkMode ? '1px solid #ef444440' : '1px solid #fee2e2', 
                borderRadius: '12px', 
                padding: '14px',
                backgroundColor: isDarkMode ? '#ef444410' : '#fef2f2',
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
                      backgroundColor: isDarkMode ? '#ef444420' : '#fee2e2', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#ef4444' }}>{num.n}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: theme.text }}>{num.t}</span>
                      <p style={{ fontSize: '12px', color: theme.subtext, margin: '2px 0 0 0', lineHeight: '1.2' }}>{num.d}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '20px', borderTop: `1px solid ${theme.border}`, paddingTop: '16px' }}>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ 
                width: '100%', 
                padding: '14px', 
                backgroundColor: isDarkMode ? '#ef4444' : '#111827', 
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
      backgroundColor: theme.bg, 
      fontFamily: 'Inter, sans-serif',
      flexDirection: isMobile ? 'column' : 'row',
      transition: 'background-color 0.3s'
    }}>
      
      {/* Sidebar para desktop */}
      {!isMobile && (
        <aside style={{ 
          width: isSidebarCollapsed ? '80px' : '280px', 
          backgroundColor: theme.sidebar, 
          borderRight: `1px solid ${theme.border}`, 
          display: 'flex', 
          flexDirection: 'column', 
          padding: isSidebarCollapsed ? '32px 10px' : '32px 20px',
          transition: '0.3s',
          flexShrink: 0
        }}>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            marginBottom: '48px', 
            paddingLeft: isSidebarCollapsed ? '0' : '10px',
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
          }}>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: theme.subtext, 
                padding: '0', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                width: isSidebarCollapsed ? '100%' : 'auto'
              }}
            >
              <span style={{ filter: isDarkMode ? 'invert(100%) hue-rotate(180deg)' : 'none' }}>
                <Menu size={24} />
              </span>
            </button>
            {!isSidebarCollapsed && (
              <>
                <ShieldAlert size={32} color="#ef4444" />
                <span style={{ fontWeight: '900', fontSize: '1.4rem', color: theme.text, letterSpacing: '-1px' }}>CEALERTA</span>
              </>
            )}
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
            <NavButton id="map" icon={MapIcon} label="Mapa de Risco" />
            <NavButton id="chat" icon={MessageSquare} label="Comunidade" />
            <NavButton id="profile" icon={User} label="Meu Perfil" />

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: isSidebarCollapsed ? '14px 0' : '14px 18px',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: theme.subtext,
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                fontWeight: '600',
                transition: '0.3s'
              }}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              {!isSidebarCollapsed && <span>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
            </button>

            {!isSidebarCollapsed && (
              <div style={{ marginTop: '24px', padding: '15px', backgroundColor: isDarkMode ? '#ef444410' : '#fef2f2', borderRadius: '16px', border: isDarkMode ? '1px solid #ef444440' : '1px solid #fee2e2' }}>
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
                    <div key={num.n} style={{ borderBottom: `1px solid ${isDarkMode ? '#ef444420' : '#fee2e2'}`, paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: theme.text, fontWeight: '700' }}>{num.n}</span>
                        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '800' }}>{num.t}</span>
                      </div>
                      <p style={{ fontSize: '10px', color: theme.subtext, margin: '2px 0 0 0', lineHeight: '1.2' }}>{num.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '20px' }}>
            {user ? (
              <button 
                onClick={() => supabase.auth.signOut()} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: isSidebarCollapsed ? '12px 0' : '12px 18px', 
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
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: isSidebarCollapsed ? '14px 0' : '14px 18px', 
                  backgroundColor: isDarkMode ? '#ef4444' : '#111827', color: 'white', border: 'none', borderRadius: '12px', 
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
          backgroundColor: theme.sidebar,
          borderBottom: `1px solid ${theme.border}`,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={24} color="#ef4444" />
            <span style={{ fontWeight: '900', fontSize: '1.2rem', color: theme.text }}>CEALERTA</span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{ background: 'none', border: 'none', color: theme.subtext, padding: '8px' }}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: theme.subtext,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: isMobileMenuOpen ? theme.hover : 'transparent'
              }}
            >
              <Phone size={18} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>Contatos</span>
            </button>
          </div>
        </header>
      )}

      <section style={{ 
        flex: 1, 
        position: 'relative', 
        overflow: 'hidden',
        paddingBottom: isMobile ? '70px' : '0'
      }}>
        {activeTab === 'map' && (
          <div style={{ 
            height: '100%',
            filter: isDarkMode ? 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' : 'none',
            transition: 'filter 0.5s ease'
          }}>
            <Map incidents={incidents} onMapClick={handleMapClick} user={user} onDelete={deleteIncident} />
            <div style={{ 
              position: 'absolute', 
              bottom: isMobile ? '80px' : '24px', 
              left: isMobile ? '50%' : '24px', 
              transform: isMobile ? 'translateX(-50%)' : 'none',
              zIndex: 1000, 
              backgroundColor: theme.sidebar, 
              padding: isMobile ? '10px 16px' : '12px 20px', 
              borderRadius: '100px', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              maxWidth: isMobile ? '90%' : 'none',
              whiteSpace: 'nowrap',
              border: `1px solid ${theme.border}`,
              filter: isDarkMode ? 'invert(100%) hue-rotate(180deg)' : 'none'
            }}>
              <MousePointer2 size={isMobile ? 14 : 16} color="#3b82f6" />
              <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: '600', color: theme.subtext }}>
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
            backgroundColor: theme.sidebar,
            overflow: 'hidden' 
          }}>
            <div style={{ 
              padding: isMobile ? '20px' : '40px 60px', 
              borderBottom: `1px solid ${theme.border}`,
              flexShrink: 0 
            }}>
              <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: '800', color: theme.text, margin: 0 }}>
                Comunidade
              </h1>
              <p style={{ color: theme.subtext, marginTop: '8px', fontSize: isMobile ? '14px' : '16px' }}>
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
              <Chat supabase={supabase} user={user} isDarkMode={isDarkMode} />
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ 
            height: '100%', 
            padding: isMobile ? '20px' : '60px', 
            overflowY: 'auto',
            paddingBottom: isMobile ? '20px' : '60px',
            backgroundColor: theme.bg
          }}>
            <Profile user={user} supabase={supabase} isMobile={isMobile} isDarkMode={isDarkMode} />
          </div>
        )}
      </section>

      {/* Navbar para mobile */}
      {isMobile && <MobileNavBar />}

      {/* MODAL DE CRIAÇÃO */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(8px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 10000 
        }}>
          <div style={{ 
            backgroundColor: theme.sidebar, 
            padding: isMobile ? '20px' : '32px', 
            borderRadius: '20px', 
            width: '95%', 
            maxWidth: '500px', 
            maxHeight: '85vh', 
            overflowY: 'auto', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            margin: isMobile ? '20px' : '0',
            border: `1px solid ${theme.border}`
          }}>
            <h2 style={{ 
              fontSize: isMobile ? '1.2rem' : '1.5rem', 
              fontWeight: '800', 
              marginBottom: '8px', 
              textAlign: 'center',
              color: theme.text
            }}>
              O que aconteceu?
            </h2>
            <p style={{ 
              color: theme.subtext, 
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
                  borderBottom: `1px solid ${theme.border}`, 
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
                        border: `1px solid ${theme.border}`, 
                        background: theme.card, 
                        fontWeight: '600', 
                        cursor: 'pointer', 
                        textAlign: 'left',
                        fontSize: isMobile ? '13px' : '14px', 
                        transition: '0.2s',
                        color: theme.text
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.card}
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
                background: theme.hover, 
                borderRadius: '10px', 
                color: theme.subtext, 
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

      {/* NOVO MODAL DE EXCLUSÃO */}
      {showDeleteModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 11000 
        }}>
          <div style={{ 
            backgroundColor: theme.sidebar, 
            padding: '24px', 
            borderRadius: '20px', 
            width: '90%', 
            maxWidth: '400px', 
            textAlign: 'center', 
            border: `1px solid ${theme.border}`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#ef444420', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldAlert size={28} color="#ef4444" />
            </div>
            <h2 style={{ color: theme.text, fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>Confirmar Exclusão?</h2>
            <p style={{ color: theme.subtext, fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
              Esta ação removerá o relato permanentemente do mapa de risco da comunidade.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: theme.hover, color: theme.text, fontWeight: '600', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete} 
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer' }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}