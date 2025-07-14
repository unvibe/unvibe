import { useState } from 'react';
import { Avatar } from '@/lib/ui/avatar';
import { Badge } from '@/lib/ui/badge';
import { Button } from '@/lib/ui/button';
import { TextInput } from '@/lib/ui/input/text';

export interface ProfileCardProps {
  name: string;
  email: string;
  role: string;
  bio: string;
  avatar: string;
}

export function ProfileCard(props: ProfileCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [edit, setEdit] = useState(props);
  const [profile, setProfile] = useState(props);

  function handleSave() {
    setProfile(edit);
    setEditMode(false);
  }
  function handleCancel() {
    setEdit(profile);
    setEditMode(false);
  }

  return (
    <div className='bg-background-1 rounded-3xl shadow-xl p-10 max-w-md w-full flex flex-col items-center animate-fade-in border border-border'>
      {/* Avatar */}
      <Avatar
        src={profile.avatar}
        name={profile.name}
        size={96}
        className='mb-4 shadow-lg'
      />
      {/* User name & badge */}
      <div className='flex items-center gap-3 mb-2'>
        {editMode ? (
          <TextInput
            value={edit.name}
            onChange={(e) => setEdit({ ...edit, name: e.target.value })}
            className='text-center text-2xl font-bold px-2 py-1 rounded-md w-44'
          />
        ) : (
          <h2 className='text-2xl font-bold'>{profile.name}</h2>
        )}
        <Badge color='primary' className='ml-2'>
          {profile.role}
        </Badge>
      </div>
      <div className='text-foreground-2 text-sm mb-4'>
        {editMode ? (
          <TextInput
            value={edit.email}
            onChange={(e) => setEdit({ ...edit, email: e.target.value })}
            className='text-center w-48 px-2 py-1 rounded-md'
          />
        ) : (
          profile.email
        )}
      </div>
      {/* Bio section */}
      <div className='mb-6 w-full'>
        <label className='block text-foreground-2 text-xs mb-1 font-semibold'>
          Bio
        </label>
        {editMode ? (
          <textarea
            value={edit.bio}
            onChange={(e) => setEdit({ ...edit, bio: e.target.value })}
            className='w-full min-h-[68px] rounded-lg border border-border bg-background-2 p-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none'
          />
        ) : (
          <div className='text-foreground-1 text-sm'>{profile.bio}</div>
        )}
      </div>
      {/* Action buttons */}
      <div className='flex gap-4 mt-2'>
        {!editMode ? (
          <Button
            variant='primary'
            onClick={() => {
              setEdit(profile);
              setEditMode(true);
            }}
          >
            Edit Profile
          </Button>
        ) : (
          <>
            <Button variant='success' onClick={handleSave}>
              Save
            </Button>
            <Button onClick={handleCancel} variant='secondary'>
              Cancel
            </Button>
          </>
        )}
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.6s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
