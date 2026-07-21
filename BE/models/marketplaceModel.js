import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
  id: { type: String, required: true },
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  buyerPhone: { type: String, default: '' },
  offerAmount: { type: Number, required: true },
  note: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'countered'], default: 'pending' },
  counterAmount: { type: Number, default: 0 },
  counterNote: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const TradeProposalSchema = new mongoose.Schema({
  id: { type: String, required: true },
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  offeredCue: { type: String, required: true },
  cashOffset: { type: Number, default: 0 },
  note: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ReviewItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  raterRole: { type: String, enum: ['buyer', 'seller'], required: true },
  raterName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const BidItemSchema = new mongoose.Schema({
  bidderId: { type: String, required: true },
  bidderName: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ChatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, default: 'buyer' },
  text: { type: String, required: true },
  isRecalled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const MarketplaceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  seller: {
    userId: { type: String, default: 'user_1' },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    phone: { type: String, required: true },
    rating: { type: Number, default: 5.0 },
    totalReviews: { type: Number, default: 12 }
  },
  title: { type: String, required: true },
  images: [{ type: String }],
  price: { type: Number, required: true },
  condition: {
    stars: { type: Number, default: 5 },
    label: { type: String, default: 'Like New' }
  },
  description: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  listingType: { type: String, enum: ['sale', 'auction', 'trade'], default: 'sale' },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  
  // Auction options
  auctionDetails: {
    endAt: { type: Date, default: null },
    startingBid: { type: Number, default: 0 },
    currentBid: { type: Number, default: 0 },
    highestBidder: { type: String, default: '' },
    highestBidderId: { type: String, default: '' },
    bidsCount: { type: Number, default: 0 },
    bids: [BidItemSchema]
  },
  
  // Trade options
  tradeDetails: {
    targetCue: { type: String, default: '' },
    cashOffset: { type: Number, default: 0 }
  },

  offers: [OfferSchema],
  trades: [TradeProposalSchema],
  reviews: [ReviewItemSchema],
  chats: [ChatMessageSchema],
  savedBy: [{ type: String }]
}, {
  timestamps: true
});

export const MarketplaceItem = mongoose.model('MarketplaceItem', MarketplaceSchema);
