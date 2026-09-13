const CATEGORY_RULES=[
[['electronics','computers'],['laptop','notebook','desktop computer','computer','pc','macbook','monitor','keyboard','mouse','printer']],
[['electronics','mobile'],['smartphone','phone','iphone','galaxy s','tablet','ipad','smartwatch','wearable']],
[['electronics','audio'],['headphone','earbud','earphone','speaker','soundbar','audio','wh-1000']],
[['electronics','camera'],['camera','mirrorless','dslr','lens','fujifilm','canon','nikon','gopro']],
[['electronics','tv'],['television','tv ','display','projector','oled','qled']],
[['electronics','gaming'],['gaming console','game console','playstation','xbox','nintendo','switch','gaming headset']],
[['electronics','smartHome'],['smart home','smart speaker','smart bulb','smart plug','robot vacuum','smart device']],
[['home','appliances'],['air purifier','vacuum cleaner','air fryer','microwave','rice cooker','washing machine','refrigerator','dryer','appliance']],
[['home','kitchen'],['blender','toaster','oven','cookware','frying pan','pot','kitchen']],
[['home','coffee'],['coffee maker','espresso','drip kettle','coffee grinder','coffee brewer','v60','coffee']],
[['home','furniture'],['desk','table','office chair','chair','bookshelf','sofa','bed','mattress','furniture']],
[['home','lighting'],['lamp','lighting','led light','ceiling light']],
[['home','cleaning'],['cleaning','detergent','mop','broom','laundry']],
[['home','storage'],['storage','organizer','drawer','shelf','rack']],
[['food','meal'],['ramen','noodle','meal','rice','soup','ready meal']],
[['food','snack'],['snack','cookie','chocolate','candy','chips']],
[['food','beverage'],['beverage','drink','juice','tea','water']],
[['food','coffeeBeans'],['coffee beans','roasted beans','ground coffee']],
[['beauty','skincare'],['skincare','cleanser','moisturizer','serum','sunscreen']],
[['beauty','makeup'],['makeup','foundation','lipstick','mascara','cosmetic']],
[['beauty','hair'],['shampoo','conditioner','hair dryer','haircare','airwrap']],
[['beauty','body'],['body wash','body lotion','body care']],
[['fashion','tops'],['t-shirt','shirt','hoodie','sweater','top']],
[['fashion','bottoms'],['jeans','pants','trousers','shorts','skirt']],
[['fashion','outer'],['jacket','coat','parka','cardigan','outerwear']],
[['fashion','dress'],['dress','suit','formalwear']],
[['fashion','accessories'],['sunglasses','hat','cap','belt','scarf']],
[['fashion','watch'],['watch','wristwatch']],
[['shoes','running'],['running shoe','running shoes','pegasus']],
[['shoes','sportsShoes'],['sports shoe','training shoe','basketball shoe','football shoe']],
[['shoes','casualShoes'],['sneaker','sneakers','casual shoe']],
[['shoes','boots'],['boot','boots']],
[['shoes','formalShoes'],['dress shoe','loafer','oxford']],
[['bags','backpack'],['backpack','daypack']],
[['bags','shoulder'],['shoulder bag','crossbody','cross-body']],
[['bags','tote'],['tote bag','tote']],
[['bags','luggage'],['luggage','suitcase','carry-on','travel bag']],
[['bags','wallet'],['wallet','card holder','pouch']],
[['travel','luggage'],['luggage','suitcase','carry-on']],
[['travel','travelGear'],['travel gear','travel adapter','neck pillow','passport holder']],
[['sports','running'],['running','jogging']],
[['sports','fitness'],['fitness','gym','dumbbell','workout','exercise']],
[['sports','yoga'],['yoga','pilates']],
[['sports','cycling'],['cycling','bike','bicycle']],
[['outdoor','hiking'],['hiking','trekking','backpacking']],
[['outdoor','camping'],['camping','tent','sleeping bag']],
[['outdoor','climbing'],['climbing']],
[['office','stationery'],['stationery','notebook','paper']],
[['office','writing'],['pencil','pen','mechanical pencil','marker']],
[['office','desk'],['desk organizer','desk mat','mouse pad','desk accessory']],
[['hobby','books'],['book','novel','fiction','history','science book']],
[['hobby','craft'],['craft','art supplies','diy kit','model kit']],
[['hobby','games'],['board game','puzzle','card game']],
[['kids','toys'],['toy','lego','doll','kids game']],
[['pet','food'],['pet food','dog food','cat food']],
[['pet','supplies'],['pet supplies','pet bed','litter']],
[['pet','toys'],['pet toy','dog toy','cat toy']],
[['automotive','carCare'],['car care','car wash','wax','polish']],
[['automotive','interior'],['car accessory','car mat','car cover','car interior']],
[['automotive','electronics'],['dash cam','car charger','car electronics']],
[['diy','deskFurniture'],['desk','workbench','work table','office furniture']],
[['diy','storage'],['storage box','storage rack','shelving','organizer']],
[['diy','tools'],['tool','drill','saw','hammer','wrench','screwdriver']],
[['diy','repair'],['repair','adhesive','sealant','patch','fixing']],
[['diy','hardware'],['hardware','bracket','hook','fastener','screw']],
[['diy','garden'],['garden','gardening','plant pot','planter']],
[['diy','cleaning'],['cleaning','mop','broom','brush']]
];
function classifyCategory(rawCategory='',name=''){
  const text=`${rawCategory} ${name}`.toLowerCase();
  for(const [[root,child],words] of CATEGORY_RULES){if(words.some(w=>text.includes(w)))return [root,child];}
  if(text.includes('computer')||text.includes('laptop'))return ['electronics','computers'];
  if(text.includes('phone')||text.includes('mobile'))return ['electronics','mobile'];
  if(text.includes('fashion')||text.includes('clothing'))return ['fashion','tops'];
  if(text.includes('shoe'))return ['shoes','casualShoes'];
  if(text.includes('bag'))return ['bags','backpack'];
  if(text.includes('sport'))return ['sports','fitness'];
  if(text.includes('book'))return ['hobby','books'];
  if(text.includes('pet'))return ['pet','supplies'];
  if(text.includes('auto')||text.includes('car'))return ['automotive','interior'];
  if(text.includes('diy'))return ['diy','repair'];
  return ['home','cleaning'];
}
function normalizeProduct(raw, source) {
  const categoryPath=raw.categoryPath?.length?raw.categoryPath:classifyCategory(raw.category||'',raw.name||raw.title||'');
  return {
    id: `${source}:${raw.id || raw.sku || raw.gtin || raw.title}`,
    source,
    sourceId: raw.id || raw.sku || raw.gtin || null,
    brand: raw.brand || '',
    name: raw.name || raw.title || 'Unnamed product',
    category: raw.category || 'all',
    categoryPath,
    categoryRoot: categoryPath[0],
    subcategory: categoryPath.at(-1),
    country: raw.country || '',
    price: Number(raw.price || 0),
    currency: raw.currency || 'USD',
    image: raw.image || '',
    rating: Number(raw.rating || 0),
    reviewCount: Number(raw.reviewCount || 0),
    url: raw.url || '',
    seller: raw.seller || source,
    updatedAt: new Date().toISOString()
  };
}

function dedupe(products) {
  const map = new Map();
  for (const product of products) {
    const key = String(product.gtin || product.sourceId || `${product.brand}|${product.name}`)
      .toLowerCase().replace(/[^a-z0-9가-힣]+/g, '');
    if (!map.has(key)) map.set(key, product);
  }
  return [...map.values()];
}

module.exports = { normalizeProduct, dedupe };
