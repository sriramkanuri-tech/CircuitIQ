import { redirect } from 'next/navigation';

export default function CertificateIdPage({ params }: { params: { certificateId: string } }) {
  // Delegate directly to authoritative verification and download view
  redirect(`/verify/${params.certificateId}`);
}
