import posthog from 'posthog-js';

/**
 * イベントをPostHogに送信する
 * @param {string} eventName - 記録するイベント名
 * @param {Object} properties - イベントに関連するプロパティ
 * @param {Function} callback - イベント送信後に実行するコールバック関数（オプション）
 */
export const trackEvent = (eventName, properties = {}, callback) => {
  // 開発環境での確認用ログ
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] ${eventName}`, properties);
  }

  // クライアントサイドでのみイベントを送信
  if (typeof window !== 'undefined') {
    try {
      posthog.capture(eventName, properties, callback);
    } catch (error) {
      console.error('[Analytics Error]', error);
    }
  }
};

/**
 * ユーザーをPostHogで識別する
 * @param {string} userId - ユーザーID
 * @param {Object} traits - ユーザーに関連するプロパティ
 */
export const identifyUser = (userId, traits = {}) => {
  if (typeof window !== 'undefined') {
    try {
      posthog.identify(userId, traits);
    } catch (error) {
      console.error('[Analytics Identify Error]', error);
    }
  }
};

/**
 * 現在のユーザーに特性を設定する
 * @param {Object} traits - ユーザーに関連するプロパティ
 */
export const setUserTraits = (traits = {}) => {
  if (typeof window !== 'undefined') {
    try {
      posthog.people.set(traits);
    } catch (error) {
      console.error('[Analytics Set Traits Error]', error);
    }
  }
};

/**
 * ページビューイベントを記録する
 * @param {string} pageName - ページ名
 * @param {Object} properties - 追加のプロパティ
 */
export const trackPageView = (pageName, properties = {}) => {
  trackEvent('pageview', { page: pageName, ...properties });
};
