import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await api.get(`/restaurants/${currentUser.user_id}/pickups`);
        const found = response.data.pickups.find(p => p._id === id);
        if (found) {
          setPickup(found);
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchInvoiceData();
    }
  }, [id, currentUser]);

  if (loading) return <div className="p-10 text-center font-bold">Generating invoice...</div>;
  if (!pickup) return <div className="p-10 text-center font-bold">Listing not found.</div>;

  const invoiceNumber = `FN-${pickup._id.slice(-6).toUpperCase()}`;
  const co2Saved = (parseInt(pickup.quantity) * 0.19).toFixed(2);

  return (
    <div className="min-h-screen bg-ocean-50 font-sans text-ocean-950 antialiased pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />
      
      <Header />

      <main className="mx-auto w-[min(800px,calc(100%_-_32px))] py-8">
        <button 
          onClick={() => navigate('/restaurants')}
          className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-ocean-600 hover:text-ocean-800 transition no-print"
        >
          ← Back to Dashboard
        </button>

        <section className="animate-float-in overflow-hidden rounded-3xl border border-ocean-100 bg-white shadow-2xl">
          {/* Invoice Header */}
          <div className="bg-ocean-950 p-10 text-white flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-mint-500 rounded-lg flex items-center justify-center font-black text-white">FN</div>
                <span className="text-2xl font-black tracking-tight">FeedNet</span>
              </div>
              <h1 className="text-4xl font-black">Donation Invoice</h1>
              <p className="mt-2 text-ocean-300 font-bold uppercase tracking-widest text-sm">Official Redistribution Certificate</p>
            </div>
            <div className="text-right">
              <p className="text-ocean-400 font-black uppercase tracking-widest text-xs mb-1">Invoice Number</p>
              <p className="text-2xl font-black text-mint-400">{invoiceNumber}</p>
              <p className="mt-4 text-ocean-400 font-black uppercase tracking-widest text-xs mb-1">Date</p>
              <p className="font-bold">{new Date(pickup.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-2 gap-10 p-10 border-b border-ocean-50">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">From (Restaurant)</p>
              <p className="text-xl font-black text-ocean-900">{pickup.restaurant_name}</p>
              <p className="text-slate-600 font-medium">{pickup.location}</p>
              <p className="text-slate-500 text-sm mt-1">Verified Partner ID: {currentUser.user_id.slice(-8)}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Status & Tracking</p>
              <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 ${
                pickup.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-mint-100 text-mint-700'
              }`}>
                {pickup.status}
              </span>
              <p className="text-slate-600 font-medium">Pickup Time: {new Date(pickup.created_at).toLocaleTimeString()}</p>
              <p className="text-slate-500 text-sm mt-1">Method: Real-time Redistribution</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-10">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-ocean-950/10">
                  <th className="pb-4 text-sm font-black uppercase tracking-widest text-ocean-900">Description</th>
                  <th className="pb-4 text-sm font-black uppercase tracking-widest text-ocean-900 text-center">Quantity</th>
                  <th className="pb-4 text-sm font-black uppercase tracking-widest text-ocean-900 text-right">Points Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-ocean-50">
                  <td className="py-6">
                    <p className="font-black text-ocean-950 text-lg">{pickup.food_type}</p>
                    <p className="text-sm text-slate-500 font-medium">Surplus food recovery and distribution</p>
                  </td>
                  <td className="py-6 text-center font-bold text-ocean-900">{pickup.quantity}</td>
                  <td className="py-6 text-right font-black text-ocean-950">50 Pts</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Impact Stats */}
          <div className="mx-10 mb-10 p-8 rounded-2xl bg-ocean-50 border border-ocean-100 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">CO2 Offset</p>
              <p className="text-2xl font-black text-ocean-950">{co2Saved} kg</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">People Fed</p>
              <p className="text-2xl font-black text-ocean-950">{parseInt(pickup.quantity) || 0}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Water Saved</p>
              <p className="text-2xl font-black text-ocean-950">{(parseInt(pickup.quantity) * 2.5).toFixed(0)} L</p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-10 bg-ocean-50 border-t border-ocean-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-sm">
                This document serves as official proof of food redistribution via the FeedNet platform. 
                Thank you for helping us reduce food waste and feed the community.
              </p>
            </div>
            <button 
              onClick={() => window.print()}
              className="no-print bg-ocean-950 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg hover:opacity-90 transition"
            >
              Print Invoice
            </button>
          </div>
        </section>

        <p className="mt-8 text-center text-xs font-bold text-slate-400 uppercase tracking-[.3em] no-print">
          Generated securely by FeedNet Logistics
        </p>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { width: 100% !important; max-width: 100% !important; padding: 0 !important; }
          section { border: none !important; box-shadow: none !important; }
        }
      `}} />
    </div>
  );
};

export default Invoice;
