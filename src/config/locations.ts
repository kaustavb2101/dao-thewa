export interface LocationData {
    name: string;
    nameEn: string;
    lat: number;
    lng: number;
    tz: number; // Timezone offset in minutes from UTC
}

export interface CountryData {
    id: string;
    name: string;
    nameEn: string;
    cities: LocationData[];
}

export const COUNTRIES: CountryData[] = [
    {
        id: 'TH',
        name: 'ประเทศไทย',
        nameEn: 'Thailand',
        cities: [
            { name: 'กรุงเทพมหานคร', nameEn: 'Bangkok', lat: 13.7563, lng: 100.5018, tz: 420 },
            { name: 'เชียงใหม่', nameEn: 'Chiang Mai', lat: 18.7883, lng: 98.9853, tz: 420 },
            { name: 'ภูเก็ต', nameEn: 'Phuket', lat: 7.8804, lng: 98.3923, tz: 420 },
            { name: 'ขอนแก่น', nameEn: 'Khon Kaen', lat: 16.4419, lng: 102.8360, tz: 420 },
            { name: 'หาดใหญ่', nameEn: 'Hat Yai', lat: 7.0086, lng: 100.4747, tz: 420 },
            { name: 'โคราช', nameEn: 'Nakhon Ratchasima', lat: 14.9799, lng: 102.0978, tz: 420 },
            { name: 'อุดรธานี', nameEn: 'Udon Thani', lat: 17.4138, lng: 102.7872, tz: 420 },
            { name: 'พัทยา', nameEn: 'Pattaya', lat: 12.9236, lng: 100.8825, tz: 420 },
        ],
    },
    {
        id: 'IN',
        name: 'อินเดีย',
        nameEn: 'India',
        cities: [
            { name: 'นิวเดลี', nameEn: 'New Delhi', lat: 28.6139, lng: 77.2090, tz: 330 },
            { name: 'มุมไบ', nameEn: 'Mumbai', lat: 19.0760, lng: 72.8777, tz: 330 },
            { name: 'กัลกัตตา', nameEn: 'Kolkata', lat: 22.5726, lng: 88.3639, tz: 330 },
            { name: 'เบงกาลูรู', nameEn: 'Bengaluru', lat: 12.9716, lng: 77.5946, tz: 330 },
        ],
    },
    {
        id: 'US',
        name: 'สหรัฐอเมริกา',
        nameEn: 'United States',
        cities: [
            { name: 'นิวยอร์ก', nameEn: 'New York', lat: 40.7128, lng: -74.0060, tz: -300 }, // EST/EDT approx
            { name: 'ลอสแอนเจลิส', nameEn: 'Los Angeles', lat: 34.0522, lng: -118.2437, tz: -480 }, // PST/PDT approx
            { name: 'ชิคาโก', nameEn: 'Chicago', lat: 41.8781, lng: -87.6298, tz: -360 },
            { name: 'ฮาวาย', nameEn: 'Honolulu', lat: 21.3069, lng: -157.8583, tz: -600 },
        ],
    },
    {
        id: 'GB',
        name: 'สหราชอาณาจักร',
        nameEn: 'United Kingdom',
        cities: [
            { name: 'ลอนดอน', nameEn: 'London', lat: 51.5074, lng: -0.1278, tz: 0 },
            { name: 'แมนเชสเตอร์', nameEn: 'Manchester', lat: 53.4808, lng: -2.2426, tz: 0 },
            { name: 'เอดินบะระ', nameEn: 'Edinburgh', lat: 55.9533, lng: -3.1883, tz: 0 },
        ],
    },
    {
        id: 'AU',
        name: 'ออสเตรเลีย',
        nameEn: 'Australia',
        cities: [
            { name: 'ซิดนีย์', nameEn: 'Sydney', lat: -33.8688, lng: 151.2093, tz: 600 },
            { name: 'เมลเบิร์น', nameEn: 'Melbourne', lat: -37.8136, lng: 144.9631, tz: 600 },
            { name: 'บริสเบน', nameEn: 'Brisbane', lat: -27.4698, lng: 153.0251, tz: 600 },
            { name: 'เพิร์ท', nameEn: 'Perth', lat: -31.9505, lng: 115.8605, tz: 480 },
        ],
    },
    {
        id: 'SG',
        name: 'สิงคโปร์',
        nameEn: 'Singapore',
        cities: [
            { name: 'สิงคโปร์', nameEn: 'Singapore', lat: 1.3521, lng: 103.8198, tz: 480 },
        ]
    },
    {
        id: 'JP',
        name: 'ญี่ปุ่น',
        nameEn: 'Japan',
        cities: [
            { name: 'โตเกียว', nameEn: 'Tokyo', lat: 35.6762, lng: 139.6503, tz: 540 },
            { name: 'โอซาก้า', nameEn: 'Osaka', lat: 34.6937, lng: 135.5023, tz: 540 },
            { name: 'เกียวโต', nameEn: 'Kyoto', lat: 35.0116, lng: 135.7681, tz: 540 },
        ]
    },
    {
        id: 'MY',
        name: 'มาเลเซีย',
        nameEn: 'Malaysia',
        cities: [
            { name: 'กัวลาลัมเปอร์', nameEn: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, tz: 480 },
            { name: 'ปีนัง', nameEn: 'Penang', lat: 5.4141, lng: 100.3288, tz: 480 },
        ]
    }
];

export const DEFAULT_LOCATION: LocationData = COUNTRIES[0].cities[0];
