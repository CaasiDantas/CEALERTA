"use client"
import { useState, useEffect, useRef } from 'react';
import { Send, Reply, X, MessageSquare, CornerDownRight, ChevronDown, ChevronUp } from 'lucide-react';

export default function Chat({ supabase, user, isMobile = false }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles:user_id(full_name)')
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel('realtime:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload: any) => {
        const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', payload.new.user_id).single();
        setMessages((prev) => [...prev, { ...payload.new, profiles: prof }]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    const { error } = await supabase.from('messages').insert([{ 
      text: newMessage, 
      user_id: user.id,
      user_email: user.email,
      parent_id: replyTo ? replyTo.id : null 
    }]);
    
    if (!error) {
      setNewMessage("");
      setReplyTo(null);
    }
  };

  const Comment = ({ msg, level = 0 }: { msg: any, level?: number }) => {
    const isMe = msg.user_id === user?.id;
    const replies = messages.filter(m => m.parent_id === msg.id);
    const isExpanded = expandedThreads[msg.id] !== false;
    const displayName = msg.profiles?.full_name || msg.user_email?.split('@')[0] || "Usuário";

    return (
      <div style={{ 
        marginLeft: level > 0 ? (isMobile ? '12px' : '20px') : '0', 
        marginTop: isMobile ? '12px' : '16px',
        position: 'relative',
        paddingLeft: level > 0 ? (isMobile ? '8px' : '12px') : '0'
      }}>
        {level > 0 && (
          <div style={{
            position: 'absolute', 
            left: '0', 
            top: '0', 
            bottom: '0', 
            width: '2px',
            backgroundColor: '#EDEFF1'
          }} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? '6px' : '8px', 
            marginBottom: '4px',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              width: isMobile ? '20px' : '24px', 
              height: isMobile ? '20px' : '24px', 
              borderRadius: '50%', 
              backgroundColor: isMe ? '#ef4444' : '#ebedef',
              flexShrink: 0
            }} />
            <span style={{ 
              fontSize: isMobile ? '11px' : '12px', 
              fontWeight: '700', 
              color: '#1A1A1B',
              flexShrink: 0
            }}>
              {displayName}
            </span>
          </div>

          <div style={{ 
            fontSize: isMobile ? '13px' : '14px', 
            color: '#1A1A1B', 
            paddingLeft: isMobile ? '28px' : '32px', 
            marginBottom: isMobile ? '6px' : '8px',
            wordBreak: 'break-word'
          }}>
            {msg.text}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '8px' : '12px', 
            paddingLeft: isMobile ? '28px' : '32px',
            flexWrap: 'wrap'
          }}>
            {user && (
              <button 
                onClick={() => setReplyTo(msg)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#878A8C', 
                  fontSize: isMobile ? '11px' : '12px', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '2px 0'
                }}
              >
                <MessageSquare size={isMobile ? 12 : 14} /> Responder
              </button>
            )}
            
            {replies.length > 0 && (
              <button 
                onClick={() => setExpandedThreads(prev => ({ ...prev, [msg.id]: !isExpanded }))}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#878A8C', 
                  fontSize: isMobile ? '11px' : '12px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '2px 0'
                }}
              >
                {isExpanded ? 'Ocultar' : `Ver ${replies.length} respostas`}
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>

          {isExpanded && replies.length > 0 && (
            <div style={{ marginTop: isMobile ? '6px' : '8px' }}>
              {replies.map(reply => (
                <Comment key={reply.id} msg={reply} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Rolar para o final quando novas mensagens são adicionadas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      backgroundColor: 'white',
      overflow: 'hidden'
    }}>
      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: isMobile ? '12px' : '20px',
          WebkitOverflowScrolling: 'touch' // Para scroll suave no mobile
        }}
      >
        {messages.filter(m => !m.parent_id).length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#878A8C', 
            marginTop: isMobile ? '20px' : '40px',
            padding: isMobile ? '20px' : '40px'
          }}>
            <p style={{ fontSize: isMobile ? '14px' : '16px', marginBottom: '8px' }}>Nenhum comentário ainda.</p>
            <p style={{ fontSize: isMobile ? '13px' : '14px' }}>Seja o primeiro a compartilhar algo!</p>
          </div>
        )}
        {messages.filter(m => !m.parent_id).map((msg) => (
          <div 
            key={msg.id} 
            style={{ 
              borderBottom: '1px solid #f0f2f4', 
              paddingBottom: isMobile ? '12px' : '16px',
              marginBottom: isMobile ? '12px' : '16px'
            }}
          >
            <Comment msg={msg} />
          </div>
        ))}
      </div>

      <div style={{ 
        padding: isMobile ? '12px' : '20px', 
        borderTop: '1px solid #EDEFF1', 
        backgroundColor: '#F6F7F8',
        flexShrink: 0
      }}>
        {replyTo && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: isMobile ? '6px 8px' : '8px 12px', 
            backgroundColor: '#fff', 
            borderRadius: '4px 4px 0 0', 
            border: '1px solid #EDEFF1', 
            borderBottom: 'none',
            marginBottom: '-1px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: isMobile ? '11px' : '12px', 
              color: '#1a1a1b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              <CornerDownRight size={isMobile ? 12 : 14} />
              <span>Respondendo a <b>{replyTo.profiles?.full_name || 'Usuário'}</b></span>
            </div>
            <button 
              onClick={() => setReplyTo(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '4px',
                flexShrink: 0
              }}
            >
              <X size={isMobile ? 12 : 14} color="#878A8C" />
            </button>
          </div>
        )}
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '8px' : '10px',
          alignItems: 'flex-end'
        }}>
          <textarea 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!user}
            placeholder={user ? "Digite aqui seu relato..." : "Faça login para comentar na comunidade..."}
            style={{ 
              flex: 1, 
              padding: isMobile ? '10px' : '12px', 
              borderRadius: replyTo ? '0 0 4px 4px' : '4px', 
              border: '1px solid #EDEFF1', 
              fontSize: isMobile ? '14px' : '15px', 
              minHeight: isMobile ? '50px' : '60px', 
              maxHeight: '120px',
              outline: 'none', 
              backgroundColor: user ? 'white' : '#f0f2f4',
              cursor: user ? 'text' : 'not-allowed',
              resize: 'none',
              fontFamily: 'inherit'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button 
            onClick={() => sendMessage()}
            disabled={!user || !newMessage.trim()}
            style={{ 
              padding: isMobile ? '0 16px' : '0 20px', 
              backgroundColor: (user && newMessage.trim()) ? '#0079D3' : '#cccccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '999px', 
              fontWeight: '700', 
              cursor: (user && newMessage.trim()) ? 'pointer' : 'not-allowed', 
              height: isMobile ? '38px' : '40px',
              alignSelf: 'flex-end',
              flexShrink: 0,
              fontSize: isMobile ? '13px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={isMobile ? 14 : 16} />
            {!isMobile && "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}