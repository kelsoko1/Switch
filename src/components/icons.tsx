// src/components/icons.tsx
import { LucideProps } from 'lucide-react';
import dynamic from 'next/dynamic';

export const Icons = {
  // Existing icons
  check: dynamic(() => import('lucide-react').then(mod => mod.Check), { ssr: false }),
  checkCheck: dynamic(() => import('lucide-react').then(mod => mod.CheckCheck), { ssr: false }),
  chevronRight: dynamic(() => import('lucide-react').then(mod => mod.ChevronRight), { ssr: false }),
  file: dynamic(() => import('lucide-react').then(mod => mod.File), { ssr: false }),
  moreVertical: dynamic(() => import('lucide-react').then(mod => mod.MoreVertical), { ssr: false }),
  paperclip: dynamic(() => import('lucide-react').then(mod => mod.Paperclip), { ssr: false }),
  reply: dynamic(() => import('lucide-react').then(mod => mod.Reply), { ssr: false }),
  send: dynamic(() => import('lucide-react').then(mod => mod.Send), { ssr: false }),
  spinner: dynamic(() => import('lucide-react').then(mod => mod.Loader2), { ssr: false }),
  x: dynamic(() => import('lucide-react').then(mod => mod.X), { ssr: false }),
  
  // New icons
  alertCircle: dynamic(() => import('lucide-react').then(mod => mod.AlertCircle), { ssr: false }),
  chevronLeft: dynamic(() => import('lucide-react').then(mod => mod.ChevronLeft), { ssr: false }),
  phone: dynamic(() => import('lucide-react').then(mod => mod.Phone), { ssr: false }),
  video: dynamic(() => import('lucide-react').then(mod => mod.Video), { ssr: false }),
  loader2: dynamic(() => import('lucide-react').then(mod => mod.Loader2), { ssr: false }),
  smile: dynamic(() => import('lucide-react').then(mod => mod.Smile), { ssr: false }),
  smilePlus: dynamic(() => import('lucide-react').then(mod => mod.SmilePlus), { ssr: false }),
  search: dynamic(() => import('lucide-react').then(mod => mod.Search), { ssr: false }),
  searchX: dynamic(() => import('lucide-react').then(mod => mod.SearchX), { ssr: false }),
  edit: dynamic(() => import('lucide-react').then(mod => mod.Edit), { ssr: false }),
  trash2: dynamic(() => import('lucide-react').then(mod => mod.Trash2), { ssr: false }),
};