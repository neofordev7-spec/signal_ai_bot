'use client';

import SubmitForm from '@/components/SubmitForm';

export default function SubmitPage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-tg-text">
          Muammo yuborish
        </h1>
        <p className="text-sm text-tg-hint">
          Shahardagi muammoni tavsiflang, AI uni tahlil qiladi
        </p>
      </div>
      <SubmitForm />
    </div>
  );
}
