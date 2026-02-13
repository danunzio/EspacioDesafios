import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido a Espacio Desafíos
          </h1>
          <p className="text-gray-600">
            Plataforma de gestión para profesionales de psicomotricidad
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
