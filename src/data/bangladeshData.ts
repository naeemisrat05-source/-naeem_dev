export interface DivisionData {
  id: string;
  name: string;
  nameBn: string;
  districts: {
    id: string;
    name: string;
    nameBn: string;
    upazilas: { id: string; name: string; nameBn: string }[];
  }[];
}

export const bangladeshDivisions: DivisionData[] = [
  {
    id: 'dhaka',
    name: 'Dhaka',
    nameBn: 'ঢাকা',
    districts: [
      {
        id: 'dhaka_city',
        name: 'Dhaka (City & Suburbs)',
        nameBn: 'ঢাকা (সিটি ও সংলগ্ন)',
        upazilas: [
          { id: 'dhanmondi', name: 'Dhanmondi', nameBn: 'ধানমন্ডি' },
          { id: 'gulshan', name: 'Gulshan & Banani', nameBn: 'গুলশান ও বনানী' },
          { id: 'uttara', name: 'Uttara', nameBn: 'উত্তরা' },
          { id: 'mirpur', name: 'Mirpur', nameBn: 'মিরপুর' },
          { id: 'mohammadpur', name: 'Mohammadpur', nameBn: 'মোহাম্মদপুর' },
          { id: 'motijheel', name: 'Motijheel & Paltan', nameBn: 'মতিঝিল ও পল্টন' },
          { id: 'old_dhaka', name: 'Old Dhaka (Puran Dhaka)', nameBn: 'পুরান ঢাকা' },
          { id: 'badda', name: 'Badda & Rampura', nameBn: 'বাড্ডা ও রামপুরা' },
          { id: 'savar', name: 'Savar', nameBn: 'সাভার' },
          { id: 'keraniganj', name: 'Keraniganj', nameBn: 'কেরানীগঞ্জ' },
        ],
      },
      {
        id: 'gazipur',
        name: 'Gazipur',
        nameBn: 'গাজীপুর',
        upazilas: [
          { id: 'gazipur_sadar', name: 'Gazipur Sadar', nameBn: 'গাজীপুর সদর' },
          { id: 'tongi', name: 'Tongi', nameBn: 'টঙ্গী' },
          { id: 'sreepur', name: 'Sreepur', nameBn: 'শ্রীপুর' },
          { id: 'kaliakair', name: 'Kaliakair', nameBn: 'কালিয়াকৈর' },
        ],
      },
      {
        id: 'narayanganj',
        name: 'Narayanganj',
        nameBn: 'নারায়ণগঞ্জ',
        upazilas: [
          { id: 'narayanganj_sadar', name: 'Narayanganj Sadar', nameBn: 'নারায়ণগঞ্জ সদর' },
          { id: 'rupganj', name: 'Rupganj', nameBn: 'রূপগঞ্জ' },
          { id: 'sonargaon', name: 'Sonargaon', nameBn: 'সোনারগাঁও' },
        ],
      },
      {
        id: 'tangail',
        name: 'Tangail',
        nameBn: 'টাঙ্গাইল',
        upazilas: [
          { id: 'tangail_sadar', name: 'Tangail Sadar', nameBn: 'টাঙ্গাইল সদর' },
          { id: 'delduar', name: 'Delduar', nameBn: 'দেলদুয়ার' },
        ],
      },
    ],
  },
  {
    id: 'chattogram',
    name: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    districts: [
      {
        id: 'ctg_city',
        name: 'Chattogram City',
        nameBn: 'চট্টগ্রাম মেট্রো',
        upazilas: [
          { id: 'panchlaish', name: 'Panchlaish', nameBn: 'পাঁচলাইশ' },
          { id: 'kotwali_ctg', name: 'Kotwali', nameBn: 'কোতোয়ালি' },
          { id: 'agrabad', name: 'Agrabad', nameBn: 'আগ্রাবাদ' },
          { id: 'halishahar', name: 'Halishahar', nameBn: 'হালিশহর' },
        ],
      },
      {
        id: 'coxsbazar',
        name: "Cox's Bazar",
        nameBn: 'কক্সবাজার',
        upazilas: [
          { id: 'coxs_sadar', name: "Cox's Bazar Sadar", nameBn: 'কক্সবাজার সদর' },
          { id: 'chakaria', name: 'Chakaria', nameBn: 'চকরিয়া' },
          { id: 'teknaf', name: 'Teknaf', nameBn: 'টেকনাফ' },
        ],
      },
      {
        id: 'cumilla',
        name: 'Cumilla',
        nameBn: 'কুমিল্লা',
        upazilas: [
          { id: 'cumilla_sadar', name: 'Cumilla Sadar', nameBn: 'কুমিল্লা সদর' },
          { id: 'daudkandi', name: 'Daudkandi', nameBn: 'দাউদকান্দি' },
        ],
      },
    ],
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    nameBn: 'সিলেট',
    districts: [
      {
        id: 'sylhet_sadar_dist',
        name: 'Sylhet',
        nameBn: 'সিলেট',
        upazilas: [
          { id: 'sylhet_sadar', name: 'Sylhet Sadar', nameBn: 'সিলেট সদর' },
          { id: 'golapganj', name: 'Golapganj', nameBn: 'গোলাপগঞ্জ' },
          { id: 'beanibazar', name: 'Beanibazar', nameBn: 'বিয়ানীবাজার' },
        ],
      },
      {
        id: 'moulvibazar',
        name: 'Moulvibazar (Sreemangal)',
        nameBn: 'মৌলভীবাজার (শ্রীমঙ্গল)',
        upazilas: [
          { id: 'sreemangal', name: 'Sreemangal', nameBn: 'শ্রীমঙ্গল' },
          { id: 'moulvibazar_sadar', name: 'Moulvibazar Sadar', nameBn: 'মৌলভীবাজার সদর' },
        ],
      },
    ],
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    nameBn: 'রাজশাহী',
    districts: [
      {
        id: 'rajshahi_dist',
        name: 'Rajshahi',
        nameBn: 'রাজশাহী',
        upazilas: [
          { id: 'boalia', name: 'Boalia', nameBn: 'বোয়ালিয়া' },
          { id: 'rajpara', name: 'Rajpara', nameBn: 'রাজপাড়া' },
          { id: 'motihar', name: 'Motihar', nameBn: 'মতিহার' },
        ],
      },
      {
        id: 'bogura',
        name: 'Bogura',
        nameBn: 'বগুড়া',
        upazilas: [
          { id: 'bogura_sadar', name: 'Bogura Sadar', nameBn: 'বগুড়া সদর' },
          { id: 'sherpur', name: 'Sherpur', nameBn: 'শেরপুর' },
        ],
      },
    ],
  },
  {
    id: 'khulna',
    name: 'Khulna',
    nameBn: 'খুলনা',
    districts: [
      {
        id: 'khulna_dist',
        name: 'Khulna',
        nameBn: 'খুলনা',
        upazilas: [
          { id: 'khulna_sadar', name: 'Khulna Sadar', nameBn: 'খুলনা সদর' },
          { id: 'sonadanga', name: 'Sonadanga', nameBn: 'সোনাডাঙ্গা' },
          { id: 'khalishpur', name: 'Khalishpur', nameBn: 'খালিশপুর' },
        ],
      },
      {
        id: 'jashore',
        name: 'Jashore',
        nameBn: 'যশোর',
        upazilas: [
          { id: 'jashore_sadar', name: 'Jashore Sadar', nameBn: 'যশোর সদর' },
        ],
      },
    ],
  },
  {
    id: 'barishal',
    name: 'Barishal',
    nameBn: 'বরিশাল',
    districts: [
      {
        id: 'barishal_dist',
        name: 'Barishal',
        nameBn: 'বরিশাল',
        upazilas: [
          { id: 'barishal_sadar', name: 'Barishal Sadar (Kotwali)', nameBn: 'বরিশাল সদর' },
        ],
      },
    ],
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    nameBn: 'রংপুর',
    districts: [
      {
        id: 'rangpur_dist',
        name: 'Rangpur',
        nameBn: 'রংপুর',
        upazilas: [
          { id: 'rangpur_sadar', name: 'Rangpur Sadar', nameBn: 'রংপুর সদর' },
        ],
      },
    ],
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    districts: [
      {
        id: 'mymensingh_dist',
        name: 'Mymensingh',
        nameBn: 'ময়মনসিংহ',
        upazilas: [
          { id: 'mymensingh_sadar', name: 'Mymensingh Sadar', nameBn: 'ময়মনসিংহ সদর' },
        ],
      },
    ],
  },
];

export const getDistrictsByDivision = (divisionNameOrId: string): string[] => {
  const div = bangladeshDivisions.find(
    (d) =>
      d.id.toLowerCase() === divisionNameOrId.toLowerCase() ||
      d.name.toLowerCase() === divisionNameOrId.toLowerCase() ||
      d.nameBn === divisionNameOrId
  );
  if (!div) {
    return ['Dhaka (City & Suburbs)', 'Gazipur', 'Narayanganj'];
  }
  return div.districts.map((dst) => dst.name);
};

export const getUpazilasByDistrict = (districtNameOrId: string): string[] => {
  for (const div of bangladeshDivisions) {
    const dst = div.districts.find(
      (d) =>
        d.id.toLowerCase() === districtNameOrId.toLowerCase() ||
        d.name.toLowerCase() === districtNameOrId.toLowerCase() ||
        d.nameBn === districtNameOrId
    );
    if (dst) {
      return dst.upazilas.map((u) => u.name);
    }
  }
  return [];
};
