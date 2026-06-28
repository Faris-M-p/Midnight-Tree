import React from 'react';
import { X, MapPin, Calendar, Briefcase, GraduationCap, Mail } from 'lucide-react';
import type { FamilyMember } from '../types';

interface ProfileModalProps {
  member: FamilyMember | null;
  onClose: () => void;
}

/* ─── Inline SVG social brand icons (lucide-react has none) ─── */
const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

export const ProfileModal: React.FC<ProfileModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  const getBadgeStyles = (relation: string) => {
    switch (relation.toLowerCase()) {
      case 'me':            return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'father':
      case 'mother':        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'grandfather':
      case 'grandmother':   return 'bg-amber-500/10  text-amber-400  border border-amber-500/30';
      case 'brother':
      case 'sister-in-law': return 'bg-blue-500/10   text-blue-400   border border-blue-500/30';
      case 'uncle':         return 'bg-cyan-500/10   text-cyan-400   border border-cyan-500/30';
      default:              return 'bg-slate-500/10  text-slate-400  border border-slate-500/30';
    }
  };

  const hasSocials = member.socials && Object.values(member.socials).some(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">

        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-slate-400 hover:text-slate-100 transition-colors border border-slate-800 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 pb-8 overflow-y-auto flex-1">

          {/* Avatar + Name row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-5">
            <div className="w-28 h-28 rounded-full border-4 border-slate-900 overflow-hidden shadow-xl bg-slate-800 shrink-0">
              <img
                src={member.avatar}
                alt={member.name}
                className={`w-full h-full object-cover ${member.isDeceased ? 'grayscale' : ''}`}
              />
            </div>

            <div className="pb-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif text-2xl font-bold text-slate-100 leading-tight">
                  {member.name}
                </h2>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${getBadgeStyles(member.relation)}`}>
                  {member.relation}
                </span>
                {member.isDeceased && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-500">
                    Deceased
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs flex flex-wrap gap-4">
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-emerald-500" />
                  Born: {new Date(member.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-500" />
                  {member.location}
                </span>
              </p>
            </div>
          </div>

          <hr className="border-slate-800 mb-5" />

          {/* Main two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── LEFT: Bio / Education / Career ── */}
            <div className="space-y-5">
              <section>
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">Biography</h4>
                <p className="text-slate-300 text-sm leading-relaxed font-light">{member.bio}</p>
              </section>

              <section>
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">Education</h4>
                <div className="flex gap-2 items-start">
                  <GraduationCap className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <p className="text-slate-300 text-sm">{member.education}</p>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">Career History</h4>
                <div className="flex gap-2 items-start">
                  <Briefcase className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <p className="text-slate-300 text-sm">{member.career}</p>
                </div>
              </section>
            </div>

            {/* ── RIGHT: Socials + Photos ── */}
            <div className="space-y-5">

              {/* Social Media Section */}
              <section>
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2.5">
                  Social Media
                </h4>

                {hasSocials ? (
                  <div className="grid grid-cols-2 gap-2">

                    {/* Instagram */}
                    {member.socials?.instagram && (
                      <a
                        href={member.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-pink-500/20 bg-gradient-to-br from-purple-600/10 to-pink-600/10 hover:from-purple-600/25 hover:to-pink-600/25 text-pink-400 text-xs font-semibold transition-all duration-200 cursor-pointer"
                      >
                        <InstagramIcon />
                        <span>Instagram</span>
                      </a>
                    )}

                    {/* Facebook */}
                    {member.socials?.facebook && (
                      <a
                        href={member.socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-blue-500/20 bg-blue-600/10 hover:bg-blue-600/25 text-blue-400 text-xs font-semibold transition-all duration-200 cursor-pointer"
                      >
                        <FacebookIcon />
                        <span>Facebook</span>
                      </a>
                    )}

                    {/* WhatsApp */}
                    {member.socials?.whatsapp && (
                      <a
                        href={`https://wa.me/91${member.socials.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-600/10 hover:bg-emerald-600/25 text-emerald-400 text-xs font-semibold transition-all duration-200 cursor-pointer"
                      >
                        <WhatsAppIcon />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {/* Gmail / Email */}
                    {member.socials?.gmail && (
                      <a
                        href={`mailto:${member.socials.gmail}`}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-600/10 hover:bg-red-600/25 text-red-400 text-xs font-semibold transition-all duration-200 cursor-pointer"
                      >
                        <Mail size={14} />
                        <span>Email</span>
                      </a>
                    )}

                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center text-slate-500 text-xs">
                    No social links added yet.
                  </div>
                )}
              </section>

              {/* Family Memories Gallery */}
              <section>
                <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Family Memories</h4>
                {member.photos?.length ? (
                  <div className="grid grid-cols-2 gap-2">
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
                  <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs">
                    No memories uploaded yet.
                  </div>
                )}
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
