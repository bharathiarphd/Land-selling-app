export interface TalukData {
  code: string;
  name: string;
  nameTa?: string;
}

export interface DistrictData {
  code: string;
  name: string;
  nameTa: string;
  taluks: TalukData[];
}

export const TAMIL_NADU_DISTRICTS: DistrictData[] = [
  {
    code: '01',
    name: 'Tiruvallur',
    nameTa: 'திருவள்ளூர்',
    taluks: [
      { code: '01', name: 'Tiruvallur' },
      { code: '02', name: 'Avadi' },
      { code: '03', name: 'Ponneri' },
      { code: '04', name: 'Gummidipoondi' },
      { code: '05', name: 'Tiruttani' },
      { code: '06', name: 'Pallipattu' },
      { code: '07', name: 'Uthukkottai' },
      { code: '08', name: 'Poonamallee' }
    ]
  },
  {
    code: '02',
    name: 'Chennai',
    nameTa: 'சென்னை',
    taluks: [
      { code: '01', name: 'Alandur' },
      { code: '02', name: 'Ambattur' },
      { code: '03', name: 'Egmore' },
      { code: '04', name: 'Mylapore' },
      { code: '05', name: 'Purasawalkam' },
      { code: '06', name: 'Guindy' },
      { code: '07', name: 'Aminjikarai' },
      { code: '08', name: 'Ayanavaram' },
      { code: '09', name: 'Mambalam' },
      { code: '10', name: 'Perambur' },
      { code: '11', name: 'Tondiarpet' },
      { code: '12', name: 'Velachery' }
    ]
  },
  {
    code: '03',
    name: 'Kancheepuram',
    nameTa: 'காஞ்சிபுரம்',
    taluks: [
      { code: '01', name: 'Kancheepuram' },
      { code: '02', name: 'Sriperumbudur' },
      { code: '03', name: 'Uthiramerur' },
      { code: '04', name: 'Walajabad' },
      { code: '05', name: 'Kundrathur' }
    ]
  },
  {
    code: '04',
    name: 'Vellore',
    nameTa: 'வேலூர்',
    taluks: [
      { code: '01', name: 'Vellore' },
      { code: '02', name: 'Katpadi' },
      { code: '03', name: 'Gudiyatham' },
      { code: '04', name: 'Pernambut' },
      { code: '05', name: 'Anaicut' }
    ]
  },
  {
    code: '05',
    name: 'Dharmapuri',
    nameTa: 'தர்மபுரி',
    taluks: [
      { code: '01', name: 'Dharmapuri' },
      { code: '02', name: 'Harur' },
      { code: '03', name: 'Palacode' },
      { code: '04', name: 'Pappireddipatti' },
      { code: '05', name: 'Pennagaram' },
      { code: '06', name: 'Nallampalli' },
      { code: '07', name: 'Karimangalam' }
    ]
  },
  {
    code: '06',
    name: 'Tiruvannamalai',
    nameTa: 'திருவண்ணாமலை',
    taluks: [
      { code: '01', name: 'Tiruvannamalai' },
      { code: '02', name: 'Arani' },
      { code: '03', name: 'Chengam' },
      { code: '04', name: 'Cheyyar' },
      { code: '05', name: 'Polur' },
      { code: '06', name: 'Vandavasi' },
      { code: '07', name: 'Kalasapakkam' },
      { code: '08', name: 'Chetpet' },
      { code: '09', name: 'Javaradhu Hills' },
      { code: '10', name: 'Kilpennathur' },
      { code: '11', name: 'Vembakkam' }
    ]
  },
  {
    code: '07',
    name: 'Villupuram',
    nameTa: 'விழுப்புரம்',
    taluks: [
      { code: '01', name: 'Villupuram' },
      { code: '02', name: 'Tindivanam' },
      { code: '03', name: 'Gingee' },
      { code: '04', name: 'Vanur' },
      { code: '05', name: 'Vikravandi' },
      { code: '06', name: 'Marakkanam' },
      { code: '07', name: 'Kandachipuram' },
      { code: '08', name: 'Thiruvennainallur' }
    ]
  },
  {
    code: '08',
    name: 'Salem',
    nameTa: 'சேலம்',
    taluks: [
      { code: '01', name: 'Salem' },
      { code: '02', name: 'Attur' },
      { code: '03', name: 'Edappadi' },
      { code: '04', name: 'Mettur' },
      { code: '05', name: 'Omalur' },
      { code: '06', name: 'Sankari' },
      { code: '07', name: 'Vazhapadi' },
      { code: '08', name: 'Yercaud' },
      { code: '09', name: 'Kadayampatti' }
    ]
  },
  {
    code: '09',
    name: 'Namakkal',
    nameTa: 'நாமக்கல்',
    taluks: [
      { code: '01', name: 'Namakkal' },
      { code: '02', name: 'Rasipuram' },
      { code: '03', name: 'Tiruchengode' },
      { code: '04', name: 'Paramathi Velur' },
      { code: '05', name: 'Sendamangalam' },
      { code: '06', name: 'Kumarapalayam' },
      { code: '07', name: 'Mohanur' }
    ]
  },
  {
    code: '10',
    name: 'Erode',
    nameTa: 'ஈரோடு',
    taluks: [
      { code: '01', name: 'Erode' },
      { code: '02', name: 'Bhavani' },
      { code: '03', name: 'Gobichettipalayam' },
      { code: '04', name: 'Perundurai' },
      { code: '05', name: 'Sathyamangalam' },
      { code: '06', name: 'Anthiyur' },
      { code: '07', name: 'Kodumudi' },
      { code: '08', name: 'Thalavadi' }
    ]
  },
  {
    code: '11',
    name: 'Nilgiris',
    nameTa: 'நீலகிரி',
    taluks: [
      { code: '01', name: 'Udhagamandalam' },
      { code: '02', name: 'Coonoor' },
      { code: '03', name: 'Kotagiri' },
      { code: '04', name: 'Gudalur' },
      { code: '05', name: 'Kundah' },
      { code: '06', name: 'Pandalur' }
    ]
  },
  {
    code: '12',
    name: 'Coimbatore',
    nameTa: 'கோயம்புத்தூர்',
    taluks: [
      { code: '01', name: 'Coimbatore North' },
      { code: '02', name: 'Coimbatore South' },
      { code: '03', name: 'Pollachi' },
      { code: '04', name: 'Mettupalayam' },
      { code: '05', name: 'Sulur' },
      { code: '06', name: 'Valparai' },
      { code: '07', name: 'Annur' },
      { code: '08', name: 'Kinathukadavu' },
      { code: '09', name: 'Madukkarai' },
      { code: '10', name: 'Perur' }
    ]
  },
  {
    code: '13',
    name: 'Dindigul',
    nameTa: 'திண்டுக்கல்',
    taluks: [
      { code: '01', name: 'Dindigul West' },
      { code: '02', name: 'Dindigul East' },
      { code: '03', name: 'Palani' },
      { code: '04', name: 'Kodaikanal' },
      { code: '05', name: 'Oddanchatram' },
      { code: '06', name: 'Vedasandur' },
      { code: '07', name: 'Natham' },
      { code: '08', name: 'Nilakottai' },
      { code: '09', name: 'Attoor' }
    ]
  },
  {
    code: '14',
    name: 'Karur',
    nameTa: 'கரூர்',
    taluks: [
      { code: '01', name: 'Karur' },
      { code: '02', name: 'Kulithalai' },
      { code: '03', name: 'Manmangalam' },
      { code: '04', name: 'Aravakurichi' },
      { code: '05', name: 'K.Paramathi' },
      { code: '06', name: 'Krishnarayapuram' },
      { code: '07', name: 'Kadavur' }
    ]
  },
  {
    code: '15',
    name: 'Tiruchirappalli',
    nameTa: 'திருச்சிராப்பள்ளி',
    taluks: [
      { code: '01', name: 'Trichy West' },
      { code: '02', name: 'Trichy East' },
      { code: '03', name: 'Lalgudi' },
      { code: '04', name: 'Manapparai' },
      { code: '05', name: 'Musiri' },
      { code: '06', name: 'Thuraiyur' },
      { code: '07', name: 'Tiruverumbur' },
      { code: '08', name: 'Srirangam' }
    ]
  },
  {
    code: '16',
    name: 'Perambalur',
    nameTa: 'பெரம்பலூர்',
    taluks: [
      { code: '01', name: 'Perambalur' },
      { code: '02', name: 'Kunnam' },
      { code: '03', name: 'Alathur' },
      { code: '04', name: 'Veppanthattai' }
    ]
  },
  {
    code: '17',
    name: 'Ariyalur',
    nameTa: 'அரியலூர்',
    taluks: [
      { code: '01', name: 'Ariyalur' },
      { code: '02', name: 'Udayarpalayam' },
      { code: '03', name: 'Sendurai' },
      { code: '04', name: 'Andimadam' }
    ]
  },
  {
    code: '18',
    name: 'Cuddalore',
    nameTa: 'கடலூர்',
    taluks: [
      { code: '01', name: 'Cuddalore' },
      { code: '02', name: 'Chidambaram' },
      { code: '03', name: 'Panruti' },
      { code: '04', name: 'Vridhachalam' },
      { code: '05', name: 'Kurinjipadi' },
      { code: '06', name: 'Kattumannarkoil' },
      { code: '07', name: 'Tittakudi' },
      { code: '08', name: 'Srimushnam' }
    ]
  },
  {
    code: '19',
    name: 'Nagapattinam',
    nameTa: 'நாகப்பட்டினம்',
    taluks: [
      { code: '01', name: 'Nagapattinam' },
      { code: '02', name: 'Kilvelur' },
      { code: '03', name: 'Thirukkuvalai' },
      { code: '04', name: 'Vedaranyam' }
    ]
  },
  {
    code: '20',
    name: 'Thiruvarur',
    nameTa: 'திருவாரூர்',
    taluks: [
      { code: '01', name: 'Thiruvarur' },
      { code: '02', name: 'Mannargudi' },
      { code: '03', name: 'Thiruthuraipoondi' },
      { code: '04', name: 'Nannilam' },
      { code: '05', name: 'Kudavasal' },
      { code: '06', name: 'Needamangalam' },
      { code: '07', name: 'Valangaiman' }
    ]
  },
  {
    code: '21',
    name: 'Thanjavur',
    nameTa: 'தஞ்சாவூர்',
    taluks: [
      { code: '01', name: 'Thanjavur' },
      { code: '02', name: 'Kumbakonam' },
      { code: '03', name: 'Pattukkottai' },
      { code: '04', name: 'Orathanadu' },
      { code: '05', name: 'Papanasam' },
      { code: '06', name: 'Peravurani' },
      { code: '07', name: 'Thiruvaiyaru' },
      { code: '08', name: 'Thiruvidaimarudur' },
      { code: '09', name: 'Budalur' }
    ]
  },
  {
    code: '22',
    name: 'Pudukkottai',
    nameTa: 'புதுக்கோட்டை',
    taluks: [
      { code: '01', name: 'Pudukkottai' },
      { code: '02', name: 'Alangudi' },
      { code: '03', name: 'Aranthangi' },
      { code: '04', name: 'Illuppur' },
      { code: '05', name: 'Karambakudi' },
      { code: '06', name: 'Kulathur' },
      { code: '07', name: 'Gandarvakottai' },
      { code: '08', name: 'Thirumayam' }
    ]
  },
  {
    code: '23',
    name: 'Sivaganga',
    nameTa: 'சிவகங்கை',
    taluks: [
      { code: '01', name: 'Sivaganga' },
      { code: '02', name: 'Karaikudi' },
      { code: '03', name: 'Devakottai' },
      { code: '04', name: 'Manamadurai' },
      { code: '05', name: 'Ilayangudi' },
      { code: '06', name: 'Kalayarkoil' },
      { code: '07', name: 'Tirupathur' },
      { code: '08', name: 'Singampunari' }
    ]
  },
  {
    code: '24',
    name: 'Madurai',
    nameTa: 'மதுரை',
    taluks: [
      { code: '01', name: 'Madurai North' },
      { code: '02', name: 'Madurai South' },
      { code: '03', name: 'Melur' },
      { code: '04', name: 'Thirumangalam' },
      { code: '05', name: 'Usilampatti' },
      { code: '06', name: 'Vadipatti' },
      { code: '07', name: 'Peraiyur' },
      { code: '08', name: 'Madurai East' },
      { code: '09', name: 'Madurai West' },
      { code: '10', name: 'Tirupparankundram' },
      { code: '11', name: 'Kallikudi' }
    ]
  },
  {
    code: '25',
    name: 'Theni',
    nameTa: 'தேனி',
    taluks: [
      { code: '01', name: 'Theni' },
      { code: '02', name: 'Bodinayakanur' },
      { code: '03', name: 'Periyakulam' },
      { code: '04', name: 'Uthamapalayam' },
      { code: '05', name: 'Andipatti' }
    ]
  },
  {
    code: '26',
    name: 'Virudhunagar',
    nameTa: 'விருதுநகர்',
    taluks: [
      { code: '01', name: 'Virudhunagar' },
      { code: '02', name: 'Aruppukkottai' },
      { code: '03', name: 'Rajapalayam' },
      { code: '04', name: 'Srivilliputhur' },
      { code: '05', name: 'Sattur' },
      { code: '06', name: 'Sivakasi' },
      { code: '07', name: 'Tiruchuli' },
      { code: '08', name: 'Kariapatti' }
    ]
  },
  {
    code: '27',
    name: 'Ramanathapuram',
    nameTa: 'இராமநாதபுரம்',
    taluks: [
      { code: '01', name: 'Ramanathapuram' },
      { code: '02', name: 'Rameswaram' },
      { code: '03', name: 'Paramakudi' },
      { code: '04', name: 'Tiruvadanai' },
      { code: '05', name: 'Mudukulathur' },
      { code: '06', name: 'Kamuthi' },
      { code: '07', name: 'Kadaladi' },
      { code: '08', name: 'Keelakarai' }
    ]
  },
  {
    code: '28',
    name: 'Thoothukkudi',
    nameTa: 'தூத்துக்குடி',
    taluks: [
      { code: '01', name: 'Thoothukkudi' },
      { code: '02', name: 'Kovilpatti' },
      { code: '03', name: 'Tiruchendur' },
      { code: '04', name: 'Ettayapuram' },
      { code: '05', name: 'Vilathikulam' },
      { code: '06', name: 'Ottapidaram' },
      { code: '07', name: 'Srivaikuntam' },
      { code: '08', name: 'Sathankulam' },
      { code: '09', name: 'Kayathar' }
    ]
  },
  {
    code: '29',
    name: 'Tirunelveli',
    nameTa: 'திருநெல்வேலி',
    taluks: [
      { code: '01', name: 'Tirunelveli' },
      { code: '02', name: 'Ambasamudram' },
      { code: '03', name: 'Palayamkottai' },
      { code: '04', name: 'Nanguneri' },
      { code: '05', name: 'Radhapuram' },
      { code: '06', name: 'Cheranmahadevi' },
      { code: '07', name: 'Manur' },
      { code: '08', name: 'Tisayanvilai' }
    ]
  },
  {
    code: '30',
    name: 'Kanniyakumari',
    nameTa: 'கன்னியாகுமரி',
    taluks: [
      { code: '01', name: 'Agasteeswaram' },
      { code: '02', name: 'Kalkulam' },
      { code: '03', name: 'Thovalai' },
      { code: '04', name: 'Vilavancode' },
      { code: '05', name: 'Killiyoor' },
      { code: '06', name: 'Thiruvattar' }
    ]
  },
  {
    code: '31',
    name: 'Krishnagiri',
    nameTa: 'கிருஷ்ணகிரி',
    taluks: [
      { code: '01', name: 'Krishnagiri' },
      { code: '02', name: 'Hosur' },
      { code: '03', name: 'Denkanikottai' },
      { code: '04', name: 'Pochampalli' },
      { code: '05', name: 'Uthangarai' },
      { code: '06', name: 'Shoolagiri' },
      { code: '07', name: 'Anchetty' }
    ]
  },
  {
    code: '32',
    name: 'Tiruppur',
    nameTa: 'திருப்பூர்',
    taluks: [
      { code: '01', name: 'Tiruppur North' },
      { code: '02', name: 'Tiruppur South' },
      { code: '03', name: 'Avinashi' },
      { code: '04', name: 'Dharapuram' },
      { code: '05', name: 'Kangeyam' },
      { code: '06', name: 'Palladam' },
      { code: '07', name: 'Udumalpet' },
      { code: '08', name: 'Madathukulam' },
      { code: '09', name: 'Uthukuli' }
    ]
  },
  {
    code: '33',
    name: 'Tenkasi',
    nameTa: 'தென்காசி',
    taluks: [
      { code: '01', name: 'Tenkasi' },
      { code: '02', name: 'Sankarankovil' },
      { code: '03', name: 'Sengottai' },
      { code: '04', name: 'Kadayanallur' },
      { code: '05', name: 'Sivagiri' },
      { code: '06', name: 'Alangulam' },
      { code: '07', name: 'V.K.Pudur' },
      { code: '08', name: 'Thiruvenkatam' }
    ]
  },
  {
    code: '34',
    name: 'Kallakurichi',
    nameTa: 'கள்ளக்குறிச்சி',
    taluks: [
      { code: '01', name: 'Kallakurichi' },
      { code: '02', name: 'Sankarapuram' },
      { code: '03', name: 'Chinna Salem' },
      { code: '04', name: 'Ulundurpet' },
      { code: '05', name: 'Tirukkoilur' },
      { code: '06', name: 'Kalvarayan Hills' }
    ]
  },
  {
    code: '35',
    name: 'Chengalpattu',
    nameTa: 'செங்கல்பட்டு',
    taluks: [
      { code: '01', name: 'Chengalpattu' },
      { code: '02', name: 'Tambaram' },
      { code: '03', name: 'Pallavaram' },
      { code: '04', name: 'Maduranthakam' },
      { code: '05', name: 'Cheyyur' },
      { code: '06', name: 'Thiruporur' },
      { code: '07', name: 'Vandalur' },
      { code: '08', name: 'Tirukalukundram' }
    ]
  },
  {
    code: '36',
    name: 'Ranipet',
    nameTa: 'ராணிப்பேட்டை',
    taluks: [
      { code: '01', name: 'Ranipet' },
      { code: '02', name: 'Walajah' },
      { code: '03', name: 'Arcot' },
      { code: '04', name: 'Arakkonam' },
      { code: '05', name: 'Nemili' },
      { code: '06', name: 'Kalavai' }
    ]
  },
  {
    code: '37',
    name: 'Tirupathur',
    nameTa: 'திருப்பத்தூர்',
    taluks: [
      { code: '01', name: 'Tirupathur' },
      { code: '02', name: 'Vaniyambadi' },
      { code: '03', name: 'Ambur' },
      { code: '04', name: 'Natrampalli' }
    ]
  },
  {
    code: '38',
    name: 'Mayiladuthurai',
    nameTa: 'மயிலாடுதுறை',
    taluks: [
      { code: '01', name: 'Mayiladuthurai' },
      { code: '02', name: 'Sirkazhi' },
      { code: '03', name: 'Tharangambadi' },
      { code: '04', name: 'Kuthalam' }
    ]
  }
];

// Helper: Normalize English names for matching
const normalizeEn = (str?: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/\s+district$/i, '').replace(/\s+taluk$/i, '').replace(/[^a-z0-9]/g, '');
};

// Helper: Normalize Tamil text (preserves Unicode Tamil script)
const normalizeTa = (str?: string): string => {
  if (!str) return '';
  return str.trim().replace(/\s+/g, '');
};

const DISTRICT_ALIASES: Record<string, string> = {
  tiruvallur: '01',
  thiruvallur: '01',
  chennai: '02',
  madras: '02',
  kancheepuram: '03',
  kanchipuram: '03',
  vellore: '04',
  dharmapuri: '05',
  tiruvannamalai: '06',
  thiruvannamalai: '06',
  villupuram: '07',
  viluppuram: '07',
  salem: '08',
  namakkal: '09',
  erode: '10',
  nilgiris: '11',
  thenilgiris: '11',
  ooty: '11',
  udhagamandalam: '11',
  coimbatore: '12',
  dindigul: '13',
  karur: '14',
  tiruchirappalli: '15',
  thiruchirappalli: '15',
  trichy: '15',
  perambalur: '16',
  ariyalur: '17',
  cuddalore: '18',
  nagapattinam: '19',
  thiruvarur: '20',
  tiruvarur: '20',
  thanjavur: '21',
  tanjore: '21',
  pudukkottai: '22',
  pudukottai: '22',
  sivaganga: '23',
  sivagangai: '23',
  madurai: '24',
  theni: '25',
  virudhunagar: '26',
  ramanathapuram: '27',
  ramnad: '27',
  thoothukkudi: '28',
  thoothukudi: '28',
  tuticorin: '28',
  tirunelveli: '29',
  thirunelveli: '29',
  kanniyakumari: '30',
  kanyakumari: '30',
  krishnagiri: '31',
  tiruppur: '32',
  thiruppur: '32',
  tirupur: '32',
  tenkasi: '33',
  thenkasi: '33',
  kallakurichi: '34',
  kallakkurichi: '34',
  chengalpattu: '35',
  chengalpet: '35',
  ranipet: '36',
  ranipettai: '36',
  tirupathur: '37',
  tirupattur: '37',
  thirupattur: '37',
  mayiladuthurai: '38',
  mayiladurai: '38'
};

// Find district by code or name (English or Tamil)
export const findDistrict = (districtQuery?: string): DistrictData | undefined => {
  if (!districtQuery) return undefined;
  const q = districtQuery.trim();
  if (!q) return undefined;

  const qNorm = normalizeEn(q);
  const qTa = normalizeTa(q);

  // 1. Exact code or alias lookup first
  if (/^\d{1,2}$/.test(q)) {
    const padded = q.padStart(2, '0');
    const byCode = TAMIL_NADU_DISTRICTS.find(d => d.code === padded);
    if (byCode) return byCode;
  }

  if (qNorm && DISTRICT_ALIASES[qNorm]) {
    const aliasCode = DISTRICT_ALIASES[qNorm];
    const byAlias = TAMIL_NADU_DISTRICTS.find(d => d.code === aliasCode);
    if (byAlias) return byAlias;
  }

  // 2. Exact English or Tamil name match
  const exact = TAMIL_NADU_DISTRICTS.find(d =>
    (qNorm && normalizeEn(d.name) === qNorm) ||
    (qTa && normalizeTa(d.nameTa) === qTa)
  );
  if (exact) return exact;

  // 3. Partial substring match (only for meaningful queries >= 3 chars)
  if (qNorm.length >= 3) {
    const partial = TAMIL_NADU_DISTRICTS.find(d =>
      qNorm.includes(normalizeEn(d.name)) ||
      normalizeEn(d.name).includes(qNorm)
    );
    if (partial) return partial;
  }

  if (qTa.length >= 2) {
    return TAMIL_NADU_DISTRICTS.find(d =>
      qTa.includes(normalizeTa(d.nameTa)) ||
      normalizeTa(d.nameTa).includes(qTa)
    );
  }

  return undefined;
};

// Find taluk within a district by code or name
export const findTaluk = (district: DistrictData, talukQuery?: string): TalukData | undefined => {
  if (!talukQuery) return undefined;
  const q = talukQuery.trim();
  if (!q) return undefined;

  const qNorm = normalizeEn(q);
  const qTa = normalizeTa(q);

  // 1. Exact code lookup
  if (/^\d{1,2}$/.test(q)) {
    const padded = q.padStart(2, '0');
    const byCode = district.taluks.find(t => t.code === padded);
    if (byCode) return byCode;
  }

  // 2. Exact name lookup
  const exact = district.taluks.find(t =>
    (qNorm && normalizeEn(t.name) === qNorm) ||
    (t.nameTa && qTa && normalizeTa(t.nameTa) === qTa)
  );
  if (exact) return exact;

  // 3. Substring match for meaningful queries
  if (qNorm.length >= 3) {
    return district.taluks.find(t =>
      qNorm.includes(normalizeEn(t.name)) ||
      normalizeEn(t.name).includes(qNorm)
    );
  }

  return undefined;
};

/**
 * Computes or reserves an 8-digit official Property ID:
 * [2-digit District Code] + [2-digit Taluk Code] + [4-digit Property Sequence]
 * Example: District 01 (Tiruvallur), Taluk 02 (Avadi), Property 0001 => 01020001
 * Set reserveSequence = false for pure UI previews so sequence counters are not incremented during render.
 */
export const generateStandardPropertyId = (
  districtNameOrCode?: string,
  talukNameOrCode?: string,
  existingProperties?: Array<{ id: string }>,
  reserveSequence: boolean = true
): string => {
  let distCode = '01';
  let talukCode = '01';

  const matchedDist = findDistrict(districtNameOrCode);
  if (matchedDist) {
    distCode = matchedDist.code;
    const matchedTaluk = findTaluk(matchedDist, talukNameOrCode);
    if (matchedTaluk) {
      talukCode = matchedTaluk.code;
    }
  } else if (districtNameOrCode && /^\d{1,2}$/.test(districtNameOrCode.trim())) {
    distCode = districtNameOrCode.trim().padStart(2, '0');
    if (talukNameOrCode && /^\d{1,2}$/.test(talukNameOrCode.trim())) {
      talukCode = talukNameOrCode.trim().padStart(2, '0');
    }
  }

  const prefix = `${distCode}${talukCode}`;

  // Find highest existing 4-digit sequence with this 4-digit prefix
  let maxSeq = 0;
  if (Array.isArray(existingProperties)) {
    for (const p of existingProperties) {
      if (p && p.id && /^\d{8}$/.test(p.id) && p.id.startsWith(prefix)) {
        const seqPart = parseInt(p.id.substring(4, 8), 10);
        if (!isNaN(seqPart) && seqPart > maxSeq) {
          maxSeq = seqPart;
        }
      }
    }
  }

  // Check persistent sequence in localStorage
  const seqStorageKey = `land_app_seq_${prefix}`;
  let storedSeq = 0;
  try {
    const raw = localStorage.getItem(seqStorageKey);
    if (raw) storedSeq = parseInt(raw, 10) || 0;
  } catch (_) {}

  const nextSeq = Math.max(maxSeq, storedSeq) + 1;

  if (reserveSequence) {
    try {
      localStorage.setItem(seqStorageKey, String(nextSeq));
    } catch (_) {}
  }

  const seqStr = String(nextSeq).padStart(4, '0');
  return `${prefix}${seqStr}`;
};

export const previewStandardPropertyId = (
  districtNameOrCode?: string,
  talukNameOrCode?: string,
  existingProperties?: Array<{ id: string }>
): string => {
  return generateStandardPropertyId(districtNameOrCode, talukNameOrCode, existingProperties, false);
};
