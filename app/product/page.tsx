'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faArrowLeft, faBox, faExclamationCircle, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

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

export default function Product() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // トークンがない場合はログインページにリダイレクト
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 製品一覧を取得
    fetchProducts(token);
  }, [router]);

  // 製品一覧を取得する関数
  const fetchProducts = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:80/api/product', {
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
      console.log('API response:', data); // レスポンスの形式を確認
      
      // データをProduct型に変換する関数
      const validateProduct = (item: any): Product | null => {
        if (!item || typeof item !== 'object') return null;
        
        // 必要なプロパティが存在するか確認
        if (typeof item.id !== 'number' ||
            typeof item.name !== 'string' ||
            typeof item.description !== 'string' ||
            typeof item.price !== 'number' ||
            typeof item.stock !== 'number' ||
            typeof item.created_at !== 'string' ||
            typeof item.updated_at !== 'string') {
          console.warn('無効な製品データ:', item);
          return null;
        }
        
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          stock: item.stock,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      };
      
      // 配列を処理する関数
      const processArray = (arr: any[]): Product[] => {
        const validProducts: Product[] = [];
        for (const item of arr) {
          const product = validateProduct(item);
          if (product) validProducts.push(product);
        }
        return validProducts;
      };
      
      // データが配列かどうかを確認
      if (Array.isArray(data)) {
        const validProducts = processArray(data);
        setProducts(validProducts);
        if (validProducts.length === 0 && data.length > 0) {
          setError('有効な製品データがありません');
        }
      } else {
        console.error('不明な形式のデータ:', data);
        setError('データ形式が不正です');
        setProducts([]);
      }
    } catch (err: any) {
      setError(err.message || '製品情報の取得に失敗しました');
      console.error('製品情報の取得エラー:', err);
      setProducts([]); // エラー時に空の配列をセット
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
  const confirmDelete = (id: number) => {
    setDeleteConfirm(id);
  };

  // 削除確認をキャンセル
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // 削除アクション
  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('トークンがありません');
      }

      const response = await fetch(`http://localhost:80/api/product/${id}`, {
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

      // 削除後、製品一覧を再取得
      fetchProducts(token);
    } catch (err: any) {
      setError(err.message || '製品削除に失敗しました');
      console.error('製品削除エラー:', err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900"><FontAwesomeIcon icon={faBox} className="mr-2" />製品一覧</h1>
          <Link
            href="/dashboard"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded flex items-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />ダッシュボードに戻る
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
        ) : products.length === 0 ? (
          <div className="bg-white p-6 rounded-lg mb-6 border border-gray-300 shadow-sm">
            <p className="text-gray-700 text-center">製品が見つかりませんでした。</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">製品名</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">説明</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">価格</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">在庫数</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">登録日</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">更新日</th>
                  <th className="py-3 px-4 text-left text-gray-700 font-semibold border-b">アクション</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b text-gray-800">{product.name}</td>
                    <td className="py-3 px-4 border-b text-gray-600">
                      {product.description.length > 100 
                        ? `${product.description.substring(0, 100)}...` 
                        : product.description}
                    </td>
                    <td className="py-3 px-4 border-b text-gray-800">{formatPrice(product.price)}</td>
                    <td className="py-3 px-4 border-b text-gray-800">
                      <span className={`px-2 py-1 rounded-full text-xs ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock > 0 ? `${product.stock}個` : '在庫なし'}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b text-gray-600">{formatDate(product.created_at)}</td>
                    <td className="py-3 px-4 border-b text-gray-600">{formatDate(product.updated_at)}</td>
                    <td className="py-3 px-4 border-b text-gray-600">
                      <Link
                        href={`/product/${product.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded inline-flex items-center mr-2"
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-1" /> 詳細
                      </Link>
                      <Link
                        href={`/product/${product.id}/edit`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded inline-flex items-center mr-2"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1" /> 編集
                      </Link>
                      <button
                        onClick={() => confirmDelete(product.id)}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded inline-flex items-center cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" /> 削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/5 backdrop-filter backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg border border-gray-200">
            <div className="flex items-center text-red-600 mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl mr-2" />
              <h3 className="text-xl font-bold">削除の確認</h3>
            </div>
            <p className="text-gray-700 mb-6">
              この製品を削除してもよろしいですか？この操作は取り消せません。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
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
