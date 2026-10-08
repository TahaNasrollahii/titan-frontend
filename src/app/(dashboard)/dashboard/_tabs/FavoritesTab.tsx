'use client';

import Link from 'next/link';
import React from 'react';

import { Icon } from '@/components/Icons';
import { Loading } from '@/components/ui/State';
import { useAppContext } from '@/context/AppContext';
import { errorMessage } from '@/lib/api/client';
import { catalogApi } from '@/lib/api/endpoints';
import { productPrice } from '@/lib/format';
import { useApi } from '@/lib/hooks/useApi';

import styles from '../page.module.css';

export function FavoritesTab() {
  const { addToast } = useAppContext();
  const wishlist = useApi(catalogApi.wishlist);

  const remove = async (slug: string) => {
    try {
      await catalogApi.removeFromWishlist(slug);
      wishlist.setData(current => current && { ...current, results: current.results.filter(i => i.product.slug !== slug) });
    } catch (error) {
      addToast({ title: 'علاقه‌مندی‌ها', text: errorMessage(error), icon: 'heart', tone: 'error' });
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>لیست علاقه‌مندی‌ها</h3>
      </div>
      {wishlist.loading && <Loading />}
      {wishlist.data?.results.length === 0 && (
        <div className={styles.emptyState}>
          <Icon name="heart" />
          <p>لیست علاقه‌مندی‌های شما خالی است.</p>
          <Link href="/store" className={styles.btnPrimary}>
            مشاهده فروشگاه
          </Link>
        </div>
      )}
      {wishlist.data?.results.map(({ product }) => (
        <div key={product.slug} className={styles.listItem}>
          <Link
            href={`/product/${product.slug}`}
            className={styles.listItemInfo}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className={styles.itemThumb}>
              {product.image ? <img src={product.image} alt="" /> : <Icon name="gift" />}
            </div>
            <div className={styles.itemDetails}>
              <h4>{product.title}</h4>
              <p>
                {productPrice(product)}
                {!product.inStock && ' • ناموجود'}
              </p>
            </div>
          </Link>
          <button
            className={`${styles.btnSecondary} ${styles.dangerBtn}`}
            style={{ padding: '6px 12px' }}
            onClick={() => remove(product.slug)}
          >
            حذف
          </button>
        </div>
      ))}
    </div>
  );
}
