'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:80/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('認証に失敗しました');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err: any) {
        setError(err.message || 'ユーザー情報の取得に失敗しました');
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetch('http://localhost:80/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          credentials: 'include',
        });
      }
      
      localStorage.removeItem('token');
      router.push('/login');
    } catch (err) {
      console.error('ログアウトに失敗しました', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            ログアウト
          </button>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        ) : null}

        {user && (
          <div className="bg-white p-6 rounded-lg mb-6 border border-gray-300 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">ユーザー情報</h2>
            <div className="space-y-3">
              <p className="mb-2 text-gray-800"><span className="font-bold text-gray-900 inline-block w-20">ID:</span> {user.id}</p>
              <p className="mb-2 text-gray-800"><span className="font-bold text-gray-900 inline-block w-20">名前:</span> {user.name}</p>
              <p className="text-gray-800"><span className="font-bold text-gray-900 inline-block w-20">メール:</span> {user.email}</p>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <div>
            <Link 
              href="/product"
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded inline-block"
            >
              製品ページへ
            </Link>
          </div>
          <div>
            <Link 
              href="/"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
