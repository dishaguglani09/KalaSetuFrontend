import dynamic from 'next/dynamic';

const IndiaMap = dynamic(() => import('@/components/landing/IndiaMap'), { ssr: false });

export default function LandingPage() {
  return <IndiaMap />;
}
