// Product generator script — run with: node generate-products.js
const fs = require('fs');

// ── Unsplash photo IDs by subcategory ──────────────────────────────────────
const IMAGES = {
  // Women
  'women-dresses':    ['photo-1566174053879-31528523f8ae','photo-1515886657613-9f3515b0c78f','photo-1496747611176-843222e1e57c','photo-1595777457583-95e059d581b8','photo-1572804013309-59a88b7e92f1','photo-1539008835657-9e8e9680c956','photo-1518622358385-8ea7d0794bf6','photo-1562137369-1a1a0bc66744'],
  'women-blazers':    ['photo-1594938298603-c8148c4dae35','photo-1591369822096-ffd140ec948f','photo-1548624313-0396c75e4b1a','photo-1591195853828-11db59a44f6b'],
  'women-skirts':     ['photo-1583496661160-fb5886a0aaaa','photo-1551163943-3f6a855d1153','photo-1577900232427-18219b9166a0','photo-1592301933927-35b597393c0a'],
  'women-tops':       ['photo-1564257631407-4deb1f99d992','photo-1485968579580-b6d095142e6e','photo-1562572159-4efc207f5aff','photo-1618354691373-d851c5c3a990'],
  'women-pants':      ['photo-1551854838-212c50b4c184','photo-1594633312681-425c7b97ccd1','photo-1582418702059-97ebafb35d09','photo-1506629082955-511b1aa562c8'],
  'women-coats':      ['photo-1539533018447-63fcce2678e3','photo-1578587018452-892bacefd3f2','photo-1544022613-e87ca75a784a','photo-1520012218364-3dbe62c99bee'],
  'women-knitwear':   ['photo-1576566588028-4147f3842f27','photo-1434389677669-e08b4cda3a20','photo-1581044777550-4cfa60707998','photo-1517724237232-34dd1b6cf67a'],
  'women-activewear': ['photo-1518459031867-a89b944bffe4','photo-1571019614242-c5c5dee9f50c','photo-1540497077202-7c8a3999166f','photo-1517836357463-d25dfeac3438'],
  'women-swimwear':   ['photo-1570976447640-ac859083963e','photo-1519941721225-98ec1b65b09d','photo-1525530516913-c05a16f8a21e','photo-1548602088-9d12a4f9c10f'],
  'women-jumpsuits':  ['photo-1509631179647-0177331693ae','photo-1469334031218-e382a71b716b','photo-1558618666-fcd25c85f82e','photo-1549298916-b41d501d3772'],
  // Men
  'men-suits':        ['photo-1593030761757-71fae45fa0e7','photo-1594938298603-c8148c4dae35','photo-1507679799987-c73779587ccf','photo-1617127365659-c47fa864d8bc'],
  'men-shirts':       ['photo-1602810318383-e386cc2a3ccf','photo-1596755094514-f87e34085b2c','photo-1598033129183-c4f50c736c10','photo-1563630423918-b58f07336ac9'],
  'men-jackets':      ['photo-1551028719-00167b16eac5','photo-1520975954732-35dd22299614','photo-1544923246-77307dd270cb','photo-1591047139829-d91aecb6caea'],
  'men-coats':        ['photo-1591047139829-d91aecb6caea','photo-1617127365659-c47fa864d8bc','photo-1539533018447-63fcce2678e3','photo-1578587018452-892bacefd3f2'],
  'men-pants':        ['photo-1624378439575-d8705ad7ae80','photo-1473966968600-fa801b869a1a','photo-1542272604-787c3835535d','photo-1519764622345-23439dd774f7'],
  'men-shoes':        ['photo-1614252235316-8c857d38b5f4','photo-1605812860427-4024433a70fd','photo-1542291026-7eec264c27ff','photo-1460353581641-37baddab0fa2'],
  'men-knitwear':     ['photo-1576566588028-4147f3842f27','photo-1434389677669-e08b4cda3a20','photo-1581044777550-4cfa60707998','photo-1517724237232-34dd1b6cf67a'],
  'men-activewear':   ['photo-1517836357463-d25dfeac3438','photo-1571019614242-c5c5dee9f50c','photo-1540497077202-7c8a3999166f','photo-1518459031867-a89b944bffe4'],
  'men-polo':         ['photo-1598033129183-c4f50c736c10','photo-1596755094514-f87e34085b2c','photo-1602810318383-e386cc2a3ccf','photo-1563630423918-b58f07336ac9'],
  'men-shorts':       ['photo-1542272604-787c3835535d','photo-1473966968600-fa801b869a1a','photo-1624378439575-d8705ad7ae80','photo-1519764622345-23439dd774f7'],
  // Accessories
  'accessories-bags':      ['photo-1584917865442-de89df76afd3','photo-1548036328-c9fa89d128fa','photo-1566150905458-1bf1fc113f0d','photo-1590874103328-eac38a683ce7'],
  'accessories-jewelry':   ['photo-1599643478518-a784e5dc4c8f','photo-1611591437281-460bfbe1220a','photo-1515562141207-7a88fb7ce338','photo-1573408301185-9146fe634ad0'],
  'accessories-eyewear':   ['photo-1572635196237-14b3f281503f','photo-1511499767150-a48a237f0083','photo-1577803645773-f96470509666','photo-1574258495973-f010dfbb5371'],
  'accessories-watches':   ['photo-1524592094714-0f0654e20314','photo-1522312346375-d1a52e2b99b3','photo-1523170335258-f5ed11844a49','photo-1509048191080-d2984bad6ae5'],
  'accessories-scarves':   ['photo-1520903920243-00d872a2d1c9','photo-1601924928833-3f0a6f0d6a84','photo-1543076499-a6133cb932fd','photo-1576566588028-4147f3842f27'],
  'accessories-belts':     ['photo-1553062407-98eeb64c6a62','photo-1585856331553-b2a2cf498e2c','photo-1611085583191-a3b181a88401','photo-1590874103328-eac38a683ce7'],
  'accessories-hats':      ['photo-1521369909029-2afed882baee','photo-1556306535-0f09a537f0a3','photo-1572307480813-ceb0e59d8325','photo-1575428652377-a2d80e2277fc'],
  'accessories-wallets':   ['photo-1627123424654-30076d32de83','photo-1548036328-c9fa89d128fa','photo-1584917865442-de89df76afd3','photo-1590874103328-eac38a683ce7'],
  // Shoes
  'shoes-heels':      ['photo-1543163521-1bf539c55dd2','photo-1515347619252-60a4bf4fff4f','photo-1596703263926-eb0762ee17e4','photo-1560343776-97e7d202ff0e'],
  'shoes-sneakers':   ['photo-1542291026-7eec264c27ff','photo-1460353581641-37baddab0fa2','photo-1549298916-b41d501d3772','photo-1600185365926-3a2ce3cdb9eb'],
  'shoes-boots':      ['photo-1608256246200-53e635b5b65f','photo-1605812860427-4024433a70fd','photo-1614252235316-8c857d38b5f4','photo-1520639888713-7851133b1ed0'],
  'shoes-sandals':    ['photo-1562273138-f46be4ebdf33','photo-1603487742131-4160ec999306','photo-1543163521-1bf539c55dd2','photo-1515347619252-60a4bf4fff4f'],
  'shoes-loafers':    ['photo-1614252235316-8c857d38b5f4','photo-1605812860427-4024433a70fd','photo-1542291026-7eec264c27ff','photo-1460353581641-37baddab0fa2'],
  'shoes-oxfords':    ['photo-1614252235316-8c857d38b5f4','photo-1605812860427-4024433a70fd','photo-1542291026-7eec264c27ff','photo-1460353581641-37baddab0fa2'],
  // Beauty
  'beauty-fragrance': ['photo-1541643600914-78b084683601','photo-1523293182086-7651a899d37f','photo-1588405748880-12d1d2a59f75','photo-1592945403244-b3fbafd7f539'],
  'beauty-skincare':  ['photo-1556228578-0d85b1a4d571','photo-1570194065650-d99fb4bedf0a','photo-1596462502278-27bfdc403348','photo-1611930022073-b7a4ba5fcccd'],
  'beauty-makeup':    ['photo-1596462502278-27bfdc403348','photo-1522335789203-aabd1fc54bc9','photo-1512496015851-a90fb38ba796','photo-1487412720507-e7ab37603c6f'],
  'beauty-haircare':  ['photo-1527799820374-dcf8d9d4a388','photo-1556228578-0d85b1a4d571','photo-1570194065650-d99fb4bedf0a','photo-1611930022073-b7a4ba5fcccd'],
};

// ── Product name parts ─────────────────────────────────────────────────────
const PRODUCT_DATA = {
  'women-dresses':    { prefix: ['Silk','Chiffon','Lace','Satin','Crepe','Organza','Tulle','Jersey','Velvet','Linen','Sequin','Embroidered','Ruched','Draped','Pleated'], suffix: ['Midi Dress','Maxi Dress','Mini Dress','Wrap Dress','Slip Dress','Cocktail Dress','Evening Gown','Shirt Dress','A-Line Dress','Shift Dress'], brand: 'LUXÉ Couture', desc: ['Elegant silhouette with refined tailoring.','Luxurious fabric drapes beautifully for any occasion.','A showpiece designed for the modern woman.','Timeless design meets contemporary elegance.','Exquisite detailing elevates this classic piece.'] },
  'women-blazers':    { prefix: ['Tailored','Double-Breasted','Cropped','Oversized','Pinstripe','Tweed','Linen','Silk','Wool','Structured'], suffix: ['Blazer','Power Blazer','Tuxedo Jacket','Suit Jacket','Cape Blazer'], brand: 'LUXÉ Originals', desc: ['Impeccably tailored with a modern silhouette.','Crafted from premium fabric with satin-lined interior.','A wardrobe staple redefined with luxury touches.','Sharp shoulders and a cinched waist create a powerful look.'] },
  'women-skirts':     { prefix: ['Satin','Pleated','Leather','Tweed','Denim','Sequin','Wrap','Tiered','Organza','Knit'], suffix: ['Midi Skirt','Mini Skirt','Maxi Skirt','Pencil Skirt','A-Line Skirt','Wrap Skirt'], brand: 'LUXÉ Originals', desc: ['Flowing elegance for day-to-night versatility.','A refined piece with impeccable drape.','Modern sophistication in every stitch.','Effortless style meets premium craftsmanship.'] },
  'women-tops':       { prefix: ['Silk','Cashmere','Lace','Ribbed','Crop','Draped','Embellished','Off-Shoulder','Peplum','Ruffle'], suffix: ['Blouse','Camisole','Tank Top','Bodysuit','Sweater','Turtleneck','Tunic','Bandeau','Vest','Corset Top'], brand: 'LUXÉ Originals', desc: ['Luxurious feel against the skin with a flattering fit.','Designed to be layered or worn alone with confidence.','Effortlessly chic for any occasion.','Premium fabric with meticulous attention to detail.'] },
  'women-pants':      { prefix: ['Wide-Leg','Tailored','High-Waist','Silk','Leather','Crepe','Cropped','Palazzo','Straight-Leg','Pleat-Front'], suffix: ['Trousers','Pants','Culottes','Joggers','Cargo Pants','Cigarette Pants'], brand: 'LUXÉ Originals', desc: ['Impeccable tailoring for a flawless silhouette.','Premium fabric ensures all-day comfort and style.','A modern wardrobe essential with a luxury twist.','Clean lines and perfect proportions define this piece.'] },
  'women-coats':      { prefix: ['Cashmere','Wool','Faux-Fur','Trench','Belted','Oversized','Cape','Bouclé','Quilted','Double-Face'], suffix: ['Coat','Overcoat','Trench Coat','Wrap Coat','Peacoat','Parka','Cape Coat'], brand: 'LUXÉ Outerwear', desc: ['Envelop yourself in warmth and sophistication.','A timeless piece crafted from the finest materials.','Impeccable construction for enduring elegance.','Luxurious warmth without compromising on style.'] },
  'women-knitwear':   { prefix: ['Cashmere','Merino','Mohair','Cable-Knit','Ribbed','Cropped','Oversized','Fair-Isle','Alpaca','Chunky'], suffix: ['Sweater','Cardigan','Pullover','Turtleneck','Knit Vest','Poncho'], brand: 'LUXÉ Knits', desc: ['Ultra-soft yarn provides cloud-like comfort.','Artisanal knitting techniques create a distinctive texture.','Cozy luxury for the cooler months.','Premium fibers ensure lasting softness and warmth.'] },
  'women-activewear': { prefix: ['Performance','Seamless','Sculpt','Flex','Breathable','Compression','Mesh','Tech','Ribbed','High-Impact'], suffix: ['Leggings','Sports Bra','Tank','Hoodie','Joggers','Shorts'], brand: 'LUXÉ Active', desc: ['Premium performance wear designed for movement.','Moisture-wicking fabric keeps you comfortable.','Designed for both the studio and the street.','High-performance luxury for your active lifestyle.'] },
  'women-swimwear':   { prefix: ['Ruched','Cut-Out','Halter','Bandeau','High-Cut','Plunge','Twist','Ring-Detail','Asymmetric','Crochet'], suffix: ['One-Piece','Bikini Set','Swim Top','Swim Bottom','Cover-Up','Sarong'], brand: 'LUXÉ Swim', desc: ['Resort-ready designs with a luxurious finish.','Flattering silhouette with premium swim fabric.','Sun-kissed luxury for poolside elegance.','Designed for the most discerning beachgoer.'] },
  'women-jumpsuits':  { prefix: ['Tailored','Wide-Leg','Silk','Strapless','Belted','Utility','Sequin','Off-Shoulder','Wrap','Backless'], suffix: ['Jumpsuit','Romper','Playsuit','Catsuit','Overall'], brand: 'LUXÉ Couture', desc: ['Effortless one-piece dressing at its finest.','A statement piece for the confident woman.','Chic and versatile from day to night.','Modern elegance in a single, stunning piece.'] },
  'men-suits':        { prefix: ['Slim-Fit','Classic','Double-Breasted','Peak-Lapel','Linen','Wool','Tuxedo','Check','Herringbone','Italian'], suffix: ['Suit','Two-Piece Suit','Three-Piece Suit','Dinner Suit','Business Suit'], brand: 'LUXÉ Suiting', desc: ['Precision-cut with a contemporary silhouette.','Canvassed construction for an impeccable fit.','The cornerstone of a distinguished wardrobe.','Handcrafted excellence in every stitch.'] },
  'men-shirts':       { prefix: ['Oxford','Linen','Poplin','Chambray','Flannel','Silk','Mandarin','French-Cuff','Slim-Fit','Spread-Collar'], suffix: ['Shirt','Dress Shirt','Casual Shirt','Button-Down','Camp Shirt'], brand: 'LUXÉ Menswear', desc: ['Crafted from premium fabric for everyday luxury.','Meticulous tailoring ensures a perfect fit.','A timeless essential for the modern gentleman.','Superior quality meets understated elegance.'] },
  'men-jackets':      { prefix: ['Leather','Suede','Bomber','Harrington','Field','Safari','Quilted','Denim','Shearling','Technical'], suffix: ['Jacket','Biker Jacket','Bomber Jacket','Flight Jacket','Aviator Jacket'], brand: 'LUXÉ Rebel', desc: ['Iconic design crafted from premium materials.','Rugged luxury for the modern man.','A statement piece that never goes out of style.','Superior craftsmanship meets contemporary design.'] },
  'men-coats':        { prefix: ['Cashmere','Wool','Camel','Tweed','Trench','Belted','Oversized','Military','Double-Face','Herringbone'], suffix: ['Overcoat','Topcoat','Trench Coat','Peacoat','Car Coat','Crombie'], brand: 'LUXÉ Outerwear', desc: ['Luxuriously soft with a timeless silhouette.','Features hand-stitched details and premium buttons.','Enduring elegance for the colder months.','A masterpiece of outerwear craftsmanship.'] },
  'men-pants':        { prefix: ['Slim','Tailored','Relaxed','Pleated','Chino','Cargo','Wool','Linen','Corduroy','Flannel'], suffix: ['Trousers','Pants','Chinos','Dress Pants','Jogger Pants'], brand: 'LUXÉ Menswear', desc: ['Clean lines and a perfect drape.','Premium construction for lasting comfort.','A versatile piece for any occasion.','Modern fit with classic sensibility.'] },
  'men-shoes':        { prefix: ['Italian','Hand-Stitched','Burnished','Suede','Patent','Brushed','Monk-Strap','Double-Buckle','Cap-Toe','Brogue'], suffix: ['Loafers','Oxford Shoes','Derby Shoes','Chelsea Boots','Monk Straps','Ankle Boots'], brand: 'LUXÉ Footwear', desc: ['Hand-crafted with traditional techniques.','Premium leather with meticulous finishing.','Made in Italy with the finest materials.','A testament to artisanal shoemaking.'] },
  'men-knitwear':     { prefix: ['Cashmere','Merino','Cable-Knit','Half-Zip','Crew-Neck','V-Neck','Rollneck','Chunky','Waffle-Knit','Fair-Isle'], suffix: ['Sweater','Pullover','Cardigan','Knit Vest','Half-Zip','Turtleneck'], brand: 'LUXÉ Knits', desc: ['Exceptional softness meets refined design.','Premium yarn for year-round comfort.','An essential layer of understated luxury.','Artisanal quality in every fiber.'] },
  'men-activewear':   { prefix: ['Performance','Tech','Stretch','Breathable','Training','Running','Quarter-Zip','Seamless','Hybrid','Impact'], suffix: ['T-Shirt','Shorts','Hoodie','Track Pants','Joggers','Vest'], brand: 'LUXÉ Active', desc: ['Engineered for peak performance.','Premium activewear for the modern athlete.','Sweat-wicking technology keeps you dry.','Luxury performance wear for every workout.'] },
  'men-polo':         { prefix: ['Piqué','Knit','Slim-Fit','Classic','Long-Sleeve','Contrast','Tipped','Mercerized','Jersey','Stretch'], suffix: ['Polo Shirt','Polo','Rugby Shirt','Henley','Zip Polo'], brand: 'LUXÉ Menswear', desc: ['Refined casual wear at its best.','Premium cotton piqué with a perfect collar.','A versatile essential for smart-casual style.','Subtle branding meets superior quality.'] },
  'men-shorts':       { prefix: ['Tailored','Linen','Chino','Swim','Pleated','Drawstring','Cargo','Bermuda','Relaxed','Athletic'], suffix: ['Shorts','Swim Trunks','Board Shorts','Bermudas','Sport Shorts'], brand: 'LUXÉ Resort', desc: ['Perfectly proportioned for a polished look.','Warm-weather essentials with a luxury edge.','Effortless style for resort and beyond.','Premium fabric for all-day comfort.'] },
  'accessories-bags':     { prefix: ['Monogram','Quilted','Structured','Mini','Oversized','Woven','Croc-Effect','Bucket','Saddle','Frame'], suffix: ['Tote Bag','Shoulder Bag','Crossbody Bag','Clutch','Backpack','Hobo Bag','Satchel','Belt Bag'], brand: 'LUXÉ Accessories', desc: ['Signature craftsmanship with gold hardware details.','Butter-soft leather with impeccable finishing.','A statement piece for the discerning collector.','Handcrafted luxury in every detail.'] },
  'accessories-jewelry':  { prefix: ['18K Gold','Sterling Silver','Diamond','Pearl','Chain-Link','Signet','Charm','Layered','Cuff','Pendant'], suffix: ['Necklace','Bracelet','Ring','Earrings','Bangle','Choker','Anklet','Brooch'], brand: 'LUXÉ Fine Jewelry', desc: ['Exquisite craftsmanship with precious materials.','A timeless piece of wearable art.','Designed to be treasured for generations.','Hypoallergenic and tarnish-resistant luxury.'] },
  'accessories-eyewear':  { prefix: ['Aviator','Cat-Eye','Round','Square','Oversized','Geometric','Acetate','Titanium','Vintage','Rimless'], suffix: ['Sunglasses','Optical Frames','Blue-Light Glasses','Sport Glasses'], brand: 'LUXÉ Eyewear', desc: ['UV400 protection with premium lenses.','Handcrafted frames from Italian acetate.','A signature look with every pair.','Lightweight comfort meets bold design.'] },
  'accessories-watches':  { prefix: ['Automatic','Chronograph','Skeleton','Diver','Dress','Moon-Phase','Tourbillon','Minimalist','Sport','Diamond-Set'], suffix: ['Watch','Timepiece','Chronometer','Wristwatch'], brand: 'LUXÉ Horlogerie', desc: ['Swiss-made movement with meticulous finishing.','A masterpiece of horological artistry.','Precision engineering meets timeless design.','Crafted for those who appreciate the extraordinary.'] },
  'accessories-scarves':  { prefix: ['Silk','Cashmere','Wool','Printed','Fringed','Reversible','Lightweight','Jacquard','Plaid','Ombré'], suffix: ['Scarf','Shawl','Stole','Wrap','Bandana','Neckerchief'], brand: 'LUXÉ Accessories', desc: ['Luxurious to the touch with vibrant prints.','A versatile accessory for every season.','Handcrafted with the finest fibers.','Elevate any outfit with a touch of elegance.'] },
  'accessories-belts':    { prefix: ['Leather','Woven','Chain','Reversible','Croc-Embossed','Suede','Canvas','Gold-Buckle','Silver-Buckle','Skinny'], suffix: ['Belt','Waist Belt','Core Belt','Statement Belt','Dress Belt'], brand: 'LUXÉ Accessories', desc: ['Premium leather with polished hardware.','The finishing touch to any ensemble.','Crafted for both form and function.','Italian leather with artisanal buckle design.'] },
  'accessories-hats':     { prefix: ['Wool','Fedora','Panama','Cashmere','Bucket','Baseball','Baker Boy','Beret','Wide-Brim','Straw'], suffix: ['Hat','Fedora','Cap','Beanie','Beret','Sun Hat'], brand: 'LUXÉ Accessories', desc: ['Handcrafted headwear with a luxury finish.','A signature accessory for every season.','Premium materials for lasting style.','The perfect crown to any outfit.'] },
  'accessories-wallets':  { prefix: ['Leather','Croc-Effect','Monogram','Zip-Around','Card','Bi-Fold','Tri-Fold','Slim','Chain','Metal-Accent'], suffix: ['Wallet','Card Holder','Coin Purse','Travel Wallet','Continental Wallet','Money Clip'], brand: 'LUXÉ Accessories', desc: ['Butter-soft leather with organized compartments.','A refined essential for everyday luxury.','Handcrafted with premium Italian leather.','Minimalist design meets maximum functionality.'] },
  'shoes-heels':      { prefix: ['Stiletto','Block','Kitten','Platform','Slingback','Pointed-Toe','Strappy','Crystal','Mule','Ankle-Strap'], suffix: ['Heels','Pumps','Sandal Heels','Mules','Court Shoes','Slingbacks'], brand: 'LUXÉ Footwear', desc: ['Elegance elevated with every step.','Italian craftsmanship for the modern woman.','Walk with confidence in luxury comfort.','A showpiece shoe for special occasions.'] },
  'shoes-sneakers':   { prefix: ['Low-Top','High-Top','Platform','Leather','Suede','Retro','Chunky','Minimal','Knit','Velvet'], suffix: ['Sneakers','Trainers','Sport Shoes','Court Shoes','Runner'], brand: 'LUXÉ Footwear', desc: ['Luxury comfort for everyday style.','Premium materials elevate the everyday sneaker.','Street-ready with a designer edge.','Cushioned comfort meets refined design.'] },
  'shoes-boots':      { prefix: ['Leather','Suede','Chelsea','Ankle','Knee-High','Combat','Lace-Up','Western','Riding','Platform'], suffix: ['Boots','Ankle Boots','Chelsea Boots','Knee Boots','Combat Boots','Hiking Boots'], brand: 'LUXÉ Footwear', desc: ['Statement boots crafted from premium leather.','Built to last with timeless appeal.','The perfect foundation for any outfit.','Artisanal construction with modern detailing.'] },
  'shoes-sandals':    { prefix: ['Strappy','Flat','Slide','Gladiator','Espadrille','Wedge','Thong','Raffia','Crystal','Woven'], suffix: ['Sandals','Slides','Espadrilles','Wedges','Flip-Flops','Gladiators'], brand: 'LUXÉ Footwear', desc: ['Sun-ready luxury for warmer days.','Effortless elegance for resort wear.','Premium comfort meets stylish design.','Crafted for those who seek beauty in simplicity.'] },
  'shoes-loafers':    { prefix: ['Penny','Tassel','Horsebit','Platform','Leather','Suede','Fringed','Chain','Backless','Driving'], suffix: ['Loafers','Moccasins','Driving Shoes','Slip-Ons'], brand: 'LUXÉ Footwear', desc: ['Effortless sophistication in every step.','Hand-crafted with Blake-stitched soles.','A timeless classic reimagined.','Premium leather for lasting comfort and style.'] },
  'shoes-oxfords':    { prefix: ['Cap-Toe','Wing-Tip','Plain-Toe','Patent','Brogue','Two-Tone','Suede','Burnished','Perforated','Wholecut'], suffix: ['Oxfords','Derby Shoes','Brogues','Dress Shoes','Lace-Ups'], brand: 'LUXÉ Footwear', desc: ['The pinnacle of men\'s dress footwear.','Handcrafted with traditional Goodyear welt.','Made in Italy with the finest leathers.','Distinguished style for the modern gentleman.'] },
  'beauty-fragrance': { prefix: ['Oud','Rose','Amber','Sandalwood','Bergamot','Jasmine','Vetiver','Neroli','Musk','Citrus'], suffix: ['Eau de Parfum','Perfume Oil','Cologne','Body Mist','Fragrance Set','Candle'], brand: 'LUXÉ Parfums', desc: ['A captivating blend of rare ingredients.','Long-lasting sillage for an unforgettable impression.','Artisanal fragrance crafted by master perfumers.','An olfactory journey of refined luxury.'] },
  'beauty-skincare':  { prefix: ['Retinol','Hyaluronic','Vitamin C','Peptide','Gold-Infused','Caviar','Rose','Collagen','Niacinamide','Ceramide'], suffix: ['Serum','Moisturizer','Eye Cream','Face Oil','Mask','Cleanser','Toner','Essence'], brand: 'LUXÉ Beauty', desc: ['Advanced formula for visible results.','Clinically proven ingredients in a luxurious base.','Transform your skin with pure indulgence.','Science-backed beauty meets luxury skincare.'] },
  'beauty-makeup':    { prefix: ['Matte','Satin','Luminous','Velvet','Cream','Shimmer','Long-Wear','Hydrating','Full-Coverage','Natural'], suffix: ['Lipstick','Foundation','Blush','Bronzer','Eyeshadow Palette','Mascara','Highlighter','Lip Gloss'], brand: 'LUXÉ Beauty', desc: ['Richly pigmented for a flawless finish.','Luxury formulation for all-day wear.','Professional-grade beauty for every occasion.','Premium ingredients for a radiant glow.'] },
  'beauty-haircare':  { prefix: ['Keratin','Argan','Silk','Bond-Repair','Volumizing','Hydrating','Clarifying','Color-Protect','Scalp','Overnight'], suffix: ['Shampoo','Conditioner','Hair Mask','Hair Oil','Serum','Dry Shampoo','Treatment','Leave-In'], brand: 'LUXÉ Beauty', desc: ['Salon-quality results at home.','Nourishing formula for luxurious locks.','Transform your hair with premium care.','Advanced technology meets natural ingredients.'] },
};

// ── Color palettes ─────────────────────────────────────────────────────────
const COLOR_SETS = [
  [{ name: 'Noir', hex: '#0a0a0a' }, { name: 'Ivory', hex: '#f5f0eb' }],
  [{ name: 'Camel', hex: '#c4a77d' }, { name: 'Charcoal', hex: '#36454F' }],
  [{ name: 'Gold', hex: '#c9a96e' }, { name: 'Rose Gold', hex: '#b76e79' }],
  [{ name: 'Burgundy', hex: '#722F37' }, { name: 'Midnight', hex: '#191970' }],
  [{ name: 'Cognac', hex: '#834333' }, { name: 'Black', hex: '#0a0a0a' }],
  [{ name: 'Tan', hex: '#d2b48c' }, { name: 'Espresso', hex: '#3c1414' }],
  [{ name: 'Champagne', hex: '#f7e7ce' }, { name: 'Silver', hex: '#c0c0c0' }],
  [{ name: 'Navy', hex: '#000080' }, { name: 'White', hex: '#ffffff' }],
  [{ name: 'Sage', hex: '#87ae73' }, { name: 'Cream', hex: '#fffdd0' }],
  [{ name: 'Slate', hex: '#708090' }, { name: 'Pearl', hex: '#f0ead6' }],
  [{ name: 'Blush', hex: '#de5d83' }, { name: 'Nude', hex: '#e3bc9a' }],
  [{ name: 'Olive', hex: '#556b2f' }, { name: 'Sand', hex: '#c2b280' }],
  [{ name: 'Terracotta', hex: '#cc4e3c' }, { name: 'Latte', hex: '#c8a882' }],
  [{ name: 'Cobalt', hex: '#0047ab' }, { name: 'Ice', hex: '#d6ecef' }],
  [{ name: 'Emerald', hex: '#046307' }, { name: 'Forest', hex: '#228b22' }],
  [{ name: 'Plum', hex: '#8e4585' }, { name: 'Lilac', hex: '#c8a2c8' }],
  [{ name: 'Rust', hex: '#b7410e' }, { name: 'Peach', hex: '#ffcba4' }],
  [{ name: 'Teal', hex: '#008080' }, { name: 'Mint', hex: '#98fb98' }],
  [{ name: 'Coral', hex: '#ff7f50' }, { name: 'Dusty Rose', hex: '#dcae96' }],
  [{ name: 'Mahogany', hex: '#420d09' }, { name: 'Bone', hex: '#e3dac9' }],
];

// ── Size sets by category type ─────────────────────────────────────────────
const SIZE_MAP = {
  clothing_women: ['XXS', 'XS', 'S', 'M', 'L', 'XL'],
  clothing_men: ['S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  onesize: ['One Size'],
  beauty: ['30ml', '50ml', '100ml'],
};

function getSizesForSubcat(cat, subcat) {
  if (cat === 'beauty') return SIZE_MAP.beauty;
  if (cat === 'accessories') return SIZE_MAP.onesize;
  if (cat === 'shoes' || subcat === 'shoes') return SIZE_MAP.shoes;
  if (cat === 'women') return SIZE_MAP.clothing_women;
  return SIZE_MAP.clothing_men;
}

// ── Brands ─────────────────────────────────────────────────────────────────
const BRANDS = ['LUXÉ Originals', 'LUXÉ Couture', 'LUXÉ Rebel', 'LUXÉ Suiting', 'LUXÉ Menswear', 'LUXÉ Footwear', 'LUXÉ Accessories', 'LUXÉ Fine Jewelry', 'LUXÉ Eyewear', 'LUXÉ Active', 'LUXÉ Resort', 'LUXÉ Swim', 'LUXÉ Knits', 'LUXÉ Outerwear', 'LUXÉ Parfums', 'LUXÉ Beauty', 'LUXÉ Horlogerie', 'Maison LUXÉ', 'Atelier LUXÉ', 'LUXÉ Studio'];

// seeded random for reproducibility
let seed = 42;
function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function roundPrice(v) { return Math.round(v / 10) * 10 - 1; }

// ── Build products ─────────────────────────────────────────────────────────
const subcatKeys = Object.keys(PRODUCT_DATA);
const products = [];
const usedNames = new Set();

for (let id = 1; id <= 1000; id++) {
  const key = subcatKeys[id % subcatKeys.length];
  const [cat, subcat] = key.split('-');
  const data = PRODUCT_DATA[key];
  const imgs = IMAGES[key];

  // unique name
  let name;
  let attempts = 0;
  do {
    name = pick(data.prefix) + ' ' + pick(data.suffix);
    attempts++;
  } while (usedNames.has(name) && attempts < 50);
  if (usedNames.has(name)) name = name + ' ' + id;
  usedNames.add(name);

  const price = cat === 'beauty'
    ? roundPrice(randInt(39, 350))
    : cat === 'accessories' && subcat === 'watches'
    ? roundPrice(randInt(2000, 15000))
    : cat === 'accessories'
    ? roundPrice(randInt(150, 2500))
    : cat === 'shoes'
    ? roundPrice(randInt(350, 1800))
    : roundPrice(randInt(199, 4500));

  const hasDiscount = rand() > 0.6;
  const originalPrice = hasDiscount ? roundPrice(price * (1 + rand() * 0.35 + 0.1)) : null;

  const img1 = imgs[id % imgs.length];
  const img2 = imgs[(id + 1) % imgs.length];
  const imgUrl = (phId) => `https://images.unsplash.com/${phId}?w=600&h=800&fit=crop`;

  products.push({
    id,
    name,
    brand: data.brand || pick(BRANDS),
    price,
    originalPrice,
    category: cat,
    subcategory: subcat,
    sizes: getSizesForSubcat(cat, subcat),
    colors: COLOR_SETS[id % COLOR_SETS.length],
    rating: +(4 + rand()).toFixed(1),
    reviews: randInt(8, 500),
    image: imgUrl(img1),
    images: [imgUrl(img1), imgUrl(img2)],
    description: pick(data.desc),
    isNew: rand() > 0.8,
    isTrending: rand() > 0.82,
  });
}

// Fix ratings > 5
products.forEach(p => { if (p.rating > 5) p.rating = 5.0; });

// ── Categories ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'women', name: 'Women', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop' },
  { id: 'men', name: 'Men', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop' },
  { id: 'accessories', name: 'Accessories', image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&h=800&fit=crop' },
  { id: 'shoes', name: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop' },
  { id: 'beauty', name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=800&fit=crop' },
];

const COLLECTIONS = [
  { id: 1, name: 'Autumn Noir', description: 'Dark elegance for the season', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=500&fit=crop' },
  { id: 2, name: 'Summer Riviera', description: 'Sun-kissed luxury', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=500&fit=crop' },
  { id: 3, name: 'Urban Luxe', description: 'City sophistication', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=500&fit=crop' },
  { id: 4, name: 'Resort Collection', description: 'Vacation-ready pieces', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop' },
  { id: 5, name: 'Evening Edit', description: 'After-dark glamour', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=500&fit=crop' },
  { id: 6, name: 'Minimalist Modern', description: 'Less is more', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=500&fit=crop' },
];

// ── Subcategories for filter UI ────────────────────────────────────────────
const SUBCATEGORIES = {};
subcatKeys.forEach(key => {
  const [cat, sub] = key.split('-');
  if (!SUBCATEGORIES[cat]) SUBCATEGORIES[cat] = [];
  if (!SUBCATEGORIES[cat].includes(sub)) SUBCATEGORIES[cat].push(sub);
});

// ── Write file ─────────────────────────────────────────────────────────────
const lines = [];
lines.push('// Auto-generated product data for LUXÉ Fashion — 1000 products');
lines.push('const PRODUCTS = ' + JSON.stringify(products, null, 2) + ';');
lines.push('');
lines.push('export const CATEGORIES = ' + JSON.stringify(CATEGORIES, null, 2) + ';');
lines.push('');
lines.push('export const COLLECTIONS = ' + JSON.stringify(COLLECTIONS, null, 2) + ';');
lines.push('');
lines.push('export const SUBCATEGORIES = ' + JSON.stringify(SUBCATEGORIES, null, 2) + ';');
lines.push('');
lines.push('export default PRODUCTS;');
lines.push('');

fs.writeFileSync('./src/data/products.js', lines.join('\n'), 'utf-8');

// Stats
const stats = {};
products.forEach(p => {
  const k = p.category + '/' + p.subcategory;
  stats[k] = (stats[k] || 0) + 1;
});
console.log(`Generated ${products.length} products across ${Object.keys(stats).length} subcategories:`);
Object.entries(stats).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log(`\nFile written to ./src/data/products.js`);
