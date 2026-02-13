export default async function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` 
    : 'NOT SET';
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Info</h1>
      <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify({
          supabaseUrl,
          supabaseKey,
          nodeEnv: process.env.NODE_ENV,
        }, null, 2)}
      </pre>
      <p>
        <a href="/login" style={{ color: 'blue' }}>Go to Login</a>
      </p>
    </div>
  );
}
