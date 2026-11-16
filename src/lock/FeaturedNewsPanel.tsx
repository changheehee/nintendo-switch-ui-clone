import { FEATURED_NEWS } from './featuredNews.ts';
import type { FeaturedNewsItem, NewsArtwork } from './featuredNews.ts';
import './featuredNewsPanel.css';

type FeaturedNewsPanelProps = {
  readonly hasUnreadNews: boolean;
};

type NewsTileProps = {
  readonly item: FeaturedNewsItem;
  readonly isUnread: boolean;
};

type NewsArtworkViewProps = {
  readonly artwork: NewsArtwork;
};

export function FeaturedNewsPanel({ hasUnreadNews }: FeaturedNewsPanelProps) {
  return (
    <section className="featured-news" aria-label="Featured News">
      <header className="featured-news-header">
        <span className="featured-news-buttons" aria-hidden="true">
          <span className="featured-news-minus" />
          <span className="featured-news-slash" />
          <span className="featured-news-plus" />
        </span>
        <h2 className="featured-news-title">Featured News</h2>
      </header>
      <ol className="featured-news-list">
        {FEATURED_NEWS.map(function showNewsTile(item) {
          return <NewsTile key={item.id} item={item} isUnread={hasUnreadNews} />;
        })}
        <li className="featured-news-tile" data-artwork="empty" aria-hidden="true" />
      </ol>
    </section>
  );
}

function NewsTile({ item, isUnread }: NewsTileProps) {
  return (
    <li className="featured-news-tile" data-artwork={item.artwork.kind}>
      <NewsArtworkView artwork={item.artwork} />
      <p className="featured-news-headline">{item.headline}</p>
      {isUnread && (
        <span className="featured-news-unread">
          <span className="screen-reader-only">읽지 않은 소식입니다.</span>
        </span>
      )}
    </li>
  );
}

function NewsArtworkView({ artwork }: NewsArtworkViewProps) {
  if (artwork.kind === 'picture') {
    return <img className="featured-news-picture" src={artwork.pictureUrl} alt="" draggable={false} />;
  }

  return (
    <span className="shop-banner" aria-hidden="true">
      <span className="shop-banner-name">{artwork.shopName}</span>
      <span className="shop-banner-badge">
        <span className="shop-banner-glyph" style={{ maskImage: `url(${artwork.glyphUrl})` }} />
      </span>
    </span>
  );
}
