import { API } from '@/constants';
import { SearchResult } from '@/types';

const sendQuery = async (query: string, variables: object): Promise<any> => {
  const response = await fetch(API.ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`AniList request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`AniList GraphQL error: ${data.errors[0].message}`);
  }

  return data.data;
};

const SEARCH_QUERY = `
  query SearchAnime($search: String!, $page: Int) {
    Page(page: $page, perPage: 25) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        startDate {
          year
        }
        averageScore
        episodes
        duration
        status
      }
    }
  }
`;

const TRENDING_QUERY = `
  query TrendingAnime {
    Page(page: 1, perPage: 20) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        startDate {
          year
        }
        averageScore
        episodes
        duration
        status
      }
    }
  }
`;

const mapToSearchResult = (item: any): SearchResult => ({
  mediaId: `anilist_${item.id}`,
  type: 'anime',
  title: item.title.english ?? item.title.romaji,
  posterUrl: item.coverImage?.large ?? null,
  year: item.startDate?.year ?? null,
  score: item.averageScore ? item.averageScore / 10 : null,
  totalEpisodes: item.episodes ?? null,
  runtimeMins: item.duration ?? null,
});

export const anilist = {
  search: async (query: string): Promise<SearchResult[]> => {
    const data = await sendQuery(SEARCH_QUERY, { search: query, page: 1 });
    return data.Page.media.map(mapToSearchResult);
  },

  getTrending: async (): Promise<SearchResult[]> => {
    const data = await sendQuery(TRENDING_QUERY, {});
    return data.Page.media.map(mapToSearchResult);
  },
};