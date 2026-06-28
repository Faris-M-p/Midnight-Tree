import React from 'react';
import { X, MapPin, Calendar, Briefcase, GraduationCap, MessageSquare } from 'lucide-react';
import type { FamilyMember } from '../types';

interface ProfileModalProps {
  member: FamilyMember | null;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  // Set colors based on relationship (matching MemberCard styles)
  const getBadgeStyles = (relation: string) => {
    switch (relation.toLowerCase()) {
      case 'me':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'father':
      case 'mother':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'grandfather':
      case 'grandmother':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'brother':
      case 'sister-in-law':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'uncle':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  const handleWhatsAppMessage = () => {
    const message = encodeURIComponent(`Hello ${member.name}! Thinking of you. Let's catch up soon!`);
    // Open a mock WhatsApp link (no real number attached for privacy, opens desktop or web client)
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Cover Banner */}
        <div className="h-32 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-slate-400 hover:text-slate-100 transition-colors border border-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Info Overlay Row */}
        <div className="px-6 pb-6 relative flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-slate-900 overflow-hidden shadow-xl bg-slate-800 shrink-0">
              <img 
                src={member.avatar} 
                alt={member.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
                  {member.name}
                </h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${getBadgeStyles(member.relation)}`}>
                  {member.relation}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar size={14} className="text-emerald-500" />
                  Born: {new Date(member.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-emerald-500" />
                  {member.location}
                </span>
              </p>
            </div>
          </div>

          <hr className="border-slate-800 my-6" />

          {/* Grid Layout for details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Bio & Core Info */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Biography</h4>
                <p className="text-slate-300 text-sm leading-relaxed font-light">
                  {member.bio}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Education</h4>
                <div className="flex gap-2.5 items-start">
                  <GraduationCap className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-slate-300 text-sm">
                    {member.education}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Career History</h4>
                <div className="flex gap-2.5 items-start">
                  <Briefcase className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-slate-300 text-sm">
                    {member.career}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Photo Gallery */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Family Memories</h4>
              {member.photos && member.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {member.photos.map((photo, idx) => (
                    <div 
                      key={idx} 
                      className="aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-800 group cursor-pointer hover:border-emerald-500/40 transition-colors"
                    >
                      <img 
                        src={photo} 
                        alt={`${member.name} memory ${idx + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
                  No memories uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions (WhatsApp Contact) */}
        <div className="p-4 bg-slate-950 border-t border-slate-850 flex justify-end">
          <button
            onClick={handleWhatsAppMessage}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 font-medium rounded-xl shadow-lg shadow-emerald-950/20 transition-colors duration-200 cursor-pointer"
          >
            <MessageSquare size={18} className="fill-slate-950" />
            <span>Message on WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
