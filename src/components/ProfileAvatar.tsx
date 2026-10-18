'use client';

import React, { useId } from 'react';

import { RankAvatar } from './RankAvatar';

interface ProfileAvatarProps {
  seed?: number;
  score?: number;
  /** Uploaded avatar URL; falls back to the generated avatar for ``seed``. */
  image?: string | null;
  size?: number;
}

export function ProfileAvatar({ seed = 5, score = 0, image, size = 40 }: ProfileAvatarProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  return <RankAvatar score={score} size={size} uid={uid} avatar={image} avatarSeed={seed} />;
}

