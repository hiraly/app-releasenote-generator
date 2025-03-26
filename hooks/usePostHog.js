import posthog from 'posthog-js';
import { useEffect, useState } from 'react';

export const usePostHog = () => {
  const [isPostHogInitialized, setIsPostHogInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isPostHogInitialized) {
      // クライアントサイドでのみ実行
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

      if (posthogKey && posthogHost) {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          // 開発環境では自動キャプチャを無効にすることも可能
          capture_pageview: process.env.NODE_ENV === 'production',
          // 本番環境かどうかに基づいて設定を調整
          loaded: (posthog) => {
            if (process.env.NODE_ENV !== 'production') {
              // 開発環境での警告を抑制
              posthog.opt_out_capturing();
            }
          },
        });
        setIsPostHogInitialized(true);
      }
    }
  }, [isPostHogInitialized]);

  return { posthog: typeof window !== 'undefined' ? posthog : null };
};

export default usePostHog;
