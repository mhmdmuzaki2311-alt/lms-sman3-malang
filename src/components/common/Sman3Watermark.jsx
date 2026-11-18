import React from 'react';
import logoSman3 from '../../assets/logo_sman3.png';

export default function Sman3Watermark() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none">
      <img
        src={logoSman3}
        alt="Watermark SMAN 3 Kota Malang"
        className="w-[260px] sm:w-[300px] md:w-[340px] h-auto object-contain opacity-[0.06] pointer-events-none transition-all duration-300"
      />
    </div>
  );
}
