'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import logo from '@/public/icon/logo-vex-ok.svg';
import logoWhite from '@/public/icon/logo-vex-white.svg';
import bestTag from '@/public/icon/Medalion.svg';
import favTag from '@/public/icon/Favorite.svg';
import { getPublicAssetUrl } from '@/lib/utils';
import '@/app/globals.css';

interface LinkAkses {
  link: string;
  title?: string;
  subtitle?: String;
  className?: string;
  children?: React.ReactNode;
}

// LOGO BIRU
export function Logo({ ...props }) {
  return (
    <div>
      <Image src={logo} loading="eager" alt="Logo" width={520} height={120} {...props} />
    </div>
  );
}

// LOGO PUTIH
export function LogoWhite({ ...props }) {
  return (
    <div>
      <Image src={logoWhite} loading="eager" alt="Logo" width={400} height={100} className="size-full " {...props} />
    </div>
  );
}

interface dataCard {
  link: string;
  title: string;
  className?: string;
  img?: string;
  totalLikes?: string;
  totalViews?: string;
  date?: string;
}

// (index)/page.tsx
export function Card({ link, title, className, ...props }: dataCard) {
  return (
    <div className="">
      <Image
        loading="eager"
        src={link}
        alt={title}
        width={100}
        height={100}
        className="object-fill rounded-xl size-full self-start"
        {...props}
      />
    </div>
  );
}

// Card.tsx
export function ProjectCategoryCard({ link, title, className, img, totalLikes, totalViews, date }: dataCard) {
  return (
    <div className="relative group max-w-sm overflow-hidden rounded-2xl shadow-lg border border-gray-100 bg-white">
      {/* Container Gambar */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={img || link}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay Hover */}
        <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-center">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-white text-xl font-bold font-poppins mb-2">{title}</h3>
            <p className="text-blue-100 text-sm font-sans mb-4">Click to explore full exhibition and details.</p>
            <span className="inline-block px-4 py-2 bg-white text-main-blue font-semibold text-xs rounded-full shadow hover:bg-gray-100">
              View Project
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
// export function BestTag({ ...props }) {
//   return <Image src={bestTag} loading="eager" width={100} height={100} alt="Medalion" {...props} />;
// }
// export function FavTag({ ...props }) {
//   return <Image src={favTag} loading="eager" width={100} height={100} alt="fav-icon" {...props} />;
// }

// Navbar.tsx
export function TextNav({ link, title, subtitle, className, ...props }: LinkAkses) {
  return (
    <Link
      href={link || getPublicAssetUrl('/icon/logo-vex.svg')}
      className={`
        group relative text-18 hover:text-main-blue py-4
        flex flex-col items-start lg:items-center
        font-semibold font-poppins
        transition-all ease-in-out duration-200
        ${className || ''}
      `}
      {...props}
    >
      {title}

      <p
        className="
          flex items-center justify-start lg:justify-center
          group-hover:text-main-blue
          font-light font-poppins text-xs opacity-65
        "
      >
        {subtitle || ''}
        <span className="garis"></span>
      </p>
    </Link>
  );
}

// Footer.tsx
export function LinkAkses({ link, title, className, ...props }: LinkAkses) {
  return (
    <Link href={link || getPublicAssetUrl('/icon/logo-vex.svg')} className="hover-text" {...props}>
      {title}
    </Link>
  );
}

// Footer.tsx
export function LinkAksesEks({ link, title, children, className, ...props }: LinkAkses) {
  return (
    <a href={link || getPublicAssetUrl('/icon/logo-vex.svg')} className="hover-text" {...props}>
      {title}
      {children}
    </a>
  );
}

// ini harus menggunakan group di parentnya
export function Tooltip({ children, }: { children: React.ReactNode; }) {
  return (
    <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-main-blue opacity-0 shadow-lg/40 transition-all duration-200 group-hover:-top-12 group-hover:opacity-100">
      {children}
    </div>
  );
}
