import React from 'react';
import { Avatar } from './Icons';

export type FrameConfig = {
  minScore: number;
  src: string;
  width: number;
  top: number;
  left: number;
};

// لیست فریم‌ها. بر اساس امتیاز کاربر (minScore) بهترین فریم انتخاب می‌شود
export const AVATAR_FRAMES: FrameConfig[] = [
  { minScore: 0, src: '', width: 0, top: 0, left: 0 }, // بدون فریم برای امتیاز زیر 1000
  { 
    minScore: 1000, 
    src: '/frame.png', // اسم عکس فریم کاربر
    width: 110,        // سایز فریم
    top: -42,          // جبران بالا/پایین
    left: -35          // جبران چپ/راست
  }
];

export function ProfileAvatar({ seed = 5, score = 1500 }: { seed?: number; score?: number }) {
  // فریم مربوطه رو پیدا می‌کنیم (آخرین فریمی که امتیازش از امتیاز کاربر کمتره)
  const frame = [...AVATAR_FRAMES].reverse().find(f => score >= f.minScore);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* عکس خود آواتار */}
      <span className="face">
        <Avatar seed={seed} />
      </span>

      {/* تصویر فریم با تنظیمات اختصاصی خودش */}
      {frame && frame.src && (
        <img 
          src={frame.src}
          alt="Avatar Frame"
          style={{
            position: 'absolute',
            width: `${frame.width}px`,
            height: `${frame.width}px`,
            top: `${frame.top}px`,
            left: `${frame.left}px`,
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
}
