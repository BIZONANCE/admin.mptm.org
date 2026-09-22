export interface LocationOption {
  mr: string;
  en: string;
}

export interface DistrictData {
  district: LocationOption;
  cities: LocationOption[];
}

export const MAHARASHTRA_DISTRICTS: DistrictData[] = [
  {
    district: { mr: "अमरावती", en: "Amravati" },
    cities: [
      { mr: "अमरावती", en: "Amravati" },
      { mr: "अचलपूर", en: "Achalpur" },
      { mr: "परतवाडा", en: "Paratwada" },
      { mr: "अंजनगाव सुर्जी", en: "Anjangaon Surji" },
      { mr: "चांदूर रेल्वे", en: "Chandur Railway" },
      { mr: "चांदूर बाजार", en: "Chandur Bazar" },
      { mr: "धामणगाव रेल्वे", en: "Dhamangaon Railway" },
      { mr: "धारणी", en: "Dharni" },
      { mr: "चिखलदरा", en: "Chikhaldara" },
      { mr: "मोर्शी", en: "Morshi" },
      { mr: "वरूड", en: "Warud" },
      { mr: "तिवसा", en: "Tiosa" },
      { mr: "नांदगाव खंडेश्वर", en: "Nandgaon Khandeshwar" },
      { mr: "भातकुली", en: "Bhatkuli" },
      { mr: "दर्यापूर", en: "Daryapur" },
      { mr: "शेंदुरजना घाट", en: "Shendurjana Ghat" },
    ],
  },
  {
    district: { mr: "अकोला", en: "Akola" },
    cities: [
      { mr: "अकोला", en: "Akola" },
      { mr: "अकोट", en: "Akot" },
      { mr: "तेल्हारा", en: "Telhara" },
      { mr: "बाळापूर", en: "Balapur" },
      { mr: "पातूर", en: "Patur" },
      { mr: "मूर्तिजापूर", en: "Murtizapur" },
      { mr: "बार्शीटाकळी", en: "Barshitakli" },
    ],
  },
  {
    district: { mr: "यवतमाळ", en: "Yavatmal" },
    cities: [
      { mr: "यवतमाळ", en: "Yavatmal" },
      { mr: "पुसद", en: "Pusad" },
      { mr: "वणी", en: "Wani" },
      { mr: "उमरखेड", en: "Umarkhed" },
      { mr: "दिग्रस", en: "Digras" },
      { mr: "आर्णी", en: "Arni" },
      { mr: "नेर", en: "Ner" },
      { mr: "दारव्हा", en: "Darwha" },
      { mr: "मारेगाव", en: "Maregaon" },
      { mr: "बाभुळगाव", en: "Babulgaon" },
      { mr: "कळंब", en: "Kalamb" },
      { mr: "घाटंजी", en: "Ghatanji" },
      { mr: "राळेगाव", en: "Ralegaon" },
      { mr: "पांढरकवडा", en: "Pandharkawada" },
      { mr: "महागाव", en: "Mahagaon" },
      { mr: "झरी जामणी", en: "Zari Jamani" },
    ],
  },
  {
    district: { mr: "बुलढाणा", en: "Buldhana" },
    cities: [
      { mr: "बुलढाणा", en: "Buldhana" },
      { mr: "खामगाव", en: "Khamgaon" },
      { mr: "शेगाव", en: "Shegaon" },
      { mr: "मलकापूर", en: "Malkapur" },
      { mr: "चिखली", en: "Chikhli" },
      { mr: "मेहकर", en: "Mehkar" },
      { mr: "देऊळगाव राजा", en: "Deulgaon Raja" },
      { mr: "जळगाव जामोद", en: "Jalgaon Jamod" },
      { mr: "नांदुरा", en: "Nandura" },
      { mr: "सिंदखेड राजा", en: "Sindkhed Raja" },
      { mr: "मोताळा", en: "Motala" },
      { mr: "संग्रामपूर", en: "Sangrampur" },
      { mr: "लोणार", en: "Lonar" },
    ],
  },
  {
    district: { mr: "वाशीम", en: "Washim" },
    cities: [
      { mr: "वाशीम", en: "Washim" },
      { mr: "कारंजा", en: "Karanja" },
      { mr: "मंगरूळपीर", en: "Mangrulpir" },
      { mr: "रिसोड", en: "Risod" },
      { mr: "मालेगाव", en: "Malegaon" },
      { mr: "मानोरा", en: "Manora" },
    ],
  },
  {
    district: { mr: "नागपूर", en: "Nagpur" },
    cities: [
      { mr: "नागपूर", en: "Nagpur" },
      { mr: "कामठी", en: "Kamthi" },
      { mr: "हिंगणा", en: "Hingna" },
      { mr: "उमरेड", en: "Umred" },
      { mr: "काटोल", en: "Katol" },
      { mr: "सावनेर", en: "Saoner" },
      { mr: "नरखेड", en: "Narkhed" },
      { mr: "कळमेश्वर", en: "Kalmeshwar" },
      { mr: "रामटेक", en: "Ramtek" },
      { mr: "पारशिवनी", en: "Parsioni" },
      { mr: "मौदा", en: "Mauda" },
      { mr: "कुही", en: "Kuhi" },
      { mr: "भिवापूर", en: "Bhiwapur" },
    ],
  },
  {
    district: { mr: "वर्धा", en: "Wardha" },
    cities: [
      { mr: "वर्धा", en: "Wardha" },
      { mr: "हिंगणघाट", en: "Hinganghat" },
      { mr: "आर्वी", en: "Arvi" },
      { mr: "देवळी", en: "Deoli" },
      { mr: "कारंजा घाडगे", en: "Karanja Ghadge" },
      { mr: "आष्टी", en: "Ashti" },
      { mr: "सेलू", en: "Seloo" },
      { mr: "समुद्रपूर", en: "Samudrapur" },
    ],
  },
  {
    district: { mr: "चंद्रपूर", en: "Chandrapur" },
    cities: [
      { mr: "चंद्रपूर", en: "Chandrapur" },
      { mr: "वरोरा", en: "Warora" },
      { mr: "भद्रावती", en: "Bhadravati" },
      { mr: "चिमूर", en: "Chimur" },
      { mr: "बल्लारपूर", en: "Ballarpur" },
      { mr: "मूल", en: "Mul" },
      { mr: "राजुरा", en: "Rajura" },
      { mr: "ब्रह्मपुरी", en: "Brahmapuri" },
      { mr: "नागभीड", en: "Nagbhid" },
    ],
  },
  {
    district: { mr: "गडचिरोली", en: "Gadchiroli" },
    cities: [
      { mr: "गडचिरोली", en: "Gadchiroli" },
      { mr: "अहेरी", en: "Aheri" },
      { mr: "आरमोरी", en: "Armori" },
      { mr: "चामोर्शी", en: "Chamorshi" },
      { mr: "कुरखेडा", en: "Kurkheda" },
      { mr: "वडसा (देसाईगंज)", en: "Wadsa (Desaiganj)" },
    ],
  },
  {
    district: { mr: "भंडारा", en: "Bhandara" },
    cities: [
      { mr: "भंडारा", en: "Bhandara" },
      { mr: "साकोली", en: "Sakoli" },
      { mr: "तुमसर", en: "Tumsar" },
      { mr: "पवनी", en: "Pauni" },
      { mr: "मोहाडी", en: "Mohadi" },
      { mr: "लाखनी", en: "Lakhani" },
      { mr: "लाखांदूर", en: "Lakhandur" },
    ],
  },
  {
    district: { mr: "गोंदिया", en: "Gondia" },
    cities: [
      { mr: "गोंदिया", en: "Gondia" },
      { mr: "तिरोडा", en: "Tiroda" },
      { mr: "गोरेगाव", en: "Goregaon" },
      { mr: "आमगाव", en: "Amgaon" },
      { mr: "सालेकसा", en: "Salekasa" },
      { mr: "देवरी", en: "Deori" },
      { mr: "सडक अर्जुनी", en: "Sadak Arjuni" },
      { mr: "अर्जुनी मोरगाव", en: "Arjuni Morgaon" },
    ],
  },
  {
    district: { mr: "छत्रपती संभाजीनगर", en: "Chhatrapati Sambhajinagar" },
    cities: [
      { mr: "छत्रपती संभाजीनगर (औरंगाबाद)", en: "Chhatrapati Sambhajinagar (Aurangabad)" },
      { mr: "वैजापूर", en: "Vaijapur" },
      { mr: "गंगापूर", en: "Gangapur" },
      { mr: "पैठण", en: "Paithan" },
      { mr: "कन्नड", en: "Kannad" },
      { mr: "सिल्लोड", en: "Sillod" },
      { mr: "सोयगाव", en: "Soegaon" },
      { mr: "खुलताबाद", en: "Khuldabad" },
      { mr: "फुलंब्री", en: "Phulambri" },
    ],
  },
  {
    district: { mr: "जालना", en: "Jalna" },
    cities: [
      { mr: "जालना", en: "Jalna" },
      { mr: "अंबड", en: "Ambad" },
      { mr: "भोकरदन", en: "Bhokardan" },
      { mr: "जाफराबाद", en: "Jafrabad" },
      { mr: "परतूर", en: "Partur" },
      { mr: "मंठा", en: "Mantha" },
      { mr: "बदनापूर", en: "Badnapur" },
      { mr: "घनसावंगी", en: "Ghansawangi" },
    ],
  },
  {
    district: { mr: "बीड", en: "Beed" },
    cities: [
      { mr: "बीड", en: "Beed" },
      { mr: "आंबेजोगाई", en: "Ambajogai" },
      { mr: "माजलगाव", en: "Majalgaon" },
      { mr: "परळी वैजनाथ", en: "Parli Vaijnath" },
      { mr: "गेवराई", en: "Georai" },
      { mr: "केज", en: "Kaij" },
      { mr: "वडवणी", en: "Wadwani" },
      { mr: "पाटोदा", en: "Patoda" },
      { mr: "शिरूर कासार", en: "Shirur Kasar" },
      { mr: "आष्टी", en: "Ashti" },
      { mr: "धारूर", en: "Dharur" },
    ],
  },
  {
    district: { mr: "नांदेड", en: "Nanded" },
    cities: [
      { mr: "नांदेड", en: "Nanded" },
      { mr: "लोहा", en: "Loha" },
      { mr: "कंधार", en: "Kandhar" },
      { mr: "किनवट", en: "Kinwat" },
      { mr: "भोकर", en: "Bhokar" },
      { mr: "बिलोली", en: "Biloli" },
      { mr: "देगलूर", en: "Degloor" },
      { mr: "मुखेड", en: "Mukhed" },
      { mr: "हदगाव", en: "Hadgaon" },
      { mr: "मुदखेड", en: "Mudkhed" },
      { mr: "नायगाव", en: "Naigaon" },
      { mr: "उमरी", en: "Umri" },
      { mr: "माहूर", en: "Mahoor" },
      { mr: "अर्धापूर", en: "Ardhapur" },
    ],
  },
  {
    district: { mr: "धाराशिव", en: "Dharashiv" },
    cities: [
      { mr: "धाराशिव (उस्मानाबाद)", en: "Dharashiv (Osmanabad)" },
      { mr: "तुळजापूर", en: "Tuljapur" },
      { mr: "उमरगा", en: "Umerga" },
      { mr: "कळंब", en: "Kalamb" },
      { mr: "परंडा", en: "Paranda" },
      { mr: "भूूम", en: "Bhum" },
      { mr: "वाशी", en: "Washi" },
      { mr: "लोहारा", en: "Lohara" },
    ],
  },
  {
    district: { mr: "लातूर", en: "Latur" },
    cities: [
      { mr: "लातूर", en: "Latur" },
      { mr: "उदगीर", en: "Udgir" },
      { mr: "अहमदपूर", en: "Ahmadpur" },
      { mr: "औसा", en: "Ausa" },
      { mr: "निलंगा", en: "Nilanga" },
      { mr: "रेणापूर", en: "Renapur" },
      { mr: "चाकूर", en: "Chakur" },
      { mr: "देवणी", en: "Deoni" },
      { mr: "शिरूर अनंतपाळ", en: "Shirur Anantpal" },
      { mr: "जळकोट", en: "Jalkot" },
    ],
  },
  {
    district: { mr: "परभणी", en: "Parbhani" },
    cities: [
      { mr: "परभणी", en: "Parbhani" },
      { mr: "गंगाखेड", en: "Gangakhed" },
      { mr: "सेलू", en: "Sailu" },
      { mr: "जिंतूर", en: "Jintur" },
      { mr: "मानवत", en: "Manwath" },
      { mr: "पाथरी", en: "Pathri" },
      { mr: "पूर्णा", en: "Purna" },
      { mr: "पालम", en: "Palam" },
      { mr: "सोनपेठ", en: "Sonpeth" },
    ],
  },
  {
    district: { mr: "हिंगोली", en: "Hingoli" },
    cities: [
      { mr: "हिंगोली", en: "Hingoli" },
      { mr: "कलमनुरी", en: "Kalamnuri" },
      { mr: "वसमत", en: "Basmath" },
      { mr: "औंढा नागनाथ", en: "Aundha Nagnath" },
      { mr: "सेनगाव", en: "Sengaon" },
    ],
  },
  {
    district: { mr: "पुणे", en: "Pune" },
    cities: [
      { mr: "पुणे", en: "Pune" },
      { mr: "पिंपरी चिंचवड", en: "Pimpri Chinchwad" },
      { mr: "बारामती", en: "Baramati" },
      { mr: "इंदापूर", en: "Indapur" },
      { mr: "दौंड", en: "Daund" },
      { mr: "शिरूर", en: "Shirur" },
      { mr: "जुन्नर", en: "Junnar" },
      { mr: "खेड (राजगुरुनगर)", en: "Khed (Rajgurunagar)" },
      { mr: "आंबेगाव (घोडेगाव)", en: "Ambegaon (Ghodegaon)" },
      { mr: "मावळ (वडगाव)", en: "Maval (Vadgaon)" },
      { mr: "मुळशी (पौड)", en: "Mulshi (Paud)" },
      { mr: "हवेली", en: "Haveli" },
      { mr: "पुरंदर (सासवड)", en: "Purandar (Saswad)" },
      { mr: "भोर", en: "Bhor" },
      { mr: "वेल्हे", en: "Velhe" },
    ],
  },
  {
    district: { mr: "नाशिक", en: "Nashik" },
    cities: [
      { mr: "नाशिक", en: "Nashik" },
      { mr: "मालेगाव", en: "Malegaon" },
      { mr: "सिन्नर", en: "Sinnar" },
      { mr: "इगतपुरी", en: "Igatpuri" },
      { mr: "निफाड", en: "Niphad" },
      { mr: "येवला", en: "Yeola" },
      { mr: "नांदगाव", en: "Nandgaon" },
      { mr: "चांदवड", en: "Chandwad" },
      { mr: "कलवण", en: "Kalwan" },
      { mr: "सटाणा (बागलाण)", en: "Satana (Baglan)" },
      { mr: "दिंडोरी", en: "Dindori" },
      { mr: "सुरगाणा", en: "Surgana" },
      { mr: "पेठ", en: "Peth" },
      { mr: "त्र्यंबकेश्वर", en: "Trimbakeshwar" },
      { mr: "देवळा", en: "Deola" },
    ],
  },
  {
    district: { mr: "ठाणे", en: "Thane" },
    cities: [
      { mr: "ठाणे", en: "Thane" },
      { mr: "कल्याण-डोंबिवली", en: "Kalyan-Dombivli" },
      { mr: "नवी मुंबई", en: "Navi Mumbai" },
      { mr: "मीरा-भाईंदर", en: "Mira-Bhayandar" },
      { mr: "भिवंडी", en: "Bhiwandi" },
      { mr: "उल्हासनगर", en: "Ulhasnagar" },
      { mr: "अंबरनाथ", en: "Ambernath" },
      { mr: "बदलापूर", en: "Badlapur" },
      { mr: "शहापूर", en: "Shahapur" },
      { mr: "मुरबाड", en: "Murbad" },
    ],
  },
  {
    district: { mr: "मुंबई", en: "Mumbai" },
    cities: [
      { mr: "मुंबई", en: "Mumbai" },
      { mr: "दादर", en: "Dadar" },
      { mr: "वांद्रे (Bandra)", en: "Bandra" },
      { mr: "अंधेरी", en: "Andheri" },
      { mr: "बोरीवली", en: "Borivali" },
      { mr: "घाटकोपर", en: "Ghatkopar" },
      { mr: "मुलुंड", en: "Mulund" },
      { mr: "कुर्ला", en: "Kurla" },
      { mr: "चेंबर", en: "Chembur" },
      { mr: "परळ", en: "Parel" },
    ],
  },
  {
    district: { mr: "सोलापूर", en: "Solapur" },
    cities: [
      { mr: "सोलापूर", en: "Solapur" },
      { mr: "पंढरपूर", en: "Pandharpur" },
      { mr: "बार्शी", en: "Barshi" },
      { mr: "अक्कलकोट", en: "Akkalkot" },
      { mr: "सांगोला", en: "Sangola" },
      { mr: "करमाळा", en: "Karmala" },
      { mr: "माढा", en: "Madha" },
      { mr: "मोहोळ", en: "Mohol" },
      { mr: "माळशिरस", en: "Malshiras" },
      { mr: "दक्षिण सोलापूर", en: "South Solapur" },
      { mr: "उत्तर सोलापूर", en: "North Solapur" },
    ],
  },
  {
    district: { mr: "कोल्हापूर", en: "Kolhapur" },
    cities: [
      { mr: "कोल्हापूर", en: "Kolhapur" },
      { mr: "इचलकरंजी", en: "Ichalkaranji" },
      { mr: "कागल", en: "Kagal" },
      { mr: "करवीर", en: "Karveer" },
      { mr: "शिरोळ", en: "Shirol" },
      { mr: "हातकणंगले", en: "Hatkanangale" },
      { mr: "राधानगरी", en: "Radhanagari" },
      { mr: "पन्हाळा", en: "Panhala" },
      { mr: "शाहूवाडी", en: "Shahuwadi" },
      { mr: "भुदरगड (गारगोटी)", en: "Bhudargad (Gargoti)" },
      { mr: "आजरा", en: "Ajara" },
      { mr: "गडहिंग्लज", en: "Gadhinglaj" },
      { mr: "चंदगड", en: "Chandgad" },
    ],
  },
  {
    district: { mr: "सांगली", en: "Sangli" },
    cities: [
      { mr: "सांगली", en: "Sangli" },
      { mr: "मिरज", en: "Miraj" },
      { mr: "कुपवाड", en: "Kupwad" },
      { mr: "इस्लामपूर (वाळवा)", en: "Islampur (Walwa)" },
      { mr: "विटा (खानापूर)", en: "Vita (Khanapur)" },
      { mr: "तासगाव", en: "Tasgaon" },
      { mr: "आटपाडी", en: "Atpadi" },
      { mr: "कवठे महांकाळ", en: "Kavathe Mahankal" },
      { mr: "जत", en: "Jath" },
      { mr: "शिराळा", en: "Shirala" },
      { mr: "पलूस", en: "Palus" },
      { mr: "कडेगाव", en: "Kadegaon" },
    ],
  },
  {
    district: { mr: "सातारा", en: "Satara" },
    cities: [
      { mr: "सातारा", en: "Satara" },
      { mr: "कराड", en: "Karad" },
      { mr: "फलटण", en: "Phaltan" },
      { mr: "वाई", en: "Wai" },
      { mr: "महाबळेश्वर", en: "Mahabaleshwar" },
      { mr: "कोरेगाव", en: "Koregaon" },
      { mr: "खटाव (वडूज)", en: "Khatav (Vaduj)" },
      { mr: "माण (दहीवडी)", en: "Man (Dahiwadi)" },
      { mr: "पाटण", en: "Patan" },
      { mr: "जावळी (मेढा)", en: "Jaoli (Medha)" },
      { mr: "खंडाळा", en: "Khandala" },
    ],
  },
  {
    district: { mr: "अहमदनगर", en: "Ahmednagar" },
    cities: [
      { mr: "अहिल्यानगर (अहमदनगर)", en: "Ahilyanagar (Ahmednagar)" },
      { mr: "संगमनेर", en: "Sangamner" },
      { mr: "शिर्डी (राहाता)", en: "Shirdi (Rahata)" },
      { mr: "कोपरगाव", en: "Kopargaon" },
      { mr: "श्रीरामपूर", en: "Shrirampur" },
      { mr: "नेवासा", en: "Nevasa" },
      { mr: "शेवगाव", en: "Shevgaon" },
      { mr: "पाथर्डी", en: "Pathardi" },
      { mr: "जामखेड", en: "Jamkhed" },
      { mr: "कर्जत", en: "Karjat" },
      { mr: "श्रीगोंदा", en: "Shrigonda" },
      { mr: "पारनेर", en: "Parner" },
      { mr: "अकोले", en: "Akole" },
      { mr: "राहुरी", en: "Rahuri" },
    ],
  },
  {
    district: { mr: "जळगाव", en: "Jalgaon" },
    cities: [
      { mr: "जळगाव", en: "Jalgaon" },
      { mr: "भुसावळ", en: "Bhusawal" },
      { mr: "अमळनेर", en: "Amalner" },
      { mr: "चाळीसगाव", en: "Chalisgaon" },
      { mr: "पाचोरा", en: "Pachora" },
      { mr: "जामनेर", en: "Jamner" },
      { mr: "यावल", en: "Yaval" },
      { mr: "रावेर", en: "Raver" },
      { mr: "एरंडोल", en: "Erandol" },
      { mr: "पारोळा", en: "Parola" },
      { mr: "धरणगाव", en: "Dharangaon" },
      { mr: "भडगाव", en: "Bhadgaon" },
      { mr: "मुक्ताईनगर", en: "Muktainagar" },
      { mr: "बोदवड", en: "Bodwad" },
      { mr: "चोपडा", en: "Chopda" },
    ],
  },
  {
    district: { mr: "धुळे", en: "Dhule" },
    cities: [
      { mr: "धुळे", en: "Dhule" },
      { mr: "शिंदखेडा", en: "Shindkheda" },
      { mr: "शिरपूर", en: "Shirpur" },
      { mr: "साक्री", en: "Sakri" },
    ],
  },
  {
    district: { mr: "नंदुरबार", en: "Nandurbar" },
    cities: [
      { mr: "नंदुरबार", en: "Nandurbar" },
      { mr: "शहादा", en: "Shahada" },
      { mr: "नवापूर", en: "Navapur" },
      { mr: "तळोदा", en: "Taloda" },
      { mr: "अक्कलकुवा", en: "Akkalkuwa" },
      { mr: "धडगाव (अक्राणी)", en: "Dhadgaon (Akrani)" },
    ],
  },
  {
    district: { mr: "पालघर", en: "Palghar" },
    cities: [
      { mr: "पालघर", en: "Palghar" },
      { mr: "वसई-विरार", en: "Vasai-Virar" },
      { mr: "डहाणू", en: "Dahanu" },
      { mr: "विक्रमगड", en: "Vikramgad" },
      { mr: "जव्हार", en: "Jawhar" },
      { mr: "मोखाडा", en: "Mokhada" },
      { mr: "वाडा", en: "Wada" },
      { mr: "तलासरी", en: "Talasari" },
    ],
  },
  {
    district: { mr: "रायगड", en: "Raigad" },
    cities: [
      { mr: "अलिबाग", en: "Alibag" },
      { mr: "पनवेल", en: "Panvel" },
      { mr: "उरण", en: "Uran" },
      { mr: "कर्जत", en: "Karjat" },
      { mr: "खालापूर", en: "Khalapur" },
      { mr: "माणगाव", en: "Mangaon" },
      { mr: "रोहा", en: "Roha" },
      { mr: "पेण", en: "Pen" },
      { mr: "महाड", en: "Mahad" },
      { mr: "पोलादपूर", en: "Poladpur" },
      { mr: "म्हसळा", en: "Mhasla" },
      { mr: "श्रीवर्धन", en: "Shrivardhan" },
      { mr: "तळा", en: "Tala" },
      { mr: "सुधागड (पाली)", en: "Sudhagad (Pali)" },
    ],
  },
  {
    district: { mr: "रत्नागिरी", en: "Ratnagiri" },
    cities: [
      { mr: "रत्नागिरी", en: "Ratnagiri" },
      { mr: "चीपळूण", en: "Chiplun" },
      { mr: "खेड", en: "Khed" },
      { mr: "दापोली", en: "Dapoli" },
      { mr: "गुहागर", en: "Guhagar" },
      { mr: "संगमेश्वर", en: "Sangameshwar" },
      { mr: "लांजा", en: "Lanja" },
      { mr: "राजापूर", en: "Rajapur" },
      { mr: "मंडणगड", en: "Mandangad" },
    ],
  },
  {
    district: { mr: "सिंधुदुर्ग", en: "Sindhudurg" },
    cities: [
      { mr: "ओरोस (सिंधुदुर्ग)", en: "Oros (Sindhudurg)" },
      { mr: "कुडाळ", en: "Kudal" },
      { mr: "कणकवली", en: "Kankavli" },
      { mr: "सावंतवाडी", en: "Sawantwadi" },
      { mr: "मालवण", en: "Malvan" },
      { mr: "वेंगुर्ला", en: "Vengurla" },
      { mr: "देवगड", en: "Devgad" },
      { mr: "वैभववाडी", en: "Vaibhavwadi" },
      { mr: "दोडामार्ग", en: "Dodamarg" },
    ],
  },
];

export function getDistrictOptions(lang: "mr" | "en" = "mr"): string[] {
  return MAHARASHTRA_DISTRICTS.map((d) => d.district[lang]);
}

export function getCityOptions(districtName: string, lang: "mr" | "en" = "mr"): string[] {
  if (!districtName) return [];
  const distObj = MAHARASHTRA_DISTRICTS.find(
    (d) =>
      d.district.mr.toLowerCase() === districtName.toLowerCase() ||
      d.district.en.toLowerCase() === districtName.toLowerCase()
  );
  if (distObj) {
    return distObj.cities.map((c) => c[lang]);
  }
  return [];
}

export function getDistrictForCity(city: string | null | undefined): DistrictData | undefined {
  if (!city) return undefined;
  const cleanCity = city.trim().toLowerCase();
  if (!cleanCity) return undefined;
  return MAHARASHTRA_DISTRICTS.find((d) =>
    d.cities.some(
      (c) => c.mr.toLowerCase() === cleanCity || c.en.toLowerCase() === cleanCity
    )
  );
}

export function formatDistrictInEnglish(
  mrDistrict: string | null | undefined,
  mrCity?: string | null | undefined
): string {
  const cleanCity = mrCity?.trim();
  const inferredDistObj = cleanCity ? getDistrictForCity(cleanCity) : undefined;

  const cleanDist = mrDistrict?.trim();

  if (cleanDist) {
    const distObj = MAHARASHTRA_DISTRICTS.find(
      (d) =>
        d.district.mr.toLowerCase() === cleanDist.toLowerCase() ||
        d.district.en.toLowerCase() === cleanDist.toLowerCase()
    );

    if (distObj) {
      if (
        (distObj.district.en === "Amravati" || distObj.district.mr === "अमरावती") &&
        inferredDistObj &&
        inferredDistObj.district.en !== "Amravati"
      ) {
        return inferredDistObj.district.en;
      }
      return distObj.district.en;
    }
  }

  if (inferredDistObj) {
    return inferredDistObj.district.en;
  }

  return cleanDist || "-";
}

export function formatCityInEnglish(mrCity: string | null | undefined): string {
  if (!mrCity) return "-";
  const clean = mrCity.trim();
  if (!clean) return "-";
  for (const d of MAHARASHTRA_DISTRICTS) {
    const found = d.cities.find(
      (c) => c.mr.toLowerCase() === clean.toLowerCase() || c.en.toLowerCase() === clean.toLowerCase()
    );
    if (found) return found.en;
  }
  return clean;
}

export function formatAddressInEnglish(address: string | null | undefined): string {
  if (!address) return "-";
  let str = address.trim();
  if (!str) return "-";

  const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  devanagariDigits.forEach((digit, idx) => {
    str = str.replace(new RegExp(digit, "g"), String(idx));
  });

  const marathiTerms: [RegExp, string][] = [
    [/पत्ता\s*:/gi, "Address: "],
    [/शहर\s*\/\s*गाव\s*:/gi, "City/Village: "],
    [/जिल्हा\s*:/gi, "District: "],
    [/\bमु\./g, "At."],
    [/\bपो\./g, "Post."],
    [/\bता\./g, "Tal."],
    [/\bजि\./g, "Dist."],
    [/\bरा\./g, "Res."],
    [/घर\s*क्र\./gi, "House No. "],
    [/प्लॉट\s*क्र\./gi, "Plot No. "],
    [/वॉर्ड\s*क्र\./gi, "Ward No. "],
    [/प्रभाग\s*क्र\./gi, "Prabhag No. "],
    [/गल्ली\b/gi, "Galli"],
    [/नगर\b/gi, "Nagar"],
    [/रोड\b/gi, "Road"],
    [/मार्ग\b/gi, "Marg"],
    [/चौक\b/gi, "Chowk"],
  ];

  marathiTerms.forEach(([regex, replacement]) => {
    str = str.replace(regex, replacement);
  });

  MAHARASHTRA_DISTRICTS.forEach((d) => {
    if (d.district.mr) {
      str = str.replace(new RegExp(d.district.mr, "g"), d.district.en);
    }
    d.cities.forEach((c) => {
      if (c.mr) {
        str = str.replace(new RegExp(c.mr, "g"), c.en);
      }
    });
  });

  return str;
}
