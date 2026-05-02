import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';

const PastOrders = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastOrders = async () => {
      try {
        const response = await api.get(`/volunteer/${currentUser.user_id}`);
        // Filter for completed orders
        const completed = response.data.pickups.filter(p => p.status === 'completed');
        setPastOrders(completed);
      } catch (error) {
        console.error('Error fetching past orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPastOrders();
    }
  }, [currentUser]);

  const calculatePoints = (km) => {
    if (km <= 5) return 10;
    if (km <= 10) return 25;
    if (km <= 20) return 50;
    return 100;
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading your history...</div>;

  return (
    <div className="min-h-screen bg-ocean-50 font-sans text-ocean-950 antialiased pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />
      
      <Header />

      <main className="mx-auto w-[min(1000px,calc(100%_-_32px))] py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button 
              onClick={() => navigate('/volunteers')}
              className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-ocean-600 hover:text-ocean-800 transition"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-4xl font-black text-ocean-950">Mission History</h1>
            <p className="mt-2 text-slate-600 font-medium">Review your past redistribution impact and points earned.</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Completed</p>
            <p className="text-4xl font-black text-mint-600">{pastOrders.length}</p>
          </div>
        </div>

        {pastOrders.length > 0 ? (
          <div className="grid gap-4">
            {pastOrders.map((order) => (
              <article key={order._id} className="animate-rise bg-white rounded-2xl border border-ocean-100 p-6 shadow-soft flex items-center justify-between gap-6 hover:shadow-md transition">
                  <div className="flex items-center gap-6">
                    {order.delivery_photo ? (
                      <div className="relative group cursor-pointer" onClick={() => window.open(order.delivery_photo, '_blank')}>
                        <img 
                          src={order.delivery_photo} 
                          alt="Delivery Proof" 
                          className="h-16 w-16 rounded-xl object-cover border-2 border-ocean-100 group-hover:scale-105 transition shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <span className="text-[10px] text-white font-black uppercase">View</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-600 shrink-0">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-black text-ocean-950">{order.restaurant_name}</h3>
                      <p className="text-slate-600 font-medium">{order.quantity} {order.food_type} • {order.location}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Completed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Distance</p>
                    <p className="text-lg font-black text-ocean-900">{order.distance_km} km</p>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Points Earned</p>
                    <p className="text-lg font-black text-mint-600">+{calculatePoints(order.distance_km)} Pts</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/certificate/${order._id}`)}
                    className="rounded-xl border border-ocean-200 px-5 py-2 text-sm font-black text-ocean-950 hover:bg-ocean-50 transition"
                  >
                    View Certificate
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-dashed border-ocean-200 p-20 text-center">
            <div className="mx-auto h-20 w-20 bg-ocean-50 rounded-full flex items-center justify-center text-ocean-300 mb-6">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-ocean-950">No past missions yet</h3>
            <p className="mt-2 text-slate-500 font-medium max-w-sm mx-auto">
              Your completed food redistribution missions will appear here. Start your first mission from the dashboard!
            </p>
            <button 
              onClick={() => navigate('/volunteers')}
              className="mt-8 bg-ocean-950 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg hover:opacity-90 transition"
            >
              Find Pickups Near Me
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PastOrders;
