import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-[#F8F7FF] to-[#F0EDF5]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.jpg"
              alt="Espacio Desafíos"
              className="w-24 h-24 rounded-3xl object-cover shadow-xl"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2A32] mb-2">
            Espacio Desafíos
          </h1>
          <p className="text-sm sm:text-base text-[#6B6570]">
            Sistema de gestión para clínicas terapéuticas
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
