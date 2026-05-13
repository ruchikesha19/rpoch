import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { io } from "socket.io-client";
import api from '../services/api';

const Counter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const Community = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stats, setStats] = useState({ restaurants: 0, volunteers: 0, meals: 0 });
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/community-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching community stats:', error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Connect with user role in query
    socketRef.current = io("http://localhost:5000", {
      query: { role: currentUser.user_type }
    });

    // Listen for incoming messages
    socketRef.current.on('receive_message', (data) => {
      console.log('New message received via socket:', data);
      setMessages((prev) => [data, ...prev]);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser]);

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !socketRef.current) return;

    const messageData = {
      id: Date.now(),
      author: currentUser.name,
      role: currentUser.user_type,
      message: newMessage.trim(),
      createdAt: Date.now()
    };

    // Emit message to backend
    socketRef.current.emit('send_message', messageData);
    
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getRoleColor = (role) => {
    return role === 'restaurant' ? 'text-coral' : 'text-mint-700';
  };

  return (
    <div className="bg-ocean-50 font-sans text-ocean-950 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />

      <Header />

      <main className="mx-auto w-[min(1180px,calc(100%_-_32px))] py-8">
        <section className="grid grid-cols-[1fr_1.2fr] gap-6 max-lg:grid-cols-1">
          <aside className="animate-rise rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Community hub</p>
            <h1 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">
              Connect, share, and coordinate.
            </h1>
            <p className="mt-3 leading-7 text-slate-600">
              Join the conversation between restaurants and volunteers. Share updates, coordinate pickups, and build a stronger food redistribution network.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-lg bg-mint-100 p-4 text-sm font-bold leading-6 text-slate-600">
                <strong className="text-mint-700 uppercase tracking-widest text-[10px]">Active members</strong>: <br/>
                <span className="text-lg font-black text-ocean-950"><Counter end={stats.restaurants} /></span> restaurants and <span className="text-lg font-black text-ocean-950"><Counter end={stats.volunteers} /></span> volunteers
              </div>
              <div className="rounded-lg bg-ocean-100 p-4 text-sm font-bold leading-6 text-slate-600">
                <strong className="text-ocean-700 uppercase tracking-widest text-[10px]">Meals coordinated</strong>: <br/>
                <span className="text-lg font-black text-ocean-950"><Counter end={stats.meals} /></span>+ through community efforts
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-black text-ocean-950 mb-3">Community guidelines</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-mint-500">•</span>
                  <span>Be respectful and professional in all communications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint-500">•</span>
                  <span>Share accurate pickup times and food quantities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint-500">•</span>
                  <span>Update promptly if plans change</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint-500">•</span>
                  <span>Celebrate successful pickups and thank volunteers</span>
                </li>
              </ul>
            </div>
          </aside>

          <section className="animate-float-in rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4 max-sm:flex-col">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Live discussion</p>
                <h2 className="text-3xl font-black text-ocean-950">Community chat</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Real-time coordination between restaurants and volunteers
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-black text-green-600">Live</span>
              </div>
            </div>

            <div className="mt-5 max-h-96 overflow-y-auto space-y-3 p-1">
              {messages.map((msg) => (
                <article key={msg.id} className="rounded-lg border border-ocean-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-black text-ocean-950">{msg.author}</span>
                        <span className={`text-xs font-black ${getRoleColor(msg.role)}`}>
                          {msg.role}
                        </span>
                        <span className="text-xs text-slate-500">{formatTime(msg.createdAt)}</span>
                      </div>
                      <p className="text-slate-700">{msg.message}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {currentUser && (
              <form className="mt-5 grid gap-3" onSubmit={handleSubmitMessage}>
                <label className="grid gap-2 text-sm font-black text-ocean-950">
                  Share an update or coordinate a pickup
                  <textarea
                    className="field min-h-[80px] resize-none"
                    name="message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    required
                  />
                </label>
                <button className="submit-button" type="submit">
                  Send message as {currentUser.user_type}
                </button>
              </form>
            )}

            {!currentUser && (
              <div className="mt-5 rounded-lg border border-ocean-100 p-4 text-center">
                <p className="text-sm font-bold text-slate-600">
                  Please <span className="text-ocean-800 font-black">login</span> to join the community discussion
                </p>
              </div>
            )}
          </section>
        </section>

        <section className="mt-6 grid grid-cols-3 gap-4 max-lg:grid-cols-1">
          <article className="lift-card rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-mint-100 font-black text-mint-700">📊</span>
            <h3 className="mt-4 text-lg font-black text-ocean-950">Weekly stats</h3>
            <p className="mt-2 text-sm text-slate-600">
              Track community impact and participation metrics
            </p>
            <button className="mt-4 text-sm font-black text-ocean-800 hover:text-mint-700 transition-colors">
              View stats →
            </button>
          </article>

          <article className="lift-card rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-orange-50 font-black text-coral">🏆</span>
            <h3 className="mt-4 text-lg font-black text-ocean-950">Top contributors</h3>
            <p className="mt-2 text-sm text-slate-600">
              Recognize volunteers and restaurants making the biggest impact
            </p>
            <button className="mt-4 text-sm font-black text-ocean-800 hover:text-mint-700 transition-colors">
              See leaders →
            </button>
          </article>

          <article className="lift-card rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-ocean-100 font-black text-ocean-700">📅</span>
            <h3 className="mt-4 text-lg font-black text-ocean-950">Events</h3>
            <p className="mt-2 text-sm text-slate-600">
              Join community events and training sessions
            </p>
            <button className="mt-4 text-sm font-black text-ocean-800 hover:text-mint-700 transition-colors">
              Browse events →
            </button>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Community;
