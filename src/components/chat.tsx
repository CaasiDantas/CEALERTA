"use client"
import { useState, useEffect, useRef } from 'react';
import { Send, Reply, X, MessageSquare, CornerDownRight } from 'lucide-react';

export default function Chat({ supabase, user }: any) {
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
        marginLeft: level > 0 ? '20px' : '0', 
        marginTop: '16px',
        position: 'relative',
        paddingLeft: level > 0 ? '12px' : '0'
      }}>
        {level > 0 && (
          <div style={{
            position: 'absolute', left: '0', top: '0', bottom: '0', width: '2px',
            backgroundColor: '#EDEFF1'
          }} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isMe ? '#ef4444' : '#ebedef' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1A1A1B' }}>{displayName}</span>
          </div>

          <div style={{ fontSize: '14px', color: '#1A1A1B', paddingLeft: '32px', marginBottom: '8px' }}>
            {msg.text}
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingLeft: '32px' }}>
            {user && (
              <button 
                onClick={() => setReplyTo(msg)}
                style={{ background: 'none', border: 'none', color: '#878A8C', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <MessageSquare size={14} /> Responder
              </button>
            )}
            
            {replies.length > 0 && (
              <button 
                onClick={() => setExpandedThreads(prev => ({ ...prev, [msg.id]: !isExpanded }))}
                style={{ background: 'none', border: 'none', color: '#878A8C', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                {isExpanded ? 'Ocultar' : `Ver ${replies.length} respostas`}
              </button>
            )}
          </div>

          {isExpanded && replies.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {replies.map(reply => (
                <Comment key={reply.id} msg={reply} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.filter(m => !m.parent_id).length === 0 && (
          <p style={{ textAlign: 'center', color: '#878A8C', marginTop: '20px' }}>Nenhum comentário ainda. Seja o primeiro!</p>
        )}
        {messages.filter(m => !m.parent_id).map((msg) => (
          <div key={msg.id} style={{ borderBottom: '1px solid #f0f2f4', paddingBottom: '16px' }}>
            <Comment msg={msg} />
          </div>
        ))}
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid #EDEFF1', backgroundColor: '#F6F7F8' }}>
        {replyTo && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fff', borderRadius: '4px 4px 0 0', border: '1px solid #EDEFF1', borderBottom: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1a1a1b' }}>
              <CornerDownRight size={14} />
              <span>Respondendo a <b>{replyTo.profiles?.full_name || 'Usuário'}</b></span>
            </div>
            <X size={14} onClick={() => setReplyTo(null)} style={{ cursor: 'pointer', color: '#878A8C' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <textarea 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!user}
            placeholder={user ? "Digite aqui seu relato?" : "Faça login para comentar na comunidade..."}
            style={{ 
              flex: 1, padding: '12px', borderRadius: replyTo ? '0 0 4px 4px' : '4px', 
              border: '1px solid #EDEFF1', fontSize: '14px', minHeight: '60px', 
              outline: 'none', backgroundColor: user ? 'white' : '#f0f2f4',
              cursor: user ? 'text' : 'not-allowed'
            }}
          />
          <button 
            onClick={() => sendMessage()}
            disabled={!user || !newMessage.trim()}
            style={{ 
              padding: '0 20px', 
              backgroundColor: (user && newMessage.trim()) ? '#0079D3' : '#cccccc', 
              color: 'white', border: 'none', borderRadius: '999px', 
              fontWeight: '700', cursor: (user && newMessage.trim()) ? 'pointer' : 'not-allowed', 
              height: '40px', alignSelf: 'flex-end'
            }}
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
}