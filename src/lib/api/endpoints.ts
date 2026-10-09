import { api } from './client';
import type {
  Announcement,
  BracketRound,
  Cart,
  CheckoutResponse,
  ContactChannel,
  Dashboard,
  FriendRequest,
  Game,
  GameAccount,
  Home,
  LoginResponse,
  Me,
  MyTeam,
  MyTournament,
  Notification,
  OtpRequestResponse,
  Order,
  Paginated,
  Participant,
  Payment,
  PaymentMethod,
  PaymentStart,
  PlatformStats,
  PlayerLeaderboardRow,
  PresenceUser,
  Product,
  ProductSummary,
  Promo,
  RankTier,
  RegistrationResult,
  Review,
  SearchResults,
  StatsTotals,
  Team,
  TeamInvitation,
  TeamLeaderboardRow,
  TeamSummary,
  Tournament,
  TournamentStatus,
  TournamentSummary,
  Wallet,
  WalletTransaction,
  WishlistItem,
} from './types';

export const authApi = {
  requestOtp: (phone: string) =>
    api<OtpRequestResponse>('auth/otp/request/', { method: 'POST', body: { phone }, auth: false }),
  verifyOtp: (phone: string, code: string) =>
    api<LoginResponse>('auth/otp/verify/', { method: 'POST', body: { phone, code }, auth: false }),
  logout: (refresh: string) => api<void>('auth/logout/', { method: 'POST', body: { refresh } }),
};

let dashboardInFlight: Promise<Dashboard> | null = null;

export const meApi = {
  get: () => api<Me>('me/'),
  update: (data: Partial<Pick<Me, 'fullName' | 'email' | 'username' | 'favoriteGame' | 'avatarSeed'>>) =>
    api<Me>('me/', { method: 'PATCH', body: data }),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api<Me>('me/avatar/', { method: 'POST', body: form });
  },
  heartbeat: (status: 'online' | 'away' | 'in_game', game?: string | null) =>
    api<void>('me/heartbeat/', { method: 'POST', body: { status, game } }),
  // The phone dashboard hub and the overview tab mount together: they share one in-flight request.
  dashboard: () =>
    (dashboardInFlight ??= api<Dashboard>('me/dashboard/').finally(() => {
      dashboardInFlight = null;
    })),
  stats: () => api<StatsTotals>('me/stats/'),
  tournaments: () => api<Paginated<MyTournament>>('me/tournaments/', { query: { page_size: 50 } }),
  teams: () => api<MyTeam[]>('me/teams/'),
  teamInvitations: () => api<TeamInvitation[]>('me/team-invitations/'),
  acceptTeamInvitation: (id: number) => api<Team>(`me/team-invitations/${id}/accept/`, { method: 'POST' }),
  declineTeamInvitation: (id: number) =>
    api<TeamInvitation>(`me/team-invitations/${id}/decline/`, { method: 'POST' }),
  friends: () => api<PresenceUser[]>('me/friends/'),
  friendRequests: () => api<FriendRequest[]>('me/friend-requests/'),
  acceptFriend: (id: number) => api<FriendRequest>(`me/friend-requests/${id}/accept/`, { method: 'POST' }),
  declineFriend: (id: number) => api<FriendRequest>(`me/friend-requests/${id}/decline/`, { method: 'POST' }),
};

export const gameAccountsApi = {
  list: () => api<GameAccount[]>('me/game-accounts/'),
  create: (data: { title: string; username: string; password: string; game?: string | null }) =>
    api<GameAccount>('me/game-accounts/', { method: 'POST', body: data }),
  update: (id: number, data: { title?: string; username?: string; password?: string }) =>
    api<GameAccount>(`me/game-accounts/${id}/`, { method: 'PATCH', body: data }),
  remove: (id: number) => api<void>(`me/game-accounts/${id}/`, { method: 'DELETE' }),
};

export interface ProductQuery {
  game?: string;
  category?: string;
  platform?: string;
  price_min?: number;
  price_max?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export const catalogApi = {
  games: (query: { is_featured?: boolean } = {}) => api<Game[]>('games/', { query }),
  products: (query: ProductQuery = {}) => api<Paginated<ProductSummary>>('products/', { query: { ...query } }),
  product: (slug: string) => api<Product>(`products/${slug}/`),
  related: (slug: string) => api<ProductSummary[]>(`products/${slug}/related/`),
  reviews: (slug: string) => api<Paginated<Review>>(`products/${slug}/reviews/`, { query: { page_size: 50 } }),
  submitReview: (
    slug: string,
    review: { rating: number; comment: string; authorName: string; authorEmail: string },
  ) => api<Review>(`products/${slug}/reviews/`, { method: 'POST', body: review }),
  wishlist: () => api<Paginated<WishlistItem>>('me/wishlist/', { query: { page_size: 100 } }),
  addToWishlist: (slug: string) => api<WishlistItem>('me/wishlist/', { method: 'POST', body: { product: slug } }),
  removeFromWishlist: (slug: string) => api<void>(`me/wishlist/${slug}/`, { method: 'DELETE' }),
};

export interface CartLine {
  product: string;
  variant?: number | null;
  quantity: number;
}

export const cartApi = {
  get: () => api<Cart>('cart/'),
  add: (line: CartLine) => api<Cart>('cart/items/', { method: 'POST', body: line }),
  update: (itemId: number, quantity: number) =>
    api<Cart>(`cart/items/${itemId}/`, { method: 'PATCH', body: { quantity } }),
  remove: (itemId: number) => api<Cart>(`cart/items/${itemId}/`, { method: 'DELETE' }),
  clear: () => api<Cart>('cart/', { method: 'DELETE' }),
  merge: (items: CartLine[]) =>
    api<{ cart: Cart; skipped: { product: string; reason: string }[] }>('cart/merge/', {
      method: 'POST',
      body: { items },
    }),
};

export const ordersApi = {
  checkout: (paymentMethod: PaymentMethod, gameAccount?: number | null) =>
    api<CheckoutResponse>('orders/checkout/', { method: 'POST', body: { paymentMethod, gameAccount } }),
  list: () => api<Paginated<Order>>('me/orders/', { query: { page_size: 50 } }),
  get: (number: string) => api<Order>(`me/orders/${number}/`),
  cancel: (number: string) => api<Order>(`me/orders/${number}/cancel/`, { method: 'POST' }),
};

export const walletApi = {
  get: () => api<Wallet>('wallet/'),
  transactions: () => api<Paginated<WalletTransaction>>('wallet/transactions/'),
  topup: (amount: number) => api<PaymentStart>('wallet/topup/', { method: 'POST', body: { amount } }),
  payment: (id: number | string) => api<Payment>(`payments/${id}/`),
};

export interface TournamentQuery {
  game?: string;
  status?: TournamentStatus | TournamentStatus[];
  participant_type?: 'solo' | 'team';
  search?: string;
  ordering?: string;
  featured?: boolean;
  page?: number;
  page_size?: number;
}

export const tournamentsApi = {
  list: (query: TournamentQuery = {}) =>
    api<Paginated<TournamentSummary>>('tournaments/', { query: { ...query } }),
  get: (slug: string) => api<Tournament>(`tournaments/${slug}/`),
  participants: (slug: string) => api<Participant[]>(`tournaments/${slug}/participants/`),
  bracket: (slug: string) => api<BracketRound[]>(`tournaments/${slug}/bracket/`),
  eligibleTeams: (slug: string) => api<TeamSummary[]>(`tournaments/${slug}/eligible-teams/`),
  register: (slug: string, data: { team?: number | null; paymentMethod?: PaymentMethod | null }) =>
    api<RegistrationResult>(`tournaments/${slug}/register/`, { method: 'POST', body: data }),
  withdraw: (slug: string) => api<void>(`tournaments/${slug}/register/`, { method: 'DELETE' }),
  ranks: () => api<RankTier[]>('ranks/'),
  playerLeaderboard: (game?: string) =>
    api<Paginated<PlayerLeaderboardRow>>('leaderboards/players/', { query: { game, page_size: 10 } }),
  teamLeaderboard: (game?: string) =>
    api<Paginated<TeamLeaderboardRow>>('leaderboards/teams/', { query: { game, page_size: 10 } }),
};

export interface TeamInput {
  name: string;
  tag: string;
  game: string;
  region: string;
  description?: string;
  logo?: File | null;
}

function teamForm(data: Partial<TeamInput>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    form.append(key, value instanceof File ? value : String(value));
  }
  return form;
}

export const teamsApi = {
  get: (id: number | string) => api<Team>(`teams/${id}/`),
  create: (data: TeamInput) => api<Team>('teams/', { method: 'POST', body: teamForm(data) }),
  update: (id: number, data: Partial<TeamInput>) =>
    api<Team>(`teams/${id}/`, { method: 'PATCH', body: teamForm(data) }),
  dissolve: (id: number) => api<void>(`teams/${id}/`, { method: 'DELETE' }),
  removeMember: (id: number, userId: number) => api<void>(`teams/${id}/members/${userId}/`, { method: 'DELETE' }),
  promote: (id: number, userId: number) => api<Team>(`teams/${id}/members/${userId}/promote/`, { method: 'POST' }),
  regenerateInvite: (id: number) => api<Team>(`teams/${id}/invite-code/regenerate/`, { method: 'POST' }),
  invitations: (id: number) => api<TeamInvitation[]>(`teams/${id}/invitations/`),
  invite: (id: number, username: string) =>
    api<TeamInvitation>(`teams/${id}/invitations/`, { method: 'POST', body: { username } }),
  join: (code: string) => api<Team>('teams/join/', { method: 'POST', body: { code } }),
  tournaments: (id: number | string) =>
    api<Paginated<{ id: number; status: string; finalPlacement: number | null; tournament: TournamentSummary }>>(
      `teams/${id}/tournaments/`,
    ),
};

export const notificationsApi = {
  list: () => api<Paginated<Notification>>('notifications/', { query: { page_size: 50 } }),
  unreadCount: () => api<{ count: number }>('notifications/unread-count/'),
  markRead: (id: number) => api<Notification>(`notifications/${id}/read/`, { method: 'POST' }),
  markAllRead: () => api<{ count: number }>('notifications/read-all/', { method: 'POST' }),
};

export const contentApi = {
  home: () => api<Home>('home/'),
  search: (q: string) => api<SearchResults>('search/', { query: { q } }),
  promos: (placement: Promo['placement']) => api<Promo[]>('content/promos/', { query: { placement } }),
  announcements: () => api<Announcement[]>('content/announcements/'),
  contact: () => api<{ supportOnline: boolean; channels: ContactChannel[] }>('content/contact/'),
  stats: () => api<PlatformStats>('stats/'),
};
