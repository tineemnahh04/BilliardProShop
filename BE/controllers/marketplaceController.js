import { MarketplaceItem } from '../models/marketplaceModel.js';

// Sample seed data to populate if empty
const INITIAL_SEED_ITEMS = [
  {
    id: 1,
    seller: {
      userId: "user_pro_1",
      name: "Nguyễn Văn Hùng",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      phone: "0908123456",
      rating: 4.9,
      totalReviews: 18
    },
    title: "Mezz EC9-W1 (Ngọn WX700 chuẩn Nhật)",
    images: [
      "https://images.unsplash.com/photo-1599685315659-bc876da49fe5?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1575553939928-d03b21323afe?w=600&h=600&fit=crop"
    ],
    price: 7500000,
    condition: { stars: 5, label: "Like New (99%)" },
    description: "Used 6 months, no scratches, original tip. Cần pass lại cho cơ thủ đam mê ngọn bạt thấp Mezz. Đã dán ngọn Kamui Black.",
    location: "Hồ Chí Minh",
    phone: "0908123456",
    listingType: "sale",
    status: "active",
    offers: [
      {
        id: "off_1",
        buyerId: "buyer_10",
        buyerName: "Lê Minh Tuấn",
        buyerPhone: "0912345678",
        offerAmount: 7000000,
        note: "Bớt 500k mình qua lấy trong ngày nhé sếp!",
        status: "pending",
        createdAt: new Date()
      }
    ],
    reviews: [
      {
        id: "rev_1",
        raterRole: "buyer",
        raterName: "Trần Bảo",
        rating: 5,
        comment: "Bán hàng cực kỳ uy tín, tư vấn nhiệt tình!",
        createdAt: new Date()
      }
    ]
  },
  {
    id: 2,
    seller: {
      userId: "user_pro_2",
      name: "Trần Quốc Anh",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop",
      phone: "0987654321",
      rating: 4.8,
      totalReviews: 9
    },
    title: "Predator Aspire 1-1 (Kèm Ngọn One 12.5mm)",
    images: [
      "https://images.unsplash.com/photo-1544281153-6603be88b354?w=600&h=600&fit=crop"
    ],
    price: 6200000,
    condition: { stars: 4, label: "Good (90%)" },
    description: "Dòng cơ Predator Aspire trợ lực cực ổn định, đánh thẳng bi. Có xước nhẹ đuôi cơ không ảnh hưởng trải nghiệm.",
    location: "Hà Nội",
    phone: "0987654321",
    listingType: "trade",
    tradeDetails: {
      targetCue: "Cơ Carom phăng hoặc bù tiền lấy Mezz EC9",
      cashOffset: 500000
    },
    status: "active"
  },
  {
    id: 3,
    seller: {
      userId: "user_pro_3",
      name: "Phạm Hoàng Nam",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
      phone: "0933445566",
      rating: 5.0,
      totalReviews: 24
    },
    title: "Đấu Giá: Ngọn Carbon Cuetec Cynergy 15K Uniloc",
    images: [
      "https://images.unsplash.com/photo-1575553939928-d03b21323afe?w=600&h=600&fit=crop"
    ],
    price: 4500000,
    condition: { stars: 5, label: "Like New (98%)" },
    description: "Ngọn Carbon Cynergy 15K lướt 2 tuần, ren Uniloc. Mở đấu giá 3 ngày khởi điểm 4.5M!",
    location: "Đà Nẵng",
    phone: "0933445566",
    listingType: "auction",
    auctionDetails: {
      endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startingBid: 4500000,
      currentBid: 4800000,
      highestBidder: "Hoàng Bida Club",
      highestBidderId: "user_bidder_1",
      bidsCount: 4,
      bids: [
        { bidderId: "user_bidder_1", bidderName: "Hoàng Bida Club", amount: 4800000, createdAt: new Date() }
      ]
    },
    status: "active"
  }
];

// Helper to seed items if DB empty
const ensureSeedData = async () => {
  const count = await MarketplaceItem.countDocuments();
  if (count === 0) {
    await MarketplaceItem.insertMany(INITIAL_SEED_ITEMS);
  }
};

export const marketplaceController = {
  // 1. Lấy toàn bộ danh sách bài đăng Marketplace
  getAll: async (req, res) => {
    try {
      await ensureSeedData();

      const { q, location, condition, listingType, minPrice, maxPrice, sort } = req.query;

      const filter = { status: 'active' };

      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } }
        ];
      }

      if (location && location !== 'all') {
        filter.location = { $regex: location, $options: 'i' };
      }

      if (condition && condition !== 'all') {
        if (condition === 'like_new') filter['condition.stars'] = 5;
        else if (condition === 'good') filter['condition.stars'] = 4;
        else if (condition === 'fair') filter['condition.stars'] = { $lte: 3 };
      }

      if (listingType && listingType !== 'all') {
        filter.listingType = listingType;
      }

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'price-asc') sortOptions = { price: 1 };
      else if (sort === 'price-desc') sortOptions = { price: -1 };
      else if (sort === 'rating') sortOptions = { 'seller.rating': -1 };

      const items = await MarketplaceItem.find(filter).sort(sortOptions);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách Marketplace', error: error.message });
    }
  },

  // 2. Chi tiết tin đăng Marketplace
  getById: async (req, res) => {
    try {
      await ensureSeedData();
      const id = parseInt(req.params.id);
      const item = await MarketplaceItem.findOne({ id });

      if (!item) {
        return res.status(404).json({ message: 'Không tìm thấy bài đăng mua bán' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xem chi tiết bài đăng', error: error.message });
    }
  },

  // 3. Tạo tin đăng bán cơ mới (Sell Your Cue)
  create: async (req, res) => {
    try {
      const { title, images, price, conditionStars, conditionLabel, description, location, phone, listingType, sellerName, targetCue, cashOffset, startingBid, auctionDays } = req.body;

      if (!title || !price || !location || !phone) {
        return res.status(400).json({ message: 'Tên sản phẩm, giá bán, vị trí và SĐT là bắt buộc' });
      }

      const lastItem = await MarketplaceItem.findOne().sort({ id: -1 });
      const nextId = lastItem ? lastItem.id + 1 : 1;

      const numPrice = parseFloat(price);

      const auctionDetails = listingType === 'auction' ? {
        endAt: new Date(Date.now() + (parseInt(auctionDays) || 3) * 24 * 60 * 60 * 1000),
        startingBid: parseFloat(startingBid) || numPrice,
        currentBid: parseFloat(startingBid) || numPrice,
        highestBidder: '',
        bidsCount: 0,
        bids: []
      } : undefined;

      const tradeDetails = listingType === 'trade' ? {
        targetCue: targetCue || 'Đổi cơ tương đương',
        cashOffset: parseFloat(cashOffset) || 0
      } : undefined;

      const newItem = new MarketplaceItem({
        id: nextId,
        seller: {
          userId: `user_${Date.now()}`,
          name: sellerName || 'Cơ thủ Bida',
          avatar: '',
          phone: phone,
          rating: 5.0,
          totalReviews: 1
        },
        title,
        images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1599685315659-bc876da49fe5?w=600&h=600&fit=crop"],
        price: numPrice,
        condition: {
          stars: parseInt(conditionStars) || 5,
          label: conditionLabel || 'Like New (99%)'
        },
        description: description || 'Used cue in good condition.',
        location,
        phone,
        listingType: listingType || 'sale',
        auctionDetails,
        tradeDetails,
        status: 'active'
      });

      await newItem.save();
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi đăng tin bán cơ', error: error.message });
    }
  },

  // 4. Trả giá (Make Offer)
  makeOffer: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { buyerName, buyerPhone, offerAmount, note } = req.body;

      if (!offerAmount || offerAmount <= 0) {
        return res.status(400).json({ message: 'Số tiền trả giá không hợp lệ' });
      }

      const item = await MarketplaceItem.findOne({ id });
      if (!item) {
        return res.status(404).json({ message: 'Không tìm thấy bài đăng' });
      }

      const offerObj = {
        id: `off_${Date.now()}`,
        buyerId: `buyer_${Date.now()}`,
        buyerName: buyerName || 'Khách Mua Bida',
        buyerPhone: buyerPhone || '',
        offerAmount: parseFloat(offerAmount),
        note: note || '',
        status: 'pending',
        createdAt: new Date()
      };

      item.offers.push(offerObj);
      await item.save();

      res.json({ message: 'Gửi lời trả giá thành công!', item });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi gửi Make Offer', error: error.message });
    }
  },

  // 5. Phản hồi lời trả giá (Accept / Reject / Counter Offer)
  respondOffer: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const offerId = req.params.offerId;
      const { action, counterAmount } = req.body; // action: 'accept', 'reject', 'counter'

      const item = await MarketplaceItem.findOne({ id });
      if (!item) return res.status(404).json({ message: 'Không tìm thấy bài đăng' });

      const offer = item.offers.find(o => o.id === offerId);
      if (!offer) return res.status(404).json({ message: 'Không tìm thấy lời đề nghị' });

      if (action === 'accept') {
        offer.status = 'accepted';
      } else if (action === 'reject') {
        offer.status = 'rejected';
      } else if (action === 'counter') {
        offer.status = 'countered';
        offer.counterAmount = parseFloat(counterAmount) || offer.offerAmount;
      }

      await item.save();
      res.json({ message: 'Cập nhật trạng thái đề nghị thành công!', item });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi phản hồi trả giá', error: error.message });
    }
  },

  // 6. Đặt giá đấu giá (Place Bid)
  placeBid: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { bidderName, amount } = req.body;

      const item = await MarketplaceItem.findOne({ id });
      if (!item) return res.status(404).json({ message: 'Không tìm thấy bài đăng đấu giá' });

      if (item.listingType !== 'auction') {
        return res.status(400).json({ message: 'Bài đăng này không bật đấu giá' });
      }

      const numAmount = parseFloat(amount);
      const current = item.auctionDetails.currentBid || item.price;

      if (numAmount <= current) {
        return res.status(400).json({ message: `Giá đặt phải lớn hơn giá hiện tại (${current.toLocaleString('vi-VN')} đ)` });
      }

      item.auctionDetails.currentBid = numAmount;
      item.auctionDetails.highestBidder = bidderName || 'Cơ thủ Đấu giá';
      item.auctionDetails.highestBidderId = `bidder_${Date.now()}`;
      item.auctionDetails.bidsCount = (item.auctionDetails.bidsCount || 0) + 1;
      item.auctionDetails.bids.push({
        bidderId: `bidder_${Date.now()}`,
        bidderName: bidderName || 'Cơ thủ Đấu giá',
        amount: numAmount,
        createdAt: new Date()
      });

      await item.save();
      res.json({ message: 'Đặt giá thành công!', item });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi đặt giá đấu giá', error: error.message });
    }
  },

  // 7. Đề xuất trao đổi cơ (Propose Trade)
  proposeTrade: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { buyerName, offeredCue, cashOffset, note } = req.body;

      const item = await MarketplaceItem.findOne({ id });
      if (!item) return res.status(404).json({ message: 'Không tìm thấy bài đăng' });

      item.trades.push({
        id: `trd_${Date.now()}`,
        buyerId: `buyer_${Date.now()}`,
        buyerName: buyerName || 'Khách Mua Bida',
        offeredCue: offeredCue || 'Cơ bida đổi',
        cashOffset: parseFloat(cashOffset) || 0,
        note: note || '',
        status: 'pending',
        createdAt: new Date()
      });

      await item.save();
      res.json({ message: 'Đã gửi đề xuất trao đổi cơ thành công!', item });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi đề xuất trao đổi cơ', error: error.message });
    }
  },

  // 8. Đánh giá người bán / người mua (Ratings & Reviews)
  addReview: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { raterRole, raterName, rating, comment } = req.body;

      const item = await MarketplaceItem.findOne({ id });
      if (!item) return res.status(404).json({ message: 'Không tìm thấy bài đăng' });

      const newReview = {
        id: `rev_${Date.now()}`,
        raterRole: raterRole || 'buyer',
        raterName: raterName || 'Khách hàng',
        rating: parseInt(rating) || 5,
        comment: comment || '',
        createdAt: new Date()
      };

      item.reviews.push(newReview);

      // Recalculate seller average rating
      const totalRatings = item.reviews.reduce((sum, r) => sum + r.rating, 0);
      item.seller.rating = parseFloat((totalRatings / item.reviews.length).toFixed(1));
      item.seller.totalReviews = item.reviews.length;

      await item.save();
      res.json({ message: 'Cảm ơn bạn đã gửi đánh giá giao dịch!', item });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi gửi đánh giá', error: error.message });
    }
  },

  // 9. Lấy danh sách tin nhắn chat
  getChatMessages: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await MarketplaceItem.findOne({ id });
      if (!item) return res.status(404).json({ message: 'Không tìm thấy bài đăng' });
      res.json(item.chats || []);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy tin nhắn chat', error: error.message });
    }
  },

  // 10. Gửi tin nhắn chat mới (Buyer hoặc Seller)
  sendChatMessage: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { senderId, senderName, senderRole, text } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
      }

      const item = await MarketplaceItem.findOne({ id });
      if (!item) return res.status(404).json({ message: 'Không tìm thấy bài đăng' });

      const newMsg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        senderId: senderId || 'user_anon',
        senderName: senderName || 'Thành viên Bida',
        senderRole: senderRole || 'buyer',
        text: text.trim(),
        createdAt: new Date()
      };

      item.chats.push(newMsg);
      await item.save();

      res.status(201).json({ message: 'Đã gửi tin nhắn thành công', chats: item.chats });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi gửi tin nhắn', error: error.message });
    }
  },

  // 11. Thu hồi tin nhắn chat
  recallChatMessage: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const msgId = req.params.msgId;

      const item = await MarketplaceItem.findOne({ id });
      if (!item) return res.status(404).json({ message: 'Không tìm thấy bài đăng' });

      const msg = item.chats.find(c => c.id === msgId);
      if (!msg) return res.status(404).json({ message: 'Không tìm thấy tin nhắn' });

      msg.text = 'Tin nhắn đã được thu hồi';
      msg.isRecalled = true;

      await item.save();
      res.json({ message: 'Đã thu hồi tin nhắn thành công', chats: item.chats });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thu hồi tin nhắn', error: error.message });
    }
  },

  // 12. Xóa sạch lịch sử chat (tạo đoạn chat mới)
  clearChatMessages: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await MarketplaceItem.findOne({ id });
      if (!item) return res.status(404).json({ message: 'Không tìm thấy bài đăng' });

      item.chats = [];
      await item.save();

      res.json({ message: 'Đã xóa sạch lịch sử chat', chats: [] });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa lịch sử chat', error: error.message });
    }
  }
};
