import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'トレンド',
      href: getPermalink('trend', 'category'),
    },
    {
      text: '学習メソッド',
      href: getPermalink('method', 'category'),
    },
    {
      text: 'キャリア',
      href: getPermalink('career', 'category'),
    },
    {
      text: 'ウェブアプリ',
      href: getPermalink('app', 'category'),
    },
  ],
  actions: [{ text: 'お問い合わせ', href: getPermalink('/contact') }],
};

export const footerData = {
  links: [
    {
      title: 'コンテンツ',
      links: [
        { text: 'トレンド', href: getPermalink('trend', 'category') },
        { text: '学習メソッド', href: getPermalink('method', 'category') },
        { text: 'キャリア戦略', href: getPermalink('career', 'category') },
        { text: 'ウェブアプリ', href: getPermalink('app', 'category') },
      ],
    },
    {
      title: 'コミュニティ',
      links: [
        { text: 'Syllabus Hackについて', href: getPermalink('/about') },
        { text: 'お問い合わせ', href: getPermalink('/contact') },
      ],
    },
  ],
  secondaryLinks: [
    { text: '利用規約', href: getPermalink('/terms') },
    { text: 'プライバシーポリシー', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/arthelokyo/astrowind' },
  ],
  footNote: `
    &copy; 2026 Syllabus Hack. All rights reserved.
  `,
};
