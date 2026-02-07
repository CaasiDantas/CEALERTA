"use client"
import { useState, useEffect, useRef } from 'react';
import { Send, Reply, X, MessageSquare, CornerDownRight, ChevronDown, ChevronUp, Pencil } from 'lucide-react';

const Comment = ({ 
  msg, level = 0, user, messages, c, isMobile, 
  editingId, setEditingId, editValue, setEditValue, 
  saveEdit, setReplyTo, expandedThreads, setExpandedThreads 
}: any) => {
  const isMe = msg.user_id === user?.id;
  const replies = messages.filter((m: any) => m.parent_id === msg.id);
  const isExpanded = expandedThreads[msg.id] !== false;
  const isEditing = editingId === msg.id;
  const displayName = msg.profiles?.full_name || msg.user_email?.split('@')[0] || "Usuário";

  // No mobile, o recuo é mínimo para ganhar espaço
  const paddingLeftValue = level === 0 ? 0 : (isMobile ? 10 : 25);

  return (
    <div style={{ 
      width: '100%',
      marginTop: isMobile ? '10px' : '16px',
      paddingLeft: `${paddingLeftValue}px`,
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      {/* Linha vertical de thread */}
      {level > 0 && (
        <div style={{ 
          position: 'absolute', 
          left: isMobile ? '4px' : '12px', 
          top: 0, 
          bottom: 0, 
          width: '2px', 
          backgroundColor: c.line,
          opacity: 0.5
        }} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ 
            width: isMobile ? '18px' : '24px', 
            height: isMobile ? '18px' : '24px', 
            borderRadius: '50%', 
            backgroundColor: isMe ? c.meBg : c.otherBg,
            flexShrink: 0 
          }} />
          <span style={{ 
            fontSize: isMobile ? '12px' : '14px', 
            fontWeight: '700', 
            color: c.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {displayName}
          </span>
        </div>

        {/* Text Content */}
        <div style={{ 
          paddingLeft: isMobile ? '26px' : '32px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {isEditing ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea 
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onFocus={(e) => {
                  const t = e.target.value;
                  e.target.value = ''; e.target.value = t;
                }}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  backgroundColor: c.inputBg, color: c.text, border: `2px solid ${c.accent}`,
                  fontSize: '14px', outline: 'none', resize: 'none', minHeight: '80px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => saveEdit(msg.id)} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', cursor: 'pointer' }}>Salvar</button>
                <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: c.subtext, cursor: 'pointer' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <p style={{ 
              margin: 0, 
              fontSize: isMobile ? '14px' : '15px', 
              color: c.text, 
              lineHeight: '1.5',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap' 
            }}>{msg.text}</p>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '12px' : '20px', 
          paddingLeft: isMobile ? '26px' : '32px',
          marginTop: '6px',
          flexWrap: 'wrap'
        }}>
          {user && !isEditing && (
            <button onClick={() => setReplyTo(msg)} style={{ background: 'none', border: 'none', color: c.subtext, fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageSquare size={13} /> Responder
            </button>
          )}
          {isMe && !isEditing && (
            <button onClick={() => { setEditingId(msg.id); setEditValue(msg.text); }} style={{ background: 'none', border: 'none', color: c.subtext, fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Pencil size={13} /> Editar
            </button>
          )}
          {replies.length > 0 && (
            <button onClick={() => setExpandedThreads((p: any) => ({ ...p, [msg.id]: !isExpanded }))} style={{ background: 'none', border: 'none', color: c.subtext, fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
              {isExpanded ? 'Ocultar' : `Ver ${replies.length} respostas`}
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>

        {isExpanded && replies.length > 0 && (
          <div style={{ width: '100%' }}>
            {replies.map((reply: any) => (
              <Comment 
                key={reply.id} msg={reply} level={level + 1}
                user={user} messages={messages} c={c} isMobile={isMobile}
                editingId={editingId} setEditingId={setEditingId}
                editValue={editValue} setEditValue={setEditValue}
                saveEdit={saveEdit} setReplyTo={setReplyTo}
                expandedThreads={expandedThreads} setExpandedThreads={setExpandedThreads}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Chat({ supabase, user, isMobile = false, isDarkMode = false }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const c = {
    bg: isDarkMode ? '#1f2937' : 'white',
    inputBg: isDarkMode ? '#111827' : 'white',
    footerBg: isDarkMode ? '#111827' : '#F6F7F8',
    text: isDarkMode ? '#f9fafb' : '#1A1A1B',
    subtext: isDarkMode ? '#9ca3af' : '#878A8C',
    border: isDarkMode ? '#374151' : '#EDEFF1',
    line: isDarkMode ? '#4b5563' : '#EDEFF1',
    meBg: '#ef4444',
    otherBg: isDarkMode ? '#374151' : '#ebedef',
    accent: '#ef4444'
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*, profiles:user_id(full_name)').order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase.channel('realtime:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (p: any) => {
        const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', p.new.user_id).single();
        setMessages((prev) => [...prev, { ...p.new, profiles: prof }]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (p: any) => {
        setMessages((prev) => prev.map(m => m.id === p.new.id ? { ...m, text: p.new.text } : m));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    const { error } = await supabase.from('messages').insert([{ 
      text: newMessage, user_id: user.id, user_email: user.email, parent_id: replyTo ? replyTo.id : null 
    }]);
    if (!error) { setNewMessage(""); setReplyTo(null); }
  };

  const saveEdit = async (id: string) => {
    if (!editValue.trim()) return;
    const { error } = await supabase.from('messages').update({ text: editValue }).eq('id', id);
    if (!error) { setEditingId(null); setEditValue(""); }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
      backgroundColor: c.bg, overflow: 'hidden', position: 'relative'
    }}>
      {/* Container de Mensagens */}
      <div ref={scrollRef} style={{ 
        flex: 1, overflowY: 'auto', padding: isMobile ? '10px' : '20px',
        width: '100%', boxSizing: 'border-box'
      }}>
        {messages.filter(m => !m.parent_id).map((msg) => (
          <div key={msg.id} style={{ 
            borderBottom: `1px solid ${c.border}`, 
            paddingBottom: '12px', 
            marginBottom: '12px',
            width: '100%' 
          }}>
            <Comment 
              msg={msg} user={user} messages={messages} c={c} isMobile={isMobile}
              editingId={editingId} setEditingId={setEditingId}
              editValue={editValue} setEditValue={setEditValue}
              saveEdit={saveEdit} setReplyTo={setReplyTo}
              expandedThreads={expandedThreads} setExpandedThreads={setExpandedThreads}
            />
          </div>
        ))}
      </div>

      {/* Input de Mensagem */}
      <div style={{ 
        padding: isMobile ? '8px' : '15px 20px', 
        borderTop: `1px solid ${c.border}`, 
        backgroundColor: c.footerBg,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {replyTo && (
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '6px 10px', backgroundColor: c.bg, border: `1px solid ${c.border}`,
            borderBottom: 'none', borderRadius: '4px 4px 0 0'
          }}>
            <span style={{ fontSize: '11px', color: c.text }}>Respondendo a <b>{replyTo.profiles?.full_name || 'Usuário'}</b></span>
            <X size={14} onClick={() => setReplyTo(null)} style={{ cursor: 'pointer' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <textarea 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!user}
            placeholder={user ? "Digite aqui seu relato..." : "Faça login para relatar ou comentar..."}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: replyTo ? '0 0 8px 8px' : '8px', 
              border: `1px solid ${c.border}`, 
              backgroundColor: user ? c.inputBg : (isDarkMode ? '#0d1117' : '#f0f2f4'), 
              color: c.text, 
              fontSize: '14px', 
              height: '40px', 
              outline: 'none', 
              resize: 'none',
              cursor: user ? 'text' : 'not-allowed', // Cursor de bloqueio se não logado
              opacity: user ? 1 : 0.7
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button 
            onClick={sendMessage}
            disabled={!user || !newMessage.trim()}
            style={{ 
              backgroundColor: c.accent, color: 'white', border: 'none', 
              borderRadius: '8px', width: '40px', height: '40px', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}