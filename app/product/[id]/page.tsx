'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faTrash, faBox, faExclamationCircle, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// 製品データの型定義
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    // トークンがない場合はログインページにリダイレクト
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 製品詳細を取得
    fetchProductDetail(token, id);
  }, [id, router]);

  // 製品詳細を取得する関数
  const fetchProductDetail = async (token: string, productId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:80/api/product/${productId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('製品情報の取得に失敗しました');
      }

      const data = await response.json();
      
      // データをProduct型に変換
      if (data && typeof data === 'object') {
        setProduct({
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } else {
        throw new Error('無効な製品データです');
      }
    } catch (err: any) {
      setError(err.message || '製品情報の取得に失敗しました');
      console.error('製品情報の取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 価格をフォーマットする関数
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price);
  };

  // 削除確認ダイアログを表示
  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  // 削除確認をキャンセル
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // 削除アクション
  const handleDelete = async () => {
    if (!product) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('トークンがありません');
      }

      const response = await fetch(`http://localhost:80/api/product/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('製品削除に失敗しました');
      }

      // 削除後、製品一覧ページに戻る
      router.push('/product');
    } catch (err: any) {
      setError(err.message || '製品削除に失敗しました');
      console.error('製品削除エラー:', err);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            <FontAwesomeIcon icon={faBox} className="mr-2" />製品詳細
          </h1>
          <Link
            href="/product"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />製品一覧に戻る
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center">
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />{error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600 flex items-center">
              <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />読み込み中...
            </p>
          </div>
        ) : product ? (
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">製品情報</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">価格:</span>
                      <span className="text-xl font-bold text-indigo-600">{formatPrice(product.price)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">在庫状況:</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock > 0 ? `${product.stock}個` : '在庫なし'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">登録情報</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">製品ID:</span>
                      <span className="text-gray-600">{product.id}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">登録日:</span>
                      <span className="text-gray-600">{formatDate(product.created_at)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">最終更新日:</span>
                      <span className="text-gray-600">{formatDate(product.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-8">
                <Link
                  href={`/product/${product.id}/edit`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded inline-flex items-center"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" /> 編集
                </Link>
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded inline-flex items-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" /> 削除
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg mb-6 border border-gray-300 shadow-sm">
            <p className="text-gray-700 text-center">製品が見つかりませんでした。</p>
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/5 backdrop-filter backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg border border-gray-200">
            <div className="flex items-center text-red-600 mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl mr-2" />
              <h3 className="text-xl font-bold">削除の確認</h3>
            </div>
            <p className="text-gray-700 mb-6">
              {product?.name} を削除してもよろしいですか？この操作は取り消せません。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
