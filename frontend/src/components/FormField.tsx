'use client';

type Props = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

const FormField = ({ label, error, children }: Props) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-600">{label}</label>
    {children}
    {error && <span className="text-xs text-red-600">{error}</span>}
  </div>
);

export default FormField;
