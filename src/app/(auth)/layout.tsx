export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE4E1] via-[#F0F8FF] to-[#E6F3FF] flex flex-col">
      {children}
    </div>
  );
}
