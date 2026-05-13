import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import Toast from '../components/Toast';

const REWARDS_LIST = [
  { id: 1, name: 'Zomato Pro', desc: 'Flat 50% OFF on all orders', cost: 100, color: 'bg-red-500', icon: '🍕' },
  { id: 2, name: 'Amazon Pay', desc: 'Rs. 100 Gift Voucher', cost: 250, color: 'bg-orange-400', icon: '🛒' },
  { id: 3, name: 'Starbucks', desc: 'Buy 1 Get 1 Free on Beverages', cost: 150, color: 'bg-green-700', icon: '☕' },
  { id: 4, name: 'Nike Store', desc: 'Extra 20% OFF on Sneakers', cost: 400, color: 'bg-black', icon: '👟' },
  { id: 5, name: 'Netflix Premium', desc: '1 Month Subscription Free', cost: 600, color: 'bg-red-700', icon: '🎬' },
  { id: 6, name: 'BookMyShow', desc: 'Flat Rs. 150 OFF on Movies', cost: 120, color: 'bg-pink-600', icon: '🎟️' }
];

const Rewards = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [points, setPoints] = useState(0);
  const [claimedReward, setClaimedReward] = useState(null);
  const [showScratch, setShowScratch] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await api.get(`/volunteer/${currentUser.user_id}`);
        setPoints(response.data.total_points);
      } catch (error) {
        console.error('Error fetching points:', error);
      }
    };
    if (currentUser) fetchPoints();
  }, [currentUser]);

  const handleClaim = async (reward) => {
    if (points < reward.cost) {
      setToast({ show: true, message: '❌ Insufficient points! Keep distributing food to earn more.' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
      return;
    }

    try {
      const response = await api.post('/redeem', {
        user_id: currentUser.user_id,
        cost: reward.cost,
        reward_name: reward.name
      });

      if (response.data.success) {
        setPoints(response.data.newPoints);
        setClaimedReward({ ...reward, code: response.data.code });
        setShowScratch(true);
      }
    } catch (error) {
      setToast({ show: true, message: 'Failed to claim reward. Please try again.' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900 antialiased pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,#e2e8f0,transparent)]" />
      
      <Header />

      <main className="mx-auto w-[min(1100px,calc(100%_-_32px))] py-8">
        {/* User Points Header */}
        <div className="animate-rise rounded-3xl bg-ocean-950 p-10 text-white shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-mint-500/20 to-transparent"></div>
          <div className="relative z-10 flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[.3em] text-mint-400 mb-2">Rewards Portfolio</p>
              <h1 className="text-5xl font-black tracking-tighter">Your Savings Hub</h1>
              <p className="mt-3 text-ocean-200 font-medium">Redeem your FeedNet points for exclusive brand vouchers.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center min-w-[200px]">
              <p className="text-xs font-black uppercase tracking-widest text-mint-400 mb-1">Available Balance</p>
              <p className="text-5xl font-black text-white">{points} <span className="text-lg text-ocean-300">Pts</span></p>
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {REWARDS_LIST.map((reward) => (
            <article 
              key={reward.id} 
              className={`group animate-float-in bg-white rounded-3xl p-6 shadow-soft border border-slate-100 hover:border-ocean-300 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between`}
            >
              <div>
                <div className={`${reward.color} h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  {reward.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900">{reward.name}</h3>
                <p className="mt-2 text-slate-500 font-medium leading-relaxed">{reward.desc}</p>
              </div>
              
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cost</span>
                  <span className="text-lg font-black text-ocean-600">{reward.cost} Pts</span>
                </div>
                <button 
                  onClick={() => handleClaim(reward)}
                  className="bg-ocean-950 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-mint-600 transition-colors"
                >
                  Claim Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Scratch Card Modal (PhonePe Style) */}
      {showScratch && claimedReward && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-ocean-950/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-md animate-rise">
            <div className="bg-white rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <div className={`${claimedReward.color} p-12 text-center text-white relative`}>
                <div className="absolute top-4 right-6 text-4xl opacity-20">★</div>
                <div className="absolute bottom-4 left-6 text-4xl opacity-20">★</div>
                <p className="text-sm font-black uppercase tracking-[.3em] opacity-80 mb-4">Congratulations!</p>
                <div className="text-6xl mb-6">{claimedReward.icon}</div>
                <h2 className="text-4xl font-black">{claimedReward.name}</h2>
                <p className="mt-2 font-bold opacity-90">{claimedReward.desc}</p>
              </div>
              
              <div className="p-10 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Your Unique Reward Code</p>
                <div className="bg-slate-100 rounded-2xl p-6 border-2 border-dashed border-slate-300 relative group overflow-hidden">
                   <p className="text-4xl font-black tracking-[0.2em] text-ocean-950">{claimedReward.code}</p>
                   <div className="absolute inset-0 bg-ocean-950 flex items-center justify-center text-white font-black uppercase tracking-widest cursor-pointer group-hover:translate-y-full transition-transform duration-500">
                     Hover to reveal
                   </div>
                </div>
                <p className="mt-6 text-sm text-slate-500 font-medium">Use this code at checkout to avail your discount.</p>
                
                <button 
                  onClick={() => { setShowScratch(false); setClaimedReward(null); }}
                  className="mt-10 w-full bg-ocean-950 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:opacity-90 transition"
                >
                  Close & Continue
                </button>
              </div>
            </div>
            
            <p className="mt-6 text-center text-white/40 text-xs font-black uppercase tracking-[.5em]">FeedNet Rewards • Verified Hero</p>
          </div>
        </div>
      )}

      <Toast message={toast.message} show={toast.show} />
    </div>
  );
};

export default Rewards;
