import { type Document } from 'mongoose';

export interface ILocalizationField {
  en: string;
  vi: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  avatar: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  provider: string;
  favoriteMovies: Array<string | IMovie>;
  favoriteTheaters: Array<string | ITheater>;
  comparePassword: (password: string) => Promise<boolean>;
  signAccessToken: () => string;
  signRefreshToken: () => string;
}

export interface IManager extends Document {
  code: string;
  password: string;
  role: string;
  isVerified: boolean;
  theater?: string | ITheater; // type: mongoose.Schema.Types.ObjectId, ref: 'Theater'
  comparePassword: (password: string) => Promise<boolean>;
  signAccessToken: () => string;
  signRefreshToken: () => string;
}

export interface IGenre extends Document {
  name: ILocalizationField;
}

export interface IReview extends Document {
  user: string | IUser;
  rating: number;
  message: string;
  isActive: boolean;
  theater: string | ITheater;
  movie: string | IMovie;
  isSpoil: boolean;
}

export interface ITheater extends Document {
  name: string;
  address: string;
  addressCode: {
    city: number;
    district: number;
    ward: number;
    detail: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  email: string;
  description: ILocalizationField;
  hotline: string;
  logo: string;
  images: string[];
  isActive: boolean;
  totalFavorites: number;
  ratingAverage: number;
  ratingCount: number;
}

export interface IFare extends Document {
  theater: string | ITheater;
  normalDay: string;
  weekend: string;
  specialDay: string;
  description: ILocalizationField;
  u22: number;
  _2d: Array<{
    from: string;
    to: string;
    seat: Array<{
      type: string;
      normalDayPrice: number;
      specialDayPrice: number;
    }>;
  }>;
  _3d: Array<{
    from: string;
    to: string;
    seat: Array<{
      type: string;
      normalDayPrice: number;
      specialDayPrice: number;
    }>;
  }>;
  surcharge: Array<{ name: string; value: number }>;
}

export interface IMovie extends Document {
  title: string;
  originalTitle: string;
  trailer: string;
  poster: string;
  overview: ILocalizationField;
  duration: number;
  releaseDate: Date;
  formats: string[];
  directors: Array<string | IPerson>;
  actors: Array<string | IPerson>;
  languages: string[];
  ageType: string;
  genres: Array<string | IGenre>;
  totalRate: number;
  isActive: boolean;
  totalFavorites: number;
  ratingAverage: number;
  ratingCount: number;
}

export interface IPerson extends Document {
  avatar: string;
  fullName: string;
  summary: ILocalizationField;
  movies: Array<string | IMovie>;
}

export interface IProduct extends Document {
  name: string;
  description: ILocalizationField;
  price: number;
  image: string;
  isActive: boolean;
  theater: string | ITheater;
}

export interface IRoom extends Document {
  theater: string | ITheater;
  type: string;
  name: string;
  capacity: number;
  seats: ISeat[];
  isActive: boolean;
}

export interface ISeat extends Document {
  coordinates: [number, number];
  label: string; // unique
  type: string; // VIP, STANDARD, SWEET
  status: string;
}

// [startTime, room] --> unique --> không có 2 lịch chiếu nào cùng một phòng
export interface IShowtime extends Document {
  movie: string | IMovie;
  theater: string | ITheater;
  room: string | IRoom;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  language: string;
  type: string; // Sneakshow (Suất chiếu sớm / Suất chiếu đặc biệt), Normal
}

export interface IPromotion extends Document {
  // Thông tin
  code: string;
  title: string;
  content: string;
  thumbnail: string | string;
  // Phạm vi + Thời gian
  startTime: Date;
  endTime: Date;
  //
  theater: string | ITheater;
  // Giá trị giảm giá
  value: number;
  type: string; // Amount | Percentage
  // Trạng thái
  userUsed: string[];
  isActive: boolean;
}

export interface IBooking extends Document {
  showtime: string | IShowtime;
  theater: string | ITheater;
  room: string | IRoom;
  seats: Array<string | ISeat>;

  products: Array<{
    quantity: number;
    item: string | IProduct;
  }>;

  user: string | IUser;
  email: string;
  phoneNumber: string;

  payment: string | IPayment;

  qrcode: string;
}

export interface IPayment {
  promotion: Array<string | IPromotion>;
  discountAmount: number;
  totalPrice: number;
  method: string;
  paidAt: Date;
}
