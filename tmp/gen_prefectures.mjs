import fs from 'fs';
import path from 'path';

const prefectures = [
  { id: 'hokkaido', name: '北海道', capital: '札幌市', region: 'hokkaido' },
  { id: 'aomori', name: '青森県', capital: '青森市', region: 'tohoku' },
  { id: 'iwate', name: '岩手県', capital: '盛岡市', region: 'tohoku' },
  { id: 'miyagi', name: '宮城県', capital: '仙台市', region: 'tohoku' },
  { id: 'akita', name: '秋田県', capital: '秋田市', region: 'tohoku' },
  { id: 'yamagata', name: '山形県', capital: '山形市', region: 'tohoku' },
  { id: 'fukushima', name: '福島県', capital: '福島市', region: 'tohoku' },
  { id: 'ibaraki', name: '茨城県', capital: '水戸市', region: 'kanto' },
  { id: 'tochigi', name: '栃木県', capital: '宇都宮市', region: 'kanto' },
  { id: 'gunma', name: '群馬県', capital: '前橋市', region: 'kanto' },
  { id: 'saitama', name: '埼玉県', capital: 'さいたま市', region: 'kanto' },
  { id: 'chiba', name: '千葉県', capital: '千葉市', region: 'kanto' },
  { id: 'tokyo', name: '東京都', capital: '新宿区', region: 'kanto' },
  { id: 'kanagawa', name: '神奈川県', capital: '横浜市', region: 'kanto' },
  { id: 'niigata', name: '新潟県', capital: '新潟市', region: 'chubu' },
  { id: 'toyama', name: '富山県', capital: '富山市', region: 'chubu' },
  { id: 'ishikawa', name: '石川県', capital: '金沢市', region: 'chubu' },
  { id: 'fukui', name: '福井県', capital: '福井市', region: 'chubu' },
  { id: 'yamanashi', name: '山梨県', capital: '甲府市', region: 'chubu' },
  { id: 'nagano', name: '長野県', capital: '長野市', region: 'chubu' },
  { id: 'gifu', name: '岐阜県', capital: '岐阜市', region: 'chubu' },
  { id: 'shizuoka', name: '静岡県', capital: '静岡市', region: 'chubu' },
  { id: 'aichi', name: '愛知県', capital: '名古屋市', region: 'chubu' },
  { id: 'mie', name: '三重県', capital: '津市', region: 'kansai' },
  { id: 'shiga', name: '滋賀県', capital: '大津市', region: 'kansai' },
  { id: 'kyoto', name: '京都府', capital: '京都市', region: 'kansai' },
  { id: 'osaka', name: '大阪府', capital: '大阪市', region: 'kansai' },
  { id: 'hyogo', name: '兵庫県', capital: '神戸市', region: 'kansai' },
  { id: 'nara', name: '奈良県', capital: '奈良市', region: 'kansai' },
  { id: 'wakayama', name: '和歌山県', capital: '和歌山市', region: 'kansai' },
  { id: 'tottori', name: '鳥取県', capital: '鳥取市', region: 'chugoku' },
  { id: 'shimane', name: '島根県', capital: '松江市', region: 'chugoku' },
  { id: 'okayama', name: '岡山県', capital: '岡山市', region: 'chugoku' },
  { id: 'hiroshima', name: '広島県', capital: '広島市', region: 'chugoku' },
  { id: 'yamaguchi', name: '山口県', capital: '山口市', region: 'chugoku' },
  { id: 'tokushima', name: '徳島県', capital: '徳島市', region: 'shikoku' },
  { id: 'kagawa', name: '香川県', capital: '高松市', region: 'shikoku' },
  { id: 'ehime', name: '愛媛県', capital: '松山市', region: 'shikoku' },
  { id: 'kochi', name: '高知県', capital: '高知市', region: 'shikoku' },
  { id: 'fukuoka', name: '福岡県', capital: '福岡市', region: 'kyushu' },
  { id: 'saga', name: '佐賀県', capital: '佐賀市', region: 'kyushu' },
  { id: 'nagasaki', name: '長崎県', capital: '長崎市', region: 'kyushu' },
  { id: 'kumamoto', name: '熊本県', capital: '熊本市', region: 'kyushu' },
  { id: 'oita', name: '大分県', capital: '大分市', region: 'kyushu' },
  { id: 'miyazaki', name: '宮崎県', capital: '宮崎市', region: 'kyushu' },
  { id: 'kagoshima', name: '鹿児島県', capital: '鹿児島市', region: 'kyushu' },
  { id: 'okinawa', name: '沖縄県', capital: '那覇市', region: 'kyushu' }
];

const OUTPUT_DIR = 'c:/Users/sasis/344dev/syllabushack-astro/src/data/master/prefecture-knowledge';

prefectures.forEach(pref => {
  const data = {
    prefectureId: pref.id,
    name: pref.name,
    capitalCity: pref.capital,
    regionId: pref.region,
    infrastructure: {
      commute: {
        car_ratio_percent: 0,
        train_ratio_percent: 0,
        average_time_minutes: 0,
        main_method: "unknown",
        audio_learning_suitability: "unknown",
        visual_learning_suitability: "unknown"
      },
      cbt_center_stats: {
        density_level: "unknown",
        major_city_centers: []
      },
      third_places: {
        cafe_availability: "unknown",
        coworking_spaces: "unknown",
        public_libraries_with_wifi: "unknown"
      }
    },
    career_trends: {
      job_opening_ratio: 0,
      it_market_growth: "unknown",
      target_industries: [],
      high_demand_certs: [],
      salary_boost_potential: "unknown"
    },
    hack_ideas: []
  };

  const fileName = `${pref.id}.json`;
  fs.writeFileSync(path.join(OUTPUT_DIR, fileName), JSON.stringify(data, null, 2));
});

console.log('Successfully created 47 prefecture knowledge files.');
