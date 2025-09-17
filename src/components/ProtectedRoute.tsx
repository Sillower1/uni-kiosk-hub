import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserSessionAndRole = async () => {
      // 1. Aktif bir oturum var mı diye kontrol et
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        navigate('/admin-login');
        return;
      }

      // 2. Oturum varsa, kullanıcının 'profiles' tablosundaki rolünü kontrol et
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        // Admin değilse veya profil bulunamazsa, oturumu kapat ve login'e yönlendir
        await supabase.auth.signOut();
        navigate('/admin-login');
        return;
      }

      // Her şey yolundaysa, kullanıcıyı set et ve yüklemeyi bitir
      setUser(session.user);
      setLoading(false);
    };

    checkUserSessionAndRole();
  }, [navigate]);

  // Oturum kontrol edilirken bir yükleme ekranı göster
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  // Eğer kullanıcı varsa (yani yönlendirme olmadıysa), asıl sayfa içeriğini göster
  if (user) {
    return <>{children}</>;
  }

  // Kullanıcı yoksa hiçbir şey gösterme (zaten yönlendirme yapılıyor)
  return null;
};

export default ProtectedRoute;