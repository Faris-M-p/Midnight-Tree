import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { FamilyMember, MarriageUnion } from '../types';

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Omit<FamilyMember, 'id'>, placement: MemberPlacement) => void;
  members: FamilyMember[];
  unions: MarriageUnion[];
  memberRanks?: { [id: string]: number };
}

export interface MemberPlacement {
  type: 'root' | 'child' | 'spouse';
  targetId: string; // unionId for 'child', spouse memberId for 'spouse'
}

export const CreateMemberModal: React.FC<CreateMemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  unions,
  memberRanks
}) => {
  if (!isOpen) return null;

  // Form states
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<FamilyMember['relation']>('Me');
  const [gender, setGender] = useState<'male' | 'female'>('male');
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

  // Placement states
  const [placementType, setPlacementType] = useState<'root' | 'child' | 'spouse'>('root');
  const [placementTarget, setPlacementTarget] = useState('');

  // Helper: Find potential single members who can marry
  const singleMembers = members.filter(m => {
    // A member is single if they are not spouse1 or spouse2 in any union
    return !unions.some(u => u.spouse1Id === m.id || u.spouse2Id === m.id);
  });

  const getUnionName = (u: MarriageUnion) => {
    const s1 = members.find(m => m.id === u.spouse1Id);
    const s2 = members.find(m => m.id === u.spouse2Id);
    const id1 = memberRanks && s1 ? `#${memberRanks[s1.id]} ` : '';
    const id2 = memberRanks && s2 ? `#${memberRanks[s2.id]} ` : '';
    return `${id1}${s1?.name || u.spouse1Id} & ${id2}${s2?.name || u.spouse2Id}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Use default avatar if empty
    const finalAvatar = avatar.trim() || `https://images.unsplash.com/photo-${gender === 'male' ? '1500648767791-00dcc994a43e' : '1494790108377-be9c29b29330'}?w=150&h=150&fit=crop&crop=faces&q=80`;

    const memberData: Omit<FamilyMember, 'id'> = {
      name,
      relation,
      gender,
      dob: dob || new Date().toISOString().split('T')[0],
      location: location || 'Unknown',
      profession: profession || 'Unknown',
      avatar: finalAvatar,
      bio: bio || `${name} is a member of the Mehta family.`,
      education: education || 'Not Specified',
      career: career || 'Not Specified',
      photos: [],
      isDeceased,
      socials: {
        instagram: instagram.trim() || undefined,
        facebook: facebook.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        gmail: gmail.trim() || undefined
      }
    };

    onSave(memberData, {
      type: placementType,
      targetId: placementTarget
    });

    // Reset form
    setName('');
    setAvatar('');
    setBio('');
    setInstagram('');
    setFacebook('');
    setWhatsapp('');
    setGmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <h3 className="text-lg font-serif font-semibold text-slate-100">Add New Family Member</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Biographical Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rohan Mehta"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Relationship Role *</label>
                <select
                  value={relation}
                  onChange={e => setRelation(e.target.value as FamilyMember['relation'])}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
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
                <label className="block text-xs font-semibold text-slate-400 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as 'male' | 'female')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Current Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Profession / Status</label>
                <input
                  type="text"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/... (optional)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Brief Biography</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                placeholder="Describe personality, achievements, role in the family..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Education Details</label>
                <input
                  type="text"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  placeholder="e.g. B.Tech NIT Trichy"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Career Timeline</label>
                <input
                  type="text"
                  value={career}
                  onChange={e => setCareer(e.target.value)}
                  placeholder="e.g. Senior Architect at Google"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isDeceased"
                checked={isDeceased}
                onChange={e => setIsDeceased(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
              />
              <label htmlFor="isDeceased" className="text-xs font-semibold text-slate-400 cursor-pointer">
                Mark as Deceased (will display status as Died & grayscale photo)
              </label>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section 2: Social Media */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Social Media Connections</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Instagram Profile URL</label>
                <input
                  type="url"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/profile"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Facebook Profile URL</label>
                <input
                  type="url"
                  value={facebook}
                  onChange={e => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/profile"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">WhatsApp Mobile Number</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="e.g. 9876543210 (10 digits)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email / Gmail Address</label>
                <input
                  type="email"
                  value={gmail}
                  onChange={e => setGmail(e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section 3: Tree Placement */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Family Tree Placement</h4>
            
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="placement"
                    checked={placementType === 'root'}
                    onChange={() => {
                      setPlacementType('root');
                      setPlacementTarget('');
                    }}
                    className="text-emerald-500"
                  />
                  New Root Block
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="placement"
                    checked={placementType === 'child'}
                    onChange={() => {
                      setPlacementType('child');
                      setPlacementTarget(unions[0]?.id || '');
                    }}
                    className="text-emerald-500"
                  />
                  Child of Union
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="placement"
                    checked={placementType === 'spouse'}
                    onChange={() => {
                      setPlacementType('spouse');
                      setPlacementTarget(singleMembers[0]?.id || '');
                    }}
                    className="text-emerald-500"
                  />
                  Spouse of Member
                </label>
              </div>

              {/* Targets select */}
              {placementType === 'child' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Parent Union</label>
                  <select
                    value={placementTarget}
                    onChange={e => setPlacementTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {unions.map(u => (
                      <option key={u.id} value={u.id}>{getUnionName(u)}</option>
                    ))}
                  </select>
                </div>
              )}

              {placementType === 'spouse' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Spouse to Marry</label>
                  {singleMembers.length > 0 ? (
                    <select
                      value={placementTarget}
                      onChange={e => setPlacementTarget(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      {singleMembers.map(m => (
                        <option key={m.id} value={m.id}>
                          {memberRanks ? `#${memberRanks[m.id]} ` : ''}{m.name} ({m.relation})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-amber-500 font-semibold bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      No single members are currently available to marry. Everyone in the tree is already in a marriage.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={placementType === 'spouse' && singleMembers.length === 0}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-950 cursor-pointer"
            >
              Save Member
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
