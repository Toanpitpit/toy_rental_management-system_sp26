const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Toy = require('./models/Toy');
const ToyDetail = require('./models/ToyDetail');
const User = require('./models/User');

dotenv.config();

const toysData = [
  {
    title: "Bộ Đường Đua Siêu Cấp Hot Wheels",
    category: "Đồ chơi vận động",
    thumbnail: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=800&auto=format&fit=crop",
    pricePerHour: 15000,
    depositValue: 500000,
    description: "Bộ đường đua Hot Wheels đầy thử thách với các khúc cua chết người, giúp bé rèn luyện phản xạ.",
    ageRange: "5-10 tuổi",
    origin: "USA"
  },
  {
    title: "LEGO Technic Xe Cứu Hỏa Hiện Đại",
    category: "Lắp ráp LEGO",
    thumbnail: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=800&auto=format&fit=crop",
    pricePerHour: 25000,
    depositValue: 1200000,
    description: "Xe cứu hỏa với các khớp nối cơ học chân thực, mang lại trải nghiệm lắp ráp kỹ thuật đỉnh cao.",
    ageRange: "10+ tuổi",
    origin: "Đan Mạch"
  },
  {
    title: "Gấu Bông Teddy Khổng Lồ 1m5",
    category: "Gấu bông",
    thumbnail: "https://images.unsplash.com/photo-1559440666-3d7ec1f81cf4?q=80&w=800&auto=format&fit=crop",
    pricePerHour: 10000,
    depositValue: 300000,
    description: "Gấu bông cực kỳ mềm mại, an toàn cho trẻ em, kích thước cực lớn cho cảm giác ấm áp.",
    ageRange: "Mọi lứa tuổi",
    origin: "Việt Nam"
  },
  {
    title: "Búp Bê Barbie Dreamhouse",
    category: "Búp bê",
    thumbnail: "https://images.unsplash.com/photo-1558223604-0373e8784260?q=80&w=800&auto=format&fit=crop",
    pricePerHour: 20000,
    depositValue: 800000,
    description: "Ngôi nhà mơ ước của Barbie với đầy đủ nội thất sang trọng, giúp bé thỏa sức sáng tạo.",
    ageRange: "3-8 tuổi",
    origin: "Indonesia"
  },
  {
    title: "Máy Bay Điều Khiển Từ Xa RC Phantom",
    category: "Đồ chơi điều khiển",
    thumbnail: "https://images.unsplash.com/photo-1506947411487-a56738267384?q=80&w=800&auto=format&fit=crop",
    pricePerHour: 45000,
    depositValue: 2500000,
    description: "Máy bay 4 cánh quạt ổn định, tích hợp camera HD để bé quan sát thế giới từ trên cao.",
    ageRange: "12+ tuổi",
    origin: "Trung Quốc"
  },
  {
    title: "Bộ Đồ Chơi Nấu Ăn MasterChef",
    category: "Đồ chơi nhập vai",
    thumbnail: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop",
    pricePerHour: 12000,
    depositValue: 400000,
    description: "Bộ bếp hoàn chỉnh với nồi, niêu, xoong, chảo và thực phẩm nhựa giả thật.",
    ageRange: "3-6 tuổi",
    origin: "Việt Nam"
  },
  {
    title: "Xe Đạp Trẻ Em RoyalBaby Cloud",
    category: "Đồ chơi vận động",
    thumbnail: "https://images.unsplash.com/photo-1519340241574-2e21247072a7?q=80&w=800&auto=format&fit=crop",
    pricePerHour: 30000,
    depositValue: 1500000,
    description: "Xe đạp khung nhôm siêu nhẹ, thiết kế an toàn tối đa cho các bé mới tập đi xe.",
    ageRange: "4-7 tuổi",
    origin: "Đài Loan"
  },
  {
    title: "Bộ Xếp Hình Gỗ Montessori",
    category: "Giáo dục",
    thumbnail: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=800&auto=format&fit=crop",
    pricePerHour: 8000,
    depositValue: 200000,
    description: "Phát triển tư duy logic và kỹ năng vận động tinh cho trẻ tập đi.",
    ageRange: "1-3 tuổi",
    origin: "Việt Nam"
  },
  {
    title: "Đàn Piano Điện Cho Bé Yamaha Kids",
    category: "Nhạc cụ",
    thumbnail: "https://images.unsplash.com/photo-1520529712542-85634df0eb91?q=80&w=800&auto=format&fit=crop",
    pricePerHour: 35000,
    depositValue: 2000000,
    description: "Âm thanh chân thực, phím bấm nhẹ nhàng giúp bé sớm làm quen với âm nhạc.",
    ageRange: "4-12 tuổi",
    origin: "Nhật Bản"
  },
  {
    title: "Thuyền Hải Tặc LEGO Pirates",
    category: "Lắp ráp LEGO",
    thumbnail: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?q=80&w=800&auto=format&fit=crop",
    pricePerHour: 22000,
    depositValue: 1000000,
    description: "Khám phá đại dương bao la với con tàu hải tặc khổng lồ và các minifigures độc đáo.",
    ageRange: "7+ tuổi",
    origin: "Đan Mạch"
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is not defined in .env");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    // Tìm admin hoặc owner mặc định
    const admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) {
      console.log("No Admin found! Please register an ADMIN first.");
      process.exit(1);
    }

    console.log(`Owner will be: ${admin.email}`);

    for (const data of toysData) {
      // Create Toy
      const toy = await Toy.create({
        ownerId: admin._id,
        title: data.title,
        category: data.category,
        thumbnail: data.thumbnail,
        pricePerHour: data.pricePerHour,
        depositValue: data.depositValue,
        status: 'AVAILABLE'
      });

      // Create Detail
      await ToyDetail.create({
        toyId: toy._id,
        description: data.description,
        images: [data.thumbnail, data.thumbnail], 
        ageRange: data.ageRange,
        origin: data.origin,
        specifications: { "Chất liệu": "Nhựa ABS an toàn", "Trọng lượng": "1.2kg" }
      });

      console.log(`- Inserted: ${toy.title}`);
    }

    console.log("\nSeeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
