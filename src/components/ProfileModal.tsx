import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Briefcase, GraduationCap, Mail, Edit, Trash2, Save, RotateCcw } from 'lucide-react';
import type { FamilyMember } from '../types';

interface ProfileModalProps {
  member: FamilyMember | null;
  displayId?: string;
  onClose: () => void;
  onUpdate: (id: string, updatedData: Partial<FamilyMember>) => void;
  onDelete: (id: string) => void;
}

/* ─── Inline SVG social brand icons ─── */
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

export const ProfileModal: React.FC<ProfileModalProps> = ({
  member,
  displayId,
  onClose,
  onUpdate,
  onDelete
}) => {
  if (!member) return null;

  // Editing state
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<FamilyMember['relation']>('Me');
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('');
  const [profession, setProfession] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [education, setEducation] = useState('');
  const [career, setCareer] = useState('');
  const [isDeceased, setIsDeceased] = useState(false);

  // Socials
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [gmail, setGmail] = useState('');

  // Sync form states with selected member
  useEffect(() => {
    if (member) {
      setName(member.name);
      setRelation(member.relation);
      setDob(member.dob);
      setLocation(member.location);
      setProfession(member.profession);
      setAvatar(member.avatar);
      setBio(member.bio);
      setEducation(member.education);
      setCareer(member.career);
      setIsDeceased(!!member.isDeceased);

      setInstagram(member.socials?.instagram || '');
      setFacebook(member.socials?.facebook || '');
      setWhatsapp(member.socials?.whatsapp || '');
      setGmail(member.socials?.gmail || '');
      
      setIsEditing(false); // Reset editing mode when swapping profiles
    }
  }, [member]);

  const handleDeleteClick = () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${member.name} from the family tree? This cannot be undone.`
    );
    if (confirmDelete) {
      onDelete(member.id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdate(member.id, {
      name,
      relation,
      dob,
      location,
      profession,
      avatar,
      bio,
      education,
      career,
      isDeceased,
      socials: {
        instagram: instagram.trim() || undefined,
        facebook: facebook.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        gmail: gmail.trim() || undefined
      }
    });

    setIsEditing(false);
  };

  const getBadgeStyles = (rel: string) => {
    switch (rel.toLowerCase()) {
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
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner with CRUD Controls */}
        <div className="h-28 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 relative shrink-0 flex items-start justify-between p-4">
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-950/90 text-slate-300 hover:text-white border border-slate-800/80 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Edit size={12} />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/90 text-red-400 hover:text-red-100 border border-red-900/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-slate-400 hover:text-slate-100 transition-colors border border-slate-800 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        {isEditing ? (
          /* EDITING FORM MODE */
          <form onSubmit={handleSave} className="px-6 py-6 overflow-y-auto flex-1 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-slate-100">Edit {member.name}'s Details</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Save size={12} />
                  Save Changes
                </button>
              </div>
            </div>

            <hr className="border-slate-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Relationship Role</label>
                <select
                  value={relation}
                  onChange={e => setRelation(e.target.value as FamilyMember['relation'])}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Grandfather">Grandfather</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister-in-Law">Sister-in-Law</option>
                  <option value="Me">Me</option>
                  <option value="Nephew">Nephew</option>
                  <option value="Niece">Niece</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Profession</label>
                <input
                  type="text"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Avatar URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Biography</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Education</label>
                <input
                  type="text"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Career Timeline</label>
                <input
                  type="text"
                  value={career}
                  onChange={e => setCareer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isDeceasedEdit"
                checked={isDeceased}
                onChange={e => setIsDeceased(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-emerald-500"
              />
              <label htmlFor="isDeceasedEdit" className="text-xs font-semibold text-slate-400 cursor-pointer">
                Mark as Deceased
              </label>
            </div>

            <hr className="border-slate-800" />

            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Social Links</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Instagram</label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Facebook</label>
                  <input
                    type="url"
                    value={facebook}
                    onChange={e => setFacebook(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email / Gmail</label>
                  <input
                    type="email"
                    value={gmail}
                    onChange={e => setGmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm"
                  />
                </div>
              </div>
            </div>
          </form>
        ) : (
          /* READ-ONLY DETAIL MODE */
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
                  {displayId && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold tracking-wider shrink-0">
                      {displayId}
                    </span>
                  )}
                  <h2 className="font-serif text-2xl font-bold text-slate-100 leading-tight">
                    {member.name}
                  </h2>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${getBadgeStyles(member.relation)}`}>
                    {member.relation}
                  </span>
                  {member.isDeceased && (
                    <span
                      className="flex items-center gap-1.5 text-[10px] text-red-400 font-semibold"
                      title="Deceased"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500 border border-red-400 animate-pulse inline-block" />
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
              
              {/* LEFT COLUMN: Biography, Education, Career */}
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

              {/* RIGHT COLUMN: Social Media, Memories */}
              <div className="space-y-5">
                <section>
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2.5">
                    Social Media
                  </h4>

                  {hasSocials ? (
                    <div className="grid grid-cols-2 gap-2">
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
        )}

      </div>
    </div>
  );
};
